"use client";

import React from "react";
import Image from "next/image";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

export interface AppointmentPrintSlipProps {
  bookingRef: string;
  doctorName: string;
  departmentName?: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: string;
  patientGender?: string;
  symptoms?: string;
  bookingStatus?: string;
  paymentStatus?: "UNPAID" | "PAID";
}

export function AppointmentPrintSlip({
  bookingRef,
  doctorName,
  departmentName = "Specialist Consultation",
  date,
  timeSlot,
  patientName,
  patientPhone,
  patientEmail,
  patientAge,
  patientGender,
  symptoms,
  paymentStatus = "UNPAID",
}: AppointmentPrintSlipProps) {
  const { settings } = useClinicSettings();
  const currentDateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      id="kgh-print-slip"
      className="printable-slip-wrapper bg-white text-zinc-900 font-sans p-6 sm:p-8 max-w-[800px] mx-auto border border-zinc-300 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full"
    >
      {/* Clinic Header */}
      <div className="border-b-2 border-zinc-900 pb-5 mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-44 h-12">
            <Image
              src="/images/logos/kgh-logo-transparent.png"
              alt="KGH Dental Care"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>
        <div className="text-right text-xs text-zinc-600 leading-relaxed">
          <p className="font-bold text-zinc-950 text-sm tracking-tight">{settings.name || "KGH DENTAL CARE"}</p>
          <p>{settings.address.en}</p>
          <p className="font-medium text-zinc-800">
            Hotline: {settings.phoneNumbers[0]} | Web: www.kghdental.com
          </p>
        </div>
      </div>

      {/* Slip Title & Ref Bar */}
      <div className="bg-zinc-100 border border-zinc-300 rounded-xl p-3.5 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
            OFFICIAL APPOINTMENT SLIP / টোকেন
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs font-semibold text-zinc-700">Booking Ref:</span>
            <span className="font-mono text-base font-extrabold text-zinc-950 tracking-wider">
              {bookingRef || "KGH-APPT-XXXXXX"}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-zinc-500 block">
            Generated:
          </span>
          <span className="text-xs font-bold text-zinc-800 font-mono mt-0.5 block">
            {currentDateFormatted}
          </span>
        </div>
      </div>

      {/* Two Column Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5 text-xs">
        {/* Patient Details */}
        <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
          <h4 className="font-bold uppercase tracking-wider text-zinc-600 text-[10px] border-b border-zinc-200 pb-1.5 mb-2.5">
            Patient Information / রোগীর বিবরণ
          </h4>
          <table className="w-full space-y-1">
            <tbody>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium w-28 py-0.5">Patient Name:</td>
                <td className="font-bold text-zinc-900 py-0.5">{patientName || "—"}</td>
              </tr>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium py-0.5">Phone Number:</td>
                <td className="font-bold text-zinc-900 font-mono py-0.5">{patientPhone || "—"}</td>
              </tr>
              {(patientAge || patientGender) && (
                <tr className="py-1">
                  <td className="text-zinc-500 font-medium py-0.5">Demographics:</td>
                  <td className="text-zinc-800 py-0.5">
                    {[patientAge ? `${patientAge} yrs` : null, patientGender].filter(Boolean).join(" • ")}
                  </td>
                </tr>
              )}
              {patientEmail && (
                <tr className="py-1">
                  <td className="text-zinc-500 font-medium py-0.5">Email:</td>
                  <td className="text-zinc-800 py-0.5">{patientEmail}</td>
                </tr>
              )}
              {symptoms && (
                <tr className="py-1">
                  <td className="text-zinc-500 font-medium py-0.5 align-top">Reported Issue:</td>
                  <td className="text-zinc-700 italic py-0.5">{symptoms}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Doctor & Schedule Details */}
        <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
          <h4 className="font-bold uppercase tracking-wider text-zinc-600 text-[10px] border-b border-zinc-200 pb-1.5 mb-2.5">
            Consultation & Schedule / ডাক্তার ও সময়
          </h4>
          <table className="w-full space-y-1">
            <tbody>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium w-28 py-0.5">Specialist:</td>
                <td className="font-bold text-zinc-950 py-0.5">{doctorName || "Assigned Doctor"}</td>
              </tr>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium py-0.5">Department:</td>
                <td className="text-zinc-800 py-0.5">{departmentName}</td>
              </tr>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium py-0.5">Appt. Date:</td>
                <td className="font-bold text-zinc-950 py-0.5">{date || "—"}</td>
              </tr>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium py-0.5">Time Slot:</td>
                <td className="font-bold text-zinc-950 py-0.5">{timeSlot || "—"}</td>
              </tr>
              <tr className="py-1">
                <td className="text-zinc-500 font-medium py-0.5">Chamber:</td>
                <td className="text-zinc-800 py-0.5">Level 4, Reception & OPD</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Guidelines */}
      <div className="border-t border-zinc-200 pt-3 text-[11px] text-zinc-600 space-y-1 leading-normal">
        <p className="font-bold text-zinc-800">রোগীর জন্য গুরুত্বপূর্ণ নির্দেশনা / Instructions:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>নির্ধারিত সময়ের কমপক্ষে ১০-১৫ মিনিট পূর্বে চেম্বারে উপস্থিত থাকার অনুরোধ করা হচ্ছে।</li>
          <li>রিসিপশনে এই স্লিপ অথবা রেফারেন্স কোডটি ({bookingRef}) প্রদর্শন করে সিরিয়াল নিশ্চিত করুন।</li>
          <li>যেকোনো তথ্য বা সময় পরিবর্তনের জন্য আমাদের হেল্পলাইনে যোগাযোগ করুন: {settings.phoneNumbers[0]}।</li>
        </ul>
      </div>

      {/* Footer stamp line */}
      <div className="mt-4 pt-3 border-t border-zinc-200 text-center text-[10px] text-zinc-400 flex items-center justify-between">
        <span>KGH Dental Care & Maxillofacial Center • Computer Generated Slip</span>
        <span>Valid with physical reception verification</span>
      </div>
    </div>
  );
}
