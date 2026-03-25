"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { CTAButton } from "@/components/CTAButton";
import { SearchInput } from "@/components/SearchInput";
import { ResultsList } from "@/components/ResultsList";
import { SuccessState } from "@/components/SuccessState";
import { FAQ } from "@/components/FAQ";
import EmailGate from "@/components/EmailGate";

export default function Home() {
  const { query, setQuery, results, isLoading, isError, isGated, clearGate } =
    useSearch();
  const { items: leaderboardItems, isLoading: leaderboardIsLoading } =
    useLeaderboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check for verification token in URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        setShowSuccess(true);
      }
    }
  }, []);

  const handleEmailSubmit = async (
    email: string,
    name: string,
    consent: boolean,
  ) => {
    setIsSubmitting(true);
    try {
      // Call the email subscribe API endpoint
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          consent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to subscribe");
      }

      // Success - the verification email will be sent
      // The "Check your inbox" state is managed by the EmailGate component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Success State - appears on verification */}
      <SuccessState
        show={showSuccess}
        onDismiss={() => {
          setShowSuccess(false);
          // Clean up URL: remove ?verified=true
          window.history.replaceState({}, "", window.location.pathname);
          // Clear email gate
          clearGate();
        }}
      />
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <Hero />

        {/* Leaderboard - Social Proof */}
        <Leaderboard
          items={leaderboardItems}
          isLoading={leaderboardIsLoading}
        />

        {/* CTA Button */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8 flex justify-center">
          <CTAButton searchInputRef={searchInputRef} />
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 lg:px-8">
          <SearchInput
            ref={searchInputRef}
            value={query}
            onChange={setQuery}
            disabled={isLoading && !!query}
          />
        </div>

        {/* Results wrapper with conditional blur */}
        <div className={`px-4 sm:px-6 lg:px-8 ${isGated ? "blur-sm" : ""}`}>
          {/* Results */}
          <ResultsList
            results={results}
            isLoading={isLoading}
            isError={isError}
            query={query}
          />
        </div>

        {/* Email Gate overlay */}
        <EmailGate
          isGated={isGated}
          onSubmit={handleEmailSubmit}
          isSubmitting={isSubmitting}
        />

        {/* D-12: Tertiary CTA above FAQ — same component, same searchInputRef */}
        <div className="px-4 sm:px-6 lg:px-8 mb-8 flex justify-center">
          <CTAButton searchInputRef={searchInputRef} />
        </div>

        {/* FAQ Section */}
        <FAQ />
      </div>
    </main>
  );
}
