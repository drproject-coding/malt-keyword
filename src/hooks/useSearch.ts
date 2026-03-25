"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { MaltAutocompleteResponse } from "@/lib/schemas/malt";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

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

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.suggestions || [],
    isLoading,
    isError: !!error,
    error: error ? error.message : null,
    mutate, // For manual revalidation if needed
  };
}
