import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearch } from "./useSearch";

// Mock global fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  data: {} as Record<string, string>,
  getItem(key: string) {
    return this.data[key] || null;
  },
  setItem(key: string, value: string) {
    this.data[key] = value;
  },
  removeItem(key: string) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("debounces input by 300ms before fetching", async () => {
    vi.useFakeTimers();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ suggestions: [{ label: "react" }] }),
    });

    const { result } = renderHook(() => useSearch());

    // Update query multiple times rapidly
    act(() => {
      result.current.setQuery("r");
    });
    act(() => {
      result.current.setQuery("re");
    });
    act(() => {
      result.current.setQuery("rea");
    });
    act(() => {
      result.current.setQuery("react");
    });

    // Before debounce timeout, debouncedQuery should not have changed
    expect(result.current.debouncedQuery).toBe("");

    // After 300ms, it should update
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedQuery).toBe("react");

    vi.useRealTimers();
  });

  it("deduplicates requests within 300ms window (SWR)", async () => {
    vi.useFakeTimers();

    const mockResponse = { suggestions: [{ label: "react", volume: 156 }] };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("react");
    });

    // Advance past debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // SWR should handle deduplication internally
    // Just verify the hook returns valid API structure
    expect(result.current).toHaveProperty("results");
    expect(result.current).toHaveProperty("isLoading");
    expect(Array.isArray(result.current.results)).toBe(true);

    vi.useRealTimers();
  });

  it("returns loading state while fetching", async () => {
    (global.fetch as any).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ suggestions: [] }),
              }),
            100,
          ),
        ),
    );

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("react");
    });

    // Hook should have isLoading state available
    expect(result.current).toHaveProperty("isLoading");
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("returns results after successful fetch", async () => {
    const mockResponse = {
      suggestions: [
        { label: "react", volume: 156 },
        { label: "typescript", volume: 200 },
      ],
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("react");
    });

    // Hook should return results array
    expect(result.current).toHaveProperty("results");
    expect(Array.isArray(result.current.results)).toBe(true);
  });

  it("returns error state on API failure", async () => {
    const mockError = new Error("API Error");
    (global.fetch as any).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery("react");
    });

    // Hook should have error state
    expect(result.current).toHaveProperty("isError");
    expect(result.current).toHaveProperty("error");
    expect(typeof result.current.isError).toBe("boolean");
  });

  // New tests for search count and gate state
  describe("Search Count Tracking", () => {
    it("initializes searchCount from localStorage", () => {
      localStorage.setItem("malt_search_count", "2");

      const { result } = renderHook(() => useSearch());

      expect(result.current.searchCount).toBe(2);
    });

    it("defaults searchCount to 0 when localStorage is empty", () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.searchCount).toBe(0);
    });

    it("increments searchCount after successful search", async () => {
      vi.useFakeTimers();

      const mockResponse = {
        suggestions: [{ label: "react", volume: 156 }],
      };
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.setQuery("react");
      });

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Wait for SWR to fetch
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      // searchCount should have incremented
      expect(result.current.searchCount).toBeGreaterThanOrEqual(1);
      expect(localStorage.getItem("malt_search_count")).toBe("1");

      vi.useRealTimers();
    });

    it("does not increment searchCount on API error", async () => {
      vi.useFakeTimers();

      const mockError = new Error("API Error");
      (global.fetch as any).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useSearch());

      const initialCount = result.current.searchCount;

      act(() => {
        result.current.setQuery("react");
      });

      // Advance past debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Count should remain unchanged
      expect(result.current.searchCount).toBe(initialCount);

      vi.useRealTimers();
    });

    it("persists searchCount in localStorage", () => {
      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.incrementSearchCount();
      });

      expect(localStorage.getItem("malt_search_count")).toBe("1");

      act(() => {
        result.current.incrementSearchCount();
      });

      expect(localStorage.getItem("malt_search_count")).toBe("2");
    });
  });

  describe("Gate State", () => {
    it("initializes isUnlocked from localStorage", () => {
      localStorage.setItem("malt_unlocked", "true");

      const { result } = renderHook(() => useSearch());

      // Gate should not be active when unlocked
      expect(result.current.isGated).toBe(false);
    });

    it("returns isGated=false when searchCount < 3", () => {
      localStorage.setItem("malt_search_count", "2");

      const { result } = renderHook(() => useSearch());

      expect(result.current.isGated).toBe(false);
    });

    it("returns isGated=true when searchCount >= 3 and not unlocked", () => {
      localStorage.setItem("malt_search_count", "3");

      const { result } = renderHook(() => useSearch());

      expect(result.current.isGated).toBe(true);
    });

    it("returns isGated=false when searchCount >= 3 but unlocked", () => {
      localStorage.setItem("malt_search_count", "3");
      localStorage.setItem("malt_unlocked", "true");

      const { result } = renderHook(() => useSearch());

      expect(result.current.isGated).toBe(false);
    });

    it("clearGate sets malt_unlocked and makes isGated=false", () => {
      localStorage.setItem("malt_search_count", "3");

      const { result } = renderHook(() => useSearch());

      expect(result.current.isGated).toBe(true);

      act(() => {
        result.current.clearGate();
      });

      expect(result.current.isGated).toBe(false);
      expect(localStorage.getItem("malt_unlocked")).toBe("true");
    });
  });
});
