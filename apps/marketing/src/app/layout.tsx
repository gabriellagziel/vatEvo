import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://vatevo-marketing.vercel.app"),
  title: {
    default: "Vatevo — EU E‑Invoicing Compliance for SaaS",
    template: "%s · Vatevo"
  },
  description: "Automate EU e‑invoicing compliance and stay ahead of ViDA; one API, one dashboard, total compliance.",
  openGraph: {
    title: "Vatevo — EU E‑Invoicing Compliance for SaaS",
    description: "Automate EU e‑invoicing compliance and stay ahead of ViDA.",
    url: "https://vatevo-marketing.vercel.app",
    siteName: "Vatevo",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Vatevo" }],
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "Vatevo", description: "EU e‑invoicing compliance", images: ["/og-default.png"] }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
