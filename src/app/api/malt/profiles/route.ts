import { NextRequest, NextResponse } from "next/server";
import { MaltProfilesResponseSchema } from "@/lib/schemas/malt";

export const dynamic = "force-dynamic";

const PROFILES_SERVICE_URL = process.env.PROFILES_SERVICE_URL;
const PROFILES_SERVICE_SECRET = process.env.PROFILES_SERVICE_SECRET ?? "";
const PAGES_TO_FETCH = 3;
const CACHE_CONTROL = "max-age=0, s-maxage=120, stale-while-revalidate=600";

export async function GET(request: NextRequest) {
  if (!PROFILES_SERVICE_URL) {
    return NextResponse.json(
      { error: "Profile service not configured." },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 });
    }

    const pagesParam = parseInt(searchParams.get("pages") ?? "", 10);
    const pages =
      Number.isFinite(pagesParam) && pagesParam > 0
        ? Math.min(pagesParam, PAGES_TO_FETCH)
        : PAGES_TO_FETCH;

    const url = new URL(`${PROFILES_SERVICE_URL}/profiles`);
    url.searchParams.set("q", q);
    url.searchParams.set("pages", String(pages));

    const response = await fetch(url.toString(), {
      headers: {
        "x-api-secret": PROFILES_SERVICE_SECRET,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No profiles found or upstream unavailable." },
        { status: 502 },
      );
    }

    const data = await response.json();
    const parsed = MaltProfilesResponseSchema.safeParse(data);

    if (!parsed.success || parsed.data.profiles.length === 0) {
      return NextResponse.json(
        { error: "No profiles found or upstream unavailable." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { profiles: parsed.data.profiles, total: parsed.data.profiles.length },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Profiles API error:", error);
    return NextResponse.json(
      {
        error: "Profile search temporarily unavailable.",
        _debug: msg,
      },
      { status: 500 },
    );
  }
}
