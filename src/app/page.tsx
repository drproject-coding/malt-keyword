"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { CTAButton } from "@/components/CTAButton";
import { SearchInput } from "@/components/SearchInput";
import { SuccessState } from "@/components/SuccessState";
import { FAQ } from "@/components/FAQ";
import EmailGate from "@/components/EmailGate";
import { SearchDashboard } from "@/components/SearchDashboard";

export default function Home() {
  const { query, setQuery, results, isLoading, isError, isGated, clearGate } =
    useSearch();
  const { items: leaderboardItems, isLoading: leaderboardIsLoading } =
    useLeaderboard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, consent }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to subscribe");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasQuery = !!query;

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <SuccessState
        show={showSuccess}
        onDismiss={() => {
          setShowSuccess(false);
          window.history.replaceState({}, "", window.location.pathname);
          clearGate();
        }}
      />

      <div className="mx-auto max-w-2xl">
        {/* Hero block: compact brand header during search, full hero pre-search */}
        {hasQuery ? (
          <div className="px-4 sm:px-6 mb-6 pt-8">
            <p className="text-xs font-medium tracking-widest uppercase text-neutral-600">
              Malt Keyword Intel
            </p>
          </div>
        ) : (
          <>
            <Hero />
            <Leaderboard
              items={leaderboardItems}
              isLoading={leaderboardIsLoading}
            />
            <div className="px-4 sm:px-6 lg:px-8 mb-8 flex justify-center">
              <CTAButton searchInputRef={searchInputRef} />
            </div>
          </>
        )}

        {/* Search input — always visible */}
        <div className="px-4 sm:px-6 lg:px-8">
          <SearchInput ref={searchInputRef} value={query} onChange={setQuery} />
        </div>

        {/* Post-search dashboard */}
        {hasQuery && (
          <div className="px-4 sm:px-6 lg:px-8 mt-4">
            <SearchDashboard
              query={query}
              results={results}
              isLoading={isLoading}
              isError={isError}
              isGated={isGated}
            />
          </div>
        )}

        {/* Email gate overlay */}
        <EmailGate
          isGated={isGated}
          onSubmit={handleEmailSubmit}
          onUnlock={clearGate}
          isSubmitting={isSubmitting}
        />

        {/* Secondary CTA + FAQ — hidden during search */}
        {!hasQuery && (
          <>
            <div className="px-4 sm:px-6 lg:px-8 mt-16 mb-8 flex justify-center">
              <CTAButton searchInputRef={searchInputRef} />
            </div>
            <FAQ />
          </>
        )}
      </div>
    </main>
  );
}
