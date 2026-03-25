import React from "react";
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "./Leaderboard";
import type { LeaderboardItem } from "@/hooks/useLeaderboard";

describe("Leaderboard component", () => {
  test("renders 4 ranked cards when items are provided", () => {
    const mockItems: LeaderboardItem[] = [
      {
        rank: 1,
        suggestion: { label: "React", occurrences: 500 },
      },
      {
        rank: 2,
        suggestion: { label: "Figma", occurrences: 400 },
      },
      {
        rank: 3,
        suggestion: { label: "Product Manager", occurrences: 300 },
      },
      {
        rank: 4,
        suggestion: { label: "Docker", occurrences: 200 },
      },
    ];

    render(<Leaderboard items={mockItems} isLoading={false} />);

    // Should have 4 cards
    const cards = screen.getAllByText(/^\d+ utilisateurs Malt$/);
    expect(cards).toHaveLength(4);
  });

  test("displays rank badges #1 through #4", () => {
    const mockItems: LeaderboardItem[] = [
      {
        rank: 1,
        suggestion: { label: "React", occurrences: 500 },
      },
      {
        rank: 2,
        suggestion: { label: "Figma", occurrences: 400 },
      },
      {
        rank: 3,
        suggestion: { label: "Product Manager", occurrences: 300 },
      },
      {
        rank: 4,
        suggestion: { label: "Docker", occurrences: 200 },
      },
    ];

    render(<Leaderboard items={mockItems} isLoading={false} />);

    // Check that all rank badges are present
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();
    expect(screen.getByText("#4")).toBeInTheDocument();
  });

  test("shows skeleton loader when isLoading=true", () => {
    render(<Leaderboard items={[]} isLoading={true} />);

    // Should show "Popular Keywords on Malt" label
    expect(screen.getByText("Popular Keywords on Malt")).toBeInTheDocument();

    // Should have 4 skeleton placeholders
    const skeletons = document.querySelectorAll(".bg-gray-200.rounded-lg");
    expect(skeletons.length).toBe(4);
  });

  test("reuses KeywordCard for each item", () => {
    const mockItems: LeaderboardItem[] = [
      {
        rank: 1,
        suggestion: { label: "React", occurrences: 500 },
      },
      {
        rank: 2,
        suggestion: { label: "Figma", occurrences: 400 },
      },
      {
        rank: 3,
        suggestion: { label: "Product Manager", occurrences: 300 },
      },
      {
        rank: 4,
        suggestion: { label: "Docker", occurrences: 200 },
      },
    ];

    render(<Leaderboard items={mockItems} isLoading={false} />);

    // Check that all keywords are rendered via KeywordCard
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Figma")).toBeInTheDocument();
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
  });
});
