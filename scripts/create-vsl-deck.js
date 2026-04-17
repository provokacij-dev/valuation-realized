const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Vaiga Rimsaite";
pres.title = "Valuation Realized — Exit Readiness";

// Brand colors
const C = {
  green: "2D4A2D",
  greenDark: "12301E",
  gold: "B8973E",
  cream: "F5F0E8",
  white: "FFFFFF",
  text: "12301E",
  textMuted: "6B5D4F",
  red: "C0392B",
  lightGreen: "E8F0E8",
};

// Helper: fresh shadow each time
const mkShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08 });

// ============================================================
// SLIDE 1: TITLE / HOOK
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: C.greenDark };
// Gold accent bar at top
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
// Title text
s1.addText("The 6 Things Buyers\nLook For", {
  x: 0.8, y: 1.0, w: 8.4, h: 2.0,
  fontSize: 44, fontFace: "Georgia", color: C.cream, bold: true,
  lineSpacingMultiple: 1.1
});
s1.addText("And How to Make Sure None of Them\nCost You Millions", {
  x: 0.8, y: 3.0, w: 8.4, h: 1.2,
  fontSize: 22, fontFace: "Georgia", color: C.gold, italic: true,
  lineSpacingMultiple: 1.2
});
// Bottom bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: C.green } });
s1.addText("VALUATION REALIZED", {
  x: 0.8, y: 5.05, w: 5, h: 0.5,
  fontSize: 13, fontFace: "Arial", color: C.gold, charSpacing: 4, bold: true
});
s1.addText("valuationrealized.com", {
  x: 5, y: 5.05, w: 4.2, h: 0.5,
  fontSize: 11, fontFace: "Arial", color: C.cream, align: "right"
});
s1.addNotes("HOOK: I spent nearly a decade at one of the Big Four consulting firms helping buyers reduce the price of companies like yours. In under 15 minutes, I'll share with you my insider knowledge about the exact six things buyers look for - and how to make sure none of them cost you millions in valuation discounts.\n\nHere's why this matters. More than half of all deals close at a lower price than the original offer. And three out of four business owners say they profoundly regretted their exit within a year.");

// ============================================================
// SLIDE 2: THE STATS
// ============================================================
let s2 = pres.addSlide();
s2.background = { color: C.cream };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s2.addText("Why This Matters", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 14, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 3
});
// Three stat boxes side by side
const stats = [
  { num: ">50%", desc: "of deals close at a lower\nprice than the original offer" },
  { num: "75%", desc: "of owners profoundly\nregretted their exit within\n12 months" },
  { num: "22%", desc: "had aligned business,\npersonal, and financial goals\nbefore exit" },
];
stats.forEach((st, i) => {
  const bx = 0.6 + i * 3.1;
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: bx, y: 1.3, w: 2.8, h: 3.2,
    fill: { color: C.white }, rectRadius: 0.12,
    shadow: { type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.06 }
  });
  s2.addText(st.num, {
    x: bx, y: 1.6, w: 2.8, h: 1.0,
    fontSize: 48, fontFace: "Georgia", color: i === 2 ? C.red : C.green, bold: true, align: "center"
  });
  s2.addShape(pres.shapes.LINE, { x: bx + 0.8, y: 2.7, w: 1.2, h: 0, line: { color: C.gold, width: 2 } });
  s2.addText(st.desc, {
    x: bx + 0.3, y: 2.9, w: 2.2, h: 1.4,
    fontSize: 13, fontFace: "Arial", color: C.text, align: "center", lineSpacingMultiple: 1.3
  });
});
s2.addText("Source: Exit Planning Institute", {
  x: 0.8, y: 4.9, w: 8.4, h: 0.4,
  fontSize: 9, fontFace: "Arial", color: C.textMuted, italic: true
});
s2.addNotes("More than half of all deals close at a lower price than the original offer. And three out of four business owners say they profoundly regretted their exit within a year. And it is not fun to be part of these statistics.");

