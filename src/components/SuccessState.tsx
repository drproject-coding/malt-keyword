"use client";

import { useState, useEffect } from "react";

interface SuccessStateProps {
  show: boolean;
  onDismiss: () => void;
}

export function SuccessState({ show, onDismiss }: SuccessStateProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (!show) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    // Auto-dismiss after 2500ms (2.5 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  if (!isVisible && !show) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-all duration-300 ${
        isVisible
          ? "bg-black/20 opacity-100"
          : "bg-black/20 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-[#111] border border-white/10 rounded-2xl px-8 py-6 text-center transition-transform duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <p className="text-lg font-black text-white mb-1">You&apos;re in.</p>
        <p className="text-sm text-neutral-400">
          Email confirmed. Results unlocked.
        </p>
      </div>
    </div>
  );
}
