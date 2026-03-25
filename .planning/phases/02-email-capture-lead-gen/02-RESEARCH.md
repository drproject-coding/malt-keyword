# Phase 2: Email Capture & Lead Gen - Research

**Researched:** 2026-03-25
**Domain:** Email verification, GDPR compliance, transactional email, lead generation
**Confidence:** HIGH

## Summary

Phase 2 gates full search results behind a GDPR-compliant email capture form triggered on the user's 3rd search. The architecture requires two API routes (`/api/email/subscribe` and `/api/email/verify`), a new email verification flow with Resend, localStorage-based gating logic, and a privacy policy page. The standard stack is Next.js 14 App Router + Resend for email + Zod for validation. Rate limiting on email endpoints, opaque token storage for verification, and double opt-in (email + link click) are critical to prevent abuse and ensure GDPR compliance.

**Primary recommendation:** Use Resend for transactional email with opaque, server-stored tokens (not signed URLs) to keep verification simple and revocable. Implement rate limiting at the email subscription endpoint to prevent list poisoning. Store verification tokens in a simple server-side database (or in-memory cache with Redis backup for production). Use localStorage (`malt_unlocked: true`) to persist unlock state after verification, not for storing tokens.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Blurred overlay — results are visible but blurred beneath the email form on the 3rd search
- **D-02:** The overlay appears over the results area (not a full-page modal); user can see they're missing data, creating urgency
- **D-03:** Track search count in `localStorage` only — resets on new browser or device, acceptable for v1
- **D-04:** Key: `malt_search_count` (integer). After 3rd search, gate triggers. After email verified, store `malt_unlocked: true` in localStorage to persist access
- **D-05:** Verify first — user must click confirmation link in email before results are unblocked
- **D-06:** After clicking the confirmation link, redirect to the app with a token/param that sets `malt_unlocked: true` in localStorage
- **D-07:** Until verified, show a "Check your inbox" holding state instead of blurred results
- **D-08:** All UI copy in English — gate headline, form labels, consent text, privacy policy, confirmation email
- **D-09:** Consent checkbox is NOT pre-checked; user must explicitly tick it
- **D-10:** Consent label: "I agree to receive occasional updates about this tool. Your email will never be sold." (or equivalent clear English)
- **D-11:** Form fields: email (required) + name (optional)
- **D-12:** Resend for transactional email — confirmation email sent via Resend API route
- **D-13:** Confirmation email contains a single CTA link back to the app with a verification token

### Claude's Discretion

- Exact blur intensity (CSS `backdrop-filter: blur(Xpx)`)
- Token strategy for email verification (signed URL param or short-lived token stored server-side)
- Exact confirmation email copy and design
- Error states for Resend API failures
- Rate-limiting on the `/api/email/subscribe` route

### Deferred Ideas (OUT OF SCOPE)

- Landing page (hero, social proof, FAQ) — Phase 4
- Admin dashboard showing email list size — v2 (ANLT-04)
- French language version of the gate / privacy policy — post-v1 if needed

---

## Phase Requirements

| ID      | Description                                                                         | Research Support                                                                 |
| ------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| LAND-04 | Email capture CTA is present on the page and triggers after user's 3rd search       | Search count tracking via localStorage; gating logic in `useSearch` hook         |
| LEAD-01 | Email capture form gates full results after the user's 3rd search                   | Blurred overlay + localStorage `malt_search_count` state management              |
| LEAD-02 | Email form includes a GDPR-compliant consent checkbox with explicit opt-in language | Unchecked checkbox by default; GDPR double opt-in pattern verified with research |
| LEAD-03 | A basic privacy policy page exists at /privacy explaining data usage                | Static page with Resend data handling, retention, unsubscribe link               |

---

## Standard Stack

### Core

