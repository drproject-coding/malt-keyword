import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  title: "Find High-Value Keywords for Your Malt Profile — Malt Keyword Tool",
  description:
    "See which keywords are actually searched on Malt. Instantly discover rare skills that make your freelancer profile stand out with real volume data.",
  openGraph: {
    title: "Find High-Value Keywords for Your Malt Profile — Malt Keyword Tool",
    description:
      "See which keywords are actually searched on Malt. Instantly discover rare skills that make your freelancer profile stand out with real volume data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center">
            <a
              href="/"
              className="text-sm font-black text-white tracking-tight"
            >
              MALT KEYWORD
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
