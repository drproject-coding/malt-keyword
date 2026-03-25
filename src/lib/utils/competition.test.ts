import { describe, it, expect } from "vitest";
import { getCompetitionLevel, getCompetitionColor } from "./competition";

describe("getCompetitionLevel", () => {
  it('returns "rare" for volume < 10', () => {
    expect(getCompetitionLevel(5)).toBe("rare");
    expect(getCompetitionLevel(9)).toBe("rare");
  });

  it('returns "common" for volume 10-100', () => {
    expect(getCompetitionLevel(10)).toBe("common");
    expect(getCompetitionLevel(50)).toBe("common");
    expect(getCompetitionLevel(100)).toBe("common");
  });

  it('returns "oversaturated" for volume > 100', () => {
    expect(getCompetitionLevel(101)).toBe("oversaturated");
    expect(getCompetitionLevel(1000)).toBe("oversaturated");
  });
});

describe("getCompetitionColor", () => {
  it('returns green badge styles for "rare"', () => {
    const color = getCompetitionColor("rare");
    expect(color).toContain("emerald");
    expect(color).toContain("bg-emerald-100");
  });

  it('returns amber badge styles for "common"', () => {
    const color = getCompetitionColor("common");
    expect(color).toContain("amber");
    expect(color).toContain("bg-amber-100");
  });

  it('returns red badge styles for "oversaturated"', () => {
    const color = getCompetitionColor("oversaturated");
    expect(color).toContain("red");
    expect(color).toContain("bg-red-100");
  });
});
