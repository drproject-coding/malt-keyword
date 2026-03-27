"use client";

import React from "react";

interface HeroProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export function Hero({ searchInputRef }: HeroProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
      <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-6">
        Malt Keyword Tool
      </p>
      <h1 className="text-6xl sm:text-8xl font-black text-white leading-none tracking-tight">
        See what
        <br />
        others don't.
      </h1>
      <p className="text-neutral-400 text-lg mt-6 max-w-sm leading-relaxed">
        Type any skill. See how many Malt freelancers claim it. Find the
        keywords worth owning.
      </p>
      <button
        className="mt-8 inline-block bg-white text-black px-10 py-4 rounded-lg font-bold text-sm hover:bg-neutral-200 transition-colors focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
        onClick={() => {
          searchInputRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          searchInputRef.current?.focus();
        }}
      >
        Try it free
      </button>
    </div>
  );
}
