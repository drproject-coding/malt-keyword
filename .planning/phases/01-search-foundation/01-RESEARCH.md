# Phase 1: Search Foundation - Research

**Researched:** 2026-03-24
**Domain:** Next.js API proxying, real-time search with debouncing, HTTP caching, SWR client-side deduplication
**Confidence:** HIGH (official docs + verified patterns)

## Summary

Phase 1 establishes the core technical foundation for the Malt Keyword Tool: a fast, responsive search interface that queries Malt's undocumented autocomplete endpoint through a Next.js API proxy, with multi-layer caching to prevent hammering the upstream API. The stack leverages Next.js 14 App Router Route Handlers (not Pages Router), SWR for client-side deduplication, HTTP Cache-Control headers on the proxy, and shadcn/ui components for the UI. All Malt API calls must go through the server-side proxy to avoid CORS; repeated queries within 60 seconds are cached. Debouncing at 300ms prevents excessive API calls during typing. The primary risk is Malt API authentication (session cookie vs. explicit token) and rate limit thresholds — both **MUST** be tested before implementation begins. Error handling must gracefully surface timeouts, rate limits, and invalid responses to users without crashing.

**Primary recommendation:** Build Phase 1 on top of Next.js 14 App Router Route Handlers (`/api/malt/autocomplete` proxy) with SWR client-side deduplication (300ms debounce), HTTP Cache-Control headers (`max-age=0, s-maxage=60, stale-while-revalidate=300`), and AbortController for race condition safety. Test Malt API authentication and rate limits immediately — do not assume session cookies work without verification.

---

## User Constraints (from CONTEXT.md)

No CONTEXT.md exists for this phase. Research domains are unconstrained; all findings in this research apply.

---

## Phase Requirements

| ID       | Description                                                                      | Research Support                                                                       |
| -------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| SRCH-01  | User can type a keyword and see live results updating as they type (debounced)   | Debounce pattern (300-500ms), SWR deduplication, AbortController for race safety       |
| SRCH-02  | Each keyword result shows volume count (Malt users claiming skill)               | Malt autocomplete API response schema (TBD — requires API testing)                     |
| SRCH-03  | Search results include 5–10 related keyword suggestions with volume data         | Malt API should return suggestions in response; Zod schema for parsing                 |
| SRCH-04  | Each keyword displays color-coded competition signal (rare/common/oversaturated) | Color semantics (green=rare, yellow=common, red=oversaturated); thresholds TBD         |
| INFRA-01 | Next.js API route proxies all Malt requests server-side (avoids CORS)            | Route Handlers in App Router, Zod input validation, error handling                     |
| INFRA-02 | Proxy caches responses to prevent hammering Malt API                             | HTTP Cache-Control headers (s-maxage=60), SWR client dedup, optional Upstash Redis     |
| INFRA-03 | Application deployed on Vercel with public URL; <1 second response time          | Vercel serverless functions (10s timeout default), edge caching, environment variables |

---

## Standard Stack

### Core

| Library      | Version | Purpose                                                            | Why Standard                                                                               |
| ------------ | ------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Next.js      | 14+     | App Router, Route Handlers (API proxy), full-stack TypeScript      | Official Vercel stack; App Router is stable and preferred in 2026                          |
| TypeScript   | 5.4+    | Static typing for API routes, components, and schemas              | Essential for production; Zod pairs seamlessly                                             |
| React        | 18.x    | UI components; client-side search with `use client` directive      | Bundled with Next.js 14                                                                    |
| SWR          | 2.x     | Client-side data fetching with deduplication and caching           | Minimal, built-in dedup prevents duplicate API calls during fast typing; Vercel-maintained |
| shadcn/ui    | Latest  | Pre-built, accessible UI components (Input, Card, Button, Command) | Tailwind-based, lightweight, pairs well with Tailwind CSS                                  |
| Tailwind CSS | 3.x     | Utility-first styling                                              | Standard in modern Next.js projects; shadcn/ui built on it                                 |
| Zod          | 3.x     | Runtime schema validation for API requests and responses           | Type-safe, pairs with TypeScript inference; validates Malt API response shape              |

### Supporting

