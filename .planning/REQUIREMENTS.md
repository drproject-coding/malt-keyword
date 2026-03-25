# Requirements: Malt Keyword Tool

**Defined:** 2026-03-22
**Core Value:** Freelancers can instantly see which keywords are worth adding to their Malt profile — by volume and competition — instead of guessing.

## v1 Requirements

### Search

- [x] **SRCH-01**: User can type a keyword and see live results updating as they type (debounced)
- [ ] **SRCH-02**: Each keyword result shows how many Malt users claim that skill (volume count)
- [x] **SRCH-03**: Search results include 5–10 related keyword suggestions alongside the searched term
- [x] **SRCH-04**: Each keyword displays a competition signal (color-coded: rare / common / oversaturated)

### Dashboard

- [ ] **DASH-01**: User can select a niche category (Dev, Design, Marketing, Writing, Business)
- [ ] **DASH-02**: Selecting a category auto-generates a ranked top-20 keyword list by querying multiple seed terms
- [ ] **DASH-03**: Keywords in the dashboard display a trending badge (rising / stable / declining)

### Landing Page

- [ ] **LAND-01**: Page has a hero section with value proposition and search box visible above the fold
- [ ] **LAND-02**: Social proof block shows pre-loaded popular keywords with volume data before the user searches
- [ ] **LAND-03**: FAQ section addresses common questions and skepticism about the tool
- [ ] **LAND-04**: Email capture CTA is present on the page and triggers after user's 3rd search

### Lead Generation

- [ ] **LEAD-01**: Email capture form gates full results after the user's 3rd search
- [ ] **LEAD-02**: Email form includes a GDPR-compliant consent checkbox with explicit opt-in language
- [ ] **LEAD-03**: A basic privacy policy page exists at /privacy explaining data usage

### Infrastructure

- [x] **INFRA-01**: Next.js API route proxies all Malt autocomplete requests server-side (avoids CORS)
- [x] **INFRA-02**: Proxy caches responses to avoid hammering the Malt API on repeated queries
- [ ] **INFRA-03**: Application is deployed on Vercel and accessible via a public URL

## v2 Requirements

### Analytics & Monetization

- **ANLT-01**: User can export keyword results to CSV
- **ANLT-02**: Premium tier unlocks 12-month historical trends per keyword
- **ANLT-03**: User accounts for saving keyword lists across sessions
- **ANLT-04**: Admin dashboard showing email list size and top searched keywords

### Advanced Features

- **ADV-01**: User can compare two keywords side-by-side
- **ADV-02**: Keyword alert emails when a tracked skill increases in volume
- **ADV-03**: Share keyword results via a unique URL

## Out of Scope

| Feature                     | Reason                                           |
| --------------------------- | ------------------------------------------------ |
| User authentication (v1)    | No accounts needed; public tool for v1           |
| Paywall / paid tier (v1)    | Monetization model TBD; email list first         |
| Real-time trend data (v1)   | Requires historical data storage; deferred to v2 |
| Mobile app                  | Web-first; mobile later                          |
| Multi-language (non-French) | France/EU market first                           |
| Long-term keyword database  | Live API calls are simplest for v1               |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status  |
| ----------- | ----- | ------- |
| SRCH-01     | 1     | Complete |
| SRCH-02     | 1     | Pending |
| SRCH-03     | 1     | Complete |
| SRCH-04     | 1     | Complete |
| DASH-01     | 3     | Pending |
| DASH-02     | 3     | Pending |
| DASH-03     | 3     | Pending |
| LAND-01     | 4     | Pending |
| LAND-02     | 4     | Pending |
| LAND-03     | 4     | Pending |
| LAND-04     | 2     | Pending |
| LEAD-01     | 2     | Pending |
| LEAD-02     | 2     | Pending |
| LEAD-03     | 2     | Pending |
| INFRA-01    | 1     | Complete |
| INFRA-02    | 1     | Complete |
| INFRA-03    | 1     | Pending |

**Coverage:**

- v1 requirements: 17 total
- Mapped to phases: 17 ✓
- Unmapped: 0 ✓

---

_Requirements defined: 2026-03-22_
_Last updated: 2026-03-22 after roadmap creation_
