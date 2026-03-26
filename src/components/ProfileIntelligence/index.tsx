"use client";

import { useEffect, useState, useMemo } from "react";
import {
  aggregateProfiles,
  type ProfileAggregates,
} from "@/lib/profiles/aggregate";
import type { MaltProfile } from "@/lib/schemas/malt";
import { StatStrip } from "./StatStrip";
import { RateChart } from "./RateChart";
import { SkillsChart } from "./SkillsChart";
import { LocationChart } from "./LocationChart";
import { AvailabilityChart } from "./AvailabilityChart";
import { ExperienceChart } from "./ExperienceChart";

type Tab = "overview" | "skills" | "location" | "experience";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "location", label: "Location" },
  { id: "experience", label: "Experience" },
];

type FilterLocationType = "all" | "REMOTE" | "ON_SITE" | "HYBRID";

interface Filters {
  locationType: FilterLocationType;
  availableOnly: boolean;
}

interface Props {
  query: string;
}

export function ProfileIntelligence({ query }: Props) {
  const [profiles, setProfiles] = useState<MaltProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [filters, setFilters] = useState<Filters>({
    locationType: "all",
    availableOnly: false,
  });
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) return;

    setLoading(true);
    setError(null);

    const url = `/api/malt/profiles?q=${encodeURIComponent(query)}${testMode ? "&pages=1" : ""}`;
    fetch(url)
      .then((r) => {
        if (r.status === 502 || r.status === 403) throw new Error("blocked");
        if (!r.ok) throw new Error("unavailable");
        return r.json();
      })
      .then((data: { profiles: MaltProfile[] }) => {
        setProfiles(data.profiles ?? []);
      })
      .catch((e: Error) =>
        setError(e.message === "blocked" ? "blocked" : "unavailable"),
      )
      .finally(() => setLoading(false));
  }, [query, testMode]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      if (
        filters.locationType !== "all" &&
        (p.location?.locationType ?? "").toUpperCase() !== filters.locationType
      )
        return false;
      if (filters.availableOnly) {
        const status = p.availability?.status ?? "";
        if (!status.startsWith("AVAILABLE")) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  const data: ProfileAggregates = useMemo(
    () => aggregateProfiles(filtered),
    [filtered],
  );

  if (loading) {
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8">
        <div className="flex items-center gap-3 text-neutral-500">
          <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
          <span className="text-sm">Analyzing {query} profiles…</span>
        </div>
      </div>
    );
  }

  if (error) {
    const isBlocked = error === "blocked";
    return (
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-8 space-y-3">
        <p className="text-sm text-neutral-400">
          {isBlocked
            ? "Malt's profile API is protected — direct server access is blocked."
            : "Profile data temporarily unavailable."}
        </p>
        {isBlocked && (
          <a
            href={`https://www.malt.fr/s?q=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View &ldquo;{query}&rdquo; profiles on Malt
            <span aria-hidden>↗</span>
          </a>
        )}
      </div>
    );
  }

  if (profiles.length === 0) return null;

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 sm:p-8">
      <StatStrip data={data} query={query} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs text-neutral-600 uppercase tracking-widest">
          Filter
        </span>

        {(["all", "REMOTE", "ON_SITE", "HYBRID"] as FilterLocationType[]).map(
          (loc) => (
            <button
              key={loc}
              onClick={() => setFilters((f) => ({ ...f, locationType: loc }))}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filters.locationType === loc
                  ? "border-white text-white bg-white/10"
                  : "border-neutral-700 text-neutral-500 hover:border-neutral-500"
              }`}
            >
              {loc === "all"
                ? "All"
                : loc === "ON_SITE"
                  ? "On-site"
                  : loc.charAt(0) + loc.slice(1).toLowerCase()}
            </button>
          ),
        )}

        <button
          onClick={() =>
            setFilters((f) => ({ ...f, availableOnly: !f.availableOnly }))
          }
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            filters.availableOnly
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
              : "border-neutral-700 text-neutral-500 hover:border-neutral-500"
          }`}
        >
          Available now
        </button>

        <div className="relative group ml-auto">
          <button
            onClick={() => setTestMode((v) => !v)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              testMode
                ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
                : "border-neutral-700 text-neutral-500 hover:border-neutral-500"
            }`}
          >
            {testMode ? "Test mode: 1 page" : "Test mode"}
          </button>
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-900 border border-white/10 text-neutral-400 text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
            Fetch 1 page instead of 3 to avoid flooding the API
          </div>
        </div>

        {filtered.length !== profiles.length && (
          <span className="text-xs text-neutral-600">
            {filtered.length} / {profiles.length} profiles
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-800 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-white"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-64">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="min-w-0 overflow-hidden">
              <div className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
                Day rate distribution
              </div>
              {data.rate ? (
                <RateChart rate={data.rate} />
              ) : (
                <p className="text-sm text-neutral-600">
                  No rate data available for this filter.
                </p>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-neutral-500 uppercase tracking-widest mb-4">
                Availability
              </div>
              <AvailabilityChart availability={data.availability} />
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <SkillsChart skills={data.skills} sampleSize={data.sampleSize} />
        )}

        {activeTab === "location" && (
          <LocationChart location={data.location} total={data.sampleSize} />
        )}

        {activeTab === "experience" && (
          <ExperienceChart
            experience={data.experience}
            sampleSize={data.sampleSize}
          />
        )}
      </div>
    </div>
  );
}
