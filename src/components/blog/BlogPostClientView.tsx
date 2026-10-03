"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Check,
  Phone,
  Sparkles,
  ArrowRight,
  User,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CtaBanner } from "@/components/home/CtaBanner";
import { BlogPost } from "@/types";
import DOMPurify from "isomorphic-dompurify";

interface BlogPostClientViewProps {
  initialPost: BlogPost;
  relatedPosts: BlogPost[];
}

export function BlogPostClientView({ initialPost, relatedPosts }: BlogPostClientViewProps) {
  const { isBn } = useLanguage();
  const [post, setPost] = useState<BlogPost>(initialPost);
  const [isCopied, setIsCopied] = useState(false);

  // Sync if updated in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("kgh_blog_posts");
        if (cached) {
          const list: BlogPost[] = JSON.parse(cached);
          const found = list.find((p) => p.slug === initialPost.slug || p.id === initialPost.id);
          if (found) setPost(found);
        }
      } catch {
        // ignore
      }
    }
  }, [initialPost.slug, initialPost.id]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const activeContentHtml = isBn
    ? post.contentHtml?.bn || post.contentHtml?.en
    : post.contentHtml?.en || post.contentHtml?.bn;

  const safeContentHtml = React.useMemo(() => {
    if (!activeContentHtml) return "";
    try {
      return DOMPurify.sanitize(activeContentHtml, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target"],
      });
    } catch {
      return activeContentHtml;
    }
  }, [activeContentHtml]);

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
              type="button"
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
                  ? post.departmentName?.bn || post.departmentName?.en || "সাধারণ পরামর্শ"
                  : post.departmentName?.en || "General Consultation"}
              </span>
            </span>

            <span className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{post.readTime || "5 min read"}</span>
            </span>

            <span className="text-xs text-zinc-400">• {post.date || "Updated 2026"}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#1a2f23] tracking-tight leading-tight">
            {isBn ? post.title?.bn || post.title?.en : post.title?.en}
          </h1>

          {/* Excerpt */}
          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
            {isBn ? post.excerpt?.bn || post.excerpt?.en : post.excerpt?.en}
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
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pt-6">
          <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-md border border-zinc-200/80 bg-zinc-950">
            <img
              src={post.coverImage}
              alt={isBn ? post.title?.bn || post.title?.en : post.title?.en}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Content Article Body */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Rich HTML Content */}
        {safeContentHtml ? (
          <div
            className="prose prose-zinc prose-sm sm:prose-base lg:prose-lg max-w-none
              prose-headings:text-[#1a2f23] prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-200/60 prose-h2:pb-2
              prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-zinc-700 prose-p:leading-relaxed prose-p:mb-5
              prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
              prose-li:text-zinc-700 prose-li:my-1.5
              prose-strong:text-zinc-900 prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50/50 prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:italic
              prose-table:w-full prose-table:border-collapse prose-table:my-6
              prose-th:bg-zinc-100 prose-th:p-3 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:border prose-th:border-zinc-200
              prose-td:p-3 prose-td:text-xs prose-td:border prose-td:border-zinc-200"
            dangerouslySetInnerHTML={{ __html: safeContentHtml }}
          />
        ) : (
          <div className="py-12 text-center text-zinc-500 text-sm">
            {isBn ? "কন্টেন্ট লোড হচ্ছে..." : "Loading content..."}
          </div>
        )}

        {/* Doctor Verification Footer Badge */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#1c362b]/5 border border-[#1c362b]/15 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#1c362b] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {isBn
                  ? "চিকিৎসা সংক্রান্ত দাবিত্যাগ ও পর্যালোচনা"
                  : "Medical Disclaimer & Clinical Review"}
              </span>
            </h4>
            <p className="text-xs text-zinc-600 max-w-xl leading-relaxed">
              {isBn
                ? "এই আর্টিকেলের সমস্ত তথ্য সাধারণ সচেতনতা এবং ডেন্টাল শিক্ষার উদ্দেশ্যে রচিত। সঠিক রোগ নির্ণয় ও চিকিৎসা পরিকল্পনার জন্য সরাসরি আমাদের রেজিস্টার্ড ডেন্টিস্টের পরামর্শ নিন।"
                : "All health content is medically reviewed by certified dental specialists at KGH Dental. Always consult a certified dentist for clinical diagnosis and customized treatment plans."}
            </p>
          </div>
          <Link
            href="/appointment"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1c362b] hover:bg-[#14261e] text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>{isBn ? "সিরিয়াল বুক করুন" : "Consult a Doctor"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>

      {/* Related Clinical Articles */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="bg-white border-t border-zinc-200/80 py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
                  {isBn ? "সম্পর্কিত গাইড" : "Recommended Reading"}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 mt-1">
                  {isBn ? "অন্যান্য প্রয়োজনীয় পরামর্শ" : "Related Dental Guides"}
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
              >
                <span>{isBn ? "সকল গাইড" : "View All"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 hover:bg-emerald-50/40 hover:border-emerald-200 transition-all block group"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
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
        </section>
      )}

      {/* Global CTA Appointment Banner */}
      <CtaBanner />
    </div>
  );
}
