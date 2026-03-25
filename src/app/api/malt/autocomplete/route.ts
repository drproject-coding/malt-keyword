import { NextRequest, NextResponse } from "next/server";
import {
  MaltAutocompleteRequestSchema,
  MaltAutocompleteRawSchema,
} from "@/lib/schemas/malt";

const MALT_API_URL =
  "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete";
const UPSTREAM_TIMEOUT = 5000; // 5 seconds
const CACHE_CONTROL = "max-age=0, s-maxage=60, stale-while-revalidate=300";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    // Validate input
    let validatedInput;
    try {
      validatedInput = MaltAutocompleteRequestSchema.parse({ q: query });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { error: "Search temporarily unavailable. Please try again." },
        { status: 500 },
      );
    }

    // Build Malt API URL
    const maltUrl = new URL(MALT_API_URL);
    maltUrl.searchParams.set("query", validatedInput.q);

    // Forward browser cookies so Cloudflare lets the request through
    const cookieHeader = request.headers.get("cookie") ?? "";

    // Fetch from Malt with timeout
    const maltResponse = await fetch(maltUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": request.headers.get("user-agent") ?? "Mozilla/5.0",
        ...(cookieHeader && { Cookie: cookieHeader }),
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT),
    });

    if (!maltResponse.ok) {
      console.error(
        `Malt API error: ${maltResponse.status} ${maltResponse.statusText}`,
      );
      return NextResponse.json(
        { error: "Search temporarily unavailable. Please try again." },
        { status: 500 },
      );
    }

    const data = await maltResponse.json();

    // Malt returns a raw array; validate and wrap into our response shape
    const rawSuggestions = MaltAutocompleteRawSchema.parse(data);
    const validated = {
      suggestions: rawSuggestions.map(({ label, occurrences }) => ({
        label,
        occurrences,
      })),
    };

    // Return with cache headers (INFRA-02)
    return NextResponse.json(validated, {
      headers: {
        "Cache-Control": CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Search temporarily unavailable. Please try again." },
      { status: 500 },
    );
  }
}
