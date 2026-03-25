import { test } from "@playwright/test";

test.describe("Leaderboard animation", () => {
  test.skip("all 4 leaderboard cards are visible on page load");
  test.skip("cards fade in with visible stagger (not all at once)");
  test.skip("leaderboard renders on mobile (375px) without horizontal scroll");
});
