"use client";

import React from "react";
import { KeywordCard } from "./KeywordCard";
import type { LeaderboardItem } from "@/hooks/useLeaderboard";

interface LeaderboardProps {
  items: LeaderboardItem[];
  isLoading: boolean;
}

export function Leaderboard({ items, isLoading }: LeaderboardProps) {
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-gray-100 rounded-lg px-6 lg:px-8 py-6 my-12">
        <p className="text-sm text-gray-600 mb-6">Popular Keywords on Malt</p>
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-gray-100 rounded-lg px-6 lg:px-8 py-6 my-12">
      <p className="text-sm text-gray-600 mb-6">Popular Keywords on Malt</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.rank}
            className="flex items-center gap-4 animate-fade-in"
            style={{
              animationDelay: `${item.rank * 100}ms`,
              animationFillMode: "both",
            }}
          >
            {/* Rank badge */}
            <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold shrink-0">
              #{item.rank}
            </div>

            {/* Reuse KeywordCard */}
            <div className="flex-1">
              <KeywordCard suggestion={item.suggestion} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