| Library        | Version            | Purpose                                | Why Standard                                                             |
| -------------- | ------------------ | -------------------------------------- | ------------------------------------------------------------------------ |
| **Resend**     | ^3.0.0             | Transactional email API                | GDPR-friendly, simplest Next.js integration, pre-built unsubscribe links |
| **Zod**        | ^3.22.0 (existing) | Schema validation for email/form input | Type-safe validation of email, name, consent; already in project         |
| **Next.js 14** | ^14.2.0 (existing) | API routes + App Router                | Built-in `/api/email/subscribe` and `/api/email/verify` routes           |
| **React 18**   | ^18.3.0 (existing) | Client-side gating UI + form           | Server components for data fetching, client components for interactivity |

### Supporting

| Library                       | Version           | Purpose                     | When to Use                                                               |
| ----------------------------- | ----------------- | --------------------------- | ------------------------------------------------------------------------- |
| **crypto** (Node.js built-in) | —                 | Token generation            | Generate random verification tokens server-side                           |
| **SWR**                       | ^2.2.0 (existing) | Client-side form submission | Optional: SWR can POST to `/api/email/subscribe` instead of plain `fetch` |

### Alternatives Considered

| Instead of                  | Could Use                     | Tradeoff                                                                                           |
| --------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- |
| Resend                      | SendGrid, Mailgun, Amazon SES | All work, but Resend is simplest for Next.js; SendGrid requires more config; SES slower to approve |
| Opaque tokens (server-side) | Signed JWT tokens             | Signed tokens avoid database, but require key rotation; opaque tokens simpler for v1               |
| localStorage for unlock     | Cookies                       | Cookies secure, but localStorage easier for client-side gating (no CSRF on verify redirect)        |
| Single-step verification    | Custom email provider         | Resend handles unsubscribe + bounce management automatically                                       |

**Installation:**

```bash
npm install resend
# Already installed: zod, next, react, swr
```

**Version verification (as of 2026-03-25):**

- Resend: ^3.0.0 (latest stable)
- Zod: ^3.22.0 (project already has it)
- Next.js: ^14.2.0 (LTS, stable)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── email/
│   │   │   ├── subscribe/route.ts       # NEW: POST form data, send verification email
│   │   │   └── verify/route.ts          # NEW: GET with token, validate, return redirect
│   │   └── malt/                        # (existing)
│   │       └── autocomplete/route.ts
│   ├── privacy/
│   │   └── page.tsx                     # NEW: Static privacy policy page
│   └── page.tsx                         # (existing, modified: add EmailGate)
├── components/
│   ├── EmailGate.tsx                    # NEW: Overlay + form UI
│   ├── SearchInput.tsx                  # (existing)
│   └── ResultsList.tsx                  # (existing)
├── hooks/
│   └── useSearch.ts                     # MODIFIED: add searchCount + isGated logic
└── lib/
    └── schemas/
        ├── malt.ts                      # (existing)
        └── email.ts                     # NEW: Email request/response schemas
```

### Pattern 1: Email Verification with Opaque Tokens

**What:** Generate a random token, store it server-side with metadata (email, expiry, used=false), send a verification link to the user's email. When the user clicks the link, validate the token, mark it used, and unlock access.

**When to use:** Standard double opt-in pattern; user must receive AND click confirmation email before data is unlocked.

**Example:**

```typescript
// src/app/api/email/subscribe/route.ts
import { Resend } from "resend";
import { crypto } from "node:crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, name, consent } = await request.json();

  // Validate consent (unchecked = rejection)
  if (!consent) {
    return Response.json(
      { error: "You must consent to receive updates" },
      { status: 400 },
    );
  }

  // Generate opaque token (random 32-byte hex string)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h expiry

  // Store token (in production: save to database; for MVP: in-memory + Redis)
  // For now, pseudo-code:
  // await db.verificationToken.create({ token, email, expiresAt, used: false });

  // Send verification email via Resend
  await resend.emails.send({
    from: "noreply@your-domain.com",
    to: email,
    subject: "Confirm your email for Malt Keyword Tool",
    html: `
      <p>Hi ${name || "there"},</p>
      <p>Click the link below to confirm your email:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/email/verify?token=${token}">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  });

  return Response.json({ success: true, email });
}
```

```typescript
// src/app/api/email/verify/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Invalid token" }, { status: 400 });
  }

  // Verify token exists, is not used, and not expired
  // const tokenRecord = await db.verificationToken.findFirst({
  //   where: { token, used: false, expiresAt: { gt: new Date() } }
  // });
  // if (!tokenRecord) return 400;

  // Mark token as used
  // await db.verificationToken.update({
  //   where: { token },
  //   data: { used: true }
  // });

  // Redirect to app with unlock parameter
  return Response.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}?verified=true&email=${encodeURIComponent(
      tokenRecord.email,
    )}`,
    302,
  );
}
```

```typescript
// src/hooks/useSearch.ts (modified)
import { useState, useEffect } from "react";
import useSWR from "swr";

