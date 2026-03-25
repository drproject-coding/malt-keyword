"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MaltAutocompleteResponse } from "@/lib/schemas/malt";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Search failed");
    return r.json();
  });

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  debouncedQuery: string;
  results: any[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  mutate: () => void;
  // New fields for email gate
  searchCount: number;
  isGated: boolean;
  incrementSearchCount: () => void;
  clearGate: () => void;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchCount, setSearchCount] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Initialize search count and unlock state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCount = localStorage.getItem("malt_search_count");
      if (savedCount !== null) {
        setSearchCount(parseInt(savedCount, 10));
      }

      const savedUnlocked = localStorage.getItem("malt_unlocked");
      if (savedUnlocked === "true") {
        setIsUnlocked(true);
      }
    }
  }, []);

  // Debounce: 300ms after user stops typing (SRCH-01)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch with SWR: automatic deduplication + caching
  const { data, error, isLoading, mutate } = useSWR<MaltAutocompleteResponse>(
    debouncedQuery
      ? `/api/malt/autocomplete?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't refetch on window focus (cache-friendly)
      dedupingInterval: 300, // Match debounce window (SWR won't dedupe outside this)
      shouldRetryOnError: true,
      errorRetryCount: 1, // Don't retry excessively
    },
  );

  // Increment search count after successful API response
  useEffect(() => {
    if (data && debouncedQuery && !error && !isLoading) {
      setSearchCount((prev) => {
        const newCount = prev + 1;
        if (typeof window !== "undefined") {
          localStorage.setItem("malt_search_count", newCount.toString());
        }
        return newCount;
      });
    }
  }, [data, debouncedQuery, error, isLoading]);

  const incrementSearchCount = () => {
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    if (typeof window !== "undefined") {
      localStorage.setItem("malt_search_count", newCount.toString());
    }
  };

  const clearGate = () => {
    setIsUnlocked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("malt_unlocked", "true");
    }
  };

  // Gate is active when searchCount >= 3 AND not unlocked
  const isGated = searchCount >= 3 && !isUnlocked;

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.suggestions || [],
    isLoading,
    isError: !!error,
    error: error ? error.message : null,
    mutate, // For manual revalidation if needed
    searchCount,
    isGated,
    incrementSearchCount,
    clearGate,
  };
}
