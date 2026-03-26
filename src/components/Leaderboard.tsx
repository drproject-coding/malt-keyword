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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-8">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">
          Popular on Malt
        </p>
        <div className="space-y-2 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-8">
      <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">
        Popular on Malt
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.rank}
            className="flex items-center gap-3 animate-fade-in"
            style={{
              animationDelay: `${item.rank * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <span className="text-xs font-mono text-neutral-600 w-4 shrink-0 text-right">
              {item.rank}
            </span>
            <div className="flex-1">
              <KeywordCard suggestion={item.suggestion} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