// ============================================================
// SLIDE 3: THE DEAL STORY
// ============================================================
let s3 = pres.addSlide();
s3.background = { color: C.cream };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s3.addText("A Deal That Stayed With Me", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 14, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 3
});
// Large quote-style text
s3.addText("7 months of due diligence.\nEverything pointed toward a close.", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.4,
  fontSize: 30, fontFace: "Georgia", color: C.greenDark, lineSpacingMultiple: 1.2
});
s3.addText("Then the investment committee killed the deal.", {
  x: 0.8, y: 2.6, w: 8.4, h: 0.8,
  fontSize: 28, fontFace: "Georgia", color: C.red, bold: true
});
// The three mistakes
const mistakes = [
  { n: "1", t: "Financials didn't reconcile" },
  { n: "2", t: "Operations were underinvested" },
  { n: "3", t: "Growth projections couldn't survive scrutiny" },
];
mistakes.forEach((m, i) => {
  const my = 3.6 + i * 0.55;
  s3.addShape(pres.shapes.OVAL, {
    x: 1.0, y: my, w: 0.35, h: 0.35,
    fill: { color: C.greenDark }
  });
  s3.addText(m.n, {
    x: 1.0, y: my, w: 0.35, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: C.cream, align: "center", valign: "middle", bold: true
  });
  s3.addText(m.t, {
    x: 1.55, y: my, w: 7, h: 0.35,
    fontSize: 16, fontFace: "Arial", color: C.text, valign: "middle"
  });
});
s3.addNotes("Let me start with a deal I worked on last year. I was advising a corporate buyer that wanted to acquire a poultry business. The poultry company had a good story, solid commercial relationships, loyal and prominent client base. And the buyer had some serious capital behind the deal. So we did 7 months of work. Everything pointed toward a close. And then the buyer's investment committee killed the deal.");

// ============================================================
// SLIDE 4: CORE INSIGHT
// ============================================================
let s4 = pres.addSlide();
s4.background = { color: C.greenDark };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s4.addText("The seller was selling growth.", {
  x: 0.8, y: 1.2, w: 8.4, h: 1.0,
  fontSize: 32, fontFace: "Georgia", color: C.cream
});
s4.addText("The buyer was looking for certainty.", {
  x: 0.8, y: 2.2, w: 8.4, h: 1.0,
  fontSize: 32, fontFace: "Georgia", color: C.gold, bold: true
});
s4.addShape(pres.shapes.LINE, { x: 0.8, y: 3.4, w: 2.5, h: 0, line: { color: C.gold, width: 2 } });
s4.addText("Growth drives interest.\nCertainty drives valuation.", {
  x: 0.8, y: 3.7, w: 8.4, h: 1.2,
  fontSize: 22, fontFace: "Georgia", color: C.cream, italic: true, lineSpacingMultiple: 1.3
});
s4.addNotes("Founders build businesses from the inside out. Customers. Product. Revenue. Growth. But buyers evaluate businesses from the outside in. They look at risk. Transferability. Financial clarity. And every risk a buyer finds becomes a valuation discount. Growth drives interest. But certainty will drive the valuation.");

// ============================================================
// SLIDE 5: WHO I AM
// ============================================================
let s5 = pres.addSlide();
s5.background = { color: C.cream };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s5.addText("Vaiga Rimsaite, CFA", {
  x: 0.8, y: 0.5, w: 8.4, h: 0.8,
  fontSize: 34, fontFace: "Georgia", color: C.greenDark, bold: true
});
s5.addShape(pres.shapes.LINE, { x: 0.8, y: 1.35, w: 2, h: 0, line: { color: C.gold, width: 2 } });
const bioItems = [
  "Nearly a decade at EY-Parthenon (Big Four)",
  "Mergers & Acquisitions across Europe, US, Middle East",
  "$70bn+ in transaction value",
  "Chartered Financial Analyst",
  "Buy-side advisor: my job was to find every reason to pay less",
];
s5.addText(bioItems.map((t, i) => ({
  text: t,
  options: { bullet: true, breakLine: i < bioItems.length - 1, fontSize: 16, fontFace: "Arial", color: C.text }
})), {
  x: 0.8, y: 1.7, w: 8.4, h: 2.8,
  paraSpaceAfter: 10
});
s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.8, y: 4.3, w: 8.4, h: 0.8,
  fill: { color: C.greenDark }, rectRadius: 0.08
});
s5.addText("Now I do the opposite. I help founders find those reasons first \u2014 and fix them.", {
  x: 1.0, y: 4.3, w: 8.0, h: 0.8,
  fontSize: 15, fontFace: "Georgia", color: C.gold, italic: true, valign: "middle"
});
s5.addNotes("My name is Vaiga Rimsaite. I'm a Chartered Financial Analyst and I spent nearly a decade at one of the Big Four consulting firms, where I worked on mergers and acquisitions across Europe, US and the Middle East. On transactions worth over seventy billion dollars combined. My job was to sit on the buyer's side of the table and find every reason to pay less. Now I do the opposite.");

