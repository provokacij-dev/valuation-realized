const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak,
  LevelFormat
} = require("docx");

// Colors
const GOLD = "BC8F4D";
const DARK_OLIVE = "3D3520";
const DARK_TEXT = "333333";
const MUTED = "666666";
const LIGHT_MUTED = "999999";
const ALT_ROW = "F5F2ED";
const TABLE_BORDER = "D8D2C8";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const innerBorder = { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER };
const innerBorders = { top: innerBorder, bottom: innerBorder, left: noBorder, right: noBorder };

// Page dimensions: A4
const PAGE_WIDTH = 11906; // A4 width in DXA
const MARGIN_LEFT = 1440;
const MARGIN_RIGHT = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 9026

function makeTableRow(label, value, isEven) {
  const colW1 = Math.floor(CONTENT_WIDTH * 0.45);
  const colW2 = CONTENT_WIDTH - colW1;
  const shading = isEven
    ? { fill: ALT_ROW, type: ShadingType.CLEAR, color: "auto" }
    : { fill: "FFFFFF", type: ShadingType.CLEAR, color: "auto" };
  return new TableRow({
    children: [
      new TableCell({
        borders: innerBorders,
        width: { size: colW1, type: WidthType.DXA },
        shading,
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: label, font: "Arial", size: 20, color: DARK_TEXT })]
        })]
      }),
      new TableCell({
        borders: innerBorders,
        width: { size: colW2, type: WidthType.DXA },
        shading,
        margins: { top: 60, bottom: 60, left: 80, right: 120 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [new TextRun({ text: value, font: "Arial", size: 20, bold: true, color: DARK_TEXT })]
        })]
      })
    ]
  });
}

function makeCredentialRow(item1, item2) {
  const colW = Math.floor(CONTENT_WIDTH / 2);
  const cell = (text) => new TableCell({
    borders: innerBorders,
    width: { size: colW, type: WidthType.DXA },
    margins: { top: 50, bottom: 50, left: 120, right: 80 },
    children: [new Paragraph({
      spacing: { after: 0 },
      children: [
        new TextRun({ text: "\u2714 ", font: "Arial", size: 20, color: GOLD, bold: true }),
        new TextRun({ text, font: "Arial", size: 20, color: DARK_TEXT })
      ]
    })]
  });
  return new TableRow({ children: [cell(item1), cell(item2)] });
}

// Data
const financialRows = [
  ["Year Established", "~2004, Dubai, UAE"],
  ["Historical Revenue (avg.)", "AED 18-20M annually"],
  ["FY2025 Revenue", "AED 12,000,000"],
  ["FY2025 Net Profit", "[TO BE CONFIRMED]"],
  ["Cash Position", "~AED 1,000,000"],
  ["Employees", "17"],
  ["Audited Financials", "Since 2004"],
  ["Audited By", "[AUDITOR NAME]"]
];

const transactionRows = [
  ["Transaction Type", "100% business acquisition"],
  ["Asking Price", "[TO BE CONFIRMED]"],
  ["Deal Structure", "[TO BE CONFIRMED]"],
  ["Reason for Sale", "Founder retirement"],
  ["Transition Support", "Seller available for structured handover period"],
  ["Financials Available", "Audited since 2004; disclosed post-NDA"]
];

const credentials = [
  ["Exclusive freight network membership (country-limited)", "Open freight network membership"],
  ["21 years continuous operations", "Audited financials since 2004 (IFRS)"],
  ["Dubai SME 100 ranked (2011)", "Top-5 global freight forwarder as client"],
  ["[TRADE LICENSE / IATA]", "[ISO / FIATA CERTIFICATION]"]
];

const bullets = [
  "Dubai-registered freight forwarding company with 21 years of continuous operations",
  "Services: air and sea freight brokerage, facilitating international shipments through global network partnerships",
  "Primary client base: recurring commercial accounts including a top-5 global freight forwarder (Dubai operations)",
  "Historical annual revenue of AED 18-20M across 18+ profitable years; FY2025 impacted by geopolitical disruption and key personnel transition",
  "Member of two international freight forwarding networks, including one exclusive network (limited members per country) held since inception",
  "Ranked in Dubai SME 100 (2011), with audited financials maintained since 2004",
  "Sale driven by founder\u2019s planned retirement after two decades of ownership"
];

