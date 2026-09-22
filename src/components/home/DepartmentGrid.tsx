"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { DEPARTMENTS } from "@/data/departments";
import { Department } from "@/types";
import { fetchLiveDepartments } from "@/lib/api/db";
import { DepartmentIcon } from "@/components/shared/DepartmentIcon";
import { useLanguage } from "@/context/LanguageContext";
import { UI_STRINGS } from "@/data/translations";

interface ShowcaseDetails {
  categoryPill: { en: string; bn: string };
  headline: { en: string; bn: string };
  description: { en: string; bn: string };
  topTreatments: { en: string[]; bn: string[] };
  specialistBadge: { en: string; bn: string };
}

const DEPARTMENT_DETAILS: Record<string, ShowcaseDetails> = {
  orthodontics: {
    categoryPill: {
      en: "Orthodontics & Dentofacial Alignment",
      bn: "অর্থোডন্টিক্স ও ডেন্টোফেসিয়াল অ্যালাইনমেন্ট",
    },
    headline: {
      en: "Precision Tooth Alignment & Confident Smiles for All Ages",
      bn: "সোজা দাঁত, নিখুঁত বাইট ও আত্মবিশ্বাসী হাসির আধুনিক অর্থোডন্টিক্স",
    },
    description: {
      en: "Straighter teeth, better bites, and lifelong confident smiles. From traditional durable metal braces to virtually invisible clear aligners and custom digital smile design, our orthodontic team corrects dental misalignments with personalized clinical precision.",
      bn: "সোজা দাঁত, সঠিক বাইট এবং আজীবনের আত্মবিশ্বাসী হাসি। মেটাল ও সিরামিক ব্রেসেস থেকে শুরু করে প্রায় অদৃশ্য আধুনিক ক্লিয়ার অ্যালাইনার ও ডিজিটাল স্মাইল ডিজাইন — আমাদের অর্থোডন্টিক্স বিশেষজ্ঞ প্রতিটি চিকিৎসার নিখুঁত সমাধান নিশ্চিত করেন।",
    },
    topTreatments: {
      en: ["Metal & Ceramic Braces", "Invisible Clear Aligners", "Smile Design Makeover", "Post-Treatment Retainers"],
      bn: ["ট্রেডিশনাল ব্রেসেস", "ক্লিয়ার অদৃশ্য অ্যালাইনার", "ডিজিটাল স্মাইল ডিজাইন", "রিটেইনার কেয়ার"],
    },
    specialistBadge: {
      en: "Lead Specialist: Dr. Fatema Tuz Johora (FCPS)",
      bn: "প্রধান বিশেষজ্ঞ: ডাঃ ফাতেমা তুজ জোহরা (এফসিপিএস)",
    },
  },
  "oral-surgery": {
    categoryPill: {
      en: "Oral & Maxillofacial Surgery",
      bn: "ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি",
    },
    headline: {
      en: "Advanced Surgical Precision from Wisdom Teeth to Implants",
      bn: "উইজডম টুথ থেকে জটিল সার্জারি ও স্থায়ী ডেন্টাল ইমপ্ল্যান্ট",
    },
    description: {
      en: "Hospital-grade sterile surgery with unmatched care. From painless impacted wisdom tooth extractions to permanent dental implants and facial bone fracture reconstructions, our maxillofacial surgery team handles complex procedures with utmost precision.",
      bn: "হাসপাতাল-মানের জীবাণুমুক্ত পরিবেশে ব্যথামুক্ত উইজডম টুথ তোলা, স্থায়ী ডেন্টাল ইমপ্ল্যান্ট, মুখের ট্রমা ফ্র্যাকচার এবং চোয়ালের জয়েন্ট (TMJ) সমস্যার নিরাপদ ও আধুনিক সার্জিক্যাল সমাধান।",
    },
    topTreatments: {
      en: ["Painless Wisdom Tooth Surgery", "Permanent Dental Implants", "Facial Trauma & Fracture Care", "TMJ Joint Disorder Therapy"],
      bn: ["উইজডম টুথ সার্জারি", "স্থায়ী ডেন্টাল ইমপ্ল্যান্ট", "ফেসিয়াল ফ্র্যাকচার চিকিৎসা", "টিএমজে জয়েন্ট থেরাপি"],
    },
    specialistBadge: {
      en: "Lead Surgeon: Dr. Md. Sanwar Hossain (FCPS)",
      bn: "প্রধান সার্জন: ডাঃ মোঃ সানোয়ার হোসেন (এফসিপিএস)",
    },
  },
  endodontics: {
    categoryPill: {
      en: "Conservative Dentistry & Endodontics",
      bn: "কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স",
    },
    headline: {
      en: "Preserving Natural Teeth with Painless Rotary Root Canals",
      bn: "ব্যথামুক্ত রুট ক্যানেল ও প্রাকৃতিক দাঁত সংরক্ষণের আধুনিক প্রযুক্তি",
    },
    description: {
      en: "Saving your natural teeth is always our highest priority. We use computerized rotary instrumentation and digital apex locators for painless single-visit root canals, natural tooth-colored composite restorations, and micro-endodontic retreatments.",
      bn: "আপনার প্রাকৃতিক দাঁত রক্ষা করাই আমাদের প্রধান অগ্রাধিকার। আধুনিক রোটারি রুট ক্যানেল, দাঁতের রঙের ন্যাচারাল কমপজিট ফিলিং, ইনলে-অনলে ও রি-রুট ক্যানেল চিকিৎসার মাধ্যমে ব্যথাহীনভাবে দাঁতের দীর্ঘায়ু নিশ্চিত করি।",
    },
    topTreatments: {
      en: ["Rotary Root Canal (RCT)", "Tooth-Colored Composite Fillings", "Re-Root Canal Retreatment", "Inlay & Onlay Restorations"],
      bn: ["রোটারি রুট ক্যানেল (RCT)", "দাঁতের রঙের ফিলিং", "রি-রুট ক্যানেল চিকিৎসা", "ইনলে ও অনলে রিস্টোরেশন"],
    },
    specialistBadge: {
      en: "Endodontic & Restorative Specialists",
      bn: "এন্ডোডন্টিক ও রিস্টোরেটিভ বিশেষজ্ঞ দল",
    },
  },
  prosthodontics: {
    categoryPill: {
      en: "Prosthodontics & Tooth Replacement",
      bn: "প্রস্থোডন্টিক্স ও দাঁত প্রতিস্থাপন",
    },
    headline: {
      en: "Precision-Crafted Crowns, Bridges & Complete Restorations",
      bn: "দাঁতের নিখুঁত প্রতিস্থাপন, প্রিমিয়াম ক্রাউন ও পূর্ণ স্মাইল রিস্টোরেশন",
    },
    description: {
      en: "Missing or damaged teeth affect your chewing, speech, and smile confidence. Our prosthodontic team designs custom-engineered zirconia crowns, fixed dental bridges, and implant-supported overdentures engineered for longevity and natural beauty.",
      bn: "দাঁত হারিয়ে গেলে চিবানো ও কথা বলায় সমস্যা দেখা দেয়। আমাদের প্রস্থোডন্টিক্স বিভাগ নিখুঁত জিরকোনিয়া ক্রাউন, ফিক্সড ব্রিজ ও ইমপ্ল্যান্ট-সাপোর্টেড ডেনচারের মাধ্যমে প্রাকৃতিক দাঁতের মতো কার্যকারিতা ও সৌন্দর্য ফিরিয়ে আনে।",
    },
    topTreatments: {
      en: ["Zirconia & Ceramic Crowns", "Fixed Dental Bridges", "Full & Partial Dentures", "Implant-Supported Overdentures"],
      bn: ["জিরকোনিয়া ও সিরামিক ক্রাউন", "ফিক্সড ডেন্টাল ব্রিজ", "সম্পূর্ণ ও আংশিক ডেনচার", "ইমপ্ল্যান্ট-সাপোর্টেড ডেনচার"],
    },
    specialistBadge: {
      en: "Prosthetic Rehabilitation Specialists",
      bn: "প্রস্থোডন্টিক রিহ্যাবিলিটেশন বিশেষজ্ঞ দল",
    },
  },
  pediatric: {
    categoryPill: {
      en: "Pediatric Dentistry & Child Oral Health",
      bn: "শিশু দন্ত চিকিৎসা বিভাগ",
    },
    headline: {
      en: "Gentle, Kid-Friendly Dental Care that Children Truly Love",
      bn: "শিশুদের জন্য বন্ধুত্বপূর্ণ, আনন্দময় ও কোমল ডেন্টাল কেয়ার",
    },
    description: {
      en: "A positive first experience at the dentist builds oral hygiene habits that last a lifetime. We provide gentle, fear-free treatments tailored for children, from cavity preventive sealants and milk tooth root therapy to habit-breaking appliances.",
      bn: "ছোটবেলার একটি ইতিবাচক ডেন্টাল অভিজ্ঞতা সারাজীবন সুস্থ দাঁতের ভিত্তি গড়ে তোলে। শিশুদের ভীতি দূর করে দুধ দাঁতের রুট ক্যানেল (পালপোটমি), ক্যাভিটি প্রতিরোধক সিল্যান্ট ও আঙুল চোষা বন্ধের অ্যাপ্লায়েন্স সেবা দেওয়া হয়।",
    },
    topTreatments: {
      en: ["Pulpotomy & Pulpectomy (Kids RCT)", "Pit & Fissure Sealants", "Milk Tooth Space Maintainers", "Habit-Breaking Appliances"],
      bn: ["শিশুদের রুট ক্যানেল (পালপোটমি)", "ক্যাভিটি প্রিভেন্টিভ সিল্যান্ট", "স্পেস মেইনটেইনার", "ক্ষতিকর অভ্যাস দূরীকরণ"],
    },
    specialistBadge: {
      en: "Child-Centric Dental Specialists",
      bn: "শিশু দন্ত বিশেষজ্ঞ চিকিৎসক দল",
    },
  },
  periodontics: {
    categoryPill: {
      en: "Periodontics & Gum Disease Therapy",
      bn: "পেরিওডন্টিক্স ও মাড়ির চিকিৎসা",
    },
    headline: {
      en: "Healthy Gums: The Solid Foundation of Every Lasting Smile",
      bn: "সুস্থ মাড়ির সুরক্ষা ও দাঁতের দীর্ঘস্থায়ী স্থায়িত্বে আধুনিক পেরিওডন্টিক্স",
    },
    description: {
      en: "Healthy gums are crucial for keeping your teeth firmly in place. Our periodontal department treats bleeding, receding, and infected gums with ultrasonic scaling, deep root planing, cosmetic gummy smile contouring, and mobile teeth stabilization.",
      bn: "দাঁতকে মজবুত রাখার মূল ভিত্তি হলো সুস্থ মাড়ি। আল্ট্রাসনিক স্কেলিং, ডিপ রুট প্ল্যানিং, মাড়ির রক্তপাত বন্ধ, গামি স্মাইল সংশোধন ও নড়ে যাওয়া দাঁত সুরক্ষায় আমরা সার্বক্ষণিক সেবা দিই।",
    },
    topTreatments: {
      en: ["Ultrasonic Scaling & Polishing", "Deep Root Planing Therapy", "Gummy Smile Contouring", "Mobile Teeth Splinting"],
      bn: ["আল্ট্রাসনিক স্কেলিং ও পলিশিং", "ডিপ রুট প্ল্যানিং চিকিৎসা", "গামি স্মাইল কারেকশন", "নড়ে যাওয়া দাঁতের স্প্লিন্টিং"],
    },
    specialistBadge: {
      en: "Periodontal Care Specialists",
      bn: "মাড়ি রোগ বিশেষজ্ঞ চিকিৎসক দল",
    },
  },
  "oral-medicine": {
    categoryPill: {
      en: "Oral Medicine & Clinical Diagnosis",
      bn: "ওরাল মেডিসিন ও ক্লিনিক্যাল ডায়াগনোসিস",
    },
    headline: {
      en: "Advanced Oral Mucosal Care, Ulcers & Cancer Screening",
      bn: "মুখের জটিল ক্ষত, আলসার ও ক্যান্সার স্ক্রিনিং চিকিৎসা",
    },
    description: {
      en: "Not all oral conditions are related to teeth alone. Our Oral Medicine specialist diagnoses and treats non-healing ulcers, precancerous lesions, OSMF, salivary gland disorders, and systemic conditions with advanced clinical precision.",
      bn: "মুখের সব সমস্যা কেবল দাঁতেই সীমাবদ্ধ নয়। মুখের দীর্ঘস্থায়ী ঘা, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ, বার্নিং মাউথ সিন্ড্রোম ও লালাগ্রন্থির জটিল রোগের আন্তর্জাতিক মানের চিকিৎসা দেন আমাদের বিশেষজ্ঞ।",
    },
    topTreatments: {
      en: ["Oral Cancer Screening", "Precancerous Lesion Care", "OSMF & Ulcer Therapy", "Oral Biopsy Consultation"],
      bn: ["ওরাল ক্যান্সার স্ক্রিনিং", "প্রিক্যান্সারাস ক্ষত চিকিৎসা", "ওএসএমএফ ও আলসার কেয়ার", "ওরাল বায়োপসি কনসালটেশন"],
    },
    specialistBadge: {
      en: "Lead Consultant: Dr. Rifat Rahman (PhD, MSc)",
      bn: "প্রধান বিশেষজ্ঞ: ডা. রিফাত রহমান (পিএইচডি, এমএসসি)",
    },
  },
  "general-consultation": {
    categoryPill: {
      en: "General Dentistry & Digital Diagnostics",
      bn: "জেনারেল ডেন্টিস্ট্রি ও ডিজিটাল ডায়াগনস্টিকস",
    },
    headline: {
      en: "Accurate Digital Diagnosis & Clear, No-Guesswork Treatment Plans",
      bn: "ডিজিটাল ওপিজি, থ্রিডি স্ক্যান ও স্বচ্ছ চিকিৎসাপরিকল্পনা",
    },
    description: {
      en: "Not sure where to begin? A thorough general consultation is your first step. With low-radiation digital X-rays, intraoral camera assessments, and transparent advice, our doctors evaluate your complete dental health and direct you to the ideal specialist.",
      bn: "কোথা থেকে শুরু করবেন বুঝতে পারছেন না? ডিজিটাল এক্স-রে ও ইন্ট্রাওরাল ক্যামেরা পরীক্ষার মাধ্যমে আপনার সার্বিক দাঁতের অবস্থা পর্যবেক্ষণ করে উপযুক্ত বিশেষজ্ঞের কাছে রেফার করা হয়।",
    },
    topTreatments: {
      en: ["Comprehensive Dental Exam", "Digital Low-Radiation OPG X-Ray", "Intraoral 3D Camera Scanning", "Emergency Pain Relief Consultation"],
      bn: ["সার্বিক মুখ ও দাঁত পরীক্ষা", "ডিজিটাল ওপিজি এক্স-রে", "ইন্ট্রাওরাল ৩ডি স্ক্যান", "জরুরি ব্যথা নিরসন কনসালটেশন"],
    },
    specialistBadge: {
      en: "Comprehensive Clinical Diagnostic Team",
      bn: "সার্বিক ক্লিনিক্যাল ডায়াগনস্টিক টিম",
    },
  },
};

