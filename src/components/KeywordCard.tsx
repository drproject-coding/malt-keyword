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
  const volume = suggestion.volume ?? 0;
  const level = getCompetitionLevel(volume);
  const badgeColor = getCompetitionColor(level);
  const label = getCompetitionLabel(level);

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{suggestion.label}</p>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {volume} utilisateurs Malt
        </span>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor} whitespace-nowrap`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
