import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SME Valuation Calculator | Valuation Realized",
  description: "Approximate company valuation for SMEs using industry-specific multiples and quality adjustments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#faf9f7] text-gray-900 antialiased">
        <header className="border-b border-[#2d4a2d]/10 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vr-logo.png" alt="Valuation Realized" className="h-10" />
            <div className="border-l border-[#2d4a2d]/20 pl-3">
              <p className="text-sm font-medium text-[#2d4a2d]">SME Valuation Calculator</p>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-[#2d4a2d]/10 bg-white mt-12">
          <div className="mx-auto max-w-5xl px-4 py-4 text-center text-xs text-gray-400">
            Valuation Realized &middot; Professional M&A Advisory
          </div>
        </footer>
      </body>
    </html>
  );
}
