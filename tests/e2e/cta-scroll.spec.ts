import { test } from "@playwright/test";

test.describe("CTA scroll behavior", () => {
  test.skip("clicking primary CTA (below hero) scrolls to search input");
  test.skip(
    "clicking secondary CTA (below leaderboard) scrolls to search input",
  );
  test.skip("clicking tertiary CTA (above FAQ) scrolls to search input");
  test.skip("search input receives focus after scroll");
});