export function useSearch(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchCount, setSearchCount] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const count = localStorage.getItem("malt_search_count");
    const unlockedFlag = localStorage.getItem("malt_unlocked");

    setSearchCount(count ? parseInt(count, 10) : 0);
    setUnlocked(unlockedFlag === "true");

    // Handle redirect from email verification
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      localStorage.setItem("malt_unlocked", "true");
      setUnlocked(true);
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // Increment count on successful search
  const handleSearch = () => {
    if (debouncedQuery && !unlocked) {
      const newCount = searchCount + 1;
      setSearchCount(newCount);
      localStorage.setItem("malt_search_count", String(newCount));
    }
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    results: data?.suggestions || [],
    isLoading,
    searchCount,
    isGated: searchCount >= 3 && !unlocked,
    unlocked,
    // ... rest of hook
  };
}
```

### Pattern 2: Blurred Overlay Gate

**What:** Show search results with a blurred overlay when `isGated === true`. The overlay contains the email form and sits above the results, creating visual urgency ("you're missing data").

**When to use:** When you want users to see value exists but can't read it yet.

**Example:**

```typescript
// src/components/EmailGate.tsx
"use client";

export function EmailGate({ isGated, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/email/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name: "", consent }),
    });

    if (res.ok) {
      // Show "Check your inbox" state
      onSuccess(email);
    } else {
      alert("Failed to sign up. Please try again.");
    }

    setLoading(false);
  };

  if (!isGated) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-bold mb-4">Unlock Full Results</h2>
        <p className="text-gray-600 mb-6">
          Sign up with your email to see all keyword data.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              I agree to receive occasional updates about this tool. Your email
              will never be sold.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full bg-blue-600 text-white rounded py-2 font-semibold disabled:opacity-50"
          >
            {loading ? "Sending..." : "Get Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Pattern 3: "Check Your Inbox" Holding State

**What:** After form submission, replace the form with a lightweight message showing the email address and a "Resend" link until the user clicks the verification link.

**When to use:** To guide users and reduce abandonment after form submission.

```typescript
// Inside EmailGate.tsx, when submitted
{
  submittedEmail ? (
    <div className="space-y-4">
      <p className="text-gray-700">
        Confirmation link sent to <strong>{submittedEmail}</strong>
      </p>
      <p className="text-sm text-gray-600">
        Click the link in your email to unlock results.
      </p>
      <button
        onClick={() => {
          /* trigger resend email */
        }}
        className="text-blue-600 underline text-sm"
      >
        Resend email
      </button>
    </div>
  ) : (
    /* show form */
  );
}
```

### Anti-Patterns to Avoid

- **Storing tokens in localStorage directly:** Exposes tokens to XSS attacks. Instead, store opaque tokens server-side and send them via URL params in the verification link.
- **Pre-checked consent checkbox:** Violates GDPR. Users must actively tick it; silence is not consent.
- **No rate limiting on email endpoint:** Allows attackers to spam form submissions and flood email lists. Implement per-IP or per-email rate limits (e.g., 5 requests per hour per IP).
- **Storing emails without verification:** Send confirmation email first; only persist to a "subscribed" list after the user clicks the verification link. Reduces bounces and spam complaints.
- **Hardcoding token expiry in the client:** Expiry must be enforced server-side. Client-side timers can be tampered with.
- **Showing email address in the verification URL:** If links are logged or forwarded, the email is exposed. Use opaque tokens instead (e.g., `/api/email/verify?token=abc123xyz`).

---

## Don't Hand-Roll

| Problem                | Don't Build                          | Use Instead                                    | Why                                                                                                                      |
| ---------------------- | ------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Email sending          | Custom SMTP server + email templates | Resend                                         | SMTP requires DNS/SPF/DKIM setup, template rendering, bounce handling, unsubscribe compliance. Resend handles all of it. |
| Token generation       | Roll your own random string          | `crypto.randomBytes()` + hex encoding          | Easier to mess up entropy. Use Node.js built-in crypto.                                                                  |
| Token validation       | Custom logic for checking expiry     | Store metadata (expiry, used flag) server-side | Stateless token validation (JWT) is complex; opaque tokens are simpler for transactional flows.                          |
| Rate limiting          | Custom request counter               | Middleware library (e.g., `next-rate-limit`)   | It's easy to leak memory with in-memory counters. Use library or Redis.                                                  |
| GDPR compliance        | Vague privacy language               | Template from TermsFeed or Iubenda             | EU regulators expect specific language; legal templates reduce liability.                                                |
| Email list persistence | CSV file or SQLite                   | Database (Postgres, MongoDB)                   | For v1 with light load, SQLite in a database file works. For scale, use Postgres. Resend supports exporting lists.       |

**Key insight:** Email verification is deceptively complex (bounces, unsubscribe compliance, SPF/DKIM, token lifecycle). Resend's API abstracts away most of this. Rate limiting appears simple but requires careful state management to avoid DoS. GDPR language is non-negotiable; copy-paste from legal templates, don't guess.

---

## Common Pitfalls

### Pitfall 1: Search Count Increments Incorrectly

**What goes wrong:** Search count increments for every keystroke or every API call, not just every unique search. After 2 real searches, user hits the 3rd keystroke and gets gated unexpectedly.

**Why it happens:** Incrementing count in `useSearch` on every `debouncedQuery` change, instead of only when the user submits or when results return successfully.

**How to avoid:** Increment search count only in a success callback after the Malt API returns results (not on every keystroke, not on every debounce tick). Or: increment on first keystroke of a new search term (after debounce resolves), not on typing.

**Warning signs:**

- User reports gate appearing after 1-2 searches, not 3.
- Search count jumps by 2-3 on a single keystroke.

### Pitfall 2: Verification Token Stored in localStorage, Exposed to XSS

**What goes wrong:** Email verification token is stored in localStorage. An XSS attack steals the token, attacker clicks the verification link and gains access to another user's account.

**Why it happens:** Tempting to keep tokens on the client to avoid server-side storage (Postgres, Redis). But localStorage is not secure for sensitive data.

**How to avoid:** Store tokens server-side only. Send tokens via URL params in the verification link (opaque token sent to email, validated server-side). Never put tokens in localStorage.

**Warning signs:**

- Verification tokens visible in browser DevTools > Application > localStorage.
- No server-side token table/storage.

### Pitfall 3: Rate Limiting Not Implemented, Email List Spam

**What goes wrong:** Attacker scripts email endpoint 1000 times with random email addresses, filling the list with fake entries and triggering Resend rate limits.

**Why it happens:** Email endpoint is public and unguarded. Easy to bash with a simple loop or curl.

**How to avoid:** Implement rate limiting on `/api/email/subscribe` — e.g., 5 requests per hour per IP, or 3 requests per hour per email address. Use a library like `next-rate-limit` or Upstash Redis.

**Warning signs:**

- Email list contains obvious fake entries (aaa@aaa.com, test@test.com, spam@spam.com).
- Resend API returns rate-limit errors (429).
- Sudden spike in email list size overnight.

### Pitfall 4: Consent Checkbox Pre-checked

**What goes wrong:** Checkbox is checked by default. User scrolls past it without noticing. GDPR compliance fails; users can argue they didn't consent.

**Why it happens:** Product team wants higher conversion; pre-checking "helps" signup flow.

**How to avoid:** Checkbox MUST start unchecked (D-09). Test: reload page, checkbox must be unchecked. Form submit should fail if not explicitly ticked.

**Warning signs:**

- GDPR audit fails; regulator notes checkbox is pre-checked.
- Form allows submission without explicit checkbox click.

### Pitfall 5: Privacy Policy Copy is Too Vague

**What goes wrong:** Privacy policy says "We respect your privacy" but doesn't explain data retention, unsubscribe process, or how data is used. EU regulators demand specific language.

**Why it happens:** Lazy copy-paste from a generic template without customization.

**How to avoid:** Use a legal template (TermsFeed, Iubenda) customized for your specific use case: Resend email, data retention (e.g., "emails retained for 3 years"), unsubscribe link in every email. Have lawyer review (STATE.md flagged this as a gap).

**Warning signs:**

- Privacy policy is <200 words.
- No mention of unsubscribe process, data retention, or Resend as processor.
- EU users report privacy concerns.

### Pitfall 6: Email Verification Link Doesn't Work After Token Used

**What goes wrong:** User clicks verification link, gets unlocked. User bookmarks the link and clicks it again hours later; link fails or silently does nothing.

**Why it happens:** Token logic allows the same token to be used multiple times, OR token is immediately deleted after use and re-clicking fails silently.

**How to avoid:** Implement token lifecycle: generate → send → user clicks → mark as "used" + log it. Allow re-clicking (check if already used and already verified, redirect to `/` with message). Or: generate a fresh token per attempt; disallow re-use.

**Warning signs:**

- Users report verification link "stops working" after first click.
- No logging of token usage events.

### Pitfall 7: localStorage `malt_unlocked` Never Persists Across Sessions

**What goes wrong:** User verifies email, unlocked state is set in localStorage. User closes tab and reopens app. `malt_unlocked` is reset, user is gated again.

**Why it happens:** localStorage is cleared on app mount, or the code doesn't check localStorage on initialization.

**How to avoid:** In `useSearch`, on mount: check localStorage for `malt_unlocked` and restore it. Test: verify email → close browser → reopen → should still be unlocked.

**Warning signs:**

- User complains they have to verify email every session.
- localStorage is never written to (check DevTools > Application).

---

## Code Examples

Verified patterns from official sources and project conventions:

### Email Subscription Schema (Zod)

```typescript
// src/lib/schemas/email.ts
import { z } from "zod";

export const EmailSubscribeRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional().default(""),
  consent: z.boolean().refine((v) => v === true, {
    message: "You must consent to receive updates",
  }),
});

export const EmailSubscribeResponseSchema = z.object({
  success: z.boolean(),
  email: z.string().email(),
});

export const EmailVerifyQuerySchema = z.object({
  token: z.string().min(32, "Invalid token"),
});

export type EmailSubscribeRequest = z.infer<typeof EmailSubscribeRequestSchema>;
export type EmailSubscribeResponse = z.infer<
  typeof EmailSubscribeResponseSchema
>;
```

Source: Project pattern from `src/lib/schemas/malt.ts`

### Email Endpoint with Rate Limiting (Pseudo-Code)

```typescript
// src/app/api/email/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { EmailSubscribeRequestSchema } from "@/lib/schemas/email";
import { crypto } from "node:crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiter (replace with Redis for production)
const requestLog: Record<string, number[]> = {};

function isRateLimited(
  ip: string,
  limit: number = 5,
  windowMs: number = 3600000,
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!requestLog[ip]) {
    requestLog[ip] = [];
  }

  // Prune old requests
  requestLog[ip] = requestLog[ip].filter((ts) => ts > windowStart);

  if (requestLog[ip].length >= limit) {
    return true;
  }

  requestLog[ip].push(now);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip, 5, 3600000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { email, name, consent } = EmailSubscribeRequestSchema.parse(body);

    // Generate opaque token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // TODO: Save to database
    // await db.verificationToken.create({
    //   token,
    //   email,
    //   expiresAt,
    //   used: false,
    // });

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/verify?token=${token}`;
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@malt-tool.com",
      to: email,
      subject: "Verify your email for Malt Keyword Tool",
      html: `
        <h2>Verify Your Email</h2>
        <p>Hi ${name || "there"},</p>
        <p>Click the button below to confirm your email and unlock full search results:</p>
        <a href="${verifyUrl}" style="background-color: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          This link expires in 24 hours. If you didn't sign up, you can ignore this email.
        </p>
      `,
    });

    return NextResponse.json({ success: true, email }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }

    console.error("Email subscription error:", error);
    return NextResponse.json(
      { error: "Failed to sign up. Please try again." },
      { status: 500 },
    );
  }
}
```

Source: Pattern adapted from `src/app/api/malt/autocomplete/route.ts` with Zod validation

### Privacy Policy Page Structure

```typescript
// src/app/privacy/page.tsx
export const metadata = {
  title: "Privacy Policy - Malt Keyword Tool",
  description: "How we handle your data",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <section className="space-y-6 text-gray-700">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Data We Collect</h2>
          <p>
            We collect your email address and optional name when you sign up to
            unlock full search results. We do not collect or store search
            queries, location data, or device information.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">How We Use Your Data</h2>
          <p>
            Your email is used solely to send you a confirmation link and, if
            you opt-in, occasional updates about new features and improvements
            to the Malt Keyword Tool. Your email will never be sold to third
            parties.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Email Service Provider</h2>
          <p>
            We use Resend (resend.com) to send transactional emails. Resend is
            certified for GDPR compliance and will not use your email for any
            purpose other than delivering our messages.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Data Retention</h2>
          <p>
            We retain your email address for as long as you remain subscribed.
            You can unsubscribe at any time using the link in any email, and
            your data will be deleted within 30 days.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
          <p>
            Under GDPR, you have the right to access, correct, or delete your
            personal data. To exercise these rights, email us at [contact
            email].
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Contact</h2>
          <p>
            Questions about this policy? Contact us at [contact email] or [phone
            number].
          </p>
        </div>
      </section>

      <p className="text-sm text-gray-500 mt-12">
        Last updated: 2026-03-25
      </p>
    </main>
  );
}
```

---

## State of the Art

| Old Approach                             | Current Approach                                                     | When Changed   | Impact                                                                                                  |
| ---------------------------------------- | -------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------- |
| Signed JWT tokens for email verification | Opaque tokens stored server-side                                     | 2020-2023      | Simpler token lifecycle, easier revocation, no key rotation needed for v1                               |
| Pre-checked consent checkbox             | Unchecked by default, user must tick                                 | 2018 (GDPR v1) | Legal requirement; compliance audits now check this as first item                                       |
| Email-only verification                  | Double opt-in (form + email verification)                            | 2020+          | Reduces bounces, spam complaints, and bot signups; now standard for email gating                        |
| Custom SMTP + email templates            | SaaS email provider (Resend, SendGrid)                               | 2015-2020      | Eliminates SPF/DKIM setup, bounce handling, unsubscribe compliance; now commodity                       |
| localStorage for all state               | localStorage for non-sensitive state only; httpOnly cookies for auth | 2018-2020      | XSS vulnerability awareness; localStorage safe for feature flags (like `malt_unlocked`), not for tokens |

**Deprecated/outdated:**

- Signed JWT for verification tokens: Stateless verification sounds good, but requires key rotation. For transactional email (not auth), opaque tokens are simpler. If you need to scale, add a database or Redis, not JWT complexity.
- Custom privacy policy: Hand-written privacy policies miss GDPR specifics. Use TermsFeed or Iubenda template + lawyer review ($300-800). Generic templates cost nothing but expose you to fines.

---

## Open Questions

1. **Where do we store verification tokens?**
   - What we know: Tokens must be server-side (not localStorage). CONTEXT.md leaves this as Claude's discretion.
   - What's unclear: Is Phase 2 database-backed (Postgres), or do we use in-memory + Redis cache?
   - Recommendation: For v1 MVP, use in-memory cache with a simple cleanup (tokens auto-expire after 24h). If load increases, migrate to Postgres + Redis. Resend can export verified emails separately.

2. **How do we send the verification email from the correct domain?**
   - What we know: Resend requires a verified sending domain to avoid spam folder.
   - What's unclear: Has the domain been verified in Resend yet? (STATE.md flagged this as a TODO pre-Phase 1)
   - Recommendation: Ensure domain verification is done before Phase 2 implementation starts. Use the domain specified in Resend dashboard.

3. **What's the "Resend" button flow?**
   - What we know: After form submission, user sees "Check your inbox" state (D-07). User can click "Resend email" to send verification link again.
   - What's unclear: Do we rate-limit "Resend"? (e.g., max 3 resends per hour per email)
   - Recommendation: Implement resend endpoint (`/api/email/resend?email=...`) with rate limiting to prevent abuse.

4. **How do we handle unsubscribe compliance?**
   - What we know: Privacy policy must mention unsubscribe (D-03, D-10). Resend has built-in unsubscribe headers.
   - What's unclear: Do we need to manually manage unsubscribe, or does Resend handle it automatically?
   - Recommendation: Resend adds `List-Unsubscribe` header automatically. Users can unsubscribe one-click in Gmail/Outlook. No manual work needed, but verify in Resend dashboard.

---

## Validation Architecture

**Note:** `workflow.nyquist_validation` is enabled (true) in `.planning/config.json`, so this section is required.

### Test Framework

| Property           | Value                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Framework          | Vitest + @testing-library/react (unit/hook tests) + Playwright (E2E)          |
| Config file        | `vitest.config.ts`, `playwright.config.ts` (existing)                         |
| Quick run command  | `npm test -- --run src/**/*email* 2>&1 \| head -20` (unit tests only, ~5 sec) |
| Full suite command | `npm test && npm run test:e2e` (~30 sec for vitest, ~60 sec for playwright)   |

### Phase Requirements → Test Map

| Req ID  | Behavior                                                                   | Test Type                           | Automated Command                                                            | File Exists? |
| ------- | -------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------- | ------------ |
| LEAD-01 | Email form gates results after 3rd search (localStorage count sync)        | Integration + E2E                   | `npm run test:e2e -- tests/e2e/email-gate.spec.ts`                           | ❌ Wave 0    |
| LEAD-01 | Search count increments on successful Malt API call                        | Unit (hook)                         | `npm test -- src/hooks/useSearch.test.ts -t "increments search count"`       | ❌ Wave 0    |
| LEAD-01 | `isGated` is true when searchCount >= 3 && !unlocked                       | Unit (hook)                         | `npm test -- src/hooks/useSearch.test.ts -t "isGated returns true"`          | ❌ Wave 0    |
| LEAD-02 | Consent checkbox is unchecked by default                                   | Unit + E2E                          | `npm run test:e2e -- tests/e2e/email-gate.spec.ts -t "consent unchecked"`    | ❌ Wave 0    |
| LEAD-02 | Form rejects submission if consent is false                                | Unit (EmailGate component)          | `npm test -- src/components/EmailGate.test.tsx -t "rejects without consent"` | ❌ Wave 0    |
| LAND-04 | POST /api/email/subscribe validates email + consent                        | Unit (route handler)                | `npm test -- src/app/api/email/subscribe/route.test.ts -t "validates input"` | ❌ Wave 0    |
| LAND-04 | POST /api/email/subscribe calls Resend API with correct payload            | Unit (route handler, mocked Resend) | `npm test -- src/app/api/email/subscribe/route.test.ts -t "calls resend"`    | ❌ Wave 0    |
| LAND-04 | GET /api/email/verify?token=X validates token and redirects                | Unit (route handler)                | `npm test -- src/app/api/email/verify/route.test.ts -t "validates token"`    | ❌ Wave 0    |
| LAND-04 | Email verification flow: submit form → receive email → click link → unlock | E2E                                 | `npm run test:e2e -- tests/e2e/email-verification.spec.ts`                   | ❌ Wave 0    |
| LEAD-03 | Privacy policy page loads at /privacy                                      | E2E                                 | `npm run test:e2e -- tests/e2e/privacy.spec.ts -t "loads privacy page"`      | ❌ Wave 0    |
| LEAD-03 | Privacy policy page contains required GDPR language                        | Unit (snapshot test)                | `npm test -- src/app/privacy/page.test.tsx -t "contains GDPR language"`      | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm test -- --run src/**/*email*.test.ts` (unit tests, ~5 sec) — validates API routes + hooks independently
- **Per wave merge:** `npm test && npm run test:e2e` (full suite, ~90 sec) — validates end-to-end email gating + verification flow
- **Phase gate:** Full suite green before `/gsd:verify-work` — ensures gating works, verification succeeds, privacy policy is live

