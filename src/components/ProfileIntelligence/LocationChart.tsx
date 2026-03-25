"use client";

import type { LocationStats } from "@/lib/profiles/aggregate";

interface Props {
  location: LocationStats;
  total: number;
}

function Segment({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-neutral-300 flex-1">{label}</span>
      <span className="text-2xl font-black text-white">{pct}%</span>
      <span className="text-xs text-neutral-600 w-16 text-right">
        {count} profiles
      </span>
    </div>
  );
}

export function LocationChart({ location, total }: Props) {
  const segments = [
    { label: "Remote", count: location.remote, color: "#10b981" },
    { label: "On-site", count: location.onSite, color: "#f59e0b" },
    { label: "Hybrid", count: location.hybrid, color: "#6366f1" },
    { label: "Not specified", count: location.other, color: "#404040" },
  ].filter((s) => s.count > 0);

  // Visual bar
  const bars = segments.map((s) => ({
    ...s,
    pct: total > 0 ? (s.count / total) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex">
        {bars.map((s) => (
          <div
            key={s.label}
            style={{ width: `${s.pct}%`, backgroundColor: s.color }}
            title={`${s.label}: ${Math.round(s.pct)}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {segments.map((s) => (
          <Segment key={s.label} {...s} total={total} />
        ))}
      </div>

      {/* Top cities */}
      {location.topCities.length > 0 && (
        <div className="pt-4 border-t border-neutral-800">
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">
            Top cities
          </div>
          <div className="flex flex-wrap gap-2">
            {location.topCities.map(({ city, count }) => (
              <div
                key={city}
                className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full"
              >
                <span className="text-xs text-neutral-200">{city}</span>
                <span className="text-xs text-neutral-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
