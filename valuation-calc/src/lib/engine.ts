import type {
  ValuationInputs,
  ValuationResult,
  GeographyData,
  IndustryData,
  ScenarioComparison,
} from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SizeBand = IndustryData["sizeBands"][number];

/**
 * 3-year CAGR from most recent (year1) to oldest (year3).
 * Returns 0 if year3 <= 0 to avoid NaN / Infinity.
 */
export function calculateCAGR(
  revenueYear1: number,
  _revenueYear2: number,
  revenueYear3: number,
): number {
  if (revenueYear3 <= 0) return 0;
  // 2-period CAGR: (end / start)^(1/2) - 1
  return Math.pow(revenueYear1 / revenueYear3, 1 / 2) - 1;
}

/**
 * Adjusted EBITDA = raw EBITDA + all addbacks.
 */
export function calculateAdjustedEbitda(
  ebitda: number,
  addbacks: ValuationInputs["addbacks"],
): number {
  return (
    ebitda +
    addbacks.ownerCompensation +
    addbacks.oneTimeExpenses +
    addbacks.relatedPartyAdjustments
  );
}

/**
 * Determine which size band the most-recent revenue falls into.
 * Bands are defined per-industry in the dataset.
 * Returns null if revenue is outside all defined bands.
 */
export function getSizeBand(
  revenue: number,
  industry: IndustryData,
): SizeBand | null {
  // Revenue thresholds implied by standard band IDs
  const bandRanges: Record<string, [number, number]> = {
    "$1-5M": [1_000_000, 5_000_000],
    "$5-15M": [5_000_000, 15_000_000],
    "$15-50M": [15_000_000, 50_000_000],
  };

  for (const band of industry.sizeBands) {
    const range = bandRanges[band.id];
    if (!range) continue;
    if (revenue >= range[0] && revenue <= range[1]) {
      return band;
    }
  }
  return null;
}

/**
 * For each quality factor defined in the industry, determine which threshold
 * band the user's input value falls into and return the corresponding
 * adjustment.
 *
 * Threshold logic:
 *   thresholds = [t0, t1, t2]  →  bands = (-∞, t0), [t0, t1), [t1, t2), [t2, +∞)
 *   adjustments has one more entry than thresholds.
 */
export function calculateQualityAdjustments(
  inputs: ValuationInputs,
  industry: IndustryData,
): ValuationResult["qualityAdjustments"] {
  return industry.qualityFactors.map((factor) => {
    const value = inputs.qualityFactors[factor.id];

    // Missing / undefined → 0 adjustment
    if (value === undefined || value === null) {
      return {
        factorId: factor.id,
        factorName: factor.name,
        value: 0,
        adjustment: 0,
      };
    }

    // Find the band index
    let bandIndex = 0;
    for (let i = 0; i < factor.thresholds.length; i++) {
      if (value >= factor.thresholds[i]) {
        bandIndex = i + 1;
      } else {
        break;
      }
    }

    const adjustment = factor.adjustments[bandIndex] ?? 0;

    return {
      factorId: factor.id,
      factorName: factor.name,
      value,
      adjustment,
    };
  });
}

// ---------------------------------------------------------------------------
// Main valuation function
// ---------------------------------------------------------------------------

