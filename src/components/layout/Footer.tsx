"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Clock, Star, ArrowUpRight, ShieldCheck } from "lucide-react";
import { DEPARTMENTS } from "@/data/departments";
import { UI_STRINGS } from "@/data/translations";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { ReviewQrModal } from "@/components/shared/ReviewQrModal";

export function Footer() {
  const pathname = usePathname();
  const { t, isBn } = useLanguage();
  const { settings } = useClinicSettings();
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#474B4E] text-zinc-200 border-t border-white/10">
      {/* Top Banner / Trust Strip */}
      <div className="border-b border-white/10 bg-black/15 py-8 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 text-white rounded-xl border border-white/15">
              <ShieldCheck className="w-6 h-6 text-zinc-200" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">
                {isBn ? "মাল্টি-ডক্টর বিশেষায়িত ডেন্টাল কেয়ার" : "Multi-Doctor Specialist Dental Care"}
              </h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                {isBn
                  ? "প্রতিটি বিভাগের জন্য আলাদা বিশেষজ্ঞ ডাক্তার — কোনো একক জেনারেল ডেন্টিস্টের ওপর নির্ভরতা নয়"
                  : "Every department led by certified specialists — never a single dentist doing everything"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{isBn ? "গুগলে রিভিউ দিন (QR Code)" : "Leave Google Review (QR)"}</span>
            </button>

            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-[#474B4E] text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <span>{isBn ? "সিরিয়াল বুক করুন" : "Book Appointment"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center py-1">
              <img
                src="/images/logos/kgh-logo-white.png"
                alt="KGH Dental"
                className="h-11 w-auto object-contain"
              />
            </Link>

            <p className="text-xs text-zinc-300 leading-relaxed max-w-sm">
              {isBn ? UI_STRINGS.footer.about.bn : UI_STRINGS.footer.about.en}
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <a
                  href={settings.googleMapUrl || "https://maps.app.goo.gl/aztfz8BxL5vug12L7"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-300 hover:text-white transition-colors"
                >
                  {t(settings.address)}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
                <a
                  href={`tel:${settings.phoneNumbers[0]}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.phoneNumbers[0]}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Clinical Departments */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isBn ? "ক্লিনিক্যাল বিভাগসমূহ" : "Departments"}
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-300">
              {DEPARTMENTS.map((dept) => (
                <li key={dept.id}>
                  <Link
                    href={`/services/${dept.slug}`}
                    className="hover:text-white transition-colors block"
                  >
                    {t(dept.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isBn ? "গুরুত্বপূর্ণ লিংক" : "Quick Links"}
            </h5>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {isBn ? "হোম পেজ" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-white transition-colors">
                  {isBn ? "আমাদের বিশেষজ্ঞ ডাক্তার" : "Our Specialists"}
                </Link>
              </li>
              <li>
                <Link href="/appointment" className="hover:text-white transition-colors">
                  {isBn ? "অনলাইন সিরিয়াল বুকিং" : "Book Appointment"}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  {isBn ? "চেম্বার গ্যালারি ও ভিডিও" : "Chamber Gallery"}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  {isBn ? "ডেন্টাল স্বাস্থ্য গাইড" : "Dental Health Guides"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {isBn ? "যোগাযোগ ও চেম্বার লোকেশন" : "Contact & Location"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Chamber Working Hours */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              {isBn ? "চেম্বারের সময়সূচি" : "Working Hours"}
            </h5>
            <div className="space-y-3 text-xs text-zinc-300">
              {settings.workingHours.map((wh, idx) => (
                <div key={idx} className="border-b border-white/10 pb-2">
                  <div className="flex items-center gap-1.5 font-medium text-white">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{t(wh.days)}</span>
                  </div>
                  <div className="mt-1 text-zinc-300">{t(wh.hours)}</div>
                </div>
              ))}
              <div className="pt-1">
                <span className="text-[11px] text-zinc-300 leading-relaxed block">
                  {isBn ? UI_STRINGS.footer.emergencyNotice.bn : UI_STRINGS.footer.emergencyNotice.en}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/15 py-6 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 text-xs text-zinc-300">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} KGH Dental Clinic. {isBn ? UI_STRINGS.footer.rights.bn : UI_STRINGS.footer.rights.en}</p>
          <div className="flex items-center gap-6">
            <span>{isBn ? "স্বচ্ছ চিকিৎসা পরিকল্পনা • কোনো লুকানো চার্জ নেই" : "Transparent Care • No Hidden Fees"}</span>
          </div>
        </div>
      </div>

      {/* Interactive Google Review QR Modal */}
      <ReviewQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </footer>
  );
}
