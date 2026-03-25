"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
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
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">
            Search temporarily unavailable
          </h3>
          <p className="text-sm text-red-800">Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading && query) {
    return (
      <div className="mt-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full rounded-lg bg-gray-200 animate-pulse"
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
      <div className="mt-4 text-center text-gray-500">
        <p className="font-medium">No keywords found.</p>
        <p className="text-sm">Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {results.map((suggestion, idx) => (
        <KeywordCard
          key={`${suggestion.label}-${idx}`}
          suggestion={suggestion}
        />
      ))}
    </div>
  );
}
