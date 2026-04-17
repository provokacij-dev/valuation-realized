import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ValuationResult, ValuationInputs, NarrativeResponse } from "../../../lib/types";

const TIMEOUT_MS = 10_000;

function staticFallback(result: ValuationResult): NarrativeResponse {
  const direction =
    result.adjustedMultiple > result.baseMultiple
      ? "above"
      : result.adjustedMultiple < result.baseMultiple
      ? "below"
      : "at";

  return {
    summary: `Based on comparable transactions, this ${result.industryLabel} business with ${result.sizeBand} revenue is estimated at ${fmt(result.valuationLow)} to ${fmt(result.valuationHigh)}, with a midpoint of ${fmt(result.valuationMid)}.`,
    peerContext: `Companies in this industry and size range typically trade at ${result.baseMultiple.toFixed(1)}x ${result.multipleType}. The quality factor profile places this company ${direction} the industry median at ${result.adjustedMultiple.toFixed(1)}x.`,
    improvementSuggestions: result.qualityAdjustments
      .filter((qa) => qa.adjustment < 0)
      .map((qa) => `Improve ${qa.factorName} to remove the ${Math.abs(qa.adjustment).toFixed(1)}x discount`),
    riskFlags: result.warnings,
  };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No API key — return static fallback
    const { result } = (await req.json()) as { inputs: ValuationInputs; result: ValuationResult };
    return NextResponse.json(staticFallback(result));
  }

  try {
    const { inputs, result } = (await req.json()) as { inputs: ValuationInputs; result: ValuationResult };

    const client = new Anthropic({ apiKey });

    const prompt = `You are a senior M&A advisor writing a brief valuation summary for an SME owner. Be professional, specific, and credible.

Company profile:
- Industry: ${result.industryLabel}
- Geography: ${result.geographyLabel}
- Revenue: ${fmt(inputs.revenueYear1)} (most recent), 3yr CAGR: ${(result.revenueCAGR * 100).toFixed(1)}%
- Adjusted EBITDA: ${fmt(result.adjustedEbitda)}
- Valuation range: ${fmt(result.valuationLow)} - ${fmt(result.valuationHigh)} (mid: ${fmt(result.valuationMid)})
- Multiple applied: ${result.adjustedMultiple.toFixed(1)}x ${result.multipleType} (industry median: ${result.baseMultiple.toFixed(1)}x)

Quality factor adjustments:
${result.qualityAdjustments.map((qa) => `- ${qa.factorName}: value ${qa.value}, adjustment ${qa.adjustment >= 0 ? "+" : ""}${qa.adjustment.toFixed(1)}x`).join("\n")}

${result.warnings.length > 0 ? `Warnings: ${result.warnings.join("; ")}` : ""}

Respond in JSON format with these exact fields:
{
  "summary": "2-3 sentence executive summary of the valuation range and key drivers",
  "peerContext": "1-2 sentences comparing to industry peers and explaining where this company falls",
  "improvementSuggestions": ["3 specific, actionable suggestions to increase the company's valuation"],
  "riskFlags": ["1-2 risk factors that could discount the valuation in a buyer's eyes"]
}

IMPORTANT: Do NOT invent any numbers. Only reference the numbers provided above. Be specific to this industry and company profile.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await client.messages.create(
        {
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        },
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(staticFallback(result));
      }

      const parsed = JSON.parse(jsonMatch[0]) as NarrativeResponse;

      // Validate required fields
      if (!parsed.summary || !parsed.peerContext) {
        return NextResponse.json(staticFallback(result));
      }

      return NextResponse.json(parsed);
    } catch {
      clearTimeout(timeout);
      // Timeout or API error — return static fallback
      return NextResponse.json(staticFallback(result));
    }
  } catch {
    // Parsing error — return 400
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
