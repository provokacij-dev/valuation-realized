import type { HistoryEntry, ValuationInputs, ValuationResult } from "./types";

const STORAGE_KEY = "vr-valuation-history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(
  companyName: string,
  inputs: ValuationInputs,
  result: ValuationResult
): HistoryEntry {
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    companyName,
    inputs,
    result,
  };
  const history = getHistory();
  history.unshift(entry);
  // Keep last 100 entries
  const trimmed = history.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return entry;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
