"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface Props {
  results: MaltSuggestion[];
}

interface DataPoint {
  x: number; // log10(occurrences)
  y: number; // word count
  label: string;
  occurrences: number;
}

const QUADRANT_X = Math.log10(500); // low/high split
const QUADRANT_Y = 2.5; // short/long tail split

function getQuadrantColor(x: number, y: number): string {
  if (x < QUADRANT_X && y > QUADRANT_Y) return "#10b981"; // sweet spot
  if (x < QUADRANT_X && y <= QUADRANT_Y) return "#84cc16"; // niche generic
  if (x >= QUADRANT_X && y > QUADRANT_Y) return "#f59e0b"; // competitive specific
  return "#ef4444"; // saturated generic
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  const color = getQuadrantColor(payload.x, payload.y);
  return (
    <g style={{ cursor: "pointer" }}>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.12} />
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.9} />
    </g>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: DataPoint = payload[0].payload;
  return (
    <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold text-white">{d.label}</p>
      <p className="text-neutral-400">
        {d.occurrences.toLocaleString("fr-FR")} freelancers
      </p>
      <p className="text-neutral-400">
        {d.y} {d.y === 1 ? "word" : "words"}
      </p>
    </div>
  );
}

export function OpportunityMatrix({ results }: Props) {
  if (results.length === 0) return null;

  const data: DataPoint[] = results
    .filter((r) => (r.occurrences ?? 0) > 0)
    .map((r) => ({
      x: Math.log10((r.occurrences ?? 1) + 1),
      y: r.label.trim().split(/\s+/).length,
      label: r.label,
      occurrences: r.occurrences ?? 0,
    }));

  if (data.length === 0) return null;

  return (
    <div>
      <div className="mb-4 text-xs text-neutral-400 flex flex-wrap gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          Sweet spot — specific &amp; rare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-500 inline-block" />
          Niche generic
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
          Competitive specific
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Saturated — avoid
        </span>
      </div>
      <p className="text-xs text-neutral-600 mb-3">
        Hover a dot to see keyword details
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            type="number"
            dataKey="x"
            name="Competition"
            domain={[0, Math.log10(100_001)]}
            tickFormatter={(v) => {
              const n = Math.round(Math.pow(10, v));
              return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n);
            }}
            tickCount={6}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          >
            <Label
              value="← less competition · more competition →"
              offset={-8}
              position="insideBottom"
              style={{ fontSize: 10, fill: "#9ca3af" }}
            />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            name="Specificity"
            domain={[0, 6]}
            tickCount={6}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
          >
            <Label
              value="word count"
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ fontSize: 10, fill: "#9ca3af" }}
            />
          </YAxis>
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={QUADRANT_X}
            stroke="#404040"
            strokeDasharray="6 3"
            strokeWidth={1.5}
          />
          <ReferenceLine
            y={QUADRANT_Y}
            stroke="#404040"
            strokeDasharray="6 3"
            strokeWidth={1.5}
          />
          <Scatter data={data} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
