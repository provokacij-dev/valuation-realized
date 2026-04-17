const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, PageNumber, VerticalAlign
} = require('docx');
const fs = require('fs');

// Colors matching Lisbon teaser
const DARK_BLUE = "1B2A4A";
const ACCENT_BLUE = "2E75B6";
const LIGHT_BLUE_BG = "D5E8F0";
const LIGHT_GRAY_BG = "F2F2F2";
const WHITE = "FFFFFF";
const BLACK = "000000";
const CHECK_GREEN = "2E7D32";

// Page dimensions (A4)
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_LEFT = 1134; // ~0.79 inch
const MARGIN_RIGHT = 1134;
const MARGIN_TOP = 850;
const MARGIN_BOTTOM = 850;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 9638

// Table helpers
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const thinBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };

function makeCell(text, width, options = {}) {
  const {
    bold = false, fontSize = 18, color = BLACK, shading = undefined,
    borders = thinBorders, alignment = AlignmentType.LEFT, font = "Arial",
    columnSpan = undefined
  } = options;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders,
    shading: shading ? { fill: shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text, bold, size: fontSize, color, font })]
      })
    ]
  });
}

// Build credential pairs for the 2-column grid
function credentialRow(left, right) {
  const cellWidth = Math.floor(CONTENT_WIDTH / 2);
  return new TableRow({
    children: [
      new TableCell({
        width: { size: cellWidth, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: "\u2714 ", bold: true, size: 18, color: CHECK_GREEN, font: "Arial" }),
            new TextRun({ text: left, size: 18, color: BLACK, font: "Arial" })
          ]
        })]
      }),
      new TableCell({
        width: { size: cellWidth, type: WidthType.DXA },
        borders: noBorders,
        margins: { top: 40, bottom: 40, left: 80, right: 80 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: "\u2714 ", bold: true, size: 18, color: CHECK_GREEN, font: "Arial" }),
            new TextRun({ text: right, size: 18, color: BLACK, font: "Arial" })
          ]
        })]
      })
    ]
  });
}

// Financial snapshot rows
const financialData = [
  ["Year Established", "2004, Dubai, UAE"],
  ["Historical Annual Revenue", "AED 18,000,000 \u2013 20,000,000"],
  ["FY2024/25 Revenue", "~AED 12,000,000"],
  ["FY2024/25 Net Result", "(AED 890,000)"],
  ["Employees", "17"],
  ["Cash Position", "~AED 3,700,000"],
  ["Previous NAV Valuation", "AED 1,670,000"],
  ["Audited Since", "2004 (IFRS-compliant)"]
];

const transactionData = [
  ["Transaction Type", "100% business acquisition"],
  ["Asking Price", "AED 2,800,000 \u2013 AED 3,200,000"],
  ["Deal Structure", "Flexible; seller open to discussion"],
  ["Reason for Sale", "Owner\u2019s planned retirement"],
  ["Transition Support", "Seller available for multi-year handover"],
  ["Financials Available", "Audited FY2004\u20132025 \u2014 disclosed post-NDA"]
];

function dataTable(data, colWidths) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: data.map((row, i) => {
      const bg = i % 2 === 0 ? LIGHT_GRAY_BG : WHITE;
      return new TableRow({
        children: [
          makeCell(row[0], colWidths[0], { bold: true, fontSize: 18, shading: bg }),
          makeCell(row[1], colWidths[1], { fontSize: 18, shading: bg })
        ]
      });
    })
  });
}

// Business overview bullets
const overviewBullets = [
  "Dubai-registered freight forwarding company specializing in air and sea freight brokerage",
  "21 years of continuous operations with audited financials since 2004",
  "17 employees serving 10\u201315 recurring customers across multiple sectors",
  "Major anchor client: a top 5 global freight forwarder, contributing approximately 30% of revenue",
  "Member of two international freight forwarding networks, including one exclusive network with limited membership per country",
  "Historical revenue of AED 18\u201320M per annum; recent cyclical downturn reduced revenue to ~AED 12M, reflecting broader market conditions rather than structural decline",
  "Established platform with network memberships, client relationships, and operational infrastructure that would take years and significant capital to replicate independently",
  "Sale due to owner\u2019s planned retirement after two decades of successful ownership"
];

