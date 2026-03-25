# ROADMAP: Malt Keyword Tool

**Created:** 2026-03-22
**Granularity:** Fine (4 phases)
**Coverage:** 17/17 v1 requirements mapped

---

## Phases

- [x] **Phase 1: Search Foundation** - Live keyword search with volume, competition, and related keywords (completed 2026-03-25)
- [x] **Phase 2: Email Capture & Lead Gen** - GDPR-compliant email gating at search #3 with privacy policy (completed 2026-03-25)
- [ ] **Phase 3: Category Dashboards** - 5-category niche dashboard with trending badges and auto-generated top keywords
- [ ] **Phase 4: Landing Page & Brand** - Hero section, social proof, FAQ, and mobile-responsive marketing

---

## Phase Details

### Phase 1: Search Foundation

**Goal:** Deliver core value proposition — freelancers can instantly search keywords and see live volume, competition, and related suggestions from Malt's autocomplete API.

**Depends on:** Nothing (foundation phase)

**Requirements:** SRCH-01, SRCH-02, SRCH-03, SRCH-04, INFRA-01, INFRA-02, INFRA-03

**Success Criteria** (what must be TRUE when phase completes):

1. User can type a keyword in search box and see results updating live with debouncing (300ms) — no lag, no duplicate API calls
2. Each keyword result displays volume count (number of Malt users claiming skill) and color-coded competition signal (rare / common / oversaturated)
3. Search results include 5–10 related keyword suggestions alongside the primary searched term, each with their own volume data
4. App gracefully handles errors: timeouts, rate limits, and invalid API responses show user-friendly messages (no crash, no blank screens)
5. HTTP caching strategy prevents hammering Malt API: repeated searches for same query within 60 seconds return cached response (observable: response header shows cache hit)
6. Application is deployed on Vercel and accessible via public URL; live requests succeed and complete in <1 second per search

**Plans:** 3/3 plans complete

| Plan | Name                   | Tasks | Status   | Completed  |
| ---- | ---------------------- | ----- | -------- | ---------- |
| 01   | Test Infrastructure    | 4     | COMPLETE | 2026-03-25 |
| 02   | Malt API & useSearch   | 3     | Complete | 2026-03-25 |
| 03   | UI Components & Deploy | 6     | COMPLETE | 2026-03-25 |

---

### Phase 2: Email Capture & Lead Gen

**Goal:** Build freemium conversion funnel — gate full search results behind GDPR-compliant email capture at search #3, establish privacy policy, and begin building email list for monetization.

**Depends on:** Phase 1

**Requirements:** LAND-04, LEAD-01, LEAD-02, LEAD-03

**Success Criteria** (what must be TRUE when phase completes):

1. After user's 3rd search, email capture form appears with minimal friction (email + optional name only)
2. Form includes unchecked GDPR consent checkbox with explicit opt-in language ("Your email will be used for...") — checkbox is NOT pre-checked, language is clear and French-aware
3. User can submit email and successfully sign up to Resend list; confirmation email is received within 5 minutes
4. Privacy policy page is live at `/privacy` and explains data usage, retention, and unsubscribe process in French/English
5. One-click unsubscribe link in confirmation email works; email is immediately removed from list (Resend handles this)
6. Users can complete exactly 2 free searches before email gate appears on 3rd attempt (conversion tracking validates this)

**Plans:** 3/3 complete

| Plan | Name                     | Tasks | Status   | Completed  |
| ---- | ------------------------ | ----- | -------- | ---------- |
| 01   | Gate Trigger + UI        | 3     | COMPLETE | 2026-03-25 |
| 02   | Email API + Verification | 3     | COMPLETE | 2026-03-25 |
| 03   | Privacy Policy           | 1     | COMPLETE | 2026-03-25 |

---

### Phase 3: Category Dashboards

**Goal:** Increase engagement and reduce search friction — deliver pre-built category dashboards with auto-generated top-20 keyword lists so users don't have to guess what to search.

**Depends on:** Phase 1

**Requirements:** DASH-01, DASH-02, DASH-03

**Success Criteria** (what must be TRUE when phase completes):

1. User can select from 5 category tabs: Development, Design, Marketing, Writing, Business (tabs are visible, clickable, and persistent)
2. Selecting a category auto-generates ranked top-20 keyword list by firing parallel API calls to Malt for hardcoded seed terms (e.g., "Python developer," "React," "UI designer")
3. Each keyword in dashboard displays volume count, competition signal, and trending badge (rising / stable / declining based on comparison logic)
4. Dashboard loads in <2 seconds even when making 5–20 parallel API calls (p-limit concurrency control prevents overwhelming Malt API)
5. If one seed term fails (Malt returns error), dashboard gracefully degrades and shows other keywords (no dashboard-wide crashes)
6. Mobile layout adapts dashboard tabs and keyword list to mobile screen size; all features functional on iPhone/Android

