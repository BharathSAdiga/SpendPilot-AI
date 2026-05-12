import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://spendpilot.ai";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SpendPilot AI | SaaS Spend Audit & Optimization",
    template: "%s | SpendPilot AI",
  },
  description: "Identify redundant tools, recover unused licenses, and cut your AI SaaS spend by up to 30% in minutes.",
  keywords: ["AI spend management", "SaaS audit", "cloud cost optimization", "AI tools audit", "software savings"],
  authors: [{ name: "SpendPilot Team" }],
  creator: "SpendPilot AI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "SpendPilot AI | SaaS Spend Audit & Optimization",
    description: "Audit your entire AI subscription stack and recover thousands in wasted spend.",
    siteName: "SpendPilot AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendPilot AI | SaaS Spend Audit & Optimization",
    description: "Stop overpaying for AI tools. Run a free audit in 5 minutes.",
    creator: "@spendpilot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
    >
      <body>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
