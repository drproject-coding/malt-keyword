"use client";

import React from "react";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface Props {
  results: MaltSuggestion[];
}

function getColor(occurrences: number): string {
  if (occurrences < 50) return "#10b981";
  if (occurrences < 500) return "#84cc16";
  if (occurrences < 2000) return "#f59e0b";
  if (occurrences < 10000) return "#f97316";
  return "#ef4444";
}

export function ComparisonBars({ results }: Props) {
  if (results.length === 0) return null;

  const max = Math.max(...results.map((r) => r.occurrences ?? 0));
  if (max === 0) return null;

  // Sort by occurrences ascending (least competitive first)
  const sorted = [...results].sort(
    (a, b) => (a.occurrences ?? 0) - (b.occurrences ?? 0),
  );

  return (
    <div className="space-y-3">
      {sorted.map((item) => {
        const occ = item.occurrences ?? 0;
        const pct = max > 0 ? (occ / max) * 100 : 0;
        const color = getColor(occ);

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-neutral-300">
                {item.label}
              </span>
              <span className="text-sm tabular-nums text-neutral-500">
                {occ.toLocaleString("fr-FR")}
              </span>
            </div>
            <div className="h-6 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(pct, 2)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}

      <p className="text-xs text-neutral-400 pt-2">
        Sorted by competition (least → most). Shorter bar = easier to rank.
      </p>
    </div>
  );
}