// ============================================================
// SLIDE 6: THE SIX DOMAINS OVERVIEW
// ============================================================
let s6 = pres.addSlide();
s6.background = { color: C.cream };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s6.addText("THE SIX DOMAINS", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.5,
  fontSize: 14, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 3
});
s6.addText("What Every Buyer Evaluates", {
  x: 0.8, y: 0.7, w: 8.4, h: 0.7,
  fontSize: 30, fontFace: "Georgia", color: C.greenDark, bold: true
});
const domains = [
  { n: "01", name: "Financial Clarity\n& Quality", col: 0 },
  { n: "02", name: "Legal & Compliance\nHygiene", col: 1 },
  { n: "03", name: "Leadership\n& Continuity", col: 2 },
  { n: "04", name: "Operational\nMaturity", col: 0 },
  { n: "05", name: "Commercial\nCredibility", col: 1 },
  { n: "06", name: "Tech & Data\nIntegrity", col: 2 },
];
domains.forEach((d, i) => {
  const row = i < 3 ? 0 : 1;
  const bx = 0.6 + d.col * 3.1;
  const by = 1.7 + row * 1.9;
  s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: bx, y: by, w: 2.8, h: 1.6,
    fill: { color: C.white }, rectRadius: 0.1,
    shadow: { type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.06 }
  });
  s6.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: 2.8, h: 0.05, fill: { color: C.gold } });
  s6.addText(d.n, {
    x: bx + 0.2, y: by + 0.2, w: 0.5, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.gold, bold: true
  });
  s6.addText(d.name, {
    x: bx + 0.2, y: by + 0.55, w: 2.4, h: 0.9,
    fontSize: 15, fontFace: "Georgia", color: C.greenDark, bold: true, lineSpacingMultiple: 1.15
  });
});
s6.addNotes("After all those deals, I can tell you with certainty: the same six things determine whether a transaction closes at full value or falls apart. Let me show you each one.");

// ============================================================
// DOMAIN SLIDE HELPER
// ============================================================
function domainSlide(num, title, subtitle, keyPoints, storyBeat, question) {
  let s = pres.addSlide();
  s.background = { color: C.cream };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
  // Domain number badge
  s.addShape(pres.shapes.OVAL, {
    x: 0.8, y: 0.35, w: 0.5, h: 0.5,
    fill: { color: C.greenDark }
  });
  s.addText(num, {
    x: 0.8, y: 0.35, w: 0.5, h: 0.5,
    fontSize: 16, fontFace: "Arial", color: C.gold, align: "center", valign: "middle", bold: true
  });
  s.addText(title, {
    x: 1.5, y: 0.3, w: 7.5, h: 0.6,
    fontSize: 26, fontFace: "Georgia", color: C.greenDark, bold: true
  });
  if (subtitle) {
    s.addText(subtitle, {
      x: 1.5, y: 0.85, w: 7.5, h: 0.4,
      fontSize: 13, fontFace: "Arial", color: C.textMuted, italic: true
    });
  }
  // Key points — left column
  s.addText(keyPoints.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < keyPoints.length - 1, fontSize: 14, fontFace: "Arial", color: C.text }
  })), {
    x: 0.8, y: 1.4, w: 4.2, h: 2.4,
    paraSpaceAfter: 8
  });
  // Story beat — right column card
  if (storyBeat) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 5.4, y: 1.4, w: 4.0, h: 2.4,
      fill: { color: C.greenDark }, rectRadius: 0.1
    });
    s.addText("DEAL STORY", {
      x: 5.7, y: 1.55, w: 3.4, h: 0.35,
      fontSize: 10, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 2
    });
    s.addText(storyBeat, {
      x: 5.7, y: 1.95, w: 3.4, h: 1.7,
      fontSize: 12, fontFace: "Arial", color: C.cream, lineSpacingMultiple: 1.3
    });
  }
  // Question box at bottom
  if (question) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.8, y: 4.1, w: 8.4, h: 1.0,
      fill: { color: "FFF8F0" }, rectRadius: 0.08,
      line: { color: C.gold, width: 1 }
    });
    s.addText(question, {
      x: 1.1, y: 4.1, w: 7.8, h: 1.0,
      fontSize: 14, fontFace: "Georgia", color: C.greenDark, italic: true, valign: "middle"
    });
  }
  return s;
}

