import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Specialist Dental Doctors",
  description:
    "Meet our team of board-certified dental specialists in Banani, Dhaka. Orthodontists, prosthodontists, oral and maxillofacial surgeons, and pediatric dentists at KGH Dental.",
  alternates: {
    canonical: "https://kghdental.com/doctors",
  },
  openGraph: {
    title: "Specialist Dental Doctors | KGH Dental Banani",
    description:
      "Expert team of certified dental specialists at KGH Dental. Each department led by certified specialists.",
    url: "https://kghdental.com/doctors",
  },
};

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