const sellingPoints = [
  {
    lead: "Two decades of operational track record. ",
    body: "21 years of continuous freight forwarding operations in Dubai, with ",
    boldIn: "audited financials since 2004",
    after: " and historical revenues of AED 18-20M annually. This is not a startup; it is a proven platform."
  },
  {
    lead: "Exclusive network membership, immediately transferable. ",
    body: "The company holds membership in an exclusive, country-limited freight forwarding network since inception. These memberships ",
    boldIn: "take years to earn",
    after: " and are not available on the open market. A buyer inherits this access on day one."
  },
  {
    lead: "Tier-1 client relationship. ",
    body: "A ",
    boldIn: "top-5 global freight forwarder",
    after: " outsources its Dubai operations to this business, providing a stable, recurring revenue base and institutional credibility."
  },
  {
    lead: "UAE freight market growing at 7.2% CAGR. ",
    body: "The UAE freight forwarding market is projected to reach ",
    boldIn: "USD 35 billion by 2032",
    after: ", driven by e-commerce growth, free trade zone expansion, and Dubai\u2019s position as a regional logistics hub."
  },
  {
    lead: "Asset-light, scalable model. ",
    body: "The business operates as a freight broker, not an asset-heavy carrier. ",
    boldIn: "Low fixed costs",
    after: ", subcontractor-led delivery, and recurring client contracts keep the model lean and margins healthy in normal operating conditions."
  },
  {
    lead: "Plug-and-play for a strategic acquirer. ",
    body: "A logistics buyer gains immediate access to Dubai market infrastructure, network memberships, client contracts, and a trained ",
    boldIn: "17-person team",
    after: " without the 2+ year setup period and relationship-building required to enter this market independently."
  },
  {
    lead: "Clean founder exit with transition support. ",
    body: "No litigation, disputes, or contingent liabilities disclosed. The founder is willing to support a ",
    boldIn: "structured handover period",
    after: " to ensure operational continuity and client retention."
  }
];