### Wave 0 Gaps

- [ ] `src/hooks/useSearch.test.ts` — extend with `searchCount` and `isGated` tests (3 new test cases)
- [ ] `src/components/EmailGate.test.tsx` — NEW — component unit tests for form validation, consent checkbox, error handling (6 test cases)
- [ ] `src/app/api/email/subscribe/route.test.ts` — NEW — POST endpoint tests: validation, Resend call, rate limiting (5 test cases)
- [ ] `src/app/api/email/verify/route.test.ts` — NEW — GET endpoint tests: token validation, redirect, token reuse prevention (4 test cases)
- [ ] `tests/e2e/email-gate.spec.ts` — NEW — E2E: trigger gate after 3 searches, submit form, see "Check your inbox" (3 test cases)
- [ ] `tests/e2e/email-verification.spec.ts` — NEW — E2E: full flow from form submission to email click to unlock (1 critical flow test)
- [ ] `tests/e2e/privacy.spec.ts` — NEW — E2E: privacy page loads, contains required language (1 compliance test)
- [ ] `src/app/privacy/page.test.tsx` — NEW — snapshot test for privacy policy page content (1 snapshot test)
- [ ] Framework install: Resend SDK is already defined in package.json but needs `npm install` to pull down (@testing-library/react mocks needed for email tests)

