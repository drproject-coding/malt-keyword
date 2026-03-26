"use client";

import React from "react";

export function Hero() {
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
      <p className="text-neutral-400 text-base mt-6 max-w-xs leading-relaxed">
        Type any skill. See how many Malt freelancers claim it. Find the
        keywords worth owning.
      </p>
      <button
        className="mt-8 inline-block bg-white text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-neutral-200 transition-colors focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
        onClick={() => {
          const searchInput = document.querySelector(
            'input[placeholder*="développeur"]',
          ) as HTMLInputElement;
          searchInput?.scrollIntoView({ behavior: "smooth", block: "center" });
          searchInput?.focus();
        }}
      >
        Try it free
      </button>
    </div>
  );
}
