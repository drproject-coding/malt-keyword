export type CompetitionLevel = "rare" | "common" | "oversaturated";

export function getCompetitionLevel(volume: number): CompetitionLevel {
  if (volume < 10) return "rare";
  if (volume <= 100) return "common";
  return "oversaturated";
}

export function getCompetitionColor(level: CompetitionLevel): string {
  const colors: Record<CompetitionLevel, string> = {
    rare: "bg-emerald-100 text-emerald-800 border-emerald-300",
    common: "bg-amber-100 text-amber-800 border-amber-300",
    oversaturated: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[level];
}

export function getCompetitionLabel(level: CompetitionLevel): string {
  const labels: Record<CompetitionLevel, string> = {
    rare: "Rare",
    common: "Common",
    oversaturated: "Saturated",
  };
  return labels[level];
}