// Why this business bullets
const whyBullets = [
  {
    lead: "Platform acquisition",
    text: " \u2014 a 21-year freight forwarder with two international network memberships, 10\u201315 recurring clients, 17 staff, and audited books going back to 2004. You are not building from zero; you are acquiring a fully operational platform."
  },
  {
    lead: "Turnaround opportunity at a discount",
    text: " \u2014 the business historically generated AED 18\u201320M in annual revenue. The current downturn is cyclical (post-COVID normalization, geopolitical disruption), not structural. A buyer with operational focus can restore margins as volumes recover."
  },
  {
    lead: "Exclusive network memberships",
    text: " \u2014 membership in the exclusive network is limited per country, requires audited financials, and represents significant cost and time to obtain. This credential transfers with the business."
  },
  {
    lead: "Recurring revenue base",
    text: " \u2014 10\u201315 regular customers on established contracts. Revenue is relationship-driven but not owner-dependent; contracts were won through competitive processes and network referrals."
  },
  {
    lead: "Major anchor client",
    text: " \u2014 a top 5 global freight forwarder uses this company for its Dubai operations, contributing ~30% of revenue. This relationship provides a stable revenue floor."
  },
  {
    lead: "Asset-light broker model",
    text: " \u2014 the company operates as a freight broker, not an asset-heavy carrier. Lean overhead structure keeps breakeven low and margins healthy in normal market conditions."
  },
  {
    lead: "Clean books and track record",
    text: " \u2014 audited financials since 2004. No litigation, no defaults. Ranked in the Dubai SME 100 in 2011. Two decades of transparent operations."
  },
  {
    lead: "Structured owner transition",
    text: " \u2014 the seller is open to remaining involved for 2\u20133 years post-acquisition to ensure a smooth handover of client relationships, network memberships, and operational knowledge."
  }
];

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 20, color: BLACK } }
    }
  },
  numbering: {
    config: [
      {
        reference: "overview-bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u25CF",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 260 } } }
        }]
      },
      {
        reference: "why-bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "\u2014",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 340 } } }
        }]
      }
    ]
  },
  sections: [
    // ===== PAGE 1 =====
    {
      properties: {
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT, right: MARGIN_RIGHT }
        }
      },
      children: [
        // Confidentiality header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [new TextRun({
            text: "STRICTLY CONFIDENTIAL  \u00B7  FOR DISCUSSION PURPOSES ONLY  \u00B7  COMPANY NAME DISCLOSED POST-NDA",
            size: 14, color: "888888", font: "Arial", italics: true
          })]
        }),

        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 60 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT_BLUE, space: 8 } },
          children: [new TextRun({
            text: "INVESTMENT OPPORTUNITY",
            bold: true, size: 36, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Subtitle
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 160, after: 40 },
          children: [new TextRun({
            text: "Freight Forwarding Business",
            bold: true, size: 26, color: DARK_BLUE, font: "Arial"
          })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 40 },
          children: [new TextRun({
            text: "Dubai, United Arab Emirates",
            size: 22, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Asking price
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 260 },
          children: [
            new TextRun({ text: "Asking Price: ", size: 20, color: BLACK, font: "Arial" }),
            new TextRun({ text: "AED 2,800,000 \u2013 3,200,000", bold: true, size: 20, color: BLACK, font: "Arial" })
          ]
        }),

        // Business overview heading
        new Paragraph({
          spacing: { before: 60, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 4 } },
          children: [new TextRun({
            text: "Business overview",
            bold: true, size: 24, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Bullets
        ...overviewBullets.map(text => new Paragraph({
          numbering: { reference: "overview-bullets", level: 0 },
          spacing: { before: 40, after: 40 },
          children: [new TextRun({ text, size: 17, color: BLACK, font: "Arial" })]
        })),

        // Financial snapshot heading
        new Paragraph({
          spacing: { before: 200, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 4 } },
          children: [new TextRun({
            text: "Financial snapshot",
            bold: true, size: 24, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Financial table
        dataTable(financialData, [3800, CONTENT_WIDTH - 3800]),

        // Credentials heading
        new Paragraph({
          spacing: { before: 200, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 4 } },
          children: [new TextRun({
            text: "Strategic credentials & registrations",
            bold: true, size: 24, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Credentials grid
        new Table({
          width: { size: CONTENT_WIDTH, type: WidthType.DXA },
          columnWidths: [Math.floor(CONTENT_WIDTH / 2), Math.floor(CONTENT_WIDTH / 2)],
          rows: [
            credentialRow("Exclusive Freight Network Member", "21 Years of Continuous Operations"),
            credentialRow("Open Freight Network Member", "Dubai SME 100 (2011)"),
            credentialRow("Top 5 Global Forwarder as Client", "Audited Financials Since 2004"),
            credentialRow("10\u201315 Recurring Clients", "Zero Litigation / Clean Record"),
          ]
        }),

        // Page break
        new Paragraph({ children: [new PageBreak()] }),

        // ===== PAGE 2 =====

        // Why this business heading
        new Paragraph({
          spacing: { before: 60, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 4 } },
          children: [new TextRun({
            text: "Why this business",
            bold: true, size: 24, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Why bullets with bold leads
        ...whyBullets.map(({ lead, text }) => new Paragraph({
          numbering: { reference: "why-bullets", level: 0 },
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({ text: lead, bold: true, size: 17, color: BLACK, font: "Arial" }),
            new TextRun({ text, size: 17, color: BLACK, font: "Arial" })
          ]
        })),

        // Transaction overview heading
        new Paragraph({
          spacing: { before: 240, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 4 } },
          children: [new TextRun({
            text: "Transaction overview",
            bold: true, size: 24, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Transaction table
        dataTable(transactionData, [3800, CONTENT_WIDTH - 3800]),

        // CTA
        new Paragraph({
          spacing: { before: 200, after: 140 },
          alignment: AlignmentType.LEFT,
          children: [new TextRun({
            text: "Qualified buyers only. Execute the attached NDA to receive the full Information Memorandum.",
            bold: true, italics: true, size: 18, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Contact
        new Paragraph({
          spacing: { before: 100, after: 40 },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: ACCENT_BLUE, space: 6 } },
          children: [new TextRun({
            text: "Vaiga Rimsaite, CFA  \u00B7  Valuation Realized",
            bold: true, size: 18, color: DARK_BLUE, font: "Arial"
          })]
        }),
        new Paragraph({
          spacing: { before: 0, after: 160 },
          children: [new TextRun({
            text: "vr@valuationrealized.com  \u00B7  +971 505832701",
            size: 18, color: DARK_BLUE, font: "Arial"
          })]
        }),

        // Disclaimer
        new Paragraph({
          spacing: { before: 80, after: 0 },
          children: [new TextRun({
            text: "This document is confidential and intended solely for the named recipient. It does not constitute an offer to sell or solicitation. All financial data is based on audited accounts and management representations. Recipients should conduct independent due diligence. Company identity disclosed post-NDA only.",
            size: 12, color: "999999", font: "Arial", italics: true
          })]
        }),

        // Footer text
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 80, after: 0 },
          children: [new TextRun({
            text: "Confidential investment opportunity",
            size: 14, color: "AAAAAA", font: "Arial", italics: true
          })]
        })
      ]
    }
  ]
});

const OUTPUT = process.argv[2] || "C:\\Users\\vrimsaite\\Desktop\\VR\\Ishwar - Teaser_VR.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log("Created: " + OUTPUT);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
