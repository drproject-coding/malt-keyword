"use client";

import React from "react";
import { KeywordCard } from "./KeywordCard";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface ResultsListProps {
  results: MaltSuggestion[];
  isLoading: boolean;
  isError: boolean;
  query: string;
}

export function ResultsList({
  results,
  isLoading,
  isError,
  query,
}: ResultsListProps) {
  if (isError) {
    return (
      <div className="mt-4">
        <p className="text-sm text-red-400">
          Search temporarily unavailable — please try again.
        </p>
      </div>
    );
  }

  if (isLoading && query) {
    return (
      <div className="mt-4 space-y-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="mt-4">
        <p className="text-sm text-neutral-500">
          No keywords found. Try "React Senior" or "Product Designer".
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {results.map((suggestion, idx) => (
        <div
          key={`${suggestion.label}-${idx}`}
          className="animate-card-in"
          style={{ animationDelay: `${idx * 60}ms`, animationFillMode: "both" }}
        >
          <KeywordCard suggestion={suggestion} />
        </div>
      ))}
    </div>
  );
}
