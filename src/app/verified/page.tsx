"use client";

import Link from "next/link";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const states = {
  success: {
    headline: "You're in.",
    sub: "Your email is verified. Go find your next keyword.",
    cta: "Start searching",
    href: "/",
    color: "text-black",
    accent: "bg-black text-white hover:bg-neutral-800",
  },
  expired: {
    headline: "Too slow.",
    sub: "That link expired after 24 hours. Subscribe again and we'll send a fresh one.",
    cta: "Try again",
    href: "/",
    color: "text-neutral-700",
    accent: "bg-black text-white hover:bg-neutral-800",
  },
  used: {
    headline: "Already done.",
    sub: "This link was already used. Your email is verified.",
    cta: "Start searching",
    href: "/",
    color: "text-neutral-700",
    accent: "bg-black text-white hover:bg-neutral-800",
  },
  invalid: {
    headline: "Broken link.",
    sub: "That verification link doesn't exist. Try subscribing again.",
    cta: "Try again",
    href: "/",
    color: "text-neutral-700",
    accent: "bg-black text-white hover:bg-neutral-800",
  },
} as const;

type StateKey = keyof typeof states;

function VerifiedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as StateKey | null;
  const key = error && error in states ? error : "success";
  const state = states[key];

  useEffect(() => {
    if (key === "success" || key === "used") {
      localStorage.setItem("malt_unlocked", "true");
    }
  }, [key]);

  return (
    <div className="max-w-lg w-full space-y-8">
      <p className="text-sm font-medium tracking-widest uppercase text-neutral-400">
        Malt Keyword Tool
      </p>
      <h1
        className={`text-7xl sm:text-8xl font-black leading-none tracking-tight ${state.color}`}
      >
        {state.headline}
      </h1>
      <p className="text-lg text-neutral-500 leading-relaxed max-w-sm">
        {state.sub}
      </p>
      <Link
        href={state.href}
        className={`inline-block px-8 py-4 rounded-full font-semibold text-sm transition-colors ${state.accent}`}
      >
        {state.cta}
      </Link>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <Suspense>
        <VerifiedContent />
      </Suspense>
    </main>
  );
}
