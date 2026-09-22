"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, Tag, Calendar, User, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import { fetchLiveBlogPosts, ENRICHED_BLOG_POSTS } from "@/lib/api/db";
import { BlogPost } from "@/types";

export default function BlogPage() {
  const { t, isBn } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>(ENRICHED_BLOG_POSTS);
  const [selectedDept, setSelectedDept] = useState<string>("all");

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

  const filteredPosts =
    selectedDept === "all"
      ? posts
      : posts.filter((p) => p.departmentSlug === selectedDept);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-zinc-900">
      {/* Header Section */}
      <section className="bg-white border-b border-zinc-200/80 pt-16 pb-12 sm:pb-16">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-4xl space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#fae8b4] text-[#8c6514] text-[11px] font-black tracking-widest uppercase">
              {isBn ? "ডেন্টাল স্বাস্থ্য জ্ঞান ও নির্দেশিকা" : "EVIDENCE-BASED DENTAL GUIDES"}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1a2f23] tracking-tight">
              {isBn ? "দাঁত ও মুখের যত্নে বিশেষজ্ঞ পরামর্শ" : "Clinical Dental Insights"}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal max-w-3xl">
              {isBn
                ? "আমাদের কনসালটেন্ট চিকিৎসকদের বাস্তবসম্মত তথ্য, প্রচলিত ভুল ধারণা নিরসন ও আধুনিক ডেন্টাল চিকিৎসার সহজ নির্দেশিকা।"
                : "Explore comprehensive clinical guides addressing common dental questions, surgical treatments, myths, and proactive preventive care."}
            </p>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-6">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    selectedDept === dept.id
                      ? "bg-[#1c362b] text-white shadow-sm"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200"
                  }`}
                >
                  {isBn ? dept.label.bn : dept.label.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-20">
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-12">
          {/* Featured Article Banner (if available) */}
          {featuredPost && (
            <div className="rounded-3xl bg-white border border-zinc-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto h-full min-h-[300px] lg:min-h-[440px] bg-zinc-950 relative overflow-hidden">
                  <img
                    src={featuredPost.coverImage || "/images/departments/consultation-cta.jpg"}
                    alt={isBn ? featuredPost.title.bn : featuredPost.title.en}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                      Featured Guide
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {isBn ? featuredPost.departmentName.bn : featuredPost.departmentName.en}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredPost.readTime}</span>
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2f23] leading-tight hover:text-black transition-colors">
                      <Link href={`/blog/${featuredPost.slug}`}>
                        {isBn ? featuredPost.title.bn : featuredPost.title.en}
                      </Link>
                    </h2>

                    <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                      {isBn ? featuredPost.excerpt.bn : featuredPost.excerpt.en}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-zinc-300">
                        <img
                          src={featuredPost.authorPhotoUrl || "/images/doctors/dr-diean.jpg"}
                          alt="Doctor"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-950">
                          {isBn ? featuredPost.authorName?.bn : featuredPost.authorName?.en}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {isBn ? featuredPost.authorRole?.bn : featuredPost.authorRole?.en}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c362b] hover:bg-[#14261e] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                    >
                      <span>{isBn ? "সম্পূর্ণ পড়ুন" : "Read Guide"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post) => (
              <article
                key={post.id}
                className="group rounded-3xl bg-white border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Thumbnail Image */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="aspect-16/10 w-full bg-zinc-950 overflow-hidden relative block"
                >
                  <img
                    src={post.coverImage || "/images/departments/consultation-cta.jpg"}
                    alt={isBn ? post.title.bn : post.title.en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/75 text-white backdrop-blur-md">
                    {isBn ? post.departmentName.bn : post.departmentName.en}
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/90 text-zinc-800 backdrop-blur-md">
                    {post.readTime}
                  </span>
                </Link>

                {/* Body Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 group-hover:text-[#1c362b] leading-snug transition-colors line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>
                        {isBn ? post.title.bn : post.title.en}
                      </Link>
                    </h3>

                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3">
                      {isBn ? post.excerpt.bn : post.excerpt.en}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 text-[11px] font-medium">{post.date}</span>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-[#1c362b] hover:underline"
                    >
                      <span>{isBn ? "পড়ুন" : "Read More"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </div>
  );
}
