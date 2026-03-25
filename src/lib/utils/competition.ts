export type CompetitionLevel =
  | "rare"
  | "niche"
  | "common"
  | "crowded"
  | "saturated";

export function getCompetitionLevel(volume: number): CompetitionLevel {
  if (volume < 500) return "rare";
  if (volume < 3_000) return "niche";
  if (volume < 10_000) return "common";
  if (volume < 30_000) return "crowded";
  return "saturated";
}

export function getCompetitionColor(level: CompetitionLevel): string {
  const colors: Record<CompetitionLevel, string> = {
    rare: "bg-emerald-100 text-emerald-800 border-emerald-200",
    niche: "bg-indigo-100 text-indigo-800 border-indigo-200",
    common: "bg-amber-100 text-amber-800 border-amber-200",
    crowded: "bg-orange-100 text-orange-800 border-orange-200",
    saturated: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[level];
}

export function getCompetitionLabel(level: CompetitionLevel): string {
  const labels: Record<CompetitionLevel, string> = {
    rare: "Rare",
    niche: "Niche",
    common: "Common",
    crowded: "Crowded",
    saturated: "Saturated",
  };
  return labels[level];
}

export function getCompetitionDot(level: CompetitionLevel): string {
  const colors: Record<CompetitionLevel, string> = {
    rare: "#10b981",
    niche: "#6366f1",
    common: "#f59e0b",
    crowded: "#f97316",
    saturated: "#ef4444",
  };
  return colors[level];
}

export function getCompetitionVerdict(
  level: CompetitionLevel,
  label: string,
  volume: number,
): string {
  const count = volume.toLocaleString("fr-FR");
  switch (level) {
    case "rare":
      return `${count} freelancers claim "${label}" — first-mover advantage is real.`;
    case "niche":
      return `${count} freelancers claim "${label}" — a strong profile can own this.`;
    case "common":
      return `${count} freelancers claim "${label}" — differentiation matters here.`;
    case "crowded":
      return `${count} freelancers claim "${label}" — specialization is your edge.`;
    case "saturated":
      return `${count} freelancers claim "${label}" — this keyword alone won't differentiate you.`;
  }
}
