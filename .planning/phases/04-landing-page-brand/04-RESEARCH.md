# Phase 4: Landing Page & Brand - Research

**Researched:** 2026-03-25
**Domain:** Next.js 14 App Router landing page with real-time social proof (live API leaderboard), client-side scroll interactions, and post-verification success UX
**Confidence:** HIGH

## Summary

Phase 4 wraps the existing search tool and email gate (Phase 1–2) in a complete marketing landing page. The architecture is straightforward: hero → leaderboard (4 parallel API calls) → CTA button → existing search/gate → FAQ. All interactions are client-side via "use client" components. The main implementation challenges are not technical complexity but rather UX consistency (Harry Dry copy framework) and animation polish (fade-in sequences for leaderboard cards).

The codebase already has the foundational patterns in place: SWR for fetching, Tailwind for styling, `"use client"` on the page, and localStorage for state management. Leaderboard can reuse the `KeywordCard` component with a rank prefix. Scroll-to-search uses ref-based approach (safer than querySelector for dynamic DOM). Post-verification success state is a lightweight inline component with CSS fade transition. FAQ works as static list (no accordion needed for 5 items).

**Primary recommendation:** Build leaderboard with Promise.all + useEffect (no custom fetch utility needed), use KeywordCard variant with rank number, implement scroll via useRef on search input, post-verification with inline component + setTimeout for auto-dismiss, and extend Tailwind theme with custom fade-in animations for leaderboard stagger.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero Section:**

- D-01: Headline + subheadline above the fold — marketing text first, then leaderboard, then search box
- D-02: Copy targets Malt freelancers specifically — references their pain point (wrong keywords = invisible = zero contacts)
- D-03: Copy must pass Harry Dry's three tests (visualizable, falsifiable, only-this-tool-can-say-it) — APPLY RIGOROUSLY
- D-04: Navigation is Claude's discretion (minimal or none for v1 acceptable)

**Leaderboard (Social Proof):**

- D-05: 4 keyword cards fetched live on page load — 1 random keyword per niche (tech, design, project, devops)
- D-06: Ranked #1–4 with label + volume count. Reuse KeywordCard or leaderboard variant
- D-07: Positioned ABOVE search box — Sequence: Hero → Leaderboard → CTA → Search → Results → FAQ
- D-08: Live API calls every page load (no static data). Numbers refresh on every visit

**CTA Placement:**

- D-09: CTA between leaderboard and search box
- D-10: Label must pass Harry Dry tests (concrete, visualizable, falsifiable, only-we-can-say-it)
- D-11: Clicking CTA → scroll to search input (no immediate email gate). Shows brief scroll-nudge copy ("Try it — search any skill")
- D-12: Additional CTAs below hero and above FAQ use same scroll-nudge behavior

**FAQ Content:**

- D-13: 5 locked items with locked copy (accuracy > edit)
  1. "Why are these numbers accurate?" → "Based on real Malt platform data — the same source Malt uses when you add a skill to your profile."
  2. "Can Malt shut this down?" → "The data exists on Malt's platform. We just make it searchable."
  3. "Will my email be sold?" → "Never. Unsubscribe in one click."
  4. "Is this tool free?" → "Yes, completely free"
  5. "How often is the data updated?" → "Data is live — pulled fresh from Malt every time you search. Results reflect today's numbers"
- D-14: Tone: blunt, short. One Mississippi test — if > 2 seconds to read, rewrite

**Post-Verification Success Moment:**

- D-15: After email link click, show brief success state BEFORE tool loads — not silent redirect. Copy: "You're in — start searching"
- D-16: Lightweight inline state, auto-resolves 2–3 seconds or on first search

### Claude's Discretion

- Exact headline and subheadline copy (apply Harry Dry tests — concrete, falsifiable, only-we-can-say-it)
- CTA button exact label (same copy tests)
- Leaderboard visual design — spacing, rank indicator style, animation on load
- Success moment animation/timing
- Navigation bar design (if included)
- Mobile layout specifics
- FAQ accordion vs. static list

### Deferred Ideas (OUT OF SCOPE)

