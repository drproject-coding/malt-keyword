---
phase: 2
slug: email-capture-lead-gen
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                   |
| ---------------------- | --------------------------------------- |
| **Framework**          | vitest 1.x + Playwright                 |
| **Config file**        | vitest.config.ts                        |
| **Quick run command**  | `npx vitest run --reporter=verbose`     |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime**  | ~15 seconds (unit) / ~45 seconds (E2E)  |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run && npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds (unit), 45 seconds (E2E)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command                                          | File Exists | Status     |
| ------- | ---- | ---- | ----------- | --------- | ---------------------------------------------------------- | ----------- | ---------- |
| 2-01-01 | 01   | 0    | LEAD-01     | unit      | `npx vitest run src/hooks/useSearch.test.ts`               | ❌ W0       | ⬜ pending |
| 2-01-02 | 01   | 1    | LEAD-01     | unit      | `npx vitest run src/hooks/useGate.test.ts`                 | ❌ W0       | ⬜ pending |
| 2-01-03 | 01   | 1    | LEAD-01     | e2e       | `npx playwright test e2e/email-gate.spec.ts`               | ❌ W0       | ⬜ pending |
| 2-02-01 | 02   | 1    | LEAD-02     | unit      | `npx vitest run src/lib/schemas/email.test.ts`             | ❌ W0       | ⬜ pending |
| 2-02-02 | 02   | 1    | LEAD-02     | unit      | `npx vitest run src/app/api/email/subscribe/route.test.ts` | ❌ W0       | ⬜ pending |
| 2-02-03 | 02   | 1    | LEAD-02     | unit      | `npx vitest run src/app/api/email/verify/route.test.ts`    | ❌ W0       | ⬜ pending |
| 2-03-01 | 03   | 1    | LEAD-03     | e2e       | `npx playwright test e2e/privacy-page.spec.ts`             | ❌ W0       | ⬜ pending |
| 2-03-02 | 03   | 1    | LAND-04     | e2e       | `npx playwright test e2e/email-gate.spec.ts`               | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `src/hooks/useGate.test.ts` — stubs for gate trigger + localStorage state (LEAD-01)
- [ ] `src/lib/schemas/email.test.ts` — Zod email schema validation stubs (LEAD-02)
- [ ] `src/app/api/email/subscribe/route.test.ts` — subscribe route stubs (LEAD-02)
- [ ] `src/app/api/email/verify/route.test.ts` — verify route stubs (LEAD-02)
- [ ] `e2e/email-gate.spec.ts` — E2E stubs for gate trigger on 3rd search + post-verify unlock (LEAD-01, LAND-04)
- [ ] `e2e/privacy-page.spec.ts` — E2E stub for /privacy page existence (LEAD-03)

---

## Manual-Only Verifications

| Behavior                                 | Requirement | Why Manual                                | Test Instructions                                                              |
| ---------------------------------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| Confirmation email received within 5 min | LEAD-01     | Requires live Resend account + real email | Submit form with real email, wait for email, click verify link, confirm unlock |
| Unsubscribe link works                   | LEAD-01     | Requires live Resend list                 | Click unsubscribe in confirmation email, verify removed from Resend list       |
| GDPR consent checkbox not pre-checked    | LEAD-02     | Visual/DOM check                          | Open gate, inspect checkbox element — must have `checked=false` by default     |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
