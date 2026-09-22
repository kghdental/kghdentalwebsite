import type { Metadata, Viewport } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ClinicSettingsProvider } from "@/context/ClinicSettingsContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "KGH Dental — Multi-Specialty Dental Clinic | Book an Appointment",
  description:
    "KGH Dental brings orthodontists, oral surgeons, and dental specialists together under one roof. Expert dental care in Dhaka. Book online today.",
  keywords: [
    "KGH Dental",
    "Dentist Dhaka",
    "Orthodontist Dhaka",
    "Oral Surgeon Dhaka",
    "Dental Implants",
    "Root Canal Treatment",
    "Teeth Braces Dhaka",
    "কেজিএইচ ডেন্টাল",
    "ডেন্টাল চেম্বার ঢাকা",
  ],
  authors: [{ name: "KGH Dental Clinical Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${hindSiliguri.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-zinc-900 selection:text-white">
        <LanguageProvider>
          <ClinicSettingsProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClinicSettingsProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