// ============================================================
// SLIDES 7-12: DOMAIN DEEP DIVES
// ============================================================

let d1 = domainSlide("01", "Financial Clarity & Quality",
  "Do your numbers survive scrutiny?",
  [
    "Clean, audited books that reconcile",
    "Normalized EBITDA surviving QofE review",
    "Revenue quality: recurring vs. project-based",
    "Working capital without unexplained spikes",
    "No hidden liabilities in the data room",
  ],
  "The poultry deal: management accounts told one story, statutory filings told another. EBITDA add-backs couldn't be documented. Trust was gone. Deal died after 7 months.",
  "If a buyer's advisor sat down with your books tomorrow \u2014 would every number reconcile?"
);
d1.addNotes("The first thing a buyer examines is your financials. Not just whether you have them - whether they survive scrutiny. That poultry deal I mentioned? This is where it started to unravel. The seller's management accounts told one story. Their statutory filings told another. When a buyer sees that, they don't think messy bookkeeping. They think: what else are they hiding?");

let d2 = domainSlide("02", "Legal & Compliance Hygiene",
  "The quickest way to scare a buyer away",
  [
    "Contracts documented, current, assignable",
    "IP assigned to the company, not individuals",
    "Change-of-control clauses identified",
    "Tax compliance with no aggressive positions",
    "Regulatory standing current",
  ],
  "Tech deal: the 'crown jewel' software was built on open-source code. Not proprietary IP \u2014 public property. The buyer walked away.",
  null
);
d2.addNotes("The second lens is legal and compliance. I was on one tech deal and the target company had a cool software product. When we did the tech diligence, we found the product code was written using open source code. That means the software was not IP but public property. The buyer walked away.");

let d3 = domainSlide("03", "Leadership & Continuity",
  "Often the most expensive domain",
  [
    "Capable #2 who has run the business",
    "Key relationships held by the team",
    "Retention packages for critical staff",
    "Documented succession plan",
    "Cultural transferability",
  ],
  "Lithuania tech deal: every relationship, every decision, every piece of knowledge lived with the founder. No second-in-command. Buyer's conclusion: 'We can't transfer this.' They walked.",
  "If you disappeared for 3 months \u2014 would revenue hold? Would your best people stay?"
);
d3.addNotes("The third domain is people. I worked on a technology deal in Lithuania. Every customer relationship, every strategic decision, every piece of institutional knowledge lived with one person - the founder. No second-in-command. The buyer's conclusion was simple: we can't transfer this. Buyers will not pay for what they cannot keep.");

let d4 = domainSlide("04", "Operational Maturity",
  "Buyers are buying a machine, not a job",
  [
    "Documented SOPs for critical functions",
    "Clean cost allocation and boundaries",
    "Decision-making without founder sign-off",
    "Scalability: 2x revenue without 2x headcount",
    "Departments working together, not in silos",
  ],
  "German automotive carve-out: 6 months spent trying to figure out which division was part of the deal. Shared people, systems, customers. No one could draw the line.",
  null
);
d4.addNotes("A few years ago I worked on a carve-out for a large automotive company in Germany. For six months, the seller couldn't decide whether their aftermarket division was part of the deal. On paper it was a separate division. In practice, it shared people, systems, customers. Six months - not negotiating price - just trying to figure out what was being sold.");

