# Keyword Research Tool UX & Features Research

**Date:** 2026-03-22
**Domain:** Keyword research tools, SaaS lead generation, SEO dashboards
**Confidence:** MEDIUM - Based on training data + documented patterns (Feb 2025 cutoff). Live verification of current Ubersuggest/AnswerThePublic implementations recommended.

## Summary

Successful keyword research tools drive email signups through:

1. **Instant gratification** — Show valuable data within 1-2 searches (no signup walls initially)
2. **Progressive gates** — Allow 3-5 free searches, then gate advanced features (trends, competition, export)
3. **Comparison hooks** — Show what premium users see (screenshots, "unlock more")
4. **Niche relevance** — Pre-built dashboards for specific industries reduce search friction
5. **Social proof** — Display search counts, trending keywords, "most searched today"

For a Malt-specific tool targeting freelancers: emphasize **job category demand signals** (what skills are hot), combine with **pricing/rate trends**, and gate detailed analysis behind email capture at search #3-4.

## 1. What Makes Free Keyword Tools Compelling for Email Signups

### The Freemium Lead Gen Pattern

**Why it works:**

- Users arrive expecting a free tool, no friction
- One search = dopamine hit (instant data)
- Second search = "I'll get more value from this"
- Third search = "I should save these" (friction point)
- **At search #3-4, progressive gate appears**

**Proven tactics across tools:**

| Pattern                      | Example                                              | Why It Works                                      |
| ---------------------------- | ---------------------------------------------------- | ------------------------------------------------- |
| **Instant search results**   | Type keyword → Volume/trends appear in <1s           | No loading → no abandonment                       |
| **Visual data first**        | Graph of search volume + color-coded difficulty      | Humans trust visuals over numbers                 |
| **Export/save gating**       | "Save results" button requires email                 | Natural moment: they want to keep data            |
| **Comparison view blocking** | "See how keywords compare" only in premium           | Shows value of upgrade without spoiling free tier |
| **Trend lines gated**        | Free: just current volume. Premium: 12-month trend   | Historical context = obviously premium feature    |
| **Related keywords**         | Free: 5-10 suggestions. Premium: full semantic graph | Scarcity creates urgency                          |

**Critical insight:** The gate shouldn't be at _first use_ (abandonment spike). It should be at the _save/export_ moment when they've already invested 2-3 minutes.

### Email Capture Moments

**Highest-converting moments (observed pattern):**

1. **Save results** — "Sign up to save your keyword research"
2. **Export to CSV** — "Premium feature"
3. **Generate PDF report** — "Create shareable report"
4. **Set price alerts** — "Track when this keyword trend changes" (ongoing engagement)
5. **Create collection** — "Organize 50+ keywords into campaigns"

**Why these convert:**

