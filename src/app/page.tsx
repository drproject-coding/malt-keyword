"use client";

import React, { useEffect, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/SearchInput";
import { ResultsList } from "@/components/ResultsList";
import EmailGate from "@/components/EmailGate";

export default function Home() {
  const { query, setQuery, results, isLoading, isError, isGated, clearGate } =
    useSearch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for verification token in URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        clearGate();
      }
    }
  }, [clearGate]);

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
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Find High-Value Keywords
          </h1>
          <p className="mt-2 text-gray-600">
            Discover which keywords are worth adding to your Malt profile.
          </p>
        </div>

        {/* Search */}
        <SearchInput
          value={query}
          onChange={setQuery}
          disabled={isLoading && !!query}
        />

        {/* Results wrapper with conditional blur */}
        <div className={isGated ? "blur-sm" : ""}>
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
      </div>
    </main>
  );
}
