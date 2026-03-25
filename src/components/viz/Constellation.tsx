"use client";

import React from "react";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface Props {
  results: MaltSuggestion[];
  query: string;
}

const MAX_LOG = Math.log10(100_000);
const CX = 200;
const CY = 200;
const MIN_R = 60; // closest orbit (saturated)
const MAX_R = 160; // farthest orbit (rare)

function toRadius(occurrences: number): number {
  if (occurrences <= 0) return MAX_R;
  // Rare keywords = far from center (larger radius)
  const pct = Math.min(Math.log10(occurrences + 1) / MAX_LOG, 1);
  return MAX_R - pct * (MAX_R - MIN_R);
}

function getColor(occurrences: number): string {
  if (occurrences < 50) return "#10b981";
  if (occurrences < 500) return "#84cc16";
  if (occurrences < 2000) return "#f59e0b";
  if (occurrences < 10000) return "#f97316";
  return "#ef4444";
}

function dotSize(occurrences: number): number {
  // More occurrences = bigger dot (more prevalent on Malt)
  const pct = Math.min(Math.log10(occurrences + 1) / MAX_LOG, 1);
  return 4 + pct * 8;
}

export function Constellation({ results, query }: Props) {
  if (results.length === 0) return null;

  const items = results.filter((r) => (r.occurrences ?? 0) > 0);
  if (items.length === 0) return null;

  const angleStep = (2 * Math.PI) / items.length;

  // Spread nodes around the circle with slight golden-angle offset per orbit
  const nodes = items.map((item, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = toRadius(item.occurrences ?? 0);
    const x = CX + r * Math.cos(angle);
    const y = CY + r * Math.sin(angle);
    return { ...item, x, y, r, angle };
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        className="w-full max-w-sm"
      >
        {/* Orbit rings */}
        {[MIN_R, (MIN_R + MAX_R) / 2, MAX_R].map((r) => (
          <circle
            key={r}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Lines from center */}
        {nodes.map((node) => (
          <line
            key={`line-${node.label}`}
            x1={CX}
            y1={CY}
            x2={node.x}
            y2={node.y}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Center node — the query */}
        <circle cx={CX} cy={CY} r={18} fill="#111827" />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={9}
          fill="white"
          fontWeight="700"
        >
          {query.length > 10 ? query.slice(0, 9) + "…" : query}
        </text>

        {/* Keyword nodes */}
        {nodes.map((node) => {
          const occ = node.occurrences ?? 0;
          const color = getColor(occ);
          const size = dotSize(occ);
          // Position label outside the dot
          const labelR = node.r + size + 10;
          const lx = CX + labelR * Math.cos(node.angle);
          const ly = CY + labelR * Math.sin(node.angle);
          const anchor =
            lx < CX - 10 ? "end" : lx > CX + 10 ? "start" : "middle";

          return (
            <g key={node.label}>
              <circle
                cx={node.x}
                cy={node.y}
                r={size}
                fill={color}
                opacity={0.9}
              />
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={9}
                fill="#374151"
              >
                {node.label.length > 18
                  ? node.label.slice(0, 16) + "…"
                  : node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="text-xs text-neutral-400 text-center mt-2 max-w-xs">
        <span className="font-medium text-neutral-500">
          Distance from center
        </span>{" "}
        = opportunity (farther = rarer).{" "}
        <span className="font-medium text-neutral-500">Dot size</span> = number
        of freelancers.
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs text-neutral-400">
        {[
          { color: "#10b981", label: "Rare (<50)" },
          { color: "#84cc16", label: "Niche (<500)" },
          { color: "#f59e0b", label: "Common (<2k)" },
          { color: "#f97316", label: "Crowded (<10k)" },
          { color: "#ef4444", label: "Saturated" },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
