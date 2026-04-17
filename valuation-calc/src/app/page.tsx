"use client";

import { useState, useMemo, useCallback } from "react";
import { getGeographies, getGeographyData } from "../lib/data";
import { calculateValuation, calculateScenarioComparison } from "../lib/engine";
import type { ValuationInputs, ValuationResult, NarrativeResponse, ScenarioComparison } from "../lib/types";
import { saveToHistory, getHistory } from "../lib/history";
import type { HistoryEntry } from "../lib/types";
import ResultsView from "../components/ResultsView";
import HistoryView from "../components/HistoryView";
import InfoTooltip from "../components/InfoTooltip";

const geographies = getGeographies();

const FIELD_INFO = {
  companyName: "Used to track this valuation in your history. Helps you compare results over time for the same company.",
  geography: "Valuation multiples vary significantly by region due to market maturity, regulatory environment, and buyer appetite.",
  industry: "Each industry has distinct valuation drivers and comparable transaction multiples. The quality factors shown will adapt to the selected industry.",
  revenueYear1: "Most recent full-year revenue. Used as the primary size indicator and to calculate the 3-year compound annual growth rate (CAGR).",
  revenueYear2: "Revenue from one year prior. Used together with Year 1 and Year 3 to calculate your revenue growth trajectory.",
  revenueYear3: "Revenue from two years prior. The oldest data point for calculating your 3-year CAGR, which impacts the growth premium/discount.",
  ebitda: "Earnings Before Interest, Taxes, Depreciation, and Amortization. The primary earnings metric used for EV/EBITDA multiples in most industries.",
  ownerComp: "Above-market salary or benefits paid to the owner. Buyers normalize this to market rate, so it's added back to show true earning power.",
  oneTime: "Non-recurring expenses (e.g., lawsuit settlement, one-off consulting project, relocation costs) that won't repeat under new ownership.",
  relatedParty: "Transactions with related parties at non-market rates (e.g., below-market rent from owner's property). Adjusted to fair market value.",
};

function emptyInputs(): ValuationInputs {
  return {
    geographyId: "",
    industryId: "",
    revenueYear1: 0,
    revenueYear2: 0,
    revenueYear3: 0,
    ebitda: 0,
    addbacks: { ownerCompensation: 0, oneTimeExpenses: 0, relatedPartyAdjustments: 0 },
    qualityFactors: {},
  };
}

const inputClass =
  "w-full rounded-lg border border-[#2d4a2d]/20 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2d4a2d] focus:ring-1 focus:ring-[#2d4a2d] transition-colors";

const selectClass =
  "w-full rounded-lg border border-[#2d4a2d]/20 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#2d4a2d] focus:ring-1 focus:ring-[#2d4a2d] disabled:opacity-50 transition-colors";

function unitLabel(unit: string): string {
  switch (unit) {
    case "percent": case "percent_rate": case "percent_growth": return "%";
    case "hours_per_week": return "hrs/wk";
    case "months": return "months";
    case "years": return "yrs";
    case "ratio": return "x";
    default: return unit;
  }
}