export function calculateValuation(
  inputs: ValuationInputs,
  geographyData: GeographyData,
): ValuationResult {
  const warnings: string[] = [];
  const industry = geographyData.industries[inputs.industryId];

  if (!industry) {
    throw new Error(`Industry "${inputs.industryId}" not found in geography data.`);
  }

  // 1. Adjusted EBITDA
  const adjustedEbitda = calculateAdjustedEbitda(inputs.ebitda, inputs.addbacks);

  // 2. Revenue CAGR
  const revenueCAGR = calculateCAGR(
    inputs.revenueYear1,
    inputs.revenueYear2,
    inputs.revenueYear3,
  );

  // 3. Size band
  const sizeBand = getSizeBand(inputs.revenueYear1, industry);

  if (inputs.revenueYear1 < 1_000_000) {
    warnings.push("Below minimum threshold");
  }

  // Use the smallest band as fallback when revenue is outside defined bands
  const effectiveBand = sizeBand ?? industry.sizeBands[0];

  // 4. Determine if we must use revenue-based multiples
  let isRevenueBased = false;
  let multipleType = industry.primaryMultiple;

  if (adjustedEbitda <= 0) {
    isRevenueBased = true;
    multipleType = "EV/Revenue";
    warnings.push(
      "Negative adjusted EBITDA — valuation uses EV/Revenue multiples instead.",
    );
  }

  // 5. Base multiple (median from size band)
  const baseMultiple = effectiveBand.multiples.median;

  // 6. Quality adjustments
  const qualityAdjustments = calculateQualityAdjustments(inputs, industry);
  let totalAdjustment = qualityAdjustments.reduce(
    (sum, qa) => sum + qa.adjustment,
    0,
  );

  // 7. Revenue-decline discount: >10% YoY decline → -1.0x
  const yoyGrowth =
    inputs.revenueYear2 > 0
      ? (inputs.revenueYear1 - inputs.revenueYear2) / inputs.revenueYear2
      : 0;

  if (yoyGrowth < -0.1) {
    totalAdjustment -= 1.0;
    warnings.push(
      "Revenue declined >10% year-over-year — applied -1.0x discount.",
    );
  }

  // 8. Clamp adjusted multiple: floor 1.0x, ceiling = band high + 2.0x
  const multipleFloor = 1.0;
  const multipleCeiling = effectiveBand.multiples.high + 2.0;
  const adjustedMultiple = Math.min(
    Math.max(baseMultiple + totalAdjustment, multipleFloor),
    multipleCeiling,
  );

  // 9. Calculate valuations
  const base = isRevenueBased ? inputs.revenueYear1 : adjustedEbitda;
  const valuationMid = adjustedMultiple * base;
  const valuationLow = Math.max(adjustedMultiple - 1.0, multipleFloor) * base;
  const valuationHigh = Math.min(adjustedMultiple + 1.0, multipleCeiling) * base;

  return {
    adjustedEbitda,
    revenueCAGR,
    baseMultiple,
    qualityAdjustments,
    totalAdjustment,
    adjustedMultiple,
    valuationLow,
    valuationMid,
    valuationHigh,
    multipleType,
    sizeBand: effectiveBand.id,
    isRevenueBased,
    warnings,
    comparableTransactions: industry.comparableTransactions,
    valuationContext: industry.valuationContext,
    industryLabel: industry.label,
    geographyLabel: geographyData.geography.label,
  };
}

// ---------------------------------------------------------------------------
// Scenario comparison
// ---------------------------------------------------------------------------

export function calculateScenarioComparison(
  originalInputs: ValuationInputs,
  modifiedInputs: ValuationInputs,
  geographyData: GeographyData,
): ScenarioComparison {
  const originalResult = calculateValuation(originalInputs, geographyData);
  const modifiedResult = calculateValuation(modifiedInputs, geographyData);

  const delta = modifiedResult.valuationMid - originalResult.valuationMid;
  const deltaPercent =
    originalResult.valuationMid !== 0
      ? delta / originalResult.valuationMid
      : 0;

  // Identify which quality factors changed and their individual impact
  const industry = geographyData.industries[originalInputs.industryId];
  const changedFactors: ScenarioComparison["changedFactors"] = [];

  if (industry) {
    for (const factor of industry.qualityFactors) {
      const fromVal = originalInputs.qualityFactors[factor.id] ?? 0;
      const toVal = modifiedInputs.qualityFactors[factor.id] ?? 0;

      if (fromVal !== toVal) {
        // Isolate impact: run engine with only this factor changed
        const isolatedInputs: ValuationInputs = {
          ...originalInputs,
          qualityFactors: {
            ...originalInputs.qualityFactors,
            [factor.id]: toVal,
          },
        };
        const isolatedResult = calculateValuation(isolatedInputs, geographyData);
        const valuationImpact =
          isolatedResult.valuationMid - originalResult.valuationMid;

        changedFactors.push({
          factorId: factor.id,
          from: fromVal,
          to: toVal,
          valuationImpact,
        });
      }
    }
  }

  return {
    originalResult,
    modifiedResult,
    delta,
    deltaPercent,
    changedFactors,
  };
}