- A/B test French vs. English headline — post-launch
- "10K+ freelancers" social proof number — requires tracking data
- Animated keyword ticker — deferred for simplicity
- Dashboard category tabs on landing page — Phase 3, not Phase 4
- Admin analytics dashboard — v2 (ANLT-04)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID          | Description                                                                                | Research Support                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LAND-01** | Page has hero section with value proposition and search box visible above fold             | Hero structure locked (D-01); copy framework (D-03) provides clear methodology; page.tsx already "use client" so no SSR/SSG complexity                                       |
| **LAND-02** | Social proof block shows pre-loaded popular keywords with volume data before user searches | Leaderboard pattern (D-05 to D-08): 4 parallel API calls via Promise.all in useEffect, reuse KeywordCard component with rank variant, live fetch on mount avoids static data |
| **LAND-03** | FAQ section addresses common questions and skepticism                                      | D-13 specifies 5 locked items; static list is simpler than accordion for this count; no need for disclosure/details pattern                                                  |

</phase_requirements>

## Standard Stack

### Core (Verified Against Installed Packages)

| Library          | Version | Purpose                                                      | Why Standard                                                                                                                        |
| ---------------- | ------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js**      | 14.2.0  | App Router framework, API routes, deployment target (Vercel) | Already the foundation; Phase 1–2 established the pattern. `"use client"` on page.tsx supports client-side fetching for leaderboard |
| **React**        | 18.3.0  | Component library, hooks for state/effects                   | Already in use; `useEffect`, `useState`, `useRef` are the standard patterns here                                                    |
| **SWR**          | 2.2.0   | Data fetching with deduplication and caching                 | Already used in `useSearch` hook; proven pattern for API calls with built-in HTTP cache support (Cache-Control headers respected)   |
| **Tailwind CSS** | 3.4.0   | Utility-first styling, responsive design                     | Already the styling approach throughout; no CSS modules used. Provides utilities for animations out of the box                      |

### Supporting (For Phase 4 Specific Patterns)

| Library          | Version | Purpose                                                  | When to Use                                                                  |
| ---------------- | ------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **lucide-react** | 1.6.0   | Icon library for UI polish (chevrons, check marks, etc.) | For FAQ section, rank badges, or scroll-to-top indicators                    |
| **clsx**         | 2.1.1   | Conditional className merging                            | Used throughout codebase for conditional Tailwind classes (e.g., blur state) |

### Already Proven in Codebase

- **localStorage API** — Phase 2 uses it for email gate state; can also track leaderboard visibility for analytics
- **Next.js API routes** `/api/malt/autocomplete` — leaderboard reuses existing endpoint with 4 parallel calls
- **useRef + scrollIntoView** — smooth scroll pattern available natively in browser

### Alternatives Considered

| Instead of                       | Could Use                                  | Tradeoff                                                                                                                                                     |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Promise.all for parallel fetches | Sequential fetches with await              | Promise.all is 4x faster (all in parallel) vs sequential (waterfall). Required for <1s leaderboard load target                                               |
| SWR for leaderboard              | Fetch + useState + useEffect               | SWR provides built-in HTTP caching layer, deduplication, and error handling. Manual fetch requires custom cache logic                                        |
| Static leaderboard data          | Pre-fetched seed keywords                  | Locked requirement: "live API calls every page load" (D-08). Static data doesn't meet "fresh every visit" criterion                                          |
| Scroll via querySelector         | useRef on input element                    | useRef is type-safe and doesn't rely on DOM query selectors that can break if HTML structure changes. Ref is more reliable for component-internal references |
| CSS animations                   | Inline styles or JavaScript animation libs | Tailwind animations (animate-fade-in, animate-pulse) are available with zero dependency overhead; custom @keyframes in globals.css allows advanced sequences |

### Installation

No new packages needed — all dependencies already in package.json. If animations require custom keyframes, add to `src/app/globals.css` only.

**Version verification (as of research date 2026-03-25):**

| Package      | Installed | Latest | Status                                              |
| ------------ | --------- | ------ | --------------------------------------------------- |
| Next.js      | 14.2.0    | 15.1.x | Stable; no immediate upgrade needed                 |
| React        | 18.3.0    | 19.x   | 18.3.0 is LTS-like; 19.x available but not required |
| SWR          | 2.2.0     | 2.3.x  | Stable; current version sufficient                  |
| Tailwind CSS | 3.4.0     | 4.x    | 3.4.0 works well; 4.0 is very new (2025)            |

---

## Architecture Patterns

### Recommended Project Structure

For Phase 4, extend existing structure:

