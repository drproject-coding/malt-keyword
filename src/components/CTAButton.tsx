"use client";

import React from "react";

interface CTAButtonProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  label?: string;
  variant?: "primary" | "secondary";
}

export function CTAButton({
  searchInputRef,
  label = "Find My Keywords",
  variant = "primary",
}: CTAButtonProps) {
  const handleClick = () => {
    // Scroll to search input
    searchInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    // Focus the input
    searchInputRef.current?.focus();
    // Optional: show inline message (can be enhanced in future)
    console.log("Try it — search any skill");
  };

  // Determine styling based on variant
  const buttonClasses =
    variant === "primary"
      ? "w-full sm:w-auto bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-base hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      : "w-full sm:w-auto bg-indigo-100 text-indigo-700 py-3 px-6 rounded-lg font-semibold text-base hover:bg-indigo-200 transition-colors focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <button onClick={handleClick} className={buttonClasses}>
      {label}
    </button>
  );
}
