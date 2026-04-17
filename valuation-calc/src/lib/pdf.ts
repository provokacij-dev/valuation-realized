import type { ValuationResult, NarrativeResponse } from "./types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export async function generatePDF(
  result: ValuationResult,
  narrative: NarrativeResponse | null
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf: any = (await import("html2pdf.js")).default;

  const brandColor = "#1e40af";
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build quality adjustments rows
  const qualityRows = result.qualityAdjustments
    .map(
      (qa) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#374151;">${qa.factorName}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;color:${qa.adjustment >= 0 ? "#16a34a" : "#dc2626"};font-weight:600;">
          ${qa.adjustment >= 0 ? "+" : ""}${qa.adjustment.toFixed(1)}x
        </td>
      </tr>`
    )
    .join("");

  // Build comparable transactions rows
  const compRows =
    result.comparableTransactions.length > 0
      ? result.comparableTransactions
          .map(
            (tx) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:12px;">${tx.description}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${tx.multiple.toFixed(1)}x</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;font-size:12px;">${tx.date}</td>
      </tr>`
          )
          .join("")
      : `<tr><td colspan="3" style="padding:8px 10px;color:#9ca3af;font-style:italic;">No comparable transactions available for this segment.</td></tr>`;

  // Narrative section
  let narrativeHTML: string;
  if (narrative) {
    const suggestions =
      narrative.improvementSuggestions.length > 0
        ? `<p style="font-weight:600;color:#1f2937;margin:8px 0 4px;">Opportunities to increase valuation:</p>
           <ul style="margin:0 0 8px 18px;color:#4b5563;">${narrative.improvementSuggestions.map((s) => `<li style="margin-bottom:3px;">${s}</li>`).join("")}</ul>`
        : "";
    const risks =
      narrative.riskFlags.length > 0
        ? `<p style="font-weight:600;color:#1f2937;margin:8px 0 4px;">Risk factors:</p>
           <ul style="margin:0 0 8px 18px;color:#92400e;">${narrative.riskFlags.map((r) => `<li style="margin-bottom:3px;">${r}</li>`).join("")}</ul>`
        : "";
    narrativeHTML = `
      <p style="color:#374151;margin-bottom:6px;">${narrative.summary}</p>
      <p style="color:#374151;margin-bottom:6px;">${narrative.peerContext}</p>
      ${suggestions}${risks}`;
  } else {
    narrativeHTML = `
      <p style="color:#6b7280;">
        Companies in the ${result.industryLabel} sector with ${result.sizeBand} revenue typically trade at
        ${result.baseMultiple.toFixed(1)}x ${result.multipleType}. Your quality factor profile places you at
        ${result.adjustedMultiple.toFixed(1)}x, which is
        ${result.adjustedMultiple > result.baseMultiple ? "above" : result.adjustedMultiple < result.baseMultiple ? "below" : "at"}
        the industry median.
      </p>`;
  }

  const html = `
<div style="font-family:system-ui,-apple-system,sans-serif;color:#111827;padding:32px;max-width:760px;margin:0 auto;">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;border-bottom:3px solid ${brandColor};padding-bottom:16px;">
    <div>
      <h1 style="margin:0;font-size:22px;color:${brandColor};font-weight:700;letter-spacing:-0.5px;">Valuation Realized</h1>
      <h2 style="margin:4px 0 0;font-size:15px;color:#6b7280;font-weight:400;">Valuation Summary</h2>
    </div>
    <div style="text-align:right;font-size:12px;color:#9ca3af;">
      ${now}
    </div>
  </div>

  <!-- Company Info -->
  <div style="display:flex;gap:24px;margin-bottom:20px;font-size:13px;color:#4b5563;">
    <div><span style="font-weight:600;">Industry:</span> ${result.industryLabel}</div>
    <div><span style="font-weight:600;">Geography:</span> ${result.geographyLabel}</div>
    <div><span style="font-weight:600;">Size Band:</span> ${result.sizeBand}</div>
  </div>

  <!-- The Number -->
  <div style="background:#f0f5ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
    <p style="margin:0 0 4px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Estimated Enterprise Value</p>
    <p style="margin:0;font-size:28px;font-weight:700;color:${brandColor};">
      ${formatCurrency(result.valuationLow)} &mdash; ${formatCurrency(result.valuationHigh)}
    </p>
    <p style="margin:4px 0 0;font-size:15px;color:#374151;">
      Midpoint: <strong>${formatCurrency(result.valuationMid)}</strong>
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#9ca3af;">
      Based on ${result.adjustedMultiple.toFixed(1)}x ${result.multipleType}
      ${result.isRevenueBased ? " (Revenue-based — negative EBITDA)" : ` · Adjusted EBITDA: ${formatCurrency(result.adjustedEbitda)}`}
    </p>
  </div>

  <!-- Two-column: Quality Factors + Comparables -->
  <div style="display:flex;gap:16px;margin-bottom:20px;">
    <!-- Quality Factor Adjustments -->
    <div style="flex:1;">
      <h3 style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px;">Quality Factor Adjustments</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;">
            <th style="padding:6px 10px;text-align:left;color:#6b7280;font-weight:500;">Factor</th>
            <th style="padding:6px 10px;text-align:right;color:#6b7280;font-weight:500;">Adj.</th>
          </tr>
        </thead>
        <tbody>
          ${qualityRows}
          <tr style="border-top:2px solid #d1d5db;">
            <td style="padding:6px 10px;font-weight:600;color:#374151;">Base Multiple</td>
            <td style="padding:6px 10px;text-align:right;font-weight:600;color:#374151;">${result.baseMultiple.toFixed(1)}x</td>
          </tr>
          <tr>
            <td style="padding:6px 10px;font-weight:600;color:#374151;">Total Adjustment</td>
            <td style="padding:6px 10px;text-align:right;font-weight:600;color:${result.totalAdjustment >= 0 ? "#16a34a" : "#dc2626"};">
              ${result.totalAdjustment >= 0 ? "+" : ""}${result.totalAdjustment.toFixed(1)}x
            </td>
          </tr>
          <tr style="border-top:2px solid ${brandColor};">
            <td style="padding:6px 10px;font-weight:700;color:${brandColor};">Adjusted Multiple</td>
            <td style="padding:6px 10px;text-align:right;font-weight:700;color:${brandColor};">${result.adjustedMultiple.toFixed(1)}x</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Comparable Transactions -->
    <div style="flex:1;">
      <h3 style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px;">Comparable Transactions</h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb;">
            <th style="padding:6px 10px;text-align:left;color:#6b7280;font-weight:500;">Description</th>
            <th style="padding:6px 10px;text-align:center;color:#6b7280;font-weight:500;">Multiple</th>
            <th style="padding:6px 10px;text-align:center;color:#6b7280;font-weight:500;">Date</th>
          </tr>
        </thead>
        <tbody>
          ${compRows}
        </tbody>
      </table>
      <p style="font-size:11px;color:#9ca3af;margin-top:8px;">
        Your adjusted multiple: ${result.adjustedMultiple.toFixed(1)}x
      </p>
    </div>
  </div>

  <!-- Narrative / Analysis -->
  <div style="margin-bottom:20px;">
    <h3 style="font-size:13px;font-weight:600;color:#374151;margin:0 0 8px;">Analysis</h3>
    <div style="font-size:13px;line-height:1.6;">
      ${narrativeHTML}
    </div>
  </div>

  <!-- Disclaimer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:12px;font-size:10px;color:#9ca3af;line-height:1.5;">
    <strong>Disclaimer:</strong> This is an approximation for planning purposes only. It is not a formal valuation
    and should not be relied upon for transaction decisions without professional advice. The multiples and adjustments
    used are based on publicly available market data and proprietary models, which may not reflect the specific
    circumstances of any individual business. Valuation Realized and its affiliates accept no liability for
    decisions made based on this report.
  </div>
</div>`;

  // Create temporary container
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `valuation-summary-${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(container.firstElementChild)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}
