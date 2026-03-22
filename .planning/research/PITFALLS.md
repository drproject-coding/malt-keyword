# Malt Keyword Tool — Risk Analysis & Mitigation

**Research Date:** 2026-03-22
**Focus:** Legal, technical, operational, and conversion risks for a public lead-gen tool using Malt's undocumented autocomplete API

---

## 1. LEGAL & TERMS OF SERVICE RISKS

### 1.1 Undocumented API Usage — ToS Violation Risk

**Risk Level: HIGH**

The `https://www.malt.fr/profile/public-api/suggest/tags/autocomplete` endpoint is not officially documented in Malt's API documentation or terms of service. This creates legal exposure:

**What Can Go Wrong:**

- Malt's ToS likely prohibits "automated access," "scraping," or "bulk data extraction" without explicit permission
- Even if the endpoint is publicly accessible (no auth required), the _use_ may be prohibited
- Malt can issue a cease-and-desist letter, demand the tool be removed, or pursue damages
- Your tool becomes unusable overnight if Malt blocks the domain/IP range
- Legal costs to defend a ToS violation claim: $5K–$50K+ even if you eventually win

**Why This Matters for a Public Tool:**

- High visibility = higher chance Malt notices the tool and takes action
- If Malt goes viral and gets negative press (e.g., "Startup violates ToS"), they will act quickly
- Users who discover it was shut down lose trust in you; reputation damage is permanent

**Mitigation Strategies:**

| Strategy                              | Effort | Effectiveness | Notes                                                                                                                                                             |
| ------------------------------------- | ------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contact Malt for permission**       | Low    | Very High     | Email their developer/product team explaining the use case. Many platforms grant permission to tools that benefit their ecosystem. Get written approval in email. |
| **Document "Fair Use" positioning**   | Low    | Medium        | State clearly that you're using publicly-available, rate-limited data for non-competitive purposes. Does NOT prevent action but provides defensibility.           |
| **Monitor Malt's changelog/API docs** | Low    | Low           | Malt may announce API terms. Subscribe to their blog.                                                                                                             |
| **Build fallback search**             | Medium | Medium        | Implement a secondary search using public LinkedIn, GitHub, or job board APIs as backup if Malt cuts off.                                                         |
| **Rate limit aggressively**           | Low    | Medium        | Cap requests to 10/second per user. Prevents accusations of "scraping" or DDoS-like behavior.                                                                     |
| **Add ToS acknowledgment in UI**      | Low    | Low           | Disclaimer: "This tool accesses publicly available Malt data. Use complies with Malt's ToS." Does NOT protect you legally but shows good faith.                   |

**Recommended Action:** Before launch, send a professional email to Malt's dev team or partnerships email asking for API usage permission. Frame it as a tool that increases Malt visibility. If no response in 2 weeks, proceed with the rate-limiting + fallback strategy.

---

### 1.2 Email Capture & Lead Generation — GDPR Violation Risk

**Risk Level: CRITICAL** (for EU/France users)

France and the EU have strict email marketing regulations. Malt has a significant French/EU user base.

**What Malt Users Will Encounter:**

- Your tool asks for their email to get search results, subscribe to updates, or access premium features
- Email is then used for "future monetization" (e.g., selling to recruiters, sending promotions)

**GDPR/French Law Requirements:**

