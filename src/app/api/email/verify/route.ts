import { NextRequest, NextResponse } from "next/server";
import { verificationTokens, isTokenExpired } from "../token-storage";

export async function GET(request: NextRequest) {
  try {
    // Extract token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    // Validate token exists
    if (!token) {
      return NextResponse.json(
        { status: "error", message: "No verification token provided" },
        { status: 400 },
      );
    }

    // Look up token in storage
    const tokenRecord = verificationTokens.get(token);

    // Check if token exists
    if (!tokenRecord) {
      // Don't expose whether token exists or not (security best practice)
      return NextResponse.json(
        { status: "error", message: "Invalid or expired verification link" },
        { status: 404 },
      );
    }

    // Check if token has expired
    if (isTokenExpired(tokenRecord)) {
      return NextResponse.json(
        { status: "error", message: "Verification link has expired" },
        { status: 410 },
      );
    }

    // Check if token has already been used (replay protection)
    if (tokenRecord.used) {
      return NextResponse.json(
        { status: "error", message: "Verification link has already been used" },
        { status: 410 },
      );
    }

    // Mark token as used (prevent replay attacks)
    tokenRecord.used = true;

    // Return success response with redirect URL
    return NextResponse.json(
      {
        status: "success",
        message: "Email verified successfully",
        redirectUrl: "/?verified=true",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify endpoint error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 },
    );
  }
}