let d5 = domainSlide("05", "Commercial Credibility",
  "Sellers sell the future. It has to be credible.",
  [
    "Market sizing backed by evidence",
    "Named growth drivers with data",
    "Documented pipeline with conversion rates",
    "Customer economics: CAC, LTV, NRR",
    "Story tailored to buyer type",
  ],
  "The poultry deal's third mistake: double-digit growth forecast with no pipeline data, no conversion metrics, no model. The story fell apart under one probing question.",
  null
);
d5.addNotes("The fifth is your commercial and growth story. Remember the third mistake from that deal? The growth story. Commercial Credibility means market sizing backed by evidence, not aspiration. And critically - your customer economics. Sophisticated buyers will ask for CAC, LTV, and NRR in the first week. If you don't have them, they assume you don't know.");

let d6 = domainSlide("06", "Tech & Data Integrity",
  "A standalone area of scrutiny in every deal",
  [
    "Tech stack age and maintenance debt",
    "Proprietary vs. off-the-shelf vs. open-source",
    "Data security: SOC 2, GDPR compliance",
    "Integration complexity for the buyer",
    "Cybersecurity diligence and breach history",
  ],
  null,
  null
);
d6.addNotes("The sixth lens is technology and data. What's the age and condition of your tech stack? For any buyer in a regulated industry, cyber diligence is on par with legal. And for all buyers, an undisclosed data breach discovered after close can trigger indemnity claims that can destroy the deal economics. This domain also determines integration complexity.");

// ============================================================
// SLIDE 13: THE COMPOUND EFFECT
// ============================================================
let s13 = pres.addSlide();
s13.background = { color: C.greenDark };
s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s13.addText("These Domains Compound", {
  x: 0.8, y: 0.5, w: 8.4, h: 0.8,
  fontSize: 34, fontFace: "Georgia", color: C.cream, bold: true
});
s13.addText("Weak financials + founder dependency + no processes =\nA buyer sees a business that cannot survive a transition.", {
  x: 0.8, y: 1.5, w: 8.4, h: 1.2,
  fontSize: 18, fontFace: "Arial", color: C.cream, lineSpacingMultiple: 1.4
});
// Compound visual: arrows
s13.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 3.0, w: 2.2, h: 0.7,
  fill: { color: C.red }, rectRadius: 0.06
});
s13.addText("Financial gaps", {
  x: 0.6, y: 3.0, w: 2.2, h: 0.7,
  fontSize: 13, fontFace: "Arial", color: C.white, align: "center", valign: "middle", bold: true
});
s13.addText("\u2192", {
  x: 2.85, y: 3.0, w: 0.5, h: 0.7,
  fontSize: 24, color: C.gold, align: "center", valign: "middle"
});
s13.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.4, y: 3.0, w: 2.2, h: 0.7,
  fill: { color: C.red }, rectRadius: 0.06
});
s13.addText("Questions\neverything", {
  x: 3.4, y: 3.0, w: 2.2, h: 0.7,
  fontSize: 13, fontFace: "Arial", color: C.white, align: "center", valign: "middle", bold: true
});
s13.addText("\u2192", {
  x: 5.65, y: 3.0, w: 0.5, h: 0.7,
  fontSize: 24, color: C.gold, align: "center", valign: "middle"
});
s13.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 6.2, y: 3.0, w: 2.2, h: 0.7,
  fill: { color: C.red }, rectRadius: 0.06
});
s13.addText("No reason to\nstretch on price", {
  x: 6.2, y: 3.0, w: 2.2, h: 0.7,
  fontSize: 13, fontFace: "Arial", color: C.white, align: "center", valign: "middle", bold: true
});
s13.addShape(pres.shapes.LINE, { x: 0.8, y: 4.1, w: 2.5, h: 0, line: { color: C.gold, width: 2 } });
s13.addText("Each problem amplified the others.\nThat's how compounding works \u2014 and it works against you.", {
  x: 0.8, y: 4.3, w: 8.4, h: 0.9,
  fontSize: 16, fontFace: "Georgia", color: C.cream, italic: true, lineSpacingMultiple: 1.3
});
s13.addNotes("These six domains don't operate in isolation. They compound. The poultry deal wasn't killed by one problem. Financials that didn't reconcile made the buyer question everything. The founder dependency made them doubt the business could survive transition. The growth story removed any reason to stretch on price. Each problem amplified the others.");

