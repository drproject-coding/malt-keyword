import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { SubscribeRequest } from "@/lib/schemas/email";
import { ncbFind, ncbInsert } from "@/lib/ncb";

const RATE_LIMIT_REQUESTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_EXPIRY_HOURS = 24;

// In-memory rate limiter (per-process, resets on cold start — sufficient for this scale)
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(email) ?? [];
  const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_REQUESTS) return true;
  rateLimitStore.set(email, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { status: "error", message: "Invalid request body" },
        { status: 400 },
      );
    }

    const parsed = SubscribeRequest.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { status: "error", message: "Invalid email or missing consent" },
        { status: 400 },
      );
    }

    const { email, name, consent } = parsed.data;

    if (isRateLimited(email)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }

    // Check for existing unverified subscriber
    const existing = await ncbFind("subscribers", { email });
    if (existing.length > 0) {
      const record = existing[0] as { verified?: number };
      if (record.verified === 1) {
        return NextResponse.json(
          { status: "error", message: "This email is already verified." },
          { status: 409 },
        );
      }
      // Allow resend — fall through to generate a new token
    }

    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date()
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d{3}Z$/, "");

    await ncbInsert("subscribers", {
      email,
      name: name ?? null,
      consent: consent ? 1 : 0,
      verified: 0,
      verification_token: token,
      token_created_at: now,
      subscribed_at: now,
    });

    // Send verification email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { status: "error", message: "Failed to send confirmation email" },
        { status: 500 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/email/verify?token=${token}`;
    const greeting = name ? `Hi ${name}` : "Hello";

    const resend = new Resend(resendApiKey);
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email - Malt Keyword Tool",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verify your email</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #666;">${greeting},</p>
          <p style="font-size: 16px; line-height: 1.5; color: #666;">
            Click the link below to verify your email and unlock full results from the Malt Keyword Tool:
          </p>
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </p>
          <p style="font-size: 14px; color: #999;">This link will expire in ${TOKEN_EXPIRY_HOURS} hours.</p>
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

    return NextResponse.json(
      {
        status: "success",
        message: "Confirmation email sent. Please check your inbox.",
        verificationEmailSent: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Subscribe endpoint error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
