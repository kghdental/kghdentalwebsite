"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  ArrowRight,
  ZoomIn,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLiveGalleryItems, INITIAL_GALLERY } from "@/lib/api/db";
import { GalleryItem } from "@/types";

export function GalleryPreview() {
  const { isBn } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchLiveGalleryItems().then((items) => {
      if (items && items.length > 0) {
        setGalleryItems(items);
      }
    });
  }, []);

  // Always ensure at least 4 items by merging live database items with initial clinic items
  const displayItems = React.useMemo(() => {
    const list = [...galleryItems];
    for (const fallback of INITIAL_GALLERY) {
      if (list.length >= 4) break;
      const alreadyIncluded = list.some(
        (it) => it.id === fallback.id || it.imageUrl === fallback.imageUrl
      );
      if (!alreadyIncluded) {
        list.push(fallback);
      }
    }
    return list.slice(0, 4);
  }, [galleryItems]);

  return (
    <section className="pt-10 pb-12 sm:pt-12 sm:pb-14 lg:pt-14 lg:pb-16 bg-[#f8f8f5] border-t border-zinc-200/90 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 -right-24 w-80 h-80 bg-[#1c362b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#fae8b4]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
        
        {/* ========================================================================= */}
        {/* SECTION HEADER                                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fae8b4]/80 text-[#8c6514] border border-[#fae8b4] text-xs font-black tracking-widest uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#8c6514]" />
              <span>{isBn ? "ক্লিনিক এক নজরে" : "CLINIC AT A GLANCE"}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight">
              {isBn
                ? "আমাদের আধুনিক চেম্বার ও ক্লিনিক্যাল পরিবেশ"
                : "Inside Our Modern Clinic & Chambers"}
            </h2>
            
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
              {isBn
                ? "সর্বোচ্চ জীবাণুমুক্ত পরিবেশ, আন্তর্জাতিক মানের ডেন্টাল চেয়ার এবং রোগীদের স্বাচ্ছন্দ্যে বিশেষায়িত চেম্বার সেটাপ।"
                : "Take a quick look into our modern operatory suites, sterile surgical setups, and welcoming patient care environment."}
            </p>
          </div>

          {/* Quick Header Navigation Button (Kept as requested) */}
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#1c362b] text-zinc-800 hover:text-white text-xs sm:text-sm font-bold transition-all border border-zinc-200/90 self-start md:self-end shadow-2xs hover:shadow-md group"
          >
            <ImageIcon className="w-4 h-4 text-[#1c362b] group-hover:text-white transition-colors" />
            <span>{isBn ? "সম্পূর্ণ গ্যালারি দেখুন" : "Explore All Photos"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4-COLUMN COMPACT GALLERY GRID                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-[#1c362b]/40 overflow-hidden shadow-2xs hover:shadow-[0_20px_35px_-12px_rgba(28,54,43,0.15)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={isBn ? item.title.bn : item.title.en}
                  className="w-full h-full object-cover transition-transform duration-600 ease-out group-hover:scale-108"
                  loading="lazy"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Top Badge: Category */}
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-[#1c362b] backdrop-blur-md shadow-xs border border-white/60">
                  {item.category === "clinic"
                    ? isBn
                      ? "চেম্বার"
                      : "Chamber"
                    : isBn
                    ? "ট্রিটমেন্ট কেস"
                    : "Clinical Case"}
                </span>

                {/* Top Right: Zoom Indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md p-1.5 rounded-full text-zinc-900 shadow-md">
                  <ZoomIn className="w-3.5 h-3.5 text-[#1c362b]" />
                </div>

                {/* Bottom Left on image: Photo Number */}
                <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white/80 font-mono">
                  0{index + 1} / 04
                </span>
              </div>

              {/* Card Footer / Caption */}
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-[#1c362b] transition-colors">
                    {isBn ? item.title.bn : item.title.en}
                  </h3>
                  {item.desc && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {isBn ? item.desc.bn : item.desc.en}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-[#1c362b]">
                  <span className="group-hover:underline">
                    {isBn ? "বড় করে দেখুন" : "View Photo"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}

          {/* Fallback Sketch / Placeholder Card if less than 4 items */}
          {Array.from({ length: Math.max(0, 4 - displayItems.length) }).map((_, idx) => (
            <Link
              key={`placeholder-${idx}`}
              href="/gallery"
              className="group relative rounded-2xl sm:rounded-3xl border-2 border-dashed border-zinc-300 hover:border-[#1c362b]/50 bg-zinc-100/50 hover:bg-zinc-100/80 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[260px] shadow-2xs"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-[#1c362b] group-hover:scale-110 transition-all mb-3">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-zinc-700 group-hover:text-[#1c362b] transition-colors">
                {isBn ? "আরও ক্লিনিক্যাল ফটো আসছে..." : "More Photos Coming Soon"}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1">
                {isBn ? "গ্যালারি পেইজ ঘুরে দেখুন" : "Browse Full Gallery"}
              </span>
            </Link>
          ))}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* QUICK LIGHTBOX MODAL                                                      */}
      {/* ========================================================================= */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 text-white"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black text-white/90 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* High-res Image Preview */}
            <div className="relative aspect-16/10 w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedPhoto.imageUrl}
                alt={isBn ? selectedPhoto.title.bn : selectedPhoto.title.en}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Info Bar & Gallery Link */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {isBn ? selectedPhoto.title.bn : selectedPhoto.title.en}
                </h3>
                {selectedPhoto.desc && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                    {isBn ? selectedPhoto.desc.bn : selectedPhoto.desc.en}
                  </p>
                )}
              </div>

              <Link
                href="/gallery"
                onClick={() => setSelectedPhoto(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-colors shrink-0"
              >
                <span>{isBn ? "গ্যালারি পেইজে যান" : "Go to Gallery"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
