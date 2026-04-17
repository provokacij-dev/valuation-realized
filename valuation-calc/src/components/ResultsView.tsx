"use client";

import type { ValuationResult, NarrativeResponse, ScenarioComparison, IndustryData, ValuationInputs } from "../lib/types";
import { generatePDF } from "../lib/pdf";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function formatMultiple(value: number, type: string): string {
  return `${value.toFixed(1)}x ${type}`;
}

interface Props {
  result: ValuationResult;
  narrative: NarrativeResponse | null;
  narrativeLoading: boolean;
  scenario: ScenarioComparison | null;
  industryData: IndustryData | null;
  inputs: ValuationInputs;
  onQualityFactorChange: (factorId: string, value: number) => void;
}

export default function ResultsView({
  result,
  narrative,
  narrativeLoading,
  scenario,
  industryData,
  inputs,
  onQualityFactorChange,
}: Props) {
  const rangePct =
    result.valuationHigh > result.valuationLow
      ? ((result.valuationMid - result.valuationLow) / (result.valuationHigh - result.valuationLow)) * 100
      : 50;

  return (
    <div className="space-y-6">
      {/* LEVEL 1: THE NUMBER */}
      <section className="bg-white rounded-xl border border-[#2d4a2d]/10 p-8 text-center shadow-sm">
        <p className="text-sm text-[#2d4a2d]/50 mb-2 uppercase tracking-wide font-medium">Estimated Enterprise Value</p>
        <div className="text-4xl font-bold text-[#2d4a2d] mb-1">
          {formatCurrency(result.valuationLow)} — {formatCurrency(result.valuationHigh)}
        </div>
        <p className="text-lg text-[#b8963e] font-medium mb-5">
          Midpoint: {formatCurrency(result.valuationMid)}
        </p>

        {/* Range bar */}
        <div className="relative h-2.5 bg-[#2d4a2d]/5 rounded-full mx-auto max-w-md">
          <div className="absolute h-full bg-gradient-to-r from-[#2d4a2d]/20 via-[#b8963e]/40 to-[#2d4a2d]/20 rounded-full" style={{ left: "0%", width: "100%" }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#b8963e] rounded-full border-2 border-white shadow-md" style={{ left: `${rangePct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-[#2d4a2d]/40 mt-1.5 max-w-md mx-auto">
          <span>{formatCurrency(result.valuationLow)}</span>
          <span>{formatCurrency(result.valuationHigh)}</span>
        </div>

        <p className="text-xs text-[#2d4a2d]/40 mt-4">
          Based on {formatMultiple(result.adjustedMultiple, result.multipleType)} &middot;
          {result.isRevenueBased ? " Revenue-based (negative EBITDA)" : ` Adjusted EBITDA: ${formatCurrency(result.adjustedEbitda)}`}
        </p>

        {result.warnings.length > 0 && (
          <div className="mt-4 space-y-1">
            {result.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
                {w}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* LEVEL 2: THE WHY */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5">
          <h3 className="text-xs font-semibold text-[#2d4a2d] uppercase tracking-wide mb-3">Quality Factor Adjustments</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[#2d4a2d]/40 border-b border-[#2d4a2d]/10 pb-1.5">
              <span>Factor</span>
              <span>Adjustment</span>
            </div>
            {result.qualityAdjustments.map((qa) => (
              <div key={qa.factorId} className="flex justify-between text-sm">
                <span className="text-[#2d4a2d]/70">{qa.factorName}</span>
                <span className={qa.adjustment >= 0 ? "text-[#2d4a2d] font-medium" : "text-red-600 font-medium"}>
                  {qa.adjustment >= 0 ? "+" : ""}{qa.adjustment.toFixed(1)}x
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium border-t border-[#2d4a2d]/10 pt-1.5">
              <span className="text-[#2d4a2d]/60">Base multiple</span>
              <span className="text-[#2d4a2d]">{result.baseMultiple.toFixed(1)}x</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-[#2d4a2d]/60">Total adjustment</span>
              <span className={result.totalAdjustment >= 0 ? "text-[#2d4a2d]" : "text-red-600"}>
                {result.totalAdjustment >= 0 ? "+" : ""}{result.totalAdjustment.toFixed(1)}x
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-[#b8963e]/30 pt-1.5">
              <span className="text-[#2d4a2d]">Adjusted multiple</span>
              <span className="text-[#b8963e]">{result.adjustedMultiple.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5">
          <h3 className="text-xs font-semibold text-[#2d4a2d] uppercase tracking-wide mb-1">Peer Comparison</h3>
          <p className="text-xs text-[#2d4a2d]/40 mb-3">
            {result.industryLabel} &middot; {result.sizeBand} revenue
          </p>
          {result.comparableTransactions.length > 0 ? (
            <div className="space-y-3">
              {result.comparableTransactions.map((tx, i) => (
                <div key={i} className="text-sm border-l-2 border-[#b8963e]/40 pl-3">
                  <p className="text-[#2d4a2d]/80">{tx.description}</p>
                  <p className="text-xs text-[#2d4a2d]/40">
                    {tx.multiple.toFixed(1)}x &middot; {tx.date} &middot; {tx.source}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#2d4a2d]/30">No comparable transactions available.</p>
          )}
          <p className="text-xs text-[#b8963e] mt-3 font-medium">
            Your adjusted multiple: {result.adjustedMultiple.toFixed(1)}x
          </p>
        </div>
      </section>

      {/* LEVEL 3: WHAT IF */}
      {industryData && (
        <section className="bg-white rounded-xl border border-[#b8963e]/20 p-5">
          <h3 className="text-xs font-semibold text-[#2d4a2d] uppercase tracking-wide mb-0.5">What If You Improved...</h3>
          <p className="text-xs text-[#2d4a2d]/40 mb-4">Drag sliders to see how improvements affect your valuation</p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {industryData.qualityFactors.map((factor) => {
              const currentVal = inputs.qualityFactors[factor.id] ?? 0;
              const minVal = 0;
              const maxVal = (factor.thresholds[factor.thresholds.length - 1] ?? 100) * 1.5;

              return (
                <div key={factor.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#2d4a2d]/60">{factor.name}</span>
                    <span className="font-medium text-[#2d4a2d]">
                      {currentVal}{factor.unit === "percent" || factor.unit === "percent_rate" || factor.unit === "percent_growth" ? "%" : ""}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={1}
                    value={currentVal}
                    onChange={(e) => onQualityFactorChange(factor.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-[#2d4a2d]/10 rounded-lg appearance-none cursor-pointer accent-[#b8963e]"
                  />
                </div>
              );
            })}
          </div>

          {scenario && (
            <div className={`mt-4 rounded-lg p-3 text-sm ${scenario.delta >= 0 ? "bg-[#2d4a2d]/5 text-[#2d4a2d]" : "bg-red-50 text-red-800"}`}>
              <span className="font-semibold">
                {scenario.delta >= 0 ? "+" : ""}{formatCurrency(Math.abs(scenario.delta))}
              </span>
              {" "}({scenario.deltaPercent >= 0 ? "+" : ""}{scenario.deltaPercent.toFixed(1)}%) estimated valuation change
              {scenario.changedFactors.length > 0 && (
                <span className="text-xs block mt-1 opacity-70">
                  Driven by: {scenario.changedFactors.map((cf) => {
                    const factor = industryData.qualityFactors.find((f) => f.id === cf.factorId);
                    return factor?.name || cf.factorId;
                  }).join(", ")}
                </span>
              )}
            </div>
          )}
        </section>
      )}

      {/* LEVEL 4: THE NARRATIVE */}
      <section className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5">
        <h3 className="text-xs font-semibold text-[#2d4a2d] uppercase tracking-wide mb-3">Analysis</h3>
        {narrativeLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-[#2d4a2d]/5 rounded w-3/4" />
            <div className="h-4 bg-[#2d4a2d]/5 rounded w-full" />
            <div className="h-4 bg-[#2d4a2d]/5 rounded w-5/6" />
            <div className="h-4 bg-[#2d4a2d]/5 rounded w-2/3" />
          </div>
        ) : narrative ? (
          <div className="space-y-4 text-sm text-[#2d4a2d]/80 leading-relaxed">
            <p>{narrative.summary}</p>
            <p>{narrative.peerContext}</p>
            {narrative.improvementSuggestions.length > 0 && (
              <div>
                <p className="font-medium text-[#2d4a2d] mb-1">Opportunities to increase valuation:</p>
                <ul className="list-disc list-inside space-y-1 text-[#2d4a2d]/60">
                  {narrative.improvementSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {narrative.riskFlags.length > 0 && (
              <div>
                <p className="font-medium text-[#2d4a2d] mb-1">Risk factors to consider:</p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  {narrative.riskFlags.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-[#2d4a2d]/60 leading-relaxed">
            <p>
              Companies in the {result.industryLabel} sector with {result.sizeBand} revenue typically trade at{" "}
              {result.baseMultiple.toFixed(1)}x {result.multipleType}. Your quality factor profile places you at{" "}
              {result.adjustedMultiple.toFixed(1)}x, which is{" "}
              {result.adjustedMultiple > result.baseMultiple ? "above" : result.adjustedMultiple < result.baseMultiple ? "below" : "at"}{" "}
              the industry median.
            </p>
          </div>
        )}
      </section>

      {/* ADDITIONAL CONTEXT */}
      {result.valuationContext && (
        <section className="bg-white rounded-xl border border-[#2d4a2d]/10 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-[#2d4a2d] tracking-wide uppercase">Additional Context</h3>
          <p className="text-sm text-[#2d4a2d]/60 leading-relaxed">{result.valuationContext.regionalNotes}</p>
          {result.valuationContext.keyDrivers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#2d4a2d]/80 mb-1.5">Key value drivers for {result.industryLabel}:</p>
              <div className="flex flex-wrap gap-1.5">
                {result.valuationContext.keyDrivers.map((driver, i) => (
                  <span key={i} className="inline-block text-xs bg-[#2d4a2d]/5 text-[#2d4a2d]/70 rounded-full px-2.5 py-0.5">{driver}</span>
                ))}
              </div>
            </div>
          )}

          {/* Method */}
          <div className="border-t border-[#2d4a2d]/5 pt-3">
            <p className="text-xs font-medium text-[#2d4a2d]/80 mb-0.5">Valuation Method</p>
            <p className="text-xs text-[#2d4a2d]/50">{result.valuationContext.method}</p>
          </div>

          {/* Sources */}
          <div className="border-t border-[#2d4a2d]/5 pt-3">
            <p className="text-xs font-medium text-[#2d4a2d]/80 mb-1">Data Sources</p>
            <ul className="text-xs text-[#2d4a2d]/50 space-y-0.5">
              {result.valuationContext.sources.map((source, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#b8963e] mt-0.5">&#8226;</span>
                  {source}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimers */}
          <div className="border-t border-[#2d4a2d]/5 pt-3">
            <p className="text-xs font-medium text-[#2d4a2d]/80 mb-1">Disclaimers</p>
            <ul className="text-xs text-[#2d4a2d]/40 space-y-1">
              {result.valuationContext.disclaimers.map((disclaimer, i) => (
                <li key={i}>{disclaimer}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* LEVEL 5: THE ACTION */}
      <section className="flex gap-4">
        <button
          onClick={() => generatePDF(result, narrative)}
          className="flex-1 rounded-xl border border-[#2d4a2d]/20 bg-white px-4 py-3 text-sm font-medium text-[#2d4a2d] hover:bg-[#2d4a2d]/5 transition-colors"
        >
          Download PDF Report
        </button>
        <a
          href="https://valuationrealized.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-xl bg-[#b8963e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a6852f] text-center transition-colors shadow-sm"
        >
          Book Detailed Valuation
        </a>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-[#2d4a2d]/30 text-center">
        This is an approximation for planning purposes only. It is not a formal valuation and should not be
        relied upon for transaction decisions without professional advice.
      </p>
    </div>
  );
}
