"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, ChevronDown, ChevronUp, ChevronsDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { UI_STRINGS } from "@/data/translations";

type Position = "left" | "center" | "right";

interface StageContent {
  image: string;
  position: Position;
  mainText: { en: string; bn: string };
  differential?: { en: string; bn: string };
  callout?: { en: string; bn: string };
}

const STAGES: StageContent[] = [
  {
    image: "/images/hero/stage-1-healthy.webp",
    position: "center",
    mainText: {
      en: "Healthy teeth looks like this.",
      bn: "সুস্থ ও পরিচ্ছন্ন দাঁতের স্বাভাবিক রূপ।",
    },
    differential: {
      en: "But every smile faces different challenges — and needs different experts.",
      bn: "কিন্তু প্রতিটি দাঁতের সমস্যার জন্য প্রয়োজন আলাদা বিশেষজ্ঞ।",
    },
  },
  {
    image: "/images/hero/stage-2-endo.webp",
    position: "left",
    mainText: {
      en: "A hidden cavity, quietly turning into pain.",
      bn: "দাঁতের ক্ষয় বা ক্যাভিটি, যা নীরবে তীব্র ব্যথায় রূপ নেয়।",
    },
    differential: {
      en: "An Endodontist can save this tooth.",
      bn: "একজন এন্ডোডন্টিস্ট দাঁতটি বাঁচাতে পারেন।",
    },
    callout: { en: "Cavity", bn: "দাঁতের ক্ষয়" },
  },
  {
    image: "/images/hero/stage-3-maxillo.webp",
    position: "right",
    mainText: {
      en: "A deep infection, silently damaging the tooth and bone beneath.",
      bn: "দাঁতের গোড়ায় গভীর ইনফেকশন, যা নীরবে চোয়ালের হাড়ের ক্ষতি করে।",
    },
    differential: {
      en: "See an Oral & Maxillofacial Surgeon — without delay.",
      bn: "দেরি না করে ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জনের পরামর্শ নিন।",
    },
    callout: { en: "Abscess", bn: "অ্যাবসেস (পুঁজ ও তীব্র ফোলা)" },
  },
  {
    image: "/images/hero/stage-4-prostho.webp",
    position: "center",
    mainText: {
      en: "A missing tooth is more than just a gap.",
      bn: "দাঁত না থাকা শুধু ফাঁকা জায়গার চেয়েও বেশি অসুবিধা তৈরি করে।",
    },
    differential: {
      en: "A Prosthodontist solves exactly this.",
      bn: "একজন প্রস্থোডন্টিস্ট ঠিক এটারই সমাধান করেন।",
    },
    callout: { en: "Implant", bn: "ডেন্টাল ইমপ্ল্যান্ট" },
  },
  {
    image: "/images/hero/stage-5-ortho.webp",
    position: "left",
    mainText: {
      en: "Crooked or crowded teeth affect more than your smile.",
      bn: "আঁকাবাঁকা দাঁত হাসির সৌন্দর্য ছাড়াও আরও বেশ কিছু সমস্যা সৃষ্টি করে।",
    },
    differential: {
      en: "An Orthodontist aligns it into a confident smile.",
      bn: "একজন অর্থোডন্টিস্ট দাঁত সারিবদ্ধ করে আত্মবিশ্বাসী হাসি ফিরিয়ে দেন।",
    },
    callout: { en: "Crowding", bn: "গাদাগাদি দাঁত" },
  },
  {
    image: "/images/hero/stage-6-perio.webp",
    position: "right",
    mainText: {
      en: "When the gums pull back, the tooth loses its foundation.",
      bn: "মাড়ি সরে গেলে দাঁত ধীরে ধীরে তার মূল ভিত্তি হারায়।",
    },
    differential: {
      en: "A Periodontist protects your tooth's foundation.",
      bn: "একজন পেরিওডন্টিস্ট দাঁতের ভিত্তি রক্ষা করেন।",
    },
    callout: { en: "Gum Recession", bn: "মাড়ি সরে যাওয়া" },
  },
  {
    image: "/images/hero/stage-7-oral-medicine.webp",
    position: "center",
    mainText: {
      en: "Unusual patches or sores in the mouth are never just ‘nothing’.",
      bn: "মুখের ভেতরে দীর্ঘস্থায়ী অস্বাভাবিক দাগ বা ঘা কখনোই অবহেলা করার মতো নয়।",
    },
    differential: {
      en: "Get it checked early by an Oral Medicine specialist.",
      bn: "দ্রুত একজন ওরাল মেডিসিন বিশেষজ্ঞকে দেখান।",
    },
    callout: { en: "Oral Lesion", bn: "মুখের ক্ষত" },
  },
];

