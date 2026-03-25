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
        className={`bg-green-50 border border-green-200 rounded-lg shadow-lg px-6 py-6 text-center transition-transform duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <p className="text-lg font-semibold text-gray-900 mb-2">
          ✓ You're in — start searching
        </p>
        <p className="text-sm text-gray-600">
          Your email is confirmed. Results unlocked.
        </p>
      </div>
    </div>
  );
}
