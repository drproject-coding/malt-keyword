"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, disabled }, ref) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex : développeur React, UX designer..."
          disabled={disabled}
          className="h-14 w-full pl-5 pr-12 text-base text-white placeholder:text-neutral-600 bg-[#1a1a1a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Search keywords"
        />
        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500 pointer-events-none" />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";
