"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Plus,
  Play,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { FeaturedVideo, VideoCategory } from "@/types";
import {
  fetchLiveVideos,
  saveLiveVideo,
  deleteLiveVideo,
  parseVideoUrl,
} from "@/lib/api/db";

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<FeaturedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<FeaturedVideo | null>(null);
  const [previewModalVideo, setPreviewModalVideo] = useState<FeaturedVideo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formTitleBn, setFormTitleBn] = useState("");
  const [formCategory, setFormCategory] = useState<VideoCategory>("treatment_guide");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formAspectRatio, setFormAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [formPlatform, setFormPlatform] = useState<"youtube" | "facebook">("youtube");
  const [formIsActive, setFormIsActive] = useState(true);
  const [urlParseError, setUrlParseError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLiveVideos(true);
    setVideos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormVideoUrl("");
    setFormTitleEn("");
    setFormTitleBn("");
    setFormCategory("treatment_guide");
    setFormThumbnailUrl("");
    setFormAspectRatio("16:9");
    setFormPlatform("youtube");
    setFormIsActive(true);
    setUrlParseError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (video: FeaturedVideo) => {
    setEditingVideo(video);
    setFormVideoUrl(video.videoUrl);
    setFormTitleEn(video.title.en);
    setFormTitleBn(video.title.bn);
    setFormCategory(video.category);
    setFormThumbnailUrl(video.thumbnailUrl || "");
    setFormAspectRatio(video.aspectRatio);
    setFormPlatform(video.platform);
    setFormIsActive(video.isActive);
    setUrlParseError("");
    setIsModalOpen(true);
  };

  // Handle URL change & auto-detection
  const handleUrlChange = (url: string) => {
    setFormVideoUrl(url);
    if (!url.trim()) {
      setUrlParseError("");
      return;
    }

    const parsed = parseVideoUrl(url);
    if (parsed.isValid) {
      setUrlParseError("");
      setFormPlatform(parsed.platform);
      setFormAspectRatio(parsed.aspectRatio);
      if (parsed.thumbnailUrl && !formThumbnailUrl) {
        setFormThumbnailUrl(parsed.thumbnailUrl);
      }
    } else {
      setUrlParseError(parsed.error || "Invalid video URL");
    }
  };

  // Submit Save
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVideoUrl.trim() || !formTitleEn.trim()) {
      alert("Please fill in Video URL and English Title.");
      return;
    }

    const parsed = parseVideoUrl(formVideoUrl);
    if (!parsed.isValid) {
      setUrlParseError(parsed.error || "Please enter a valid YouTube or Facebook video link.");
      return;
    }

    setIsSaving(true);
    const videoPayload: FeaturedVideo = {
      id: editingVideo ? editingVideo.id : `vid-${Date.now()}`,
      title: {
        en: formTitleEn.trim(),
        bn: formTitleBn.trim() || formTitleEn.trim(),
      },
      videoUrl: formVideoUrl.trim(),
      embedUrl: parsed.embedUrl,
      platform: formPlatform,
      aspectRatio: formAspectRatio,
      thumbnailUrl: formThumbnailUrl.trim() || parsed.thumbnailUrl || "",
      category: formCategory,
      isActive: formIsActive,
      sortOrder: editingVideo ? editingVideo.sortOrder : videos.length + 1,
    };

    const res = await saveLiveVideo(videoPayload);
    setIsSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      await loadData();
      showToast(editingVideo ? "Video updated successfully!" : "New video added to homepage!");
    } else {
      alert("Failed to save video: " + (res.error || "Unknown error"));
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (video: FeaturedVideo) => {
    const updated = { ...video, isActive: !video.isActive };
    await saveLiveVideo(updated);
    await loadData();
    showToast(updated.isActive ? "Video published to homepage!" : "Video hidden from homepage.");
  };

  // Delete Video
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this video from the homepage showcase?")) {
      return;
    }
    await deleteLiveVideo(id);
    await loadData();
    showToast("Video deleted.");
  };

  const filteredVideos = videos.filter((v) => {
    const matchesCategory = categoryFilter === "all" || v.category === categoryFilter;
    const matchesSearch =
      v.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.title.bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.videoUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-zinc-950 text-white shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            HOMEPAGE CMS & MEDIA
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Video Showcase & Clinical Reels
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
            Display YouTube videos, Shorts, and Facebook Reels on your homepage by simply pasting share links.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video Link</span>
        </button>
      </div>

      {/* Quick Info Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-zinc-600 space-y-1">
          <p className="font-bold text-zinc-900">
            Smart URL Auto-Detection Enabled
          </p>
          <p>
            You can paste standard YouTube videos (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">youtube.com/watch?v=...</code>, unlisted links, or <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">youtu.be/...</code>), YouTube Shorts (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">youtube.com/shorts/...</code>), or Facebook Reels (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded text-[11px]">facebook.com/reel/...</code>). The system auto-generates HD thumbnails and responsive players without using server storage.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm focus:outline-none focus:border-zinc-500 bg-white"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "treatment_guide", label: "Treatment Guides" },
            { id: "doctor_advice", label: "Doctor Advice" },
            { id: "patient_story", label: "Patient Stories" },
            { id: "clinic_tour", label: "Clinic Tour" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Videos List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-zinc-200 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-dashed border-zinc-300">
          <Video className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-900">No Videos Found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Click &ldquo;Add Video Link&rdquo; above to add your first YouTube video or Facebook Reel to the homepage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => {
            const isYouTube = video.platform === "youtube";
            return (
              <div
                key={video.id}
                className={`rounded-2xl border bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  video.isActive ? "border-zinc-200" : "border-zinc-200 opacity-60 bg-zinc-50"
                }`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-zinc-900 overflow-hidden group">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title.en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400">
                      <Video className="w-10 h-10" />
                    </div>
                  )}

                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewModalVideo(video)}
                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 cursor-pointer"
                    title="Preview Video Player"
                  >
                    <Play className="w-5 h-5 fill-white translate-x-0.5" />
                  </button>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                      {video.category.replace("_", " ").toUpperCase()}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                        isYouTube ? "bg-red-600" : "bg-blue-600"
                      }`}
                    >
                      {isYouTube ? "YouTube" : "Facebook"}
                      {video.aspectRatio === "9:16" && " (Reel)"}
                    </span>
                  </div>

                  {/* Active / Hidden indicator */}
                  {!video.isActive && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold">
                      Hidden from Homepage
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950 line-clamp-1">
                      {video.title.en}
                    </h3>
                    <p className="text-xs text-zinc-600 font-medium line-clamp-1 mt-0.5">
                      {video.title.bn}
                    </p>
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 font-mono truncate max-w-full mt-2"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{video.videoUrl}</span>
                    </a>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(video)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        video.isActive
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {video.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(video)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Edit Video"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(video.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT VIDEO MODAL                                                    */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  {editingVideo ? "Edit Video Details" : "Add New Video to Homepage"}
                </h3>
                <p className="text-xs text-zinc-500">
                  Paste the YouTube or Facebook link and configure display options.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-5 sm:p-6 space-y-4">
              {/* Video URL Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Video Share URL (YouTube or Facebook) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.facebook.com/reel/..."
                  value={formVideoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                    urlParseError ? "border-red-400 bg-red-50/50" : "border-zinc-300 focus:border-zinc-700"
                  }`}
                />
                {urlParseError ? (
                  <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{urlParseError}</span>
                  </p>
                ) : (
                  formVideoUrl.trim() && (
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Detected {formPlatform === "youtube" ? "YouTube" : "Facebook"} (
                        {formAspectRatio === "9:16" ? "9:16 Vertical Reel" : "16:9 Standard"})
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Rotary Root Canal Therapy"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Title (Bengali)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. আধুনিক রোটারি রুট ক্যানেল চিকিৎসা"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm"
                  />
                </div>
              </div>

              {/* Category & Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as VideoCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm bg-white"
                  >
                    <option value="treatment_guide">Treatment Guide (চিকিৎসা পদ্ধতি)</option>
                    <option value="doctor_advice">Doctor Advice & Reels (পরামর্শ ও রিলস)</option>
                    <option value="patient_story">Patient Story (রোগীর অভিজ্ঞতা)</option>
                    <option value="clinic_tour">Clinic & Sterile Tour (চেম্বার পরিদর্শন)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Player Aspect Ratio
                  </label>
                  <select
                    value={formAspectRatio}
                    onChange={(e) => setFormAspectRatio(e.target.value as "16:9" | "9:16")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm bg-white"
                  >
                    <option value="16:9">16:9 Widescreen (YouTube Video / Landscape)</option>
                    <option value="9:16">9:16 Portrait (Facebook Reel / YouTube Shorts)</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail URL Input (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Custom Thumbnail URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Auto-extracted for YouTube, or paste custom image URL"
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  If left blank, YouTube thumbnails are fetched automatically. For Facebook videos, you can provide an image URL from the media library or website.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-800"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-zinc-800 cursor-pointer">
                  Display this video immediately in the Homepage Video Showcase section
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer disabled:bg-zinc-600"
                >
                  {isSaving ? "Saving..." : editingVideo ? "Update Video" : "Publish Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEST / PREVIEW PLAYER MODAL                                               */}
      {/* ========================================================================= */}
      {previewModalVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewModalVideo(null);
            }
          }}
        >
          <div
            className={`relative w-full rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col ${
              previewModalVideo.aspectRatio === "9:16"
                ? "max-w-md h-[80vh] max-h-[750px]"
                : "max-w-4xl aspect-video"
            }`}
          >
            <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-white">
              <span className="text-xs font-bold truncate">
                Preview: {previewModalVideo.title.en}
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalVideo(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full h-full relative bg-black">
              <iframe
                src={previewModalVideo.embedUrl}
                title={previewModalVideo.title.en}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