```
src/
├── app/
│   ├── page.tsx                    # [MODIFY] Add hero + leaderboard + FAQ sections
│   ├── layout.tsx                  # [MODIFY] Update metadata for landing page
│   └── globals.css                 # [MODIFY] Add custom animation keyframes
├── components/
│   ├── KeywordCard.tsx             # [REUSE] Existing; extend with rank variant
│   ├── Leaderboard.tsx             # [NEW] Renders 4 ranked cards with fade-in stagger
│   ├── Hero.tsx                    # [NEW] Headline + subheadline section
│   ├── FAQ.tsx                     # [NEW] Static 5-item list (or details/summary if needed)
│   ├── CTAButton.tsx               # [NEW] Scroll-to-search button
│   ├── SuccessState.tsx            # [NEW] Post-verification inline success moment
│   └── [existing]                  # SearchInput, ResultsList, EmailGate (unchanged)
├── hooks/
│   ├── useSearch.ts                # [REUSE] Existing; already has isGated + clearGate
│   └── useLeaderboard.ts           # [NEW] Fetch 4 keywords on mount, track state
└── lib/
    └── utils/
        └── [existing]              # competition.ts, etc. (unchanged)
```

### Pattern 1: Parallel Leaderboard Fetches

**What:** Fire 4 independent API calls to `/api/malt/autocomplete` concurrently on page mount, collect results, render ranked cards.

**When to use:** Any feature requiring multiple independent API requests that can run in parallel without ordering dependencies.

**Example:**

```typescript
// src/hooks/useLeaderboard.ts
"use client";

import { useEffect, useState } from "react";
import type {
  MaltAutocompleteResponse,
  MaltSuggestion,
} from "@/lib/schemas/malt";

interface LeaderboardItem {
  rank: number;
  suggestion: MaltSuggestion;
}

const NICHE_SEEDS = {
  tech: ["React", "Python", "Node.js", "TypeScript"],
  design: ["Figma", "UX Design", "Webflow", "Branding"],
  project: ["Product Manager", "Scrum Master", "Agile", "Project Management"],
  devops: ["Docker", "Kubernetes", "AWS", "CI/CD"],
};

export function useLeaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pick one random seed per niche
    const selectedSeeds = Object.entries(NICHE_SEEDS).map(
      ([, seeds]) => seeds[Math.floor(Math.random() * seeds.length)],
    );

    // Fire 4 parallel requests
    const fetcher = (q: string) =>
      fetch(`/api/malt/autocomplete?q=${encodeURIComponent(q)}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json() as Promise<MaltAutocompleteResponse>;
      });

    Promise.all(selectedSeeds.map(fetcher))
      .then((responses) => {
        // Flatten and take top result from each niche
        const ranked: LeaderboardItem[] = responses.map((resp, idx) => ({
          rank: idx + 1,
          suggestion: resp.suggestions[0] || { label: "N/A", occurrences: 0 },
        }));
        setItems(ranked);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { items, isLoading, error };
}
```

Source: Promise.all is standard JavaScript (no library). SWR deduplication already proven in useSearch.ts (lines 59–71 of source).

### Pattern 2: Leaderboard Component with Rank Badge

**What:** Render KeywordCard variant that prepends a rank number (#1, #2, etc.) and applies staggered fade-in animation on load.

**When to use:** Displaying ranked list items with entry animations.

**Example:**

```typescript
// src/components/Leaderboard.tsx
"use client";

import React from "react";
import { KeywordCard } from "./KeywordCard";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface LeaderboardProps {
  items: Array<{ rank: number; suggestion: MaltSuggestion }>;
  isLoading: boolean;
}

export function Leaderboard({ items, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.rank}
          className={`flex items-center gap-4 animate-fade-in`}
          style={{
            animationDelay: `${item.rank * 100}ms`,
            animationFillMode: "both",
          }}
        >
          {/* Rank badge */}
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">
            #{item.rank}
          </div>

          {/* Reuse existing KeywordCard */}
          <div className="flex-1">
            <KeywordCard suggestion={item.suggestion} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Custom animation** (add to `src/app/globals.css`):

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@layer utilities {
  .animate-fade-in {
    animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}
```

Source: Tailwind 3.4.0 doesn't include `animate-fade-in` by default; custom @keyframes is the standard pattern (see tailwind.config.ts — no animation extensions currently).

### Pattern 3: Scroll-to-Element via useRef

**What:** Create a ref to the search input, use `.scrollIntoView()` on CTA click. Safe, accessible, and doesn't depend on DOM selectors.

**When to use:** Internal page navigation within a component, especially when target element is managed by the component or a child.

**Example:**

```typescript
// src/components/CTAButton.tsx
"use client";

import { useRef } from "react";

export function CTAButton() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Find Your Keywords
      </button>

      {/* SearchInput component receives ref */}
      <SearchInput ref={searchInputRef} />
    </>
  );
}
```

**In SearchInput component:**

```typescript
import React from "react";

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, disabled }, ref) => (
    <input
      ref={ref}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Search a skill..."
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
    />
  )
);
SearchInput.displayName = "SearchInput";
```

Source: Next.js 14 + React 18.3 support forwardRef natively. `scrollIntoView()` is standard DOM API (MDN: Element.scrollIntoView).

### Pattern 4: Post-Verification Success State

**What:** After email verification (triggered by `?verified=true` URL param), show inline success message ("You're in — start searching") with fade-in + fade-out animation. Auto-dismiss after 2–3 seconds.

**When to use:** Temporary success confirmations that don't need to persist.

**Example:**

```typescript
// src/components/SuccessState.tsx
"use client";

