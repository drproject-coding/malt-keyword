"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { RateStats } from "@/lib/profiles/aggregate";

interface Props {
  rate: RateStats;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { label: string } }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-700 px-3 py-2 rounded text-xs">
      <div className="text-white font-semibold">
        {payload[0].payload.label} €/day
      </div>
      <div className="text-neutral-400">{payload[0].value} profiles</div>
    </div>
  );
}

export function RateChart({ rate }: Props) {
  const max = Math.max(...rate.distribution.map((d) => d.count));

  return (
    <div>
      <div className="flex items-baseline gap-6 mb-6">
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Range
          </div>
          <div className="text-lg font-bold text-white">
            {rate.min}–{rate.max} {rate.currency}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            p25
          </div>
          <div className="text-lg font-bold text-neutral-300">{rate.p25}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Median
          </div>
          <div className="text-lg font-black text-white">{rate.median}</div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            p75
          </div>
          <div className="text-lg font-bold text-neutral-300">{rate.p75}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-neutral-500">
            from {rate.sampleSize} visible profiles
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={rate.distribution} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            tick={{ fill: "#737373", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, max]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Bar dataKey="count" fill="#ffffff" radius={[3, 3, 0, 0]} />
          <ReferenceLine
            x="500–700"
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{
              value: "median zone",
              fill: "#f59e0b",
              fontSize: 10,
              position: "top",
            }}
          />
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-neutral-600 mt-3">
        Day rates in {rate.currency}. Only profiles with visible pricing
        included.
      </p>
    </div>
  );
}
