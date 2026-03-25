# Phase 4: Landing Page & Brand - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Transform the existing tool page into a full marketing landing page. Deliver: hero section with headline + subheadline, live social proof leaderboard above the search box, FAQ section, strategic CTA placement, post-verification success moment, and full mobile responsiveness. The search tool and email gate (Phase 1 + 2) remain intact — this phase wraps them in a complete product presentation.

</domain>

<decisions>
## Implementation Decisions

### Hero section

- **D-01:** Headline + subheadline above the fold — not a search-first layout. Marketing text comes first, then the leaderboard, then the search box
- **D-02:** Copy targets Malt freelancers specifically — references their pain point: wrong keywords = invisible profile = zero inbound contacts. Not generic "freelancers"
- **D-03:** Headline copy must pass Harry Dry's three tests: Can I visualize it? Can I falsify it? Can nobody else say it? Direction: zoom in from abstract ("optimize your profile") to concrete (a specific number, a specific situation a Malt freelancer recognizes). Exact copy is Claude's discretion — apply the test rigorously
- **D-04:** Navigation: Claude's discretion (minimal or none acceptable for v1)

### Social proof leaderboard (above search box)

- **D-05:** 4 keyword cards fetched live on page load — 1 random keyword per niche: tech, project management, design, devops
- **D-06:** Leaderboard format — ranked #1–4 with keyword label + volume count (number of Malt users). Reuses `KeywordCard` component or a leaderboard variant of it
- **D-07:** Positioned ABOVE the search box — first hook before the tool. Sequence: Hero → Leaderboard → CTA button → Search box → Results
- **D-08:** Live API calls on every page load (no static data). Numbers are real every visit — this is the proof the tool is live and useful

### CTA placement and behavior

- **D-09:** CTA button placed between leaderboard and search box — bridges "look at this data" to "now find yours"
- **D-10:** CTA label follows Harry Dry principles — concrete, visualizable, falsifiable, only this tool can say it. Direction: something that names the specific action and the specific outcome (e.g. references Malt users, skill count, or the ranking dynamic). NOT "Sign Up Free" or "Get Started"
- **D-11:** Clicking any CTA button before the gate fires → scroll nudge to search box with brief copy encouraging first search (e.g. "Try it — search any skill"). Does NOT immediately trigger the email form
- **D-12:** Additional CTA placements: below hero section, above FAQ — all use the same scroll-nudge behavior

### FAQ content

- **D-13:** 5 FAQ items:
  1. "Why are these numbers accurate?" → "Based on real Malt platform data — the same source Malt uses when you add a skill to your profile."
  2. "Can Malt shut this down?" → "The data exists on Malt's platform. We just make it searchable."
  3. "Will my email be sold?" → "Never. Unsubscribe in one click."
  4. "Is this tool free?" → Yes, completely free
  5. "How often is the data updated?" → Data is live — pulled fresh from Malt every time you search. Results reflect today's numbers

- **D-14:** FAQ tone: blunt, short answers. One Mississippi test applies — if it takes more than 2 seconds to absorb, rewrite it

### Post-verification success moment

- **D-15:** After clicking the email confirmation link, user sees a brief success state before the tool loads — not a silent redirect. Copy acknowledges the unlock ("You're in — start searching") before results appear
- **D-16:** Success moment is lightweight — not a full page. Inline state within the existing tool layout, then auto-resolves after 2–3 seconds or on first search

### Claude's Discretion

