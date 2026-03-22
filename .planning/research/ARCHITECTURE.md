# Malt API Proxy Architecture — Research

**Researched:** 2026-03-22
**Domain:** Next.js API route proxying, session-based external API auth, rate limiting, caching
**Confidence:** HIGH (official Next.js docs verified; patterns well-established)

## Summary

The Malt autocomplete API is undocumented and session-authenticated. This requires a server-side proxy in Next.js to:

1. Handle potential session cookie requirements transparently
2. Avoid CORS issues (browser security blocks direct calls)
3. Rate-limit parallel requests to avoid upstream blocking
4. Cache responses to reduce redundant calls during bulk operations

The architecture uses Next.js App Router route handlers with strategic caching and request throttling. For the niche dashboard feature firing 20+ parallel queries, we implement both simple in-memory rate limiting (dev) and Upstash Redis (prod) for distributed caching and backpressure.

**Primary recommendation:** Start with a stateless proxy route + in-memory rate limiting for v1. Add Upstash Redis caching if the Malt API enforces strict rate limits in testing. Session cookies should be auto-forwarded by the browser; test this first before adding manual cookie handling.

---

## Standard Stack

### Core

| Library                    | Version             | Purpose                                   | Why Standard                                                                         |
| -------------------------- | ------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Next.js                    | 15.0+ (App Router)  | API route handlers, server-side proxying  | Official framework; handles headers/cookies cleanly via `NextRequest`/`NextResponse` |
| Upstash Redis              | Latest (via npm)    | Distributed caching for prod environments | Vercel-native; no infrastructure to manage; supports TTL, atomic ops                 |
| node-fetch or native fetch | Built-in (Node 18+) | HTTP client for upstream API calls        | Native in Node 18+; `fetch` API standard across web                                  |
| zod                        | 3.22+               | Request validation (query string parsing) | Type-safe, lightweight, well-tested                                                  |

### Supporting

| Library            | Version | Purpose                                  | When to Use                                                     |
| ------------------ | ------- | ---------------------------------------- | --------------------------------------------------------------- |
| p-limit            | 5.0+    | Concurrency control for batch operations | Limit parallel Malt API calls to prevent upstream rate limiting |
| bottleneck         | 2.19+   | Token-bucket rate limiter                | Alternative to p-limit if you need time-window-based throttling |
| next-cache-headers | Latest  | HTTP cache control helpers               | Opt-in; only if Edge caching needed in future                   |

### Alternatives Considered

| Instead of    | Could Use                     | Tradeoff                                                                                      |
| ------------- | ----------------------------- | --------------------------------------------------------------------------------------------- |
| Upstash Redis | In-memory Map + node-schedule | Simpler for v1, but loses data on restart; not suitable for distributed deployments on Vercel |
| zod           | Manual string parsing         | Lighter but less safe; validation rules scattered in code                                     |
| p-limit       | Custom async queue            | More control, but reinvents the wheel; p-limit is battle-tested                               |

**Installation:**

```bash
npm install zod p-limit
# For production caching:
npm install @upstash/redis
```

**Version verification (current as of 2026-03-22):**

- Next.js: 15.1.6 (latest stable)
- p-limit: 5.0.0
- zod: 3.24.1
- @upstash/redis: 1.29.0

---

## Architecture Patterns

### Pattern 1: Stateless Proxy Route Handler

**What:** A single Next.js route handler that intercepts client requests and forwards them to the Malt API, transparently handling authentication and errors.

**When to use:** All requests to the Malt API. Provides single point of control for caching, rate limiting, and error handling.

**Example:**