export function DepartmentGrid() {
  const { t, isBn } = useLanguage();
  const [deptList, setDeptList] = useState<Department[]>(DEPARTMENTS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    fetchLiveDepartments().then((depts) => {
      if (depts && depts.length > 0) {
        setDeptList(depts);
      }
    });
  }, []);

  const activeDept = useMemo(() => {
    if (deptList.length === 0) return DEPARTMENTS[0];
    return deptList[activeIndex] || deptList[0];
  }, [deptList, activeIndex]);

  const showcaseInfo = useMemo(() => {
    const slug = activeDept.slug;
    return (
      DEPARTMENT_DETAILS[slug] || {
        categoryPill: {
          en: t(activeDept.name),
          bn: t(activeDept.name),
        },
        headline: {
          en: `${t(activeDept.name)}: Specialized Clinical Excellence`,
          bn: `${t(activeDept.name)}: বিশেষায়িত চিকিৎসা সেবা`,
        },
        description: {
          en: t(activeDept.shortDesc),
          bn: t(activeDept.shortDesc),
        },
        topTreatments: {
          en: activeDept.subServices.slice(0, 4).map((s) => s.name.en),
          bn: activeDept.subServices.slice(0, 4).map((s) => s.name.bn),
        },
        specialistBadge: {
          en: "KGH Dental Specialized Team",
          bn: "কেজিএইচ ডেন্টাল বিশেষজ্ঞ টিম",
        },
      }
    );
  }, [activeDept, t]);

  const handleSelectDepartment = (index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  const handlePrev = () => {
    const nextIdx = (activeIndex - 1 + deptList.length) % deptList.length;
    handleSelectDepartment(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % deptList.length;
    handleSelectDepartment(nextIdx);
  };

  return (
    <section
      id="specialized-care"
      className="w-full py-16 sm:py-24 lg:py-28 bg-[#E9E8F0] text-zinc-900 transition-colors duration-300 relative overflow-hidden border-b border-zinc-300/80"
    >
      {/* Section Header: Centered & High Contrast Dark Typography */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 mb-10 sm:mb-14">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-zinc-300/80 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-800 mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBn ? "আমাদের সেবাসমূহ" : "Our Services"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.15]">
            {isBn ? UI_STRINGS.departmentsSection.title.bn : UI_STRINGS.departmentsSection.title.en}
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-zinc-700 mt-4 leading-relaxed font-normal max-w-3xl mx-auto">
            {isBn ? UI_STRINGS.departmentsSection.subtitle.bn : UI_STRINGS.departmentsSection.subtitle.en}
          </p>

          <div className="mt-6 flex items-center justify-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-900 hover:text-black hover:gap-3 transition-all duration-200 border-b-2 border-zinc-900 pb-0.5"
            >
              <span>{isBn ? "সকল সেবার তালিকা দেখুন" : "Browse All Services"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Interactive Showcase: 100% Full-Bleed Edge-to-Edge Layout (NO Nested Card Box!) */}
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-0">
        
        {/* Left Column: Department Information & Actions (Vertically Centered to Right Image & Lifted to Cover Half the Top Gap) */}
        <div
          className={`w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-center px-4 sm:px-8 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-12 2xl:pl-24 2xl:pr-16 py-2 lg:py-0 specialized-showcase-lift transition-all duration-300 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          }`}
        >
          <div>
            {/* Topic / Category Pill with Left/Right Arrows */}
            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <div className="inline-flex items-center bg-white/80 hover:bg-white border border-zinc-300/80 rounded-full px-2.5 py-1 transition-colors shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Specialty"
                  className="p-1 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-xs sm:text-sm font-bold text-zinc-900 tracking-wide select-none">
                  {isBn ? showcaseInfo.categoryPill.bn : showcaseInfo.categoryPill.en}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Specialty"
                  className="p-1 rounded-full text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs font-semibold text-zinc-600">
                {String(activeIndex + 1).padStart(2, "0")} / {String(deptList.length).padStart(2, "0")}
              </span>
            </div>

            {/* Bold Headline in High-Contrast Dark Typography */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.14] mb-4">
              {isBn ? showcaseInfo.headline.bn : showcaseInfo.headline.en}
            </h3>

            {/* Body Description */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-700 leading-relaxed mb-6 font-normal max-w-xl">
              {isBn ? showcaseInfo.description.bn : showcaseInfo.description.en}
            </p>

            {/* Featured Procedures Pills */}
            <div className="mb-8">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-800" />
                <span>{isBn ? "প্রধান বিশেষায়িত সেবাসমূহ" : "Key Specialized Treatments"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(isBn ? showcaseInfo.topTreatments.bn : showcaseInfo.topTreatments.en).map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-300/80 text-xs sm:text-sm font-semibold text-zinc-800 shadow-2xs transition-colors hover:border-zinc-400"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-300/80">
            <Link
              href={`/services/${activeDept.slug}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3134] hover:bg-zinc-900 active:bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-98 group"
            >
              <span>{isBn ? "চিকিৎসা ও সেবাসমূহ দেখুন" : "Explore Treatments"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={`/appointment?dept=${activeDept.slug}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/80 hover:bg-white text-zinc-900 border border-zinc-300/80 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-zinc-700" />
              <span>{isBn ? "অ্যাপয়েন্টমেন্ট নিন" : "Book with Specialist"}</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Thumbnail Rail + Large Showcase Image */}
        <div className="w-full lg:w-1/2 xl:w-[52%] flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch px-4 sm:px-8 lg:pl-0 lg:pr-0">
          
          {/* Vertical Thumbnail Strip */}
          <div className="order-2 sm:order-1 flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[560px] xl:max-h-[620px] py-1 px-1 shrink-0 scrollbar-thin">
            {deptList.map((dept, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDepartment(idx)}
                  title={t(dept.name)}
                  className={`group relative rounded-xl overflow-hidden transition-all duration-200 text-left shrink-0 sm:shrink cursor-pointer ${
                    isActive
                      ? "ring-2 ring-zinc-900 ring-offset-2 ring-offset-[#E9E8F0] shadow-xl scale-[1.03] opacity-100"
                      : "opacity-75 hover:opacity-100 hover:scale-[1.03] border border-zinc-300/80 shadow-2xs"
                  }`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 xl:w-22 xl:h-22 relative bg-zinc-200">
                    <img
                      src={dept.imageUrl}
                      alt={t(dept.name)}
                      className="w-full h-full object-cover object-center"
                    />
                    {/* Overlay gradient */}
                    <div
                      className={`absolute inset-0 transition-opacity ${
                        isActive ? "bg-black/10" : "bg-black/25 group-hover:bg-black/10"
                      }`}
                    />
                    {/* Miniature Icon Badge */}
                    <div className="absolute top-1.5 left-1.5 p-1 rounded-md bg-zinc-950/80 backdrop-blur-xs text-white shadow-2xs border border-white/20">
                      <DepartmentIcon name={dept.iconName} className="w-3 h-3" />
                    </div>
                    {/* Active Indicator Bar in Bright Zinc-900 */}
                    {isActive && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-900" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Big Showcase Image: Full Bleed to the Right Edge on Desktop */}
          <div className="order-1 sm:order-2 flex-1 relative rounded-2xl sm:rounded-3xl lg:rounded-l-3xl lg:rounded-r-none overflow-hidden bg-zinc-200 border border-zinc-300/80 lg:border-r-0 shadow-2xl min-h-[340px] sm:min-h-[460px] lg:min-h-[560px] xl:min-h-[620px]">
            <img
              key={activeDept.id}
              src={activeDept.imageUrl}
              alt={t(activeDept.name)}
              className={`w-full h-full object-cover object-center transition-all duration-500 ${
                isTransitioning ? "opacity-40 scale-102" : "opacity-100 scale-100"
              }`}
            />

            {/* Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Top Floating Badge on Image */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/85 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-md">
                <DepartmentIcon name={activeDept.iconName} className="w-3.5 h-3.5 text-zinc-100" />
                <span>{t(activeDept.name)}</span>
              </div>

              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                {isBn ? "বিশেষায়িত সেবা" : "Clinical Specialty"}
              </span>
            </div>

            {/* Bottom Floating Info Card */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-6 lg:right-8 p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-between gap-3 shadow-xl">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                  {isBn ? "ক্লিনিক্যাল এক্সিলেন্স" : "Clinical Excellence"}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {isBn ? showcaseInfo.specialistBadge.bn : showcaseInfo.specialistBadge.en}
                </p>
              </div>
              <Link
                href={`/services/${activeDept.slug}`}
                className="shrink-0 p-2 sm:p-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shadow-xs"
                title={isBn ? "বিস্তারিত দেখুন" : "View Details"}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Callout: "Not Sure Which Department? Start with a General Consultation" */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 mt-12 lg:mt-16">
        <div className="border-t border-zinc-300/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-500 flex items-center justify-center shrink-0 shadow-2xs border border-zinc-300/80">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-zinc-950">
                {isBn ? "নিশ্চিত নন কোন বিশেষজ্ঞের কাছে যাবেন?" : "Not Sure Which Department Fits Your Need?"}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-700 mt-0.5 max-w-2xl">
                {isBn
                  ? "জেনারেল কনসালটেশন নিন — আমাদের অভিজ্ঞ ডেন্টিস্ট পরীক্ষা করে সঠিক বিশেষজ্ঞের কাছে রেফার করবেন।"
                  : "Book a preliminary consultation. Our doctor will evaluate your case and guide you to the ideal specialist."}
              </p>
            </div>
          </div>

          <Link
            href="/appointment?dept=general-consultation"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2D3134] hover:bg-zinc-900 active:bg-black text-white text-xs sm:text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
          >
            <span>{isBn ? "জেনারেল কনসালটেশন বুক করুন" : "Book General Consultation"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