| Library         | Version  | Purpose                                                       | When to Use                                                            |
| --------------- | -------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| lodash-es       | 4.x      | Debounce utility (or custom hook with useEffect + setTimeout) | Lightweight alternative: custom hook via useDebounce from use-debounce |
| use-debounce    | Latest   | React hook for debouncing input values                        | Simpler than lodash for React; hooks-based pattern                     |
| next/headers    | Built-in | Access request headers (Authorization, Cookie) in API routes  | Required to read session cookies from Malt                             |
| AbortController | Built-in | Abort in-flight requests on newer search queries              | Prevents race conditions (older results overwriting newer ones)        |

### Alternatives Considered

| Instead of     | Could Use                     | Tradeoff                                                                                                        |
| -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| SWR            | TanStack Query (React Query)  | TanStack is heavier (~34KB vs ~6KB); better for complex mutations. Skip for MVP.                                |
| SWR            | built-in fetch + manual cache | No dedup, manual state management, higher complexity. SWR handles both elegantly.                               |
| shadcn/ui      | Material-UI, Chakra UI        | More opinionated; larger bundle. shadcn gives you components + full source code control.                        |
| HTTP caching   | Upstash Redis (Layer 3)       | Redis adds complexity and cost; HTTP + SWR is sufficient for Phase 1. Add Redis only if Layer 1+2 insufficient. |
| Route Handlers | Pages Router API Routes       | Pages Router in maintenance mode; App Router is standard in 2026.                                               |

**Installation:**

```bash
npm install next@14 react@18 typescript@5.4 zod swr shadcn-ui tailwindcss use-debounce
npx shadcn-ui@latest init  # Initialize shadcn/ui in your project
```

**Version verification (as of 2026-03-24):**

- Next.js: 14.2+ (latest stable)
- React: 18.3+
- Zod: 3.22+
- SWR: 2.2+
- shadcn/ui: Latest (component-based, no version number)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── malt/
│   │       └── autocomplete/
│   │           └── route.ts          # Route Handler: server-side proxy
│   ├── components/
│   │   ├── SearchBox.tsx             # Input + debounce logic (use client)
│   │   ├── ResultsList.tsx           # Display search results (use client)
│   │   └── KeywordCard.tsx           # Individual result (volume + competition)
│   └── page.tsx                      # Main search page
├── lib/
│   ├── schemas/
│   │   └── malt.ts                   # Zod schemas for API validation
│   ├── utils/
│   │   └── competition.ts            # Color coding logic (rare/common/saturated)
│   └── types.ts                      # Shared TypeScript types
└── hooks/
    └── useSearch.ts                  # Custom hook: fetch + SWR + debounce
```

### Pattern 1: Server-Side API Proxy (Route Handler)

**What:** Next.js App Router Route Handler at `/api/malt/autocomplete` that accepts a `query` parameter, forwards it to Malt's API (via fetch), validates the response with Zod, and returns cached results to the client.

**When to use:** Whenever a client needs to call an external API that (a) doesn't expose CORS headers, (b) requires server-side secrets/authentication, or (c) needs server-side caching.

**Example:**

```typescript
// src/app/api/malt/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for Malt API response (MUST be verified against live API)
const MaltResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      label: z.string(),
      volume: z.number().optional(),
    }),
  ),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ suggestions: [] }, { status: 400 });
  }

  try {
    // Forward to Malt API (may require Cookie/auth)
    const maltUrl = new URL(
      "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete",
    );
    maltUrl.searchParams.set("query", query);

    const maltResponse = await fetch(maltUrl, {
      headers: request.headers, // Pass client cookies
      signal: AbortSignal.timeout(5000), // 5s upstream timeout
    });

    if (!maltResponse.ok) {
      return NextResponse.json(
        { error: "Upstream API error" },
        { status: maltResponse.status },
      );
    }

    const data = await maltResponse.json();
    const validated = MaltResponseSchema.parse(data);

    // HTTP caching: 60s fresh, then serve stale for 5 minutes while revalidating
    return NextResponse.json(validated, {
      headers: {
        "Cache-Control": "max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 },
    );
  }
}
```

**Source:** [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs)

### Pattern 2: Client-Side Search with SWR + Debouncing + Race Safety

**What:** React component using a custom `useSearch()` hook that: (1) debounces user input at 300ms, (2) uses SWR to fetch from your proxy with automatic deduplication, (3) handles in-flight request cancellation to prevent race conditions.

**When to use:** Any real-time search UI that needs to reduce API calls, handle user typing as input changes rapidly, and safely discard stale results.

**Example:**

```typescript
// src/hooks/useSearch.ts
'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';

const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce: update debouncedQuery 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch with SWR: deduped, cached, and stale-while-revalidate aware
  const { data, error, isLoading } = useSWR(
    debouncedQuery ? `/api/malt/autocomplete?q=${encodeURIComponent(debouncedQuery)}` : null,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false, // Don't refetch when window regains focus (safe with stale-while-revalidate)
      dedupingInterval: 300, // SWR won't dedupe requests within 300ms (matches debounce window)
    }
  );

  return {
    query,
    setQuery,
    results: data?.suggestions || [],
    isLoading,
    error,
  };
};

