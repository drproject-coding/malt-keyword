import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeywordCard } from "./KeywordCard";
import type { MaltSuggestion } from "@/lib/schemas/malt";

describe("KeywordCard", () => {
  it("renders keyword label", () => {
    const suggestion: MaltSuggestion = {
      label: "React Developer",
      volume: 45,
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("React Developer")).toBeInTheDocument();
  });

  it('displays volume count with "utilisateurs Malt" label', () => {
    const suggestion: MaltSuggestion = {
      label: "Python Developer",
      volume: 120,
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("120 utilisateurs Malt")).toBeInTheDocument();
  });

  it("applies correct badge for rare competition (< 10)", () => {
    const suggestion: MaltSuggestion = {
      label: "Niche Skill",
      volume: 5,
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("Rare")).toBeInTheDocument();
  });

  it("applies correct badge for common competition (10-100)", () => {
    const suggestion: MaltSuggestion = {
      label: "Common Skill",
      volume: 50,
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("Common")).toBeInTheDocument();
  });

  it("applies correct badge for oversaturated competition (> 100)", () => {
    const suggestion: MaltSuggestion = {
      label: "Popular Skill",
      volume: 500,
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("Saturated")).toBeInTheDocument();
  });

  it("handles missing volume gracefully", () => {
    const suggestion: MaltSuggestion = {
      label: "Skill Without Volume",
    };
    render(<KeywordCard suggestion={suggestion} />);
    expect(screen.getByText("0 utilisateurs Malt")).toBeInTheDocument();
    expect(screen.getByText("Rare")).toBeInTheDocument();
  });
});
