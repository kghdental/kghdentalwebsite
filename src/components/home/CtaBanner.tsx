"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { UI_STRINGS } from "@/data/translations";

export function CtaBanner() {
  const { isBn } = useLanguage();
  const { settings } = useClinicSettings();

  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#E9E8F0] text-zinc-900 relative overflow-hidden border-t border-zinc-300/80">
      {/* Background subtle ambient highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-center space-y-7">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-zinc-300/80 text-xs sm:text-sm font-semibold text-zinc-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {isBn ? "সহজ ৩-ধাপ অনলাইন বুকিং" : "Fast & Seamless 3-Step Booking"}
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.15]">
          {isBn ? UI_STRINGS.ctaBand.headline.bn : UI_STRINGS.ctaBand.headline.en}
        </h2>

        <p className="text-base sm:text-lg lg:text-xl text-zinc-700 max-w-3xl mx-auto leading-relaxed">
          {isBn ? UI_STRINGS.ctaBand.subtext.bn : UI_STRINGS.ctaBand.subtext.en}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/appointment"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 bg-[#2D3134] hover:bg-zinc-900 active:bg-black text-white text-sm sm:text-base font-bold rounded-xl transition-all shadow-xl active:scale-98"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <span>{isBn ? UI_STRINGS.ctaBand.button.bn : UI_STRINGS.ctaBand.button.en}</span>
          </Link>

          <a
            href={`tel:${settings.phoneNumbers[0]}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-4 bg-white/80 hover:bg-white border border-zinc-300/80 text-zinc-900 text-sm sm:text-base font-semibold rounded-xl transition-colors shadow-2xs"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-700" />
            <span>{settings.phoneNumbers[0]}</span>
          </a>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 pt-2">
          {isBn ? UI_STRINGS.ctaBand.helpline.bn : UI_STRINGS.ctaBand.helpline.en}{" "}
          <span className="text-zinc-950 font-bold">{settings.emergencyPhone}</span>
        </p>
      </div>
    </section>
  );
}
