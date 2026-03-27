"use client";

import { useState } from "react";
import { ResultsList } from "@/components/ResultsList";
import { DataViz } from "@/components/viz/DataViz";
import { ProfileIntelligence } from "@/components/ProfileIntelligence";
import {
  getCompetitionLevel,
  getCompetitionDot,
  getCompetitionVerdict,
} from "@/lib/utils/competition";
import type { MaltSuggestion } from "@/lib/schemas/malt";

type Tab = "keywords" | "market" | "profiles";

const TABS: { id: Tab; label: string }[] = [
  { id: "keywords", label: "Keywords" },
  { id: "market", label: "Market View" },
  { id: "profiles", label: "Profiles" },
];

interface Props {
  query: string;
  results: MaltSuggestion[];
  isLoading: boolean;
  isError: boolean;
  isGated: boolean;
}

export function SearchDashboard({
  query,
  results,
  isLoading,
  isError,
  isGated,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("keywords");

  const topResult = results[0];
  const verdict = topResult
    ? (() => {
        const level = getCompetitionLevel(topResult.occurrences ?? 0);
        return {
          text: getCompetitionVerdict(
            level,
            topResult.label,
            topResult.occurrences ?? 0,
          ),
          dot: getCompetitionDot(level),
        };
      })()
    : null;

  const showTabs = results.length > 0 && !isLoading;

  return (
    <div className={isGated ? "blur-sm pointer-events-none select-none" : ""}>
      {/* Verdict */}
      {verdict && (
        <div
          className="mb-5 flex items-start gap-3.5 px-5 py-4 rounded-xl bg-white/5 border border-white/[0.08]"
          style={{ borderLeftColor: verdict.dot, borderLeftWidth: "3px" }}
        >
          <span
            className="mt-[5px] w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: verdict.dot }}
          />
          <p className="text-base text-neutral-200 leading-relaxed font-medium">
            {verdict.text}
          </p>
        </div>
      )}

      {/* Tab bar */}
      {showTabs && (
        <div className="flex gap-1 border-b border-white/10 mb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap focus:outline-none ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {activeTab === "keywords" && (
        <ResultsList
          results={results}
          isLoading={isLoading}
          isError={isError}
          query={query}
        />
      )}

      {activeTab === "market" && results.length > 0 && (
        <DataViz results={results} query={query} />
      )}

      {activeTab === "profiles" && (
        <div className="mt-4">
          <ProfileIntelligence query={query} />
        </div>
      )}
    </div>
  );
}
