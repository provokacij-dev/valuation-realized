// Geography and industry selection
export interface Geography {
  id: string;
  label: string;
  industries: string[]; // industry IDs available in this geography
}

// Industry-specific quality factor definition
export interface QualityFactorDef {
  id: string;
  name: string;
  unit: string; // "percent", "hours_per_week", "percent_growth", "months", "percent_rate", etc.
  thresholds: number[]; // breakpoints (e.g., [20, 50, 80] for recurring revenue)
  adjustments: number[]; // adjustment per band (e.g., [0, 0.5, 1.0, 1.5]) - one more than thresholds
  description: string; // shown on form
}

// Valuation context for report sections
export interface ValuationContext {
  keyDrivers: string[];
  regionalNotes: string;
  disclaimers: string[];
  method: string;
  sources: string[];
}

// Industry data (loaded from JSON)
export interface IndustryData {
  id: string;
  label: string;
  primaryMultiple: "EV/EBITDA" | "EV/Revenue" | "EV/ARR";
  valuationContext: ValuationContext;
  sizeBands: {
    id: string; // "$1-5M", "$5-15M", "$15-50M"
    label: string;
    multiples: { low: number; median: number; high: number };
  }[];
  qualityFactors: QualityFactorDef[];
  comparableTransactions: {
    description: string; // "Professional services, $3-5M revenue, US"
    multiple: number;
    date: string; // "Q3 2025"
    source: string;
  }[];
}

// Full dataset per geography
export interface GeographyData {
  geography: Geography;
  industries: Record<string, IndustryData>;
}

// User inputs from the form
export interface ValuationInputs {
  geographyId: string;
  industryId: string;
  revenueYear1: number; // most recent year
  revenueYear2: number; // 1 year ago
  revenueYear3: number; // 2 years ago
  ebitda: number;
  addbacks: {
    ownerCompensation: number;
    oneTimeExpenses: number;
    relatedPartyAdjustments: number;
  };
  qualityFactors: Record<string, number>; // factorId -> value
}

// Valuation engine output
export interface ValuationResult {
  // Core valuation
  adjustedEbitda: number;
  revenueCAGR: number;
  baseMultiple: number;
  qualityAdjustments: { factorId: string; factorName: string; value: number; adjustment: number }[];
  totalAdjustment: number;
  adjustedMultiple: number;
  valuationLow: number;
  valuationMid: number;
  valuationHigh: number;

  // Metadata
  multipleType: "EV/EBITDA" | "EV/Revenue" | "EV/ARR";
  sizeBand: string;
  isRevenueBased: boolean; // true if negative EBITDA forced revenue-based
  warnings: string[];

  // For display
  comparableTransactions: IndustryData["comparableTransactions"];
  valuationContext: ValuationContext;
  industryLabel: string;
  geographyLabel: string;
}

// Scenario comparison
export interface ScenarioComparison {
  originalResult: ValuationResult;
  modifiedResult: ValuationResult;
  delta: number; // valuationMid difference
  deltaPercent: number;
  changedFactors: { factorId: string; from: number; to: number; valuationImpact: number }[];
}

// AI narrative (structured output from Claude)
export interface NarrativeResponse {
  summary: string;
  peerContext: string;
  improvementSuggestions: string[];
  riskFlags: string[];
}

// Valuation history entry (localStorage)
export interface HistoryEntry {
  id: string;
  timestamp: string; // ISO
  companyName: string;
  inputs: ValuationInputs;
  result: ValuationResult;
}
