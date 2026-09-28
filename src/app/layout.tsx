import type { Metadata, Viewport } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ClinicSettingsProvider } from "@/context/ClinicSettingsContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://kghdental.com"
  ),
  title: {
    default: "KGH Dental — Multi-Specialty Dental Clinic in Banani, Dhaka",
    template: "%s | KGH Dental",
  },
  description:
    "KGH Dental is a premier multi-specialty dental clinic in Banani, Dhaka. Featuring certified orthodontists, prosthodontists, oral surgeons, and pediatric dentists under one roof. Expert pain-free dental care. Book online today.",
  keywords: [
    "KGH Dental",
    "Dentist Dhaka",
    "Dentist Banani",
    "Best Dental Clinic Dhaka",
    "Dental Clinic Banani",
    "Orthodontist Dhaka",
    "Oral Surgeon Dhaka",
    "Dental Implants Dhaka",
    "Root Canal Treatment Dhaka",
    "Teeth Braces Dhaka",
    "Clear Aligners Dhaka",
    "Pediatric Dentist Dhaka",
    "Teeth Whitening Dhaka",
    "কেজিএইচ ডেন্টাল",
    "ডেন্টাল চেম্বার ঢাকা",
    "বনানী ডেন্টাল ক্লিনিক",
    "দাঁতের ডাক্তার ঢাকা",
  ],
  authors: [{ name: "KGH Dental Clinical Team" }],
  creator: "KGH Dental",
  publisher: "KGH Dental",
  alternates: {
    canonical: "https://kghdental.com",
    languages: {
      "en-US": "https://kghdental.com?lang=en",
      "bn-BD": "https://kghdental.com?lang=bn",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    url: "https://kghdental.com",
    siteName: "KGH Dental",
    title: "KGH Dental — Multi-Specialty Dental Clinic in Banani, Dhaka",
    description:
      "Expert dental care with certified specialists in orthodontics, oral surgery, dental implants, and pediatric dentistry. Book your appointment online.",
    images: [
      {
        url: "/images/logos/KGH%20Dental%20Logo%201.png",
        width: 1200,
        height: 630,
        alt: "KGH Dental Clinic Banani Dhaka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KGH Dental — Multi-Specialty Dental Clinic in Banani, Dhaka",
    description:
      "Expert dental care with certified specialists under one roof in Banani, Dhaka. Book your appointment online.",
    images: ["/images/logos/KGH%20Dental%20Logo%201.png"],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  category: "health",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${hindSiliguri.variable} scroll-smooth`}>
      <head>
        <JsonLd />
      </head>
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
