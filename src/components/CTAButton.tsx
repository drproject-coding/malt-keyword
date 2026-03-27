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
    searchInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    searchInputRef.current?.focus();
  };

  const buttonClasses =
    variant === "primary"
      ? "w-full sm:w-auto bg-white text-black py-3 px-8 rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
      : "w-full sm:w-auto border border-white/20 text-white py-3 px-8 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]";

  return (
    <button onClick={handleClick} className={buttonClasses}>
      {label}
    </button>
  );
}
