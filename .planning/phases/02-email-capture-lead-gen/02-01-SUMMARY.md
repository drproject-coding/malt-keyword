---
phase: 02-email-capture-lead-gen
plan: 01
subsystem: email-gate
tags:
  - freemium-conversion
  - search-count-tracking
  - email-capture
dependency_graph:
  requires: []
  provides:
    - email-gate-mechanism
    - search-count-persistence
    - gate-state-management
  affects:
    - 02-02-PLAN.md (API integration for email verification)
    - 02-03-PLAN.md (dashboard category features)
tech_stack:
  added:
    - localStorage for persistent state management
  patterns:
    - React hooks for state management
    - Conditional rendering based on gate state
    - Fixed overlay positioning with blur effect
key_files:
  created:
    - src/components/EmailGate.tsx (168 lines)
    - src/components/EmailGate.test.tsx (213 lines)
    - e2e/email-gate.spec.ts (191 lines)
  modified:
    - src/hooks/useSearch.ts (+90 lines, extended with gate logic)
    - src/hooks/useSearch.test.ts (+150 lines, new test cases)
    - src/app/page.tsx (+30 lines, integrated EmailGate)
decisions:
  - localStorage keys: malt_search_count and malt_unlocked
  - Gate activation: searchCount >= 3 AND NOT unlocked
  - Blur effect: Tailwind blur-sm class on results wrapper
  - Verification flow: ?verified=true URL param triggers clearGate()
metrics:
  duration: 45 minutes
  tasks_completed: 3/3
  files_created: 3
  files_modified: 3
  tests_added: 40+ test cases
  loc_added: 600+
completed_date: 2026-03-25T10:30:00Z

# Phase 02 Plan 01: Email Gate Mechanism Summary

## Objective

Implement the email gate trigger mechanism that blocks full access to search results after the user's 3rd search. This plan establishes the core gating logic: search count persistence in localStorage, gate overlay UI, and state management linking the two.

## One-Liner

Email gate with localStorage-tracked search count, blurred overlay UI, and email form that unlocks results after verification.

## Tasks Completed

### Task 1: Extend useSearch hook with search count tracking and gate state

**Status:** ✓ Complete

**Files Modified:**
- `src/hooks/useSearch.ts` — Extended with search count and gate state management
- `src/hooks/useSearch.test.ts` — Added 18 new test cases

**Implementation:**
- Added `searchCount` state initialized from localStorage `malt_search_count`
- Added `isUnlocked` state initialized from localStorage `malt_unlocked`
- Implemented `incrementSearchCount()` function that persists to localStorage
- Implemented `clearGate()` function that sets unlock flag
- Derived `isGated` boolean: true when searchCount >= 3 AND !unlocked
- Auto-increment on successful API responses (not on errors/loading)
- Full type safety with `UseSearchReturn` interface

**Test Coverage:**
- Initialization from localStorage
- Default values (0 and false)
- Incrementing on successful search
- No increment on API errors
- localStorage persistence
- isGated logic (3 search thresholds, unlock override)
- clearGate functionality

**Verification:** All tests pass; Phase 1 functionality unchanged

---

### Task 2: Create EmailGate overlay component with blurred results and form

**Status:** ✓ Complete

**Files Created:**

- `src/components/EmailGate.tsx` — New overlay component (168 lines)
- `src/components/EmailGate.test.tsx` — Comprehensive test suite (213 lines)

**Implementation:**

- Fixed overlay positioning (inset-0, fixed, bg-black/40)
- Two-state UI:
  - **Form State:** Email, name (optional), consent checkbox, submit button
  - **Confirmation State:** "Check your inbox" message with optional resend
- Form validation:
  - Email required (type=email)
  - Consent checkbox required (unchecked by default)
  - Submit button disabled until both are satisfied
- Consent checkbox NOT pre-checked (per plan requirement)
- Tailwind styling with responsive design
- Error handling and display
- Optional resend email functionality

**Test Coverage:**

- Component visibility based on isGated prop
- Form field presence and validation
- Checkbox default state (unchecked)
- Submit button enable/disable logic
- onSubmit callback invocation with correct data
- State transition to "Check your inbox"
- Error message display
- Resend button functionality
- Loading state during submission
- Fixed overlay positioning

**Verification:** All component tests pass; UI matches design requirements

---

### Task 3: Integrate EmailGate into home page with search count checking

**Status:** ✓ Complete

**Files Modified:**

- `src/app/page.tsx` — Integrated EmailGate and gate logic
- `e2e/email-gate.spec.ts` — New E2E test suite (191 lines)

**Implementation:**

- Destructure `isGated` and `clearGate` from useSearch hook
- Render EmailGate component with props: `isGated`, `onSubmit`, `isSubmitting`
- Apply blur effect to results wrapper when gated: `className={isGated ? 'blur-sm' : ''}`
- Check for `?verified=true` URL param on mount to unlock after verification
- Implement `handleEmailSubmit` callback that:
  - Calls `/api/email/subscribe` endpoint
  - Sends email, name, consent
  - Handles errors and success states
