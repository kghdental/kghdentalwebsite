"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { DOCTORS } from "@/data/doctors";
import { Doctor } from "@/types";
import { fetchLiveDoctors } from "@/lib/api/db";
import { useLanguage } from "@/context/LanguageContext";

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

// Global image cache to keep pre-decoded Image objects alive in memory across scroll and route navigation
const globalImageCache: Record<string, HTMLImageElement> = {};

function preloadDoctorImages() {
  if (typeof window === "undefined") return;
  Object.entries(LOCAL_DOCTOR_IMAGES).forEach(([id, src]) => {
    if (!globalImageCache[id]) {
      const img = new window.Image();
      img.src = src;
      globalImageCache[id] = img;
    }
  });
}

// Immediately initiate preload when module loads in client
if (typeof window !== "undefined") {
  preloadDoctorImages();
}

export function DoctorPreview() {
  const { t, isBn } = useLanguage();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);
  const [isInView, setIsInView] = useState<boolean>(true);

  // Preload all images on component mount as well
  useEffect(() => {
    preloadDoctorImages();
  }, []);

  // Repeat array 5 times to form a robust, perfectly seamless circular track that never runs out of cards
  const REPEAT_COUNT = 5;
  const extendedDoctors = useMemo(() => {
    return Array.from({ length: REPEAT_COUNT }, () => doctorsList).flat();
  }, [doctorsList]);
  const baseCount = doctorsList.length;

  // Start with middle set (Set 2, index = baseCount * 2) so cards are guaranteed on both left and right
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(baseCount * 2);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const boundaryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with Supabase only if data actually changes
  useEffect(() => {
    fetchLiveDoctors().then((docs) => {
      if (docs && docs.length > 0) {
        // Compare IDs to avoid redundant re-renders
        const sameDocs =
          docs.length === DOCTORS.length &&
          docs.every((d, i) => d.id === DOCTORS[i]?.id);
        if (!sameDocs) {
          setDoctorsList(docs);
        }
      }
    });
  }, []);

  // IntersectionObserver: Pause auto-play when section is not visible in viewport (prevents image purge & background thrashing)
  useEffect(() => {
    if (!sectionRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Stop auto-slide when browser tab is hidden to prevent accumulated state drifts
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Measure container width with resize observer for responsive accuracy
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setContainerWidth((prev) => (prev !== w ? w : prev));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Determine card width based on screen width
  const is3xl = containerWidth >= 2100;
  const is2xl = containerWidth >= 1650 && containerWidth < 2100;
  const isXl = containerWidth >= 1250 && containerWidth < 1650;
  const isDesktop = containerWidth >= 960 && containerWidth < 1250;
  const isTablet = containerWidth >= 640 && containerWidth < 960;
  const visibleCards = is3xl ? 7 : is2xl ? 5.8 : isXl ? 4.8 : isDesktop ? 3.8 : isTablet ? 2.5 : 1.25;
  const gap = is3xl ? 24 : is2xl ? 22 : isXl ? 20 : isDesktop ? 18 : isTablet ? 16 : 12;
  const cardWidth = Math.max(
    200,
    (containerWidth - (Math.floor(visibleCards) - 1) * gap) / visibleCards
  );

  // Normalization logic: keep activeTrackIndex safely within the middle set [baseCount * 2, baseCount * 3 - 1]
  const normalizeBoundary = useCallback(() => {
    if (baseCount === 0) return;
    setActiveTrackIndex((curr) => {
      if (curr >= baseCount * 3) {
        setIsTransitioning(false);
        return curr - baseCount;
      } else if (curr < baseCount * 2) {
        setIsTransitioning(false);
        return curr + baseCount;
      }
      return curr;
    });
  }, [baseCount]);

  // Seamless infinite track reset when reaching boundaries
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // CRITICAL: Only handle transitions on the track container itself, ignore bubbling child card transitions!
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "transform") return;
    normalizeBoundary();
  };

  // Safe timeout fallback in case browser suppresses or cancels transitionend event
  const scheduleBoundaryReset = useCallback(() => {
    if (boundaryTimerRef.current) clearTimeout(boundaryTimerRef.current);
    boundaryTimerRef.current = setTimeout(() => {
      normalizeBoundary();
    }, 580);
  }, [normalizeBoundary]);

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setActiveTrackIndex((prev) => prev + 1);
    scheduleBoundaryReset();
  }, [scheduleBoundaryReset]);

  const handlePrev = useCallback(() => {
    setIsTransitioning(true);
    setActiveTrackIndex((prev) => prev - 1);
    scheduleBoundaryReset();
  }, [scheduleBoundaryReset]);

  // Absolute fail-safe watchdog: if activeTrackIndex somehow drifts beyond safe bounds, normalize immediately
  useEffect(() => {
    if (baseCount === 0) return;
    if (activeTrackIndex >= baseCount * 4 || activeTrackIndex < baseCount) {
      const normalized = baseCount * 2 + ((((activeTrackIndex % baseCount) + baseCount) % baseCount));
      setIsTransitioning(false);
      setActiveTrackIndex(normalized);
    }
  }, [activeTrackIndex, baseCount]);

  // Auto-slide round-robin right-to-left every 4.5s (ONLY when in viewport and not paused)
  useEffect(() => {
    if (isPaused || isDragging || !isInView || baseCount === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDragging, isInView, baseCount, handleNext]);

  // Touch & Mouse Drag handlers for smooth tactile swipe
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartYRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const pointerIdRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    pointerIdRef.current = e.pointerId;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const deltaX = currentX - dragStartXRef.current;
    const deltaY = currentY - dragStartYRef.current;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Yield immediately to native vertical page scrolling when gesture is vertical
    if (!hasMovedRef.current) {
      if (absY > 6 || absY >= absX) {
        isDraggingRef.current = false;
        setIsDragging(false);
        setDragOffset(0);
        try {
          if (
            pointerIdRef.current !== null &&
            (e.currentTarget as HTMLElement).hasPointerCapture(pointerIdRef.current)
          ) {
            (e.currentTarget as HTMLElement).releasePointerCapture(pointerIdRef.current);
          }
        } catch {
          // ignore
        }
        return;
      }
    }

    // Only engage carousel horizontal drag when the movement is decisively horizontal
    if (absX > 14 && absX > absY * 1.5) {
      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        setIsDragging(true);
        setIsTransitioning(false);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
      setDragOffset(deltaX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const didMove = hasMovedRef.current;
    const currentOffset = dragOffset;

    isDraggingRef.current = false;
    setIsDragging(false);
    setIsTransitioning(true);
    setDragOffset(0);

    try {
      if (
        pointerIdRef.current !== null &&
        (e.currentTarget as HTMLElement).hasPointerCapture(pointerIdRef.current)
      ) {
        (e.currentTarget as HTMLElement).releasePointerCapture(pointerIdRef.current);
      }
    } catch {
      // ignore
    }

    if (didMove) {
      if (currentOffset < -35) {
        handleNext();
      } else if (currentOffset > 35) {
        handlePrev();
      }

      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    } else {
      hasMovedRef.current = false;
    }
  };

  // Calculate translateX to keep activeTrackIndex centered
  const centerOffset = (containerWidth - cardWidth) / 2;
  const baseTranslate = -(activeTrackIndex * (cardWidth + gap)) + centerOffset;
  const currentTranslate = baseTranslate + dragOffset;

  // Active doctor normalized index (0 to baseCount - 1)
  const currentDoctorIndex = baseCount > 0 ? activeTrackIndex % baseCount : 0;

  return (
    <section
      ref={sectionRef}
      id="specialist-team"
      className="py-12 sm:py-16 lg:py-20 bg-[#E9E8F0] text-zinc-900 border-b border-zinc-300/80 overflow-hidden select-none relative"
    >
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        
        {/* Top Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div className="max-w-3xl">
            {/* Category Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-zinc-300/80 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-800 mb-3 shadow-2xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isBn ? "অভিজ্ঞ চিকিৎসকগণ" : "Specialist Doctors"}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.14]">
              {isBn
                ? "বিশেষজ্ঞ চিকিৎসকদের তত্ত্বাবধানে পূর্ণাঙ্গ ও নির্ভরযোগ্য ডেন্টাল কেয়ার।"
                : "Comprehensive, specialist-led dental care across the full spectrum of oral health."}
            </h2>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-700 mt-2.5 font-normal max-w-2xl leading-relaxed">
              {isBn
                ? "নিবেদিতপ্রাণ বিশেষজ্ঞ চিকিৎসক দল, লক্ষ্য একটাই — আপনার হাসির সুরক্ষা ও নিখুঁত চিকিৎসা।"
                : "Dedicated specialists with one shared commitment to your smile. Every department is led by a doctor trained specifically in that field."}
            </p>

            {/* Left Button */}
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2D3134] hover:bg-zinc-900 active:bg-black text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 active:scale-98 group"
              >
                <span>{isBn ? "সকল বিশেষজ্ঞ চিকিৎসকদের তালিকা" : "View All Specialists"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Header Controls: Pause/Play & Left/Right Chevrons */}
          <div className="flex items-center gap-2 self-start lg:self-end">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-300/80 bg-white/80 hover:bg-white text-zinc-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95 backdrop-blur-sm"
              title={isPaused ? "Play auto-sliding" : "Pause auto-sliding"}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-zinc-800" />
                  <span>{isBn ? "চালু করুন" : "Play"}</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current text-zinc-800" />
                  <span>{isBn ? "পজ করুন" : "Pause"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Doctor"
              className="p-2 rounded-xl border border-zinc-300/80 bg-white/80 hover:bg-white text-zinc-800 transition-all shadow-2xs cursor-pointer active:scale-95 backdrop-blur-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Doctor"
              className="p-2 rounded-xl border border-zinc-300/80 bg-white/80 hover:bg-white text-zinc-800 transition-all shadow-2xs cursor-pointer active:scale-95 backdrop-blur-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Continuous Smooth Circular Sliding Carousel Track */}
        <div
          ref={containerRef}
          style={{ touchAction: "pan-y" }}
          className="relative w-full overflow-hidden pt-2 pb-6 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="flex items-start"
            style={{
              transform: `translate3d(${currentTranslate}px, 0, 0)`,
              willChange: isTransitioning || isDragging ? "transform" : "auto",
              transition: isTransitioning
                ? "transform 550ms cubic-bezier(0.25, 1, 0.5, 1)"
                : "none",
              gap: `${gap}px`,
              touchAction: "pan-y",
              backfaceVisibility: "hidden",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedDoctors.map((doc, idx) => {
              const isActive = idx === activeTrackIndex;
              const photoSrc = LOCAL_DOCTOR_IMAGES[doc.id] || doc.photoUrl || "/images/doctors/dr-diean.jpg";

              return (
                <div
                  key={`doc-${idx}-${doc.id}`}
                  style={{ width: `${cardWidth}px` }}
                  onClick={() => {
                    if (isActive || hasMovedRef.current) return;
                    setIsTransitioning(true);
                    setActiveTrackIndex(idx);
                    scheduleBoundaryReset();
                  }}
                  className={`shrink-0 flex flex-col select-none transition-all duration-300 ${
                    isActive
                      ? "bg-white rounded-2xl border border-zinc-200/90 shadow-2xl ring-4 ring-black/5 overflow-hidden z-20"
                      : "group cursor-pointer opacity-90 hover:opacity-100"
                  }`}
                >
                  {/* Top Eyebrow Bar (Only shown on active card) */}
                  {isActive ? (
                    <div className="px-3.5 py-2.5 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-800 animate-in fade-in duration-200">
                      <span className="uppercase tracking-wider flex items-center gap-1 text-zinc-900">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{isBn ? "বিশেষজ্ঞ" : "Specialist"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 bg-white px-2 py-0.5 rounded-full border border-zinc-200 shadow-2xs shrink-0">
                        <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">
                          {isBn ? doc.schedule.availableDaysBn : doc.schedule.availableDaysEn}
                        </span>
                      </span>
                    </div>
                  ) : null}

                  {/* Doctor Photo - Persistent 4/3 Aspect Ratio Container that NEVER unmounts image */}
                  <div
                    className={`relative w-full aspect-[4/3] bg-zinc-100 overflow-hidden ${
                      isActive
                        ? "border-b border-zinc-100"
                        : "rounded-2xl border border-zinc-300/80 group-hover:border-zinc-500 group-hover:shadow-xl shadow-2xs transition-all duration-300"
                    }`}
                  >
                    <img
                      src={photoSrc}
                      alt={t(doc.name)}
                      draggable={false}
                      loading="eager"
                      decoding="sync"
                      className={`w-full h-full object-cover object-top select-none pointer-events-none transition-transform duration-400 ${
                        !isActive ? "group-hover:scale-104 opacity-95 group-hover:opacity-100" : ""
                      }`}
                    />

                    {/* Badge Overlay */}
                    {isActive && doc.designation ? (
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-zinc-900 shadow-xs border border-white/60">
                        {t(doc.designation)}
                      </div>
                    ) : null}

                    {!isActive ? (
                      <>
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none" />
                        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center justify-center border border-white/20 shadow-xs pointer-events-none">
                          {(idx % baseCount) + 1}
                        </div>
                      </>
                    ) : null}
                  </div>

                  {/* Bottom Content Area */}
                  {isActive ? (
                    <div className="p-4 flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 tracking-tight leading-snug line-clamp-2">
                          {t(doc.specialty)}
                        </h3>

                        <Link
                          href={`/doctors?doctor=${doc.id}#${doc.id}`}
                          className="hover:text-indigo-600 transition-colors inline-block"
                        >
                          <h4 className="text-xs sm:text-sm font-bold text-zinc-800 mt-1 mb-1">
                            {t(doc.name)}
                          </h4>
                        </Link>

                        <p className="text-[11px] font-semibold text-zinc-600 mb-2 line-clamp-1">
                          {t(doc.degrees)}
                        </p>

                        <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-3 mb-4 font-normal">
                          {t(doc.bio)}
                        </p>
                      </div>

                      {/* Action Buttons: "View Profile" + "Book Serial" */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <Link
                          href={`/doctors?doctor=${doc.id}#${doc.id}`}
                          onClick={(e) => {
                            if (hasMovedRef.current) e.preventDefault();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#2D3134] hover:bg-zinc-900 active:bg-black text-white text-[11px] font-bold shadow-xs hover:shadow-md transition-all active:scale-98 group shrink-0"
                        >
                          <span>{isBn ? "প্রোফাইল" : "View Profile"}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link
                          href={`/appointment?doctor=${doc.id}`}
                          onClick={(e) => {
                            if (hasMovedRef.current) e.preventDefault();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[11px] font-bold transition-all active:scale-98 shrink-0"
                        >
                          <Calendar className="w-3 h-3 text-zinc-600" />
                          <span>{isBn ? "বুকিং" : "Book Serial"}</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2.5 px-1">
                      <p className="text-xs font-bold text-zinc-900 group-hover:text-black transition-colors line-clamp-1">
                        {t(doc.name)}
                      </p>
                      <p className="text-[11px] text-zinc-600 font-medium line-clamp-1 mt-0.5">
                        {t(doc.specialty)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Pagination & Navigation Guide */}
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-700">
          {/* Round-Robin Indicators */}
          <div className="flex items-center gap-1.5">
            {doctorsList.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIsTransitioning(true);
                  const diff = i - currentDoctorIndex;
                  setActiveTrackIndex((prev) => prev + diff);
                  scheduleBoundaryReset();
                }}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentDoctorIndex
                    ? "w-7 bg-zinc-900 shadow-xs"
                    : "w-2 bg-zinc-400/60 hover:bg-zinc-500"
                }`}
                aria-label={`Go to doctor ${i + 1}`}
              />
            ))}
            <span className="ml-2 text-[11px] font-medium text-zinc-700">
              {currentDoctorIndex + 1} / {baseCount}
            </span>
          </div>

          <Link
            href="/doctors"
            className="font-semibold text-zinc-800 hover:text-black hover:underline inline-flex items-center gap-1 ml-auto"
          >
            <span>{isBn ? "সকল ডাক্তারের পূর্ণাঙ্গ শিডিউল" : "Complete Doctor Schedules"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
