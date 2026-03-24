# Phase 1: Search Foundation — Planning Complete

**Date:** 2026-03-24
**Status:** Ready for execution
**Plans:** 3 plans in 2 waves + 1 Wave 0 setup

---

## Planning Overview

Phase 1 Search Foundation has been decomposed into **three executable plans** covering infrastructure, backend logic, and UI implementation.

| Plan  | Wave | Tasks | Focus                                              | Depends On |
| ----- | ---- | ----- | -------------------------------------------------- | ---------- |
| 01-01 | 0    | 6     | Test infrastructure setup                          | —          |
| 01-02 | 1    | 4     | Backend implementation (API proxy, schemas, hooks) | 01-01      |
| 01-03 | 2    | 5     | UI components + Vercel deployment                  | 01-02      |

---

## Requirements Mapping

All 7 Phase 1 requirements are covered across the three plans:

| Requirement  | Type           | Plan                                                       | Focus                                                                  |
| ------------ | -------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| **SRCH-01**  | Search         | Live debounced search (300ms)                              | 01-02 Task 4 (useSearch hook), 01-03 Task 2 (page integration)         |
| **SRCH-02**  | Search         | Volume count display                                       | 01-03 Task 1 (KeywordCard), 01-03 Task 2 (ResultsList)                 |
| **SRCH-03**  | Search         | 5–10 related keyword suggestions                           | 01-02 Task 3 (API route), 01-03 Task 2 (ResultsList)                   |
| **SRCH-04**  | Search         | Color-coded competition signal (rare/common/oversaturated) | 01-02 Task 1 (competition logic), 01-03 Task 1 (KeywordCard rendering) |
| **INFRA-01** | Infrastructure | API proxy (server-side, no CORS)                           | 01-02 Task 3 (route handler with validation)                           |
| **INFRA-02** | Infrastructure | HTTP caching (60s edge cache)                              | 01-02 Task 3 (Cache-Control headers)                                   |
| **INFRA-03** | Infrastructure | Vercel deployment + <1s response                           | 01-03 Task 4 (deployment), 01-03 Task 5 (E2E verification)             |

---

## Wave Structure & Dependencies

```
Wave 0: Test Infrastructure (01-01)
  ↓
  Installs Vitest, creates test stubs for all features
  Gates: Must complete before Wave 1 implementation

Wave 1: Backend Implementation (01-02)
  ↓
  Implements API proxy, validation schemas, color logic, useSearch hook
  Tests transition from RED → GREEN
  Creates: 4 backend files + schemas

Wave 2: UI & Deployment (01-03)
  ↓
  Builds React components, integrates with backend, deploys to Vercel
  Creates: 5 UI files + configuration
  Checkpoints: 2 human verifications (UI correctness, deployment readiness)
```

---

## Plan Details

### Plan 01-01: Wave 0 — Test Infrastructure Setup

**Purpose:** Establish test-first foundation so implementation can run tests after each commit.

**Tasks:**

1. Install Vitest + jsdom + TypeScript configuration
2. Create test stubs for competition color logic (SRCH-04)
3. Create test stubs for useSearch hook (SRCH-01)
4. Create test stubs for KeywordCard component (SRCH-02, SRCH-04)
5. Create test stubs for API proxy route (INFRA-01, INFRA-02, SRCH-03)
6. Create E2E test stubs for Vercel deployment (INFRA-03)

**Files Created:**

- `vitest.config.ts` — Test runner configuration
- `src/lib/utils/competition.test.ts` — 6 test stubs
- `src/hooks/useSearch.test.ts` — 5 test stubs
- `src/components/KeywordCard.test.ts` — 5 test stubs
- `src/app/api/malt/autocomplete/route.test.ts` — 8 test stubs
- `tests/e2e/search.spec.ts` — 4 E2E test stubs

**Success Criteria:**

- npm run test and npm run test:watch work without errors
- All test files parse and are runnable
- Test suite completes in <60s
- Wave 0 gates Wave 1 (must be complete before implementation)

---

### Plan 01-02: Wave 1 — Backend Implementation

**Purpose:** Build API proxy, validation logic, color-coding system, and client-side search hook.

**Tasks:**

1. Create competition color logic utilities
   - `getCompetitionLevel(volume)` → 'rare' | 'common' | 'oversaturated'
   - `getCompetitionColor(level)` → Tailwind classes
   - Thresholds: rare <10, common 10-100, oversaturated >100

