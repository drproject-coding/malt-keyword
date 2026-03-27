"use client";

import { useState } from "react";
import type { SkillFrequency } from "@/lib/profiles/aggregate";

interface Props {
  skills: SkillFrequency[];
  sampleSize: number;
}

function getBarColor(pct: number): string {
  if (pct >= 60) return "#ffffff";
  if (pct >= 40) return "#d4d4d4";
  if (pct >= 20) return "#737373";
  return "#404040";
}

export function SkillsChart({ skills, sampleSize }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, 15);
  const maxCount = skills[0]?.count ?? 1;

  return (
    <div>
      <p className="text-xs text-neutral-500 mb-4">
        Skills most frequently listed by the {sampleSize} profiles analyzed.
      </p>

      <div className="space-y-2">
        {visible.map((skill) => {
          const barPct = (skill.count / maxCount) * 100;
          const color = getBarColor(skill.pct);
          return (
            <div key={skill.label} className="flex items-center gap-3">
              {/* Label */}
              <div
                className="text-xs text-neutral-300 text-right shrink-0 capitalize"
                style={{ width: 160 }}
              >
                {skill.label}
              </div>

              {/* Bar */}
              <div className="flex-1 h-5 bg-neutral-900 rounded overflow-hidden relative">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{ width: `${barPct}%`, backgroundColor: color }}
                />
              </div>

              {/* Pct */}
              <div
                className="text-xs font-mono shrink-0 w-10 text-right"
                style={{ color }}
              >
                {skill.pct}%
              </div>

              {/* Certified badge */}
              {skill.certifiedCount > 0 && (
                <div className="text-xs text-amber-400 shrink-0">
                  ✓ certified
                </div>
              )}
            </div>
          );
        })}
      </div>

      {skills.length > 15 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 text-xs text-neutral-500 hover:text-white transition-colors"
        >
          {showAll ? "Show less" : `Show all ${skills.length} skills →`}
        </button>
      )}
    </div>
  );
}
