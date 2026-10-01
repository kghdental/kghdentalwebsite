"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Award,
  GraduationCap,
  Building,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  X,
} from "lucide-react";
import { DOCTORS } from "@/data/doctors";
import { Doctor } from "@/types";
import { fetchLiveDoctors } from "@/lib/api/db";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";

const LOCAL_DOCTOR_IMAGES: Record<string, string> = {
  "dr-diean": "/images/doctors/dr-diean.jpg",
  "dr-sanwar": "/images/doctors/DR. MD. SANWAR HOSSAIN.png",
  "dr-fatema": "/images/doctors/dr-fatema.jpg",
  "dr-bappy": "/images/doctors/dr-Bappy.png",
  "dr-ratina": "/images/doctors/Dr Jesinta Islam.png",
  "dr-rifat": "/images/doctors/Dr Rifat Rahman.png",
  "dr-rafia": "/images/doctors/dr-rafia-nazneen.png",
  "dr-rafia-nazneen": "/images/doctors/dr-rafia-nazneen.png",
};

export default function DoctorsPage() {
  const { t, isBn } = useLanguage();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);
  const [highlightedDoctorId, setHighlightedDoctorId] = useState<string | null>(null);
  const didInitialScrollRef = useRef<boolean>(false);

  useEffect(() => {
    fetchLiveDoctors().then((docs) => {
      if (docs && docs.length > 0) {
        setDoctorsList(docs);
      }
    });
  }, []);

  // Precise scrolling helper that offsets sticky navbar height
  const scrollToDoctor = useCallback((targetIdOrSlug: string, smooth: boolean = true) => {
    if (!targetIdOrSlug || typeof window === "undefined") return;

    const normalized = targetIdOrSlug.toLowerCase().trim();
    // Match by ID or slug
    const matchedDoc = doctorsList.find(
      (d) =>
        d.id.toLowerCase() === normalized ||
        (d.slug && d.slug.toLowerCase() === normalized)
    );

    const targetId = matchedDoc ? matchedDoc.id : targetIdOrSlug;
    const element = document.getElementById(targetId);

    if (element) {
      setHighlightedDoctorId(targetId);

      // Account for sticky navigation header + jump bar
      const navOffset = 130;
      const elementRect = element.getBoundingClientRect();
      const absoluteTop = elementRect.top + window.pageYOffset;
      const targetScrollY = Math.max(0, absoluteTop - navOffset);

      window.scrollTo({
        top: targetScrollY,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [doctorsList]);

  // Extract doctor target from URL (hash or ?doctor= param)
  const getDoctorTargetFromUrl = useCallback(() => {
    if (typeof window === "undefined") return null;

    // 1. Check hash first (e.g. #dr-sanwar)
    const hash = window.location.hash.replace(/^#/, "").trim();
    if (hash) return hash;

    // 2. Check query param (e.g. ?doctor=dr-sanwar)
    const params = new URLSearchParams(window.location.search);
    const doctorParam = params.get("doctor");
    if (doctorParam) return doctorParam.trim();

    return null;
  }, []);

  // Auto-scroll on mount and whenever URL hash or search params change
  useEffect(() => {
    const handleUrlTarget = (smooth: boolean = true) => {
      const target = getDoctorTargetFromUrl();
      if (target) {
        scrollToDoctor(target, smooth);
      }
    };

    // Staggered execution to ensure DOM element is ready and hydrated
    const t1 = setTimeout(() => handleUrlTarget(false), 50);
    const t2 = setTimeout(() => handleUrlTarget(true), 250);
    const t3 = setTimeout(() => handleUrlTarget(true), 600);

    const onHashChange = () => handleUrlTarget(true);
    const onPopState = () => handleUrlTarget(true);

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, [getDoctorTargetFromUrl, scrollToDoctor, doctorsList]);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-14 sm:py-18">
        <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-4xl">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600">
              {isBn ? "ক্লিনিক্যাল প্যানেল" : "Specialist Dental Faculty"}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 mt-2 tracking-tight">
              {isBn ? "আমাদের বিশেষজ্ঞ ডাক্তারবৃন্দ" : "Meet Our Specialists"}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 mt-4 leading-relaxed max-w-3xl">
              {isBn
                ? "সাতজন বিশেষজ্ঞ। লক্ষ্য একটাই — আপনার ঠিক যে চিকিৎসাটা দরকার, সেটা দেবে সেই বিষয়ে সবচেয়ে দক্ষ মানুষটাই।"
                : "Seven specialists. One shared mission — to give you the exact care you need, from the person best trained to give it."}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Jump Specialist Bar */}
      <div className="sticky top-[68px] sm:top-[74px] z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 py-3 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 shadow-xs">
        <div className="w-full max-w-[2200px] mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline-flex">
            {isBn ? "সরাসরি দেখুন:" : "Jump to Doctor:"}
          </span>
          {doctorsList.map((d) => {
            const isSelected = highlightedDoctorId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.history.pushState(null, "", `#${d.id}`);
                  }
                  scrollToDoctor(d.id, true);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-zinc-950 text-white shadow-xs ring-2 ring-zinc-900"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black border border-zinc-200/60"
                }`}
              >
                {t(d.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      <section className="py-12 sm:py-20">
        <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-10">
          {doctorsList.map((doc) => {
            const isHighlighted = highlightedDoctorId === doc.id;

            return (
              <div
                key={doc.id}
                id={doc.id}
                className={`p-6 sm:p-8 rounded-3xl transition-all duration-500 scroll-mt-32 relative ${
                  isHighlighted
                    ? "bg-white border-2 border-indigo-600 ring-4 ring-indigo-500/20 shadow-2xl scale-[1.005]"
                    : "bg-zinc-50/70 border border-zinc-200 hover:border-zinc-300 shadow-2xs"
                }`}
              >
                {/* Active Focus Banner for Targeted Doctor */}
                {isHighlighted && (
                  <div className="mb-6 -mt-1 sm:-mt-2 p-3 sm:p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3 text-indigo-950 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                      </span>
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold">
                        {isBn
                          ? "নির্বাচিত বিশেষজ্ঞ চিকিৎসকের বিস্তারিত প্রোফাইল"
                          : "Viewing Selected Specialist Profile"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHighlightedDoctorId(null);
                        if (typeof window !== "undefined") {
                          window.history.replaceState(null, "", window.location.pathname);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-950 hover:underline cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isBn ? "হাইলাইট সরান" : "Dismiss"}</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Doctor Avatar Column */}
                  <div className="lg:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div
                      className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-zinc-200 border-2 shadow-md transition-all ${
                        isHighlighted
                          ? "border-indigo-500 ring-2 ring-indigo-200 shadow-lg"
                          : "border-zinc-300"
                      }`}
                    >
                      <img
                        src={doc.photoUrl || LOCAL_DOCTOR_IMAGES[doc.id] || "/images/doctors/dr-diean.jpg"}
                        alt={t(doc.name)}
                        loading="eager"
                        decoding="async"
                        onError={(e) => {
                          const fallback = LOCAL_DOCTOR_IMAGES[doc.id] || "/images/doctors/dr-diean.jpg";
                          if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-full h-full object-cover object-top"
                      />
                      {doc.isConfirmed && (
                        <span className="absolute bottom-2.5 right-2.5 p-1.5 bg-zinc-950 text-white rounded-lg shadow-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>

                    <div className="mt-4 w-full">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 transition-colors ${
                          isHighlighted
                            ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                            : "bg-zinc-200 text-zinc-800"
                        }`}
                      >
                        {t(doc.specialty)}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-950">
                        {t(doc.name)}
                      </h2>
                      <p className="text-xs font-semibold text-zinc-600 mt-1">
                        {t(doc.degrees)}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Bio & Schedule Details */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Designation & Institutions */}
                    {(doc.designation || doc.institution) && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-700 bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-2xs">
                        {doc.designation && (
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Award className="w-4 h-4 text-zinc-900 shrink-0" />
                            <span>{t(doc.designation)}</span>
                          </div>
                        )}
                        {doc.institution && (
                          <div className="flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>{t(doc.institution)}</span>
                          </div>
                        )}
                        {doc.bmdcReg && (
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0" />
                            <span>BMDC: {doc.bmdcReg}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Biography */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        {isBn ? "পেশাগত বিবরণী" : "Professional Biography"}
                      </h3>
                      <p className="text-sm text-zinc-700 leading-relaxed">
                        {t(doc.bio)}
                      </p>
                    </div>

                    {/* Specialized Training & Clinical Experience */}
                    {doc.experience && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-zinc-800">
                        <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-zinc-900 block mb-0.5">
                            {isBn ? "উচ্চতর প্রশিক্ষণ ও ক্লিনিক্যাল অভিজ্ঞতা" : "Advanced Training & Clinical Expertise"}
                          </span>
                          <span className="text-zinc-700 leading-relaxed font-medium">{t(doc.experience)}</span>
                        </div>
                      </div>
                    )}

                    {/* Chamber Availability Box */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#474B4E] text-white space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-300" />
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                            {isBn ? "কেজিএইচ ডেন্টাল চেম্বার সময়সূচি" : "KGH Dental Chamber Schedule"}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-200 bg-black/20 px-2.5 py-1 rounded-md">
                          {isBn ? "৩০ মিনিট স্লট" : "30-Min Interval"}
                        </span>
                      </div>

                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span>{isBn ? doc.schedule.availableDaysBn : doc.schedule.availableDaysEn}</span>
                      </div>

                      <p className="text-xs text-zinc-300">
                        {t(doc.schedule.note)}
                      </p>
                    </div>

                    {/* Book Button */}
                    <div className="pt-2">
                      <Link
                        href={`/appointment?doctor=${doc.id}`}
                        className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#474B4E] hover:bg-[#373a3c] active:bg-[#2b2d2f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-98"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>{isBn ? "এই ডাক্তারের সিরিয়াল বুক করুন" : "Book Consultation with Doctor"}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}

