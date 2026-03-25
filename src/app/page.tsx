"use client";

import React from "react";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "@/components/SearchInput";
import { ResultsList } from "@/components/ResultsList";

export default function Home() {
  const { query, setQuery, results, isLoading, isError } = useSearch();

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

        {/* Results */}
        <ResultsList
          results={results}
          isLoading={isLoading}
          isError={isError}
          query={query}
        />
      </div>
    </main>
  );
}