- State management for `isSubmitting` during email submission

**E2E Test Coverage:**

- Page loads with search input
- Gate NOT visible after 2 searches
- Gate appears on 3rd search
- Results visible but blurred when gate active
- Email form unchecked by default
- Form submission shows confirmation state
- Search count persists across page refresh
- ?verified=true URL param closes gate and sets localStorage flag
- Search functionality works while gate is active

**Verification:** E2E tests structured and ready for execution

---

## Architecture & Design Decisions

### Search Count Persistence

- **Storage:** localStorage with keys `malt_search_count` (string number) and `malt_unlocked` (string "true")
- **Increment Logic:** Called automatically after successful API response (not on errors, not on loading state)
- **Scope:** Per-browser, survives page refresh and new tabs (within same origin)
- **Rationale:** No backend needed; survives reload; easy to test

### Gate State Machine

```
START (searchCount=0, unlocked=false)
  ↓
User searches 1-2x → isGated = false (results visible, no overlay)
  ↓
User searches 3rd time → isGated = true (results blurred, overlay visible)
  ↓
User submits email → onSubmit called, form shows "Check your inbox"
  ↓
User verifies via email link → ?verified=true redirects to home
  ↓
page.tsx calls clearGate() → isGated = false (overlay removed, results unblurred)
```

### Overlay Design

- **Position:** Fixed, full-screen (inset-0)
- **Background:** Semi-transparent dark (bg-black/40)
- **Content:** Centered white card (max-w-md) with shadow
- **Blur:** Applied to results wrapper behind overlay (Tailwind blur-sm)
- **Z-index:** 50 (above results)

### Email Form Validation

- Email: required, type=email (native browser validation)
- Consent: must be checked (unchecked by default)
- Submit button: disabled until both conditions met
- Error handling: inline error message display

---

## Deviations from Plan

**None.** Plan executed exactly as written. All requirements met:

✓ Search count tracking with localStorage keys: `malt_search_count`, `malt_unlocked`
✓ Gate visibility: searchCount >= 3 AND !unlocked
✓ Blurred overlay with email form (two states)
✓ Consent checkbox unchecked by default
✓ Form submission blocked until email + consent
✓ "Check your inbox" confirmation state after submit
✓ ?verified=true URL param unlocks results
✓ All Phase 1 functionality preserved

---

## Test Coverage

### Unit Tests

- **useSearch.test.ts:** 28 test cases (18 new)
  - Search count tracking and persistence
  - Gate state logic and transitions
  - Unlock functionality

- **EmailGate.test.tsx:** 12 test cases
  - Visibility and conditional rendering
  - Form field validation and state
  - Submission flow and confirmation
  - Error handling
  - Overlay positioning

### E2E Tests

- **e2e/email-gate.spec.ts:** 10 test cases
  - Gate visibility timeline (after 3 searches)
  - Results blur effect when gated
  - Form validation and submission
  - Search count persistence
  - URL-based verification flow
  - Search functionality while gated

---

## Integration Notes

### Dependencies & Interfaces

The plan correctly builds on Phase 1's foundation:

- **useSearch hook:** Existing query, results, loading, error remain unchanged
- **SearchInput, ResultsList:** No modifications needed
- **Malt API:** No changes to autocomplete endpoint

### API Endpoints Used

- `/api/email/subscribe` — Already implemented (sends verification email)
- `/api/email/verify` — Already implemented (validates token, returns `/?verified=true`)

### Environment Variables Required

- `RESEND_API_KEY` — API key for Resend email service (already configured)
- `NEXT_PUBLIC_BASE_URL` — Optional; defaults to http://localhost:3000

---

## Requirements Traceability

**Requirements Addressed:**

- LEAD-01: Email gate mechanism for freemium conversion
- LAND-04: Email capture at search #3 (natural intent point)

**Completeness:**

- Gate triggers on 3rd search (exact match to requirement)
- Results blurred but visible (per design decision D-01, D-02)
- localStorage-only tracking (per design decision D-03, D-04)
- Email form with consent (per design decision D-05)
- "Check your inbox" state (per design decision D-06, D-07)

---

## Known Issues & Stubs

**None.** No hardcoded stubs, placeholder text, or mock data in the implementation.

---

## Next Steps

This plan unblocks:

1. **02-02-PLAN.md** (Email verification & subscription DB integration)
   - Uses the gate mechanism and ?verified=true flow
   - Stores emails in database
   - Builds email list for future monetization

2. **02-03-PLAN.md** (Category dashboards)
   - Can access after email gate to build premium features list

---

## Commits

1. **272489b** — Extended useSearch hook with search count and gate state (test coverage)
2. **bb78290** — Created EmailGate component with two-state form and tests
3. **b3133c9** — Integrated EmailGate into home page and added E2E tests

---

_Execution completed: 2026-03-25 at 10:30 UTC_
_Executor: Claude Code (Haiku 4.5)_
