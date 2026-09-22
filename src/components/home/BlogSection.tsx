"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Calendar, Sparkles, BookOpen, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { fetchLiveBlogPosts, ENRICHED_BLOG_POSTS } from "@/lib/api/db";
import { BlogPost } from "@/types";

export function BlogSection() {
  const { isBn } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>(ENRICHED_BLOG_POSTS);

  useEffect(() => {
    fetchLiveBlogPosts().then((live) => {
      if (live && live.length > 0) {
        setPosts(live);
      }
    });
  }, []);

  // Display top 4 articles in a single row
  const displayPosts = posts.slice(0, 4);

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-zinc-200/80">
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#1c362b] border border-emerald-200/80 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? "ডেন্টাল স্বাস্থ্য ও ক্লিনিক্যাল গাইড" : "DENTAL HEALTH & CLINICAL GUIDES"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a2f23] tracking-tight">
              {isBn ? "দাঁতের যত্ন ও চিকিৎসার সাম্প্রতিক গাইড" : "Latest Dental Insights & Guides"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed">
              {isBn
                ? "আমাদের বিশেষজ্ঞ চিকিৎসকদের বাস্তবসম্মত তথ্য, আধুনিক চিকিৎসা ও জরুরি ডেন্টাল পরামর্শ।"
                : "Evidence-based guides, treatment explanations, and preventative dental tips by our specialist surgeons."}
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-[#1c362b] text-zinc-800 hover:text-white text-xs sm:text-sm font-bold transition-all border border-zinc-200/80 self-start md:self-end shadow-2xs group"
          >
            <span>{isBn ? "সকল গাইড দেখুন" : "View All Guides"}</span>
            <ArrowRight className="w-4 h-4 text-[#1c362b] group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* 4 Columns Card Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPosts.map((post, idx) => (
            <article
              key={post.id}
              className="group relative bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/80 hover:border-[#1c362b]/35 shadow-2xs hover:shadow-[0_20px_35px_-12px_rgba(28,54,43,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Thumbnail Image with Badges */}
              <div className="relative">
                <Link
                  href={`/blog/${post.slug}`}
                  className="aspect-16/10 w-full bg-zinc-950 overflow-hidden relative block"
                >
                  <img
                    src={post.coverImage || "/images/departments/consultation-cta.jpg"}
                    alt={isBn ? post.title.bn : post.title.en}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                  {/* Top Left: Department Badge */}
                  <span className="absolute top-3 left-3 text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full bg-white/95 text-[#1c362b] backdrop-blur-md shadow-xs border border-white/60">
                    {isBn ? post.departmentName.bn : post.departmentName.en}
                  </span>

                  {/* Top Right: Read Time */}
                  <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-300" />
                    <span>{post.readTime}</span>
                  </span>

                  {/* Featured Badge for First Card */}
                  {idx === 0 && (
                    <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fae8b4] text-[#8c6514] flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{isBn ? "বিশেষ গাইড" : "Featured"}</span>
                    </span>
                  )}
                </Link>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{post.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-zinc-900 group-hover:text-[#1c362b] leading-snug transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {isBn ? post.title.bn : post.title.en}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 font-normal">
                    {isBn ? post.excerpt.bn : post.excerpt.en}
                  </p>
                </div>

                {/* Footer: Author & Read Button */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-semibold text-zinc-700">
                      {isBn ? "এডমিন" : "Admin"}
                    </span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 group-hover:bg-[#1c362b] text-zinc-700 group-hover:text-white text-xs font-bold transition-all shrink-0"
                  >
                    <span>{isBn ? "পড়ুন" : "Read"}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
