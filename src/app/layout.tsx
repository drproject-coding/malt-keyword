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
  title: "Malt Keyword Tool",
  description:
    "Find high-value keywords for your Malt profile. See volume and competition instantly.",
  openGraph: {
    title: "Malt Keyword Tool",
    description: "Find high-value keywords for your Malt profile.",
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
