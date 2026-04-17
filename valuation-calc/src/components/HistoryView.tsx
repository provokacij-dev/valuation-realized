"use client";

import type { HistoryEntry } from "../lib/types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryView({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5 text-center">
        <p className="text-sm text-[#2d4a2d]/40">No prior valuations yet. This will be your first!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5">
      <h3 className="text-xs font-semibold text-[#2d4a2d] uppercase tracking-wide mb-3">Valuation History</h3>
      <div className="space-y-2">
        {history.slice(0, 20).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between text-sm border-b border-[#2d4a2d]/5 pb-2 last:border-0">
            <div>
              <span className="font-medium text-[#2d4a2d]">{entry.companyName || "Unnamed"}</span>
              <span className="text-[#2d4a2d]/40 ml-2">{entry.result.industryLabel}</span>
            </div>
            <div className="text-right">
              <span className="font-medium text-[#b8963e]">
                {formatCurrency(entry.result.valuationLow)}–{formatCurrency(entry.result.valuationHigh)}
              </span>
              <span className="text-xs text-[#2d4a2d]/30 ml-2">{formatDate(entry.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