2. Create Zod schemas for Malt API validation
   - Request schema: `{ q: string (min 2 chars) }`
   - Response schema: `{ suggestions: [{ label: string, volume?: number }] }`
   - Type inference for TypeScript

3. Implement API proxy route handler
   - GET `/api/malt/autocomplete?q=react`
   - Validates input, forwards to Malt endpoint
   - Returns Cache-Control header: `max-age=0, s-maxage=60, stale-while-revalidate=300`
   - Error handling: timeouts (5s), invalid responses, user-friendly messages

4. Implement useSearch hook
   - 300ms debounce (client-side)
   - SWR deduplication (300ms window)
   - Returns: query, debouncedQuery, results, isLoading, isError

**Files Created:**

- `src/lib/utils/competition.ts` (30 lines)
- `src/lib/schemas/malt.ts` (25 lines)
- `src/app/api/malt/autocomplete/route.ts` (60 lines)
- `src/hooks/useSearch.ts` (50 lines)

**Test Coverage:**

- 6/6 competition tests pass
- 5/5 useSearch tests pass
- 8/8 route handler tests pass
- Total: 19 tests passing (RED → GREEN)

**Success Criteria:**

- API proxy validates input and forwards to Malt
- Response includes Cache-Control headers
- useSearch debounces by 300ms
- SWR deduplicates within window
- Error states handled gracefully
- All tests passing

---

### Plan 01-03: Wave 2 — UI Components & Vercel Deployment

**Purpose:** Build complete search UI and deploy to Vercel.

**Tasks:**

1. Implement SearchInput and KeywordCard components
   - SearchInput: input + search icon, placeholder "Ex : développeur React, UX designer..."
   - KeywordCard: displays keyword + volume count + competition badge with correct colors
   - Min height 44px, padding 16px, responsive layout

2. Implement ResultsList component and integrate with page
   - ResultsList: container with loading spinner, error message, empty state
   - page.tsx: main search page using useSearch hook
   - Layout: centered, max-width 2xl, "Find High-Value Keywords" header

3. Configure layout, metadata, and Tailwind CSS
   - layout.tsx: metadata, Inter font, Tailwind setup
   - tailwind.config.ts: shadcn/ui defaults, accent color #6366F1
   - next.config.ts: strict mode, image optimization

