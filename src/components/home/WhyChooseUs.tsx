"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  Sparkles,
  FileText,
  CalendarCheck2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Info,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { UI_STRINGS } from "@/data/translations";
import { WhyChooseCard } from "@/types";
import { fetchLiveWhyChooseCards, DEFAULT_WHY_CHOOSE_CARDS } from "@/lib/api/db";

interface CardItem {
  id: string;
  tag: { en: string; bn: string };
  stat: { en: string; bn: string };
  title: { en: string; bn: string };
  desc: { en: string; bn: string };
  highlights?: { en: string[]; bn: string[] };
  cta?: { en: string; bn: string };
  ctaLink?: string;
  image?: string;
}

const EXTENDED_DETAILS: Record<
  string,
  {
    en: { subtitle: string; points: string[]; guarantee: string };
    bn: { subtitle: string; points: string[]; guarantee: string };
  }
> = {
  specialists: {
    en: {
      subtitle:
        "Every dental department at KGH is led exclusively by qualified specialist surgeons (FCPS, MS, PhD) who focus 100% on their specialized discipline.",
      points: [
        "Certified postgraduate specialists for orthodontic, endodontic, maxillofacial, and restorative procedures.",
        "Collaborative multi-specialty clinical board for multi-step or complex aesthetic cases.",
        "Continuous dental education adhering to international clinical treatment guidelines.",
      ],
      guarantee: "100% Specialist-Led Diagnosis — No Generalist Guesswork",
    },
    bn: {
      subtitle:
        "কেজিএইচ ডেন্টালের প্রতিটি বিভাগ সরাসরি উচ্চশিক্ষিত ও সার্টিফায়েড বিশেষজ্ঞ চিকিৎসকদের (FCPS, MS, PhD) তত্ত্বাবধানে পরিচালিত হয়।",
      points: [
        "অর্থোডন্টিক্স, রুট ক্যানেল, সার্জারি ও প্রস্থোডন্টিক্সে স্বতন্ত্র ডিগ্রিধারী কনসালটেন্ট।",
        "জটিল কেসগুলোতে একাধিক বিশেষজ্ঞ চিকিৎসকের সমন্বিত বোর্ড রিভিউ ও পরিকল্পনা।",
        "আন্তর্জাতিক মানদণ্ড ও আধুনিক চিকিৎসা গাইডলাইন অনুসারে সঠিক চিকিৎসা নিশ্চয়তা।",
      ],
      guarantee: "১০০% বিশেষজ্ঞ চিকিৎসকের পরামর্শ — কোনো অনুমাননির্ভর চিকিৎসা নয়",
    },
  },
  chamber: {
    en: {
      subtitle:
        "We designed our clinic from the ground up to replace medical anxiety with absolute calm, hygiene, and hospital-grade sterilization.",
      points: [
        "Class-B Vacuum Autoclaves operating at 134°C for 100% sterile and sealed dental instruments.",
        "Ergonomic memory-foam dental chairs designed to reduce back strain during longer appointments.",
        "Quiet acoustic design with soothing ambient lighting and spotless clinical hygiene protocols.",
      ],
      guarantee: "Strict European Class-B Sterilization Protocol for Every Patient",
    },
    bn: {
      subtitle:
        "রোগীর ভয় ও অস্বস্তি দূর করে একটি শান্ত, মনোরম ও আন্তর্জাতিক মানের স্বাস্থ্যকর পরিবেশ নিশ্চিত করতে আমাদের চেম্বারটি সাজানো।",
      points: [
        "১৩৪° সেলসিয়াস তাপমাত্রার ইউরোপীয় ক্লাস-বি ভ্যাকুয়াম অটোক্লেভ দ্বারা প্রতিটি ইন্সট্রুমেন্ট জীবাণুমুক্ত।",
        "দীর্ঘ চিকিৎসার সময়ও সর্বোচ্চ আরামের জন্য আরামদায়ক মেমোরি ফোম ডেন্টাল চেয়ার।",
        "শান্ত মনোরম পরিবেশ, আধুনিক ইন্টেরিয়র এবং সার্বক্ষণিক পরিচ্ছন্নতার নিশ্চয়তা।",
      ],
      guarantee: "প্রতিটি রোগীর জন্য কঠোর ইউরোপীয় ক্লাস-বি স্টেরিলাইজেশন প্রোটোকল",
    },
  },
  plans: {
    en: {
      subtitle:
        "We believe healthcare should have complete clarity. We show you the exact clinical condition and transparent costs before touching a tooth.",
      points: [
        "HD Intraoral camera display allows you to clearly see the exact dental condition on the monitor.",
        "Detailed written treatment plan with transparent itemized pricing — zero surprise bills.",
        "Comprehensive explanation of alternative treatment options with their pros and cons.",
      ],
      guarantee: "Full Cost & Clinical Transparency — Zero Hidden Charges",
    },
    bn: {
      subtitle:
        "আমরা বিশ্বাস করি চিকিৎসার প্রতিটি ধাপে স্বচ্ছতা জরুরি। চিকিৎসা শুরুর আগেই দাঁতের প্রকৃত অবস্থা ও খরচের স্পষ্ট ধারণা দেওয়া হয়।",
      points: [
        "এইচডি ইন্ট্রাওরাল ক্যামেরা ও ডিজিটাল ডিসপ্লেতে রোগী নিজেই তার দাঁতের সমস্যা সরাসরি দেখতে পারেন।",
        "চিকিৎসার লিখিত পরিকল্পনা ও নির্ধারিত ফি — কোনো লুকানো বা অপ্রত্যাশিত খরচ নেই।",
        "বিকল্প চিকিৎসা পদ্ধতির সুযোগ ও তার ভালো-মন্দ দিক বিস্তারিতভাবে বুঝিয়ে বলা হয়।",
      ],
      guarantee: "চিকিৎসা ও খরচে ১০০% স্বচ্ছতা — কোনো গোপন চার্জ নেই",
    },
  },
  booking: {
    en: {
      subtitle:
        "No endless phone calls or crowded waiting rooms. Our digital booking system respects your busy schedule with precision time slots.",
      points: [
        "Book online in under 2 minutes: select your doctor, select your preferred day, and confirm.",
        "Automated WhatsApp and SMS confirmation with full appointment details and location pin.",
        "Dedicated clinic coordinator on standby for rapid rescheduling or emergency support.",
      ],
      guarantee: "Guaranteed Dedicated Time Slot — Minimized Waiting Time",
    },
    bn: {
      subtitle:
        "বারবার ফোন করার ঝামেলা কিংবা চেম্বারে বসে ঘণ্টার পর ঘণ্টা অপেক্ষা করার দিন শেষ। ডিজিটাল পদ্ধতিতে দ্রুততম সময়ে সিরিয়াল নিন।",
      points: [
        "মাত্র ২ মিনিটে অনলাইন বুকিং: পছন্দের বিশেষজ্ঞ ও সুবিধাজনক দিন বেছে নিয়ে সহজেই বুক করুন।",
        "তাৎক্ষণিক হোয়াটসঅ্যাপ নিশ্চিতকরণ মেসেজ ও চেম্বার লোকেশন লিংক প্রাপ্তি।",
        "জরুরি সিরিয়াল পরিবর্তন বা যে কোনো তথ্যের জন্য সার্বক্ষণিক ডেডিকেটেড কোঅর্ডিনেটর সাপোর্ট।",
      ],
      guarantee: "নির্দিষ্ট সময়ে সিরিয়াল কনফার্মেশন — দীর্ঘ অপেক্ষার অবসান",
    },
  },
};