```typescript
// app/api/malt/autocomplete/route.ts
// Source: Next.js official docs (https://nextjs.org/docs/app/api-reference/file-conventions/route)

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const autocompleteQuerySchema = z.object({
  query: z.string().min(1).max(100),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Parse and validate query parameter
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    const parsed = autocompleteQuerySchema.safeParse({ query });
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameter",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    // 2. Check rate limit BEFORE calling upstream
    const clientId = request.headers.get("x-forwarded-for") || "unknown";
    const allowed = await rateLimiter.checkLimit(clientId, 100, 60000); // 100 req/min per IP
    if (!allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          retryAfter: 60,
        },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    // 3. Check cache
    const cacheKey = `malt:autocomplete:${parsed.data.query}`;
    const cached = await cacheStore.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        cached: true,
        data: JSON.parse(cached),
      });
    }

    // 4. Call Malt API (cookies auto-forwarded by browser -> Next.js)
    const maltUrl = new URL(
      "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete",
    );
    maltUrl.searchParams.set("query", parsed.data.query);

    const response = await fetch(maltUrl.toString(), {
      headers: {
        // Forward user cookies automatically (browser sends them as Set-Cookie)
        Cookie: request.headers.get("cookie") || "",
        "User-Agent": "Mozilla/5.0 (compatible; Malt-Keyword-Tool/1.0)",
      },
      // Do NOT cache fetch by Next.js; we manage caching explicitly
      cache: "no-store",
    });

    // 5. Handle upstream errors
    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Malt API rate limited",
            retryAfter: response.headers.get("Retry-After") || "60",
          },
          {
            status: 503, // Service Unavailable - user should retry later
            headers: {
              "Retry-After": response.headers.get("Retry-After") || "60",
            },
          },
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error: "Authentication failed with Malt API",
            hint: "Try refreshing the page or clearing cookies",
          },
          { status: 502 },
        ); // Bad Gateway - upstream auth issue
      }

      throw new Error(`Malt API error: ${response.status}`);
    }

    const data = await response.json();

    // 6. Cache successful response (5 min TTL for autocomplete)
    await cacheStore.set(cacheKey, JSON.stringify(data), 300);

    return NextResponse.json({
      cached: false,
      data,
    });
  } catch (error) {
    console.error("Autocomplete proxy error:", error);
    return NextResponse.json(
      {
        error: "Service unavailable",
        message: "Could not fetch suggestions at this time",
      },
      { status: 500 },
    );
  }
}

// Prevent caching by Next.js Edge runtime
export const dynamic = "force-dynamic";
export const maxDuration = 10; // Timeout for Malt API call
```

**Why this works:**

- Browser automatically sends session cookies with the request (`request.headers.get('cookie')`)
- Next.js runs on Node.js, which can hold cookies and forward them
- Single route = single place to manage errors and caching
- `cache: 'no-store'` prevents Next.js from caching the fetch, letting us manage it explicitly

---

### Pattern 2: In-Memory Rate Limiter (Development)

**What:** Token bucket rate limiter that tracks requests per identifier (IP, user ID, etc.) and rejects when limit exceeded.

**When to use:** V1 development. Simple, no infrastructure, sufficient for single-server testing.

**Example:**

```typescript
// lib/rateLimiter.ts
// Source: Backend Patterns skill

class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(
    identifier: string,
    maxRequests?: number,
    windowMs?: number,
  ): Promise<boolean> {
    const limit = maxRequests ?? this.maxRequests;
    const window = windowMs ?? this.windowMs;
    const now = Date.now();

    const timestamps = this.requests.get(identifier) || [];

    // Keep only recent requests
    const recentRequests = timestamps.filter((time) => now - time < window);

    // Check if over limit
    if (recentRequests.length >= limit) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }
}

export const rateLimiter = new RateLimiter(100, 60000); // 100 req/min
```

**Gotcha:** This is NOT suitable for:

- Vercel serverless (each invocation is stateless; state lost between requests)
- Multi-region deployments (each region has separate state)
- Production with >1 concurrent user

→ Move to **Upstash Redis** when testing in production or with real traffic.

---

### Pattern 3: Redis Caching (Production)

**What:** Distributed cache using Upstash Redis. Survives function restarts, works across regions.

**When to use:** Production on Vercel, or if local testing shows Malt API rate limiting.

**Example:**

