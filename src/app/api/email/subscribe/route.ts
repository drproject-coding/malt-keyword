import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SubscribeRequest, SubscribeResponse } from "@/lib/schemas/email";
import crypto from "crypto";

// Token storage: email -> {token, createdAt, used}
// In production, this would be a database (Prisma) or Redis
interface VerificationToken {
  email: string;
  createdAt: Date;
  used: boolean;
}

const verificationTokens = new Map<string, VerificationToken>();

// Rate limit store: email -> [timestamps...]
const rateLimitStore = new Map<string, number[]>();

// Token expiry time: 24 hours
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Rate limit: 3 requests per email per hour
const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(email: string): boolean {
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

function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function storeVerificationToken(token: string, email: string): void {
  verificationTokens.set(token, {
    email,
    createdAt: new Date(),
    used: false,
  });
}

function isTokenValid(token: string): boolean {
  const record = verificationTokens.get(token);
  if (!record) return false;

  const now = new Date();
  const age = now.getTime() - record.createdAt.getTime();

  // Check expiry and usage
  return age < TOKEN_EXPIRY_MS && !record.used;
}

export async function POST(request: NextRequest) {
  try {
    // Only allow POST
    if (request.method !== "POST") {
      return NextResponse.json(
        { status: "error", message: "Method not allowed" },
        { status: 405 },
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      return NextResponse.json(
        { status: "error", message: "Invalid request body" },
        { status: 400 },
      );
    }

    // Validate input
    const validationResult = SubscribeRequest.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error");
      return NextResponse.json(
        { status: "error", message: "Invalid email or missing consent" },
        { status: 400 },
      );
    }

    const { email, name, consent } = validationResult.data;

    // Check rate limit
    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }

    // Generate verification token
    const token = generateVerificationToken();
    storeVerificationToken(token, email);

    // Send verification email via Resend
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (!resendApiKey) {
        console.error("RESEND_API_KEY not configured");
        return NextResponse.json(
          { status: "error", message: "Failed to send confirmation email" },
          { status: 500 },
        );
      }

      const resend = new Resend(resendApiKey);
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const verifyUrl = `${baseUrl}/api/email/verify?token=${token}`;

      // Build personalized greeting
      const greeting = name ? `Hi ${name}` : "Hello";

      const emailResult = await resend.emails.send({
        from: "noreply@maltresearch.app",
        to: email,
        subject: "Verify your email - Malt Keyword Tool",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verify your email</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #666;">
              ${greeting},
            </p>
            <p style="font-size: 16px; line-height: 1.5; color: #666;">
              Click the link below to verify your email and unlock full results from the Malt Keyword Tool:
            </p>
            <p style="margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
                Verify Email
              </a>
            </p>
            <p style="font-size: 14px; color: #999;">
              This link will expire in 24 hours.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #999;">
              Malt Keyword Tool | Helping French freelancers find high-value keywords
            </p>
          </div>
        `,
      });

      if (!emailResult || emailResult.error) {
        console.error("Resend API error:", emailResult?.error);
        return NextResponse.json(
          { status: "error", message: "Failed to send confirmation email" },
          { status: 500 },
        );
      }

      // Success response
      return NextResponse.json(
        {
          status: "success",
          message: "Confirmation email sent. Please check your inbox.",
          verificationEmailSent: true,
        },
        { status: 200 },
      );
    } catch (sendError) {
      console.error("Error sending email:", sendError);
      return NextResponse.json(
        { status: "error", message: "Failed to send confirmation email" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Subscribe endpoint error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}

// Export for testing
export { verificationTokens, rateLimitStore, isRateLimited };
