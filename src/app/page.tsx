import { Hero } from "@/components/home/Hero";
import { DepartmentGrid } from "@/components/home/DepartmentGrid";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { ClinicalPhilosophyBanner } from "@/components/home/ClinicalPhilosophyBanner";
import { DoctorPreview } from "@/components/home/DoctorPreview";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { BlogSection } from "@/components/home/BlogSection";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <DoctorPreview />
      <DepartmentGrid />
      <WhyChooseUs />
      <ClinicalPhilosophyBanner />
      <BlogSection />
      <GoogleReviews />
      <CtaBanner />
    </div>
  );
}
