import crypto from "crypto";

// Token storage: email -> {token, createdAt, used}
// In production, this would be a database (Prisma) or Redis
export interface VerificationToken {
  email: string;
  createdAt: Date;
  used: boolean;
}

export const verificationTokens = new Map<string, VerificationToken>();

// Rate limit store: email -> [timestamps...]
export const rateLimitStore = new Map<string, number[]>();

// Token expiry time: 24 hours
export const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Rate limit: 3 requests per email per hour
export const RATE_LIMIT_REQUESTS = 3;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(email) || [];

  // Filter out timestamps older than the rate limit window
  const recentTimestamps = timestamps.filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );

  if (recentTimestamps.length >= RATE_LIMIT_REQUESTS) {
    return true;
  }

  // Update the store with recent timestamps + current time
  rateLimitStore.set(email, [...recentTimestamps, now]);
  return false;
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function storeVerificationToken(token: string, email: string): void {
  verificationTokens.set(token, {
    email,
    createdAt: new Date(),
    used: false,
  });
}

export function isTokenExpired(token: VerificationToken): boolean {
  const now = new Date();
  const age = now.getTime() - token.createdAt.getTime();
  return age >= TOKEN_EXPIRY_MS;
}
