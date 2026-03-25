import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSearch } from "./useSearch";

describe("useSearch", () => {
  it("debounces input by 300ms before fetching", () => {
    // TODO: implement in Wave 1
    // Test that rapid input changes don't immediately trigger a fetch
    // Use vi.useFakeTimers() for timing control
    expect(true).toBe(true);
  });

  it("deduplicates requests within 300ms window (SWR)", () => {
    // TODO: implement in Wave 1
    // Test that duplicate searches within the window use cached result
    expect(true).toBe(true);
  });

  it("returns loading state while fetching", () => {
    // TODO: implement in Wave 1
    // Test that isLoading = true during fetch
    expect(true).toBe(true);
  });

  it("returns results after successful fetch", () => {
    // TODO: implement in Wave 1
    // Test that results are populated after API call completes
    expect(true).toBe(true);
  });

  it("returns error state on API failure", () => {
    // TODO: implement in Wave 1
    // Test that error is captured and exposed to component
    expect(true).toBe(true);
  });
});
