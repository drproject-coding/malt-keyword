# Phase 4 Planning Summary

**Date:** 2026-03-25
**Status:** Planning Complete
**Plans Created:** 3/3 (Wave 1, 2, 3)

---

## Overview

Phase 4 (Landing Page & Brand) planning is complete. Three executable PLAN.md files have been created, broken into waves for parallel execution. All plans respect 16 locked decisions from CONTEXT.md and implement 10 Wave 0 test stubs per VALIDATION.md requirements.

---

## Plans Created

### 04-01-PLAN.md — Wave 1: Foundation

**Objective:** Set up test infrastructure, create animations, build hero section and primary CTA, integrate into page structure.

**Wave:** 1 (no dependencies)
**Tasks:** 6
**Requirements:** LAND-01

**Task Breakdown:**

1. Create test stubs (Hero.test.ts, CTAButton.test.ts, landing.spec.ts)
2. Add fadeInUp/fadeOut CSS animations to globals.css
3. Create Hero component (headline + subheadline, centered)
4. Create CTAButton component (scroll-to-search on click)
5. Integrate Hero and CTAButton into page.tsx
6. Update SearchInput to support forwardRef

**Key Files Modified:**

- src/components/Hero.tsx (NEW)
- src/components/CTAButton.tsx (NEW)
- src/components/SearchInput.tsx (UPDATE for forwardRef)
- src/app/page.tsx (UPDATE integration)
- src/app/globals.css (ADD animations)

**Dependencies:** None

---

### 04-02-PLAN.md — Wave 2: Leaderboard

**Objective:** Build leaderboard hook and component with parallel API fetching, integrate into page structure between hero and CTA.

**Wave:** 2 (depends_on: 04-01)
**Tasks:** 4
**Requirements:** LAND-02

**Task Breakdown:**

1. Create useLeaderboard hook (Promise.all pattern, NICHE_SEEDS, random selection)
2. Create Leaderboard component (4 ranked cards, skeleton loading, stagger animation)
3. Integrate Leaderboard into page.tsx (between Hero and CTAButton)
4. Create test stubs (useLeaderboard.test.ts, Leaderboard.test.ts, leaderboard-animation.spec.ts)

**Key Files Modified:**

- src/hooks/useLeaderboard.ts (NEW)
- src/components/Leaderboard.tsx (NEW)
- src/app/page.tsx (UPDATE integration)

**Hook Pattern:**

- Selects 1 random seed per niche: tech, design, project, devops
- Fires 4 parallel fetches to `/api/malt/autocomplete`
- Returns { items, isLoading, error }

**Component Pattern:**