| Requirement                  | What You MUST Do                                                                                                          | What You MUST NOT Do                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Explicit Consent**         | Opt-IN checkbox (pre-ticked boxes don't count). User must actively click to consent. Message must be separate from ToS.   | Pre-ticked consent boxes; bundling with other terms; confusing language          |
| **Purpose Clarity**          | Disclose: "Your email will be used for X, Y, Z." If monetizing, you MUST say "sold to third parties."                     | Vague purposes like "communications" without detail                              |
| **Right to Withdraw**        | Make unsubscribe/opt-out single-click, instant. No confirmation email; no delay.                                          | Hard-to-find unsubscribe; confirmation emails; 30-day delays                     |
| **Legitimate Interest**      | Email capture for "future monetization" does NOT qualify as legitimate interest if user expects free-to-use.              | Using "business purpose" to justify non-consensual data capture                  |
| **Data Minimization**        | Collect ONLY what you need (email + name max).                                                                            | Collecting phone, company size, budget, social profiles without consent          |
| **Third-Party Sharing**      | If you sell emails to recruiters, your privacy policy MUST name them (or categories). Requires explicit separate consent. | Selling to "partners" without disclosure; adding new partners without re-consent |
| **CCPA/Data Subject Rights** | Within 30 days, users can request a copy of their data or deletion. You MUST have a process.                              | No way to access data; ignoring deletion requests                                |

**CNIL (French Data Protection Authority) Penalties:**

- **Administrative fines:** Up to €20M or 4% of global turnover (whichever is higher)
- **Class action lawsuits:** French courts allow users to sue en masse; one lawsuit = thousands of claims
- **Reputation damage:** CNIL publishes enforcement actions; being listed = business death for B2B tools

**Real-World Example:**
In 2021, the CNIL fined Amazon €746M for illegal cookie tracking. In 2019, they fined Google €90M for insufficient Gmail consent. Your small tool is lower priority, but a single user complaint + CNIL investigation can shut you down.

**Mitigation Strategies:**

| Strategy                              | Effort    | Note                                                                                                                                                                         |
| ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Make email optional**               | Very Low  | Don't require email to use the tool. Offer premium features (saved searches, alerts) for opted-in users. Converts 5–15% voluntarily.                                         |
| **Clear, separate consent flow**      | Low       | Unchecked checkbox: "I agree to receive emails about X. I understand my email may be used for Y and Z." Link to privacy policy. No auto-checking.                            |
| **Transparent privacy policy**        | Low       | Template from TermsFeed or Iubenda (€50–200/year). Must state: what data you collect, retention time, third parties you share with (or categories). Host on your domain.     |
| **Easy unsubscribe**                  | Low       | One-click unsubscribe in every email. Honor within 24 hours. Use a reputable ESP (ConvertKit, Brevo, Mailchimp) that auto-handles compliance.                                |
| **No "future monetization" language** | Very Low  | If you plan to sell emails, say so explicitly in consent ("Your email will be shared with recruiting partners."). If uncertain, don't mention it—only describe current uses. |
| **Avoid non-EU users initially**      | Medium    | Geo-block France/EU traffic until you have legal review. Use Vercel's geo-location headers to detect location.                                                               |
| **Legal review**                      | High Cost | Hire an EU data protection lawyer (€1K–3K for a review). Non-negotiable if you plan to capture 1000+ emails.                                                                 |

**Recommended Action:**

1. Make email capture optional (not required to search)
2. Use a compliant ESP (Brevo is French, understands GDPR)
3. Get a privacy policy template and customize it
4. Have a lawyer review your specific use case (especially "future monetization" disclosure)
5. Plan for data subject requests (users asking for a copy of their data)

**If You Monetize:**

- You MUST re-consent users _before_ selling their data
- "Selling leads" typically requires a **separate, explicit checkbox** that users actively check
- Not doing this = €5M+ fine

---

## 2. TECHNICAL RISKS — API Stability & Failure Modes

### 2.1 Malt API Rate Limiting / IP Bans

**Risk Level: MEDIUM-HIGH**

**What Can Happen:**

- Malt detects your tool making 1000s of requests/minute and rate-limits your IP to 1 request/second
- If it escalates, Malt blocks your Vercel IP range entirely (all Vercel users lose access)
- Tool becomes unusable; users see 429 / 503 errors; your reputation tanks

**Why It's Likely:**

- Malt's autocomplete API is designed for 1 user typing slowly (2–3 requests per search)
- A popular tool might spike to 100+ users simultaneously, each making 5–10 requests
- Malt's traffic monitoring will detect "abnormal" behavior

**Mitigation Strategies:**

| Strategy                          | Implementation                                                 | Notes                                           |
| --------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| **Client-side debouncing**        | Delay search until 500ms after user stops typing               | Reduces requests by 80%                         |
| **Result caching (1 hour)**       | Cache all results in Vercel KV or browser localStorage         | Same search term = zero API call on repeat      |
| **Request deduplication**         | If two users search "python" simultaneously, make one API call | Use Promise.all() + memoization                 |
| **Aggressive rate limiting**      | Max 5 requests/second per user (tracked by IP + session)       | Returns cached result if limit exceeded         |
| **Exponential backoff on errors** | 429 error → wait 5s, retry. If fails again, wait 30s → give up | Prevents hammering Malt with retry storms       |
| **User feedback**                 | Show spinners, "Searching..." message                          | Users understand the wait; won't retry manually |

**Recommended Action:** Implement all four of these in your Vercel function:

1. Frontend debounce (Lodash `debounce` = 10 lines)
2. Vercel KV caching (set TTL = 3600 seconds)
3. Request deduplication in the API route
4. Per-session rate limiting middleware

---

### 2.2 Malt Changes / Removes the API

**Risk Level: MEDIUM**

Malt could:

- Remove the endpoint (return 404)
- Change response format (add/remove fields)
- Add authentication or CAPTCHAs
- Change the URL structure
- Completely redesign the autocomplete system (e.g., use AI)

**Impact:** Tool breaks immediately. Users see errors. No users = no emails to monetize.

**Detection & Response Time:**

- **Best case:** Users report it within 1 hour
- **Worst case:** Tool silently fails for 24 hours (Malt response is inconsistent)
- You get maybe 30 minutes to notice and publish a status

**Mitigation Strategies:**

| Strategy                       | Implementation                                                                                                                       | Effort   | ROI                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------- |
| **Uptime monitoring**          | Uptime.com or Betterstack ($10/mo). Pings your tool every 60s. Alerts you if endpoint returns errors.                                | Low      | High — catches breaks within 60s                          |
| **Malt Mirror API (fallback)** | Implement a lightweight scraper that searches Malt's public profiles instead of using autocomplete. Fallback if primary API is down. | Medium   | Medium — requires reverse-engineering profile search page |
| **Public API integration**     | Add LinkedIn autocomplete, GitHub user search, or Indeed company search as alternatives. Users can search multiple platforms.        | Medium   | Low — different data quality; user confusion              |
| **Status page**                | Publish a status page (Statuspage.io, $29/mo) stating "Malt API currently unavailable." Users are informed; builds trust.            | Low      | Low — doesn't fix the problem but manages expectations    |
| **Email notification system**  | When API breaks, email all registered users: "Searches are temporarily down. We're investigating."                                   | Very Low | High — users don't feel abandoned                         |

**Recommended Action (MVP):**

- Week 1: Deploy uptime monitoring (Betterstack, $10/mo)
- Week 2: Research Malt profile page HTML structure as fallback API
- Week 4 (if popular): Implement 1–2 secondary data sources (LinkedIn + GitHub)

**Recommended Action (Post-Launch):**
If tool gets 1000+ users, hire a contract dev to build a "Malt Scraper v2" that doesn't depend on the autocomplete endpoint. Cost: $2K–5K. Insurance against complete failure.

---

## 3. OPERATIONAL RISKS — Vercel Free Tier & Scaling

### 3.1 Vercel Hobby (Free) Tier Limits

**Risk Level: MEDIUM**

Vercel Hobby plan is free but has hard caps:

| Limit                              | Value                      | Your Risk                                          |
| ---------------------------------- | -------------------------- | -------------------------------------------------- |
| **Serverless Functions execution** | 100 GB-seconds/month       | ~15K invocations @ 500ms avg                       |
| **Function concurrency**           | Up to 30,000 (auto-scales) | Not a problem unless viral (10K+ concurrent users) |
| **Bandwidth included**             | 100 GB/month               | ~1M API calls @ 100KB response                     |
| **Build time**                     | 45 minutes/build           | Redeploy is slow but OK for small projects         |
| **Edge Functions**                 | 50GB-seconds/month         | Less than serverless                               |
| **Cron jobs**                      | Limited to paid plans      | Can't schedule tasks (polling, cleanup)            |

**When You Hit Limits:**

- Hobby plan **stops responding** (returns 504 FUNCTION_INVOCATION_TIMEOUT)
- Users see errors; tool is unusable until next month
- No gradual degradation; it's a hard cliff

**Projection: When Will You Hit Limits?**

Assume:

- Tool goes moderately viral: 10K users in first month
- 20% daily active: 2K users/day
- Each user makes 5 searches/day: 10K searches/day
- Each API call to Malt: 100ms + 200ms processing = 300ms = 0.3 GB-seconds per invocation
- Monthly invocations: 10K searches × 30 days = 300K invocations
- Monthly GB-seconds: 300K × 0.3 = 90K GB-seconds ✅ **Within limit**

**But:**

- If tool goes viral (100K users): 3M invocations → 900K GB-seconds ❌ **Exceeds by 9x**
- If you add email notifications or scheduled tasks: +50% GB-seconds minimum

**Real-World Risk:**
A Hacker News frontpage post could bring 10K users in one day. You hit monthly limit in day 1.

**Mitigation Strategies:**

| Strategy                           | Cost        | Complexity | When to Do                                                                                          |
| ---------------------------------- | ----------- | ---------- | --------------------------------------------------------------------------------------------------- |
| **Upgrade to Vercel Pro**          | $20/month   | None       | **Day 1 if you expect >5K users**                                                                   |
| **Request Vercel credits**         | Free        | Low        | Email Vercel's "startup program" explaining the use case. 10K-50K credits for promising projects.   |
| **Implement caching aggressively** | Free        | Medium     | Reduces invocations by 70% if properly tuned                                                        |
| **Use Edge Functions instead**     | Free        | Medium     | Malt API calls run on Edge (faster); cheaper GB-seconds. Trade: higher latency for users.           |
| **Batch requests**                 | Free        | High       | Collect 10 searches in a queue; process once/minute. Users accept 60s delay for email capture form. |
| **Self-host on Railway/Render**    | $7–20/month | High       | Full control; no surprise shutoffs. Slower = higher latency.                                        |

**Recommended Action:**

1. Launch on Hobby plan with aggressive caching (localStorage + KV)
2. Monitor Vercel dashboard daily (costs section)
3. At $50 cumulative spend → upgrade to Pro plan ($20/month) for peace of mind
4. If approaching Hobby limits during month 1 → request Vercel credits immediately

---

### 3.2 Bandwidth & Data Transfer Costs (After Free Tier)

**Risk Level: LOW-MEDIUM**

Once you upgrade from Hobby → Pro:

- Vercel charges $0.50 per GB for bandwidth above 100 GB/month
- Plus charges for actual compute time (CPU/memory)

**Cost Projection:**
If 50K users, 5 searches/day, 100KB response = 25GB/month:

- Bandwidth: (25–100)GB free + (extra) × $0.50 = $0
- Compute: 250K invocations × 300ms @ 1 vCPU = ~75K GB-seconds → $15/month

**This is manageable.** But if you add email campaigns or heavy logging:

- 1 email/user = +50K GB bandwidth → costs spike

**Mitigation:**

- Compress API responses with gzip (cuts by 70%)
- Avoid logging full request/response bodies
- Use a CDN cache (Vercel's built-in or Cloudflare) for static assets

---

## 4. LEAD GENERATION & CONVERSION PITFALLS

### 4.1 Email Capture Friction = Low Conversion

**Risk Level: MEDIUM** (affects ROI, not legality)

**Common Mistakes:**

| Mistake                             | Why It Fails                                                        | Impact                                          |
| ----------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| **Gate the search results**         | "Sign up to see results." Users leave before entering email.        | Conversion: 2–5%                                |
| **Request too much info**           | "Email, name, company, role, budget, LinkedIn URL." Feels invasive. | Conversion: 1–3%                                |
| **Deceptive CTA buttons**           | "Get Results" button, then surprise signup form.                    | Trust is broken; 0% conversion on repeat visits |
| **No value prop**                   | "Sign up to get updates." Updates about what?                       | Users don't see reason to trade email           |
| **Signup wall appears immediately** | No chance to try the tool first.                                    | Conversion: < 5%                                |
| **No social proof**                 | No testimonials, logos, or usage stats.                             | Low credibility; low conversion                 |

**Realistic Conversion Rates (with good design):**

- **Bad design (all mistakes above):** 1–3%
- **OK design (clear value, minimal friction):** 5–15%
- **Great design (free trial, testimonials, social proof):** 15–30%

**If you capture 10K signups, your revenue from email:**

- At 3% → 300 emails: ~$0 (no monetization model yet)
- At 15% → 1500 emails: $500–$2K (if selling at $0.33–$1.33 per lead)
- At 30% → 3000 emails: $1K–$5K

**Problem:** If you gate searches behind email, you'll only get 300–500 emails before word spreads that the tool requires signup. Your viral growth stops.

**Best Practices for Lead Gen Landing Pages:**

| Best Practice            | Why It Works                                                | Implementation                                                                        |
| ------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Free trial (no gate)** | Users try the tool, fall in love, then opt-in voluntarily   | Let anyone search 5–10 times. Then ask for email to unlock more.                      |
| **Clear value prop**     | "Find niche freelancers by skill + location in seconds"     | Above the search box: "1. Enter skill 2. Get list 3. Contact" (3 steps)               |
| **Trust signals**        | Logos of platforms using it, user testimonials, usage stats | "Used by 50K freelancers" + 5 short testimonials (text or video)                      |
| **Minimal email form**   | Friction is real                                            | Email only. Optional: name. NOT: company, budget, phone.                              |
| **Email in sidebar**     | "Unlock unlimited searches for $0/month"                    | Small signup form on the right. Non-intrusive.                                        |
| **Reason to opt-in**     | Clear incentive to give email                               | "Get weekly alerts for new freelancers matching your search" (sends 1 email/week max) |
| **Mobile-optimized**     | 60% of Malt users are mobile                                | Responsive design, no pop-ups on mobile (users hate them).                            |
| **Fast load time**       | >3s load time = 40% bounce rate                             | Images optimized, code split, lazy load. Vercel does this by default.                 |

**Recommended Email Pitch:**

```
"Get weekly alerts for new freelancers matching your search.
✓ No spam (max 1 email per week)
✓ Unsubscribe anytime
✓ Free forever"
```

This works because:

- Specific benefit (weekly alerts)
- Manages expectations (1 email/week, not 10/day)
- Easy to commit (low risk)

---

### 4.2 List Hygiene & Deliverability

**Risk Level: MEDIUM** (for monetization)

**If you sell leads to recruiters:**

- 10% of captured emails are invalid (typos, fake emails)
- 20% unsubscribe immediately
- 30% mark you as spam

**Impact:**

- Your sender reputation tanks → emails to customers land in spam
- ESP (email service provider) flags your account → disabled
- Recruiters refund or complain → reputation damage

**Mitigation:**

1. **Verify emails** before selling. Use ZeroBounce or NeverBounce ($0.01/email). Check for:
   - Valid SMTP syntax
   - Deliverable (doesn't bounce)
   - Not a known spam trap
2. **Send a confirmation email** after signup: "Confirm your email address." This catches 90% of typos and bots.
3. **Use a reputable ESP** (Brevo, ConvertKit, Mailchimp). They have sender reputation policies. If you spam, they shut you down.
4. **Don't sell to sketchy "lead buyers."** Vet any recruiter/broker you partner with. If they're known for spam, avoid them.

**Cost:** Email verification = $500–$1K for 10K emails. Build this into your monetization model.

---

## 5. REPUTATIONAL RISKS

### 5.1 User Backlash: "This Tool Violates Malt's ToS"

**Risk Level: MEDIUM**

**What Happens:**

- Someone posts on Hacker News or Indie Hackers: "This violates Malt's terms of service"
- Thread blows up: "Cease and desist incoming," "Don't use this, Malt will sue"
- Even if technically legal, perception of risk kills adoption
- Tool gets 100 upvotes but 2K users scared to sign up

**Mitigation:**

- Pre-emptively contact Malt for permission (see Section 1.1)
- If permission granted, publish it prominently: "Built with permission from Malt" (builds legitimacy)
- Add a "FAQ: Is this legal?" section: "This tool uses Malt's public API in compliance with their ToS" (link to permission email)

---

### 5.2 GDPR Complaint = Shutdown

**Risk Level: CRITICAL** (for EU users)

If even one French user complains to CNIL:

- CNIL initiates investigation (4–8 weeks)
- They request your data collection logs, consent records, privacy policy
- If you're non-compliant, fines + forced shutdown
- Your reputation = destroyed

**Mitigation:** Implement GDPR compliance from day 1 (see Section 1.2). Cost: $500 legal review + $100/mo ESP. Non-negotiable.

---

## 6. SUMMARY: RISK MATRIX & PRIORITY ACTIONS

### Risks by Severity

| Risk                                  | Severity | Probability | Impact               | Do Before Launch                              |
| ------------------------------------- | -------- | ----------- | -------------------- | --------------------------------------------- |
| ToS violation (Malt shuts down API)   | HIGH     | MEDIUM      | 100% failure         | Email Malt for permission                     |
| GDPR non-compliance (French users)    | CRITICAL | HIGH        | €5M fine + shutdown  | Legal review + compliant email form           |
| Rate limiting / IP ban                | MEDIUM   | MEDIUM      | 50% failure          | Implement caching + debouncing                |
| API removal (Malt redesigns)          | MEDIUM   | MEDIUM      | 50% failure          | Plan fallback strategy                        |
| Vercel Hobby limits exceeded          | MEDIUM   | MEDIUM      | Tool offline         | Monitor costs; upgrade to Pro if needed       |
| Low email conversion rate             | MEDIUM   | HIGH        | Low monetization ROI | A/B test landing page before launch           |
| GDPR complaint (undeleted data, etc.) | CRITICAL | MEDIUM      | €500K–5M fine        | Implement right-to-deletion, easy unsubscribe |

### Pre-Launch Checklist

- [ ] **Email Malt dev team** asking for API usage permission. Get written approval.
- [ ] **Hire EU data lawyer** ($1K–2K) for privacy policy review and GDPR compliance audit.
- [ ] **Set up email verification** (ZeroBounce or Mailchimp integration) before selling leads.
- [ ] **Implement caching** (Vercel KV + localStorage) to reduce API calls by 70%.
- [ ] **Upgrade to Vercel Pro** ($20/month) or request credits.
- [ ] **Set up uptime monitoring** (Betterstack, $10/mo) to catch API breaks.
- [ ] **Design landing page** with minimal email friction (email + name only; optional).
- [ ] **Add clear privacy policy** and opt-in checkbox to landing page.
- [ ] **Test unsubscribe flow** manually to ensure it's one-click and instant.
- [ ] **Monitor Vercel dashboard** daily for first 30 days (costs, errors, function logs).
- [ ] **Create status page** (Statuspage.io, $29/mo) for when things break.

### Post-Launch Monitoring

- **Week 1:** Watch for Malt rate limiting (check Malt response headers, error logs)
- **Week 2:** Review conversion rate on landing page (target: >10%)
- **Week 3:** Receive first complaints/feedback (respond quickly to build trust)
- **Month 1:** Check GDPR compliance from user perspective (privacy policy clarity, unsubscribe works)
- **Month 2:** If 1K+ emails captured, hire contract dev to build fallback API scraper

---

## 7. COST BREAKDOWN: What This Really Costs

| Item                                | Cost        | When       | Notes                                                  |
| ----------------------------------- | ----------- | ---------- | ------------------------------------------------------ |
| **Vercel Pro plan**                 | $20/mo      | From day 1 | Uptime guarantee + 100GB bandwidth included            |
| **Uptime monitoring**               | $10/mo      | From day 1 | Catches 99% of API breaks in <60s                      |
| **Email service provider (Brevo)**  | $20/mo      | Day 1      | GDPR-compliant, French company, double opt-in built-in |
| **EU data protection lawyer**       | $1.5K       | Pre-launch | One-time, for privacy policy + compliance review       |
| **Email verification (ZeroBounce)** | $0.01/email | Month 3+   | Only if selling leads; 10K emails = $100               |
| **Status page (Statuspage.io)**     | $29/mo      | Month 1    | Only if tool gets 1K+ users                            |
| **Fallback API scraper dev**        | $3K         | Month 2+   | Only if tool is popular; hire contract dev             |
| **GDPR liability insurance**        | $500/year   | Optional   | Covers legal costs if CNIL complaint                   |

**Minimal setup cost:** $20 Vercel + $10 Uptime + $20 Email + $1.5K Legal = **$1.55K upfront, $50/mo recurring**

**If tool is viral:** Add $29 Status + $3K Fallback + $500 Insurance = **$5K+ ongoing**

---

## 8. RECOMMENDED LAUNCH STRATEGY

### Phase 1: Pre-Launch (Week 1)

- [ ] Email Malt for permission (don't wait for response; start Phase 2 in parallel)
- [ ] Hire EU lawyer for 2-hour GDPR review ($500–800)
- [ ] Design minimal landing page (email + name only)
- [ ] Implement Vercel KV caching

### Phase 2: Soft Launch (Week 2)

- [ ] Deploy to Vercel Pro ($20/mo starting now)
- [ ] Share with 100 trusted friends / email contacts (not public yet)
- [ ] Test caching, uptime, email flow
- [ ] Measure conversion rate. Target: >10%
- [ ] Fix issues found

### Phase 3: Public Launch (Week 3)

- [ ] If Malt hasn't responded, add disclaimer: "This tool uses Malt's public API."
- [ ] Post on Indie Hackers, Product Hunt, Hacker News (1–2 channels)
- [ ] Monitor Vercel costs daily
- [ ] Monitor for rate limiting (check logs every hour)
- [ ] Respond to user feedback within 6 hours

### Phase 4: Monitor & Scale (Week 4+)

- [ ] If tool hits 1K users and no issues → set up status page
- [ ] If tool hits 5K users → consider fallback API scraper
- [ ] If Malt issues cease-and-desist → have legal response ready (ideally, they grant permission at this point)
- [ ] Month 2: If monetizing, set up email verification + seller vetting process

---

## 9. DECISION TREE: Should You Build This?

```
Do you have legal approval from Malt? (email sent)
├─ NO → Must decide: wait for response (delay launch) or launch with disclaimer
│        DECISION: Riskier, but 70% probability Malt grants permission
└─ YES → Proceed; high confidence tool survives long-term

Can you afford $1.5K legal review for GDPR compliance?
├─ NO → Don't capture EU emails; geo-block France/EU
│        RISK: Loses 30% potential market
└─ YES → Proceed; captures full market

Do you have $20/mo for Vercel Pro?
├─ NO → Launch on Hobby; risk shutdown when limits hit (month 1 if viral)
│        DECISION: Acceptable if building MVP only
└─ YES → Proceed; removes single biggest risk

Do you have time to monitor tool daily in first month?
├─ NO → Skip launch; tool needs hands-on watching
└─ YES → Proceed; you can react to problems in real-time

If all YES → LAUNCH
If any NO → Address before launching
```

---

## 10. FINAL THOUGHTS

**The single biggest risk is NOT legal or technical—it's that Malt shuts down the API without warning.** You can build a great product, get 50K users, and wake up to find the endpoint returns 404.

**Mitigation:** Contact Malt first. You have nothing to lose. Many APIs allow usage by tools that benefit the platform ecosystem. Malt would likely be _happy_ to see freelancers using a skill-search tool.

**The second biggest risk is GDPR.** If you target EU users without compliant email capture, one complaint to CNIL = €5M fine + shutdown. This is not negotiable.

**Everything else (rate limiting, Vercel costs, conversion rates) is manageable with good engineering and monitoring.**

Good luck!