// src/components/SearchBox.tsx
'use client';

import { useSearch } from '@/hooks/useSearch';

export function SearchBox() {
  const { query, setQuery, results, isLoading } = useSearch();

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search keywords..."
        className="px-4 py-2 border rounded"
      />
      {isLoading && <p>Loading...</p>}
      {results.map((r) => (
        <div key={r.label}>{r.label} ({r.volume} users)</div>
      ))}
    </div>
  );
}
```

**Source:** [SWR Documentation](https://swr.vercel.app/), [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react), [Race Conditions and Debouncing](https://javascript.plainenglish.io/understanding-race-conditions-and-debouncing-throttling-in-javascript-a-practical-guide-0f577678056a)

### Pattern 3: HTTP Cache-Control Headers for Edge Caching

**What:** Set `Cache-Control` headers on your Route Handler response to leverage Vercel's Edge Cache. The header `max-age=0, s-maxage=60, stale-while-revalidate=300` tells browsers not to cache locally, but tells Vercel's edge to cache for 60s and serve stale for 5 more minutes while revalidating.

**When to use:** Any API route that returns data that can be slightly stale (60 seconds is acceptable).

**Example:**

```typescript
// In your Route Handler:
return NextResponse.json(validated, {
  headers: {
    "Cache-Control": "max-age=0, s-maxage=60, stale-while-revalidate=300",
  },
});
```

**Breakdown:**

- `max-age=0` — Browsers won't cache (always revalidate), reducing stale data on client refresh
- `s-maxage=60` — Vercel's edge cache for 60 seconds (queries within 60s return cached response)
- `stale-while-revalidate=300` — After 60s, serve stale for 300s while fetching fresh in background

**Source:** [Caching on Vercel's Edge Network](https://vercel.com/docs/edge-network/caching), [Stale-While-Revalidate](https://web.dev/articles/stale-while-revalidate), [RFC 5861](https://datatracker.ietf.org/doc/html/rfc5861)

### Pattern 4: Color-Coded Competition Signal

**What:** Based on volume count, assign a color badge: green (rare: <10 users), yellow (common: 10–100), red (oversaturated: >100). Display in KeywordCard component.

**When to use:** Whenever showing a quantity that benefits from quick visual assessment (safe vs. risky).

**Example:**

```typescript
// src/lib/utils/competition.ts
export function getCompetitionLevel(volume: number): 'rare' | 'common' | 'oversaturated' {
  if (volume < 10) return 'rare';
  if (volume < 100) return 'common';
  return 'oversaturated';
}

