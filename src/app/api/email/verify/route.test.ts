import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import { verificationTokens } from "../subscribe/route";

describe("/api/email/verify", () => {
  beforeEach(() => {
    // Clear token store before each test
    verificationTokens.clear();
  });

  describe("GET endpoint", () => {
    it("should verify valid token and return redirect URL", async () => {
      // Setup: Create a valid token
      const token = "test-valid-token-abc123";
      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt: new Date(),
        used: false,
      });

      const request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("success");
      expect(data.message).toBe("Email verified successfully");
      expect(data.redirectUrl).toBe("/?verified=true");
    });

    it("should mark token as used after first verification", async () => {
      // Setup: Create a valid token
      const token = "test-token-usage-check";
      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt: new Date(),
        used: false,
      });

      // First verification
      const request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(200);

      // Verify token is marked as used
      const tokenRecord = verificationTokens.get(token);
      expect(tokenRecord?.used).toBe(true);
    });

    it("should reject already-used token (replay protection)", async () => {
      // Setup: Create a token that's already been used
      const token = "test-used-token";
      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt: new Date(),
        used: true, // Already used!
      });

      const request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(410);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toContain("already been used");
    });

    it("should reject expired token", async () => {
      // Setup: Create a token that expired 25 hours ago
      const token = "test-expired-token";
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - 25); // 25 hours ago

      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt,
        used: false,
      });

      const request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(410);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toContain("expired");
    });

    it("should return 404 for non-existent token", async () => {
      const request = new Request(
        "http://localhost:3000/api/email/verify?token=non-existent-token",
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.status).toBe("error");
      // Should not expose whether token exists
      expect(data.message).toContain("Invalid or expired");
    });

    it("should return 400 when token parameter is missing", async () => {
      const request = new Request("http://localhost:3000/api/email/verify", {
        method: "GET",
      });

      const response = await GET(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
      expect(data.message).toContain("No verification token");
    });

    it("should return 400 when token parameter is empty", async () => {
      const request = new Request(
        "http://localhost:3000/api/email/verify?token=",
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("second verification with same token should fail", async () => {
      // Setup: Create a valid token
      const token = "test-replay-protection";
      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt: new Date(),
        used: false,
      });

      // First verification succeeds
      let request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      let response = await GET(request as any);
      expect(response.status).toBe(200);

      // Second verification with same token should fail
      request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      response = await GET(request as any);
      expect(response.status).toBe(410);

      const data = await response.json();
      expect(data.status).toBe("error");
    });

    it("should return 200 for token created 24 hours ago (just before expiry)", async () => {
      // Setup: Create a token that was created 23 hours 59 minutes ago
      const token = "test-almost-expired";
      const createdAt = new Date();
      createdAt.setHours(createdAt.getHours() - 23);
      createdAt.setMinutes(createdAt.getMinutes() - 59);

      verificationTokens.set(token, {
        email: "user@example.com",
        createdAt,
        used: false,
      });

      const request = new Request(
        `http://localhost:3000/api/email/verify?token=${token}`,
        { method: "GET" },
      );

      const response = await GET(request as any);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("success");
    });
  });
});