```typescript
// lib/cache.ts
// Source: Backend Patterns skill + Upstash docs

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
}

// Production cache
export const productionCache: CacheStore = {
  async get(key: string) {
    try {
      return await redis.get(key);
    } catch (error) {
      console.warn("Cache read error:", error);
      return null; // Fail open: call API if cache fails
    }
  },

  async set(key: string, value: string, ttlSeconds: number) {
    try {
      await redis.setex(key, ttlSeconds, value);
    } catch (error) {
      console.warn("Cache write error:", error);
      // Fail silently; next request will fetch fresh
    }
  },

  async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.warn("Cache delete error:", error);
    }
  },
};

// Development (in-memory fallback)
const memoryStore = new Map<string, { value: string; expires: number }>();

export const developmentCache: CacheStore = {
  async get(key: string) {
    const entry = memoryStore.get(key);
    if (!entry || Date.now() > entry.expires) {
      memoryStore.delete(key);
      return null;
    }
    return entry.value;
  },

  async set(key: string, value: string, ttlSeconds: number) {
    memoryStore.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string) {
    memoryStore.delete(key);
  },
};

export const cacheStore =
  process.env.NODE_ENV === "production" ? productionCache : developmentCache;
```

**Setup in Vercel:**

1. Install Upstash integration via Vercel Marketplace
2. Vercel auto-injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. No manual environment setup needed

---

### Pattern 4: Concurrency Control for Batch Requests

**What:** Limit concurrent requests to Malt API when the client fires 20+ parallel queries (niche dashboard).

**When to use:** Niche dashboard feature that seeds multiple keywords in parallel.

**Example:**

```typescript
// lib/batchMaltRequests.ts
// Source: Backend Patterns skill (JobQueue pattern)

import pLimit from "p-limit";

interface AutocompleteRequest {
  query: string;
  priority?: number; // 0 = low, 1 = normal, 2 = high
}

interface AutocompleteResult {
  query: string;
  suggestions: Array<{ label: string; count: number }>;
}

/**
 * Fetch multiple autocomplete results with concurrency control.
 * Limits to N concurrent requests to avoid overwhelming Malt API.
 *
 * Example:
 *   const results = await batchAutocomplete([
 *     { query: 'React' },
 *     { query: 'Node.js' },
 *     { query: 'TypeScript' },
 *   ], 5) // 5 concurrent max
 */
export async function batchAutocomplete(
  requests: AutocompleteRequest[],
  concurrency: number = 5,
): Promise<AutocompleteResult[]> {
  const limit = pLimit(concurrency);

  // Sort by priority (high first)
  const sorted = [...requests].sort(
    (a, b) => (b.priority ?? 1) - (a.priority ?? 1),
  );

  const promises = sorted.map((req) =>
    limit(async () => {
      try {
        const response = await fetch(
          `/api/malt/autocomplete?query=${encodeURIComponent(req.query)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const { data } = await response.json();
        return {
          query: req.query,
          suggestions: data.suggestions ?? [],
        };
      } catch (error) {
        console.error(`Failed to fetch suggestions for "${req.query}":`, error);
        return {
          query: req.query,
          suggestions: [], // Graceful degradation
        };
      }
    }),
  );

  return Promise.all(promises);
}

