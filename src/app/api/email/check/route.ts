import { NextRequest, NextResponse } from "next/server";
import { ncbFind } from "@/lib/ncb";

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    const { email } = body;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ verified: false }, { status: 400 });
    }

    const rows = await ncbFind("subscribers", { email });
    if (rows.length === 0) {
      return NextResponse.json({ verified: false });
    }

    const record = rows[0] as { verified: number };
    return NextResponse.json({ verified: record.verified === 1 });
  } catch (error) {
    console.error("Check endpoint error:", error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