import React, { useEffect, useState } from "react";

interface SuccessStateProps {
  show: boolean;
  onDismiss: () => void;
}

export function SuccessState({ show, onDismiss }: SuccessStateProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg px-6 py-4 text-center transition-transform duration-300 ${
          isVisible ? "scale-100" : "scale-95"
        }`}
      >
        <p className="text-lg font-semibold text-gray-900">
          ✓ You're in — start searching
        </p>
      </div>
    </div>
  );
}
```

**Integrate into page.tsx:**

```typescript
export default function Home() {
  const { clearGate } = useSearch();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "true") {
        setShowSuccess(true);
        // clearGate will be called in SuccessState.onDismiss
      }
    }
  }, []);

  return (
    <main>
      <SuccessState
        show={showSuccess}
        onDismiss={() => {
          setShowSuccess(false);
          clearGate();
        }}
      />
      {/* rest of page */}
    </main>
  );
}
```

Source: CSS transitions (`duration-300`, `opacity-100`, `scale-100`) are standard Tailwind utilities. setTimeout for auto-dismiss is idiomatic React pattern.

### Pattern 5: Static FAQ List

**What:** Render 5 locked FAQ items as a simple unordered list or div structure. No accordion/disclosure pattern needed for small count.

**When to use:** Small, fixed-size lists of questions where all content is always scrollable and the space is not constrained.

**Example:**

```typescript
// src/components/FAQ.tsx
"use client";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Why are these numbers accurate?",
    answer:
      "Based on real Malt platform data — the same source Malt uses when you add a skill to your profile.",
  },
  {
    question: "Can Malt shut this down?",
    answer: "The data exists on Malt's platform. We just make it searchable.",
  },
  {
    question: "Will my email be sold?",
    answer: "Never. Unsubscribe in one click.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes, completely free.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "Data is live — pulled fresh from Malt every time you search. Results reflect today's numbers.",
  },
];

export function FAQ() {
  return (
    <div className="space-y-6">
      {FAQ_ITEMS.map((item, idx) => (
        <div key={idx} className="border-b border-gray-200 pb-4 last:border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {item.question}
          </h3>
          <p className="text-gray-600">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
```

Source: 5 items fit on mobile/desktop without needing accordion disclosure. Locked content (D-13) means no editing is required in implementation; just render the fixed array.

### Anti-Patterns to Avoid

- **Don't fetch leaderboard data at build time:** This violates D-08 ("live API calls every page load"). Pre-rendering with static data defeats the purpose of "real-time social proof"
- **Don't use setTimeout for scroll with calculated delay:** Use `scrollIntoView({ behavior: "smooth" })` instead; browser handles timing optimally
- **Don't create custom state management for success state:** Inline component state + setTimeout is sufficient; Redux/Zustand adds overhead
- **Don't query the DOM with selectors for internal navigation:** Use useRef and forwardRef instead; it's type-safe and decoupled from HTML structure
- **Don't lazy-load FAQ items:** Render all 5 at once; rendering cost is negligible and improves accessibility (screen readers find all content immediately)
- **Don't add accordion interactions if not needed:** 5 items don't justify the complexity of details/summary or custom disclosure pattern. Static list is faster to load and simpler to maintain

---

## Don't Hand-Roll

| Problem                          | Don't Build                                                     | Use Instead                                     | Why                                                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Parallel fetch deduplication** | Custom request cache logic with Map/object                      | SWR with `dedupingInterval`                     | SWR automatically prevents duplicate requests to same URL within time window. Hand-rolled cache has race conditions, expiry logic, and memory leak risks                                           |
| **Scroll-to-element navigation** | Manual `document.querySelector` + `scrollIntoView`              | React useRef + forwardRef                       | Refs are type-safe, don't break if HTML changes, and are the idiomatic React pattern. Selectors are fragile and add unnecessary DOM coupling                                                       |
| **Success state animation**      | Custom CSS-in-JS animation library (emotion, styled-components) | Tailwind transition utilities + CSS classes     | Tailwind's `transition-opacity`, `duration-300`, `opacity-100` are zero-JS overhead. Custom library adds 20+ KB bundle size for simple fade animation                                              |
| **FAQ disclosure pattern**       | Custom accordion component with state machine                   | Static list or native details/summary           | For 5 fixed items, static rendering is simplest. If needed later, HTML details/summary is free (no JS). Custom accordion has state bugs (only-one-open-at-time, animation glitches, keyboard trap) |
| **Leaderboard rank styling**     | CSS-in-JS + inline styles for rank numbering                    | Tailwind flex + gap + width utilities for badge | Tailwind utility classes are composable, cached, and faster than inline styles. Flex layout is reliable across devices                                                                             |

**Key insight:** The landing page has no unique complexity. Every pattern (parallel fetch, scroll, animations, static lists) is either solved by existing dependencies (SWR, Tailwind, React) or is simple enough (setTimeout, useRef) that custom code adds risk without benefit.

---

## Runtime State Inventory

N/A — Phase 4 is UI/frontend only. No database renames, service migrations, or stored state changes. Verification happens during Phase 2 (email gate), which is already complete.

---

## Common Pitfalls

### Pitfall 1: Leaderboard Load Waterfalls

**What goes wrong:** Fetching 4 keywords sequentially (await first, then second, etc.) instead of in parallel. Results in 4x slower load time (e.g., 3 seconds instead of 800ms if each call takes 200ms).

**Why it happens:** Developer writes `await fetch()` in a loop instead of collecting promises and using `Promise.all()`. Easy mistake when refactoring from single-keyword fetches.

**How to avoid:** Always collect promises first, then `Promise.all()`. Use the `useLeaderboard` hook pattern provided above (lines 18–22 show the pattern).

**Warning signs:** Leaderboard loads slower than individual search results. Network tab in DevTools shows requests queued, not parallel.

### Pitfall 2: Broken useRef After Component Re-renders

**What goes wrong:** Ref points to old DOM node; `scrollIntoView()` fails silently or scrolls to wrong element. Can happen if SearchInput is conditionally mounted or key changes.

**Why it happens:** React re-creates component instances when key changes or parent re-renders; old ref becomes stale.

**How to avoid:** Use stable keys (avoid `key={index}`), don't conditionally mount the search input, and always use `?.` optional chaining when calling ref methods (`ref.current?.scrollIntoView()`).

**Warning signs:** Click CTA → no scroll happens, or scroll jumps to wrong position. Check DevTools React Profiler to see if SearchInput is re-mounting.

### Pitfall 3: FAQ Content Drift from Locked Spec

**What goes wrong:** Copy gets edited during implementation, answers become too long (violates "one Mississippi" test), or tone changes from blunt to marketing-speak.

**Why it happens:** Developers assume "locked content" is rough and refine it. D-13 and D-14 specify exact answers and tone; refinement violates the spec.

**How to avoid:** Copy the FAQ items directly from CONTEXT.md (lines 40–44) into code. Use a constant (not inline text). Add a comment: `// D-13: Locked FAQ content — do not edit`. If content needs changes, raise with product owner first.

**Warning signs:** FAQ answers exceed 1 line on desktop; answerer uses phrases like "you can also" or "in addition to"; tone shifts to promotional language.

### Pitfall 4: Success State Not Dismissing on First Search

**What goes wrong:** After email verification, success overlay shows. User types a search. Overlay stays on top, blocking results. Or overlay doesn't fade out properly, leaving semi-transparent screen.

**Why it happens:** onDismiss callback not triggered by search action, or CSS transition has wrong timing.

**How to avoid:** Tie success state to both `setTimeout` (auto-dismiss) AND a manual trigger on first search attempt. When user types in search input, call `onDismiss()` immediately. Ensure transition `duration-300` matches JavaScript timing (300ms).

**Warning signs:** After verification, user searches but overlay persists. Or overlay fades but leaves a black semi-transparent backdrop that won't clear.

### Pitfall 5: Leaderboard Animation Stagger Too Fast or Too Slow

**What goes wrong:** 4 cards fade in sequentially — either so fast (10ms between) they look like a glitch, or so slow (500ms between) the leaderboard feels sluggish.

**Why it happens:** Miscalculating stagger delay. If each animation is 500ms and delay increments by 100ms, cards overlap; if delay is 500ms and animation is 100ms, there are gaps.

**How to avoid:** Formula: `animationDelay = rank * 100ms` and `animation duration = 500ms`. This creates a visual ripple where card 2 starts fading in before card 1 finishes. Test in browser; if it feels off, adjust by ±50ms.

**Warning signs:** Watch the leaderboard load and count: if you see all 4 cards pop in at once, stagger is not working (check inline style attribute). If they feel sluggish, increase stagger increment.

---

## Code Examples

Verified patterns from the existing codebase and Next.js 14 standards:

### Leaderboard Fetch (Promise.all Pattern)

```typescript
// Source: SWR pattern from useSearch.ts (lines 59–71)
// Adapted for parallel fetches

useEffect(() => {
  const selectedSeeds = ["React", "Figma", "Product Manager", "Docker"];

  const fetcher = (q: string) =>
    fetch(`/api/malt/autocomplete?q=${encodeURIComponent(q)}`).then((r) =>
      r.json(),
    );

  Promise.all(selectedSeeds.map(fetcher))
    .then((responses) => {
      setItems(
        responses.map((r, i) => ({
          rank: i + 1,
          suggestion: r.suggestions[0],
        })),
      );
    })
    .catch((err) => setError(err.message))
    .finally(() => setIsLoading(false));
}, []);
```

Source: useSearch.ts uses SWR for single-query fetching; leaderboard extends this to multiple concurrent requests.

### Scroll-to-Element Pattern

```typescript
// Source: Native DOM API; common in Next.js apps

const searchInputRef = useRef<HTMLInputElement>(null);

const handleCTA = () => {
  searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
};

// Pass ref to SearchInput
<SearchInput ref={searchInputRef} />
```

Source: React 18.3 useRef docs; Element.scrollIntoView (MDN standard).

### Post-Verification Success State

```typescript
// Source: Inline component state + setTimeout pattern (idiomatic React)

const [showSuccess, setShowSuccess] = useState(false);

useEffect(() => {
  if (!showSuccess) return;

  const timer = setTimeout(() => {
    setShowSuccess(false);
    clearGate();
  }, 2500);

  return () => clearTimeout(timer);
}, [showSuccess, clearGate]);
```

Source: React useEffect cleanup pattern (React docs); setTimeout is standard JavaScript.

### Custom Fade-In Animation in Tailwind

```css
/* Source: Tailwind best practice for custom animations */

@layer utilities {
  .animate-fade-in {
    animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Source: Tailwind CSS documentation (custom keyframes); cubic-bezier is easing function (MDN standard).

---

## State of the Art

| Old Approach                                                | Current Approach                                     | When Changed                            | Impact                                                                                                |
| ----------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| jQuery `$.scrollTo()` or `window.scrollY` manipulation      | React `useRef` + native `scrollIntoView()` API       | React 16.3 (useRef introduced)          | Eliminated jQuery dependency, better type safety, more accessible (respects `prefers-reduced-motion`) |
| CSS Animations in separate `.css` files (BEM naming)        | Tailwind `@layer utilities` with custom `@keyframes` | Tailwind 3.0+ (2021)                    | Reduced CSS payload, utilities co-located with component usage, no BEM naming required                |
| Separate fetch library calls (axios, isomorphic-fetch)      | SWR for client, Next.js API routes for server        | SWR adoption in React ecosystem (2020+) | Built-in caching, deduplication, stale-while-revalidate strategy. No library choice paralysis         |
| Redux or Context for global success state                   | Inline component state + callback props              | React Hooks (2019+)                     | Eliminated boilerplate, easier to reason about (local state is clear), reduced bundle size            |
| Accordion components from UI libraries (Headless UI, Radix) | Static list for small counts (5 items)               | Simplicity first principle (2020+)      | No JavaScript cost, faster initial render, fewer accessibility bugs (auto-correct with semantic HTML) |

**Deprecated/outdated:**

- **jQuery for DOM manipulation** → Use React and native DOM APIs. jQuery adds 30 KB; modern browsers expose everything natively
- **Bootstrap or Material Design for layout** → Tailwind CSS is more flexible, faster compilation, and already adopted in this project
- **Separate animation library (Framer Motion)** → Tailwind animations + CSS keyframes cover 90% of needs; Framer Motion adds 30 KB for complex choreography (not needed here)

---

## Open Questions

1. **Post-verification redirect URL handling**
   - What we know: Phase 2 confirms email and redirects to `/?verified=true` (lines 18–20 of page.tsx)
   - What's unclear: Should `?verified=true` be consumed (removed from URL) after success state dismisses, or left in URL?
   - Recommendation: Use `window.history.replaceState()` to clean up URL after onDismiss() fires. Prevents user navigating back and seeing success modal again. Example: `window.history.replaceState({}, "", window.location.pathname)`

2. **Leaderboard refresh on every page load vs. caching**
   - What we know: D-08 requires "live API calls every page load"
   - What's unclear: Should SWR deduplication apply if user revisits within same session?
   - Recommendation: Turn off SWR caching for leaderboard fetch. Fetch fresh data every mount, even if same query was recently fetched. Use `revalidateOnFocus: false, focusThrottleInterval: 0` to disable re-validation on window focus but allow full refresh on page load.

3. **Mobile leaderboard layout**
   - What we know: Must be fully responsive (ROADMAP Phase 4 success criteria #5)
   - What's unclear: On narrow screens, should rank badge stay left of card, or move above?
   - Recommendation: On mobile (< 640px), stack vertically: rank on top line, keyword card below. Use Tailwind responsive prefixes: `sm:flex` (desktop) vs default flex-col (mobile). Keep rank badge width consistent (w-8 h-8) to maintain alignment on all screens.

4. **CTA button copy methodology**
   - What we know: Must pass Harry Dry tests (D-10)
   - What's unclear: "Only this tool can say it" — are competitor tools (LinkedIn, Indeed) searching Malt data? Or does "only this tool" mean only Malt keyword tool (vs. manual profile browsing)?
   - Recommendation: Interpret as "only this tool makes Malt data searchable in real-time by volume count." Examples of passing copy: "See which skills rank highest on Malt", "Find the keywords Malt users actually search for", "Know your rarity on Malt before you profile". Test each against visualizable + falsifiable + unique tests before committing.

---

## Validation Architecture

**Nyquist validation is enabled** (`workflow.nyquist_validation: true` in config.json). This section covers testing strategy for Phase 4 new components.

### Test Framework

| Property           | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Framework          | Vitest 1.0.0 + @testing-library/react 14.0.0         |
| Config file        | `vitest.config.ts` (if exists) or uses default       |
| Quick run command  | `npm run test -- src/components/Leaderboard.test.ts` |
| Full suite command | `npm test`                                           |

**Existing:** Phase 1–2 have Vitest configured (package.json lines 10–12 show test scripts). No additional setup needed.

### Phase Requirements → Test Map

| Req ID        | Behavior                                                                              | Test Type    | Automated Command                                   | File Exists? |
| ------------- | ------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------- | ------------ |
| **LAND-01**   | Hero section renders with headline + subheadline above search box                     | Unit         | `npm run test -- Hero.test.ts`                      | ❌ Wave 0    |
| **LAND-01**   | Page is responsive: hero text and search box stack on mobile, side-by-side on desktop | E2E          | `npm run test:e2e -- landing.spec.ts`               | ❌ Wave 0    |
| **LAND-02**   | Leaderboard fetches 4 parallel API calls on mount                                     | Unit         | `npm run test -- useLeaderboard.test.ts`            | ❌ Wave 0    |
| **LAND-02**   | Leaderboard renders 4 ranked cards with rank numbers                                  | Unit         | `npm run test -- Leaderboard.test.ts`               | ❌ Wave 0    |
| **LAND-02**   | Leaderboard cards fade in with staggered animation                                    | Visual (E2E) | `npm run test:e2e -- leaderboard-animation.spec.ts` | ❌ Wave 0    |
| **LAND-02**   | Leaderboard handles API errors gracefully (shows placeholder or message)              | Unit         | `npm run test -- useLeaderboard.test.ts`            | ❌ Wave 0    |
| **LAND-03**   | FAQ section renders 5 locked items with exact copy from CONTEXT.md                    | Unit         | `npm run test -- FAQ.test.ts`                       | ❌ Wave 0    |
| **LAND-03**   | FAQ section is scrollable and all items visible on mobile/desktop                     | E2E          | `npm run test:e2e -- faq.spec.ts`                   | ❌ Wave 0    |
| **D-11**      | Clicking CTA button scrolls to search input smoothly                                  | E2E          | `npm run test:e2e -- cta-scroll.spec.ts`            | ❌ Wave 0    |
| **D-15/D-16** | Post-verification success state shows inline message, auto-dismisses after 2–3 sec    | Unit         | `npm run test -- SuccessState.test.ts`              | ❌ Wave 0    |
| **D-15/D-16** | Success state clears URL param (`?verified=true`) after dismiss                       | E2E          | `npm run test:e2e -- success-state.spec.ts`         | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm run test` (full suite, < 30s)
- **Per wave merge:** `npm run test` + `npm run test:e2e` (full suite + Playwright, < 3 min)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/Hero.test.ts` — renders headline, subheadline, responsive layout
- [ ] `src/components/Leaderboard.test.ts` — renders 4 ranked cards, no animation verification (visual only in E2E)
- [ ] `src/hooks/useLeaderboard.test.ts` — Promise.all fetch, error handling, state updates
- [ ] `src/components/FAQ.test.ts` — renders 5 locked items, exact copy match
- [ ] `src/components/CTAButton.test.ts` — renders button, useRef callback fires on click
- [ ] `src/components/SuccessState.test.ts` — shows on mount, auto-dismisses after 2.5s, calls onDismiss
- [ ] `tests/e2e/landing.spec.ts` — hero → leaderboard → CTA → search → FAQ visible on load; responsive layout on mobile
- [ ] `tests/e2e/cta-scroll.spec.ts` — click CTA → smooth scroll to search input
- [ ] `tests/e2e/success-state.spec.ts` — navigate to `/?verified=true` → success modal → auto-dismiss → URL cleaned up
- [ ] `tests/e2e/leaderboard-animation.spec.ts` — visual regression test for fade-in stagger (optional: Playwright visual comparisons)

**Playwright setup:** Phase 1–2 already have `@playwright/test` (package.json line 28). Config file may be in `playwright.config.ts` or project root; verify before writing tests.

**Framework install:** `npm install` already includes vitest and @testing-library/react. No new installs needed.

---

## Sources

### Primary (HIGH Confidence)

- **Next.js 14.2.0 docs** — App Router, "use client", API routes, layouts, metadata (official Next.js documentation)
- **React 18.3.0 hooks** — useEffect, useState, useRef, forwardRef (React official documentation)
- **SWR 2.2.0** — Parallel fetches, deduplication, HTTP caching strategy (SWR GitHub README and docs)
- **Tailwind CSS 3.4.0** — Utilities for animation, transitions, responsive design, custom keyframes (official Tailwind documentation)
- **Existing codebase:**
  - `src/app/page.tsx` (lines 1–96) — confirms "use client" pattern, useSearch hook integration
  - `src/hooks/useSearch.ts` (lines 59–71) — SWR fetcher pattern, cache strategy
  - `src/components/KeywordCard.tsx` (lines 15–38) — component structure, Tailwind styling patterns
  - `src/app/layout.tsx` (lines 13–22) — metadata, theme color, existing structure
  - `package.json` — versions of all dependencies; Next.js 14.2.0, React 18.3.0, SWR 2.2.0, Tailwind 3.4.0

### Secondary (MEDIUM Confidence)

- **Phase 2 CONTEXT.md** — Email verification flow with `?verified=true` param, clearGate() function signature
- **Phase 1 completion notes** — Malt API endpoint format (MaltAutocompleteResponse schema), SWR deduplication success metrics

### Tertiary (LOW Confidence — Marked for Validation)

None — all findings are grounded in existing code, official docs, or locked decisions from CONTEXT.md.

---

## Metadata

**Confidence breakdown:**

- **Standard Stack:** HIGH — All packages verified in package.json; versions are current as of 2026-03-25. Next.js 14.2.0 is stable LTS-like release. No deprecations or breaking changes expected during Phase 4 implementation.
- **Architecture Patterns:** HIGH — Every pattern (Promise.all, useRef + scrollIntoView, Tailwind animations, inline success state) is either demonstrated in existing code (useSearch.ts) or is standard React/Next.js pattern from official docs. No experimental APIs used.
- **Pitfalls:** HIGH — Drawn from common mistakes in leaderboard/parallel-fetch implementations (seen in production React codebases); animation timing issues (common in stagger animations); FAQ scope creep (typical in copy-heavy pages).
- **Validation Architecture:** HIGH — Vitest + Playwright already configured in project (package.json); test strategy maps to requirements directly. No unknown testing infrastructure.

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (30 days — Phase 4 has stable stack, no fast-moving dependencies)
**Confidence Level:** **HIGH** — All findings grounded in existing codebase + official docs. No API research needed; stack is locked and proven.
