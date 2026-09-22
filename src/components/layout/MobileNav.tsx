"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ChevronDown, Phone, Calendar, Globe } from "lucide-react";
import { DEPARTMENTS } from "@/data/departments";
import { DepartmentIcon } from "@/components/shared/DepartmentIcon";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { language, setLanguage, t, isBn } = useLanguage();
  const { settings } = useClinicSettings();
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <div className="flex items-center">
            <img
              src="/images/logos/kgh-logo-transparent.png"
              alt="KGH Dental"
              className="h-9 w-auto object-contain"
            />
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Switcher Bar */}
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
            <Globe className="w-4 h-4 text-zinc-500" />
            <span>{isBn ? "ভাষা নির্বাচন করুন:" : "Language:"}</span>
          </div>
          <div className="inline-flex p-1 bg-zinc-200 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-md transition-all ${
                language === "en" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("bn")}
              className={`px-3 py-1 rounded-md transition-all ${
                language === "bn" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-4 py-4 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "হোম" : "Home"}</span>
          </Link>

          {/* Expandable Services Accordion */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 bg-zinc-50 hover:bg-zinc-100"
            >
              <span className="flex items-center gap-2">
                <span>{isBn ? "সকল বিভাগ ও সেবাসমূহ" : "Departments & Services"}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-200 text-zinc-700 rounded-full">
                  {DEPARTMENTS.length}
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                  isServicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isServicesOpen && (
              <div className="p-2 space-y-1 bg-white border-t border-zinc-200">
                <Link
                  href="/services"
                  onClick={onClose}
                  className="block px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-zinc-100 rounded-lg"
                >
                  {isBn ? "→ সকল সেবার পূর্ণ বিবরণী" : "→ View All Services Overview"}
                </Link>
                {DEPARTMENTS.map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/services/${dept.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <DepartmentIcon name={dept.iconName} className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{t(dept.name)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/doctors"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "আমাদের বিশেষজ্ঞ ডাক্তার" : "Our Specialists"}</span>
          </Link>

          <Link
            href="/appointment"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "অনলাইন সিরিয়াল ও শিডিউল" : "Online Appointment"}</span>
          </Link>

          <Link
            href="/gallery"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "চেম্বার গ্যালারি ও ভিডিও" : "Chamber Gallery"}</span>
          </Link>

          <Link
            href="/blog"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "ডেন্টাল স্বাস্থ্য গাইড" : "Dental Health Guides"}</span>
          </Link>

          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 rounded-xl"
          >
            <span>{isBn ? "যোগাযোগ ও চেম্বার সময়" : "Contact & Hours"}</span>
          </Link>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-200 bg-zinc-50 space-y-3">
          <Link
            href="/appointment"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#474B4E] hover:bg-[#373a3c] active:bg-[#2b2d2f] text-white text-sm font-semibold rounded-xl shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>{isBn ? "সিরিয়াল বুক করুন" : "Book Appointment"}</span>
          </Link>

          <a
            href={`tel:${settings.phoneNumbers[0]}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 text-xs font-semibold rounded-xl"
          >
            <Phone className="w-4 h-4 text-zinc-600" />
            <span>{settings.phoneNumbers[0]}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
