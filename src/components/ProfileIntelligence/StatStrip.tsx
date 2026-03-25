"use client";

import type { ProfileAggregates, Verdict } from "@/lib/profiles/aggregate";

interface Props {
  data: ProfileAggregates;
  query: string;
}

const verdictColors: Record<Verdict["level"], string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  very_high: "#ef4444",
};

// Flip: for barrier, high = bad; for supply/rate, high = good
const barrierColors: Record<Verdict["level"], string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  very_high: "#ef4444",
};

const opportunityColors: Record<Verdict["level"], string> = {
  low: "#ef4444",
  medium: "#f59e0b",
  high: "#84cc16",
  very_high: "#10b981",
};

function Dots({ score, color }: { score: number; color: string }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 4 }, (_, i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: i < score ? color : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </span>
  );
}

function VerdictCard({
  title,
  verdict,
  colorMap,
  subtitle,
}: {
  title: string;
  verdict: Verdict;
  colorMap: Record<Verdict["level"], string>;
  subtitle: string;
}) {
  const color = colorMap[verdict.level];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
        {title}
      </span>
      <div className="flex items-center gap-3">
        <Dots score={verdict.score} color={color} />
        <span className="text-sm font-semibold" style={{ color }}>
          {verdict.label}
        </span>
      </div>
      <span className="text-xs text-neutral-600">{subtitle}</span>
    </div>
  );
}

export function StatStrip({ data, query }: Props) {
  const { sampleSize, rate, verdicts, availability, experience } = data;

  const availablePct =
    availability.total > 0
      ? Math.round(
          ((availability.availableAndVerified + availability.available) /
            availability.total) *
            100,
        )
      : 0;

  return (
    <div className="border-b border-neutral-800 pb-6 mb-6">
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-black text-white">Profile Intelligence</h2>
        <span className="text-neutral-500 text-sm">
          {sampleSize} profiles analyzed for{" "}
          <span className="text-neutral-300">«{query}»</span>
        </span>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-3xl font-black text-white">
            {rate ? `${rate.median} ${rate.currency}` : "—"}
          </div>
          <div className="text-xs text-neutral-500 mt-1">median day rate</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">{availablePct}%</div>
          <div className="text-xs text-neutral-500 mt-1">available now</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">
            {experience.avgMissions}
          </div>
          <div className="text-xs text-neutral-500 mt-1">avg missions</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white">
            {experience.superMalterPct}%
          </div>
          <div className="text-xs text-neutral-500 mt-1">Super Malter</div>
        </div>
      </div>

      {/* Verdicts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-neutral-800">
        <VerdictCard
          title="Barrier to entry"
          verdict={verdicts.barrier}
          colorMap={barrierColors}
          subtitle="Based on Super Malter % and avg missions"
        />
        <VerdictCard
          title="Supply gap"
          verdict={verdicts.supplyGap}
          colorMap={opportunityColors}
          subtitle="Based on current availability"
        />
        <VerdictCard
          title="Rate ceiling"
          verdict={verdicts.rateCeiling}
          colorMap={opportunityColors}
          subtitle="Based on p75 day rate"
        />
      </div>
    </div>
  );
}
