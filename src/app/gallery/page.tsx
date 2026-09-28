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
  Video,
  ExternalLink,
  Film,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import {
  fetchLiveGalleryItems,
  fetchLiveBeforeAfterItems,
  fetchLiveVideos,
} from "@/lib/api/db";
import { GalleryItem, BeforeAfterItem, FeaturedVideo } from "@/types";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";

export default function GalleryPage() {
  const { isBn } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [videoItems, setVideoItems] = useState<FeaturedVideo[]>([]);
  const [videoCategory, setVideoCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Lightbox Modal state
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);
  const [selectedCase, setSelectedCase] = useState<BeforeAfterItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<FeaturedVideo | null>(null);

  // Carousel ref for Before & After
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetchLiveGalleryItems(),
      fetchLiveBeforeAfterItems(),
      fetchLiveVideos(false),
    ]).then(([items, baItems, videos]) => {
      setGalleryItems(items || []);
      setBeforeAfterItems(baItems || []);
      setVideoItems(videos || []);
      setLoading(false);
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

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div
                  key={`gal-skel-${n}`}
                  className="rounded-2xl bg-white border border-zinc-200/80 overflow-hidden shadow-2xs animate-pulse flex flex-col"
                >
                  <div className="aspect-4/3 w-full bg-zinc-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGallery.length > 0 ? (
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
          ) : (
            <div className="py-16 px-4 text-center rounded-2xl bg-white border border-dashed border-zinc-200">
              <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-700">
                {isBn ? "কোনো ছবি পাওয়া যায়নি" : "No Photos Found"}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {isBn
                  ? "নতুন ছবি শীঘ্রই যুক্ত করা হবে।"
                  : "New photos will be uploaded soon."}
              </p>
            </div>
          )}
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
          {loading ? (
            <div className="flex gap-6 overflow-hidden pb-6">
              {[0, 1, 2].map((n) => (
                <div
                  key={`ba-skel-${n}`}
                  className="w-[300px] sm:w-[380px] lg:w-[420px] shrink-0 h-[280px] bg-zinc-200/80 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : beforeAfterItems.length > 0 ? (
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
          ) : (
            <div className="py-12 px-6 text-center rounded-2xl bg-white/70 border border-dashed border-zinc-300">
              <Sparkles className="w-10 h-10 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-600">
                {isBn ? "কোনো ফলাফল পাওয়া যায়নি" : "No Before & After cases found"}
              </p>
            </div>
          )}

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
      {/* SECTION 3: ALL CLINICAL VIDEOS & REELS SHOWCASE */}
      {/* ============================================================================== */}
      <section id="videos" className="py-16 sm:py-20 bg-zinc-50 border-t border-zinc-200">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black tracking-widest uppercase shadow-2xs">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? "ভিডিও গ্যালারি ও রিলস" : "CLINICAL VIDEOS & REELS"}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.15]">
                {isBn
                  ? "আমাদের সকল চিকিৎসা ভিডিও, রিলস ও কেস স্টাডিজ"
                  : "All Clinical Procedures, Walkthroughs & Doctor Reels"}
              </h2>

              <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
                {isBn
                  ? "চিকিৎসা পদ্ধতি, ব্যথামুক্ত আধুনিক প্রযুক্তি ও চিকিৎসকদের পরামর্শমূলক ভিডিও দেখুন। নিয়মিত আপডেট পেতে আমাদের ইউটিউব ও ফেসবুক ফলো করুন।"
                  : "Watch detailed procedure explanations, patient recovery journeys, and clinic walk-throughs recorded directly at KGH Dental Banani."}
              </p>
            </div>

            {/* Platform Badges */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <span>YouTube Guides</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs font-bold text-zinc-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Facebook Reels</span>
              </span>
            </div>
          </div>

          {/* Video Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
            {[
              { id: "all", en: "All Videos", bn: "সকল ভিডিও" },
              { id: "treatment_guide", en: "Procedures & Guides", bn: "চিকিৎসা ও গাইড" },
              { id: "doctor_advice", en: "Doctor Advice & Reels", bn: "ডাক্তারের পরামর্শ ও রিলস" },
              { id: "patient_story", en: "Patient Journeys", bn: "রোগীর অভিজ্ঞতা" },
              { id: "clinic_tour", en: "Chamber Tour", bn: "চেম্বার সফর" },
            ].map((cat) => {
              const isActive = videoCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setVideoCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-md scale-[1.02]"
                      : "bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 shadow-2xs"
                  }`}
                >
                  {isBn ? cat.bn : cat.en}
                </button>
              );
            })}
          </div>

          {/* Videos Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          ) : videoItems.filter((v) => videoCategory === "all" || v.category === videoCategory).length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((frameIdx) => (
                <div
                  key={frameIdx}
                  className="rounded-3xl p-6 sm:p-8 border-2 border-dashed border-zinc-300/80 bg-gradient-to-b from-white/90 via-zinc-50/70 to-zinc-100/60 shadow-lg shadow-zinc-200/40 backdrop-blur-xs flex flex-col justify-between items-center text-center relative overflow-hidden group hover:border-emerald-400/60 transition-all duration-300"
                  style={{ minHeight: "300px" }}
                >
                  <div className="w-full flex justify-between items-center text-zinc-400">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                      {isBn ? `ফ্রেম 0${frameIdx}` : `FRAME 0${frameIdx}`}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-zinc-300 group-hover:bg-emerald-500 transition-colors" />
                  </div>

                  <div className="my-auto py-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 shadow-inner flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-300 mb-4">
                      <Film className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-800 mb-1.5">
                      {isBn ? "কোনো ভিডিও পাওয়া যায়নি" : "No Videos in This Category"}
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
                      {isBn
                        ? "এই ক্যাটাগরিতে নতুন ভিডিও আপলোড করা হলে এখানে ফ্রেমটিতে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে"
                        : "Videos uploaded in this category will automatically populate this frame"}
                    </p>
                  </div>

                  <div className="w-full pt-3 border-t border-zinc-200/60 flex items-center justify-center">
                    <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-emerald-700 transition-colors">
                      {isBn ? "ভিডিও ফ্রেম সক্রিয়" : "Video Frame Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {videoItems
                .filter((v) => videoCategory === "all" || v.category === videoCategory)
                .map((video) => {
                  const isVertical = video.aspectRatio === "9:16";
                  const isYouTube = video.platform === "youtube";
                  const titleText = isBn ? video.title.bn : video.title.en;

                  return (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      role="button"
                      tabIndex={0}
                      className="group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200/90 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      style={{ minHeight: "300px" }}
                    >
                      {/* Thumbnail Image */}
                      <div className="absolute inset-0 overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={titleText}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#121c16] via-[#1a2e24] to-[#0a120e] flex items-center justify-center">
                            <Video className="w-16 h-16 text-emerald-400/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 group-hover:via-black/30 transition-colors" />
                      </div>

                      {/* Top Bar Badges */}
                      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-sm">
                          {video.category.replace("_", " ").toUpperCase()}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold text-white shadow-sm border ${
                            isYouTube ? "bg-red-600 border-red-400/30" : "bg-blue-600 border-blue-400/30"
                          }`}
                        >
                          {isYouTube ? (isVertical ? "Shorts" : "YouTube") : (isVertical ? "Reel" : "Facebook")}
                        </span>
                      </div>

                      {/* Center Play Button */}
                      <div className="relative z-10 my-auto flex items-center justify-center py-6">
                        <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white text-zinc-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white/40">
                          <Play className="w-7 h-7 fill-zinc-950 translate-x-0.5" />
                        </div>
                      </div>

                      {/* Bottom Title Bar */}
                      <div className="relative z-10 p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                          {titleText}
                        </h3>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                          <span className="text-emerald-400 group-hover:underline">
                            {isBn ? "ভিডিও দেখুন →" : "Watch Video →"}
                          </span>
                          {isVertical && (
                            <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 text-[10px] font-mono">
                              9:16 Reel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Social Channels Callout */}
          <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-[#1c362b] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-emerald-200">
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isBn ? "সোশ্যাল চ্যানেল" : "Official Channels"}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn
                  ? "আরও ভিডিও ও ওরাল হেলথ টিপস পেতে যুক্ত থাকুন"
                  : "Subscribe for More Smile Makeovers & Dental Advice"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                {isBn
                  ? "আমাদের অফিসিয়াল ফেসবুক পেজ ও ইউটিউব চ্যানেলে নতুন ভিডিও ও রিলস নিয়মিত প্রকাশ করা হয়।"
                  : "Follow our verified YouTube and Facebook channels for regular smile tips and behind-the-scenes clinic reels."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="https://facebook.com/kghdental"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
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

      {/* ============================================================================== */}
      {/* VIDEO LIGHTBOX MODAL */}
      {/* ============================================================================== */}
      {selectedVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVideo(null);
            }
          }}
        >
          <div
            className={`relative w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col ${
              selectedVideo.aspectRatio === "9:16"
                ? "max-w-md sm:max-w-lg h-[85vh] max-h-[800px]"
                : "max-w-4xl lg:max-w-5xl aspect-video max-h-[90vh]"
            }`}
          >
            {/* Top Bar inside modal */}
            <div className="p-3.5 sm:p-4 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    selectedVideo.platform === "youtube" ? "bg-red-500" : "bg-blue-500"
                  }`}
                />
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {isBn ? selectedVideo.title.bn : selectedVideo.title.en}
                </h4>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title={isBn ? "মূল লিংকে দেখুন" : "Open Original Link"}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                  title="Close (Esc)"
                  aria-label="Close video player"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Iframe Container */}
            <div className="flex-1 w-full h-full relative bg-black">
              <iframe
                src={selectedVideo.embedUrl}
                title={isBn ? selectedVideo.title.bn : selectedVideo.title.en}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <CtaBanner />
    </div>
  );
}
