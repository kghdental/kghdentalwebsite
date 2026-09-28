"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Play,
  X,
  Sparkles,
  ExternalLink,
  Film,
  Video,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLiveVideos } from "@/lib/api/db";
import { FeaturedVideo } from "@/types";

export function VideoShowcase() {
  const { isBn } = useLanguage();
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<FeaturedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fetch live videos and listen to updates
  useEffect(() => {
    let isMounted = true;
    const loadVideos = async () => {
      const data = await fetchLiveVideos(false);
      if (isMounted) {
        setVideos(data || []);
        setLoading(false);
      }
    };

    loadVideos();

    const handleUpdate = () => {
      loadVideos();
    };

    window.addEventListener("kgh_videos_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("kgh_videos_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Keyboard navigation: Escape to close modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedVideo(null);
    }
  }, []);

  useEffect(() => {
    if (selectedVideo) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedVideo, handleKeyDown]);

  // Order videos with most recently created/uploaded first for homepage showcase
  const recentVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [videos]);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollDistance = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      });
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "treatment_guide":
        return isBn ? "চিকিৎসা পদ্ধতি" : "Treatment Guide";
      case "doctor_advice":
        return isBn ? "ডাক্তারের পরামর্শ" : "Doctor Advice";
      case "patient_story":
        return isBn ? "রোগীর অভিজ্ঞতা" : "Patient Story";
      case "clinic_tour":
        return isBn ? "চেম্বার সফর" : "Clinic Tour";
      default:
        return isBn ? "বিশেষায়িত ভিডিও" : "Featured Video";
    }
  };

  return (
    <section
      id="video-showcase"
      className="py-14 sm:py-18 lg:py-20 bg-gradient-to-b from-[#f8f8f5] via-white to-[#f4f3f7] border-t border-zinc-200/90 relative overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER WITH SLIDER CONTROLS                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-black tracking-widest uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? "ভিডিও কেস ও অভিজ্ঞতা" : "CLINICAL REELS & STORIES"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight leading-[1.15]">
              {isBn
                ? "বাস্তব চিকিৎসা পদ্ধতি, রিলস ও পরামর্শ ভিডিও"
                : "Watch Real Procedures, Smile Makeovers & Doctor Reels"}
            </h2>

            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
              {isBn
                ? "কেজিএইচ ডেন্টাল বনানী চেম্বারের বাস্তব চিকিৎসা অভিজ্ঞতা, ব্যথামুক্ত প্রযুক্তি ও বিশেষজ্ঞ পরামর্শ ভিডিও স্লাইড করে দেখুন।"
                : "Browse the latest clinical walkthroughs, patient smile transformations, and bite-sized doctor reels recorded at KGH Dental Banani."}
            </p>
          </div>

          {/* Action Links & Slider Navigation */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            <Link
              href="/gallery#videos"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 text-xs sm:text-sm font-bold text-zinc-800 hover:text-black transition-all shadow-2xs group"
            >
              <span>{isBn ? "সকল ভিডিও দেখুন" : "View All Videos"}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Slider Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollSlider("left")}
                aria-label="Previous Videos"
                className="p-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollSlider("right")}
                aria-label="Next Videos"
                className="p-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-200 shadow-2xs transition-all active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SINGLE-ROW HORIZONTAL SLIDER / CAROUSEL                                   */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="flex gap-5 overflow-hidden py-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-[280px] sm:w-[320px] md:w-[360px] h-72 rounded-3xl bg-zinc-200 animate-pulse shrink-0 border border-zinc-300/60"
              />
            ))}
          </div>
        ) : recentVideos.length === 0 ? (
          <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none">
            {[1, 2, 3].map((frameIdx) => (
              <div
                key={frameIdx}
                className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 rounded-3xl p-6 sm:p-8 border-2 border-dashed border-zinc-300/80 bg-gradient-to-b from-white/90 via-zinc-50/70 to-zinc-100/60 shadow-lg shadow-zinc-200/40 backdrop-blur-xs flex flex-col justify-between items-center text-center relative overflow-hidden group hover:border-emerald-400/60 transition-all duration-300"
                style={{ minHeight: "310px" }}
              >
                {/* Ambient glow inside shadow frame */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

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
                    {isBn ? "নতুন ভিডিও শীঘ্রই আসছে" : "New Video Coming Soon"}
                  </h4>
                  <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
                    {isBn
                      ? "অ্যাডমিন প্যানেল থেকে ভিডিও যুক্ত করলে তা সরাসরি এখানে প্রদর্শিত হবে"
                      : "Videos added from the admin panel will instantly appear in this frame"}
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
          <div
            ref={sliderRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory"
          >
            {recentVideos.map((video) => {
              const isVertical = video.aspectRatio === "9:16";
              const isYouTube = video.platform === "youtube";
              const titleText = isBn ? video.title.bn : video.title.en;
              const hasThumbnail = Boolean(video.thumbnailUrl);

              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedVideo(video);
                    }
                  }}
                  className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start group relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-200/90 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  style={{ minHeight: "310px" }}
                >
                  {/* Thumbnail / Background Layer */}
                  <div className="absolute inset-0 overflow-hidden">
                    {hasThumbnail ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={titleText}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#121c16] via-[#1a2e24] to-[#0a120e] flex items-center justify-center">
                        <Video className="w-16 h-16 text-emerald-400/20" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 group-hover:via-black/30 transition-colors" />
                  </div>

                  {/* Top Bar: Platform Badge & Category */}
                  <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-sm">
                      <span>{getCategoryLabel(video.category)}</span>
                    </span>

                    {/* Source Indicator */}
                    {isYouTube ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/95 text-white text-[11px] font-extrabold shadow-sm border border-red-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{isVertical ? "Shorts" : "YouTube"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/95 text-white text-[11px] font-extrabold shadow-sm border border-blue-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{isVertical ? "Reel" : "Facebook"}</span>
                      </span>
                    )}
                  </div>

                  {/* Center Play Button */}
                  <div className="relative z-10 my-auto flex items-center justify-center py-6">
                    <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white text-zinc-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 border-2 border-white/40">
                      <Play className="w-7 h-7 fill-zinc-950 translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom Info Bar */}
                  <div className="relative z-10 p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent">
                    <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {titleText}
                    </h3>

                    <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-300 font-semibold">
                      <span className="inline-flex items-center gap-1 text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                        <span>{isBn ? "ভিডিও দেখুন" : "Watch Video"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      {isVertical && (
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 text-[10px] font-mono">
                          9:16 Vertical
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* THEATER LIGHTBOX MODAL PLAYER                                             */}
      {/* ========================================================================= */}
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
          {/* Modal Content Container */}
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
    </section>
  );
}
