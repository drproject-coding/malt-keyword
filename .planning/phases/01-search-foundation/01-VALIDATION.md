---
phase: 1
slug: search-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-24
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                |
| ---------------------- | ------------------------------------ |
| **Framework**          | Vitest 1.0+                          |
| **Config file**        | `vitest.config.ts` (Wave 0 installs) |
| **Quick run command**  | `npm run test:watch`                 |
| **Full suite command** | `npm run test`                       |
| **Estimated runtime**  | ~60 seconds                          |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:watch`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green + manual Vercel smoke test
- **Max feedback latency:** 30 seconds (unit), 60 seconds (full suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement     | Test Type        | Automated Command                                             | File Exists | Status     |
| ------- | ---- | ---- | --------------- | ---------------- | ------------------------------------------------------------- | ----------- | ---------- |
| 1-01-01 | 01   | 0    | INFRA-01        | Integration      | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ W0       | ⬜ pending |
| 1-01-02 | 01   | 0    | SRCH-04         | Unit             | `npm run test -- src/lib/utils/competition.test.ts`           | ❌ W0       | ⬜ pending |
| 1-01-03 | 01   | 0    | SRCH-01         | Unit+Integration | `npm run test -- src/hooks/useSearch.test.ts`                 | ❌ W0       | ⬜ pending |
| 1-01-04 | 01   | 0    | SRCH-02,SRCH-04 | Component        | `npm run test -- src/components/KeywordCard.test.ts`          | ❌ W0       | ⬜ pending |
| 1-02-01 | 02   | 1    | INFRA-02        | Integration      | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ W0       | ⬜ pending |
| 1-02-02 | 02   | 1    | SRCH-03         | Integration      | `npm run test -- src/app/api/malt/autocomplete/route.test.ts` | ❌ W0       | ⬜ pending |
| 1-03-01 | 03   | 2    | INFRA-03        | E2E              | `npm run test:e2e`                                            | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — Vitest + TypeScript + jsdom configuration
- [ ] `src/hooks/useSearch.test.ts` — stubs for SRCH-01 (debounce + dedup)
- [ ] `src/components/KeywordCard.test.ts` — stubs for SRCH-02, SRCH-04 (volume display, color coding)
- [ ] `src/app/api/malt/autocomplete/route.test.ts` — stubs for SRCH-03, INFRA-01, INFRA-02 (proxy, caching, validation)
- [ ] `src/lib/utils/competition.test.ts` — stubs for SRCH-04 (thresholds, color logic)
- [ ] `tests/e2e/search.spec.ts` — stubs for INFRA-03 (Vercel smoke test)

---

## Manual-Only Verifications

| Behavior                                         | Requirement | Why Manual                                        | Test Instructions                                                                                                                            |
| ------------------------------------------------ | ----------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Live Vercel deployment responds in <1s           | INFRA-03    | Requires production/staging environment           | 1. Deploy to Vercel. 2. Open URL. 3. Type keyword. 4. Verify results appear in <1s. Check Network tab for response times.                    |
| Cache-Control header observable as cache hit     | INFRA-02    | Requires Vercel edge cache (not testable locally) | 1. Search same term twice. 2. Check Network tab. 3. Second request should show `Age` header > 0 or `X-Vercel-Cache: HIT`                     |
| Malt API auth working (session cookie if needed) | INFRA-01    | Undocumented API — auth method unknown            | Test curl: `curl -v "https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=python"`. If 401/403, add session cookie header. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (unit) / 60s (full)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
