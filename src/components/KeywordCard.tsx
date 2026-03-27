"use client";

import React from "react";
import {
  getCompetitionLevel,
  getCompetitionColor,
  getCompetitionLabel,
} from "@/lib/utils/competition";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface KeywordCardProps {
  suggestion: MaltSuggestion;
}

export function KeywordCard({ suggestion }: KeywordCardProps) {
  const volume = suggestion.occurrences ?? 0;
  const level = getCompetitionLevel(volume);
  const badgeColor = getCompetitionColor(level);
  const label = getCompetitionLabel(level);

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 rounded-xl bg-[#111] border border-white/5 hover:bg-[#1a1a1a] transition-colors">
      <p className="text-xs text-neutral-500 uppercase tracking-wide flex-1 truncate">
        {suggestion.label}
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-4xl font-black text-white tabular-nums leading-none">
          {volume.toLocaleString("fr-FR")}
        </span>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeColor}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
