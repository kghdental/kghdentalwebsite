import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us & Chamber Location Banani",
  description:
    "Visit KGH Dental at Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213. Phone numbers, chamber visiting hours, and Google Map directions.",
  alternates: {
    canonical: "https://kghdental.com/contact",
  },
  openGraph: {
    title: "Contact Us & Chamber Location | KGH Dental Banani",
    description:
      "Find chamber location, contact hotline, visiting hours, and directions for KGH Dental in Banani, Dhaka.",
    url: "https://kghdental.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
