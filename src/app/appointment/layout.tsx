import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Dental Appointment Online",
  description:
    "Schedule your dental consultation at KGH Dental in Banani, Dhaka. Choose your preferred specialist doctor, date, and 30-minute time slot easily online.",
  alternates: {
    canonical: "https://kghdental.com/appointment",
  },
  openGraph: {
    title: "Book Dental Appointment Online | KGH Dental Banani",
    description:
      "Schedule your consultation with certified orthodontists, surgeons, and dental specialists at KGH Dental.",
    url: "https://kghdental.com/appointment",
  },
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
