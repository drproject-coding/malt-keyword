"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  getCompetitionLevel,
  getCompetitionColor,
  getCompetitionLabel,
} from "@/lib/utils/competition";
import type { MaltSuggestion } from "@/lib/schemas/malt";

interface KeywordCardProps {
  suggestion: MaltSuggestion;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const tick = (now: number) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
}

export function KeywordCard({ suggestion }: KeywordCardProps) {
  const volume = suggestion.occurrences ?? 0;
  const level = getCompetitionLevel(volume);
  const badgeColor = getCompetitionColor(level);
  const label = getCompetitionLabel(level);
  const animatedVolume = useCountUp(volume);

  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 rounded-xl bg-[#111] border border-white/5 hover:bg-[#1a1a1a] transition-colors">
      <p className="text-sm text-neutral-300 flex-1 truncate">
        {suggestion.label}
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-4xl font-black text-white tabular-nums leading-none">
          {animatedVolume.toLocaleString("fr-FR")}
        </span>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap animate-badge-pop ${badgeColor}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
