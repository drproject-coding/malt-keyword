# Malt Keyword Tool

## What This Is

A public web tool that lets Malt freelancers discover the best keywords to add to their profile by surfacing real usage volume from Malt's internal autocomplete API. It functions like an SEO keyword research tool but specifically for the Malt platform — showing how many users claim each skill, and surfacing related high-value keywords. The tool doubles as a lead generation page for a future paid product or service.

## Core Value

Freelancers can instantly see which keywords are worth adding to their Malt profile — by volume and competition — instead of guessing.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Hero/landing section explains the value proposition and targets Malt freelancers
- [ ] Search tool: user types a keyword, sees occurrence count + related suggestions from the Malt autocomplete API
- [ ] Each result shows keyword volume (number of Malt users using it) and a signal for saturation/competition
- [ ] Niche dashboard: user selects a category (e.g. design, dev, marketing), app auto-generates top keywords by querying multiple seed terms
- [ ] Email capture CTA to build a list for future monetization
- [ ] Deployed on Vercel with a server-side proxy for the Malt API (to avoid CORS + handle auth if needed)

### Out of Scope

- User accounts / profiles — no auth needed for v1, it's a public tool
- Monetization / paywalls — TBD, not in v1
- Storing or caching data long-term — API calls are live for now
- Mobile app — web-first

## Context

- Discovered via Malt's internal review flow: when rating a completed mission, Malt suggests skills with occurrence counts (e.g. "366 Malt users use this keyword")
- API endpoint: `https://www.malt.fr/profile/public-api/suggest/tags/autocomplete?query=<term>`
- Auth requirement is unknown — needs testing. If it requires a Malt session cookie, a proxy layer or scraping approach may be needed
- Deploying to Vercel; Next.js API routes would cleanly solve any CORS or auth issues server-side
- Monetization is deliberately deferred — v1 is about validating the tool's value and building an email list

## Constraints

- **API dependency**: Relies on an undocumented Malt API — subject to change or rate limiting without notice
- **CORS/Auth**: May require server-side proxy; pure static frontend may not be viable
- **Stack**: Next.js on Vercel (API routes solve both CORS and potential session-based auth)

## Key Decisions

| Decision                          | Rationale                                                      | Outcome   |
| --------------------------------- | -------------------------------------------------------------- | --------- |
| Next.js + Vercel over pure static | API routes needed to proxy Malt API (CORS + potential auth)    | — Pending |
| Live API calls, no caching        | Simplest v1; caching adds complexity                           | — Pending |
| Email capture over paywall        | Monetization TBD; list-building is low-friction and high-value | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-03-22 after initialization_
