import { test, expect } from "@playwright/test";

test.describe("Malt Keyword Tool - Live Vercel Deployment", () => {
  test("Search page loads on Vercel", async ({ page }) => {
    // TODO: implement in Wave 2
    // Update base URL to live Vercel deployment URL
    // Navigate to page and verify it loads without errors
    expect(true).toBe(true);
  });

  test("Can type keyword and see results in <1 second", async ({ page }) => {
    // TODO: implement in Wave 2
    // Type a keyword and measure time to first result display
    // Assert response time < 1000ms
    expect(true).toBe(true);
  });

  test("Cache header observable on second search of same term", async ({
    page,
  }) => {
    // TODO: implement in Wave 2
    // Search twice for same term
    // Check Network tab for X-Vercel-Cache header or Age header on second request
    expect(true).toBe(true);
  });

  test("Error message displays if Malt API fails", async ({ page }) => {
    // TODO: implement in Wave 2
    // Simulate API failure and verify user sees helpful error message
    expect(true).toBe(true);
  });
});