// Build document
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 360, hanging: 360 } } }
      }]
    }]
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 860, right: MARGIN_RIGHT, bottom: 860, left: MARGIN_LEFT }
        }
      },
      children: [
        // 1. Confidentiality banner
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: DARK_OLIVE, type: ShadingType.CLEAR, color: "auto" },
          spacing: { after: 340 },
          children: [new TextRun({
            text: "  STRICTLY CONFIDENTIAL  \u00B7  FOR DISCUSSION PURPOSES ONLY  \u00B7  COMPANY NAME DISCLOSED POST-NDA  ",
            font: "Arial", size: 15, color: GOLD, allCaps: true
          })]
        }),

        // 2. INVESTMENT OPPORTUNITY
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [new TextRun({
            text: "INVESTMENT OPPORTUNITY",
            font: "Georgia", size: 24, color: GOLD, allCaps: true,
            characterSpacing: 120
          })]
        }),

        // 3. Business descriptor title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({
            text: "Air & Sea Freight Forwarding Business",
            font: "Georgia", size: 52, bold: true, color: DARK_TEXT
          })]
        }),

        // 4. Location
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({
            text: "Dubai, United Arab Emirates",
            font: "Arial", size: 24, color: MUTED
          })]
        }),

        // 5. Asking price
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({
            text: "Asking Price: [TO BE CONFIRMED]",
            font: "Georgia", size: 24, bold: true, italics: true, color: GOLD
          })]
        }),

        // 6. Gold horizontal rule
        new Paragraph({
          spacing: { after: 240 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD, space: 1 } },
          children: []
        }),

        // 7. Business Overview header
        new Paragraph({
          spacing: { before: 160, after: 120 },
          children: [new TextRun({
            text: "Business Overview",
            font: "Georgia", size: 26, bold: true, color: DARK_TEXT
          })]
        }),

        // 8. Bullet points
        ...bullets.map(b => new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ text: b, font: "Arial", size: 21, color: DARK_TEXT })]
        })),

        // 9. Financial Snapshot header
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [new TextRun({
            text: "Financial Snapshot",
            font: "Georgia", size: 26, bold: true, color: DARK_TEXT
          })]
        }),

        // 10. Financial table
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [Math.floor(CONTENT_WIDTH * 0.45), CONTENT_WIDTH - Math.floor(CONTENT_WIDTH * 0.45)],
          rows: financialRows.map((r, i) => makeTableRow(r[0], r[1], i % 2 === 1))
        }),

        // 11. Strategic Credentials header
        new Paragraph({
          spacing: { before: 240, after: 60 },
          children: [new TextRun({
            text: "Strategic Credentials & Registrations",
            font: "Georgia", size: 26, bold: true, color: DARK_TEXT
          })]
        }),

        // 12. Intro paragraph
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({
            text: "The company holds established network memberships, trade relationships, and operational credentials that represent years of industry presence and significant cost to replicate independently, and are immediately transferable to a new owner.",
            font: "Arial", size: 20, italics: true, color: MUTED
          })]
        }),

        // 13. Credentials grid
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [Math.floor(CONTENT_WIDTH / 2), CONTENT_WIDTH - Math.floor(CONTENT_WIDTH / 2)],
          rows: credentials.map(r => makeCredentialRow(r[0], r[1]))
        }),

        // Page break
        new Paragraph({ children: [new PageBreak()] }),

        // PAGE 2

        // 14. Why This Business header
        new Paragraph({
          spacing: { before: 0, after: 160 },
          children: [new TextRun({
            text: "Why This Business",
            font: "Georgia", size: 26, bold: true, color: DARK_TEXT
          })]
        }),

        // 15. Selling points
        ...sellingPoints.map(sp => new Paragraph({
          spacing: { after: 100 },
          indent: { left: 280 },
          children: [
            new TextRun({ text: "\u2014 ", font: "Arial", size: 21, color: DARK_TEXT }),
            new TextRun({ text: sp.lead, font: "Arial", size: 21, bold: true, color: DARK_TEXT }),
            new TextRun({ text: sp.body, font: "Arial", size: 21, color: DARK_TEXT }),
            new TextRun({ text: sp.boldIn, font: "Arial", size: 21, bold: true, color: DARK_TEXT }),
            new TextRun({ text: sp.after, font: "Arial", size: 21, color: DARK_TEXT })
          ]
        })),

        // 16. Transaction Overview header
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [new TextRun({
            text: "Transaction Overview",
            font: "Georgia", size: 26, bold: true, color: DARK_TEXT
          })]
        }),

        // 17. Transaction table
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [Math.floor(CONTENT_WIDTH * 0.45), CONTENT_WIDTH - Math.floor(CONTENT_WIDTH * 0.45)],
          rows: transactionRows.map((r, i) => makeTableRow(r[0], r[1], i % 2 === 1))
        }),

        // 18. Gold horizontal rule
        new Paragraph({
          spacing: { before: 200, after: 180 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: GOLD, space: 1 } },
          children: []
        }),

        // 19. CTA
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({
            text: "Qualified buyers only. Execute the attached NDA to receive the full Information Memorandum.",
            font: "Arial", size: 21, italics: true, color: DARK_TEXT
          })]
        }),

        // 20. Contact name
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 30 },
          children: [new TextRun({
            text: "Vaiga Rimsaite, CFA \u00B7 Valuation Realized",
            font: "Georgia", size: 24, bold: true, color: DARK_TEXT
          })]
        }),

        // 21. Contact details
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({
            text: "vr@valuationrealized.com \u00B7 +971 505832701",
            font: "Arial", size: 20, color: MUTED
          })]
        }),

        // 22. Thin rule
        new Paragraph({
          spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: TABLE_BORDER, space: 1 } },
          children: []
        }),

        // 23. Disclaimer
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({
            text: "This document is confidential and intended solely for the named recipient. It does not constitute an offer to sell or solicitation. All financial data is based on audited accounts and management representations. Recipients should conduct independent due diligence. Company identity disclosed post-NDA only.",
            font: "Arial", size: 16, italics: true, color: LIGHT_MUTED
          })]
        }),

        // 24. Footer banner
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: { fill: DARK_OLIVE, type: ShadingType.CLEAR, color: "auto" },
          spacing: { after: 0 },
          children: [new TextRun({
            text: "  Confidential investment opportunity  ",
            font: "Arial", size: 16, color: GOLD
          })]
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "Freight-Forwarding-Investment-Teaser.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Generated: " + outPath);
});