- Renders 4 ranked cards (#1-4) with keyword label and volume
- Skeleton during loading (4 pulse placeholders)
- Fade-in stagger: 0ms, 100ms, 200ms, 300ms delays

**Dependencies:** 04-01 (for animations and page integration pattern)

---

### 04-03-PLAN.md — Wave 3: Completion

**Objective:** Complete landing page with FAQ, success state, metadata, and URL cleanup for verification flow.

**Wave:** 3 (depends_on: 04-01, 04-02)
**Tasks:** 6
**Requirements:** LAND-03

**Task Breakdown:**

1. Create FAQ component (5 locked items from CONTEXT.md D-13)
2. Create SuccessState component (fade-in 300ms, auto-dismiss 2.5s, fade-out)
3. Update page.tsx for success state detection (?verified=true)
4. Integrate FAQ component into page.tsx
5. Update layout.tsx metadata (title, description)
6. Create test stubs (FAQ.test.ts, SuccessState.test.ts, success-state.spec.ts, cta-scroll.spec.ts)

**Key Files Modified:**

- src/components/FAQ.tsx (NEW)
- src/components/SuccessState.tsx (NEW)
- src/app/page.tsx (UPDATE success detection, URL cleanup)
- src/app/layout.tsx (UPDATE metadata)

**FAQ Items (Locked — D-13):**

1. Q: "Why are these numbers accurate?" A: "Based on real Malt platform data — the same source Malt uses when you add a skill to your profile."
2. Q: "Can Malt shut this down?" A: "The data exists on Malt's platform. We just make it searchable."
3. Q: "Will my email be sold?" A: "Never. Unsubscribe in one click."
4. Q: "Is this tool free?" A: "Yes, completely free."
5. Q: "How often is the data updated?" A: "Data is live — pulled fresh from Malt every time you search. Results reflect today's numbers."

**SuccessState Pattern:**

- Shows when ?verified=true is present in URL
- Displays: "✓ You're in — start searching"
- Auto-dismisses after 2.5 seconds
- Calls onDismiss to cleanup URL via window.history.replaceState()

**Dependencies:** 04-01 (animations), 04-02 (page integration pattern)

---

## Locked Decisions Respected

All 16 decisions from CONTEXT.md are honored in the plans:

| Decision | Title                                                                   | Plan         | Task              |
| -------- | ----------------------------------------------------------------------- | ------------ | ----------------- |
| D-01     | Hero above fold, before leaderboard                                     | 04-01        | Task 3, 5         |
| D-02     | Hero headline shows value proposition                                   | 04-01        | Task 3            |
| D-03     | Copy framework: Harry Dry (visualizable, falsifiable, unique)           | 04-01        | Task 3, 4         |
| D-04     | Leaderboard: 4 parallel API calls                                       | 04-02        | Task 1            |
| D-05     | Leaderboard: 4 niche seeds (tech, design, project, devops)              | 04-02        | Task 1            |
| D-06     | Leaderboard cards: fade-in stagger with 100ms delays                    | 04-02        | Task 2            |
| D-07     | Page sequence locked: Hero → Leaderboard → CTA → Search → Results → FAQ | 04-02, 04-03 | Integration tasks |
| D-08     | Leaderboard: fresh fetch on each page load (no SWR caching)             | 04-02        | Task 1            |
| D-09     | Leaderboard error handling: graceful degradation                        | 04-02        | Task 1, 2         |
| D-10     | CTA copy framework: Harry Dry                                           | 04-01        | Task 4            |
| D-11     | CTA behavior: scroll nudge before email gate (not email form trigger)   | 04-01        | Task 4, 5         |
| D-12     | Leaderboard position: between Hero and CTA                              | 04-02        | Task 3            |
| D-13     | FAQ: 5 exact items from CONTEXT.md (no edits allowed)                   | 04-03        | Task 1            |
| D-14     | Success state: visible only when ?verified=true                         | 04-03        | Task 3            |
| D-15     | Success state: auto-dismiss 2.5s with fade animation                    | 04-03        | Task 2            |
| D-16     | Success state: URL cleanup via replaceState                             | 04-03        | Task 3            |

---

## Wave 0 Test Stubs

Per VALIDATION.md, 10 test stub files are created across waves:

| File                                    | Wave | Plan  | Status |
| --------------------------------------- | ---- | ----- | ------ |
| src/components/Hero.test.ts             | 1    | 04-01 | STUB   |
| src/components/CTAButton.test.ts        | 1    | 04-01 | STUB   |
| tests/e2e/landing.spec.ts               | 1    | 04-01 | STUB   |
| src/hooks/useLeaderboard.test.ts        | 2    | 04-02 | STUB   |
| src/components/Leaderboard.test.ts      | 2    | 04-02 | STUB   |
| tests/e2e/leaderboard-animation.spec.ts | 2    | 04-02 | STUB   |
| src/components/FAQ.test.ts              | 3    | 04-03 | STUB   |
| src/components/SuccessState.test.ts     | 3    | 04-03 | STUB   |
| tests/e2e/success-state.spec.ts         | 3    | 04-03 | STUB   |
| tests/e2e/cta-scroll.spec.ts            | 3    | 04-03 | STUB   |

All stubs include import statements and describe/test block structure. Implementation details will be filled during execution.

---

## Dependency Graph

```
Wave 1 (04-01):
  - No dependencies
  - Creates: test stubs, animations, Hero, CTAButton, page structure

Wave 2 (04-02):
  - Depends on: 04-01 (animations, page structure)
  - Creates: useLeaderboard hook, Leaderboard component, integration
  - Consumed by: Wave 3

Wave 3 (04-03):
  - Depends on: 04-01 (animations, page integration pattern)
  - Depends on: 04-02 (page integration pattern)
  - Creates: FAQ, SuccessState, success detection, metadata

Final Sequence (after all waves):
Hero → Leaderboard → CTA → SearchInput → ResultsList → FAQ → SuccessState (on ?verified=true)
```

---

## Validation Strategy

**Automated Verification:**

- Unit tests: `npm test` (Vitest + @testing-library/react)
- E2E tests: `npm run test:e2e` (Playwright)
- Build: `npm run build` (no errors)

**Per-Wave Sampling:**

- After each task: `npm test`
- After each wave: `npm test && npm run test:e2e`

**Manual Verifications (per VALIDATION.md):**

- Harry Dry copy quality (headlines, CTA labels) — subjective
- Leaderboard visual stagger timing — CSS animation feel
- Success state auto-dismiss and fade transitions

---

## Next Steps

1. **Execute Wave 1** (04-01-PLAN.md):

   ```bash
   /gsd:execute-phase 04 --wave 1
   ```

2. **Execute Wave 2** (04-02-PLAN.md) after Wave 1 completes:

   ```bash
   /gsd:execute-phase 04 --wave 2
   ```

3. **Execute Wave 3** (04-03-PLAN.md) after Wave 2 completes:

   ```bash
   /gsd:execute-phase 04 --wave 3
   ```

4. **Verify Phase** after all waves:
   ```bash
   /gsd:verify-work 04
   ```

---

## Files

- `.planning/phases/04-landing-page-brand/04-01-PLAN.md` — 15.4 KB
- `.planning/phases/04-landing-page-brand/04-02-PLAN.md` — 15.9 KB
- `.planning/phases/04-landing-page-brand/04-03-PLAN.md` — 18.4 KB
- `.planning/ROADMAP.md` — Updated with Phase 4 plan summary

---

**Planning by:** Claude Sonnet 4.6
**Created:** 2026-03-25 16:24 UTC
**Status:** Complete and committed