export function WhyChooseUs() {
  const { isBn } = useLanguage();
  const [liveCards, setLiveCards] = useState<WhyChooseCard[]>(DEFAULT_WHY_CHOOSE_CARDS);
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null);

  useEffect(() => {
    fetchLiveWhyChooseCards().then((cards) => {
      if (cards && cards.length > 0) setLiveCards(cards);
    });
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const icons = [UserCheck, Sparkles, FileText, CalendarCheck2];

  const items: CardItem[] = liveCards.map((c, idx) => {
    const staticItem = (UI_STRINGS.whyChooseUs.items as unknown as CardItem[])[idx] || {};
    return {
      id: c.id,
      tag: c.badge || staticItem.tag || { en: "Standard", bn: "মানদণ্ড" },
      stat: staticItem.stat || { en: `0${idx + 1}`, bn: `০${idx + 1}` },
      title: c.title || staticItem.title,
      desc: c.subtitle || staticItem.desc,
      highlights: {
        en: c.bullets?.map((b) => b.en) || staticItem.highlights?.en || [],
        bn: c.bullets?.map((b) => b.bn) || staticItem.highlights?.bn || [],
      },
      cta: staticItem.cta || { en: "Explore", bn: "বিস্তারিত" },
      ctaLink: staticItem.ctaLink || "/appointment",
      image: c.image || staticItem.image,
    };
  });

  const getExtendedDetails = (cardId: string) => {
    const card = liveCards.find((c) => c.id === cardId);
    if (!card) return EXTENDED_DETAILS[cardId];
    return {
      en: {
        subtitle: card.protocolSubtitle?.en || EXTENDED_DETAILS[cardId]?.en?.subtitle || "",
        points: card.protocolSteps?.map((s) => `${s.title.en}: ${s.detail.en}`) || EXTENDED_DETAILS[cardId]?.en?.points || [],
        guarantee: card.protocolGuarantees?.[0]?.en || EXTENDED_DETAILS[cardId]?.en?.guarantee || "",
      },
      bn: {
        subtitle: card.protocolSubtitle?.bn || EXTENDED_DETAILS[cardId]?.bn?.subtitle || "",
        points: card.protocolSteps?.map((s) => `${s.title.bn}: ${s.detail.bn}`) || EXTENDED_DETAILS[cardId]?.bn?.points || [],
        guarantee: card.protocolGuarantees?.[0]?.bn || EXTENDED_DETAILS[cardId]?.bn?.guarantee || "",
      },
    };
  };

  return (
    <section ref={sectionRef} className="relative w-full bg-[#F3F3F7] text-zinc-900">
      {/* Intro Header Section — Single-Line Prominent Headline */}
      <div className="pt-20 sm:pt-28 lg:pt-36 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 w-full max-w-[1700px] mx-auto text-center relative z-10">
        <h2 className="text-[clamp(1.35rem,3.9vw,4.5rem)] font-black text-zinc-950 tracking-tight leading-tight w-full max-w-none mx-auto whitespace-nowrap">
          {isBn ? UI_STRINGS.whyChooseUs.title.bn : UI_STRINGS.whyChooseUs.title.en}
        </h2>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-600 mt-4 sm:mt-6 max-w-4xl mx-auto font-normal leading-relaxed">
          {isBn ? UI_STRINGS.whyChooseUs.subtitle.bn : UI_STRINGS.whyChooseUs.subtitle.en}
        </p>
      </div>

      {/* The 4 Full-Bleed Stacking Cards — Cleaned Minimalist Design */}
      <div className="relative w-full">
        {items.map((item, index) => {
          const Icon = icons[index] || Sparkles;
          const isFirst = index === 0;

          return (
            <div
              key={item.id || index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              id={`clinical-card-${index}`}
              style={{
                zIndex: index + 10,
                backgroundColor: "#F3F3F7",
              }}
              className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden transition-all duration-300 bg-[#F3F3F7] ${
                !isFirst
                  ? "rounded-t-[36px] sm:rounded-t-[48px] shadow-[0_-20px_50px_rgba(0,0,0,0.06)] border-t border-zinc-200/80"
                  : ""
              }`}
            >
              {/* Centered Middle-Aligned Clean Card */}
              <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center">
                <div className="w-full rounded-3xl sm:rounded-[40px] bg-white border border-zinc-200/80 shadow-[0_16px_50px_rgba(0,0,0,0.06)] p-8 sm:p-12 md:p-16 text-center flex flex-col items-center relative transition-all duration-300">
                  {/* Icon Circle */}
                  <div className="p-4 rounded-2xl bg-zinc-950 text-white shadow-md mb-6">
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  {/* Main Title */}
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight mb-4 sm:mb-5">
                    {isBn ? item.title.bn : item.title.en}
                  </h3>

                  {/* Main Description */}
                  <p className="text-base sm:text-lg md:text-xl text-zinc-600 font-medium leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10">
                    {isBn ? item.desc.bn : item.desc.en}
                  </p>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    {item.ctaLink && (
                      <Link
                        href={item.ctaLink}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 hover:scale-[1.03]"
                      >
                        <span>
                          {item.cta
                            ? isBn
                              ? item.cta.bn
                              : item.cta.en
                            : isBn
                            ? "দেখুন"
                            : "Explore"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 font-semibold text-sm border border-zinc-200/80 transition-all duration-200 shadow-xs cursor-pointer"
                    >
                      <Info className="w-4 h-4 text-zinc-600" />
                      <span>{isBn ? "বিস্তারিত প্রোটোকল" : "Detailed Protocol"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Trust & Quality Assurance Bar */}
      <div className="relative z-30 p-6 sm:p-8 lg:p-10 bg-white border-t border-zinc-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-zinc-950 text-white shadow-sm flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-zinc-300" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-zinc-950">
                {isBn
                  ? "কেজিএইচ ক্লিনিক্যাল গ্যারান্টি ও নিরাপত্তা"
                  : "KGH Clinical Safety & Quality Guarantee"}
              </p>
              <p className="text-xs sm:text-sm text-zinc-500">
                {isBn
                  ? "আন্তর্জাতিক মেডিকেল স্ট্যান্ডার্ড মেনে প্রতিটি চিকিৎসা পরিচালিত হয়"
                  : "All procedures follow strict European sterilisation & digital diagnostic standards"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-zinc-700">
            <span className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200/70">
              ✓ {isBn ? "ক্লাস-বি অটোক্লেভ" : "Class-B Autoclave"}
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200/70">
              ✓ {isBn ? "ডিজিটাল ওপিজি এক্স-রে" : "Low-Dose Digital X-Ray"}
            </span>
            <span className="px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200/70">
              ✓ {isBn ? "স্বচ্ছ লিখিত ফি" : "Transparent Written Fee"}
            </span>
            <Link
              href="/appointment"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold transition-colors shadow-sm"
            >
              <span>{isBn ? "সিরিয়াল নিন" : "Book Consultation"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Detail Modal / Sheet */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-zinc-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Image */}
            <div className="relative h-48 sm:h-52 w-full bg-zinc-900 overflow-hidden">
              <img
                src={
                  selectedItem.image ||
                  "/images/why-choose-us/specialist-care.jpg"
                }
                alt={isBn ? selectedItem.title.bn : selectedItem.title.en}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/30 mb-2 inline-block">
                  {selectedItem.tag ? (isBn ? selectedItem.tag.bn : selectedItem.tag.en) : "Standard"}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isBn ? selectedItem.title.bn : selectedItem.title.en}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-sm font-medium text-zinc-700 leading-relaxed">
                  {getExtendedDetails(selectedItem.id)?.[isBn ? "bn" : "en"]
                    ?.subtitle ||
                    (isBn ? selectedItem.desc.bn : selectedItem.desc.en)}
                </p>
              </div>

              {/* Detailed Points */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  {isBn ? "আমাদের সুনির্দিষ্ট মানদণ্ড" : "Our Clinical Standard Points"}
                </h4>
                <div className="space-y-2.5">
                  {(
                    getExtendedDetails(selectedItem.id)?.[isBn ? "bn" : "en"]
                      ?.points ||
                    (selectedItem.highlights
                      ? isBn
                        ? selectedItem.highlights.bn
                        : selectedItem.highlights.en
                      : [])
                  ).map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-zinc-800 flex-shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantee Box */}
              {getExtendedDetails(selectedItem.id)?.[isBn ? "bn" : "en"]
                ?.guarantee && (
                <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-zinc-700 flex-shrink-0" />
                  <p className="text-xs font-semibold text-zinc-900">
                    {
                      getExtendedDetails(selectedItem.id)?.[isBn ? "bn" : "en"]
                        ?.guarantee
                    }
                  </p>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  {isBn ? "বন্ধ করুন" : "Close"}
                </button>
                <Link
                  href={selectedItem.ctaLink || "/appointment"}
                  onClick={() => setSelectedItem(null)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold tracking-wide shadow-md transition-all"
                >
                  <span>
                    {selectedItem.cta
                      ? isBn
                        ? selectedItem.cta.bn
                        : selectedItem.cta.en
                      : isBn
                      ? "সিরিয়াল নিন"
                      : "Book Now"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