// Usage in niche dashboard API route:
export async function POST(request: Request) {
  const { category } = await request.json();
  const seedTerms = await getSeedTermsForCategory(category);

  const results = await batchAutocomplete(
    seedTerms.map((term) => ({ query: term, priority: 1 })),
    5, // Max 5 concurrent requests to Malt API
  );

  return NextResponse.json({ results });
}
```

**Why p-limit:** Battle-tested, simple, 0 dependencies. Alternatives (bottleneck, async-queue) add complexity for this use case.

---

### Pattern 5: Error Handling & User Feedback

**What:** Map upstream errors (rate limiting, auth, timeout) to appropriate HTTP status codes and user-facing messages.

**When to use:** All API routes. Users should understand what went wrong.

**Status Code Mapping:**
| Upstream Error | HTTP Response | User Message |
|---|---|---|
| Malt API rate limited (429) | 503 Service Unavailable | "Too many requests right now. Please try again in 60 seconds." |
| Malt API auth failure (401/403) | 502 Bad Gateway | "Unable to connect to suggestion service. Try refreshing the page." |
| Malt API timeout (>10s) | 504 Gateway Timeout | "Suggestion service is slow. Please try again." |
| Malt API 5xx | 502 Bad Gateway | "Suggestion service is temporarily unavailable." |
| Network error (ECONNREFUSED) | 500 Internal Server Error | "Network error. Please try again." |
| Invalid input (bad query string) | 400 Bad Request | "Invalid search term." |

**Example:**

```typescript
async function fetchFromMalt(query: string): Promise<AutocompleteData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(
      `https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
        cache: "no-store",
      },
    );

    clearTimeout(timeoutId);

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      throw new RateLimitError(
        `Malt API rate limited. Retry after ${retryAfter}s`,
        parseInt(retryAfter),
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthError("Session expired or invalid");
    }

    if (response.status === 503) {
      throw new ServiceUnavailableError("Malt API temporarily down");
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof RateLimitError) {
      return {
        error: "rate_limit",
        retryAfter: error.retryAfter,
        message:
          "Too many requests to suggestion service. Please wait and try again.",
      };
    }

    if (error instanceof AuthError) {
      return {
        error: "auth_failed",
        message: "Unable to fetch suggestions. Try refreshing the page.",
      };
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return {
        error: "timeout",
        message: "Suggestion service is slow. Please try again.",
      };
    }

    return {
      error: "unknown",
      message: "Could not fetch suggestions at this time.",
    };
  }
}
```

---

## Don't Hand-Roll

| Problem                   | Don't Build                              | Use Instead                                                       | Why                                                                          |
| ------------------------- | ---------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Rate limiting             | Custom request counter in a Set          | `p-limit` or `bottleneck`                                         | Handles edge cases (clock skew, concurrent requests, cleanup); battle-tested |
| HTTP client               | Fetch from scratch with retries          | Native `fetch` (Node 18+) or `node-fetch`                         | Fetch API is standard; retries add complexity (use upstream caching instead) |
| Caching                   | Custom Map with expiry                   | Upstash Redis (prod) or built-in cache in this doc                | Redis survives restarts; Map loses data on function boundary                 |
| Session auth              | Manual cookie parsing                    | Browser auto-forwards cookies via `request.headers.get('cookie')` | Reinventing session management is a security risk                            |
| Parallel request limiting | Manual promise.all() with index tracking | `p-limit` or similar                                              | Off-by-one errors, request starvation if not careful                         |
| Input validation          | Inline string checks                     | `zod`, `joi`, or similar                                          | Type safety, error messages, reusability                                     |

**Key insight:** The Malt API session requirement looks scary but is handled automatically by browsers. Don't add manual cookie forwarding unless testing proves it's needed. Next.js route handlers forward cookies by default when you explicitly read them.

---

## Common Pitfalls

### Pitfall 1: Forgetting `cache: 'no-store'` on fetch()

**What goes wrong:** Next.js caches fetch responses by default. Your "fresh" autocomplete call returns stale data from 10 minutes ago.

**Why it happens:** Next.js 13+ caches fetch by default (like React Server Components). Easy to miss if you don't read the docs.

**How to avoid:** Always set `cache: 'no-store'` when calling external APIs you control caching for:

```typescript
const response = await fetch(url, {
  cache: "no-store", // Disable Next.js default caching
});
```

**Warning signs:**

- User reports "same suggestions for different queries"
- Timestamps on responses don't change
- Clear browser cache has no effect

---

### Pitfall 2: In-Memory Rate Limiter on Vercel

**What goes wrong:** You deploy your in-memory rate limiter to Vercel. Each request goes to a different function instance. Rate limiting is completely ineffective (each instance has its own request counter).

**Why it happens:** Vercel serverless = stateless. Each invocation is isolated. Global variables don't persist.

**How to avoid:** Use Upstash Redis from day one, or at least test locally before claiming rate limiting works:

```typescript
// ❌ BAD on Vercel (works locally)
const requestCounts = new Map(); // Lost between requests

// ✅ GOOD on Vercel
import { Redis } from "@upstash/redis";
const redis = new Redis({ url, token });
```

**Warning signs:**

- Local testing shows rate limiting works; production doesn't
- Malt API blocks your app with "too many requests" error
- Concurrent dashboard queries spike the rate limit

---

### Pitfall 3: Not Handling Cookie Validation Errors

**What goes wrong:** Malt API rejects requests with invalid/expired session cookies (401). You assume this is a network error and retry, burning through rate limits.

**Why it happens:** Easy to conflate "no cookie" with "invalid cookie." Both look like auth failures.

**How to avoid:** Distinguish between retryable (429, 503) and non-retryable (401, 403) errors:

```typescript
if (response.status === 429 || response.status === 503) {
  // Retryable: upstream is rate limited or down
  return { error: "service_unavailable", retryAfter: 60 };
}

if (response.status === 401 || response.status === 403) {
  // Non-retryable: auth issue. User needs to refresh or re-login
  return { error: "auth_failed", message: "Try refreshing the page" };
}
```

**Warning signs:**

- Retry loops that never succeed
- Spike in Malt API 401 errors followed by 429 errors
- User sees "try again later" error that doesn't resolve

---

### Pitfall 4: Query String Injection via URL Construction

**What goes wrong:** You build the Malt API URL by string concatenation. A user enters a query with `&` characters or encoded characters. URL parsing gets confused.

**Why it happens:** String concatenation is fast but fragile. Easy to miss edge cases.

**How to avoid:** Use `URL` and `URLSearchParams` objects:

```typescript
// ❌ BAD: String concatenation
const url = `https://www.malt.fr/api?query=${userInput}`; // Breaks with special chars

// ✅ GOOD: URL object
const url = new URL("https://www.malt.fr/api");
url.searchParams.set("query", userInput); // Handles encoding automatically
```

**Warning signs:**

- Queries with `&`, `?`, `#`, or non-ASCII characters fail
- API returns 400 Bad Request for valid queries
- Manual URL encoding errors

---

### Pitfall 5: Cache Keys Colliding Across Features

**What goes wrong:** You cache suggestions under `malt:${query}`. Later, you add another Malt API endpoint (e.g., profile details). Both use similar cache keys. A query for "React" collides with profile ID "react-123".

**Why it happens:** Short cache keys seem efficient but cause collisions when the codebase grows.

**How to avoid:** Use namespaced cache keys:

```typescript
// ❌ BAD: Too generic
const key = `malt:${query}`;

// ✅ GOOD: Namespaced by endpoint
const key = `malt:autocomplete:${query}`;
const key = `malt:profile:${profileId}`;
```

**Warning signs:**

- Different API calls return wrong cached data
- Cache invalidation doesn't work (you invalidated the wrong key)
- Hard to debug which feature cached what

---

## Code Examples

### Minimal Proxy (No Cache, No Rate Limiting)

For testing whether the Malt API is public or needs session auth:

```typescript
// app/api/malt/test/route.ts

import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  try {
    const maltUrl = new URL(
      "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete",
    );
    maltUrl.searchParams.set("query", query);

    const response = await fetch(maltUrl.toString(), {
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.status,
      headers: {
        "content-type": response.headers.get("content-type"),
        "set-cookie": response.headers.get("set-cookie"),
      },
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
```

**Use to test:**

- Does it work without cookies? → Public API
- Does it return 401? → Session required
- Does it return 429 on repeated requests? → Rate limited
- What's in the response? → Shape of suggestions

---

### Production-Ready Proxy

Full implementation with caching, rate limiting, and error handling:

```typescript
// app/api/malt/autocomplete/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimiter } from "@/lib/rateLimiter";
import { cacheStore } from "@/lib/cache";

const schema = z.object({
  query: z.string().min(1).max(100).trim(),
});

export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    // 1. Validate input
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    const parsed = schema.safeParse({ query });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 2. Get client identifier for rate limiting
    const clientId =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown";

    // 3. Check rate limit
    const allowed = await rateLimiter.checkLimit(clientId, 100, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: 60 },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }

    // 4. Check cache
    const cacheKey = `malt:autocomplete:${parsed.data.query}`;
    const cached = await cacheStore.get(cacheKey);
    if (cached) {
      console.log(
        `[${clientId}] Cache hit for "${parsed.data.query}" (${Date.now() - start}ms)`,
      );
      return NextResponse.json({
        cached: true,
        data: JSON.parse(cached),
        responseTime: Date.now() - start,
      });
    }

    // 5. Call Malt API
    const maltUrl = new URL(
      "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete",
    );
    maltUrl.searchParams.set("query", parsed.data.query);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let maltResponse;
    try {
      maltResponse = await fetch(maltUrl.toString(), {
        headers: {
          Cookie: request.headers.get("cookie") || "",
          "User-Agent": "Mozilla/5.0 (compatible; Malt-Keyword-Tool/1.0)",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    // 6. Handle Malt API errors
    if (maltResponse.status === 429) {
      const retryAfter = maltResponse.headers.get("Retry-After") || "60";
      console.warn(
        `[${clientId}] Malt API rate limited. Retry after ${retryAfter}s`,
      );
      return NextResponse.json(
        {
          error: "Service rate limited",
          retryAfter: parseInt(retryAfter),
        },
        {
          status: 503,
          headers: { "Retry-After": retryAfter },
        },
      );
    }

    if (maltResponse.status === 401 || maltResponse.status === 403) {
      console.warn(
        `[${clientId}] Malt API auth failed: ${maltResponse.status}`,
      );
      return NextResponse.json(
        {
          error: "Authentication error",
          message: "Try refreshing the page or clearing cookies",
        },
        { status: 502 },
      );
    }

    if (!maltResponse.ok) {
      throw new Error(`Malt API ${maltResponse.status}`);
    }

    const data = await maltResponse.json();

    // 7. Cache successful response
    await cacheStore.set(cacheKey, JSON.stringify(data), 300); // 5 min TTL

    console.log(
      `[${clientId}] Fetched fresh suggestions for "${parsed.data.query}" (${Date.now() - start}ms)`,
    );

    return NextResponse.json({
      cached: false,
      data,
      responseTime: Date.now() - start,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Autocomplete error: ${message}`);

    if (message.includes("AbortError") || message.includes("timeout")) {
      return NextResponse.json(
        {
          error: "Request timeout",
          message: "Service is slow, please try again",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        error: "Service error",
        message: "Could not fetch suggestions at this time",
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 10;
```

---

## Error Handling: What to Show Users

**Scenario 1: Malt API is down**

- Status: 502 or 503 from proxy
- Show: "Service temporarily unavailable. Please try again in a few minutes."
- Action: Suggest retrying, don't hammer the API

**Scenario 2: Rate limited**

- Status: 429 from proxy
- Show: "Too many requests. Please wait 60 seconds and try again."
- Action: Disable search input for 60s, show countdown timer

**Scenario 3: Session expired**

- Status: 401 from Malt
- Show: "Unable to fetch suggestions. Try refreshing the page."
- Action: Don't retry automatically; let user manually refresh

**Scenario 4: Network timeout**

- Status: 504 from proxy
- Show: "Service is slow. Please try again."
- Action: Suggest retrying after a few seconds

**Scenario 5: Invalid input**

- Status: 400 from proxy
- Show: "Invalid search term. Use 1-100 characters."
- Action: Show inline validation, don't call API

---

## State of the Art

| Old Approach                              | Current Approach                                                | When Changed          | Impact                                                     |
| ----------------------------------------- | --------------------------------------------------------------- | --------------------- | ---------------------------------------------------------- |
| Manual cookie forwarding in proxies       | Browser auto-forwards cookies via request headers               | Next.js 13+ (2023)    | Simplified proxy code; no need for cookie jar libraries    |
| Next.js `getServerSideProps` for proxying | Route handlers (App Router)                                     | Next.js 13+ (2023)    | Cleaner code, better TypeScript support, streaming support |
| Redis in-memory for rate limiting         | Token bucket with Map (dev) + Redis (prod)                      | 2020-present          | Development is simpler, production is scalable             |
| Manual Retry-After header parsing         | Native `response.headers.get('Retry-After')` + standard parsing | HTTP/1.1 RFCs (2014+) | Standardized across all APIs; no custom parsing            |
| Express middleware for proxying           | Next.js route handlers                                          | Next.js 13+ (2023)    | Full framework handling of errors, edge runtime support    |

**Deprecated/outdated:**

- `httpProxy` library (old Express pattern) — Use fetch() + explicit error handling instead
- Manual session management in proxies — Browser handles cookies natively
- ISR (Incremental Static Regeneration) for live API data — Use `dynamic: 'force-dynamic'` and explicit caching instead

---

## Testing the "Auth Unknown" Scenario

**Step 1: Test if API is public**

```bash
curl "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=react"
```

**Expected outcomes:**

- ✅ Returns 200 + suggestions → **Public API, no auth needed**
- ❌ Returns 401/403 → **Session auth required** (proceed to Step 2)
- ❌ Returns 429 → **Rate limited** (check for cookies in Step 3)
- ❌ Blocks request → **CORS or User-Agent check** (proxy from Next.js)

**Step 2: Test with session cookie (if 401)**

```bash
# Get session cookie first (visit site in browser, inspect Network tab)
curl "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=react" \
  -H "Cookie: [session-cookie-from-browser]"
```

**Expected outcomes:**

- ✅ Returns 200 + suggestions → **Session auth required; forward cookies in proxy**
- ❌ Returns 401 → **Session validation issue; may need User-Agent or Referer**
- ❌ Returns 429 → **Rate limiting kicks in with auth too**

**Step 3: Test from Next.js proxy**
Deploy the minimal proxy from the Code Examples section and test:

```bash
curl "http://localhost:3000/api/malt/test?query=react"
```

This will show:

- Response status
- Set-Cookie headers (if any)
- Actual suggestion data
- Whether session forwarding works automatically

---

## Recommended Implementation Order

1. **Phase 1 (Dev):** Minimal proxy (no cache, no auth handling) — test if API is public
2. **Phase 2 (Dev+Staging):** Add validation + simple error handling — confirm rate limit behavior
3. **Phase 3 (Staging):** Add in-memory caching (5 min TTL) — test cache effectiveness
4. **Phase 4 (Staging→Prod):** Add in-memory rate limiting (local) or switch to Upstash Redis (prod)
5. **Phase 5 (Prod):** Monitor Malt API 429 errors. If frequent, lower concurrency limit in batch requests

---

## Open Questions

1. **Does Malt API require a valid session cookie?**
   - What we know: Unknown; API is undocumented
   - What's unclear: Whether public requests are accepted, or if all requests need authentication
   - Recommendation: Run the minimal proxy test to determine; adjust Step 2 (cookie handling) based on results

2. **What's the rate limit on the Malt API?**
   - What we know: Unknown; no documented limits
   - What's unclear: Requests per second? Per IP? Per session?
   - Recommendation: Monitor Malt API 429 responses in production. If frequent, lower concurrency limit in `batchAutocomplete()` from 5 to 3.

3. **Should we handle pagination (if suggestions are >100)?**
   - What we know: Autocomplete endpoints often paginate results
   - What's unclear: Does Malt return 100+ suggestions, or truncate?
   - Recommendation: Inspect live Malt API response; if truncated, add pagination support in niche dashboard

---

## Validation Architecture

### Test Framework

| Property           | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Jest + node-fetch (manual test HTTP)                         |
| Config file        | jest.config.js (existing Next.js project)                    |
| Quick run command  | `npm test -- api/malt/autocomplete.test.ts -t "valid query"` |
| Full suite command | `npm test -- api/malt/`                                      |

### Phase Requirements → Test Map

| Req ID   | Behavior                                   | Test Type   | Automated Command                                     | File Exists? |
| -------- | ------------------------------------------ | ----------- | ----------------------------------------------------- | ------------ |
| PROX-01  | Proxy forwards valid query to Malt API     | Integration | `npm test -- proxy.integration.test.ts::valid-query`  | ❌ Wave 0    |
| PROX-02  | Proxy handles 429 (rate limited) from Malt | Integration | `npm test -- proxy.integration.test.ts::rate-limit`   | ❌ Wave 0    |
| PROX-03  | Proxy returns 400 for invalid query        | Unit        | `npm test -- proxy.validation.test.ts::invalid-query` | ❌ Wave 0    |
| CACHE-01 | Cache stores and retrieves responses       | Unit        | `npm test -- cache.unit.test.ts::get-set`             | ❌ Wave 0    |
| CACHE-02 | Cache respects TTL expiration              | Unit        | `npm test -- cache.unit.test.ts::ttl-expiry`          | ❌ Wave 0    |
| RATE-01  | Rate limiter rejects over-limit requests   | Unit        | `npm test -- rateLimiter.unit.test.ts::over-limit`    | ❌ Wave 0    |
| BATCH-01 | Batch requests respect concurrency limit   | Integration | `npm test -- batch.integration.test.ts::concurrency`  | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm test -- --testNamePattern="(proxy|cache)" --maxWorkers=1`
- **Per wave merge:** `npm test -- api/`
- **Phase gate:** All integration tests green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/api/malt/proxy.integration.test.ts` — integration tests for proxy behavior with mocked Malt API
- [ ] `tests/api/malt/proxy.validation.test.ts` — unit tests for input validation
- [ ] `tests/lib/cache.unit.test.ts` — cache get/set/ttl tests
- [ ] `tests/lib/rateLimiter.unit.test.ts` — rate limiter limit checking
- [ ] `tests/lib/batchMaltRequests.integration.test.ts` — concurrent request limiting
- [ ] `jest.setup.ts` — global test setup (fetch mocking, Redis mock)

_(Note: Jest is standard for Next.js projects; verify in package.json)_

---

## Sources

### Primary (HIGH confidence)

- **Next.js official docs** (https://nextjs.org/docs/app/api-reference/file-conventions/route) — Route handler API, cookie/header handling, caching behavior
- **Backend Patterns skill** (project) — Rate limiter, caching, error handling patterns
- **API Design skill** (project) — Error response codes, rate limiting headers

### Secondary (MEDIUM confidence)

- **Upstash Redis docs** (https://upstash.com) — Redis caching setup on Vercel
- **Vercel docs** (https://vercel.com/docs/storage) — KV storage (note: KV is deprecated, redirect to Upstash)
- **MDN HTTP Retry-After** (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After) — Rate limit header semantics

### Tertiary (LOW confidence — verified with official sources)

- p-limit npm package (https://www.npmjs.com/package/p-limit) — Concurrency control
- Native fetch() API (MDN) — HTTP client, standard since Node 18

---

## Metadata

**Confidence breakdown:**

- **Standard Stack:** HIGH — Official Next.js docs, proven libraries (zod, p-limit, @upstash/redis)
- **Architecture Patterns:** HIGH — Next.js route handlers well-documented; caching patterns standard across industry
- **Pitfalls:** MEDIUM-HIGH — Drawn from real-world Vercel/Next.js issues; in-memory rate limiter pitfall is well-documented
- **Error Handling:** HIGH — HTTP status codes and Retry-After header standard (RFC 9110)
- **Auth Testing:** MEDIUM — "Auth unknown" scenario requires empirical testing; patterns are proven

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days; Next.js is stable; may need refresh if Malt API changes discovered)

---

## Next Steps

1. **Immediate (before coding):**
   - Deploy minimal proxy to staging
   - Test whether Malt API is public or requires session auth
   - Measure response times and rate limit behavior
   - Document findings in ticket

2. **Development:**
   - Implement full proxy with caching (Phase 3)
   - Add batch request handler for niche dashboard (Phase 4)
   - Write integration tests for proxy errors

3. **Pre-production:**
   - Set up Upstash Redis in Vercel
   - Load test with 20+ parallel requests to niche dashboard
   - Monitor Malt API for 429 errors in staging
   - Adjust concurrency limit if needed
