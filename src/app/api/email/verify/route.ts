import { NextRequest, NextResponse } from "next/server";
import { ncbFind, ncbUpdate } from "@/lib/ncb";

export const dynamic = "force-dynamic";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

function redirect(request: NextRequest, error?: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const url = error ? `${base}/verified?error=${error}` : `${base}/verified`;
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return redirect(request, "invalid");
    }

    const rows = await ncbFind("subscribers", { verification_token: token });

    if (rows.length === 0) {
      return redirect(request, "invalid");
    }

    const record = rows[0] as {
      id: number;
      verified: number;
      token_created_at: string;
    };

    if (record.verified === 1) {
      return redirect(request, "used");
    }

    const createdAt = new Date(record.token_created_at).getTime();
    if (Date.now() - createdAt > TOKEN_EXPIRY_MS) {
      return redirect(request, "expired");
    }

    await ncbUpdate("subscribers", record.id, {
      verified: 1,
      verified_at: new Date()
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, ""),
      verification_token: null,
    });

    return redirect(request);
  } catch (error) {
    console.error("Verify endpoint error:", error);
    return redirect(request, "invalid");
  }
}
