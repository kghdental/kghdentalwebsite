"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FolderOpen,
  Upload,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  Database,
  HardDrive,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  source: "supabase" | "local";
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const handleDeleteMedia = async (item: MediaItem) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, url: item.url, source: item.source }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete media");
      }
      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  };

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Error loading media:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to upload");
      }

      // Refresh list
      await loadMedia();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredMedia = mediaList.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Digital Asset Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Media Library ({mediaList.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Upload images from your computer or select existing assets for doctor profiles, services, and gallery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors disabled:bg-zinc-400"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload from Device</span>
              </>
            )}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Storage Indicator */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-700">
          {isSupabaseConfigured ? (
            <>
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Supabase Storage Bucket:</span>
              <code className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800 font-mono">
                kgh-media
              </code>
            </>
          ) : (
            <>
              <HardDrive className="w-4 h-4 text-zinc-600" />
              <span className="font-semibold">Local Storage Directory:</span>
              <code className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-800 font-mono">
                /public/images/uploads/
              </code>
            </>
          )}
        </div>

        <span className="text-zinc-500 text-[11px]">
          Uploaded assets are automatically available in all doctor, department, and gallery editors.
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter images by filename..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-zinc-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 shadow-xs"
        />
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
          <span className="text-xs">Loading media assets...</span>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-3xl border border-zinc-200 p-8">
          <ImageIcon className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-900">No media found</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Click &ldquo;Upload from Device&rdquo; above to add your first photo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-white border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 w-full bg-zinc-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                    title="Open full image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDeleteMedia(item)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Delete image"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2">
                <span className="block text-xs font-semibold text-zinc-900 truncate" title={item.name}>
                  {item.name}
                </span>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px]">
                  <span className="text-zinc-400 capitalize">{item.source}</span>
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    className="inline-flex items-center gap-1 text-zinc-700 hover:text-black font-semibold"
                    title="Copy image URL"
                  >
                    {copiedUrl === item.url ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
