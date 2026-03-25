"use client";

import { useEffect, useState } from "react";
import type {
  MaltAutocompleteResponse,
  MaltSuggestion,
} from "@/lib/schemas/malt";

export interface LeaderboardItem {
  rank: number;
  suggestion: MaltSuggestion;
}

export interface UseLeaderboardReturn {
  items: LeaderboardItem[];
  isLoading: boolean;
  error: string | null;
}

const NICHE_SEEDS = {
  tech: ["React", "Python", "Node.js", "TypeScript", "Go"],
  design: ["Figma", "UX Design", "Webflow", "Branding", "Adobe XD"],
  project: [
    "Product Manager",
    "Scrum Master",
    "Agile",
    "Project Management",
    "Kanban",
  ],
  devops: ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"],
};

export function useLeaderboard(): UseLeaderboardReturn {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pick one random seed per niche
    const selectedSeeds = Object.entries(NICHE_SEEDS).map(
      ([, seeds]) => seeds[Math.floor(Math.random() * seeds.length)],
    );

    // Fire 4 parallel requests
    const fetcher = (q: string) =>
      fetch(`/api/malt/autocomplete?q=${encodeURIComponent(q)}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json() as Promise<MaltAutocompleteResponse>;
      });

    Promise.all(selectedSeeds.map(fetcher))
      .then((responses) => {
        // Map responses to ranked items
        const ranked: LeaderboardItem[] = responses.map((resp, idx) => ({
          rank: idx + 1,
          suggestion: resp.suggestions[0] || {
            label: "N/A",
            occurrences: 0,
          },
        }));
        setItems(ranked);
        setError(null);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to fetch leaderboard",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { items, isLoading, error };
}
