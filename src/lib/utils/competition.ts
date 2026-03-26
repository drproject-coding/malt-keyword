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
    rare: "bg-emerald-500/10 text-emerald-400",
    niche: "bg-lime-500/10 text-lime-400",
    common: "bg-amber-500/10 text-amber-400",
    crowded: "bg-orange-500/10 text-orange-400",
    saturated: "bg-red-500/10 text-red-400",
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
    niche: "#84cc16",
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