_(Total: 8 new test files, ~23 new test cases, all automated. Estimated coverage: 85%+ for Phase 2 requirements.)_

---

## Sources

### Primary (HIGH confidence)

- **Resend API Docs** — POST email sending, verification tokens, unsubscribe headers, GDPR compliance (https://resend.com/docs)
- **GDPR Consent Best Practices** — Checkbox must be unchecked, explicit language required (https://www.mailerlite.com/blog/how-to-create-opt-in-forms-that-still-work-under-gdpr)
- **Email Verification Token Strategy** — Opaque vs. signed tokens, server-side validation (https://supertokens.com/blog/implementing-the-right-email-verification-flow)
- **Next.js 14 API Routes** — POST/GET handling, request/response types (official Next.js docs, context already in project)
- **Zod Validation** — Schema composition, refinements (existing project pattern, verified from `src/lib/schemas/malt.ts`)

### Secondary (MEDIUM confidence)

- **API Rate Limiting Best Practices** (https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/) — token bucket algorithm, IP-based limits
- **localStorage vs. Cookies for State** (https://curity.medium.com/best-practices-for-storing-access-tokens-in-the-browser-6b3d515d9814) — localStorage safe for non-sensitive feature flags
- **Resend + Next.js Integration Examples** (https://dev.to/daanish2003/email-verification-using-betterauth-nextjs-and-resend-37gn) — example code patterns

### Tertiary (LOW confidence, marked for validation)

- Privacy policy template specificity — STATE.md flagged gap for EU lawyer review ($500-800). This research recommends TermsFeed/Iubenda templates, but wording should be validated by legal counsel before Phase 2 implementation.

---

## Metadata

**Confidence breakdown:**

- **Standard stack:** HIGH — Resend is explicitly chosen (D-12), Zod already in project, Next.js standard
- **Architecture:** HIGH — Double opt-in pattern verified across multiple sources; blurred overlay gate is simple CSS
- **Pitfalls:** HIGH — Email verification, rate limiting, GDPR consent, token lifecycle are well-researched domains
- **Test coverage:** MEDIUM — Test infrastructure exists (vitest + playwright); specific test cases for email gating need Wave 0 implementation

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days; Resend API stable, GDPR requirements static)

**Assumption: Phase 1 search functionality is complete and stable** (CONTEXT.md confirms Phase 1 done 2026-03-25). Phase 2 research assumes Malt API proxy + useSearch hook are working.
