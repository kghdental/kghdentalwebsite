"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  ArrowRight,
  Search,
  X,
  Calendar,
  Sparkles,
  BookOpen,
  Filter,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import { fetchLiveBlogPosts, ENRICHED_BLOG_POSTS } from "@/lib/api/db";
import { BlogPost } from "@/types";

export default function BlogPage() {
  const { isBn } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>(ENRICHED_BLOG_POSTS);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchLiveBlogPosts().then((live) => {
      if (live && live.length > 0) {
        setPosts(live);
      }
    });
  }, []);

  const departments = [
    { id: "all", label: { en: "All Topics", bn: "সকল বিষয়" } },
    { id: "endodontics", label: { en: "Root Canal & Fillings", bn: "রুট ক্যানেল ও ফিলিং" } },
    { id: "orthodontics", label: { en: "Braces & Aligners", bn: "ব্রেসেস ও অ্যালাইনার" } },
    { id: "oral-surgery", label: { en: "Oral Surgery & Wisdom Teeth", bn: "ওরাল সার্জারি ও আক্কেল দাঁত" } },
    { id: "prosthodontics", label: { en: "Implants & Crowns", bn: "ইমপ্ল্যান্ট ও ক্রাউন" } },
    { id: "pediatric", label: { en: "Kids Dentistry", bn: "শিশু দন্ত চিকিৎসা" } },
    { id: "periodontics", label: { en: "Gums & Bleeding", bn: "মাড়ির যত্ন ও রক্তপাত" } },
  ];

  const getDeptCount = (deptId: string) => {
    if (deptId === "all") return posts.length;
    return posts.filter((p) => p.departmentSlug === deptId).length;
  };

  const filteredPosts = posts.filter((post) => {
    const matchesDept = selectedDept === "all" || post.departmentSlug === selectedDept;
    if (!matchesDept) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleEn = post.title?.en?.toLowerCase() || "";
    const titleBn = post.title?.bn?.toLowerCase() || "";
    const excerptEn = post.excerpt?.en?.toLowerCase() || "";
    const excerptBn = post.excerpt?.bn?.toLowerCase() || "";
    const keyword = post.targetKeyword?.toLowerCase() || "";

    return (
      titleEn.includes(query) ||
      titleBn.includes(query) ||
      excerptEn.includes(query) ||
      excerptBn.includes(query) ||
      keyword.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-zinc-900">
      {/* Header Section */}
      <section className="bg-white border-b border-zinc-200/80 pt-14 pb-10 sm:pb-14">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-4xl space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <Link href="/" className="hover:text-zinc-900 transition-colors">
                {isBn ? "হোম" : "Home"}
              </Link>
              <span>/</span>
              <span className="text-[#1c362b] font-semibold">
                {isBn ? "ডেন্টাল গাইড ও ব্লগ" : "Dental Guides & Blog"}
              </span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#1c362b] border border-emerald-200/80 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? "ক্লিনিক্যাল ডেন্টাল জ্ঞান ও নির্দেশিকা" : "EVIDENCE-BASED CLINICAL GUIDES"}</span>
            </div>

            {/* Title & Description */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight">
              {isBn ? "দাঁত ও মুখের যত্নে বিশেষজ্ঞ পরামর্শ" : "Clinical Dental Insights & Guides"}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-3xl">
              {isBn
                ? "আমাদের বিশেষজ্ঞ চিকিৎসকদের বাস্তবসম্মত তথ্য, প্রচলিত ভুল ধারণা নিরসন এবং আধুনিক ব্যথাহীন ডেন্টাল চিকিৎসার সহজ নির্দেশিকা।"
                : "Explore evidence-based guides written by our specialist surgeons covering dental treatments, pain relief, prevention, and oral health tips."}
            </p>

            {/* Live Search and Quick Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isBn
                      ? "বিষয় বা ডেন্টাল সমস্যা দিয়ে খুঁজুন..."
                      : "Search dental topics, root canal, braces..."
                  }
                  className="w-full pl-10 pr-9 py-2.5 rounded-full bg-zinc-50 border border-zinc-200/90 text-sm focus:outline-none focus:ring-2 focus:ring-[#1c362b] focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {searchQuery && (
                <span className="text-xs text-zinc-500 font-medium self-center">
                  {isBn
                    ? `${filteredPosts.length}টি ফলাফল পাওয়া গেছে`
                    : `${filteredPosts.length} result(s) found`}
                </span>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 mr-1 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                {isBn ? "ফিল্টার:" : "Filter:"}
              </span>
              {departments.map((dept) => {
                const count = getDeptCount(dept.id);
                const isSelected = selectedDept === dept.id;

                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1c362b] text-white shadow-md shadow-[#1c362b]/20 scale-[1.02]"
                        : "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/70"
                    }`}
                  >
                    <span>{isBn ? dept.label.bn : dept.label.en}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-zinc-200/80 text-zinc-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area — 4 Columns Per Row */}
      <section className="py-12 sm:py-16">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-8">
          {/* Subheader / Counter */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1c362b]" />
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 tracking-tight">
                {selectedDept === "all"
                  ? isBn
                    ? "সকল ডেন্টাল আর্টিকেল ও গাইড"
                    : "All Clinical Articles & Guides"
                  : isBn
                  ? `${departments.find((d) => d.id === selectedDept)?.label.bn} বিষয়ক গাইড`
                  : `${departments.find((d) => d.id === selectedDept)?.label.en} Guides`}
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-200/80 shadow-2xs">
              {isBn
                ? `মোট ${filteredPosts.length}টি আর্টিকেল`
                : `${filteredPosts.length} Articles`}
            </span>
          </div>

          {/* Empty State */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200/80 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm my-12">
              <div className="w-14 h-14 mx-auto rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">
                {isBn ? "কোনো আর্টিকেল পাওয়া যায়নি" : "No Articles Found"}
              </h3>
              <p className="text-xs text-zinc-500">
                {isBn
                  ? "আপনার সার্চ বা সিলেক্ট করা বিভাগের সাথে মিল পাওয়া যায়নি। অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।"
                  : "We couldn't find any articles matching your search query or selected department."}
              </p>
              <button
                onClick={() => {
                  setSelectedDept("all");
                  setSearchQuery("");
                }}
                className="px-5 py-2.5 rounded-full bg-[#1c362b] text-white text-xs font-bold hover:bg-[#14261e] transition-colors cursor-pointer"
              >
                {isBn ? "ফিল্টার রিসেট করুন" : "Reset Filters"}
              </button>
            </div>
          ) : (
            /* 4-Columns Card Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPosts.map((post, idx) => (
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
                      {/* Gradient overlay at bottom for clean contrast */}
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

                      {/* Featured Highlight badge for the first card */}
                      {idx === 0 && selectedDept === "all" && !searchQuery && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fae8b4] text-[#8c6514] flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-3 h-3" />
                          <span>{isBn ? "জনপ্রিয় গাইড" : "Featured"}</span>
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Date & Meta */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{post.date}</span>
                      </div>

                      {/* Post Title */}
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

                    {/* Card Footer: Author & Read Link */}
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
          )}
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
