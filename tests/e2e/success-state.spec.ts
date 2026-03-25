import { test } from "@playwright/test";

test.describe("Post-verification success state", () => {
  test.skip("navigating to /?verified=true shows success message");
  test.skip("success message contains 'You're in — start searching'");
  test.skip("success message auto-dismisses after approximately 2.5 seconds");
  test.skip("URL is cleaned (verified param removed) after dismiss");
  test.skip("email gate is cleared after success state dismisses");
});
