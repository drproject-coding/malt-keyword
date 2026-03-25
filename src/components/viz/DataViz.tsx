"use client";

import React, { useState } from "react";
import type { MaltSuggestion } from "@/lib/schemas/malt";
import { SaturationGauge } from "./SaturationGauge";
import { OpportunityMatrix } from "./OpportunityMatrix";
import { ComparisonBars } from "./ComparisonBars";
import { Constellation } from "./Constellation";

interface Props {
  results: MaltSuggestion[];
  query: string;
}

type Tab = "gauge" | "matrix" | "bars" | "constellation";

const TABS: { id: Tab; label: string; title: string; desc: string }[] = [
  {
    id: "gauge",
    label: "Saturation",
    title: "Saturation gauge",
    desc: "How crowded is each keyword?",
  },
  {
    id: "matrix",
    label: "Matrix",
    title: "Opportunity matrix",
    desc: "Competition vs specificity",
  },
  {
    id: "bars",
    label: "Comparison",
    title: "Side-by-side comparison",
    desc: "Sorted from least to most competitive",
  },
  {
    id: "constellation",
    label: "Constellation",
    title: "Keyword constellation",
    desc: "Rare keywords orbit far from the center",
  },
];

export function DataViz({ results, query }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("gauge");

  if (results.length === 0) return null;

  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="mt-8 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium transition-colors focus:outline-none ${
              activeTab === tab.id
                ? "text-black border-b-2 border-black -mb-px"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-5">
          <h3 className="text-base font-semibold text-gray-900">
            {active.title}
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">{active.desc}</p>
        </div>

        {activeTab === "gauge" && <SaturationGauge results={results} />}
        {activeTab === "matrix" && <OpportunityMatrix results={results} />}
        {activeTab === "bars" && <ComparisonBars results={results} />}
        {activeTab === "constellation" && (
          <Constellation results={results} query={query} />
        )}
      </div>
    </div>
  );
}
