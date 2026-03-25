---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-03-25T16:55:54Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 10
  completed_plans: 9
---

# STATE: Malt Keyword Tool

**Project:** Malt Keyword Tool
**Milestone:** v1 MVP
**Created:** 2026-03-22

---

## Project Reference

**Core Value:** Freelancers can instantly see which keywords are worth adding to their Malt profile — by volume and competition — instead of guessing.

**Key Context:**

- Target: French freelancers on Malt platform
- API: Undocumented Malt autocomplete endpoint (permission needed)
- Stack: Next.js 14+ App Router, Vercel, shadcn/ui, SWR, Zod, Resend
- Monetization: Email list building for future paid product/service

---

## Current Position

Phase: 04 (landing-page-brand) — EXECUTING
Plan: 3 of 4 — COMPLETED (04-03-PLAN.md)
Next: Plan 04-04 (Finalization & Mobile Optimization)

## Performance Metrics

**v1 Success Criteria (observables):**

- Phase 1: User can search keywords and see volume + competition in <1 second
- Phase 2: Email gate triggers at search #3, GDPR compliant, list grows by email signups
- Phase 3: Category dashboards load in <2 seconds, ranking matches Malt autocomplete demand
- Phase 4: Landing page converts traffic to search usage; mobile responsive

**Key Risks:**

1. **Malt API changes:** Endpoint may require auth or rate-limit. Mitigation: Get permission before Phase 1, test rate limits early.
2. **GDPR compliance:** French users expect strict data protection. Mitigation: Hire EU lawyer ($500-800), review privacy policy before Phase 2.
3. **Vercel costs:** Hobby tier has limits; Pro tier is $20/mo. Mitigation: Monitor usage, upgrade if traffic spikes.
4. **API permission denial:** If Malt says no, fallback to LinkedIn API or profile scraping. Mitigation: Email Malt immediately after roadmap approval.

---

## Accumulated Context

### Key Decisions

| Decision                          | Rationale                                                                | Status  |
| --------------------------------- | ------------------------------------------------------------------------ | ------- | ------- |
| Phase 1 first (search foundation) | Core value; everything else depends on it                                | Locked  |
| Phase 2 before dashboards         | Email gate at search #3 is natural friction point                        | Locked  |
| No caching to database (v1)       | Simplicity; live API calls only                                          | Locked  |
| HTTP cache + SWR (not Redis)      | Layer 1+2 sufficient for MVP; add Redis only if production load requires | Locked  |
| Resend for email                  | GDPR-friendly, easiest Next.js integration, no pre-ticked consent        | Locked  |
| Vercel deployment                 | API routes solve CORS + session handling elegantly                       | Locked  |
| Token storage: In-memory Map v1   | Simplicity for MVP; move to Redis/DB when scaling                        | Locked  |
| Rate limiting: 3/email/hour       | Prevents spam while allowing legitimate retries                          | Locked  |
| Token expiry: 24 hours            | Reasonable window for user to check email and click link                 | Locked  |
| Verification tokens: opaque bytes | 64-char hex, cryptographically secure, non-guessable                     | Locked  |
| Phase 04 P01                      | 45                                                                       | 5 tasks | 5 files |

### Todos (Pre-Phase 1 Launch)

- [ ] Email Malt dev team requesting API usage permission (do this ASAP)
- [ ] Test Malt API endpoint with curl to verify response format and authentication
- [ ] Schedule 2-hour EU lawyer review for GDPR/privacy policy ($500-800)
- [ ] Create Next.js 14 project with App Router + shadcn/ui
- [ ] Set up Resend account and verify sending domain
- [ ] Validate SWR deduplication reduces API calls by 80% under typing load
- [ ] Decide Vercel Hobby vs. Pro tier based on expected traffic

### Blockers

**None yet.** Roadmap is approved and ready for Phase 1 planning.

### Research Gaps (Flagged for resolution during phase execution)

**Phase 1 Research:**

- Does Malt autocomplete endpoint require explicit auth token or just session cookie?
- What are Malt's actual rate limits? (estimated 100 req/min, untested)
- Sample response format from live endpoint (for Zod schema validation)

**Phase 2 Research:**

- ✅ COMPLETED (02-02): Email infrastructure with Resend integration
- EU/French data protection lawyer for 2-hour review (02-03)
- Privacy policy template customization (TermsFeed/Iubenda) (02-03)
- Resend GDPR compliance verification (02-03)

**Phase 3 Research:**

- Malt category taxonomy (which categories exist in autocomplete?)
- Which seed keywords actually return results?
- Trending badge logic (what data sources define "rising/stable/declining"?)

**Phase 4 Research:**

- Landing page messaging A/B test (French vs. English)
- Social proof baseline ("10K+ freelancers" — realistic number?)

---

## Session Continuity

**Last session:** 2026-03-25T16:55:54Z
**Completed:** 04-03-PLAN.md (FAQ, Success State & Landing Page Metadata)
**Next action:** Execute 04-04-PLAN.md (Finalization & Mobile Optimization)

**Context preserved in:**

- `/Users/y/Desktop/Malt-Keyword/.planning/ROADMAP.md` — Phase structure, success criteria, dependencies
- `/Users/y/Desktop/Malt-Keyword/.planning/REQUIREMENTS.md` — Full requirement traceability
- `/Users/y/Desktop/Malt-Keyword/.planning/PROJECT.md` — Core value, constraints, decisions
- `/Users/y/Desktop/Malt-Keyword/.planning/research/SUMMARY.md` — Stack, architecture, pitfalls

---

_State initialized: 2026-03-22_
_Ready for Phase 1 planning_
