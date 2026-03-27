"use client";

import type { AvailabilityStats } from "@/lib/profiles/aggregate";

interface Props {
  availability: AvailabilityStats;
}

const STATUSES = [
  {
    key: "availableAndVerified" as const,
    label: "Available & verified",
    sublabel: "Profile verified, open for missions",
    color: "#10b981",
  },
  {
    key: "available" as const,
    label: "Available",
    sublabel: "Open for missions, not verified",
    color: "#84cc16",
  },
  {
    key: "unavailable" as const,
    label: "Unavailable",
    sublabel: "Not accepting new missions",
    color: "#374151",
  },
];

export function AvailabilityChart({ availability }: Props) {
  const { total } = availability;

  const items = STATUSES.map((s) => ({
    ...s,
    count: availability[s.key],
    pct: total > 0 ? Math.round((availability[s.key] / total) * 100) : 0,
  }));

  const availablePct = items[0].pct + items[1].pct;

  return (
    <div className="space-y-6">
      {/* Big number */}
      <div>
        <div className="text-5xl font-black text-white">{availablePct}%</div>
        <div className="text-sm text-neutral-500 mt-1">
          of profiles available right now
          {availablePct < 30 && (
            <span className="ml-2 text-emerald-400">— supply gap detected</span>
          )}
          {availablePct > 70 && (
            <span className="ml-2 text-amber-400">
              — high supply, competitive market
            </span>
          )}
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex">
        {items.map((s) => (
          <div
            key={s.key}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            title={`${s.label}: ${s.pct}%`}
          />
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        {items.map((s) => (
          <div key={s.key} className="flex items-start gap-3">
            <span
              className="mt-0.5 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-neutral-200">
                  {s.label}
                </span>
                <span className="text-xs text-neutral-500">{s.sublabel}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-white">{s.pct}%</div>
              <div className="text-xs text-neutral-500">{s.count} profiles</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
