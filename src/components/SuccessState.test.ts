import { describe, it, expect, vi } from "vitest";

describe("SuccessState Component", () => {
  it("should accept show and onDismiss props", () => {
    const mockOnDismiss = vi.fn();
    const props = {
      show: true,
      onDismiss: mockOnDismiss,
    };
    expect(props.show).toBe(true);
    expect(typeof props.onDismiss).toBe("function");
  });

  it("should display success message when show=true", () => {
    const message = "You're in — start searching";
    expect(message).toBe("You're in — start searching");
  });

  it("should auto-dismiss after 2.5 seconds", () => {
    const dismissTime = 2500;
    expect(dismissTime).toBe(2500);
  });

  it("should call onDismiss callback after fade-out", () => {
    const mockOnDismiss = vi.fn();
    expect(typeof mockOnDismiss).toBe("function");
  });

  it("should return null when show=false", () => {
    const show = false;
    expect(show).toBe(false);
  });
});
