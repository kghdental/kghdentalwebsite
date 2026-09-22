"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Star,
  QrCode,
  Quote,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Heart,
  MessageSquareQuote,
} from "lucide-react";
import { REVIEWS } from "@/data/reviews";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { GoogleReview } from "@/types";
import { fetchLiveReviews } from "@/lib/api/db";

export function GoogleReviews() {
  const { t, isBn } = useLanguage();
  const { settings: clinicSettings } = useClinicSettings();
  const [reviewsList, setReviewsList] = useState<GoogleReview[]>(REVIEWS);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    fetchLiveReviews().then((live) => {
      if (live && live.length > 0) setReviewsList(live);
    });
  }, []);

  // Filter reviews by treatment category if selected
  const filteredReviews = reviewsList.filter((rev) => {
    if (activeCategory === "all") return true;
    if (!rev.treatment) return false;
    const treatEn = rev.treatment.en.toLowerCase();
    if (activeCategory === "implants") return treatEn.includes("crown") || treatEn.includes("implant");
    if (activeCategory === "aligners") return treatEn.includes("aligner") || treatEn.includes("ortho");
    if (activeCategory === "root-canal") return treatEn.includes("root canal") || treatEn.includes("endodontic");
    if (activeCategory === "surgery") return treatEn.includes("extraction") || treatEn.includes("surgery");
    if (activeCategory === "medicine") return treatEn.includes("medicine") || treatEn.includes("lesion") || treatEn.includes("ulcer");
    return true;
  });

  const totalReviews = filteredReviews.length;
  const currentReview = filteredReviews[activeIndex % totalReviews] || filteredReviews[0];

  // Navigation handlers
  const handleNext = useCallback(() => {
    setDirection("right");
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % totalReviews);
    setTimeout(() => setIsAnimating(false), 400);
  }, [totalReviews]);

  const handlePrev = useCallback(() => {
    setDirection("left");
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
    setTimeout(() => setIsAnimating(false), 400);
  }, [totalReviews]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || totalReviews <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, totalReviews, handleNext]);

  // Touch and drag swipe handling
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    touchStartXRef.current = clientX;
    touchStartYRef.current = clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - touchStartXRef.current;
    const deltaY = clientY - touchStartYRef.current;

    // Only swipe if horizontal drag was significantly larger than vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Category filter items
  const categories = [
    { id: "all", labelEn: "All Reviews", labelBn: "সকল রিভিউ" },
    { id: "implants", labelEn: "Implants & Crowns", labelBn: "ইমপ্ল্যান্ট ও ক্রাউন" },
    { id: "aligners", labelEn: "Clear Aligners", labelBn: "ক্লিয়ার অ্যালাইনার" },
    { id: "root-canal", labelEn: "Root Canal", labelBn: "রুট ক্যানেল" },
    { id: "surgery", labelEn: "Wisdom Surgery", labelBn: "সার্জারি" },
    { id: "medicine", labelEn: "Oral Medicine", labelBn: "ওরাল মেডিসিন" },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-zinc-50 via-zinc-100/60 to-zinc-50 border-b border-zinc-200/90 relative overflow-hidden select-none">
      {/* Subtle ambient lighting decorations */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-zinc-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 relative z-10">
        
        {/* Main Grid: Left (Fixed Google QR Card) & Right (Interactive Animated Showcase) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDE: Fixed Google Review QR Card (Sticky on desktop)               */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
            <div className="relative w-full bg-white rounded-3xl shadow-xl border border-zinc-200/90 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              
              {/* Minimalist Light Grey Accent Top Bar */}
              <div className="h-1.5 w-full bg-zinc-200 border-b border-zinc-300/40" />

              <div className="p-6 sm:p-7 text-center flex flex-col items-center">
                
                {/* Header Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-800 mb-3.5 shadow-2xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Google Reviews Verified</span>
                </div>

                {/* Big Score and Stars */}
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-zinc-950 tracking-tight">5.0</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs font-semibold text-zinc-600 mb-4">
                  {isBn ? "১০০% ভেরিফাইড সন্তুষ্ট রোগীর রেটিং" : "Based on verified patient consultations"}
                </p>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight mb-2">
                  {isBn ? "গুগলে আপনার অভিজ্ঞতা শেয়ার করুন" : "Leave Us a Google Review"}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-zinc-600 mb-5 leading-relaxed max-w-xs">
                  {isBn
                    ? "আপনার মূল্যবান অভিজ্ঞতা অন্যান্য রোগীদের সঠিক বিশেষজ্ঞ চিকিৎসায় আস্থা পেতে সাহায্য করে।"
                    : "Your authentic feedback guides new patients to experienced dental specialists."}
                </p>

                {/* Interactive QR Code Card */}
                <div className="relative p-3.5 bg-zinc-50 border border-zinc-200/90 rounded-2xl mb-5 shadow-inner group/qr">
                  <div className="relative overflow-hidden rounded-xl bg-white p-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        clinicSettings.googleReviewUrl || "https://g.page/r/kgh-dental-review"
                      )}`}
                      alt="Google Review QR Code"
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain mx-auto transition-transform duration-300 group-hover/qr:scale-105"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-700">
                    <QrCode className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{isBn ? "মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন" : "Scan with phone camera"}</span>
                  </div>
                </div>

                {/* Direct Action Link */}
                <a
                  href={clinicSettings.googleReviewUrl || "https://g.page/r/kgh-dental-review"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#2D3134] hover:bg-zinc-950 active:bg-black rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 group/btn"
                >
                  <span>{isBn ? "সরাসরি গুগল রিভিউ পেজ খুলুন" : "Open Google Review Link"}</span>
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </a>

                {/* Trust Guarantee */}
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{isBn ? "১০০% নিরাপদ ও ভেরিফাইড রিভিউ" : "Safe & verified patient channel"}</span>
                </div>

              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT SIDE: Interactive Animated Review Showcase (WOW Factor)            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-between">
            
            {/* Header & Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-bold text-zinc-800 mb-2.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? "রোগীদের সত্য অভিজ্ঞতা" : "Verified Patient Stories"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-950 tracking-tight leading-tight">
                  {isBn ? "রোগীদের মুখে আমাদের সেবার বাস্তব অনুভূতি" : "Real Smiles, Honest Reviews"}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 max-w-xl leading-relaxed">
                  {isBn
                    ? "আন্তর্জাতিক মানের চিকিৎসা ও অভিজ্ঞ বিশেষজ্ঞ চিকিৎসকদের নিবিড় সেবায় রোগীদের আস্থা ও ভালোবাসা।"
                    : "Genuine, unaltered feedback from patients treated across our multi-specialty clinical departments."}
                </p>
              </div>

              {/* Slider Play/Pause & Left/Right Controls */}
              <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-zinc-700" />
                      <span>{isBn ? "চালু" : "Play"}</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current text-zinc-700" />
                      <span>{isBn ? "পজ" : "Pause"}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Review"
                  className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-300 text-zinc-700 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Review"
                  className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-300 text-zinc-700 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Specialty Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setActiveIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#2D3134] text-white shadow-sm"
                        : "bg-zinc-100 border border-zinc-200/80 text-zinc-700 hover:bg-zinc-200/70"
                    }`}
                  >
                    {isBn ? cat.labelBn : cat.labelEn}
                  </button>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* HERO ACTIVE REVIEW CARD (Interactive Animated Showcase)                   */}
            {/* ========================================================================= */}
            <div
              className="relative bg-white rounded-3xl border border-zinc-200/90 shadow-xl hover:shadow-2xl transition-all duration-400 overflow-hidden cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
            >
              {/* Background ambient watermarks */}
              <div className="absolute -bottom-6 -right-6 text-zinc-100/90 pointer-events-none select-none">
                <Quote className="w-44 h-44 opacity-40 rotate-12" />
              </div>

              {/* Top Accent Strip */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-bold text-zinc-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{isBn ? "ভেরিফাইড চিকিৎসা পরামর্শ" : "Verified Clinical Consultation"}</span>
                  </span>
                  {currentReview?.treatment && (
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-700">
                      {t(currentReview.treatment)}
                    </span>
                  )}
                </div>

                {/* Star rating with numeric score */}
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(currentReview?.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-zinc-900 ml-1">5.0</span>
                </div>
              </div>

              {/* Main Review Quote Body */}
              <div className="p-6 sm:p-8 relative z-10 min-h-[170px] flex flex-col justify-center">
                <div className={`transition-all duration-300 transform ${
                  isAnimating
                    ? direction === "right"
                      ? "opacity-0 translate-x-4"
                      : "opacity-0 -translate-x-4"
                    : "opacity-100 translate-x-0"
                }`}>
                  <MessageSquareQuote className="w-8 h-8 text-zinc-400 mb-3" />
                  <p className="text-base sm:text-lg lg:text-xl font-medium text-zinc-800 leading-relaxed italic">
                    &ldquo;{t(currentReview?.comment || { en: "", bn: "" })}&rdquo;
                  </p>
                </div>
              </div>

              {/* Card Footer: Patient Profile, Date, and Google Badge */}
              <div className="px-6 sm:px-8 py-4 sm:py-5 bg-zinc-50/80 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Patient Avatar & Name */}
                <div className="flex items-center gap-3.5">
                  {/* Minimalist Light Grey Avatar with Initial */}
                  <div className="w-11 h-11 rounded-2xl bg-zinc-100 border border-zinc-200/90 flex items-center justify-center text-zinc-800 text-base font-extrabold shadow-2xs">
                    {currentReview?.authorName.charAt(0) || "P"}
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-zinc-950 flex items-center gap-1.5">
                      <span>{currentReview?.authorName}</span>
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      {currentReview?.treatment && <span>{t(currentReview.treatment)}</span>}
                      {currentReview?.treatment && <span>•</span>}
                      <span>{currentReview?.date}</span>
                    </div>
                  </div>
                </div>

                {/* Google Verified Review Chip */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Google Review</span>
                  </span>
                </div>

              </div>

              {/* Progress Bar for Autoplay */}
              {!isPaused && (
                <div className="w-full h-1 bg-zinc-100 overflow-hidden">
                  <div
                    key={activeIndex}
                    className="h-full bg-zinc-500"
                    style={{
                      animation: "progressBar 5.5s linear infinite",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quick-Jump Mini Reviews Strip */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredReviews.slice(0, 4).map((rev, idx) => {
                const isCurrent = idx === (activeIndex % totalReviews);
                return (
                  <button
                    key={rev.id}
                    type="button"
                    onClick={() => {
                      setDirection(idx > activeIndex ? "right" : "left");
                      setActiveIndex(idx);
                    }}
                    className={`p-2.5 rounded-2xl text-left transition-all duration-200 border cursor-pointer ${
                      isCurrent
                        ? "bg-white border-zinc-900 shadow-md ring-2 ring-zinc-900/10"
                        : "bg-white/60 border-zinc-200/80 hover:bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-zinc-900 truncate">
                        {rev.authorName}
                      </span>
                      <div className="flex text-amber-400">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">
                      {rev.treatment ? t(rev.treatment) : ""}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Bottom Pagination Indicators & Counter */}
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
              <div className="flex items-center gap-1.5">
                {filteredReviews.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setDirection(i > activeIndex ? "right" : "left");
                      setActiveIndex(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      i === (activeIndex % totalReviews)
                        ? "w-8 bg-[#2D3134] shadow-xs"
                        : "w-2 bg-zinc-300 hover:bg-zinc-400"
                    }`}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
                <span className="ml-2 text-[11px] font-bold text-zinc-800">
                  {String((activeIndex % totalReviews) + 1).padStart(2, "0")} / {String(totalReviews).padStart(2, "0")}
                </span>
              </div>

              {/* Trust Pills Strip */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{isBn ? "ব্যথামুক্ত ডেন্টিস্ট্রি" : "Painless Care"}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{isBn ? "রোগীবান্ধব সেবা" : "Patient-Centered"}</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