// ============================================================
// SLIDE 14: THE CHOICE
// ============================================================
let s14 = pres.addSlide();
s14.background = { color: C.cream };
s14.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s14.addText("You Have Two Options", {
  x: 0.8, y: 0.5, w: 8.4, h: 0.8,
  fontSize: 32, fontFace: "Georgia", color: C.greenDark, bold: true
});
// Option A - red
s14.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.6, y: 1.6, w: 4.2, h: 3.0,
  fill: { color: "FFF5F5" }, rectRadius: 0.1,
  line: { color: C.red, width: 1.5 }
});
s14.addText("Do Nothing", {
  x: 0.6, y: 1.75, w: 4.2, h: 0.5,
  fontSize: 22, fontFace: "Georgia", color: C.red, bold: true, align: "center"
});
s14.addText("A buyer shows up. Finds every gap.\nEvery one becomes a line item\nin a valuation discount \u2014 or a\nreason to restructure the deal.", {
  x: 0.9, y: 2.4, w: 3.6, h: 1.8,
  fontSize: 14, fontFace: "Arial", color: C.text, align: "center", lineSpacingMultiple: 1.4
});
// Option B - green
s14.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.2, y: 1.6, w: 4.2, h: 3.0,
  fill: { color: C.lightGreen }, rectRadius: 0.1,
  line: { color: C.green, width: 1.5 }
});
s14.addText("Prepare", {
  x: 5.2, y: 1.75, w: 4.2, h: 0.5,
  fontSize: 22, fontFace: "Georgia", color: C.green, bold: true, align: "center"
});
s14.addText("See your business through the\nbuyer's lens. Fix what can be fixed.\nControl the conversation.\nGet the exit you earned.", {
  x: 5.5, y: 2.4, w: 3.6, h: 1.8,
  fontSize: 14, fontFace: "Arial", color: C.text, align: "center", lineSpacingMultiple: 1.4
});
s14.addNotes("You can close this video and go back to running your business. And when a buyer shows up, they'll find everything I just described. Or - you prepare. The founders who prepare don't just get better exits. They get the exit they earned.");

