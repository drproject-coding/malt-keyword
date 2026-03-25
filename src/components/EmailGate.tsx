"use client";

import React, { useState } from "react";

export interface EmailGateProps {
  isGated: boolean; // true when gate should be visible
  onSubmit: (email: string, name: string, consent: boolean) => Promise<void>; // called when form submitted
  onUnlock?: () => void; // called when already-subscribed check succeeds
  isSubmitting?: boolean; // show loading state during submit
  onResendClick?: () => Promise<void>; // optional: resend email if in "check inbox" state
}

export default function EmailGate({
  isGated,
  onSubmit,
  onUnlock,
  isSubmitting = false,
  onResendClick,
}: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showLoginMode, setShowLoginMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  if (!isGated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please provide an email address");
      return;
    }

    if (!consent) {
      setError("You must consent to receive updates");
      return;
    }

    try {
      await onSubmit(email, name, consent);
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to subscribe. Try again.",
      );
    }
  };

  const handleResend = async () => {
    if (!onResendClick) return;
    setError(null);
    setIsResending(true);
    try {
      await onResendClick();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend email. Try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCheckingEmail(true);
    try {
      const res = await fetch("/api/email/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail }),
      });
      const data = await res.json();
      if (data.verified) {
        onUnlock?.();
      } else {
        setError("No verified account found for that email.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="w-full max-w-md mx-4 rounded-lg bg-white p-8 shadow-lg">
        {showLoginMode ? (
          // Login mode: already subscribed
          <form onSubmit={handleLoginCheck} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your verified email to unlock results.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

            <button
              type="submit"
              disabled={!loginEmail || isCheckingEmail}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingEmail ? "Checking..." : "Unlock"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLoginMode(false);
                setError(null);
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Back
            </button>
          </form>
        ) : isSubmitted ? (
          // State B: Check inbox
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to{" "}
              <strong className="text-gray-900">{email}</strong>. Click it to
              unlock full access.
            </p>

            {onResendClick && (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Resending..." : "Didn't receive email? Resend"}
              </button>
            )}
          </div>
        ) : (
          // State A: Email form
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock full results
              </h2>
              <p className="text-gray-600 text-sm">
                Unlock results (you've used 2 searches)
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Email input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Email address"
              />
            </div>

            {/* Name input */}
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                aria-label="Name (optional)"
              />
            </div>

            {/* Consent checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                aria-label="Consent to receive updates"
              />
              <label
                htmlFor="consent"
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to receive occasional updates about this tool. Your
                email will never be sold.
              </label>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500">
              We'll send a confirmation link to your inbox
            </p>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!email || !consent || isSubmitting}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Unlocking..." : "Unlock Results"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLoginMode(true);
                setError(null);
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Already subscribed?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
