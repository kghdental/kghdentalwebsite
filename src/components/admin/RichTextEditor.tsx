"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Eye,
  Edit3,
  Undo,
  Redo,
  RemoveFormatting,
  Table,
} from "lucide-react";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  label?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article here... Select text and use formatting tools above just like Microsoft Word.",
  label,
}: RichTextEditorProps) {
  // Mode: "visual" (WYSIWYG) or "code" (HTML source)
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual");

  const editorRef = useRef<HTMLDivElement>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoCaption, setVideoCaption] = useState("");
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const savedSelectionRef = useRef<Range | null>(null);

  // Sync internal contentEditable with external value prop
  useEffect(() => {
    if (editorRef.current && editorMode === "visual") {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, editorMode]);

  // Save current selection before opening modals
  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore selection
  const restoreSelection = () => {
    if (typeof window === "undefined" || !savedSelectionRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  // Execute standard WYSIWYG command
  const execCmd = (cmd: string, val: string = "") => {
    if (editorMode !== "visual") return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html === "<p><br></p>" || html === "<br>" ? "" : html);
    }
  };

  // Headings & Blocks
  const handleBlockFormat = (tag: string) => {
    execCmd("formatBlock", tag);
  };

  // Image insertion via MediaPicker
  const handleInsertImage = (url: string) => {
    setIsMediaPickerOpen(false);
    if (editorMode === "visual") {
      restoreSelection();
      editorRef.current?.focus();
      const imgHtml = `<figure class="kgh-figure my-6"><img src="${url}" alt="Clinical illustration" class="rounded-2xl border border-zinc-200 shadow-sm w-full object-cover max-h-[480px]" /><figcaption class="text-xs text-zinc-500 text-center mt-2 font-medium">Click to edit image caption</figcaption></figure><p><br></p>`;
      document.execCommand("insertHTML", false, imgHtml);
      handleEditorInput();
    } else {
      const imgHtml = `\n<figure class="kgh-figure my-6">\n  <img src="${url}" alt="Clinical illustration" class="rounded-2xl border border-zinc-200 shadow-sm w-full object-cover max-h-[480px]" />\n  <figcaption class="text-xs text-zinc-500 text-center mt-2 font-medium">Image caption</figcaption>\n</figure>\n`;
      onChange(value + imgHtml);
    }
  };

  // Video embed insertion
  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    let embedSrc = videoUrl;
    if (videoUrl.includes("youtube.com/watch?v=")) {
      const vid = videoUrl.split("watch?v=")[1]?.split("&")[0];
      embedSrc = `https://www.youtube-nocookie.com/embed/${vid}`;
    } else if (videoUrl.includes("youtu.be/")) {
      const vid = videoUrl.split("youtu.be/")[1]?.split("?")[0];
      embedSrc = `https://www.youtube-nocookie.com/embed/${vid}`;
    }

    const videoHtml = `<figure class="kgh-video my-8"><div class="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200 shadow-md bg-black"><iframe src="${embedSrc}" class="absolute inset-0 w-full h-full" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>${
      videoCaption
        ? `<figcaption class="text-xs text-zinc-500 text-center mt-2 font-medium">${videoCaption}</figcaption>`
        : ""
    }</figure><p><br></p>`;

    if (editorMode === "visual") {
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, videoHtml);
      handleEditorInput();
    } else {
      onChange(value + "\n" + videoHtml + "\n");
    }

    setVideoUrl("");
    setVideoCaption("");
    setIsVideoModalOpen(false);
  };

  // Link insertion
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    const text = linkText || linkUrl;
    const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-[#1c362b] font-semibold underline hover:text-black">${text}</a> `;

    if (editorMode === "visual") {
      restoreSelection();
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, linkHtml);
      handleEditorInput();
    } else {
      onChange(value + linkHtml);
    }

    setLinkUrl("");
    setLinkText("");
    setIsLinkModalOpen(false);
  };

  // Word counter
  const textContent = value.replace(/<[^>]*>/g, " ");
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const estimatedMin = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            {label}
          </label>
          <span className="text-[11px] text-zinc-500 font-medium">
            {wordCount} words • ~{estimatedMin} min read
          </span>
        </div>
      )}

      {/* Editor Main Card */}
      <div className="rounded-2xl border border-zinc-300 bg-white overflow-hidden shadow-2xs focus-within:border-zinc-950 transition-colors">
        {/* Top Control Bar */}
        <div className="p-2 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
          {/* WYSIWYG Formatting Buttons (active in visual mode) */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Block formatting selector */}
            <select
              disabled={editorMode !== "visual"}
              onChange={(e) => handleBlockFormat(e.target.value)}
              defaultValue="p"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-zinc-200 text-zinc-800 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              <option value="p">Normal Text</option>
              <option value="h1">Heading 1 (Main Title)</option>
              <option value="h2">Heading 2 (Major Section)</option>
              <option value="h3">Heading 3 (Sub-section)</option>
              <option value="h4">Heading 4 (Minor title)</option>
            </select>

            <span className="w-px h-5 bg-zinc-300 mx-1" />

            {/* Basic formatting */}
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("bold")}
              title="Bold (Ctrl+B)"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("italic")}
              title="Italic (Ctrl+I)"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("underline")}
              title="Underline (Ctrl+U)"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("strikeThrough")}
              title="Strikethrough"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-zinc-300 mx-1" />

            {/* Alignment */}
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("justifyLeft")}
              title="Align Left"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("justifyCenter")}
              title="Align Center"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("justifyRight")}
              title="Align Right"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-zinc-300 mx-1" />

            {/* Lists & Quotes */}
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("insertUnorderedList")}
              title="Bullet List"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("insertOrderedList")}
              title="Numbered List"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("formatBlock", "blockquote")}
              title="Quote Box"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("insertHorizontalRule")}
              title="Divider Line"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-zinc-300 mx-1" />

            {/* Media Insert Buttons */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setIsMediaPickerOpen(true);
              }}
              title="Insert Photo into Article"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Insert Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                saveSelection();
                setIsVideoModalOpen(true);
              }}
              title="Embed Video (YouTube / Vimeo)"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Video className="w-4 h-4 text-red-600" />
              <span>Embed Video</span>
            </button>

            <button
              type="button"
              onClick={() => {
                saveSelection();
                setIsLinkModalOpen(true);
              }}
              title="Insert Link"
              className="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-200 cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={editorMode !== "visual"}
              onClick={() => execCmd("removeFormat")}
              title="Clear Formatting"
              className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200 cursor-pointer disabled:opacity-50"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher: Visual Editor vs HTML Code */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-zinc-200/80 border border-zinc-300">
            <button
              type="button"
              onClick={() => {
                if (editorMode === "code" && editorRef.current) {
                  editorRef.current.innerHTML = value || "";
                }
                setEditorMode("visual");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                editorMode === "visual"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (editorMode === "visual" && editorRef.current) {
                  onChange(editorRef.current.innerHTML);
                }
                setEditorMode("code");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                editorMode === "code"
                  ? "bg-white text-zinc-950 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
          </div>
        </div>

        {/* Editor Canvas Area */}
        {editorMode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            className="kgh-blog-content p-6 sm:p-8 min-h-[350px] max-h-[600px] overflow-y-auto focus:outline-none text-zinc-800 text-base leading-relaxed bg-white selection:bg-emerald-100"
            style={{ wordBreak: "break-word" }}
            data-placeholder={placeholder}
          />
        ) : (
          /* HTML Source Mode */
          <div className="p-4 bg-zinc-900">
            <div className="text-[11px] font-mono text-zinc-400 mb-2">
              HTML Source Code Mode (For advanced layout adjustments)
            </div>
            <textarea
              rows={16}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full p-4 font-mono text-xs text-emerald-400 bg-zinc-950 border border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-700 leading-relaxed resize-y"
              placeholder="<p>Enter raw HTML content here...</p>"
            />
          </div>
        )}
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleInsertImage}
        title="Insert Photo into Article"
      />

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h4 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-600" />
                <span>Embed Video</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsertVideo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  YouTube or Vimeo URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Video Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clinical Demonstration"
                  value={videoCaption}
                  onChange={(e) => setVideoCaption(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-3.5 py-1.5 text-zinc-600 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-950 text-white font-bold rounded-lg cursor-pointer hover:bg-black shadow-xs"
                >
                  Insert Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h4 className="text-base font-bold text-zinc-950 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-700" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInsertLink} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Link URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">
                  Anchor Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Click here to read more"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-3.5 py-1.5 text-zinc-600 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-950 text-white font-bold rounded-lg cursor-pointer hover:bg-black shadow-xs"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
