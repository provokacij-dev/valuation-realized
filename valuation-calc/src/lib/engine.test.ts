import { describe, test, expect } from "bun:test";
import {
  calculateCAGR,
  calculateAdjustedEbitda,
  getSizeBand,
  calculateQualityAdjustments,
  calculateValuation,
  calculateScenarioComparison,
} from "./engine";
import type {
  ValuationInputs,
  GeographyData,
  IndustryData,
} from "./types";

// Load real industry data
import rawData from "../data/industries.json";
const usData = (rawData as any).geographies.us as GeographyData;

// ---------------------------------------------------------------------------
// Helper: build a ValuationInputs object with sensible defaults
// ---------------------------------------------------------------------------
function makeInputs(overrides: Partial<ValuationInputs> = {}): ValuationInputs {
  return {
    geographyId: "us",
    industryId: "professional_services",
    revenueYear1: 5_000_000,
    revenueYear2: 4_500_000,
    revenueYear3: 4_000_000,
    ebitda: 1_000_000,
    addbacks: {
      ownerCompensation: 0,
      oneTimeExpenses: 0,
      relatedPartyAdjustments: 0,
    },
    qualityFactors: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. calculateCAGR
// ---------------------------------------------------------------------------
describe("calculateCAGR", () => {
  test("normal growth: 5M → 4.2M → 3.5M gives ~19.5% CAGR", () => {
    const cagr = calculateCAGR(5_000_000, 4_200_000, 3_500_000);
    // (5M / 3.5M)^(1/2) - 1 ≈ 0.1952
    expect(cagr).toBeCloseTo(0.1952, 3);
  });

  test("flat revenue: 5M, 5M, 5M → 0% CAGR", () => {
    const cagr = calculateCAGR(5_000_000, 5_000_000, 5_000_000);
    expect(cagr).toBe(0);
  });

  test("declining revenue: 3M, 4M, 5M → negative CAGR", () => {
    const cagr = calculateCAGR(3_000_000, 4_000_000, 5_000_000);
    // (3/5)^(1/2) - 1 ≈ -0.2254
    expect(cagr).toBeLessThan(0);
    expect(cagr).toBeCloseTo(-0.2254, 3);
  });

  test("year3 = 0 → returns 0 (edge case)", () => {
    const cagr = calculateCAGR(5_000_000, 3_000_000, 0);
    expect(cagr).toBe(0);
  });

  test("year3 negative → returns 0 (edge case)", () => {
    const cagr = calculateCAGR(5_000_000, 3_000_000, -100_000);
    expect(cagr).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. calculateAdjustedEbitda
// ---------------------------------------------------------------------------
describe("calculateAdjustedEbitda", () => {
  test("no addbacks → raw EBITDA", () => {
    const result = calculateAdjustedEbitda(1_000_000, {
      ownerCompensation: 0,
      oneTimeExpenses: 0,
      relatedPartyAdjustments: 0,
    });
    expect(result).toBe(1_000_000);
  });

  test("with addbacks → EBITDA + sum of all three", () => {
    const result = calculateAdjustedEbitda(1_000_000, {
      ownerCompensation: 200_000,
      oneTimeExpenses: 50_000,
      relatedPartyAdjustments: 30_000,
    });
    expect(result).toBe(1_280_000);
  });

  test("negative EBITDA with addbacks can become positive", () => {
    const result = calculateAdjustedEbitda(-100_000, {
      ownerCompensation: 300_000,
      oneTimeExpenses: 0,
      relatedPartyAdjustments: 0,
    });
    expect(result).toBe(200_000);
  });
});

// ---------------------------------------------------------------------------
// 3. getSizeBand
// ---------------------------------------------------------------------------
describe("getSizeBand", () => {
  const profServices = usData.industries.professional_services;

  test("revenue 3M → $1-5M band", () => {
    const band = getSizeBand(3_000_000, profServices);
    expect(band).not.toBeNull();
    expect(band!.id).toBe("$1-5M");
  });

  test("revenue 10M → $5-15M band", () => {
    const band = getSizeBand(10_000_000, profServices);
    expect(band).not.toBeNull();
    expect(band!.id).toBe("$5-15M");
  });

  test("revenue 30M → $15-50M band", () => {
    const band = getSizeBand(30_000_000, profServices);
    expect(band).not.toBeNull();
    expect(band!.id).toBe("$15-50M");
  });

  test("revenue 500K → null (below minimum)", () => {
    const band = getSizeBand(500_000, profServices);
    expect(band).toBeNull();
  });

  test("revenue 60M → null (above maximum)", () => {
    const band = getSizeBand(60_000_000, profServices);
    expect(band).toBeNull();
  });

  test("revenue exactly at band boundary (5M) → falls in $1-5M band", () => {
    const band = getSizeBand(5_000_000, profServices);
    expect(band).not.toBeNull();
    expect(band!.id).toBe("$1-5M");
  });
});

// ---------------------------------------------------------------------------
// 4. calculateQualityAdjustments
// ---------------------------------------------------------------------------
describe("calculateQualityAdjustments", () => {
  // Professional services quality factors:
  //   client_retention_rate:   thresholds [70, 85, 95], adjustments [-0.5, 0, 0.5, 1.0]
  //   owner_hours_per_week:    thresholds [10, 25, 40], adjustments [1.0, 0.5, 0, -1.0]
  //   contract_backlog_months: thresholds [3, 6, 12],   adjustments [-0.5, 0, 0.5, 1.0]
  //   recurring_revenue_pct:   thresholds [20, 50, 80], adjustments [0, 0.5, 1.0, 1.5]

  test("factor below first threshold → first adjustment", () => {
    const inputs = makeInputs({
      qualityFactors: { client_retention_rate: 50 }, // below 70
    });
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    const crr = adjustments.find((a) => a.factorId === "client_retention_rate");
    expect(crr).toBeDefined();
    expect(crr!.adjustment).toBe(-0.5); // first adjustment
  });

  test("factor between first and second threshold → second adjustment", () => {
    const inputs = makeInputs({
      qualityFactors: { client_retention_rate: 80 }, // >= 70, < 85
    });
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    const crr = adjustments.find((a) => a.factorId === "client_retention_rate");
    expect(crr!.adjustment).toBe(0); // second adjustment
  });

  test("factor above highest threshold → highest adjustment", () => {
    const inputs = makeInputs({
      qualityFactors: { client_retention_rate: 98 }, // >= 95
    });
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    const crr = adjustments.find((a) => a.factorId === "client_retention_rate");
    expect(crr!.adjustment).toBe(1.0); // last adjustment
  });

  test("missing factor → 0 adjustment", () => {
    const inputs = makeInputs({ qualityFactors: {} }); // no factors provided
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    for (const adj of adjustments) {
      expect(adj.adjustment).toBe(0);
      expect(adj.value).toBe(0);
    }
  });

  test("factor exactly at threshold → moves to next band", () => {
    const inputs = makeInputs({
      qualityFactors: { client_retention_rate: 85 }, // exactly at threshold[1]
    });
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    const crr = adjustments.find((a) => a.factorId === "client_retention_rate");
    // 85 >= thresholds[0]=70 → bandIndex=1, 85 >= thresholds[1]=85 → bandIndex=2
    expect(crr!.adjustment).toBe(0.5); // third adjustment (index 2)
  });

  test("inverse factor: owner_hours_per_week — lower is better", () => {
    // thresholds [10, 25, 40], adjustments [1.0, 0.5, 0, -1.0]
    const inputs = makeInputs({
      qualityFactors: { owner_hours_per_week: 5 }, // below 10 → best band
    });
    const adjustments = calculateQualityAdjustments(inputs, usData.industries.professional_services);
    const ohpw = adjustments.find((a) => a.factorId === "owner_hours_per_week");
    expect(ohpw!.adjustment).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// 5. calculateValuation (integration tests with real industry data)
// ---------------------------------------------------------------------------
describe("calculateValuation", () => {
  test("Professional Services, US, $5M revenue, $1M EBITDA, good quality → reasonable range", () => {
    const inputs = makeInputs({
      industryId: "professional_services",
      revenueYear1: 5_000_000,
      revenueYear2: 4_500_000,
      revenueYear3: 4_000_000,
      ebitda: 1_000_000,
      qualityFactors: {
        client_retention_rate: 90,   // band 2 → +0.5
        owner_hours_per_week: 15,    // band 1 → +0.5
        contract_backlog_months: 8,  // band 2 → +0.5
        recurring_revenue_pct: 60,   // band 2 → +1.0
      },
    });

    const result = calculateValuation(inputs, usData);

    expect(result.multipleType).toBe("EV/EBITDA");
    expect(result.isRevenueBased).toBe(false);
    expect(result.sizeBand).toBe("$1-5M");
    expect(result.adjustedEbitda).toBe(1_000_000);
    expect(result.baseMultiple).toBe(4.5); // median for $1-5M prof services
    // totalAdjustment = 0.5 + 0.5 + 0.5 + 1.0 = 2.5
    expect(result.totalAdjustment).toBe(2.5);
    expect(result.adjustedMultiple).toBe(7.0); // 4.5 + 2.5
    expect(result.valuationMid).toBe(7_000_000);
    expect(result.warnings).toEqual([]);
  });

  test("SaaS, US, $3M ARR → uses EV/ARR multiple", () => {
    const inputs = makeInputs({
      industryId: "saas",
      revenueYear1: 3_000_000,
      revenueYear2: 2_500_000,
      revenueYear3: 2_000_000,
      ebitda: 500_000,
      qualityFactors: {
        net_revenue_retention: 110,
        gross_churn_rate: 5,
        cac_payback_months: 15,
        revenue_growth: 40,
        gross_margin: 75,
      },
    });

    const result = calculateValuation(inputs, usData);

    expect(result.multipleType).toBe("EV/ARR");
    expect(result.isRevenueBased).toBe(false);
    expect(result.sizeBand).toBe("$1-5M");
    // base = 5.5 (median for SaaS $1-5M)
    expect(result.baseMultiple).toBe(5.5);
    // NRR 110 >= 105 < 120 → +1.0
    // Churn 5 >= 3 < 7 → +0.5
    // CAC 15 >= 12 < 18 → +0.5
    // Growth 40 >= 30 < 60 → +1.0
    // Margin 75 >= 70 < 80 → +0.5
    // total adjustment = 3.5
    expect(result.totalAdjustment).toBe(3.5);
    // mid valuation = (5.5 + 3.5) * 500_000 = 4_500_000
    expect(result.valuationMid).toBe(4_500_000);
    expect(result.warnings).toEqual([]);
  });

  test("negative EBITDA → switches to EV/Revenue with warning", () => {
    const inputs = makeInputs({
      industryId: "professional_services",
      revenueYear1: 5_000_000,
      revenueYear2: 4_500_000,
      revenueYear3: 4_000_000,
      ebitda: -200_000,
      qualityFactors: {},
    });

    const result = calculateValuation(inputs, usData);

    expect(result.isRevenueBased).toBe(true);
    expect(result.multipleType).toBe("EV/Revenue");
    expect(result.warnings).toContain(
      "Negative adjusted EBITDA — valuation uses EV/Revenue multiples instead.",
    );
    // base = revenueYear1 = 5M, adjustedMultiple = median 4.5 (no quality adj)
    expect(result.valuationMid).toBe(4.5 * 5_000_000);
  });

  test("revenue below $1M → includes 'Below minimum threshold' warning", () => {
    const inputs = makeInputs({
      revenueYear1: 800_000,
      revenueYear2: 700_000,
      revenueYear3: 600_000,
      ebitda: 200_000,
    });

    const result = calculateValuation(inputs, usData);

    expect(result.warnings).toContain("Below minimum threshold");
    // Falls back to first size band
    expect(result.sizeBand).toBe("$1-5M");
  });

  test("revenue declining >10% YoY → includes decline warning and -1.0x discount", () => {
    const inputs = makeInputs({
      industryId: "professional_services",
      revenueYear1: 4_000_000,
      revenueYear2: 5_000_000, // -20% decline Y1 vs Y2
      revenueYear3: 5_500_000,
      ebitda: 800_000,
      qualityFactors: {},
    });

    const result = calculateValuation(inputs, usData);

    expect(result.warnings).toContain(
      "Revenue declined >10% year-over-year — applied -1.0x discount.",
    );
    // base multiple 4.5, quality adj 0, decline -1.0 → total adj = -1.0
    expect(result.totalAdjustment).toBe(-1.0);
    expect(result.adjustedMultiple).toBe(3.5); // 4.5 - 1.0
  });

  test("multiple is clamped to floor of 1.0x", () => {
    // Use SaaS with terrible quality factors to drive multiple very low
    const inputs = makeInputs({
      industryId: "saas",
      revenueYear1: 3_000_000,
      revenueYear2: 5_000_000, // big decline
      revenueYear3: 6_000_000,
      ebitda: 100_000,
      qualityFactors: {
        net_revenue_retention: 60,  // below 90 → -1.0
        gross_churn_rate: 20,       // above 15 → -1.0
        cac_payback_months: 30,     // above 24 → -0.5
        revenue_growth: 5,          // below 15 → -0.5
        gross_margin: 40,           // below 60 → -1.0
      },
    });

    const result = calculateValuation(inputs, usData);

    // 5.5 base - 4.0 quality - 1.0 decline = 0.5, clamped to 1.0
    expect(result.adjustedMultiple).toBe(1.0);
  });

  test("throws for unknown industry", () => {
    const inputs = makeInputs({ industryId: "underwater_basket_weaving" });
    expect(() => calculateValuation(inputs, usData)).toThrow(
      /not found in geography data/,
    );
  });
});

// ---------------------------------------------------------------------------
// 6. calculateScenarioComparison
// ---------------------------------------------------------------------------
describe("calculateScenarioComparison", () => {
  test("change one quality factor → delta is non-zero with changed factor tracked", () => {
    const original = makeInputs({
      qualityFactors: {
        client_retention_rate: 50, // → -0.5
        owner_hours_per_week: 20,
        contract_backlog_months: 5,
        recurring_revenue_pct: 30,
      },
    });

    const modified = makeInputs({
      qualityFactors: {
        client_retention_rate: 98, // → +1.0 (was -0.5, so +1.5x swing)
        owner_hours_per_week: 20,
        contract_backlog_months: 5,
        recurring_revenue_pct: 30,
      },
    });

    const comparison = calculateScenarioComparison(original, modified, usData);

    expect(comparison.delta).not.toBe(0);
    expect(comparison.delta).toBeGreaterThan(0);
    expect(comparison.deltaPercent).toBeGreaterThan(0);
    expect(comparison.changedFactors).toHaveLength(1);
    expect(comparison.changedFactors[0].factorId).toBe("client_retention_rate");
    expect(comparison.changedFactors[0].from).toBe(50);
    expect(comparison.changedFactors[0].to).toBe(98);
    expect(comparison.changedFactors[0].valuationImpact).toBeGreaterThan(0);
  });

  test("same inputs → delta is 0, no changed factors", () => {
    const inputs = makeInputs({
      qualityFactors: {
        client_retention_rate: 80,
        owner_hours_per_week: 20,
        contract_backlog_months: 5,
        recurring_revenue_pct: 30,
      },
    });

    const comparison = calculateScenarioComparison(inputs, inputs, usData);

    expect(comparison.delta).toBe(0);
    expect(comparison.deltaPercent).toBe(0);
    expect(comparison.changedFactors).toHaveLength(0);
  });

  test("multiple changed factors → each tracked independently", () => {
    const original = makeInputs({
      qualityFactors: {
        client_retention_rate: 50,
        recurring_revenue_pct: 10,
      },
    });

    const modified = makeInputs({
      qualityFactors: {
        client_retention_rate: 98,
        recurring_revenue_pct: 90,
      },
    });

    const comparison = calculateScenarioComparison(original, modified, usData);

    expect(comparison.changedFactors).toHaveLength(2);
    const factorIds = comparison.changedFactors.map((f) => f.factorId);
    expect(factorIds).toContain("client_retention_rate");
    expect(factorIds).toContain("recurring_revenue_pct");
    // Each factor's isolated impact should be positive
    for (const cf of comparison.changedFactors) {
      expect(cf.valuationImpact).toBeGreaterThan(0);
    }
  });
});
