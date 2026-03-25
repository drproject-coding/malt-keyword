import { describe, test } from "vitest";

describe("useLeaderboard hook", () => {
  test.skip("fires 4 parallel API calls on mount (Promise.all)");
  test.skip("returns items with rank numbers 1-4");
  test.skip("sets isLoading=false after fetch completes");
  test.skip("handles API error and sets error state");
});
