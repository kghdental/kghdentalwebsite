import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dental Health Care Blog & Guides",
  description:
    "Expert dental health articles, oral hygiene advice, root canal facts, braces vs aligners guides, and dental care tips written by specialists at KGH Dental.",
  alternates: {
    canonical: "https://kghdental.com/blog",
  },
  openGraph: {
    title: "Dental Health Care Blog & Guides | KGH Dental",
    description:
      "Educational dental health tips, treatment guides, and specialist oral care advice from KGH Dental.",
    url: "https://kghdental.com/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
