import type { MaltProfile } from "@/lib/schemas/malt";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RateStats {
  min: number;
  max: number;
  median: number;
  p25: number;
  p75: number;
  currency: string;
  distribution: { label: string; count: number }[];
  sampleSize: number;
}

export interface SkillFrequency {
  label: string;
  count: number;
  pct: number;
  certifiedCount: number;
}

export interface LocationStats {
  remote: number; // count
  onSite: number;
  hybrid: number;
  other: number;
  topCities: { city: string; count: number }[];
}

export interface AvailabilityStats {
  availableAndVerified: number;
  available: number;
  unavailable: number;
  total: number;
}

export interface ExperienceStats {
  avgMissions: number;
  medianMissions: number;
  avgRecommendations: number;
  avgRating: number;
  missionsDistribution: { label: string; count: number }[];
  superMalterPct: number; // % with any SUPER_MALTER badge
  superMalterLevels: { level: string; count: number }[];
}

export interface PortfolioStats {
  avg: number;
  distribution: { label: string; count: number }[];
}

export interface Verdict {
  label: string;
  level: "low" | "medium" | "high" | "very_high";
  score: number; // 0–4
}

export interface ProfileAggregates {
  sampleSize: number;
  rate: RateStats | null;
  skills: SkillFrequency[];
  location: LocationStats;
  availability: AvailabilityStats;
  experience: ExperienceStats;
  portfolio: PortfolioStats;
  verdicts: {
    barrier: Verdict;
    supplyGap: Verdict;
    rateCeiling: Verdict;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function median(sorted: number[]): number {
  return percentile(sorted, 50);
}

// ── Rate ──────────────────────────────────────────────────────────────────────

function aggregateRate(profiles: MaltProfile[]): RateStats | null {
  const rates = profiles
    .filter((p) => p.price?.visibility === "VISIBLE" && p.price?.value?.amount)
    .map((p) => p.price!.value!.amount)
    .sort((a, b) => a - b);

  if (rates.length === 0) return null;

  const currency =
    profiles.find((p) => p.price?.value?.currency)?.price?.value?.currency ??
    "EUR";

  const buckets = [
    { label: "<300", min: 0, max: 299 },
    { label: "300–500", min: 300, max: 499 },
    { label: "500–700", min: 500, max: 699 },
    { label: "700–900", min: 700, max: 899 },
    { label: "900+", min: 900, max: Infinity },
  ];

  const distribution = buckets.map(({ label, min, max }) => ({
    label,
    count: rates.filter((r) => r >= min && r <= max).length,
  }));

  return {
    min: rates[0],
    max: rates[rates.length - 1],
    median: Math.round(median(rates)),
    p25: Math.round(percentile(rates, 25)),
    p75: Math.round(percentile(rates, 75)),
    currency,
    distribution,
    sampleSize: rates.length,
  };
}

// ── Skills ────────────────────────────────────────────────────────────────────

function aggregateSkills(profiles: MaltProfile[]): SkillFrequency[] {
  const counts = new Map<string, { count: number; certifiedCount: number }>();

  for (const profile of profiles) {
    // Deduplicate skills per profile (case-insensitive)
    const seen = new Set<string>();
    for (const skill of profile.skills) {
      const key = skill.label.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);

      const existing = counts.get(key) ?? { count: 0, certifiedCount: 0 };
      counts.set(key, {
        count: existing.count + 1,
        certifiedCount: existing.certifiedCount + (skill.certified ? 1 : 0),
      });
    }
  }

  const total = profiles.length;
  return Array.from(counts.entries())
    .map(([label, { count, certifiedCount }]) => ({
      label,
      count,
      pct: Math.round((count / total) * 100),
      certifiedCount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30); // top 30 skills
}

// ── Location ──────────────────────────────────────────────────────────────────

function aggregateLocation(profiles: MaltProfile[]): LocationStats {
  let remote = 0,
    onSite = 0,
    hybrid = 0,
    other = 0;
  const cityMap = new Map<string, number>();

  for (const p of profiles) {
    const type = p.location?.locationType;
    if (type === "REMOTE") remote++;
    else if (type === "ON_SITE") onSite++;
    else if (type === "HYBRID") hybrid++;
    else other++;

    const city = p.location?.city;
    if (city) cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
  }

  const topCities = Array.from(cityMap.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { remote, onSite, hybrid, other, topCities };
}

// ── Availability ──────────────────────────────────────────────────────────────

function aggregateAvailability(profiles: MaltProfile[]): AvailabilityStats {
  let availableAndVerified = 0,
    available = 0,
    unavailable = 0;

  for (const p of profiles) {
    const status = p.availability?.status ?? "";
    if (status === "AVAILABLE_AND_VERIFIED") availableAndVerified++;
    else if (status.startsWith("AVAILABLE")) available++;
    else unavailable++;
  }

  return {
    availableAndVerified,
    available,
    unavailable,
    total: profiles.length,
  };
}

// ── Experience ────────────────────────────────────────────────────────────────

function aggregateExperience(profiles: MaltProfile[]): ExperienceStats {
  const missions = profiles
    .map((p) => p.stats?.missionsCount ?? 0)
    .sort((a, b) => a - b);

  const recs = profiles
    .map((p) => p.stats?.recommendationsCount ?? 0)
    .filter((n) => n > 0);

  const ratings = profiles
    .map((p) => p.stats?.rating ?? 0)
    .filter((n) => n > 0);

  const missionBuckets = [
    { label: "0", min: 0, max: 0 },
    { label: "1–5", min: 1, max: 5 },
    { label: "6–15", min: 6, max: 15 },
    { label: "16–30", min: 16, max: 30 },
    { label: "30+", min: 31, max: Infinity },
  ];

  const missionsDistribution = missionBuckets.map(({ label, min, max }) => ({
    label,
    count: missions.filter((m) => m >= min && m <= max).length,
  }));

  const superMalterProfiles = profiles.filter((p) =>
    p.badges.some((b) => b.startsWith("SUPER_MALTER")),
  );

  const badgeLevelMap = new Map<string, number>();
  for (const p of profiles) {
    for (const badge of p.badges) {
      if (badge.startsWith("SUPER_MALTER")) {
        badgeLevelMap.set(badge, (badgeLevelMap.get(badge) ?? 0) + 1);
      }
    }
  }

  const superMalterLevels = Array.from(badgeLevelMap.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => a.level.localeCompare(b.level));

  const avg = (arr: number[]) =>
    arr.length === 0
      ? 0
      : Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

  return {
    avgMissions: avg(missions),
    medianMissions: Math.round(median(missions)),
    avgRecommendations: avg(recs),
    avgRating: avg(ratings),
    missionsDistribution,
    superMalterPct: Math.round(
      (superMalterProfiles.length / profiles.length) * 100,
    ),
    superMalterLevels,
  };
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

function aggregatePortfolio(profiles: MaltProfile[]): PortfolioStats {
  const counts = profiles.map((p) => p.portfolio.length);
  const avg =
    counts.length === 0
      ? 0
      : Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) /
        10;

  const buckets = [
    { label: "0", min: 0, max: 0 },
    { label: "1–3", min: 1, max: 3 },
    { label: "4–6", min: 4, max: 6 },
    { label: "7+", min: 7, max: Infinity },
  ];

  return {
    avg,
    distribution: buckets.map(({ label, min, max }) => ({
      label,
      count: counts.filter((c) => c >= min && c <= max).length,
    })),
  };
}

// ── Verdicts ──────────────────────────────────────────────────────────────────

function buildVerdicts(
  experience: ExperienceStats,
  availability: AvailabilityStats,
  rate: RateStats | null,
): ProfileAggregates["verdicts"] {
  // Barrier to entry: Super Malter % + avg missions
  const barrierScore =
    (experience.superMalterPct > 60
      ? 2
      : experience.superMalterPct > 30
        ? 1
        : 0) +
    (experience.avgMissions > 20 ? 2 : experience.avgMissions > 10 ? 1 : 0);

  const barrier: Verdict = {
    score: Math.min(barrierScore, 4),
    level:
      barrierScore >= 3
        ? "very_high"
        : barrierScore >= 2
          ? "high"
          : barrierScore >= 1
            ? "medium"
            : "low",
    label:
      barrierScore >= 3
        ? "Veteran territory"
        : barrierScore >= 2
          ? "Competitive"
          : barrierScore >= 1
            ? "Moderate"
            : "Accessible",
  };

  // Supply gap: % available now
  const availablePct = Math.round(
    ((availability.availableAndVerified + availability.available) /
      availability.total) *
      100,
  );
  const supplyScore =
    availablePct < 20
      ? 4
      : availablePct < 35
        ? 3
        : availablePct < 50
          ? 2
          : availablePct < 65
            ? 1
            : 0;

  const supplyGap: Verdict = {
    score: supplyScore,
    level:
      supplyScore >= 3
        ? "very_high"
        : supplyScore >= 2
          ? "high"
          : supplyScore >= 1
            ? "medium"
            : "low",
    label:
      supplyScore >= 3
        ? "High demand"
        : supplyScore >= 2
          ? "Good timing"
          : supplyScore >= 1
            ? "Normal supply"
            : "Abundant",
  };

  // Rate ceiling: p75 rate
  const p75 = rate?.p75 ?? 0;
  const rateScore =
    p75 >= 900 ? 4 : p75 >= 700 ? 3 : p75 >= 500 ? 2 : p75 >= 350 ? 1 : 0;

  const rateCeiling: Verdict = {
    score: rateScore,
    level:
      rateScore >= 3
        ? "very_high"
        : rateScore >= 2
          ? "high"
          : rateScore >= 1
            ? "medium"
            : "low",
    label:
      rateScore >= 3
        ? "Premium keyword"
        : rateScore >= 2
          ? "Good rates"
          : rateScore >= 1
            ? "Mid-market"
            : "Low rates",
  };

  return { barrier, supplyGap, rateCeiling };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function aggregateProfiles(profiles: MaltProfile[]): ProfileAggregates {
  if (profiles.length === 0) {
    return {
      sampleSize: 0,
      rate: null,
      skills: [],
      location: { remote: 0, onSite: 0, hybrid: 0, other: 0, topCities: [] },
      availability: {
        availableAndVerified: 0,
        available: 0,
        unavailable: 0,
        total: 0,
      },
      experience: {
        avgMissions: 0,
        medianMissions: 0,
        avgRecommendations: 0,
        avgRating: 0,
        missionsDistribution: [],
        superMalterPct: 0,
        superMalterLevels: [],
      },
      portfolio: { avg: 0, distribution: [] },
      verdicts: {
        barrier: { label: "—", level: "low", score: 0 },
        supplyGap: { label: "—", level: "low", score: 0 },
        rateCeiling: { label: "—", level: "low", score: 0 },
      },
    };
  }

  const rate = aggregateRate(profiles);
  const skills = aggregateSkills(profiles);
  const location = aggregateLocation(profiles);
  const availability = aggregateAvailability(profiles);
  const experience = aggregateExperience(profiles);
  const portfolio = aggregatePortfolio(profiles);
  const verdicts = buildVerdicts(experience, availability, rate);

  return {
    sampleSize: profiles.length,
    rate,
    skills,
    location,
    availability,
    experience,
    portfolio,
    verdicts,
  };
}