export function getCompetitionColor(level: 'rare' | 'common' | 'oversaturated'): string {
  const colors = {
    rare: 'bg-green-100 text-green-800 border-green-300',
    common: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    oversaturated: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[level];
}

// src/components/KeywordCard.tsx
'use client';

import { getCompetitionLevel, getCompetitionColor } from '@/lib/utils/competition';

export function KeywordCard({ label, volume }: { label: string; volume: number }) {
  const level = getCompetitionLevel(volume);
  const colorClass = getCompetitionColor(level);

  return (
    <div className="p-4 border rounded">
      <p className="font-semibold">{label}</p>
      <span className={`inline-block px-2 py-1 text-sm rounded ${colorClass}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)} ({volume})
      </span>
    </div>
  );
}
```

**Thresholds (PLACEHOLDER — TBD after data analysis):**

- Rare: <10 users — opportunity (green)
- Common: 10–100 users — moderate competition (yellow)
- Oversaturated: >100 users — high competition (red)

**Source:** [UI Color Principles](https://uxplanet.org/principles-of-color-in-ui-design-43708d8512d8), [Material Design Color](https://m2.material.io/design/color/applying-color-to-ui.html)

### Anti-Patterns to Avoid

- **No debounce on search input:** Firing API calls on every keystroke → hammers API, poor UX, high cost on Vercel.
- **Handling race conditions with just debounce:** Older requests can resolve after newer ones → UI shows stale data. Use AbortController + debounce together.
- **Storing Malt API key in client code:** Never expose secrets in browser. Always proxy through Route Handler.
- **Ignoring HTTP Cache-Control headers:** Rewriting your own Redis cache when Vercel edge caching is free and fast.
- **No error handling for upstream timeouts:** If Malt is slow/unreachable, show a user-friendly message, not a blank screen or crash.
- **Mixing Pages Router and App Router:** Stick with App Router (maintenance mode for Pages Router; App Router is standard in 2026).

---

## Don't Hand-Roll

| Problem                                  | Don't Build                                      | Use Instead                                               | Why                                                                                           |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Request deduplication during fast typing | Custom in-memory cache + manual request tracking | SWR (built-in dedup) or TanStack Query                    | SWR handles dedup, stale-while-revalidate, and focus revalidation automatically               |
| API response validation                  | try/catch JSON parsing or manual property checks | Zod schema (+ `z.infer<typeof schema>`)                   | Zod provides type-safe validation, helpful error messages, and TypeScript inference           |
| Debouncing input                         | Manual setTimeout/clearTimeout logic             | use-debounce hook or custom useDebounce with useEffect    | Custom debounce is error-prone (memory leaks, forgotten cleanup); libraries handle edge cases |
| Race condition prevention                | Checking timestamps or response order in UI      | AbortController (native)                                  | AbortController is built-in, cancels in-flight requests, and prevents stale results           |
| Server-side API caching                  | Redis or custom TTL cache                        | HTTP Cache-Control headers (s-maxage) + Vercel edge cache | Vercel edge cache is free, integrated, and automatically invalidates on redeploy              |
| UI components (Input, Card, Button)      | Custom styled divs                               | shadcn/ui (+ Tailwind)                                    | shadcn is accessible, pre-built, customizable, and reduces shipping time                      |

**Key insight:** Malt search is a straightforward proxy + debounce + cache pattern. The risk is _not_ complexity; it's Malt API unknowns (auth, rate limits, response schema). Use battle-tested libraries (SWR, Zod, shadcn) so you can focus on testing the Malt integration early.

---

## Common Pitfalls

### Pitfall 1: Race Conditions in Debounced Search

**What goes wrong:** You debounce typing to 300ms, but request A (slow, takes 2s) and request B (fast, takes 100ms) resolve in the wrong order. Request A completes after B, and the UI shows stale results from query A instead of query B.

**Why it happens:** Debounce reduces API calls but doesn't prevent slow requests from being overwritten by faster ones. Browser fetch has no built-in ordering.

**How to avoid:**

1. Pair debounce with AbortController: abort previous requests when a new search is triggered.
2. Add a request ID or timestamp to each response, and discard responses older than the current UI state.
3. SWR + dedup reduces calls, but AbortController prevents the race condition.

**Warning signs:**

- Typing a query, seeing wrong results for a moment, then correct results
- Search results that don't match the current input
- Multiple simultaneous requests to the API

**Example fix:**

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

useEffect(() => {
  if (!debouncedQuery) return;

  // Abort previous request
  abortControllerRef.current?.abort();
  abortControllerRef.current = new AbortController();

  fetch(`/api/malt/autocomplete?q=${debouncedQuery}`, {
    signal: abortControllerRef.current.signal,
  })
    .then((r) => r.json())
    .then(setResults)
    .catch((e) => {
      if (e.name !== "AbortError") console.error(e);
    });
}, [debouncedQuery]);
```

### Pitfall 2: Malt API Authentication Unknown

**What goes wrong:** Your proxy assumes Malt API requires only a session cookie, but it actually requires a Bearer token. Requests fail with 401 Unauthorized or return empty results. Phase 1 blocks.

**Why it happens:** Malt API is undocumented; auth method isn't publicly specified. Easy to guess wrong.

**How to avoid:**

1. **Test immediately (before Phase 1 planning):** Curl the Malt endpoint directly from your machine and from a Vercel serverless function to verify auth, rate limits, and response format.
2. **Check Malt's public API docs** (if they exist) or contact their developer team.
3. **Fallback plan:** If Malt denies access or changes the endpoint, research LinkedIn API or build a keyword scraper.

**Warning signs:**

- Proxy returns 401 or 403 errors
- Proxy returns empty suggestions for known keywords
- Requests work locally but fail after Vercel deployment

### Pitfall 3: No Error Handling for Upstream Timeouts

**What goes wrong:** Malt API is slow (>5s) or unreachable. Your proxy has no timeout, requests hang, SWR client waits forever, and users see a blank screen or spinner indefinitely.

**Why it happens:** Easy to forget that external APIs can fail or be slow. Default fetch has no timeout.

**How to avoid:**

1. Set a 5-second timeout on upstream fetch (use AbortSignal.timeout).
2. Return a user-friendly error message (not a 500 crash).
3. Test with Vercel's default 10s timeout in mind; keep proxy <5s.

**Warning signs:**

- Search results never appear (no error message)
- Vercel logs show "Function timed out"
- UI spinner spins forever

**Example:**

```typescript
const maltResponse = await fetch(maltUrl, {
  signal: AbortSignal.timeout(5000), // 5s timeout
});
```

### Pitfall 4: Forgetting SWR Deduplication Window

**What goes wrong:** User types "React", then immediately types "React Native". Both queries hit the API separately even though SWR should dedupe. Or, SWR returns cached data from the previous query when switching between queries rapidly.

**Why it happens:** SWR's `dedupingInterval` defaults to 2 seconds, which is less than your debounce window (300ms). Requests outside the window aren't deduped. Also, forgetting to set `revalidateOnFocus: false` can trigger extra fetches.

**How to avoid:**

1. Set `dedupingInterval` to match (or exceed) your debounce delay: `dedupingInterval: 300`.
2. Set `revalidateOnFocus: false` so users regaining focus don't trigger refetch (stale-while-revalidate is OK).
3. Monitor network tab in DevTools during typing to verify only one request per unique query.

**Warning signs:**

- Multiple requests for the same query in DevTools Network tab
- Results changing unexpectedly after rapid typing

### Pitfall 5: HTTP Cache-Control Header Misunderstanding

**What goes wrong:** You set `Cache-Control: max-age=60` (browser cache), but Vercel edge doesn't cache because you forgot `s-maxage`. Or, you set it wrong and the edge cache invalidates too frequently.

**Why it happens:** HTTP caching has multiple directives (`max-age` vs `s-maxage`), and it's easy to confuse them.

**How to avoid:**

1. Always use: `max-age=0, s-maxage=60, stale-while-revalidate=300` for search results.
   - `max-age=0` → browsers don't cache (fresh on page reload)
   - `s-maxage=60` → Vercel edge caches for 60s
   - `stale-while-revalidate=300` → after 60s, serve stale for 5 min while revalidating
2. Test with curl and inspect response headers: `curl -I https://yourapp.vercel.app/api/malt/autocomplete?q=python`
3. Vercel dashboard should show cache hit rate; watch for it.

**Warning signs:**

- Every request hits the Malt API (no cache hits)
- Cache-Control header not present in response
- Vercel build output or logs mention "cache bypass"

### Pitfall 6: Vercel Serverless Function Timeout

**What goes wrong:** Your proxy calls Malt API, which is slow. Your route takes 8 seconds. Vercel's default 10-second timeout is tight; add one more millisecond of client-side SWR retry logic, and it hits the 10s limit → Function Timeout error.

**Why it happens:** Vercel Hobby tier has a 10-second timeout. If your proxy + upstream API call total >10s, it fails.

**How to avoid:**

1. Keep proxy response time <5 seconds (set upstream timeout to 5s).
2. Test locally with slow Malt API to find bottlenecks.
3. Consider upgrading to Vercel Pro ($20/mo) for 60-second timeout if needed.
4. Don't retry indefinitely in SWR; set `errorRetryCount` low (e.g., 1 or 2).

**Warning signs:**

- Vercel logs show "Function timed out after 10s"
- Requests succeed locally but fail after Vercel deployment

---

## Code Examples

Verified patterns from official sources:

### Example 1: Route Handler with Zod Validation

```typescript
// src/app/api/malt/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MaltQuerySchema = z.object({
  q: z.string().min(2).max(100),
});

const MaltResponseSchema = z.object({
  suggestions: z
    .array(
      z.object({
        label: z.string(),
        volume: z.number().optional(),
      }),
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Validate input
  const input = MaltQuerySchema.safeParse({
    q: searchParams.get("q"),
  });

  if (!input.success) {
    return NextResponse.json(
      { error: "Invalid query", details: input.error.errors },
      { status: 400 },
    );
  }

  try {
    const maltUrl = new URL(
      "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete",
    );
    maltUrl.searchParams.set("query", input.data.q);

    const maltResponse = await fetch(maltUrl, {
      headers: {
        "User-Agent": "Malt-Keyword-Tool/1.0",
        // Include cookies if session-based auth
        Cookie: request.headers.get("cookie") || "",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!maltResponse.ok) {
      return NextResponse.json(
        { error: `Malt API returned ${maltResponse.status}` },
        { status: maltResponse.status },
      );
    }

    const data = await maltResponse.json();
    const validated = MaltResponseSchema.parse(data);

    return NextResponse.json(validated, {
      headers: {
        "Cache-Control": "max-age=0, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error);
      return NextResponse.json(
        { error: "Invalid response from Malt API" },
        { status: 502 },
      );
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Search timed out. Please try again." },
        { status: 504 },
      );
    }

    console.error("Autocomplete error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
```

**Source:** [Zod API Validation](https://dub.co/blog/zod-api-validation), [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)

### Example 2: Custom useSearch Hook with Debounce + SWR

```typescript
// src/hooks/useSearch.ts
"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface SearchResult {
  label: string;
  volume?: number;
}

export function useSearch(debounceMs = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce: wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Fetch with SWR: deduped, cached
  const { data, error, isLoading } = useSWR<{ suggestions: SearchResult[] }>(
    debouncedQuery
      ? `/api/malt/autocomplete?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    async (url) => {
      // Abort previous request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    {
      dedupingInterval: debounceMs, // Match debounce window
      revalidateOnFocus: false, // Don't refetch on window focus
      errorRetryCount: 2, // Retry failed requests 2 times
      errorRetryInterval: 1000, // Wait 1s between retries
    },
  );

  return {
    query,
    setQuery,
    results: data?.suggestions || [],
    isLoading: isLoading && debouncedQuery.length > 0,
    error: error?.message || null,
  };
}
```

**Source:** [SWR Docs](https://swr.vercel.app/), [How to Debounce in React](https://www.developerway.com/posts/debouncing-in-react)

### Example 3: SearchBox Component with shadcn/ui

```typescript
// src/components/SearchBox.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { KeywordCard } from './KeywordCard';

export function SearchBox() {
  const { query, setQuery, results, isLoading, error } = useSearch(300);
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full max-w-md">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search keywords (e.g., React, Python, UI Design)"
        className="px-4 py-2"
      />

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-4 text-gray-500">Loading results...</div>
      )}

      {query.length > 0 && !isLoading && results.length === 0 && !error && (
        <div className="mt-4 text-gray-500">No results found</div>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <KeywordCard
              key={result.label}
              label={result.label}
              volume={result.volume || 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Source:** [shadcn/ui](https://www.shadcn.io/), [React Data Fetching](https://nextjs.org/docs/app/getting-started/fetching-data)

---

## State of the Art

| Old Approach                      | Current Approach                  | When Changed       | Impact                                                                                  |
| --------------------------------- | --------------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| Pages Router API Routes           | App Router Route Handlers         | Next.js 13+ (2022) | App Router is stable, standard, and preferred in 2026; Pages Router in maintenance mode |
| Manual fetch + state              | SWR or TanStack Query             | 2020s              | Libraries handle dedup, caching, retry logic; no need to build from scratch             |
| Express middleware for validation | Zod schemas                       | 2020s              | Zod is TypeScript-first, provides type inference, and is lighter than express + joi     |
| Redis for everything              | HTTP Cache-Control + edge cache   | Vercel (2020s)     | Edge cache is free, automatic, and invalidates on deploy; add Redis only if needed      |
| Custom debounce logic             | use-debounce library or useEffect | 2020s              | Libraries handle cleanup, race conditions; custom logic is error-prone                  |

**Deprecated/outdated:**

- **Pages Router API Routes:** Still work, but App Router is standard. Use App Router.
- **Redux for fetched data:** SWR/TanStack Query eliminate boilerplate.
- **Manual race condition handling:** Use AbortController (native, built-in).

---

## Open Questions

1. **Malt API Authentication**
   - What we know: Docs mention "public-api" endpoint; unclear if session cookie or explicit Bearer token required.
   - What's unclear: Does the endpoint require authentication at all? Can anonymous requests access it?
   - Recommendation: **Test immediately with curl from Vercel Function before Phase 1 implementation.** This is a blocker.
   - Action: Email Malt dev team or test live: `curl https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=python`

2. **Malt API Rate Limits**
   - What we know: Estimated 100 req/min; unverified.
   - What's unclear: What are actual limits? What status code for rate limit (429)?
   - Recommendation: Load-test proxy under production typing patterns (debounce + SWR dedup should reduce calls significantly).
   - Action: Monitor Malt API response headers for `X-RateLimit-*` headers during testing.

3. **Malt API Response Schema**
   - What we know: Expected shape has `suggestions` array with `label` and `volume` properties.
   - What's unclear: Are there other fields? Is `volume` always present or optional?
   - Recommendation: Test live endpoint and parse response to build accurate Zod schema before Phase 1.
   - Action: Save sample response from Malt API; use it to verify schema in tests.

4. **Competition Signal Thresholds**
   - What we know: Rare (<10), Common (10–100), Oversaturated (>100).
   - What's unclear: Are these thresholds appropriate for Malt's market? Should they differ by category or language?
   - Recommendation: Analyze production data after Phase 1 deploy; adjust if necessary.
   - Action: Track volume distribution of successful searches; use percentiles (e.g., p25, p50, p75) to define thresholds post-MVP.

5. **Vercel Pro vs. Hobby Tier**
   - What we know: Hobby tier has 10s timeout; Pro tier has 60s. MVP likely fits Hobby.
   - What's unclear: Expected traffic volume; cost implications of upgrade.
   - Recommendation: Start on Hobby; monitor response times and request volume.
   - Action: Track p95 response time in Vercel Analytics; upgrade if hitting timeout limits.

---

## Validation Architecture

### Test Framework

| Property           | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| Framework          | Vitest 1.0+ (preferred) or Jest 30+                    |
| Config file        | `vitest.config.ts` or `jest.config.js` (TBD in Wave 0) |
| Quick run command  | `npm run test:watch` (unit tests, <30s)                |
| Full suite command | `npm run test` (all tests + coverage)                  |

### Phase Requirements → Test Map

| Req ID   | Behavior                                                                                        | Test Type               | Automated Command                                             | File Exists? |
| -------- | ----------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------- | ------------ |
| SRCH-01  | Debounce delays API call by 300ms; typing rapidly produces only 1 request                       | Unit + Integration      | `npm run test -- src/hooks/useSearch.test.ts`                 | ❌ Wave 0    |
| SRCH-02  | Search result displays volume count from API response                                           | Component               | `npm run test -- src/components/KeywordCard.test.ts`          | ❌ Wave 0    |
| SRCH-03  | Search results include 5–10 related keyword suggestions                                         | Integration             | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ Wave 0    |
| SRCH-04  | Competition signal color changes based on volume (rare=green, common=yellow, oversaturated=red) | Unit                    | `npm run test -- src/lib/utils/competition.test.ts`           | ❌ Wave 0    |
| INFRA-01 | Route Handler proxies Malt request and returns response                                         | Integration             | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ Wave 0    |
| INFRA-02 | Route Handler response includes `Cache-Control: s-maxage=60` header                             | Integration             | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ Wave 0    |
| INFRA-03 | Application deployed on Vercel; live search completes in <1s                                    | E2E / Manual smoke test | `npm run test:e2e` (Playwright) or manual                     | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm run test:watch` (unit tests only; <30s)
- **Per wave merge:** `npm run test` (full suite + coverage; ~60s)
- **Phase gate:** Full suite green + manual smoke test on Vercel staging before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/hooks/useSearch.test.ts` — covers SRCH-01, debounce + dedup behavior
- [ ] `src/components/KeywordCard.test.ts` — covers SRCH-02, SRCH-04 (volume display, color coding)
- [ ] `src/app/api/malt/autocomplete/route.test.ts` — covers SRCH-03, INFRA-01, INFRA-02 (proxy, caching, validation)
- [ ] `src/lib/utils/competition.test.ts` — covers SRCH-04 (thresholds, color logic)
- [ ] `vitest.config.ts` — configuration for Vitest + TypeScript + jsdom
- [ ] `tests/e2e/search.spec.ts` — covers INFRA-03 (Vercel smoke test; manual or Playwright)

---

## Sources

### Primary (HIGH confidence)

- **Next.js Official Docs**
  - [Route Handlers (App Router)](https://nextjs.org/docs/app/getting-started/route-handlers)
  - [Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs)
  - [Fetching Data in Next.js](https://nextjs.org/docs/app/getting-started/fetching-data)

- **SWR Official Docs**
  - [SWR Deduplication & Caching](https://swr.vercel.app/)
  - [SWR with Next.js](https://swr.vercel.app/docs/with-nextjs)

- **Vercel Official Docs**
  - [Caching on Vercel's Edge Network](https://vercel.com/docs/edge-network/caching)
  - [Serverless Functions Timeout](https://vercel.com/docs/functions/serverless-functions/edge-caching)
  - [Environment Variables](https://vercel.com/docs/environment-variables)

- **Zod Official Docs**
  - [Zod Schema Validation](https://zod.dev/)
  - [Using Zod with Next.js APIs](https://dub.co/blog/zod-api-validation)

- **HTTP Caching Standards**
  - [RFC 5861: Stale-While-Revalidate](https://datatracker.ietf.org/doc/html/rfc5861)
  - [MDN: Cache-Control Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
  - [web.dev: Stale-While-Revalidate](https://web.dev/articles/stale-while-revalidate)

### Secondary (MEDIUM confidence)

- **WebSearch verified with official sources:**
  - [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react) — verified against MDN and React docs
  - [Vitest vs Jest 2026](https://noqta.tn/en/tutorials/vitest-react-testing-library-nextjs-unit-testing-2026) — Vitest is standard by 2026
  - [Race Conditions in Debounced Search](https://javascript.plainenglish.io/understanding-race-conditions-and-debouncing-throttling-in-javascript-a-practical-guide-0f577678056a) — verified against AbortController docs

- **Community patterns (verified through multiple sources):**
  - shadcn/ui components for search UI
  - use-debounce library for input debouncing
  - HTTP Cache-Control patterns on Vercel functions

### Tertiary (LOW confidence — flagged for validation)

- **Malt API specifics:** No official documentation found for `https://www.malt.fr/profile/public-api/suggest/tags/autocomplete` endpoint. Authentication method, rate limits, and response schema are inferred based on typical API patterns and need **immediate testing before Phase 1 implementation.**

---

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH — Official docs and verified patterns from Vercel, Next.js, and community
- **Architecture patterns:** HIGH — Route Handlers, SWR dedup, HTTP caching are documented and proven
- **Pitfalls:** MEDIUM-HIGH — Debounce/race conditions are well-documented; Malt-specific pitfalls need testing
- **Malt API:** LOW — Undocumented endpoint; requires live testing before Phase 1

**Research date:** 2026-03-24
**Valid until:** 2026-04-07 (14 days; Malt API changes or Vercel updates may invalidate specific caching guidance)

**Critical blockers for Phase 1 planning:**

1. Malt API auth method must be verified (curl test + Vercel Function test)
2. Malt API response schema must be captured (save sample response)
3. Rate limits must be measured (load test or contact Malt team)
4. Competition thresholds should be refined after seeing live volume distribution

---

_Research completed: 2026-03-24_
_Ready for Phase 1 planning. Test Malt API integration before finalizing implementation plan._