- Exact headline and subheadline copy (apply Harry Dry's three tests — concrete, falsifiable, only we can say it)
- CTA button exact label (apply same copy tests)
- Leaderboard visual design — spacing, rank indicator style, animation on load
- Success moment animation/timing
- Navigation bar design (if included)
- Mobile layout specifics
- FAQ accordion vs. static list

</decisions>

<specifics>
## Specific Ideas

### Harry Dry copy framework (apply to all headline and CTA copy)

Three tests for every sentence:

1. **Can I visualize it?** — If you close your eyes and can't see it, rewrite it. "Optimize your profile" → fail. "14,200 React developers on Malt — here's where you're rare" → pass
2. **Can I falsify it?** — Point, don't talk. Show a number, a name, a situation. "Great for freelancers" → fail. "366 Malt users claim this skill" → pass
3. **Can nobody else say this?** — If a competitor could sign the same line, rewrite it. Only this tool surfaces Malt occurrence counts in a searchable format — the copy should own that

### Malt freelancer pain points (research-informed — use these to sharpen copy)

The concrete situations this tool solves (zoom-in tested):

- Typing "développeur web" and seeing 12,000 competing profiles with no idea if that makes you invisible
- Spending Sunday updating their profile with 10 new skills — zero new contacts that month
- Profile title "Consultant Marketing" — identical to 4,000 others, no data on what niche phrase to own
- Debating "Webflow" vs "Framer" for weeks — no way to know which clients actually search
- Getting zero inbound contacts for 3 months after creating their profile

### Leaderboard hook logic

- Fires 4 parallel API calls to `/api/malt/autocomplete` on page load with 4 seed terms (1 per niche)
- Seed terms are randomised from a small hardcoded pool per niche so the leaderboard feels fresh across visits
- Example seeds: tech → ["React", "Python", "Node.js", "TypeScript"], design → ["Figma", "UX Design", "Webflow", "Branding"], project → ["Product Manager", "Scrum Master", "Agile", "Project Management"], devops → ["Docker", "Kubernetes", "AWS", "CI/CD"]

### Post-verification moment

- Triggered by `?verified=true` URL param (already handled in `page.tsx` `useEffect`)
- Currently calls `clearGate()` silently — this phase adds a brief success state before that transition

</specifics>

<canonical_refs>

## Canonical References

### Requirements

- `.planning/REQUIREMENTS.md` §Landing Page — LAND-01, LAND-02, LAND-03
- `.planning/ROADMAP.md` §Phase 4 — success criteria (6 items), dependency on Phase 1 + 2

### Prior phase decisions (locked — do not re-decide)

- `.planning/phases/02-email-capture-lead-gen/02-CONTEXT.md` — email gate UX, language (English), localStorage persistence, post-verification redirect with `?verified=true`

### Existing integration points

- `src/app/page.tsx` — current page structure; leaderboard + hero sections wrap around existing search + gate layout
- `src/components/KeywordCard.tsx` — reuse or extend for leaderboard cards
- `src/app/api/malt/autocomplete/route.ts` — leaderboard fires parallel calls here on page load
- `src/hooks/useSearch.ts` — CTA scroll nudge targets the search input managed here

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `KeywordCard`: renders label + volume + competition badge — directly reusable for leaderboard cards, possibly with a rank number prepended
- `useSearch` / SWR fetcher pattern: leaderboard can use the same fetch pattern with 4 parallel calls (no debounce needed — fires once on mount)
- `page.tsx` layout: `max-w-2xl mx-auto`, `min-h-screen bg-gradient-to-br from-white to-gray-50` — hero and FAQ sections follow same container width
- `layout.tsx`: Inter font, Indigo brand (`#6366F1`), existing OG metadata — update `<title>` and `<description>` to match new landing page copy

### Established Patterns

- All Malt API calls go through `/api/malt/autocomplete` — leaderboard follows same proxy pattern
- `"use client"` on page.tsx — leaderboard fetch (client-side on mount) fits naturally
- Tailwind utility classes throughout — no CSS modules; hero and FAQ sections use same approach

### Integration Points

- `page.tsx`: add hero section and leaderboard above existing `<SearchInput>` block; add FAQ section below `<EmailGate>`
- `useEffect` in `page.tsx`: existing `?verified=true` handler → extend to show success state before calling `clearGate()`
- CTA scroll nudge: `document.querySelector('input[type="search"]')?.scrollIntoView({ behavior: 'smooth' })` or ref-based

</code_context>

<deferred>
## Deferred Ideas

- A/B test of French vs. English headline copy — post-launch experiment
- "10K+ freelancers" style social proof number — requires tracking data not available in v1
- Animated keyword ticker (cycling display) — considered for leaderboard, deferred in favour of static leaderboard for simplicity
- Dashboard category tabs visible on landing page — Phase 3 content; do not integrate until Phase 3 ships
- Admin analytics dashboard (email list size, top searches) — v2, ANLT-04

</deferred>

---

_Phase: 04-landing-page-brand_
_Context gathered: 2026-03-25_