const TOTAL_WAYPOINTS = STAGES.length + 1; // 7 stages + final convergence waypoint
const VH_PER_STAGE = 85; // larger = slower, more readable pacing per stage (was 170 — halved to cut hero scroll length)

/** Short per-stage labels for the progress rail (stage 1 has no callout). */
const STAGE_LABELS = STAGES.map((s, i) =>
  s.callout ?? (i === 0 ? { en: "Healthy", bn: "সুস্থ দাঁত" } : { en: "", bn: "" })
);

/** Small animated "pointing up at the photo" indicator — used only on Stage 1. */
function PointerArrow() {
  return (
    <ChevronUp
      className="w-6 h-6 lg:w-7 lg:h-7 text-[#474B4E] animate-bounce drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]"
      strokeWidth={3}
    />
  );
}

/** Desktop pinned-stage text: headline+differential+bullets all centered. */
function DesktopStageTextBlock({
  stage,
  isBn,
  opacity,
  isFirstStage,
}: {
  stage: StageContent;
  isBn: boolean;
  opacity: number;
  isFirstStage?: boolean;
}) {
  return (
    <div
      style={{ opacity, transition: "opacity 400ms ease-out" }}
      className="absolute top-[54%] left-1/2 -translate-x-1/2 w-[90%] lg:w-[70%] flex flex-col items-center gap-3 pointer-events-none text-center"
    >
      {isFirstStage && <PointerArrow />}
      <h2 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold leading-tight text-[#2b2b2b] drop-shadow-[0_1px_3px_rgba(255,255,255,0.85)] max-w-3xl">
        {isBn ? stage.mainText.bn : stage.mainText.en}
      </h2>

      {stage.differential && (
        <p className="text-xs lg:text-sm text-[#4a4a4a] font-medium leading-relaxed max-w-xl">
          {isBn ? stage.differential.bn : stage.differential.en}
        </p>
      )}
    </div>
  );
}

/** Keyframes for the hero controls (scoped by the `kgh-hero-` prefix). */
const HERO_CONTROL_STYLES = `
@keyframes kgh-hero-chevron { 0%,100% { opacity: .15; transform: translateY(-3px); } 50% { opacity: 1; transform: translateY(2px); } }
@keyframes kgh-hero-wheel { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(9px); } }
@keyframes kgh-hero-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(71,75,78,.45); } 50% { box-shadow: 0 0 0 10px rgba(71,75,78,0); } }
.kgh-hero-chev { animation: kgh-hero-chevron 1.4s ease-in-out infinite; }
.kgh-hero-wheel { animation: kgh-hero-wheel 1.6s ease-in-out infinite; }
.kgh-hero-pulse { animation: kgh-hero-pulse 2s ease-out infinite; }
@media (prefers-reduced-motion: reduce) { .kgh-hero-chev, .kgh-hero-wheel, .kgh-hero-pulse { animation: none; } }
`;

/** Three stacked chevrons that light up one after another (on/off cascade). */
function CascadeChevrons({ size = "w-5 h-5" }: { size?: string }) {
  return (
    <span className="flex flex-col items-center -space-y-3">
      {[0, 1, 2].map((i) => (
        <ChevronDown key={i} className={`${size} kgh-hero-chev`} strokeWidth={3} style={{ animationDelay: `${i * 0.18}s` }} />
      ))}
    </span>
  );
}

/** Prominent scroll hint: glass pill, mouse icon (desktop) + cascading arrows.
 *  Shown until the final CTA stage scrolls into view. */
function ScrollHint({ isBn, visible, isDesktop }: { isBn: boolean; visible: boolean; isDesktop: boolean }) {
  return (
    <div
      style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease-out" }}
      className={`absolute z-30 pointer-events-none ${isDesktop ? "bottom-6 left-8 xl:left-10" : "bottom-[16px] left-4"}`}
    >
      <div className="kgh-hero-pulse flex items-center gap-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#474B4E]/25 shadow-lg px-4 py-2 lg:px-5 lg:py-2.5 text-[#2b2b2b]">
        {isDesktop && (
          <span className="relative block w-5 h-8 rounded-full border-2 border-[#474B4E]">
            <span className="kgh-hero-wheel absolute left-1/2 top-1.5 -ml-[2px] w-1 h-1.5 rounded-full bg-[#474B4E]" />
          </span>
        )}
        <span className="text-sm lg:text-base font-bold tracking-wide whitespace-nowrap">
          {isBn ? "নিচে স্ক্রল করুন" : "Scroll Down"}
        </span>
        <span className="text-[#474B4E]">
          <CascadeChevrons size={isDesktop ? "w-5 h-5" : "w-4 h-4"} />
        </span>
      </div>
    </div>
  );
}

/** "Skip intro" button — jumps straight past the hero to the next section. */
function SkipIntroButton({ isBn, visible, isDesktop, onSkip }: { isBn: boolean; visible: boolean; isDesktop: boolean; onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      aria-label={isBn ? "ইন্ট্রো এড়িয়ে যান" : "Skip intro"}
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity 400ms ease-out" }}
      className={`absolute z-30 inline-flex items-center gap-1.5 rounded-full bg-[#474B4E] hover:bg-[#2b2b2b] text-white font-bold shadow-xl border border-white/30 transition-colors active:scale-95 ${
        isDesktop ? "bottom-6 right-8 xl:right-10 px-5 py-2.5 text-base" : "bottom-[20px] right-4 px-4 py-2 text-xs"
      }`}
    >
      <span>{isBn ? "এড়িয়ে যান" : "Skip intro"}</span>
      <ChevronsDown className={isDesktop ? "w-5 h-5" : "w-4 h-4"} />
    </button>
  );
}

/** Progress card — soft white card, a "keep scrolling" prompt, a rounded
 *  track with a dark fill and a percentage bubble riding the fill's edge.
 *  Mobile: horizontal, directly under the stage text (rendered inside the
 *  header-shifted image/text layer).
 *  Desktop: vertical, parked on the right edge, vertically centered. */
function HeroProgress({
  isBn,
  isDesktop,
  progress,
  activeIndex,
  visible,
  mobileTop,
}: {
  isBn: boolean;
  isDesktop: boolean;
  progress: number;
  activeIndex: number;
  visible: boolean;
  /** Mobile only: CSS top, positioned just under the stage text. */
  mobileTop?: string;
}) {
  const total = STAGES.length;
  const label = isBn ? STAGE_LABELS[activeIndex].bn : STAGE_LABELS[activeIndex].en;
  const fill = Math.min(progress * ((TOTAL_WAYPOINTS - 1) / (total - 1)), 1);
  const pct = Math.round(fill * 100);
  const prompt = isBn ? "আরও দেখতে স্ক্রল করুন" : "Keep scrolling to explore";
  const fade = { opacity: visible ? 1 : 0, transition: "opacity 400ms ease-out" };
  const card = "rounded-2xl bg-white/85 backdrop-blur-md border border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]";
  const bubble = "rounded-md bg-[#5f5e5a] text-white font-medium shadow-md whitespace-nowrap";

  if (!isDesktop) {
    // Keep the bubble inside the track at 0% / 100%.
    const bubbleLeft = `clamp(18px, ${fill * 100}%, calc(100% - 18px))`;
    return (
      <div className="absolute z-30 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] pointer-events-none" style={{ top: mobileTop, ...fade }}>
        <div className={`${card} px-4 pt-2.5 pb-3`}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#5f5e5a]">{prompt}</span>
            <span className="text-[11px] font-semibold text-[#474B4E]/70 truncate">
              {activeIndex + 1}/{total} · {label}
            </span>
          </div>
          <div className="relative mt-[26px]">
            <div className="absolute bottom-full mb-2 -translate-x-1/2 transition-[left] duration-150 ease-out" style={{ left: bubbleLeft }}>
              <div className={`relative ${bubble} px-1.5 py-0.5 text-[11px]`}>
                {pct}%
                <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#5f5e5a]" />
              </div>
            </div>
            <div className="w-full h-[8px] rounded-full bg-[#e9e9e7] overflow-hidden">
              <div className="h-full rounded-full bg-[#5f5e5a] transition-[width] duration-150 ease-out" style={{ width: `${fill * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: vertical track, fills top → bottom; bubble rides on the left.
  const bubbleTop = `clamp(10px, ${fill * 100}%, calc(100% - 10px))`;
  return (
    <div className="absolute z-30 right-8 xl:right-10 top-1/2 -translate-y-1/2 pointer-events-none" style={fade}>
      <div className={`${card} w-[132px] px-3 pt-3.5 pb-4 flex flex-col items-center text-center`}>
        <span className="text-xs font-semibold leading-snug text-[#5f5e5a]">{prompt}</span>
        <span className="mt-1 text-[11px] font-semibold text-[#474B4E]/70">
          {activeIndex + 1}/{total} · {label}
        </span>
        <div className="relative mt-4 h-[260px] w-[10px]">
          <div className="absolute inset-0 rounded-full bg-[#e9e9e7] overflow-hidden">
            <div className="w-full rounded-full bg-[#5f5e5a] transition-[height] duration-150 ease-out" style={{ height: `${fill * 100}%` }} />
          </div>
          <div className="absolute right-full mr-2 -translate-y-1/2 transition-[top] duration-150 ease-out" style={{ top: bubbleTop }}>
            <div className={`relative ${bubble} px-2 py-1 text-xs`}>
              {pct}%
              <span className="absolute top-1/2 -translate-y-1/2 left-full w-0 h-0 border-y-[5px] border-y-transparent border-l-[5px] border-l-[#5f5e5a]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinalCta({ isBn }: { isBn: boolean }) {
  return (
    <>
      <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold text-[#242424] leading-tight max-w-4xl drop-shadow-[0_2px_6px_rgba(255,255,255,0.8)]">
        {isBn ? UI_STRINGS.hero.headline.bn : UI_STRINGS.hero.headline.en}
      </h1>
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 lg:mt-10 pointer-events-auto">
        <Link
          href="/appointment"
          className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl bg-[#474B4E] hover:bg-[#373a3c] text-white text-sm sm:text-base font-bold shadow-xl transition-all active:scale-98"
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{isBn ? UI_STRINGS.hero.primaryCta.bn : UI_STRINGS.hero.primaryCta.en}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-sm sm:text-base font-bold shadow-lg border border-black/10 transition-all active:scale-98"
        >
          <span>{isBn ? UI_STRINGS.hero.secondaryCta.bn : UI_STRINGS.hero.secondaryCta.en}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}

/** Mobile pinned-stage text: overlays directly ON the image, anchored right
 *  at / slightly over the teeth's lower border — reads as one continuous
 *  photo+text layer, not a separate section underneath. */
function MobileStageTextBlock({
  stage,
  isBn,
  opacity,
  isFirstStage,
}: {
  stage: StageContent;
  isBn: boolean;
  opacity: number;
  isFirstStage?: boolean;
}) {
  return (
    <div
      style={{ opacity, transition: "opacity 400ms ease-out" }}
      className="w-full px-5 flex flex-col items-center gap-2 pointer-events-none text-center"
    >
      {isFirstStage && <PointerArrow />}
      <h2 className="text-2xl font-extrabold leading-tight text-[#2b2b2b] drop-shadow-[0_1px_3px_rgba(255,255,255,0.85)]">
        {isBn ? stage.mainText.bn : stage.mainText.en}
      </h2>

      {stage.differential && (
        <p className="text-xs text-[#4a4a4a] font-medium leading-relaxed max-w-xs drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">
          {isBn ? stage.differential.bn : stage.differential.en}
        </p>
      )}
    </div>
  );
}

/** ============================================================
 *  UNIFIED PINNED HERO — same scroll-driven zoom/crossfade
 *  mechanic on both desktop and mobile, only crop/text placement
 *  differ per viewport.
 *  ============================================================ */
function PinnedHero({ isBn, isDesktop }: { isBn: boolean; isDesktop: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  // Before the pin engages, the sticky frame sits below the header and its
  // bottom edge is off-screen — lift bottom-anchored controls by that amount.
  const [bottomLift, setBottomLift] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [mobileTrackHeight, setMobileTrackHeight] = useState<number | null>(null);
  const [mobileScreenH, setMobileScreenH] = useState<number | null>(null);

  // Freeze initial viewport height on mobile so iOS Safari address bar expansion/collapse
  // NEVER changes the container dimensions or causes violent 1200px layout shifts!
  useEffect(() => {
    if (!isDesktop && typeof window !== "undefined") {
      const initialH = window.innerHeight;
      setMobileScreenH(initialH);
      setMobileTrackHeight(Math.round(TOTAL_WAYPOINTS * (VH_PER_STAGE / 100) * initialH));
    }
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop || typeof window === "undefined") return;
    const handleOrientation = () => {
      const initialH = window.innerHeight;
      setMobileScreenH(initialH);
      setMobileTrackHeight(Math.round(TOTAL_WAYPOINTS * (VH_PER_STAGE / 100) * initialH));
    };
    window.addEventListener("orientationchange", handleOrientation);
    return () => window.removeEventListener("orientationchange", handleOrientation);
  }, [isDesktop]);

  // Measure the site header so the image/text can start right below it
  // (header stays visible/clickable — we never hide or cover it).
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => {
      const h = header.getBoundingClientRect().height;
      setHeaderHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastWidth = typeof window !== "undefined" ? window.innerWidth : 0;

    const compute = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const lift = Math.max(Math.round(rect.top), 0);
      setBottomLift((prev) => (prev === lift ? prev : lift));
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      const rawProgress = scrolled / scrollable;
      setProgress((prev) => (Math.abs(prev - rawProgress) > 0.001 ? rawProgress : prev));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    const onResize = () => {
      // On mobile devices, ignore height-only resizes caused by address bar collapsing/expanding!
      // Only recompute if width changed (e.g. rotation/orientation change)
      if (typeof window !== "undefined" && Math.abs(window.innerWidth - lastWidth) > 15) {
        lastWidth = window.innerWidth;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(compute);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compute();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const rawIndex = safeProgress * (TOTAL_WAYPOINTS - 1);
  const currentIndex = Math.min(Math.floor(rawIndex), TOTAL_WAYPOINTS - 2);
  const localT = Math.min(Math.max(rawIndex - currentIndex, 0), 1);
  const isFinalStage = currentIndex === STAGES.length - 1 && localT > 0.5;

  const currentStage = STAGES[currentIndex];
  const nextStage = currentIndex + 1 < STAGES.length ? STAGES[currentIndex + 1] : STAGES[0];

  // Continuous "zoom into the tooth" crossfade between two consecutive images.
  const currentScale = 1 + localT * 0.12;
  const currentOpacity = 1 - localT;
  const nextScale = 1.05 - localT * 0.05;
  const nextOpacity = localT;

  const activeTextStage = localT < 0.5 ? currentStage : nextStage;
  const activeTextOpacity = localT < 0.5 ? 1 - localT * 2 : (localT - 0.5) * 2;
  const activeIndex = localT < 0.5 ? currentIndex : Math.min(currentIndex + 1, STAGES.length - 1);

  // Scroll to a point inside the pinned track (0..1). Header is sticky (in flow),
  // so the container's document top already sits below it.
  const scrollToProgress = (p: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + p * scrollable, behavior: "smooth" });
  };
  // Skip straight to the final "Whatever Your Dental Problem Is…" CTA stage
  // (end of the pinned track, where the CTA is fully faded in).
  const skipIntro = () => scrollToProgress(1);

  // Mobile image box height, and where the stage-text slot ends (text starts
  // 92px above the image's bottom edge; 172px fits the longest headline+sub).
  const mobileImgH = mobileScreenH ? `min(92vw, ${Math.round(mobileScreenH * 0.58)}px)` : "min(92vw, 58svh)";
  const mobileTextSlotEnd = `calc(${mobileImgH} + 80px)`;

  const progressCard = (
    <HeroProgress
      isBn={isBn}
      isDesktop={isDesktop}
      progress={safeProgress}
      activeIndex={activeIndex}
      visible={!isFinalStage}
      mobileTop={mobileTextSlotEnd}
    />
  );

  const controls = (
    <>
      <style>{HERO_CONTROL_STYLES}</style>
      {isDesktop && progressCard}
      <div className="absolute inset-x-0 bottom-0 z-30 pointer-events-none" style={{ transform: `translateY(-${bottomLift}px)` }}>
        <div className="relative">
          <ScrollHint isBn={isBn} visible={!isFinalStage} isDesktop={isDesktop} />
          <SkipIntroButton isBn={isBn} visible={!isFinalStage} isDesktop={isDesktop} onSkip={skipIntro} />
        </div>
      </div>
    </>
  );

  if (!isDesktop) {
    // ================================================================
    // MOBILE: image confined to a square-ish box (not full h-screen) so
    // object-fit:cover doesn't need an extreme 9:16 crop — this keeps the
    // central incisors centered with several neighboring teeth + gum
    // visible, while still using the SAME pin+zoom+crossfade mechanic.
    // Text sits immediately below the image box, not floating over it.
    // Height is locked to frozen pixels to prevent iOS address bar shifts.
    // ================================================================
    return (
      <div
        ref={containerRef}
        className="relative w-full bg-[#e8eaf4]"
        style={{
          height: mobileTrackHeight ? `${mobileTrackHeight}px` : `${TOTAL_WAYPOINTS * VH_PER_STAGE}svh`,
        }}
      >
        <div
          className="sticky top-0 w-full overflow-hidden bg-[#e8eaf4]"
          style={{ height: mobileScreenH ? `${mobileScreenH}px` : "100svh" }}
        >
          {/* Shifted down by the header's height — header stays visible/clickable,
              never covered, and this reveals the gum area that used to sit behind it. */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: headerHeight,
              height: mobileScreenH ? `${mobileScreenH}px` : "100svh",
            }}
          >
            <div className="relative w-full" style={{ height: mobileImgH }}>
              <img
                src={currentStage.image}
                alt=""
                style={{ transform: `scale(${currentScale})`, opacity: currentOpacity, transformOrigin: "center 30%" }}
                className="absolute inset-0 w-full h-full object-cover object-[center_18%] transition-none"
              />
              <img
                src={nextStage.image}
                alt=""
                style={{ transform: `scale(${nextScale})`, opacity: nextOpacity, transformOrigin: "center 30%" }}
                className="absolute inset-0 w-full h-full object-cover object-[center_18%] transition-none"
              />
            </div>

            {/* Text overlays the image, anchored right at (slightly over) the teeth's lower border */}
            <div className="absolute left-0 w-full" style={{ top: `calc(${mobileImgH} - 92px)` }}>
              {!isFinalStage && (
                <MobileStageTextBlock
                  stage={activeTextStage}
                  isBn={isBn}
                  opacity={activeTextOpacity}
                  isFirstStage={activeTextStage === STAGES[0]}
                />
              )}
            </div>
            {progressCard}
          </div>

          <div
            style={{ opacity: isFinalStage ? Math.min((localT - 0.5) * 2, 1) : 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none transition-opacity duration-300"
          >
            <FinalCta isBn={isBn} />
          </div>

          {controls}
        </div>
      </div>
    );
  }

  // ================================================================
  // DESKTOP: full-bleed wide frame, cinematic pin+zoom+crossfade.
  // ================================================================
  return (
    <div
      ref={containerRef}
      className="relative w-full bg-[#e8eaf4]"
      style={{ height: `${TOTAL_WAYPOINTS * VH_PER_STAGE}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Shifted down by the header's height — header stays visible/clickable,
            never covered, and this reveals content (e.g. gum/abscess) that used
            to render behind it. Crop/zoom math is unchanged, just repositioned. */}
        <div className="absolute left-0 right-0" style={{ top: headerHeight, height: "100vh" }}>
          <img
            src={currentStage.image}
            alt=""
            style={{ transform: `scale(${currentScale})`, opacity: currentOpacity, transformOrigin: "center 40%" }}
            className="absolute inset-0 w-full h-full object-cover object-center transition-none"
          />
          <img
            src={nextStage.image}
            alt=""
            style={{ transform: `scale(${nextScale})`, opacity: nextOpacity, transformOrigin: "center 40%" }}
            className="absolute inset-0 w-full h-full object-cover object-center transition-none"
          />
          {!isFinalStage && (
            <DesktopStageTextBlock
              stage={activeTextStage}
              isBn={isBn}
              opacity={activeTextOpacity}
              isFirstStage={activeTextStage === STAGES[0]}
            />
          )}
        </div>

        <div
          style={{ opacity: isFinalStage ? Math.min((localT - 0.5) * 2, 1) : 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 lg:px-16 pointer-events-none transition-opacity duration-300"
        >
          <FinalCta isBn={isBn} />
        </div>

        {controls}
      </div>
    </div>
  );
}

export function Hero() {
  const { isBn } = useLanguage();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Resolve viewport before first meaningful paint so only one crop config mounts.
  if (isDesktop === null) return <div className="w-full h-screen bg-[#e8eaf4]" />;

  return <PinnedHero isBn={isBn} isDesktop={isDesktop} />;
}