4. Deploy to Vercel
   - Create Vercel account, link GitHub repo
   - Auto-detects Next.js project
   - Assigns public URL (e.g., https://{project}.vercel.app)
   - Verifies deployment and response time <1s

5. Run E2E tests against live Vercel deployment
   - Tests page loads, search works, error handling
   - Verifies response time <1s with Playwright

**Checkpoints:**

- **After Task 2:** Human verifies UI works correctly at localhost:3000
  - Search produces results
  - Colors are correct for competition levels
  - Loading/error states display
- **After Task 3:** Human verifies build and local dev work
  - npm run dev succeeds
  - npm run build completes without errors

**Files Created:**

- `src/components/SearchInput.tsx` (30 lines)
- `src/components/KeywordCard.tsx` (45 lines)
- `src/components/ResultsList.tsx` (50 lines)
- `src/app/page.tsx` (60 lines)
- `src/app/layout.tsx` (35 lines)
- `tailwind.config.ts` (25 lines)
- `next.config.ts` (15 lines)
- `.env.example`

**Success Criteria:**

- SearchInput renders with placeholder and icon
- KeywordCard displays volume + color-coded badge
- ResultsList handles loading/error/empty states
- Main page integrates all components
- Vercel deployment live and accessible
- Response time <1s per search verified
- Cache headers observable on repeated queries
- All tests passing
- Mobile responsive

---

## Key Technical Decisions

Per RESEARCH.md and UI-SPEC.md:

1. **Stack:** Next.js 14 App Router + SWR + Zod + shadcn/ui + Tailwind CSS
2. **Debounce:** 300ms client-side (useSearch hook)
3. **Caching:** 3-layer strategy
   - Layer 1: HTTP Cache-Control (60s edge cache on Vercel)
   - Layer 2: SWR deduplication (300ms client window)
   - Layer 3: Upstash Redis (deferred to Phase 2+)
4. **Competition Thresholds:** rare <10, common 10-100, oversaturated >100
5. **Colors:**
   - Rare: #10B981 (emerald-500, green)
   - Common: #F59E0B (amber-500, yellow)
   - Oversaturated: #EF4444 (red-500, red)
6. **API Timeout:** 5 seconds upstream (well within Vercel's 10s limit)
7. **Error Handling:** Graceful degradation with user-friendly messages

---

## Testing Strategy

### Wave 0: Test Infrastructure

- Vitest configuration with TypeScript + jsdom
- 29 test stubs across 5 files
- npm run test and npm run test:watch ready

### Wave 1: Backend Tests (RED → GREEN)

- 19 tests transition from RED (stubs) to GREEN (implementation)
- Test files:
  - `src/lib/utils/competition.test.ts` (6 tests)
  - `src/hooks/useSearch.test.ts` (5 tests)
  - `src/app/api/malt/autocomplete/route.test.ts` (8 tests)

### Wave 2: UI Tests & E2E

- 5 component tests for KeywordCard (from Wave 0 stubs)
- E2E tests with Playwright (manual verification + automated flow checks)
- Manual browser testing at Vercel URL

---

## Execution Flow

**Ready-to-Execute Checklist:**

- [x] All requirements mapped to plans
- [x] Wave dependencies clear (0 → 1 → 2)
- [x] Test infrastructure stubs in place
- [x] Backend implementation tasks detailed with code examples
- [x] UI components specified per UI-SPEC.md
- [x] Deployment instructions provided
- [x] Verification steps defined for each task
- [x] Success criteria measurable and testable

**Next Steps:**

1. Execute `/gsd:execute-phase 01` to begin Wave 0
2. Executor will:
   - Set up test infrastructure (01-01)
   - Implement backend (01-02)
   - Build UI and deploy (01-03)
3. After Wave 2 completion, phase is ready for verification
4. Phase 2 (Email Capture & Lead Gen) can begin

---

## Requirement Coverage Summary

| Requirement | Covered By                  | Status  |
| ----------- | --------------------------- | ------- |
| SRCH-01     | 01-02 Task 4 + 01-03 Task 2 | Planned |
| SRCH-02     | 01-03 Task 1 + Task 2       | Planned |
| SRCH-03     | 01-02 Task 3 + 01-03 Task 2 | Planned |
| SRCH-04     | 01-02 Task 1 + 01-03 Task 1 | Planned |
| INFRA-01    | 01-02 Task 3                | Planned |
| INFRA-02    | 01-02 Task 3                | Planned |
| INFRA-03    | 01-03 Task 4 + Task 5       | Planned |

**Coverage:** 7/7 requirements (100%)

---

## Files Modified/Created

**Total files to create:** 20+

**By category:**

- **Test Infrastructure:** 6 files (Wave 0)
- **Backend (lib):** 4 files (Wave 1)
- **UI Components:** 3 files (Wave 2)
- **Pages/Layout:** 2 files (Wave 2)
- **Configuration:** 3 files (Wave 2)

---

## Context References

All plans include context references to:

- `.planning/ROADMAP.md` — Phase structure and goals
- `.planning/REQUIREMENTS.md` — Requirement definitions
- `.planning/phases/01-search-foundation/01-RESEARCH.md` — Technical research and patterns
- `.planning/phases/01-search-foundation/01-UI-SPEC.md` — Design system and copywriting
- `.planning/phases/01-search-foundation/01-VALIDATION.md` — Test mapping and verification strategy
- Plan summaries from previous waves (for context preservation)

---

## Phase Success Criteria (Observable)

When Phase 1 completes:

1. ✓ User can type a keyword in search box and see results updating live with debouncing (300ms)
2. ✓ Each keyword result displays volume count ("N utilisateurs Malt") and color-coded competition badge
3. ✓ Search results include 5–10 related keyword suggestions with volume data
4. ✓ App gracefully handles errors: timeouts, rate limits, invalid responses show user-friendly messages
5. ✓ HTTP caching prevents hammering API: repeated searches within 60s return cached response
6. ✓ Application deployed on Vercel at public URL with <1 second response time per search

---

**Planning Complete** — Ready to execute `/gsd:execute-phase 01-search-foundation`

Created: 2026-03-24
Plans: 3 (01-01, 01-02, 01-03)
Wave 0: 6 tasks (test infrastructure)
Wave 1: 4 tasks (backend implementation)
Wave 2: 5 tasks (UI + deployment)
Total: 15 tasks across 3 plans
