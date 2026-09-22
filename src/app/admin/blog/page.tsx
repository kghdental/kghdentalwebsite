"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Tag,
  Search,
  X,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { BlogPost } from "@/types";
import {
  fetchLiveBlogPosts,
  saveLiveBlogPost,
  deleteLiveBlogPost,
  ENRICHED_BLOG_POSTS,
} from "@/lib/api/db";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(ENRICHED_BLOG_POSTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Active language tab in rich editor
  const [activeLangTab, setActiveLangTab] = useState<"en" | "bn">("en");

  // Cover Image picker modal
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadBlogs = () => {
      fetchLiveBlogPosts().then((live) => {
        if (live && live.length > 0) {
          setPosts(live);
        }
      });
    };
    loadBlogs();

    window.addEventListener("kgh_blogs_updated", loadBlogs);
    window.addEventListener("storage", loadBlogs);
    return () => {
      window.removeEventListener("kgh_blogs_updated", loadBlogs);
      window.removeEventListener("storage", loadBlogs);
    };
  }, []);

  const [formData, setFormData] = useState<BlogPost>({
    id: "",
    slug: "",
    title: { en: "", bn: "" },
    excerpt: { en: "", bn: "" },
    coverImage: "/images/sub_services/3. 1. Root Canal Treatment.png",
    departmentSlug: "endodontics",
    departmentName: { en: "Endodontics", bn: "এন্ডোডন্টিক্স" },
    readTime: "5 min read",
    date: "Updated 2026",
    targetKeyword: "dental care",
    authorName: { en: "Admin", bn: "এডমিন" },
    authorRole: { en: "Admin", bn: "এডমিন" },
    authorPhotoUrl: "",
    tags: ["dental", "kgh dental"],
    contentHtml: { en: "", bn: "" },
  });

  const handleOpenAdd = () => {
    setEditingPost(null);
    const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `blog-${Date.now()}`;
    setFormData({
      id: newId,
      slug: `guide-${Date.now()}`,
      title: { en: "", bn: "" },
      excerpt: { en: "", bn: "" },
      coverImage: "/images/sub_services/3. 1. Root Canal Treatment.png",
      departmentSlug: "endodontics",
      departmentName: { en: "Endodontics", bn: "এন্ডোডন্টিক্স" },
      readTime: "5 min read",
      date: "September 2026",
      targetKeyword: "dental clinic Dhaka",
      authorName: { en: "Admin", bn: "এডমিন" },
      authorRole: { en: "Admin", bn: "এডমিন" },
      authorPhotoUrl: "",
      contentHtml: {
        en: `<h2>Understanding Your Dental Health</h2><p>Start typing your clinical guidance here. You can select any text to make it Bold, Italic, a Heading, or a Bullet List using the toolbar above.</p>`,
        bn: `<h2>দাঁতের স্বাস্থ্য ও প্রাথমিক তথ্য</h2><p>এখানে বাংলায় আপনার চিকিৎসাগত পরামর্শ লিখুন। ওপরের টুলবার ব্যবহার করে যেকোনো লেখাকে বোল্ড, হেডিং বা লিস্ট আকারে সাজাতে পারেন।</p>`,
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    // If post only had legacy content, pre-populate contentHtml nicely
    let htmlEn = post.contentHtml?.en || "";
    let htmlBn = post.contentHtml?.bn || "";

    if (!htmlEn && post.content) {
      htmlEn = `
<blockquote class="kgh-quote">
  <p>"${post.content.hook.en}"</p>
</blockquote>
<h2>Clinical Overview</h2>
<p>${post.content.overview.en}</p>
${
  post.content.symptomsOrOptions.length > 0
    ? `<h3>Key Clinical Insights</h3>
<ul>
  ${post.content.symptomsOrOptions.map((s) => `<li>${s.en}</li>`).join("\n  ")}
</ul>`
    : ""
}
<h2>What to Expect During Treatment</h2>
<p>${post.content.procedureOrExpectations.en}</p>
<div class="kgh-tip">
  <strong>💡 Aftercare Guidance:</strong> ${post.content.preventionOrAftercare.en}
</div>`;
    }

    if (!htmlBn && post.content) {
      htmlBn = `
<blockquote class="kgh-quote">
  <p>"${post.content.hook.bn}"</p>
</blockquote>
<h2>ক্লিনিক্যাল পর্যালোচনা</h2>
<p>${post.content.overview.bn}</p>
${
  post.content.symptomsOrOptions.length > 0
    ? `<h3>গুরুত্বপূর্ণ তথ্য ও বিকল্পসমূহ</h3>
<ul>
  ${post.content.symptomsOrOptions.map((s) => `<li>${s.bn}</li>`).join("\n  ")}
</ul>`
    : ""
}
<h2>চিকিৎসা চলাকালে কী প্রত্যাশা করবেন</h2>
<p>${post.content.procedureOrExpectations.bn}</p>
<div class="kgh-tip">
  <strong>💡 চিকিৎসা পরবর্তী যত্ন:</strong> ${post.content.preventionOrAftercare.bn}
</div>`;
    }

    setFormData({
      ...post,
      contentHtml: {
        en: htmlEn,
        bn: htmlBn,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete "${post.title.en || post.slug}"? This will delete it permanently from the database.`)) {
      setPosts(posts.filter((p) => p.id !== post.id && p.slug !== post.slug));
      await deleteLiveBlogPost(post.id, post.slug);
      setSaveStatus("Article deleted from database successfully.");
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-calculate reading time if default
    const wordCount = (formData.contentHtml?.en || formData.contentHtml?.bn || "")
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/).length;
    const estTime = `${Math.max(3, Math.ceil(wordCount / 160))} min read`;

    const updatedPost: BlogPost = {
      ...formData,
      readTime: estTime,
    };

    const originalSlug = editingPost ? editingPost.slug : undefined;
    const originalId = editingPost ? editingPost.id : undefined;

    if (editingPost) {
      // In-place update: match by existing ID or slug
      setPosts(
        posts.map((p) =>
          (originalId && p.id === originalId) || (originalSlug && p.slug === originalSlug)
            ? updatedPost
            : p
        )
      );
    } else {
      setPosts([updatedPost, ...posts]);
    }

    setIsModalOpen(false);
    setSaveStatus(editingPost ? "Article updated successfully in database!" : "New article published successfully!");
    setTimeout(() => setSaveStatus(null), 3500);

    // Save with explicit originalSlug & originalId to prevent duplicate row creation
    await saveLiveBlogPost(updatedPost, originalSlug, originalId);

    const refreshed = await fetchLiveBlogPosts();
    if (refreshed && refreshed.length > 0) {
      setPosts(refreshed);
    }
  };

  // Department metadata map
  const DEPT_NAMES: Record<string, { en: string; bn: string }> = {
    endodontics: { en: "Endodontics", bn: "এন্ডোডন্টিক্স (রুট ক্যানেল)" },
    orthodontics: { en: "Orthodontics", bn: "অর্থোডন্টিক্স (ব্রেসেস)" },
    "oral-surgery": { en: "Oral Surgery", bn: "ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি" },
    prosthodontics: { en: "Prosthodontics", bn: "প্রস্থোডন্টিক্স (ক্রাউন ও ব্রিজ)" },
    pediatric: { en: "Pediatric Dentistry", bn: "শিশু দন্ত চিকিৎসা" },
    periodontics: { en: "Periodontics", bn: "পেরিওডন্টিক্স (মাড়ির রোগ)" },
    "oral-medicine": { en: "Oral Medicine", bn: "ওরাল মেডিসিন ও ডায়াগনোসিস" },
    "general-consultation": { en: "General Consultation", bn: "সাধারণ ডেন্টাল পরামর্শ" },
  };

  const filteredPosts = posts.filter((p) => {
    const matchesDept = selectedDeptFilter === "all" || p.departmentSlug === selectedDeptFilter;
    const matchesSearch =
      p.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.bn.includes(searchQuery) ||
      p.departmentName.en.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Patient Education & SEO Content
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Clinical Blog Articles ({posts.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Publish and edit evidence-based dental guides with rich text, embedded illustrations, and videos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-zinc-200">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search guides by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs w-60 sm:w-80 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs font-medium focus:outline-none"
          >
            <option value="all">All Departments</option>
            {Object.entries(DEPT_NAMES).map(([slug, names]) => (
              <option key={slug} value={slug}>
                {names.en}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-zinc-500 font-semibold">
          Showing {filteredPosts.length} of {posts.length} articles
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Card Cover Image */}
            <div className="aspect-16/9 w-full bg-zinc-100 overflow-hidden relative group">
              <img
                src={post.coverImage || "/images/departments/consultation-cta.jpg"}
                alt={post.title.en}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/70 text-white backdrop-blur-md">
                {post.departmentName.en}
              </span>
              <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-zinc-800 backdrop-blur-md">
                {post.readTime}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-zinc-950 leading-snug line-clamp-2">
                  {post.title.en}
                </h3>
                <p className="text-xs text-zinc-500 font-medium line-clamp-1">{post.title.bn}</p>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {post.excerpt.en}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-1.5 text-zinc-600 hover:text-black rounded-lg hover:bg-zinc-100 cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(post)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================================== */}
      {/* FULL RICH TEXT BLOG EDITOR MODAL */}
      {/* ============================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 my-auto max-h-[95vh] overflow-y-auto space-y-6">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Doctor CMS Workspace
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-950 mt-1">
                  {editingPost ? "Edit Dental Guide" : "Write New Dental Guide"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
              {/* SECTION 1: COVER IMAGE BANNER */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Article Featured Cover Image *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-full sm:w-56 aspect-16/9 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-300 relative shrink-0">
                    <img
                      src={formData.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setIsCoverPickerOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-bold border border-zinc-300 shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      <span>Upload or Pick Cover Photo</span>
                    </button>
                    <p className="text-[11px] text-zinc-500">
                      High-resolution landscape photo recommended. Appears at the top of the article and in blog card listings.
                    </p>
                    <span className="text-[10px] text-zinc-400 block truncate max-w-md">
                      {formData.coverImage}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: TITLES & SLUG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Article Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title.en}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        title: { ...formData.title, en: val },
                        slug:
                          formData.slug && !formData.slug.startsWith("guide-")
                            ? formData.slug
                            : val
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:border-zinc-950 focus:outline-none"
                    placeholder="e.g. Root Canal Treatment: What to Really Expect"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Article Title (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: { ...formData.title, bn: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm font-medium focus:border-zinc-950 focus:outline-none"
                    placeholder="e.g. রুট ক্যানেল ট্রিটমেন্ট: প্রচলিত ভুল ধারণা বনাম আসল সত্য"
                  />
                </div>
              </div>

              {/* SECTION 3: DEPARTMENT, SLUG & AUTHOR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Department Category *
                  </label>
                  <select
                    value={formData.departmentSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      const names = DEPT_NAMES[slug] || {
                        en: "General Dentistry",
                        bn: "সাধারণ পরামর্শ",
                      };
                      setFormData({
                        ...formData,
                        departmentSlug: slug,
                        departmentName: names,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white text-xs font-medium focus:outline-none"
                  >
                    {Object.entries(DEPT_NAMES).map(([slug, names]) => (
                      <option key={slug} value={slug}>
                        {names.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Author / Specialist
                  </label>
                  <input
                    type="text"
                    value={formData.authorName?.en || "Admin"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authorName: {
                          en: e.target.value,
                          bn: formData.authorName?.bn || (e.target.value === "Admin" ? "এডমিন" : e.target.value),
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs"
                    placeholder="e.g. Admin"
                  />
                </div>
              </div>

              {/* SECTION 4: EXCERPT / SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Short Excerpt (English) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.excerpt.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        excerpt: { ...formData.excerpt, en: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed"
                    placeholder="Brief 2-sentence summary for search and previews..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Short Excerpt (Bengali) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.excerpt.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        excerpt: { ...formData.excerpt, bn: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs leading-relaxed"
                    placeholder="বাংলায় সংক্ষিপ্ত দুই লাইনের ভূমিকা..."
                  />
                </div>
              </div>

              {/* SECTION 5: RICH TEXT EDITOR BODY */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Article Body (Rich Text Editor)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Includes headings, formatted lists, clinical quotes, inline photos, and video embeds
                    </span>
                  </div>

                  {/* Language Tab Switcher */}
                  <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-100 border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setActiveLangTab("en")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeLangTab === "en"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      }`}
                    >
                      English Body
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLangTab("bn")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeLangTab === "bn"
                          ? "bg-white text-zinc-950 shadow-2xs"
                          : "text-zinc-600 hover:text-zinc-950"
                      }`}
                    >
                      বাংলা কনটেন্ট
                    </button>
                  </div>
                </div>

                {activeLangTab === "en" ? (
                  <RichTextEditor
                    label="English Article Body"
                    value={formData.contentHtml?.en || ""}
                    onChange={(html) =>
                      setFormData({
                        ...formData,
                        contentHtml: {
                          en: html,
                          bn: formData.contentHtml?.bn || "",
                        },
                      })
                    }
                    placeholder="Write your in-depth clinical advice in English..."
                  />
                ) : (
                  <RichTextEditor
                    label="বাংলা আর্টিকেল বডি"
                    value={formData.contentHtml?.bn || ""}
                    onChange={(html) =>
                      setFormData({
                        ...formData,
                        contentHtml: {
                          en: formData.contentHtml?.en || "",
                          bn: html,
                        },
                      })
                    }
                    placeholder="দাঁতের চিকিৎসা, উপসর্গ ও প্রতিরোধ নিয়ে বিস্তারিত বাংলায় লিখুন..."
                  />
                )}
              </div>

              {/* Form Bottom Actions */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  Changes save to your local browser storage immediately and sync with Supabase when active.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 rounded-xl cursor-pointer hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish / Save Article</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cover Image Picker Modal */}
      <MediaPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        onSelect={(url) => {
          setFormData({ ...formData, coverImage: url });
          setIsCoverPickerOpen(false);
        }}
        title="Select Article Cover Photo"
        currentValue={formData.coverImage}
      />
    </div>
  );
}
