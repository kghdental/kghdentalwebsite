"use client";

import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

export default function ContactPage() {
  const { t, isBn } = useLanguage();
  const { settings } = useClinicSettings();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError(isBn ? "অনুগ্রহ করে আপনার নাম ও ফোন নম্বর প্রদান করুন" : "Please provide your name and phone number");
      return;
    }
    setError("");
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-16 sm:py-20">
        <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="max-w-4xl">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-600">
              {isBn ? "সহযোগিতা ও সিরিয়াল" : "Support & Assistance"}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 mt-2 tracking-tight">
              {isBn ? "যোগাযোগ করুন" : "Get in Touch with KGH Dental"}
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 mt-4 leading-relaxed max-w-3xl">
              {isBn
                ? "বুকিং করার আগে কোনো প্রশ্ন আছে? আমাদের সাথে যোগাযোগ করুন — সাহায্য করতে আমরা প্রস্তুত।"
                : "Have a question before booking? Reach out to our front desk team — we're happy to guide you to the right specialist."}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content: Info Cards & Form */}
      <section className="py-16 sm:py-24">
        <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 5 Cols: Contact Information */}
            <div className="lg:col-span-5 space-y-6">
              {/* Phone Card */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-900 text-white rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                      {isBn ? "চেম্বার ফোন ও হটলাইন" : "Chamber Phone Lines"}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950">
                      {settings.phoneNumbers[0]}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-zinc-600">
                  {isBn
                    ? "জরুরি হটলাইন: " + settings.emergencyPhone
                    : "Emergency Direct Line: " + settings.emergencyPhone}
                </p>
                <div className="pt-2">
                  <a
                    href={settings.socialLinks?.whatsapp || `https://wa.me/${(settings.emergencyPhone || "8801700000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello KGH Dental, I have an inquiry.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{isBn ? "হোয়াটসঅ্যাপে চ্যাট করুন" : "Chat with us on WhatsApp"}</span>
                  </a>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-900 text-white rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                      {isBn ? "সাপ্তাহিক সময়সূচি" : "Consultation Hours"}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950">
                      {isBn ? "শনি – বৃহস্পতি চেম্বার" : "Sat – Thu Chambers"}
                    </h3>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-zinc-700 pt-1">
                  {settings.workingHours.map((wh, idx) => (
                    <div key={idx} className="flex justify-between border-b border-zinc-200 pb-1.5">
                      <span className="font-semibold">{t(wh.days)}</span>
                      <span>{t(wh.hours)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinic Location Card */}
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-900 text-white rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 block">
                      {isBn ? "চেম্বার অবস্থান" : "Chamber Address"}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950">
                      {isBn ? "বনানী, ঢাকা, বাংলাদেশ" : "Banani, Dhaka, Bangladesh"}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  {t(settings.address)}
                </p>
                <div className="pt-1">
                  <a
                    href={settings.googleMapUrl || "https://maps.app.goo.gl/aztfz8BxL5vug12L7"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isBn ? "গুগল ম্যাপে লোকেশন ও ডিরেকশন দেখুন" : "View Map & Directions on Google Maps"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-md">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-zinc-950">
                    {isBn ? "বার্তা বা প্রশ্ন পাঠান" : "Send an Inquiry"}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1">
                    {isBn
                      ? "কোনো জিজ্ঞাসা থাকলে নিচের ফর্মটি পূরণ করুন, আমরা দ্রুত আপনার সাথে যোগাযোগ করব।"
                      : "Leave your message below, and our coordinator will respond via phone or email."}
                  </p>
                </div>

                {isSent ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-base font-bold text-zinc-950">
                      {isBn ? "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!" : "Message Sent Successfully!"}
                    </h4>
                    <p className="text-xs text-zinc-600">
                      {isBn
                        ? "ধন্যবাদ। আমাদের দল শীঘ্রই আপনার সাথে যোগাযোগ করবে।"
                        : "Thank you for reaching out. Our desk coordinator will get back to you shortly."}
                    </p>
                    <button
                      onClick={() => {
                        setIsSent(false);
                        setFormData({ name: "", phone: "", email: "", message: "" });
                      }}
                      className="mt-2 text-xs font-bold text-zinc-950 underline"
                    >
                      {isBn ? "আরেকটি বার্তা পাঠান" : "Send another message"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        {isBn ? "আপনার পূর্ণ নাম *" : "Your Full Name *"}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={isBn ? "উদা: মো. আমিনুল ইসলাম" : "e.g., Aminul Islam"}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        {isBn ? "মোবাইল নম্বর *" : "Phone Number *"}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        {isBn ? "ইমেইল অ্যাড্রেস (ঐচ্ছিক)" : "Email Address (Optional)"}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        {isBn ? "আপনার বার্তা বা জিজ্ঞাসা" : "Your Message / Question"}
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={
                          isBn
                            ? "আপনার প্রশ্ন বা প্রয়োজনীয় তথ্য এখানে লিখুন..."
                            : "Write your questions or details here..."
                        }
                        className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#474B4E] hover:bg-[#373a3c] active:bg-[#2b2d2f] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isBn ? "বার্তা পাঠান" : "Submit Message"}</span>
                    </button>
                  </form>
                )}

                {/* Google Maps Location Card */}
                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                        {isBn ? "গুগল ম্যাপ লোকেশন" : "Google Maps Location"}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-950">
                        {isBn ? "চান্দীওয়ালা ম্যানশন (লেভেল ৪), বনানী ১১" : "Chandiwala Mansion (Level 4), Banani 11"}
                      </h4>
                    </div>
                    <a
                      href={settings.googleMapUrl || "https://maps.app.goo.gl/aztfz8BxL5vug12L7"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isBn ? "গুগল ম্যাপে খুলুন" : "Open in Google Maps"}</span>
                    </a>
                  </div>

                  <div className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-zinc-300 shadow-xs relative bg-zinc-100">
                    <iframe
                      title="KGH Dental Location - Chandiwala Mansion, Level 4, Banani, Dhaka"
                      src="https://maps.google.com/maps?q=Chandiwala+Mansion,+House+32,+Road+11,+Block+G,+Banani,+Dhaka&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
