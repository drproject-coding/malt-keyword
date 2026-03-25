import { describe, it, expect } from "vitest";
import {
  SubscribeRequest,
  SubscribeResponse,
  VerifyRequest,
  VerifyResponse,
} from "./email";

describe("Email Schemas", () => {
  describe("SubscribeRequest", () => {
    it("should validate with valid email, name, and consent=true", () => {
      const result = SubscribeRequest.safeParse({
        email: "user@example.com",
        name: "John Doe",
        consent: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.name).toBe("John Doe");
        expect(result.data.consent).toBe(true);
      }
    });

    it("should validate with email and consent=true (name optional)", () => {
      const result = SubscribeRequest.safeParse({
        email: "user@example.com",
        consent: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.name).toBeUndefined();
        expect(result.data.consent).toBe(true);
      }
    });

    it("should reject email without @ symbol", () => {
      const result = SubscribeRequest.safeParse({
        email: "invalid-email",
        consent: true,
      });
      expect(result.success).toBe(false);
    });

    it("should reject when consent=false", () => {
      const result = SubscribeRequest.safeParse({
        email: "user@example.com",
        consent: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((i) => i.path.includes("consent")),
        ).toBe(true);
      }
    });

    it("should reject when consent is missing", () => {
      const result = SubscribeRequest.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when email is missing", () => {
      const result = SubscribeRequest.safeParse({
        consent: true,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("SubscribeResponse", () => {
    it("should validate success response", () => {
      const result = SubscribeResponse.safeParse({
        status: "success",
        message: "Confirmation email sent",
        verificationEmailSent: true,
      });
      expect(result.success).toBe(true);
    });

    it("should validate error response", () => {
      const result = SubscribeResponse.safeParse({
        status: "error",
        message: "Failed to send email",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = SubscribeResponse.safeParse({
        status: "pending",
        message: "Something",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("VerifyRequest", () => {
    it("should validate with valid token", () => {
      const result = VerifyRequest.safeParse({
        token: "abc123xyz789",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.token).toBe("abc123xyz789");
      }
    });

    it("should reject with empty token", () => {
      const result = VerifyRequest.safeParse({
        token: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject when token is missing", () => {
      const result = VerifyRequest.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("VerifyResponse", () => {
    it("should validate success response with redirectUrl", () => {
      const result = VerifyResponse.safeParse({
        status: "success",
        message: "Email verified",
        redirectUrl: "/?verified=true",
      });
      expect(result.success).toBe(true);
    });

    it("should validate error response without redirectUrl", () => {
      const result = VerifyResponse.safeParse({
        status: "error",
        message: "Token expired",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid status", () => {
      const result = VerifyResponse.safeParse({
        status: "unknown",
        message: "Something",
      });
      expect(result.success).toBe(false);
    });
  });
});
