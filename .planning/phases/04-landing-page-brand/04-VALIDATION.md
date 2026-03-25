---
phase: 4
slug: landing-page-brand
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                             |
| ---------------------- | ----------------------------------------------------------------- |
| **Framework**          | Vitest 1.0.0 + @testing-library/react 14.0.0 + Playwright         |
| **Config file**        | `vitest.config.ts` (existing) + `playwright.config.ts` (existing) |
| **Quick run command**  | `npm test`                                                        |
| **Full suite command** | `npm test && npm run test:e2e`                                    |
| **Estimated runtime**  | ~30s (unit) + ~3min (E2E)                                         |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test && npm run test:e2e`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds (unit), 3 minutes (full)

---

## Per-Task Verification Map

| Task ID                    | Requirement | Test Type | Automated Command                                   | File Exists | Status     |
| -------------------------- | ----------- | --------- | --------------------------------------------------- | ----------- | ---------- |
| Hero component             | LAND-01     | Unit      | `npm test -- Hero.test.ts`                          | ❌ W0       | ⬜ pending |
| Hero responsive            | LAND-01     | E2E       | `npm run test:e2e -- landing.spec.ts`               | ❌ W0       | ⬜ pending |
| useLeaderboard fetch       | LAND-02     | Unit      | `npm test -- useLeaderboard.test.ts`                | ❌ W0       | ⬜ pending |
| Leaderboard cards          | LAND-02     | Unit      | `npm test -- Leaderboard.test.ts`                   | ❌ W0       | ⬜ pending |
| Leaderboard animation      | LAND-02     | E2E       | `npm run test:e2e -- leaderboard-animation.spec.ts` | ❌ W0       | ⬜ pending |
| Leaderboard error handling | LAND-02     | Unit      | `npm test -- useLeaderboard.test.ts`                | ❌ W0       | ⬜ pending |
| FAQ content                | LAND-03     | Unit      | `npm test -- FAQ.test.ts`                           | ❌ W0       | ⬜ pending |
| FAQ mobile/desktop         | LAND-03     | E2E       | `npm run test:e2e -- faq.spec.ts`                   | ❌ W0       | ⬜ pending |
| CTA scroll nudge           | D-11        | E2E       | `npm run test:e2e -- cta-scroll.spec.ts`            | ❌ W0       | ⬜ pending |
| Success state inline       | D-15/D-16   | Unit      | `npm test -- SuccessState.test.ts`                  | ❌ W0       | ⬜ pending |
| Success state URL cleanup  | D-15/D-16   | E2E       | `npm run test:e2e -- success-state.spec.ts`         | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `src/components/Hero.test.ts` — renders headline, subheadline, responsive layout
- [ ] `src/components/Leaderboard.test.ts` — renders 4 ranked cards, rank numbers visible
- [ ] `src/hooks/useLeaderboard.test.ts` — Promise.all fetch, error handling, state updates
- [ ] `src/components/FAQ.test.ts` — renders 5 locked items, exact copy match from CONTEXT.md D-13
- [ ] `src/components/CTAButton.test.ts` — renders button, scroll callback fires on click
- [ ] `src/components/SuccessState.test.ts` — shows on mount, auto-dismisses after 2.5s, calls onDismiss
- [ ] `tests/e2e/landing.spec.ts` — hero → leaderboard → CTA → search → FAQ visible on load; responsive on mobile
- [ ] `tests/e2e/cta-scroll.spec.ts` — click CTA → smooth scroll to search input
- [ ] `tests/e2e/success-state.spec.ts` — navigate `/?verified=true` → success message → auto-dismiss → URL cleaned
- [ ] `tests/e2e/leaderboard-animation.spec.ts` — visual: fade-in stagger visible

_Playwright and Vitest already installed — no new installs needed._

---

## Manual-Only Verifications

| Behavior                   | Requirement | Why Manual                                          | Test Instructions                                                                      |
| -------------------------- | ----------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Harry Dry copy quality     | D-03, D-10  | Subjective — visualizable, falsifiable, unique copy | Read headline + CTA aloud; apply 3 tests: visualize it, falsify it, only we can say it |
| Leaderboard visual stagger | D-06        | CSS animation timing hard to assert in Playwright   | Open in browser, reload, verify cards fade in sequentially with ~100ms delay each      |
| Success state polish       | D-16        | Timing feel, transitions                            | Navigate to `/?verified=true`, verify smooth appearance and auto-dismiss at ~2.5s      |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (unit) / 3min (E2E)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
