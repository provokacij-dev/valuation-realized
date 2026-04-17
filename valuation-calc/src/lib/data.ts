import rawData from "../data/industries.json";
import type { GeographyData, Geography } from "./types";

const data = rawData as { geographies: Record<string, GeographyData> };

export function getGeographies(): Geography[] {
  return Object.values(data.geographies).map((g) => g.geography);
}

export function getGeographyData(geographyId: string): GeographyData | null {
  return data.geographies[geographyId] ?? null;
}
