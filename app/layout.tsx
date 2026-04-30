import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { seoKeywords } from "@/lib/seo-keywords";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Meta Tronix | Product Engineering & Digital Transformation",
    template: "%s | Meta Tronix",
  },
  description:
    "Meta Tronix is a Nepal-based product engineering company. We build scalable web and mobile products, SaaS platforms, CRM systems, and cloud-native solutions.",
  keywords: seoKeywords,
  icons: {
    icon: [{ url: "/metatronixlogo.png", type: "image/png" }],
    apple: [{ url: "/metatronixlogo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans min-h-screen flex flex-col bg-white text-brand-body`}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
