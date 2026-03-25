# Phase 2: Email Capture & Lead Gen - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Gate full search results behind a GDPR-compliant email capture form that triggers on the user's 3rd search. Collect email via Resend, send confirmation email, unlock access after verification. Add a privacy policy page at `/privacy`. Landing page is Phase 4 — out of scope here.

</domain>

<decisions>
## Implementation Decisions

### Gate UX

- **D-01:** Blurred overlay — results are visible but blurred beneath the email form on the 3rd search
- **D-02:** The overlay appears over the results area (not a full-page modal); user can see they're missing data, creating urgency

### Search count persistence

- **D-03:** Track search count in `localStorage` only — resets on new browser or device, acceptable for v1
- **D-04:** Key: `malt_search_count` (integer). After 3rd search, gate triggers. After email verified, store `malt_unlocked: true` in localStorage to persist access

### Post-submit unlock

- **D-05:** Verify first — user must click confirmation link in email before results are unblocked
- **D-06:** After clicking the confirmation link, redirect to the app with a token/param that sets `malt_unlocked: true` in localStorage
- **D-07:** Until verified, show a "Check your inbox" holding state instead of blurred results

### Language

- **D-08:** All UI copy in English — gate headline, form labels, consent text, privacy policy, confirmation email

### GDPR consent

- **D-09:** Consent checkbox is NOT pre-checked; user must explicitly tick it
- **D-10:** Consent label: "I agree to receive occasional updates about this tool. Your email will never be sold." (or equivalent clear English)
- **D-11:** Form fields: email (required) + name (optional)

### Email service

- **D-12:** Resend for transactional email — confirmation email sent via Resend API route
- **D-13:** Confirmation email contains a single CTA link back to the app with a verification token

### Claude's Discretion

- Exact blur intensity (CSS `backdrop-filter: blur(Xpx)`)
- Token strategy for email verification (signed URL param or short-lived token stored server-side)
- Exact confirmation email copy and design
- Error states for Resend API failures
- Rate-limiting on the `/api/email/subscribe` route

</decisions>

<specifics>
## Specific Ideas

- Results are blurred (not hidden) — user sees data exists but can't read it, creating natural urgency to sign up
- "Check your inbox" state should feel lightweight, not a dead end — show the email address they submitted and a resend link

</specifics>

<canonical_refs>

## Canonical References

No external specs — requirements are fully captured in decisions above.

### Requirements

- `.planning/REQUIREMENTS.md` §Lead Generation — LEAD-01, LEAD-02, LEAD-03, LAND-04
- `.planning/ROADMAP.md` §Phase 2 — success criteria (6 items)

### Existing code (integration points)

- `src/hooks/useSearch.ts` — search count must be incremented here on each successful query
- `src/app/page.tsx` — gate overlay renders conditionally based on count + unlock state from localStorage
- `src/app/api/malt/autocomplete/route.ts` — no changes needed

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `useSearch` hook: already manages query + results state — search count increment fits here naturally
- `SearchInput` / `ResultsList` components: ResultsList will need a blur + overlay wrapper
- SWR fetcher pattern: reuse for `/api/email/subscribe` POST if needed (or plain fetch)
- Tailwind layout: existing `max-w-2xl mx-auto` container pattern — gate form follows same width

### Established Patterns

- All API calls go through `/api/malt/` routes — new `/api/email/subscribe` and `/api/email/verify` follow same pattern
- Zod schemas in `src/lib/schemas/` — add email request/response schemas there
- `"use client"` on page and hooks — gate logic is client-side (localStorage reads)

### Integration Points

- `useSearch.ts`: add `searchCount` state + localStorage sync + `isGated` boolean derived from count ≥ 3 && !unlocked
- `page.tsx`: render `<EmailGate>` overlay when `isGated === true`
- New: `src/app/api/email/subscribe/route.ts` — calls Resend API, returns 200
- New: `src/app/api/email/verify/route.ts` — validates token, returns redirect with `?verified=true`
- New: `src/app/privacy/page.tsx` — static privacy policy page

</code_context>

<deferred>
## Deferred Ideas

- Landing page (hero, social proof, FAQ) — Phase 4
- Admin dashboard showing email list size — v2 (ANLT-04)
- French language version of the gate / privacy policy — post-v1 if needed

</deferred>

---

_Phase: 02-email-capture-lead-gen_
_Context gathered: 2026-03-25_
