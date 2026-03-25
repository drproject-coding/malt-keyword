import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366F1",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
