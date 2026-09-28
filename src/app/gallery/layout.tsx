import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinical Gallery & Smile Transformations",
  description:
    "Explore clinical cases, before & after dental restorations, smile design, implants, and modern chamber facilities at KGH Dental.",
  alternates: {
    canonical: "https://kghdental.com/gallery",
  },
  openGraph: {
    title: "Clinical Gallery & Smile Transformations | KGH Dental",
    description:
      "Real clinical treatment outcomes, smile transformations, and modern dental technology at KGH Dental.",
    url: "https://kghdental.com/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
