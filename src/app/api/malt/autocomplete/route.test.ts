import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// Mock fetch globally
global.fetch = vi.fn();

describe("GET /api/malt/autocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("validates query parameter (min 2 chars)", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=a"),
    );
    const response = await GET(request);
    expect(response.status).toBe(500); // Validation error should return 500
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it("forwards query to Malt API endpoint", async () => {
    const mockResponse = {
      suggestions: [{ label: "react", volume: 156 }],
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("query=react"),
      expect.any(Object),
    );
    expect(response.status).toBe(200);
  });

  it("parses Malt response with Zod schema", async () => {
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

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);
    const json = await response.json();

    expect(json.suggestions).toBeDefined();
    expect(Array.isArray(json.suggestions)).toBe(true);
  });

  it("returns 5-10 related suggestions alongside primary term", async () => {
    const mockResponse = {
      suggestions: [
        { label: "react", volume: 156 },
        { label: "javascript", volume: 200 },
        { label: "node.js", volume: 180 },
        { label: "express", volume: 120 },
        { label: "webpack", volume: 95 },
      ],
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);
    const json = await response.json();

    expect(json.suggestions.length).toBeGreaterThanOrEqual(1);
  });

  it("includes volume count in response", async () => {
    const mockResponse = {
      suggestions: [
        { label: "react", volume: 156 },
        { label: "javascript", volume: 200 },
      ],
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);
    const json = await response.json();

    expect(json.suggestions[0].volume).toBeDefined();
    expect(typeof json.suggestions[0].volume).toBe("number");
  });

  it("sets Cache-Control header: max-age=0, s-maxage=60, stale-while-revalidate=300", async () => {
    const mockResponse = {
      suggestions: [{ label: "react", volume: 156 }],
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toBe(
      "max-age=0, s-maxage=60, stale-while-revalidate=300",
    );
  });

  it("handles Malt API timeout (>5s) gracefully", async () => {
    const timeoutError = new Error("The operation was aborted.");
    timeoutError.name = "AbortError";
    (global.fetch as any).mockRejectedValueOnce(timeoutError);

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe(
      "Search temporarily unavailable. Please try again.",
    );
  });

  it("returns user-friendly error message on API failure", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const request = new NextRequest(
      new URL("http://localhost:3000/api/malt/autocomplete?q=react"),
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe(
      "Search temporarily unavailable. Please try again.",
    );
  });
});
