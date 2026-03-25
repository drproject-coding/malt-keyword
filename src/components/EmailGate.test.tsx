import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailGate from "./EmailGate";

describe("EmailGate Component", () => {
  it("does not render when isGated is false", () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(
      <EmailGate isGated={false} onSubmit={mockOnSubmit} />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders form when isGated is true", () => {
    const mockOnSubmit = vi.fn();
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    expect(screen.getByText("Unlock full results")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("has unchecked consent checkbox by default", () => {
    const mockOnSubmit = vi.fn();
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const checkbox = screen.getByLabelText(
      "Consent to receive updates",
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it("disables submit button when email is empty", () => {
    const mockOnSubmit = vi.fn();
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByText(
      "Unlock Results",
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("disables submit button when consent is not checked", () => {
    const mockOnSubmit = vi.fn();
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByText(
      "Unlock Results",
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("enables submit button when email and consent are both provided", () => {
    const mockOnSubmit = vi.fn();
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(checkbox);

    const submitButton = screen.getByText(
      "Unlock Results",
    ) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(false);
  });

  it("calls onSubmit with form data when submitted", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const nameInput = screen.getByPlaceholderText("Your name (optional)");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(nameInput, { target: { value: "John" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        "user@example.com",
        "John",
        true,
      );
    });
  });

  it("shows 'Check your inbox' state after submission", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Check your inbox")).toBeInTheDocument();
      expect(
        screen.getByText(/We've sent a verification link/),
      ).toBeInTheDocument();
    });
  });

  it("shows email address in 'Check your inbox' state", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/user@example.com/)).toBeInTheDocument();
    });
  });

  it("hides form fields in 'Check your inbox' state", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Form fields should not be present
      expect(
        screen.queryByPlaceholderText("you@example.com"),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Your name (optional)"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows error message when submission fails", async () => {
    const mockError = new Error("Subscription failed");
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);
    render(<EmailGate isGated={true} onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Subscription failed")).toBeInTheDocument();
    });
  });

  it("calls onResendClick when resend button is clicked", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnResendClick = vi.fn().mockResolvedValue(undefined);
    render(
      <EmailGate
        isGated={true}
        onSubmit={mockOnSubmit}
        onResendClick={mockOnResendClick}
      />,
    );

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const checkbox = screen.getByLabelText("Consent to receive updates");
    const submitButton = screen.getByText("Unlock Results");

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.click(checkbox);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Didn't receive email\? Resend/),
      ).toBeInTheDocument();
    });

    const resendButton = screen.getByText(/Didn't receive email\? Resend/);
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockOnResendClick).toHaveBeenCalled();
    });
  });

  it("shows loading state during submission", async () => {
    const mockOnSubmit = vi.fn(() => new Promise(() => {})); // Never resolves
    render(
      <EmailGate isGated={true} onSubmit={mockOnSubmit} isSubmitting={true} />,
    );

    const submitButton = screen.getByText("Unlocking..") as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it("renders with fixed positioning for overlay", () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(
      <EmailGate isGated={true} onSubmit={mockOnSubmit} />,
    );

    const overlay = container.querySelector(".fixed");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("inset-0");
    expect(overlay).toHaveClass("bg-black/40");
  });
});