export default function Home() {
  const [inputs, setInputs] = useState<ValuationInputs>(emptyInputs());
  const [companyName, setCompanyName] = useState("");
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [narrative, setNarrative] = useState<NarrativeResponse | null>(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [scenarioInputs, setScenarioInputs] = useState<ValuationInputs | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const toggleHistory = useCallback(() => {
    if (!historyLoaded) {
      setHistory(getHistory());
      setHistoryLoaded(true);
    }
    setShowHistory((v) => !v);
  }, [historyLoaded]);

  const geoData = useMemo(() => {
    if (!inputs.geographyId) return null;
    return getGeographyData(inputs.geographyId);
  }, [inputs.geographyId]);

  const industryData = useMemo(() => {
    if (!geoData || !inputs.industryId) return null;
    return geoData.industries[inputs.industryId] ?? null;
  }, [geoData, inputs.industryId]);

  const industries = useMemo(() => {
    if (!geoData) return [];
    return Object.values(geoData.industries);
  }, [geoData]);

  function updateInput<K extends keyof ValuationInputs>(key: K, value: ValuationInputs[K]) {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "geographyId") { next.industryId = ""; next.qualityFactors = {}; }
      if (key === "industryId") { next.qualityFactors = {}; }
      return next;
    });
  }

  function updateAddback(key: keyof ValuationInputs["addbacks"], value: number) {
    setInputs((prev) => ({ ...prev, addbacks: { ...prev.addbacks, [key]: value } }));
  }

  function updateQualityFactor(factorId: string, value: number) {
    setInputs((prev) => ({ ...prev, qualityFactors: { ...prev.qualityFactors, [factorId]: value } }));
  }

  async function handleCalculate() {
    if (!geoData) return;
    const res = calculateValuation(inputs, geoData);
    setResult(res);
    setScenarioInputs({ ...inputs });

    if (companyName.trim()) {
      const entry = saveToHistory(companyName, inputs, res);
      setHistory((prev) => [entry, ...prev]);
    }

    setNarrativeLoading(true);
    setNarrative(null);
    try {
      const resp = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputs, result: res }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as NarrativeResponse;
        setNarrative(data);
      }
    } catch {
      // Silently fail — deterministic results already shown
    } finally {
      setNarrativeLoading(false);
    }
  }

  const scenario: ScenarioComparison | null = useMemo(() => {
    if (!result || !scenarioInputs || !geoData) return null;
    const origFactors = JSON.stringify(inputs.qualityFactors);
    const scenFactors = JSON.stringify(scenarioInputs.qualityFactors);
    if (origFactors === scenFactors) return null;
    return calculateScenarioComparison(scenarioInputs, inputs, geoData);
  }, [inputs, scenarioInputs, geoData, result]);

  function handleReset() {
    setInputs(emptyInputs());
    setCompanyName("");
    setResult(null);
    setNarrative(null);
    setScenarioInputs(null);
  }

  const canCalculate =
    inputs.geographyId && inputs.industryId && inputs.revenueYear1 > 0 && inputs.ebitda !== 0;

  // Results view
  if (result) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#2d4a2d]/60">
            {companyName || "Unnamed Company"} &middot; {result.industryLabel} &middot; {result.geographyLabel}
          </h2>
          <div className="flex gap-3">
            <button onClick={toggleHistory} className="text-sm text-[#2d4a2d]/60 hover:text-[#2d4a2d] transition-colors">
              {showHistory ? "Hide History" : "History"}
            </button>
            <button onClick={handleReset} className="text-sm font-medium text-[#2d4a2d] hover:text-[#b8963e] transition-colors">
              + New Valuation
            </button>
          </div>
        </div>

        {showHistory && <HistoryView history={history} />}

        <ResultsView
          result={result}
          narrative={narrative}
          narrativeLoading={narrativeLoading}
          scenario={scenario}
          industryData={industryData}
          inputs={inputs}
          onQualityFactorChange={(factorId, value) => updateQualityFactor(factorId, value)}
        />
      </div>
    );
  }

  // Form view
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#2d4a2d]">New Valuation</h2>
          <p className="text-sm text-[#2d4a2d]/50 mt-0.5">Enter company details to calculate an approximate enterprise value</p>
        </div>
        <button onClick={toggleHistory} className="text-sm text-[#2d4a2d]/60 hover:text-[#2d4a2d] transition-colors">
          {showHistory ? "Hide History" : "History"}
        </button>
      </div>

      {showHistory && <HistoryView history={history} />}

      {/* Company Name */}
      <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5 space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-[#2d4a2d] mb-1.5">
            Company Name
            <InfoTooltip text={FIELD_INFO.companyName} />
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Optional — for history tracking"
            className={inputClass}
          />
        </div>

        {/* Geography */}
        <div>
          <label className="flex items-center text-sm font-medium text-[#2d4a2d] mb-1.5">
            Geography
            <InfoTooltip text={FIELD_INFO.geography} />
          </label>
          <select value={inputs.geographyId} onChange={(e) => updateInput("geographyId", e.target.value)} className={selectClass}>
            <option value="">Select region...</option>
            {geographies.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#2d4a2d] tracking-wide uppercase">Financial Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              Revenue Year 1 <span className="text-[#b8963e] ml-0.5">(latest)</span>
              <InfoTooltip text={FIELD_INFO.revenueYear1} />
            </label>
            <input type="number" value={inputs.revenueYear1 || ""} onChange={(e) => updateInput("revenueYear1", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              Revenue Year 2
              <InfoTooltip text={FIELD_INFO.revenueYear2} />
            </label>
            <input type="number" value={inputs.revenueYear2 || ""} onChange={(e) => updateInput("revenueYear2", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              Revenue Year 3 <span className="text-[#b8963e] ml-0.5">(oldest)</span>
              <InfoTooltip text={FIELD_INFO.revenueYear3} />
            </label>
            <input type="number" value={inputs.revenueYear3 || ""} onChange={(e) => updateInput("revenueYear3", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
        </div>
        <div className="max-w-xs">
          <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
            EBITDA <span className="text-[#b8963e] ml-0.5">(most recent year)</span>
            <InfoTooltip text={FIELD_INFO.ebitda} />
          </label>
          <input type="number" value={inputs.ebitda || ""} onChange={(e) => updateInput("ebitda", Number(e.target.value))} placeholder="$" className={inputClass} />
        </div>
      </div>

      {/* Addbacks */}
      <div className="bg-white rounded-xl border border-[#2d4a2d]/10 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#2d4a2d] tracking-wide uppercase">EBITDA Addbacks</h3>
          <span className="text-xs text-[#2d4a2d]/40 font-normal normal-case">(optional)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              Owner Compensation
              <InfoTooltip text={FIELD_INFO.ownerComp} />
            </label>
            <input type="number" value={inputs.addbacks.ownerCompensation || ""} onChange={(e) => updateAddback("ownerCompensation", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              One-time Expenses
              <InfoTooltip text={FIELD_INFO.oneTime} />
            </label>
            <input type="number" value={inputs.addbacks.oneTimeExpenses || ""} onChange={(e) => updateAddback("oneTimeExpenses", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
          <div>
            <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
              Related Party Adj.
              <InfoTooltip text={FIELD_INFO.relatedParty} />
            </label>
            <input type="number" value={inputs.addbacks.relatedPartyAdjustments || ""} onChange={(e) => updateAddback("relatedPartyAdjustments", Number(e.target.value))} placeholder="$" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Industry + Quality Factors */}
      <div className="bg-white rounded-xl border border-[#b8963e]/30 p-5 space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-[#2d4a2d] mb-1.5">
            Industry
            <InfoTooltip text={FIELD_INFO.industry} />
          </label>
          <select value={inputs.industryId} onChange={(e) => updateInput("industryId", e.target.value)} disabled={!inputs.geographyId} className={selectClass}>
            <option value="">Select industry...</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id}>{ind.label}</option>
            ))}
          </select>
        </div>

        {industryData && industryData.qualityFactors.length > 0 && (
          <>
            <div className="border-t border-[#b8963e]/20 pt-4">
              <h3 className="text-sm font-semibold text-[#2d4a2d] tracking-wide uppercase">Quality Factors</h3>
              <p className="text-xs text-[#b8963e] mt-0.5 mb-3">{industryData.label} — these factors adjust your valuation multiple</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industryData.qualityFactors.map((factor) => (
                <div key={factor.id}>
                  <label className="flex items-center text-xs text-[#2d4a2d]/60 mb-1">
                    {factor.name}
                    <span className="text-[#b8963e] ml-1">({unitLabel(factor.unit)})</span>
                    <InfoTooltip text={factor.description} />
                  </label>
                  <input
                    type="number"
                    value={inputs.qualityFactors[factor.id] ?? ""}
                    onChange={(e) => updateQualityFactor(factor.id, Number(e.target.value))}
                    placeholder={factor.description}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Calculate Button */}
      <div className="pt-1">
        <button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className="w-full rounded-xl bg-[#2d4a2d] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#3a5a3a] focus:ring-2 focus:ring-[#2d4a2d] focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Calculate Valuation
        </button>
      </div>
    </div>
  );
}