**Plans:** TBD

---

### Phase 4: Landing Page & Brand

**Goal:** Complete the product launch — deliver polished landing page that showcases value, builds trust, and funnels traffic toward search and email signup.

**Depends on:** Phase 1, Phase 2, Phase 3

**Requirements:** LAND-01, LAND-02, LAND-03

**Success Criteria** (what must be TRUE when phase completes):

1. Landing page loads with hero section explaining value proposition above the fold: "Find high-value keywords for your Malt profile" + search box is immediately visible and interactive
2. Social proof block displays 5–10 pre-loaded popular keywords with live volume counts; block refreshes periodically to show real data (demonstrates tool is live and useful)
3. FAQ section addresses common skepticism: "Why are these numbers accurate?" "Can Malt shut this down?" "Will my email be sold?" — answers are clear and build trust
4. Email CTA button is strategically placed (below hero, above FAQ, after search results) and visible without scrolling in most viewport sizes
5. Page is fully mobile-responsive: navigation, search box, social proof, and FAQ all render correctly on iPhone/Android without horizontal scrolling or broken layout
6. Page loads in <2 seconds on mobile 4G and passes Core Web Vitals (LCP, FID, CLS within Google targets)

**Plans:** 3/3 plans created

| Plan | Name                             | Wave | Tasks | Status   | Completed  |
| ---- | -------------------------------- | ---- | ----- | -------- | ---------- |
| 01   | Foundation — Hero, CTA, Sequence | 1    | 6     | COMPLETE | 2026-03-25 |
| 02   | Leaderboard — Social Proof       | 2    | 4     | COMPLETE | 2026-03-25 |
| 03   | Completion — FAQ, Success State  | 3    | 5     | COMPLETE | 2026-03-25 |

---

## Progress Table

| Phase                       | Plans Complete | Status          | Completed  |
| --------------------------- | -------------- | --------------- | ---------- |
| 1. Search Foundation        | 3/3            | Complete        | 2026-03-25 |
| 2. Email Capture & Lead Gen | 3/3            | Complete        | 2026-03-25 |
| 3. Category Dashboards      | 0/4            | Not started     | —          |
| 4. Landing Page & Brand     | 3/3 (1 remain) | Executing (P03) | 2026-03-25 |

---

## Requirement Coverage

**Total v1 requirements:** 17
**Mapped to phases:** 17
**Unmapped:** 0

**Coverage by category:**

| Category       | Requirements                       | Phase(s)                     |
| -------------- | ---------------------------------- | ---------------------------- |
| Search         | SRCH-01, SRCH-02, SRCH-03, SRCH-04 | Phase 1                      |
| Dashboard      | DASH-01, DASH-02, DASH-03          | Phase 3                      |
| Landing        | LAND-01, LAND-02, LAND-03, LAND-04 | Phase 4 (LAND-04 in Phase 2) |
| Lead Gen       | LEAD-01, LEAD-02, LEAD-03          | Phase 2                      |
| Infrastructure | INFRA-01, INFRA-02, INFRA-03       | Phase 1                      |

---

## Architecture Notes

**API Proxy Dependency (Phase 1):**
All downstream phases use the Phase 1 proxy route `/api/malt/autocomplete`. Phase 2-4 are non-blocking once Phase 1 proxy is stable.

**Caching Strategy (Phase 1):**

- Layer 1: HTTP Cache-Control headers (60s, stale-while-revalidate)
- Layer 2: Client-side SWR deduplication (prevents duplicate requests during fast typing)
- Layer 3: Upstash Redis (optional, only if Layer 1+2 insufficient under production load)

**Email Service (Phase 2):**
Resend integration is independent; doesn't require Phase 3 to be complete. Phase 2 can run parallel to Phase 3.

**Research Flags:**

- **Phase 1:** Verify Malt API authentication (session cookie vs. explicit token); test rate limit thresholds
- **Phase 2:** EU lawyer review of GDPR compliance and privacy policy ($500-800); Resend domain verification
- **Phase 3:** Validate Malt category taxonomy; which categories and seed keywords actually exist?
- **Phase 4:** A/B test landing page copy (French vs. English); validate messaging against real Malt user base

---

_Roadmap created: 2026-03-22_
_Phase 2 planned: 2026-03-25_
_Phase 4 planned: 2026-03-25_
