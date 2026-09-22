"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Printer,
  Copy,
  Check,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Building,
} from "lucide-react";
import { fetchAppointmentsByQuery } from "@/lib/api/db";
import { AppointmentRecord } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { AppointmentPrintSlip } from "@/components/appointment/AppointmentPrintSlip";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const { t, isBn } = useLanguage();
  const { settings } = useClinicSettings();
  const [query, setQuery] = useState(initialRef);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<AppointmentRecord[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [printingRecord, setPrintingRecord] = useState<AppointmentRecord | null>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const records = await fetchAppointmentsByQuery(searchTerm.trim());
      // Guarantee strictly unique records by reference_code or ID
      const uniqueRecords = Array.from(
        new Map(records.map((r) => [r.reference_code || r.id, r])).values()
      );
      setResults(uniqueRecords);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      performSearch(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          label: isBn ? "সিরিয়াল নিশ্চিত" : "Appointment Confirmed",
          sub: isBn
            ? "আপনার সিরিয়াল চূড়ান্ত করা হয়েছে। নির্ধারিত সময়ের ১০ মিনিট আগে উপস্থিত থাকার অনুরোধ করা হচ্ছে।"
            : "Your appointment is confirmed. Please arrive 10 minutes before your slot.",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800",
        };
      case "completed":
        return {
          icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
          label: isBn ? "পরামর্শ সম্পন্ন" : "Consultation Completed",
          sub: isBn ? "এই অ্যাপয়েন্টমেন্টের সেবা ইতিমধ্যে সম্পন্ন হয়েছে।" : "This consultation has been completed.",
          bg: "bg-blue-50 border-blue-200 text-blue-800",
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          label: isBn ? "সিরিয়াল বাতিল" : "Cancelled",
          sub: isBn
            ? "এই অ্যাপয়েন্টমেন্টটি বাতিল করা হয়েছে। প্রয়োজনে পুনরায় বুক করুন বা আমাদের হেল্পলাইনে যোগাযোগ করুন।"
            : "This appointment was cancelled. Please re-book or call our helpline.",
          bg: "bg-rose-50 border-rose-200 text-rose-800",
        };
      default:
        return {
          icon: <Clock3 className="w-4 h-4 text-amber-600 animate-pulse" />,
          label: isBn ? "যাচাই অপেক্ষমাণ" : "Pending Verification",
          sub: isBn
            ? "আপনার বুকিংটি প্রক্রিয়াধীন আছে। আমাদের ক্লিনিক কোঅর্ডিনেটর খুব শীঘ্রই আপনাকে কল করে সিরিয়াল কনফার্ম করবেন।"
            : "Your request is in progress. Our coordinator will call your number shortly to verify.",
          bg: "bg-amber-50 border-amber-200 text-amber-800",
        };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/60 py-16 sm:py-20">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        {/* Top Header */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <Link
            href="/appointment"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-zinc-700 hover:text-zinc-950 border border-zinc-200 text-xs font-semibold shadow-xs mb-4 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? "নতুন অ্যাপয়েন্টমেন্ট বুক করুন" : "Book New Appointment"}</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            {isBn ? "অ্যাপয়েন্টমেন্ট ও সিরিয়াল ট্র্যাক করুন" : "Track Your Appointment Status"}
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-xl mx-auto">
            {isBn
              ? "আপনার বুকিং রেফারেন্স কোড (উদা: KGH-ADS202619Sep-001) অথবা মোবাইল নম্বর দিয়ে সরাসরি বর্তমান স্ট্যাটাস দেখুন।"
              : "Enter your Booking Reference (e.g. KGH-ADS202619Sep-001) or Mobile Number to check real-time verification status."}
          </p>

          {/* Search Box Form */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-zinc-300 p-1.5 focus-within:ring-2 focus-within:ring-zinc-950 transition-all">
              <Search className="w-5 h-5 text-zinc-400 ml-3.5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  isBn
                    ? "রেফারেন্স কোড (উদা: KGH-ADS...) বা মোবাইল নম্বর..."
                    : "Enter Ref Code (e.g. KGH-ADS...) or Mobile..."
                }
                className="w-full px-3.5 py-3 text-sm font-medium bg-transparent border-none focus:outline-hidden text-zinc-950 placeholder-zinc-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-300 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                {loading
                  ? isBn
                    ? "খোঁজা হচ্ছে..."
                    : "Searching..."
                  : isBn
                  ? "যাচাই করুন"
                  : "Track Now"}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <div className="max-w-3xl mx-auto">
          {searched && !loading && results.length === 0 && (
            <div className="text-center py-12 p-8 rounded-3xl bg-white border border-zinc-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                {isBn ? "কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি" : "No Appointments Found"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
                {isBn
                  ? "আপনার প্রদত্ত রেফারেন্স নম্বর বা ফোন নম্বরের সাথে মিল পাওয়া যায়নি। নম্বরটি সঠিক কিনা যাচাই করুন অথবা সরাসরি রিসেপশনে যোগাযোগ করুন।"
                  : "We could not find any active booking matching your input. Please verify your reference code or contact our clinic helpline directly."}
              </p>
              <div className="pt-2">
                <a
                  href={`tel:${settings.emergencyPhone}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-bold shadow-xs hover:bg-black transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>
                    {isBn ? `হেল্পলাইনে কল করুন: ${settings.emergencyPhone}` : `Call Helpline: ${settings.emergencyPhone}`}
                  </span>
                </a>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-600 px-1">
                <span>
                  {isBn
                    ? `মোট ${results.length}টি বুকিং পাওয়া গেছে`
                    : `Found ${results.length} booking record(s)`}
                </span>
                <span className="font-semibold text-zinc-900">{settings.name}</span>
              </div>

              {results.map((record) => {
                const statusMeta = getStatusBadge(record.status);

                return (
                  <div
                    key={record.id || record.reference_code}
                    className="bg-white rounded-3xl border border-zinc-200/90 shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    {/* Status Header Banner */}
                    <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${statusMeta.bg}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white/80 shadow-2xs">
                          {statusMeta.icon}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold uppercase tracking-wider">
                            {statusMeta.label}
                          </div>
                          <div className="text-[11px] opacity-90 leading-snug">
                            {statusMeta.sub}
                          </div>
                        </div>
                      </div>

                      {/* Reference Badge */}
                      <div className="flex items-center gap-1.5 self-start sm:self-center bg-white/90 px-3 py-1.5 rounded-xl border border-zinc-200/80 shadow-2xs">
                        <span className="text-[10px] text-zinc-500 font-medium">REF:</span>
                        <span className="font-mono text-xs font-bold text-zinc-950">
                          {record.reference_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(record.reference_code)}
                          className="ml-1 p-0.5 text-zinc-400 hover:text-zinc-800 transition-colors"
                          title="Copy reference code"
                        >
                          {copiedCode === record.reference_code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Appointment Body Details */}
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doctor & Schedule Block */}
                        <div className="space-y-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {isBn ? "পরামর্শ ও চেম্বার তথ্য" : "Doctor & Consultation Schedule"}
                          </div>

                          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 shrink-0">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-sm sm:text-base font-bold text-zinc-950">
                                  {record.doctor_name}
                                </h4>
                                <span className="text-xs text-zinc-600 font-medium block">
                                  {record.department_name}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-xs text-zinc-700">
                              <div className="flex items-center gap-1.5 font-semibold">
                                <Calendar className="w-4 h-4 text-zinc-500" />
                                <span>{record.appointment_date}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-bold text-zinc-950 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                                <Clock className="w-3.5 h-3.5 text-zinc-700" />
                                <span>{record.time_slot}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Patient Information Block */}
                        <div className="space-y-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {isBn ? "রোগীর তথ্য" : "Patient Information"}
                          </div>

                          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 text-xs">
                            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                              <span className="text-zinc-500">{isBn ? "রোগীর নাম:" : "Name:"}</span>
                              <span className="font-bold text-zinc-900">{record.patient_name}</span>
                            </div>

                            <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                              <span className="text-zinc-500">{isBn ? "মোবাইল নম্বর:" : "Phone:"}</span>
                              <span className="font-bold text-zinc-900 font-mono">{record.patient_phone}</span>
                            </div>

                            {record.symptoms && (
                              <div className="pt-1">
                                <span className="text-zinc-500 block mb-1">
                                  {isBn ? "রোগীর লক্ষণ / সমস্যা:" : "Reported Symptoms:"}
                                </span>
                                <p className="text-zinc-700 italic bg-white p-2.5 rounded-xl border border-zinc-200/70 text-[11px] leading-relaxed">
                                  "{record.symptoms}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{isBn ? t(settings.address) : settings.address.en}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPrintingRecord(record);
                              setTimeout(() => {
                                window.print();
                              }, 150);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{isBn ? "স্লিপ প্রিন্ট" : "Print Pass"}</span>
                          </button>

                          <a
                            href={`https://wa.me/8801700000000?text=${encodeURIComponent(
                              `Hello KGH Dental, regarding my appointment ref: ${record.reference_code} for patient ${record.patient_name}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Exclusively printed in print media */}
      {printingRecord && (
        <div className="hidden print:block text-left">
          <AppointmentPrintSlip
            bookingRef={printingRecord.reference_code}
            doctorName={printingRecord.doctor_name}
            departmentName={printingRecord.department_name}
            date={printingRecord.appointment_date}
            timeSlot={printingRecord.time_slot}
            patientName={printingRecord.patient_name}
            patientPhone={printingRecord.patient_phone}
            symptoms={printingRecord.symptoms}
            paymentStatus="UNPAID"
          />
        </div>
      )}
    </div>
  );
}

export default function TrackAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8 text-zinc-500 text-sm">
          Loading tracker...
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  );
}
