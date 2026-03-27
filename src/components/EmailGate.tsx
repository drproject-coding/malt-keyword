"use client";

import React, { useState, useEffect, useRef } from "react";

export interface EmailGateProps {
  isGated: boolean;
  onSubmit: (email: string, name: string, consent: boolean) => Promise<void>;
  onUnlock?: () => void;
  isSubmitting?: boolean;
  onResendClick?: () => Promise<void>;
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
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap: focus first focusable element and cycle Tab within dialog
  useEffect(() => {
    if (!isGated) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const firstFocusable = dialog.querySelector<HTMLElement>("input, button");
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>("input, button"),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isGated, showLoginMode, isSubmitted]);

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

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-sm";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md rounded-2xl bg-[#111] border border-white/10 p-8"
      >
        {showLoginMode ? (
          <form onSubmit={handleLoginCheck} className="space-y-4">
            <div>
              <h2
                id="dialog-title"
                className="text-4xl font-black text-white leading-none tracking-tight"
              >
                Welcome back.
              </h2>
              <p className="text-neutral-400 text-sm mt-3">
                Enter your verified email to unlock results.
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              required
              aria-label="Email address"
              className={inputClass}
            />

            <button
              type="submit"
              disabled={!loginEmail || isCheckingEmail}
              className="w-full px-4 py-3 font-semibold text-sm text-black bg-white rounded-full hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isCheckingEmail ? "Checking..." : "Unlock"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLoginMode(false);
                setError(null);
              }}
              className="w-full text-sm text-neutral-500 hover:text-white transition-colors"
            >
              Back
            </button>
          </form>
        ) : isSubmitted ? (
          <div>
            <h2
              id="dialog-title"
              className="text-4xl font-black text-white leading-none tracking-tight"
            >
              Check your inbox.
            </h2>
            <p className="text-neutral-400 text-sm mt-3">
              We sent a link to <span className="text-white">{email}</span>.
              Click it to unlock full access.
            </p>

            {onResendClick && (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="mt-6 text-sm text-neutral-500 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? "Resending..." : "Didn't get it? Resend"}
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2
                id="dialog-title"
                className="text-4xl font-black text-white leading-none tracking-tight"
              >
                Unlock results.
              </h2>
              <p className="text-neutral-400 text-sm mt-3">
                Free. One click to verify.
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className={inputClass}
              aria-label="Email address"
            />

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className={inputClass}
              aria-label="Name (optional)"
            />

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-white/20 cursor-pointer"
              />
              <label
                htmlFor="consent"
                className="text-xs text-neutral-500 cursor-pointer leading-relaxed"
              >
                I agree to receive occasional updates. Your email will never be
                sold.
              </label>
            </div>

            <button
              type="submit"
              disabled={!email || !consent || isSubmitting}
              className="w-full px-4 py-3 font-semibold text-sm text-black bg-white rounded-full hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Sending..." : "Get Access"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLoginMode(true);
                setError(null);
              }}
              className="w-full text-sm text-neutral-500 hover:text-white transition-colors"
            >
              Already subscribed?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
