"use client";

import React from "react";
import { X, QrCode, Star, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

interface ReviewQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewQrModal({ isOpen, onClose }: ReviewQrModalProps) {
  const { isBn } = useLanguage();
  const { settings } = useClinicSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-2xl border border-zinc-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-3 bg-zinc-100 rounded-2xl text-zinc-800 mb-4">
          <QrCode className="w-8 h-8" />
        </div>

        <div className="flex justify-center items-center gap-1 mb-2 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-amber-400" />
          ))}
        </div>

        <h3 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">
          {isBn ? "গুগলে আপনার অভিজ্ঞতা শেয়ার করুন" : "Leave Us a Google Review"}
        </h3>

        <p className="text-sm text-zinc-600 mb-6">
          {isBn
            ? "আপনার মূল্যবান মতামত আমাদের সেবার মান উন্নত করতে এবং অন্যান্য রোগীদের সঠিক সিদ্ধান্ত নিতে সাহায্য করে।"
            : "Your feedback helps us maintain exceptional dental care standards and guides new patients to the right specialists."}
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl inline-block mb-6 shadow-inner">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              settings.googleReviewUrl || "https://g.page/r/kgh-dental-review"
            )}`}
            alt="Google Review QR Code"
            className="w-40 h-40 object-contain mx-auto"
          />
          <span className="block mt-2 text-xs text-zinc-600 font-medium">
            {isBn ? "মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন" : "Scan with phone camera"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={settings.googleReviewUrl || "https://g.page/r/kgh-dental-review"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-all shadow-sm"
          >
            <span>{isBn ? "সরাসরি লিংক খুলুন" : "Open Direct Link"}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="px-5 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            {isBn ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
