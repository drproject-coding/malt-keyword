"use client";

import React from "react";
import type { MaltSuggestion } from "@/lib/schemas/malt";

const MAX_LOG = Math.log10(100_000);

function toAngle(occurrences: number): number {
  if (occurrences <= 0) return 0;
  const pct = Math.min(Math.log10(occurrences + 1) / MAX_LOG, 1);
  return pct * 180;
}

function getColor(occurrences: number): string {
  if (occurrences < 50) return "#10b981"; // emerald
  if (occurrences < 500) return "#84cc16"; // lime
  if (occurrences < 2000) return "#f59e0b"; // amber
  if (occurrences < 10000) return "#f97316"; // orange
  return "#ef4444"; // red
}

function getLabel(occurrences: number): string {
  if (occurrences < 50) return "Rare — strong opportunity";
  if (occurrences < 500) return "Niche — low competition";
  if (occurrences < 2000) return "Common — moderate competition";
  if (occurrences < 10000) return "Crowded — hard to stand out";
  return "Saturated — very high competition";
}

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  startDeg: number,
  endDeg: number,
  r: number,
  cx: number,
  cy: number,
  strokeWidth: number,
) {
  const start = polarToXY(startDeg, r, cx, cy);
  const end = polarToXY(endDeg, r, cx, cy);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

interface Props {
  results: MaltSuggestion[];
}

export function SaturationGauge({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-6">
      {results.map((item) => {
        const occ = item.occurrences ?? 0;
        const angle = toAngle(occ);
        const color = getColor(occ);
        const cx = 150,
          cy = 120,
          r = 90;

        // Track arc end point
        const needle = polarToXY(angle, r - 8, cx, cy);
        const needleBase1 = polarToXY(angle - 90, 6, cx, cy);
        const needleBase2 = polarToXY(angle + 90, 6, cx, cy);

        return (
          <div
            key={item.label}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <div className="flex-shrink-0">
              <svg width="300" height="135" viewBox="0 0 300 135">
                {/* Track */}
                <path
                  d={arcPath(0, 180, r, cx, cy, 16)}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth={16}
                  strokeLinecap="round"
                />
                {/* Fill */}
                {angle > 0 && (
                  <path
                    d={arcPath(0, angle, r, cx, cy, 16)}
                    fill="none"
                    stroke={color}
                    strokeWidth={16}
                    strokeLinecap="round"
                  />
                )}
                {/* Needle */}
                <polygon
                  points={`${needle.x},${needle.y} ${needleBase1.x},${needleBase1.y} ${cx},${cy} ${needleBase2.x},${needleBase2.y}`}
                  fill={color}
                  opacity={0.9}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="white"
                  stroke={color}
                  strokeWidth={2}
                />
                {/* Scale ticks */}
                {[0, 45, 90, 135, 180].map((deg) => {
                  const p = polarToXY(deg, r + 14, cx, cy);
                  return (
                    <circle key={deg} cx={p.x} cy={p.y} r={2} fill="#d1d5db" />
                  );
                })}
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-5xl font-black text-black tabular-nums">
                {occ.toLocaleString("fr-FR")}
              </p>
              <p className="text-sm text-neutral-500 mt-1">freelancers Malt</p>
              <p className="text-sm font-medium mt-2" style={{ color }}>
                {getLabel(occ)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
