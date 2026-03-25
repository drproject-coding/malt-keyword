"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExperienceStats } from "@/lib/profiles/aggregate";

interface Props {
  experience: ExperienceStats;
  sampleSize: number;
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
        {payload[0].payload.label} missions
      </div>
      <div className="text-neutral-400">{payload[0].value} profiles</div>
    </div>
  );
}

const BADGE_LABELS: Record<string, string> = {
  SUPER_MALTER_1: "Super Malter — Year 1",
  SUPER_MALTER_2: "Super Malter — Year 2",
  SUPER_MALTER_3: "Super Malter — Year 3+",
};

export function ExperienceChart({ experience, sampleSize }: Props) {
  return (
    <div className="space-y-8">
      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Avg missions
          </div>
          <div className="text-3xl font-black text-white">
            {experience.avgMissions}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Median missions
          </div>
          <div className="text-3xl font-black text-white">
            {experience.medianMissions}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Avg recs
          </div>
          <div className="text-3xl font-black text-white">
            {experience.avgRecommendations}
          </div>
        </div>
        <div>
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
            Avg rating
          </div>
          <div className="text-3xl font-black text-white">
            {experience.avgRating > 0 ? `${experience.avgRating}/5` : "—"}
          </div>
        </div>
      </div>

      {/* Missions distribution */}
      <div>
        <div className="text-xs text-neutral-500 uppercase tracking-widest mb-3">
          Missions distribution
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={experience.missionsDistribution} barCategoryGap="20%">
            <XAxis
              dataKey="label"
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="count" fill="#ffffff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Super Malter */}
      <div className="pt-4 border-t border-neutral-800">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="text-xs text-neutral-500 uppercase tracking-widest">
            Super Malter concentration
          </div>
          <div className="text-2xl font-black text-white ml-auto">
            {experience.superMalterPct}%
          </div>
        </div>

        {/* Bar */}
        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${experience.superMalterPct}%`,
              backgroundColor:
                experience.superMalterPct > 60
                  ? "#ef4444"
                  : experience.superMalterPct > 30
                    ? "#f59e0b"
                    : "#10b981",
            }}
          />
        </div>

        <p className="text-xs text-neutral-600 mb-4">
          {experience.superMalterPct > 60
            ? "Veteran-dominated — strong social proof required to compete."
            : experience.superMalterPct > 30
              ? "Mixed field — strong profile can stand out."
              : "Accessible — Super Malter badge is not the norm here."}
        </p>

        {/* Badge breakdown */}
        {experience.superMalterLevels.length > 0 && (
          <div className="space-y-2">
            {experience.superMalterLevels.map(({ level, count }) => (
              <div key={level} className="flex items-center gap-3">
                <span className="text-xs text-neutral-400 flex-1">
                  {BADGE_LABELS[level] ?? level}
                </span>
                <span className="text-xs font-mono text-neutral-300">
                  {count} / {sampleSize} profiles
                </span>
                <span className="text-xs font-mono text-neutral-500 w-10 text-right">
                  {Math.round((count / sampleSize) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
