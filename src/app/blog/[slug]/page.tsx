"use client";

import React, { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Bookmark,
  Check,
  Phone,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import { fetchLiveBlogPosts, ENRICHED_BLOG_POSTS } from "@/lib/api/db";
import { BlogPost } from "@/types";

import { BookOpen } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isBn } = useLanguage();

  const [posts, setPosts] = useState<BlogPost[]>(ENRICHED_BLOG_POSTS);

  // 1. Initial state: check static posts and client-side localStorage synchronously
  const [post, setPost] = useState<BlogPost | null | undefined>(() => {
    if (!slug) return undefined;
    const staticFound = ENRICHED_BLOG_POSTS.find((p) => p.slug === slug);
    if (staticFound) return staticFound;

    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("kgh_blog_posts");
        if (cached) {
          const list: BlogPost[] = JSON.parse(cached);
          const cachedFound = list.find((p) => p.slug === slug);
          if (cachedFound) return cachedFound;
        }
      } catch (e) {
        // ignore
      }
    }
    // Return undefined so we do NOT trigger notFound() before async fetch completes!
    return undefined;
  });

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    const load = async () => {
      try {
        const livePosts = await fetchLiveBlogPosts();
        if (isCancelled) return;
        const all = livePosts && livePosts.length > 0 ? livePosts : ENRICHED_BLOG_POSTS;
        setPosts(all);
        const found = all.find((p) => p.slug === slug);
        if (found) {
          setPost(found);
        } else {
          // Double check directly in client storage cache in case of edge cases
          let localFound: BlogPost | null = null;
          if (typeof window !== "undefined") {
            try {
              const cached = localStorage.getItem("kgh_blog_posts");
              if (cached) {
                const list: BlogPost[] = JSON.parse(cached);
                localFound = list.find((p) => p.slug === slug) || null;
              }
            } catch (e) {}
          }
          setPost(localFound);
        }
      } catch (err) {
        console.warn("Error loading blog post:", err);
        if (!isCancelled) {
          setPost(null);
        }
      }
    };

    load();
    window.addEventListener("kgh_blogs_updated", load);
    window.addEventListener("storage", load);
    return () => {
      isCancelled = true;
      window.removeEventListener("kgh_blogs_updated", load);
      window.removeEventListener("storage", load);
    };
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin" />
        <span className="text-xs text-zinc-500 font-medium">
          {isBn ? "ডেন্টাল গাইড লোড হচ্ছে..." : "Loading dental guide..."}
        </span>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-[75vh] bg-[#f7f6f2] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4 shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
          {isBn ? "ডেন্টাল গাইডটি পাওয়া যায়নি" : "Dental Guide Not Found"}
        </h1>
        <p className="text-sm text-zinc-600 max-w-md mb-6 leading-relaxed">
          {isBn
            ? "দুঃখিত, আপনি যে আর্টিকেলটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিঙ্কটি ভুল। আমাদের অন্যান্য ক্লিনিক্যাল গাইড দেখতে নিচের বাটনে ক্লিক করুন।"
            : "The clinical article you are looking for may have been removed or the link is incorrect. Please browse our dental guides library."}
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1c362b] hover:bg-[#14261e] text-white text-xs font-bold transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? "সকল ডেন্টাল গাইডে ফিরে যান" : "Browse All Guides"}</span>
        </Link>
      </div>
    );
  }

  const currentPost = post;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const relatedPosts = posts
    .filter((p) => p.id !== currentPost.id && p.departmentSlug === currentPost.departmentSlug)
    .slice(0, 2);

  const activeContentHtml = isBn ? currentPost.contentHtml?.bn : currentPost.contentHtml?.en;

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-zinc-900">
      {/* Header Banner */}
      <section className="bg-white border-b border-zinc-200/80 pt-10 sm:pt-14 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isBn ? "সকল ডেন্টাল গাইডে ফিরে যান" : "Back to All Guides"}</span>
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">{isBn ? "লিঙ্ক কপি হয়েছে" : "Link Copied!"}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isBn ? "শেয়ার করুন" : "Share Guide"}</span>
                </>
              )}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Tag className="w-3 h-3 text-emerald-700" />
              <span>
                {isBn
                  ? currentPost.departmentName?.bn || currentPost.departmentName?.en || "সাধারণ পরামর্শ"
                  : currentPost.departmentName?.en || "General Consultation"}
              </span>
            </span>

            <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{currentPost.readTime || "5 min read"}</span>
            </span>

            <span className="text-xs text-zinc-400">• {currentPost.date || "Updated 2026"}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight leading-tight">
            {isBn ? currentPost.title?.bn || currentPost.title?.en : currentPost.title?.en}
          </h1>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            {isBn ? currentPost.excerpt?.bn || currentPost.excerpt?.en : currentPost.excerpt?.en}
          </p>

          {/* Author Info */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600 font-medium">
              <User className="w-4 h-4 text-zinc-400" />
              <span>{isBn ? "পোস্ট করেছেন: " : "Posted by: "}</span>
              <span className="font-bold text-zinc-900">{isBn ? "এডমিন" : "Admin"}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isBn ? "ক্লিনিক্যাল যাচাইকৃত পরামর্শ" : "Clinically Verified Information"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cover Hero Image */}
      {currentPost.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pt-6">
          <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md border border-zinc-200/80 bg-zinc-950">
            <img
              src={currentPost.coverImage}
              alt={isBn ? currentPost.title.bn : currentPost.title.en}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Article Body */}
      <article className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* If rich HTML is provided, render it cleanly */}
          {activeContentHtml ? (
            <div
              className="kgh-blog-content bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-xs leading-relaxed text-zinc-800 text-sm sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: activeContentHtml }}
            />
          ) : currentPost.content ? (
            /* Structured Legacy View */
            <div className="bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-xs space-y-8">
              {/* Hook Callout */}
              <div className="p-6 rounded-2xl bg-zinc-50 border-l-4 border-[#1c362b] text-zinc-800 text-base font-medium italic leading-relaxed">
                &ldquo;{isBn ? currentPost.content.hook.bn : currentPost.content.hook.en}&rdquo;
              </div>

              {/* Overview */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                  {isBn ? "বিষয়টির সাধারণ পর্যালোচনা ও মূল সত্য" : "Clinical Overview & Key Facts"}
                </h2>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                  {isBn ? currentPost.content.overview.bn : currentPost.content.overview.en}
                </p>
              </div>

              {/* Key Points or Symptoms */}
              {currentPost.content.symptomsOrOptions.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                    {isBn ? "গুরুত্বপূর্ণ বিষয় ও লক্ষণসমূহ" : "Key Insights & Patient Options"}
                  </h2>
                  <div className="grid grid-cols-1 gap-3">
                    {currentPost.content.symptomsOrOptions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-zinc-50/70 border border-zinc-200 flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <p className="text-sm text-zinc-800 leading-relaxed">
                          {isBn ? item.bn : item.en}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedure or Expectations */}
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-950 tracking-tight">
                  {isBn ? "চিকিৎসার সময় কী প্রত্যাশা করবেন?" : "What to Expect During Clinical Treatment"}
                </h2>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                  {isBn
                    ? currentPost.content.procedureOrExpectations.bn
                    : currentPost.content.procedureOrExpectations.en}
                </p>
              </div>

              {/* Prevention or Aftercare */}
              <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{isBn ? "প্রতিরোধ ও পরবর্তী যত্ন" : "Prevention & Post-Op Aftercare"}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-900">
                  {isBn
                    ? currentPost.content.preventionOrAftercare.bn
                    : currentPost.content.preventionOrAftercare.en}
                </p>
              </div>
            </div>
          ) : null}

          {/* Doctor Consultation Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1c362b] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                {isBn ? "ব্যক্তিগত ডেন্টাল পরামর্শ" : "Personalized Dental Consultation"}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {isBn
                  ? "আপনার দাঁতের সমস্যা নিয়ে বিশেষজ্ঞের পরামর্শ চান?"
                  : "Have specific concerns about this dental issue?"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-lg">
                {isBn
                  ? "কেজিএইচ ডেন্টালের বিশেষজ্ঞ ডেন্টাল সার্জনদের সাথে সরাসরি কথা বলে সঠিক চিকিৎসা পরিকল্পনা গ্রহণ করুন।"
                  : "Schedule a thorough clinical evaluation with our specialist team at Banani, Dhaka."}
              </p>
            </div>

            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors shrink-0"
            >
              <span>{isBn ? "সিরিয়াল নিন" : "Book an Appointment"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="pt-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-950">
                {isBn ? "একই বিভাগের অন্যান্য গাইড" : "Related Dental Guides"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="p-5 rounded-2xl bg-white border border-zinc-200 hover:shadow-md transition-all block group"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {isBn ? r.departmentName?.bn || r.departmentName?.en : r.departmentName?.en}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 group-hover:text-[#1c362b] mt-2 line-clamp-2">
                      {isBn ? r.title?.bn || r.title?.en : r.title?.en}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                      {isBn ? r.excerpt?.bn || r.excerpt?.en : r.excerpt?.en}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      <CtaBanner />
    </div>
  );
}
