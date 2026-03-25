import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useLeaderboard } from "./useLeaderboard";

// Mock global fetch
global.fetch = vi.fn();

describe("useLeaderboard hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("fires 4 parallel API calls on mount (Promise.all)", async () => {
    // Mock successful responses for 4 requests
    const mockResponse = {
      suggestions: [{ label: "Test Keyword", occurrences: 100 }],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    renderHook(() => useLeaderboard());

    await waitFor(() => {
      // Should have called fetch 4 times (once per niche)
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });

    // Verify all calls are to the autocomplete endpoint
    const calls = (global.fetch as any).mock.calls;
    calls.forEach((call: any[]) => {
      expect(call[0]).toContain("/api/malt/autocomplete?q=");
    });
  });

  test("returns items with rank numbers 1-4", async () => {
    const mockResponse = {
      suggestions: [{ label: "Test Keyword", occurrences: 100 }],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useLeaderboard());

    // Initially should be loading with no items
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have 4 items with rank 1-4
    expect(result.current.items).toHaveLength(4);
    expect(result.current.items[0].rank).toBe(1);
    expect(result.current.items[1].rank).toBe(2);
    expect(result.current.items[2].rank).toBe(3);
    expect(result.current.items[3].rank).toBe(4);
  });

  test("sets isLoading=false after fetch completes", async () => {
    const mockResponse = {
      suggestions: [{ label: "Test Keyword", occurrences: 100 }],
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  test("handles API error and sets error state", async () => {
    const errorMessage = "Network error";
    (global.fetch as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.items).toEqual([]);
  });
});