// ============================================================
// SLIDE 15: THE THREE STEPS
// ============================================================
let s15 = pres.addSlide();
s15.background = { color: C.cream };
s15.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s15.addText("VALUATION REALIZED", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.4,
  fontSize: 12, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 3
});
s15.addText("Three Steps to Buyer-Ready", {
  x: 0.8, y: 0.65, w: 8.4, h: 0.7,
  fontSize: 30, fontFace: "Georgia", color: C.greenDark, bold: true
});
const steps = [
  { step: "STEP 1", name: "Exit Readiness\nDiagnostic", verb: "DIAGNOSE", desc: "6-domain assessment.\nReadiness score.\nGap quantification." },
  { step: "STEP 2", name: "Exit Readiness\nRoadmap", verb: "PLAN", desc: "Prioritized remediation.\nValue bridge.\nDollar-linked actions." },
  { step: "STEP 3", name: "Exit Readiness\nProgram", verb: "IMPLEMENT", desc: "Structured sprints.\nBi-weekly checkpoints.\nBuyer-ready status." },
];
steps.forEach((st, i) => {
  const bx = 0.5 + i * 3.2;
  s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: bx, y: 1.6, w: 2.9, h: 3.3,
    fill: { color: C.white }, rectRadius: 0.1,
    shadow: { type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.06 }
  });
  s15.addShape(pres.shapes.RECTANGLE, { x: bx, y: 1.6, w: 2.9, h: 0.05, fill: { color: C.gold } });
  s15.addText(st.step, {
    x: bx + 0.3, y: 1.85, w: 2.3, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.gold, bold: true, charSpacing: 2
  });
  s15.addText(st.name, {
    x: bx + 0.3, y: 2.2, w: 2.3, h: 0.9,
    fontSize: 17, fontFace: "Georgia", color: C.greenDark, bold: true, lineSpacingMultiple: 1.15
  });
  // Verb badge
  s15.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: bx + 0.3, y: 3.2, w: 1.6, h: 0.35,
    fill: { color: C.greenDark }, rectRadius: 0.04
  });
  s15.addText(st.verb, {
    x: bx + 0.3, y: 3.2, w: 1.6, h: 0.35,
    fontSize: 10, fontFace: "Arial", color: C.gold, align: "center", valign: "middle", bold: true, charSpacing: 2
  });
  s15.addText(st.desc, {
    x: bx + 0.3, y: 3.7, w: 2.3, h: 1.0,
    fontSize: 12, fontFace: "Arial", color: C.text, lineSpacingMultiple: 1.4
  });
  // Arrow between cards
  if (i < 2) {
    s15.addText("\u2192", {
      x: bx + 2.9, y: 2.6, w: 0.3, h: 0.6,
      fontSize: 22, color: C.gold, align: "center", valign: "middle"
    });
  }
});
s15.addNotes("This is what I do through Valuation Realized. The process has three steps. Step one: the Exit Readiness Diagnostic. Step two: the Exit Readiness Roadmap. Step three: the Exit Readiness Program. You keep running your business. I make sure it's ready to sell.");

// ============================================================
// SLIDE 16: CTA
// ============================================================
let s16 = pres.addSlide();
s16.background = { color: C.greenDark };
s16.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
s16.addText("Book a 45-Minute Conversation", {
  x: 0.8, y: 1.0, w: 8.4, h: 1.0,
  fontSize: 36, fontFace: "Georgia", color: C.cream, bold: true
});
s16.addShape(pres.shapes.LINE, { x: 0.8, y: 2.1, w: 2.5, h: 0, line: { color: C.gold, width: 2 } });
s16.addText("On that call, I'll ask the same questions a buyer would ask.\nYou'll leave with a clearer picture of where you stand than\nmost founders have on the day they sign the LOI.", {
  x: 0.8, y: 2.4, w: 8.4, h: 1.4,
  fontSize: 17, fontFace: "Arial", color: C.cream, lineSpacingMultiple: 1.4
});
// CTA button shape
s16.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.0, y: 4.0, w: 4.0, h: 0.7,
  fill: { color: C.gold }, rectRadius: 0.06
});
s16.addText("valuationrealized.com/exitreadiness", {
  x: 3.0, y: 4.0, w: 4.0, h: 0.7,
  fontSize: 15, fontFace: "Arial", color: C.greenDark, bold: true, align: "center", valign: "middle"
});
s16.addText("Most founders sell once. Buyers do it repeatedly.\nThat gap is where value is lost. Or realized.", {
  x: 0.8, y: 4.9, w: 8.4, h: 0.6,
  fontSize: 13, fontFace: "Georgia", color: C.cream, italic: true, align: "center", lineSpacingMultiple: 1.3
});
s16.addNotes("Below this video you can book a forty-five minute conversation with me. On that call, I'll ask you a series of questions about your business - the same kind of questions a buyer would eventually ask. You'll leave that conversation with a clearer picture of where you stand than most founders have on the day they sign the Letter of Intent. There's no pitch on the call. If it makes sense to work together, I'll tell you. If it doesn't, I'll tell you that too.");

// ============================================================
// WRITE FILE
// ============================================================
const outPath = path.join(process.cwd(), "Valuation Realized", "VSL-Presentation-Deck.pptx");
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("SUCCESS: " + outPath);
}).catch(e => console.error("ERROR:", e.message));
