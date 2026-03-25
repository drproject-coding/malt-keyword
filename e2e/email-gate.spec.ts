import { test, expect } from "@playwright/test";

test.describe("Email Gate Integration", () => {
  test("page loads with search input", async ({ page }) => {
    await page.goto("/");
    expect(
      await page.locator("input[placeholder*='développeur']"),
    ).toBeVisible();
  });

  test("gate is NOT visible after 2 searches", async ({ page }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const searchInput = page.locator("input[placeholder*='développeur']");

    // First search
    await searchInput.fill("react");
    await page.waitForTimeout(400); // Wait for debounce

    // Gate should not be visible
    let gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).not.toBeVisible();

    // Second search
    await searchInput.clear();
    await searchInput.fill("typescript");
    await page.waitForTimeout(400); // Wait for debounce

    // Gate still should not be visible
    gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).not.toBeVisible();
  });

  test("gate appears on 3rd search", async ({ page }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const searchInput = page.locator("input[placeholder*='développeur']");

    // First search
    await searchInput.fill("react");
    await page.waitForTimeout(400);

    // Second search
    await searchInput.clear();
    await searchInput.fill("typescript");
    await page.waitForTimeout(400);

    // Third search
    await searchInput.clear();
    await searchInput.fill("python");
    await page.waitForTimeout(400);

    // Gate should be visible
    const gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).toBeVisible();
    expect(await page.locator("text=Unlock full results")).toBeVisible();
  });

  test("results are visible but blurred when gate is active", async ({
    page,
  }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    const searchInput = page.locator("input[placeholder*='développeur']");

    // Perform 3 searches to trigger gate
    await searchInput.fill("react");
    await page.waitForTimeout(400);
    await searchInput.clear();
    await searchInput.fill("typescript");
    await page.waitForTimeout(400);
    await searchInput.clear();
    await searchInput.fill("python");
    await page.waitForTimeout(400);

    // Check that results wrapper has blur class
    const resultsWrapper = page.locator(".blur-sm");
    expect(resultsWrapper).toBeVisible();
  });

  test("email form is not pre-checked", async ({ page }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.setItem("malt_search_count", "3");
    });

    // Reload to apply localStorage
    await page.reload();

    const checkbox = page.locator('input[type="checkbox"]');
    expect(checkbox).not.toBeChecked();
  });

  test("form submission shows 'Check your inbox' state", async ({ page }) => {
    // Mock the fetch request
    await page.route("/api/email/subscribe", (route) => {
      route.abort();
    });

    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.setItem("malt_search_count", "3");
    });
    await page.reload();

    const emailInput = page.locator('input[placeholder="you@example.com"]');
    const checkbox = page.locator('input[type="checkbox"]');
    const submitButton = page.locator('button:has-text("Unlock Results")');

    await emailInput.fill("test@example.com");
    await checkbox.check();

    // Mock successful response
    await page.route("/api/email/subscribe", (route) => {
      route.continue();
    });

    await submitButton.click();

    // Check for "Check your inbox" message
    await expect(page.locator("text=Check your inbox")).toBeVisible({
      timeout: 5000,
    });
  });

  test("search count persists across page refresh", async ({ page }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.setItem("malt_search_count", "3");
    });

    await page.reload();

    // Gate should still be visible
    const gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).toBeVisible();
    expect(await page.locator("text=Unlock full results")).toBeVisible();
  });

  test("clicking verify link with ?verified=true closes gate", async ({
    page,
  }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.setItem("malt_search_count", "3");
    });
    await page.reload();

    // Gate should be visible
    let gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).toBeVisible();

    // Navigate to page with verified=true
    await page.goto("/?verified=true");

    // Gate should be hidden
    gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).not.toBeVisible();

    // malt_unlocked should be set
    const unlocked = await page.evaluate(() =>
      localStorage.getItem("malt_unlocked"),
    );
    expect(unlocked).toBe("true");
  });

  test("search still works when gate is active", async ({ page }) => {
    await page.goto("/");
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.setItem("malt_search_count", "3");
    });
    await page.reload();

    const searchInput = page.locator("input[placeholder*='développeur']");

    // Gate should be visible
    let gateOverlay = page.locator(".fixed.inset-0");
    expect(gateOverlay).toBeVisible();

    // Type in search (should still work)
    await searchInput.fill("javascript");
    await page.waitForTimeout(400);

    // Results should still be updating (but blurred)
    expect(gateOverlay).toBeVisible();
  });
});
