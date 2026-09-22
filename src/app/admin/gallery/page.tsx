"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Tag,
  X,
  Upload,
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowLeftRight,
  Eye,
} from "lucide-react";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { GalleryItem, BeforeAfterItem } from "@/types";
import {
  fetchLiveGalleryItems,
  saveLiveGalleryItem,
  deleteLiveGalleryItem,
  INITIAL_GALLERY,
  fetchLiveBeforeAfterItems,
  saveLiveBeforeAfterItem,
  deleteLiveBeforeAfterItem,
  INITIAL_BEFORE_AFTER,
} from "@/lib/api/db";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"chamber" | "beforeAfter">("chamber");

  // Chamber & Team items state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>("all");
  const [gallerySearchQuery, setGallerySearchQuery] = useState("");

  // Before & After cases state
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>(INITIAL_BEFORE_AFTER);
  const [isBAModalOpen, setIsBAModalOpen] = useState(false);
  const [editingBAItem, setEditingBAItem] = useState<BeforeAfterItem | null>(null);
  const [baSearchQuery, setBASearchQuery] = useState("");

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"gallery" | "baBefore" | "baAfter">("gallery");

  useEffect(() => {
    fetchLiveGalleryItems().then((live) => {
      if (live && live.length > 0) {
        setGalleryItems(live);
      }
    });

    fetchLiveBeforeAfterItems().then((liveBA) => {
      if (liveBA && liveBA.length > 0) {
        setBeforeAfterItems(liveBA);
      }
    });
  }, []);

  // Form data for Gallery photo
  const [galleryForm, setGalleryForm] = useState<GalleryItem>({
    id: "",
    title: { en: "", bn: "" },
    category: "clinic",
    desc: { en: "", bn: "" },
    imageUrl: "/images/departments/consultation-cta.jpg",
  });

  // Form data for Before & After case
  const [baForm, setBAForm] = useState<BeforeAfterItem>({
    id: "",
    title: { en: "", bn: "" },
    category: "Periodontics",
    beforeImageUrl: "/images/gallery/scaling-before.jpg",
    afterImageUrl: "/images/gallery/scaling-after.jpg",
    desc: { en: "", bn: "" },
    sortOrder: 1,
  });

  // --------------------------------------------------------------------------
  // Gallery Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddGallery = () => {
    setEditingGalleryItem(null);
    setGalleryForm({
      id: `gal-${Date.now()}`,
      title: { en: "", bn: "" },
      category: "clinic",
      desc: { en: "", bn: "" },
      imageUrl: "/images/departments/consultation-cta.jpg",
    });
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryForm(item);
    setIsGalleryModalOpen(true);
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm("Are you sure you want to delete this gallery photo?")) {
      setGalleryItems(galleryItems.filter((i) => i.id !== id));
      await deleteLiveGalleryItem(id);
    }
  };

  const handleSubmitGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGalleryItem) {
      setGalleryItems(galleryItems.map((i) => (i.id === editingGalleryItem.id ? galleryForm : i)));
    } else {
      setGalleryItems([galleryForm, ...galleryItems]);
    }
    setIsGalleryModalOpen(false);
    await saveLiveGalleryItem(galleryForm);
    const refreshed = await fetchLiveGalleryItems();
    if (refreshed && refreshed.length > 0) {
      setGalleryItems(refreshed);
    }
  };

  // --------------------------------------------------------------------------
  // Before & After Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddBA = () => {
    setEditingBAItem(null);
    setBAForm({
      id: `ba-${Date.now()}`,
      title: { en: "", bn: "" },
      category: "Periodontics",
      beforeImageUrl: "/images/gallery/scaling-before.jpg",
      afterImageUrl: "/images/gallery/scaling-after.jpg",
      desc: { en: "", bn: "" },
      sortOrder: beforeAfterItems.length + 1,
    });
    setIsBAModalOpen(true);
  };

  const handleOpenEditBA = (item: BeforeAfterItem) => {
    setEditingBAItem(item);
    setBAForm(item);
    setIsBAModalOpen(true);
  };

  const handleDeleteBA = async (id: string) => {
    if (confirm("Are you sure you want to delete this Before & After case?")) {
      setBeforeAfterItems(beforeAfterItems.filter((i) => i.id !== id));
      await deleteLiveBeforeAfterItem(id);
    }
  };

  const handleSubmitBA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBAItem) {
      setBeforeAfterItems(beforeAfterItems.map((i) => (i.id === editingBAItem.id ? baForm : i)));
    } else {
      setBeforeAfterItems([...beforeAfterItems, baForm]);
    }
    setIsBAModalOpen(false);
    await saveLiveBeforeAfterItem(baForm);
    const refreshed = await fetchLiveBeforeAfterItems();
    if (refreshed && refreshed.length > 0) {
      setBeforeAfterItems(refreshed);
    }
  };

  // Media Picker Callback
  const handleSelectMedia = (url: string) => {
    if (mediaPickerTarget === "gallery") {
      setGalleryForm({ ...galleryForm, imageUrl: url });
    } else if (mediaPickerTarget === "baBefore") {
      setBAForm({ ...baForm, beforeImageUrl: url });
    } else if (mediaPickerTarget === "baAfter") {
      setBAForm({ ...baForm, afterImageUrl: url });
    }
    setIsMediaPickerOpen(false);
  };

  // Filtered lists
  const filteredGallery = galleryItems.filter((item) => {
    const matchesCategory =
      galleryCategoryFilter === "all" || item.category === galleryCategoryFilter;
    const matchesSearch =
      item.title.en.toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
      item.title.bn.toLowerCase().includes(gallerySearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredBA = beforeAfterItems.filter((item) => {
    return (
      item.title.en.toLowerCase().includes(baSearchQuery.toLowerCase()) ||
      item.title.bn.toLowerCase().includes(baSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(baSearchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Visual Media & Clinical Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Gallery & Case Results CMS
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Manage Chamber & Team photos, clinic operatory suites, and interactive Before & After patient results.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-200/80 border border-zinc-300/80 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("chamber")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "chamber"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Chamber & Team ({galleryItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("beforeAfter")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "beforeAfter"
                ? "bg-white text-zinc-950 shadow-sm"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Before & After ({beforeAfterItems.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: CHAMBER & TEAM PHOTOS */}
      {/* ==================================================================== */}
      {activeTab === "chamber" && (
        <div className="space-y-6">
          {/* Sub Header / Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-zinc-200">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={gallerySearchQuery}
                  onChange={(e) => setGallerySearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs w-48 sm:w-60 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <select
                value={galleryCategoryFilter}
                onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-300 bg-white text-xs font-medium focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="clinic">Clinic / Treatment</option>
                <option value="team">Team</option>
                <option value="chamber">Chamber & Setup</option>
                <option value="sterilization">Sterilization</option>
              </select>
            </div>

            <button
              onClick={handleOpenAddGallery}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chamber Photo</span>
            </button>
          </div>

          {/* Gallery Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="aspect-4/3 w-full bg-zinc-100 overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title.en}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-zinc-950 line-clamp-1">
                      {item.title.en}
                    </h3>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{item.title.bn}</p>
                    {item.desc?.en && (
                      <p className="text-[11px] text-zinc-600 line-clamp-2 pt-1">{item.desc.en}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenEditGallery(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-black cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteGallery(item.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: BEFORE & AFTER CASES */}
      {/* ==================================================================== */}
      {activeTab === "beforeAfter" && (
        <div className="space-y-6">
          {/* Sub Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-zinc-200">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Before & After cases..."
                value={baSearchQuery}
                onChange={(e) => setBASearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs w-60 sm:w-80 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <button
              onClick={handleOpenAddBA}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Before & After Case</span>
            </button>
          </div>

          {/* BA Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBA.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between p-4 space-y-4"
              >
                {/* Mini Slider Preview */}
                <div className="rounded-2xl overflow-hidden border border-zinc-200">
                  <BeforeAfterSlider item={item} isBn={false} />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400">
                      Order: {item.sortOrder || 0}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-950">{item.title.en}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{item.title.bn}</p>

                  {item.desc?.en && (
                    <p className="text-xs text-zinc-600 line-clamp-2">{item.desc.en}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditBA(item)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 hover:text-black cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Case</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBA(item.id)}
                    className="p-1 text-zinc-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT CHAMBER PHOTO */}
      {/* ==================================================================== */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">
                {editingGalleryItem ? "Edit Chamber Photo" : "Add Chamber Photo"}
              </h3>
              <button
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitGallery} className="space-y-4 text-xs sm:text-sm">
              {/* Image Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-300 shrink-0">
                    <img
                      src={galleryForm.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget("gallery");
                        setIsMediaPickerOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold border border-zinc-200 flex items-center gap-2 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload or Pick Image</span>
                    </button>
                    <span className="text-[10px] text-zinc-500 mt-1 block truncate max-w-xs">
                      {galleryForm.imageUrl}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Category
                </label>
                <select
                  value={galleryForm.category}
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white"
                >
                  <option value="clinic">Clinic (ক্লিনিক ও চিকিৎসা)</option>
                  <option value="team">Team (আমাদের টিম)</option>
                  <option value="chamber">Chamber & Setup</option>
                  <option value="treatments">Clinical Treatments</option>
                  <option value="sterilization">Sterilization</option>
                </select>
              </div>

              {/* Title EN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={galleryForm.title.en}
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      title: { ...galleryForm.title, en: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300"
                  placeholder="e.g. Tooth Extraction"
                />
              </div>

              {/* Title BN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Title (Bengali) *
                </label>
                <input
                  type="text"
                  required
                  value={galleryForm.title.bn}
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      title: { ...galleryForm.title, bn: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300"
                  placeholder="e.g. দাঁত তোলার সফল কেস"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={galleryForm.desc.en}
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      desc: { ...galleryForm.desc, en: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300"
                  placeholder="Short explanation of this photo or setup..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Description (Bengali)
                </label>
                <textarea
                  rows={2}
                  value={galleryForm.desc.bn}
                  onChange={(e) =>
                    setGalleryForm({
                      ...galleryForm,
                      desc: { ...galleryForm.desc, bn: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300"
                  placeholder="বাংলায় সংক্ষিপ্ত বিবরণ..."
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-black"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT BEFORE & AFTER CASE */}
      {/* ==================================================================== */}
      {isBAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">
                {editingBAItem ? "Edit Before & After Case" : "Add Before & After Case"}
              </h3>
              <button
                onClick={() => setIsBAModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBA} className="space-y-4 text-xs sm:text-sm">
              {/* Two Images: Before and After */}
              <div className="grid grid-cols-2 gap-4">
                {/* BEFORE Image */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Before Image *
                  </label>
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-300 relative group">
                    <img
                      src={baForm.beforeImageUrl}
                      alt="Before Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      BEFORE
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("baBefore");
                      setIsMediaPickerOpen(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Before</span>
                  </button>
                </div>

                {/* AFTER Image */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    After Image *
                  </label>
                  <div className="aspect-4/3 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-300 relative group">
                    <img
                      src={baForm.afterImageUrl}
                      alt="After Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                      AFTER
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPickerTarget("baAfter");
                      setIsMediaPickerOpen(true);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold border border-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload After</span>
                  </button>
                </div>
              </div>

              {/* Title EN & BN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Procedure Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={baForm.title.en}
                    onChange={(e) =>
                      setBAForm({
                        ...baForm,
                        title: { ...baForm.title, en: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300"
                    placeholder="e.g. Scaling & Polishing"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Procedure Title (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={baForm.title.bn}
                    onChange={(e) =>
                      setBAForm({
                        ...baForm,
                        title: { ...baForm.title, bn: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300"
                    placeholder="e.g. স্কেলিং"
                  />
                </div>
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Clinical Category
                  </label>
                  <select
                    value={baForm.category}
                    onChange={(e) =>
                      setBAForm({
                        ...baForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 bg-white"
                  >
                    <option value="Periodontics">Periodontics (মাড়ির রোগ ও স্কেলিং)</option>
                    <option value="Prosthodontics">Prosthodontics (ক্রাউন ও ব্রিজ)</option>
                    <option value="Aesthetic">Aesthetic / Smile Design</option>
                    <option value="Endodontics">Endodontics (রুট ক্যানেল)</option>
                    <option value="Orthodontics">Orthodontics (দাঁত সোজা করা)</option>
                    <option value="Oral Surgery">Oral Surgery (সার্জারি)</option>
                    <option value="General">General Dentistry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={baForm.sortOrder || 1}
                    onChange={(e) =>
                      setBAForm({
                        ...baForm,
                        sortOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Clinical Notes (English)
                </label>
                <textarea
                  rows={2}
                  value={baForm.desc?.en || ""}
                  onChange={(e) =>
                    setBAForm({
                      ...baForm,
                      desc: { en: e.target.value, bn: baForm.desc?.bn || "" },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300"
                  placeholder="Details of clinical treatment and results..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Clinical Notes (Bengali)
                </label>
                <textarea
                  rows={2}
                  value={baForm.desc?.bn || ""}
                  onChange={(e) =>
                    setBAForm({
                      ...baForm,
                      desc: { en: baForm.desc?.en || "", bn: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300"
                  placeholder="বাংলায় চিকিৎসার ফলাফল ও বিবরণ..."
                />
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBAModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-950 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-black"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        title={
          mediaPickerTarget === "gallery"
            ? "Select Chamber Photo"
            : mediaPickerTarget === "baBefore"
            ? "Select BEFORE Photo"
            : "Select AFTER Photo"
        }
        currentValue={
          mediaPickerTarget === "gallery"
            ? galleryForm.imageUrl
            : mediaPickerTarget === "baBefore"
            ? baForm.beforeImageUrl
            : baForm.afterImageUrl
        }
      />
    </div>
  );
}
