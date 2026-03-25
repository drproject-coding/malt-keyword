"use client";

import React from "react";

export function Hero() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          See which keywords are actually searched on Malt — find your
          competitive edge
        </h1>

        {/* Subheadline */}
        <p className="text-base font-normal text-gray-600 mb-8">
          Type any skill and instantly see how many Malt users claim it.
          Discover the keywords that will make your profile stand out.
        </p>

        {/* Optional secondary CTA button (styled as secondary) */}
        <button
          className="inline-block bg-indigo-100 text-indigo-700 px-6 py-2 rounded-lg font-medium text-sm hover:bg-indigo-200 transition-colors focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          onClick={() => {
            const searchInput = document.querySelector(
              'input[placeholder*="développeur"]',
            ) as HTMLInputElement;
            searchInput?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            searchInput?.focus();
          }}
        >
          Try it free
        </button>
      </div>
    </div>
  );
}
