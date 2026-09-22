"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Image as ImageIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  MoveHorizontal,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import {
  fetchLiveGalleryItems,
  fetchLiveBeforeAfterItems,
  INITIAL_GALLERY,
  INITIAL_BEFORE_AFTER,
} from "@/lib/api/db";
import { GalleryItem, BeforeAfterItem } from "@/types";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";

export default function GalleryPage() {
  const { isBn } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [beforeAfterItems, setBeforeAfterItems] =
    useState<BeforeAfterItem[]>(INITIAL_BEFORE_AFTER);

  // Lightbox Modal state
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<BeforeAfterItem | null>(null);

  // Carousel ref for Before & After
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLiveGalleryItems().then((items) => {
      if (items && items.length > 0) {
        setGalleryItems(items);
      }
    });

    fetchLiveBeforeAfterItems().then((items) => {
      if (items && items.length > 0) {
        setBeforeAfterItems(items);
      }
    });
  }, []);

  const categories = [
    { id: "all", label: { en: "All", bn: "সকল ছবি" } },
    { id: "clinic", label: { en: "Clinic", bn: "ক্লিনিক ও চিকিৎসা" } },
    { id: "team", label: { en: "Team", bn: "আমাদের টিম" } },
  ];

  const filteredGallery =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => {
          if (activeCategory === "clinic") {
            return (
              item.category === "clinic" ||
              item.category === "chamber" ||
              item.category === "treatments" ||
              item.category === "sterilization"
            );
          }
          return item.category === activeCategory;
        });

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2eb] text-zinc-900 transition-colors">
      {/* ============================================================================== */}
      {/* SECTION 1: CHAMBER & TEAM (Matched to Reference Screenshot) */}
      {/* ============================================================================== */}
      <section className="pt-12 sm:pt-16 pb-14 sm:pb-20">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-[#fae8b4] text-[#8c6514] text-[11px] font-black tracking-widest uppercase">
              {isBn ? "ফটোজ" : "PHOTOS"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight">
              {isBn ? "চেম্বার ও টিম" : "Chamber & Team"}
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 font-medium">
              {isBn
                ? "আমাদের ক্লিনিক, আধুনিক চিকিৎসা ব্যবস্থা এবং ডেডিকেটেড টিম।"
                : "Photos of our clinic and our team."}
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#1c362b] text-white shadow-sm"
                        : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {isBn ? cat.label.bn : cat.label.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid (4 columns like reference) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedPhoto(item)}
                className="group rounded-2xl bg-white border border-zinc-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Photo Container */}
                <div className="relative aspect-4/3 w-full bg-zinc-900 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={isBn ? item.title.bn : item.title.en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-2 rounded-full text-zinc-900 shadow-md">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Caption Bar */}
                <div className="p-3.5 sm:p-4 bg-white flex-1 flex flex-col justify-center">
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-[#1c362b] transition-colors">
                    {isBn ? item.title.bn : item.title.en}
                  </h3>
                  {item.desc && (
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                      {isBn ? item.desc.bn : item.desc.en}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* SECTION 2: BEFORE & AFTER (Matched to Reference Screenshot) */}
      {/* ============================================================================== */}
      <section className="py-14 sm:py-20 border-t border-zinc-200/60 bg-[#eeeade]">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#fae8b4] text-[#8c6514] text-[11px] font-black tracking-widest uppercase">
                {isBn ? "ফলাফল" : "RESULTS"}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight">
                {isBn ? "চিকিৎসার পূর্ব ও পরবর্তী ফলাফল" : "Before & After"}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 font-medium">
                {isBn
                  ? "ডানে বা বামে টেনে তুলনা করুন — আমাদের রোগীদের বাস্তব ক্লিনিক্যাল ফলাফল।"
                  : "Drag left or right to browse — real results from our patients."}
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => scrollCarousel("left")}
                aria-label="Previous results"
                className="w-10 h-10 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-800 shadow-xs cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                aria-label="Next results"
                className="w-10 h-10 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-800 shadow-xs cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Draggable / Scrollable Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {beforeAfterItems.map((item) => (
              <div
                key={item.id}
                className="w-[300px] sm:w-[380px] lg:w-[420px] shrink-0 snap-start"
              >
                <BeforeAfterSlider
                  item={item}
                  isBn={isBn}
                  onViewDetails={(caseItem) => setSelectedCase(caseItem)}
                />
              </div>
            ))}
          </div>

          {/* Clinical Assurance Note */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-zinc-200/80 text-zinc-700 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                {isBn
                  ? "সকল ছবি আমাদের রোগীদের সম্মতিক্রমে এবং কেজিএইচ ডেন্টাল ক্লিনিকে সম্পন্ন বাস্তব চিকিৎসা থেকে গৃহীত।"
                  : "All clinical photographs are published with patient consent and reflect actual procedures performed at KGH Dental."}
              </span>
            </div>
            <a
              href="/appointment"
              className="inline-flex items-center gap-1.5 font-bold text-[#1c362b] hover:underline"
            >
              <span>{isBn ? "পরামর্শের জন্য সিরিয়াল নিন" : "Book a Consultation"}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* SECTION 3: VIDEO WALKTHROUGH & SOCIAL HIGHLIGHTS */}
      {/* ============================================================================== */}
      <section className="py-12 bg-white border-t border-zinc-200">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#1c362b] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-emerald-200">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isBn ? "ভিডিও সফর" : "Video Walkthrough"}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn
                  ? "কেজিএইচ ডেন্টালের ভিডিও ট্যুর ও কেস স্টাডিজ"
                  : "Chamber Video Tour & Patient Stories"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                {isBn
                  ? "আমাদের অফিসিয়াল ফেসবুক ও ইউটিউব চ্যানেলে চেম্বারের ভিডিও, চিকিৎসা পদ্ধতি ও ওরাল হেলথ টিপস দেখুন।"
                  : "Watch detailed procedure explanations, patient recovery journeys, and clinic walk-throughs on our official social channel."}
              </p>
            </div>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors shrink-0"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              <span>{isBn ? "ফেসবুকে ভিডিও দেখুন" : "Watch Videos on Facebook"}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* PHOTO LIGHTBOX MODAL */}
      {/* ============================================================================== */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 text-white">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[75vh] w-full flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.imageUrl}
                alt={isBn ? selectedPhoto.title.bn : selectedPhoto.title.en}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-zinc-900 border-t border-zinc-800">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                {selectedPhoto.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {isBn ? selectedPhoto.title.bn : selectedPhoto.title.en}
              </h3>
              {selectedPhoto.desc && (
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed">
                  {isBn ? selectedPhoto.desc.bn : selectedPhoto.desc.en}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* BEFORE & AFTER CASE DETAIL MODAL */}
      {/* ============================================================================== */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 text-zinc-900 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                  {selectedCase.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 mt-1">
                  {isBn ? selectedCase.title.bn : selectedCase.title.en}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side-by-side or interactive slider inside modal */}
            <div className="space-y-4">
              <BeforeAfterSlider item={selectedCase} isBn={isBn} />
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl overflow-hidden border border-zinc-200">
                  <div className="bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-700">
                    BEFORE (চিকিৎসার পূর্বে)
                  </div>
                  <img
                    src={selectedCase.beforeImageUrl}
                    alt="Before"
                    className="w-full aspect-4/3 object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-zinc-200">
                  <div className="bg-zinc-100 px-3 py-1.5 text-[11px] font-bold text-zinc-700">
                    AFTER (চিকিৎসার পরে)
                  </div>
                  <img
                    src={selectedCase.afterImageUrl}
                    alt="After"
                    className="w-full aspect-4/3 object-cover"
                  />
                </div>
              </div>
            </div>

            {selectedCase.desc && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  {isBn ? "ক্লিনিক্যাল বিবরণ ও পদ্ধতি" : "Clinical Case Notes"}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  {isBn ? selectedCase.desc.bn : selectedCase.desc.en}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 cursor-pointer"
              >
                {isBn ? "বন্ধ করুন" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CtaBanner />
    </div>
  );
}
