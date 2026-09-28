import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Specialized Dental Treatments & Services",
  description:
    "Comprehensive dental treatments at KGH Dental in Banani, Dhaka: Orthodontics, Invisible Braces, Dental Implants, Root Canal, Wisdom Tooth Extraction, Cosmetic Dentistry & Pediatric Care.",
  alternates: {
    canonical: "https://kghdental.com/services",
  },
  openGraph: {
    title: "Specialized Dental Treatments & Services | KGH Dental",
    description:
      "Advanced multi-specialty dental treatments in Banani, Dhaka. Modern technology and pain-free dentistry.",
    url: "https://kghdental.com/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
