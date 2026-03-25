import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { verificationTokens, rateLimitStore } from "../token-storage";

// Mock Resend
vi.mock("resend", () => {
  return {
    Resend: vi.fn(() => ({
      emails: {
        send: vi.fn(async () => ({
          id: "mock-email-id",
          error: null,
        })),
      },
    })),
  };
});

describe("/api/email/subscribe", () => {
  beforeEach(() => {
    // Clear stores before each test
    verificationTokens.clear();
    rateLimitStore.clear();
    // Mock env vars
    process.env.RESEND_API_KEY = "test-resend-key";
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  describe("POST endpoint", () => {
    it("should accept valid request with email, name, and consent=true", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          name: "John Doe",
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("success");
      expect(data.verificationEmailSent).toBe(true);
      expect(data.message).toContain("Confirmation email sent");
    });

    it("should accept valid request without name (name is optional)", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("success");
    });

    it("should reject request with consent=false", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          consent: false,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should reject request with invalid email format", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should reject request without email field", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should reject request without consent field", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should return 405 for non-POST requests", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "GET",
      });

      const response = await POST(request as any);
      expect(response.status).toBe(405);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toBe("Method not allowed");
    });

    it("should return 400 for invalid JSON", async () => {
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not valid json {",
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should generate and store verification token", async () => {
      const email = "token-test@example.com";
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(200);

      // Token should be stored
      expect(verificationTokens.size).toBe(1);

      // Verify stored data
      const storedToken = Array.from(verificationTokens.values())[0];
      expect(storedToken.email).toBe(email);
      expect(storedToken.used).toBe(false);
      expect(storedToken.createdAt).toBeInstanceOf(Date);
    });

    it("should enforce rate limiting: 4th request from same email in 1 hour returns 429", async () => {
      const email = "ratelimit@example.com";

      // Make 3 successful requests
      for (let i = 0; i < 3; i++) {
        const request = new Request(
          "http://localhost:3000/api/email/subscribe",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              consent: true,
            }),
          },
        );

        const response = await POST(request as any);
        expect(response.status).toBe(200);
      }

      // 4th request should be rate limited
      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(429);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toContain("Too many requests");
    });

    it("should handle missing RESEND_API_KEY gracefully", async () => {
      delete process.env.RESEND_API_KEY;

      const request = new Request("http://localhost:3000/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "user@example.com",
          consent: true,
        }),
      });

      const response = await POST(request as any);
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toBe("Failed to send confirmation email");
    });
  });
});