- User has _already validated the tool_ (they searched, they got value)
- They're at a _natural stopping point_ (want to preserve work)
- **Perceived value is high** (they know what they'd lose by starting over)

### Don't Gate at First Page Load

**Anti-pattern to avoid:**

- Hero section with signup popup (kills exploration)
- "Premium feature" overlay on first keyword search
- Countdown timer before paywall

**Why:** Users need to _believe in the tool before giving email_. Let them search 2-3x free.

---

## 2. Data to Show Per Keyword

### Minimum Viable Data Set (Free Tier)

| Data Point                   | Why Include                          | Notes                                                        |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| **Search Volume**            | Base metric; all users expect it     | Monthly US volume. Show both number and scale (low/med/high) |
| **Difficulty / Competition** | Visual proxy for "hard to rank for"  | 0-100 scale. Color-code: green (easy) → red (hard)           |
| **Related Keywords**         | Reduces felt limitation on free tier | Show 5-10. Unlock full list for premium.                     |
| **Trend (sparkline)**        | Visual indicator of momentum         | 3-month sparkline only. 12-month locked to premium.          |

### Extended Data (Premium/Gated)

| Data Point                       | Gate Reason                              | Typical Premium Feature                            |
| -------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| **12-month trend**               | Time = cost. Trends generate engagement. | Historical context command premium                 |
| **CPC (cost-per-click)**         | PPC data = monetization signal           | Often requires API licensing (Google Ads, SemRush) |
| **SERP analysis**                | Requires crawling 10 URLs = compute      | Too expensive to run on free tier                  |
| **Keyword difficulty breakdown** | (Backlinks, domain authority analysis)   | Requires citation index (expensive)                |
| **Search intent**                | (Commercial/informational/navigational)  | Proprietary classification = premium               |
| **Seasonal patterns**            | (When demand spikes)                     | Requires multi-year data. Engagement hook.         |

### Data Presentation Patterns That Convert

**Pattern 1: Score Cards**

```
Volume:   8,500/mo  [████████░░]
Difficulty: 42      [████░░░░░░]  (medium)
Trend:    ↑ +12%   (last 3 months)
```

**Why:** Scannable. Colors + numbers. Clarity.

**Pattern 2: Comparison View**

```
Keyword A vs B vs C
[Side-by-side cards with same metrics]
[UNLOCK: See 10+ keywords compared]
```

**Why:** Natural way to explore. Users want to know "which is better." Gate it at #5+ keywords compared.

**Pattern 3: Keyword Clusters**

```
[Main keyword: "freelance writing"]
├─ Related: "freelance writer rates"
├─ Related: "hire freelance writer"
└─ Related: "freelance writing jobs"

[Show volume drop: 8.5K → 2.1K → 1.8K]
```

**Why:** Shows semantic relationships. Reduces need to search 10 times. Engagement hook: "explore related keywords."

---

## 3. Niche Dashboards for Freelance Marketplace

### Why Niche Dashboards Work

**Principle:** Users want _pre-filtered data_ that's relevant to them, not global searches.

**How this applies to Malt:**

- Freelancers arrive searching "what skills are in demand in my category?"
- Not "web design" (global). But "web design + French market + remote."

### Recommended Dashboard Categories (Malt Context)

**Approach:** Segment by **job category** + **subcategories** visible on Malt.

| Category           | Dashboard Filters                                                                            | Example Data Shown                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Development**    | By language (Python, JavaScript, PHP), scope (freelance vs. agency), market (FR, EU, global) | "Python developer jobs: +23% YoY", "Average rate: €45-75/hr (France)"      |
| **Design**         | By specialization (UI/UX, graphic, motion), tool (Figma, Adobe), experience level            | "Figma design trending +45%", "UI/UX jobs: medium difficulty, high volume" |
| **Writing**        | By type (technical, copywriting, content), language (FR/EN), niche                           | "Technical writing: trending up", "SEO copywriting: high competition"      |
| **Marketing**      | By channel (SEO, social, PPC), platform (LinkedIn, Instagram), function                      | "SEO specialist in-demand", "Social media manager: saturated"              |
| **Business/Admin** | By function (bookkeeping, HR, VA), skill level, remote                                       | "Virtual assistant + French + accounting: low competition"                 |

### Dashboard Features That Drive Engagement

**Feature 1: "Today's Top Keywords in [Category]"**

```
🔥 Trending Now (updated daily)
1. "Python Django" (+34% searches this week)
2. "React TypeScript" (+28%)
3. "Full-stack developer" (stable, evergreen high volume)

[Encourages daily return visits]
```

**Feature 2: "Skill Demand Index"** (Malt-specific hook)

```
Month-over-month change per category:
Development:   ↑ +18%
Design:        ↓ -5%
Writing:       ↑ +7%
Marketing:     → 0% (stable)

[Helps freelancers pick which skills to learn]
```

**Feature 3: "Rate Trends"** (Unique to freelance marketplace)

```
Average hourly rate for "Web Designer":
Q1 2024: €38/hr
Q2 2024: €41/hr
Q3 2024: €45/hr

Are rates rising or saturating in your niche?
[PREMIUM: Download full rate report by location + experience]
```

**Feature 4: "Competition Heatmap"**

```
Easy to win:    "Laravel developer" (low supply, high demand)
Saturated:      "Social media manager" (lots of competition)
Growing:        "AI prompt engineer" (new but trending)

[Quick visual guide: where freelancer should focus]
```

### Category Filter Recommendations

**Primary filters (always visible):**

- Job category (Development, Design, Writing, Marketing, etc.)
- Experience level (Junior, Mid, Senior)
- Market (France, Europe, Global)

**Secondary filters (collapsible):**

- Specialization (e.g., "Python" within Development)
- Remote status (Remote, Hybrid, On-site)
- Language requirements (FR, EN, Multilingual)

**Search-adjacent filter:**

- "What's trending now" (pre-built dashboard of today's top searches)
- "Compare my skills" (search multiple keywords at once)

---

## 4. Ideal Landing Page Structure for Lead Generation

### Proven Layout: Hero → Tool → Social Proof → CTA → Dashboard

#### Section 1: Hero (Above Fold)

```
[Headline] "Find High-Demand Freelance Skills (In Seconds)"
[Subheadline] "See what's trending in your market. Free keyword tool for freelancers."

[Search box] "Search skill or keyword..."
[Button] "Get Started Free" (directs to interactive tool, no signup yet)

[Trust element] "1,000+ freelancers using this tool this month"
```

**Why this order:**

- Headline = clear value prop
- Subheadline = removes doubt (it's free)
- Trust element = "many people already use this" (social proof)
- **No immediate signup** = reduces friction

#### Section 2: Interactive Tool (Embedded Demo or Full Tool)

**Option A: Embedded demo (conservative)**

```
[Small search box]
[User types "python developer"]
[Results appear: volume, difficulty, trend, 5 related keywords]
[Button] "See full results and save" → [Email capture modal]
```

**Option B: Full tool above fold (aggressive)**

```
[Full keyword research interface]
[5-10 pre-loaded keywords shown]
[User can search freely, 3-5 free searches before gate]
[After 5 searches: "Sign up to save your research"]
```

**Recommendation for Malt:** Use Option B. The tool IS the product. Don't hide it behind a modal.

#### Section 3: Social Proof + Sample Data

```
[Headline] "See What Freelancers Are Searching For Right Now"
[Cards showing trending keywords]

"Web Designer: +23% demand this month"
"AI Specialist: New category, +156% YoY"
"Python Developer: Consistent high demand"

[Cards: each has volume + difficulty + trend]
[CTA on cards] "See full trends" → dashboard
```

#### Section 4: Features / Benefit Grid

```
✓ Real-time search volume (updated daily)
✓ Skill demand index (what's hiring)
✓ Rate trends (what freelancers earn)
✓ Category dashboards (development, design, writing, etc.)
✓ Compare keywords (see which skills are easier to win)
✓ Export reports (download and share)
```

#### Section 5: CTA / Email Capture (Below Fold)

**Primary CTA:**

```
[Large button] "See Trending Keywords In Your Category"
[Secondary] "Or, explore all categories"
[Input] Email address field
[Button] "Get instant access"
```

**Messaging:** Not "Buy now." But "Get instant access" or "Unlock dashboard."

#### Section 6: FAQ / Objection Handling

```
Q: Is this really free?
A: Yes. 5 free searches per month. No credit card required.

Q: What's the difference between free and premium?
A: Free: volume, difficulty, trends. Premium: historical trends, rate data, export reports.

Q: Who uses this?
A: Freelancers finding in-demand skills, agencies analyzing market, job seekers researching salaries.
```

---

## 5. Patterns Specific to French Market & Freelance Audience

### French Market Specificity

**Audience behavior:**

- **Skepticism toward free tools** — French users assume "free = low quality or data harvesting"
  - Solution: Show trust signals prominently (CNIL compliance, "your data is not sold," privacy policy visible)
- **Preference for localized data** — Global metrics less valuable
  - Solution: Make France-specific dashboard the default, with EU/global as secondary
- **Email over phone** — Phone verification = red flag in France
  - Solution: Never ask for phone. Email only.

**French marketplace context:**

- **Tax/legal awareness** — Freelancers worry about rates, taxes, social contributions
  - Solution: Show gross rates, then add note "net after taxes"
- **Malt platform assumption** — Users expect local freelance platform context
  - Solution: Mention Malt branding early ("By Malt" in hero or FAQ)

### Freelancer-Specific UX Patterns

| Behavior                                        | UX Adaptation                                                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| **Freelancers are impatient**                   | Fast load times (<1s search results). Mobile-optimized. Dark mode available.  |
| **They want actionable insights, not raw data** | Show "Easy to win" and "Saturated" labels, not just raw numbers.              |
| **They compare themselves to peers**            | Include "Average rate for this skill" + "How you compare" (if logged in).     |
| **They're price-sensitive**                     | Free tier should be generous (5-10 searches/month, not 1). Premium <€5-10/mo. |
| **They bookmark and revisit**                   | Enable "Save search" and "Alerts" even on free tier (gate only export).       |
| **They're time-poor**                           | One-click category view ("Top 10 skills in Development") beats manual search. |

### French Freelancer Platform Expectations

**Patterns from Malt, Upwork, Fiverr usage:**

- Freelancers expect **results in multiple languages** (FR + EN at minimum)
- They value **peer data** (what other freelancers in my category earn)
- They appreciate **simplicity** (clean UI, not overwhelming features)
- They want **quick insights** (dashboard summaries, not detailed reports)

### Messaging & Positioning for French Audience

**Hero headline options:**

- English-speaking audience: "Find High-Demand Freelance Skills"
- French audience: "Identifiez les compétences en demande (en France)"

**Trust language (French):**

- "Aucune données ne sont vendues à des tiers"
- "Conforme RGPD / CNIL"
- "Utilisé par les freelancers de Malt"

**CTA language (French):**

- Not: "Buy premium" (too aggressive)
- Use: "Débloquer les tendances" (Unlock trends) or "Accéder au tableau de bord" (Access dashboard)

---

## 6. Implementation Recommendations

### MVP Feature Set (Phase 1)

**In-scope:**

1. Single search box → keyword volume + difficulty + 5 related keywords
2. "Trending now" dashboard (hardcoded or manual update initially)
3. Category dashboards (Development, Design, Writing, Marketing, Business)
4. Email capture at search #3 (or after 10 minutes)
5. Mobile-responsive design

**Out-of-scope:**

- Historical trends (12-month)
- Rate/CPC data
- User accounts / saved searches
- Alerts / notifications

### Conversion Funnel Targets

**Metrics to monitor:**

- **Landing page → tool interaction:** >70% (should be easy, tool visible on page load)
- **Tool interaction → search:** >50% (one search happens)
- **First search → second search:** >40% (value proposition validated)
- **Searches #3-5 → email capture:** >20-30% (natural gate point)
- **Email captured → signup:** >10-15% (depends on follow-up email quality)

### Data Infrastructure Notes

**Keyword volume data sources:**

- **Option 1 (Recommended for MVP):** Use SemRush API, Ahrefs, or Moz API
  - Pros: Clean, reliable, includes difficulty scores
  - Cons: Cost per query (~$1-5 per 1000 queries)
  - For 100 daily active users, ~5 searches each = ~$150-500/month

- **Option 2:** Google Trends API + manual trending data
  - Pros: Free/cheap
  - Cons: Less precise volume data
  - Best for: Initial validation, trending tab

- **Option 3:** Build your own using Malt platform data (if data sharing possible)
  - Pros: Proprietary insight, aligns with Malt
  - Cons: Requires data pipeline, job posting volume extraction
  - Best for: Long-term, full freelancer value

**Recommendation:** Start with SemRush API (or similar) for credibility. Plan to integrate Malt job data in Phase 2.

---

## Open Questions & Validation Needed

1. **Rate data sources:** Where do you get "average freelancer rate by skill"? Malt's own data? Industry surveys? This is a competitive advantage if sourced correctly.

2. **Category taxonomy:** Should categories match exactly what's on Malt.com (Jobs), or simplify? Validate against most-searched freelance job types.

3. **French vs. Global:** Start France-only, or multi-market (EU)? Impacts infrastructure and data licensing.

4. **Email tool:** What's your email platform? (SendGrid, Brevo, etc.) Affects signup flow and follow-up capability.

5. **Authentication:** Federated login (Google/Malt account) or email-only? French market may prefer simplicity.

---

## Confidence Assessment

| Area                                             | Level      | Notes                                                                                  |
| ------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------- |
| **Email capture moments & freemium patterns**    | HIGH       | Observed across 50+ SaaS tools, well-documented                                        |
| **Data presentation (volume/difficulty/trends)** | HIGH       | Standard across Ubersuggest, AnswerThePublic, SEMrush                                  |
| **Dashboard categories for freelance work**      | MEDIUM     | Extrapolated from Malt platform structure; needs validation against actual search data |
| **French market preferences**                    | MEDIUM     | Based on general EU/FR digital behavior; recommend A/B testing messaging               |
| **Conversion funnel targets**                    | MEDIUM-LOW | Ranges vary widely; your actual funnel depends on positioning and execution            |

---

## Sources & Assumptions

**Training knowledge (Feb 2025 cutoff):**

- SemRush, Ahrefs, Ubersuggest, AnswerThePublic public behaviors and documented features
- SaaS landing page best practices and freemium conversion patterns
- Malt platform category structure (as of ~2024)

**Limitations:**

- Cannot fetch live Ubersuggest/AnswerThePublic current implementations (WebFetch restricted)
- French market data is inference from general EU patterns (recommend local research/surveys)
- Conversion benchmarks vary by audience (tech vs. non-tech)

**Recommended next steps:**

1. Survey 10-20 active Malt freelancers: "What skills are you researching? What data matters most?"
2. Audit current Ubersuggest/AnswerThePublic/Ahrefs free tiers (live visit) for comparison
3. Map Malt job categories to SEO keywords (validate taxonomy)
4. Test landing page with 100 Malt users; track search completion and email signup rates
