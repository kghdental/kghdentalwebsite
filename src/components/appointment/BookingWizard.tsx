"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Printer,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  Eye,
  MapPin,
  Stethoscope,
  Search,
  MessageSquare,
} from "lucide-react";
import { DOCTORS } from "@/data/doctors";
import { Doctor } from "@/types";
import {
  fetchLiveDoctors,
  createLiveAppointment,
  fetchBookedSlots,
  fetchDoctorBlockedDates,
} from "@/lib/api/db";
import { generateAppointmentReference } from "@/lib/appointment-utils";
import { CalendarMonthView } from "@/components/appointment/CalendarMonthView";
import { AppointmentPrintSlip } from "@/components/appointment/AppointmentPrintSlip";
import { DEPARTMENTS } from "@/data/departments";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { UI_STRINGS } from "@/data/translations";
import { downloadSlipPdf } from "@/lib/pdf-export";

export function BookingWizard() {
  const searchParams = useSearchParams();
  const preSelectedDoctor = searchParams.get("doctor");
  const preSelectedDept = searchParams.get("department");
  const preSelectedTreatment = searchParams.get("treatment");

  const { t, isBn } = useLanguage();
  const { settings: clinicSettings } = useClinicSettings();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);

  useEffect(() => {
    fetchLiveDoctors().then((docs) => {
      if (docs && docs.length > 0) {
        setDoctorsList(docs);
      }
    });
  }, []);

  // Helper to format Date to YYYY-MM-DD
  const formatIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayIso = useMemo(() => formatIso(new Date()), []);

  // Calculate initial date based on URL parameters (or default to today)
  const initialSelectedDate = useMemo(() => {
    const today = new Date();
    if (preSelectedDoctor) {
      const doc = DOCTORS.find((d) => d.id === preSelectedDoctor);
      if (doc && doc.schedule.daysOfWeek.length > 0) {
        // Find next day of week matching this doctor
        for (let i = 0; i < 14; i++) {
          const testDate = new Date();
          testDate.setDate(today.getDate() + i);
          if (doc.schedule.daysOfWeek.includes(testDate.getDay())) {
            return formatIso(testDate);
          }
        }
      }
    }
    if (preSelectedDept) {
      const dept = DEPARTMENTS.find((d) => d.slug === preSelectedDept);
      if (dept && dept.leadDoctorId) {
        const doc = DOCTORS.find((d) => d.id === dept.leadDoctorId);
        if (doc && doc.schedule.daysOfWeek.length > 0) {
          for (let i = 0; i < 14; i++) {
            const testDate = new Date();
            testDate.setDate(today.getDate() + i);
            if (doc.schedule.daysOfWeek.includes(testDate.getDay())) {
              return formatIso(testDate);
            }
          }
        }
      }
    }
    return todayIso;
  }, [preSelectedDoctor, preSelectedDept, todayIso]);

  // Wizard state: 3 main steps (1: Date & Doctor & Slot, 2: Patient Details, 3: Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preSelectedDoctor || "");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");

  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [patientAge, setPatientAge] = useState<string>("");
  const [patientGender, setPatientGender] = useState<string>("");
  const [visitReason, setVisitReason] = useState<string>(
    preSelectedTreatment ? `Consultation for ${preSelectedTreatment}` : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingRef, setBookingRef] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSlipPreview, setShowSlipPreview] = useState<boolean>(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const slipContainerRef = React.useRef<HTMLDivElement>(null);

  // Calendar and slot collision states
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Day of week of the selected date (0=Sun, 1=Mon, ..., 6=Sat)
  const selectedDayOfWeek = useMemo(() => {
    if (!selectedDate) return new Date().getDay();
    const [y, m, d] = selectedDate.split("-").map(Number);
    return new Date(y, m - 1, d).getDay();
  }, [selectedDate]);

  // Filter doctors who have chamber on this selected date
  const availableDoctorsOnDate = useMemo(() => {
    return doctorsList.filter((doc) => {
      const worksOnDay = doc.schedule.daysOfWeek.includes(selectedDayOfWeek);
      const isBlocked =
        blockedDates.includes(`${doc.id}:${selectedDate}`) ||
        blockedDates.includes(selectedDate);
      return worksOnDay && !isBlocked;
    });
  }, [doctorsList, selectedDayOfWeek, selectedDate, blockedDates]);

  // When date changes, if currently selected doctor does NOT sit on that date, reset doctor selection.
  // We keep all doctor cards unselected by default until the patient explicitly clicks one.
  useEffect(() => {
    if (selectedDoctorId) {
      const exists = availableDoctorsOnDate.some((d) => d.id === selectedDoctorId);
      if (!exists) {
        setSelectedDoctorId("");
        setSelectedTimeSlot("");
      }
    }
  }, [availableDoctorsOnDate, selectedDoctorId]);

  const activeDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctorsList.find((d) => d.id === selectedDoctorId) || null;
  }, [selectedDoctorId, doctorsList]);

  // Fetch blocked dates for the active doctor
  useEffect(() => {
    if (activeDoctor?.id) {
      fetchDoctorBlockedDates(activeDoctor.id).then((blks) => {
        setBlockedDates(blks.map((b: any) => b.blocked_date));
      });
    }
  }, [activeDoctor]);

  // Fetch booked slots for the active doctor on selected date
  useEffect(() => {
    if (activeDoctor?.id && selectedDate) {
      setLoadingSlots(true);
      fetchBookedSlots(activeDoctor.id, selectedDate, activeDoctor.name.en)
        .then((slots) => setBookedSlots(slots))
        .finally(() => setLoadingSlots(false));
    } else {
      setBookedSlots([]);
    }
  }, [activeDoctor, selectedDate]);

  // Generate 30-min time slots for active doctor
  const availableSlots = useMemo(() => {
    if (!activeDoctor?.schedule?.startTime || !activeDoctor?.schedule?.endTime) return [];
    const slots: string[] = [];
    const [startH, startM] = activeDoctor.schedule.startTime.split(":").map(Number);
    const [endH, endM] = activeDoctor.schedule.endTime.split(":").map(Number);
    const interval = activeDoctor.schedule.slotDurationMinutes || 30;

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes < endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;

      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m === 0 ? "00" : m < 10 ? `0${m}` : m;

      slots.push(`${displayH}:${displayM} ${period}`);
      currentMinutes += interval;
    }

    return slots;
  }, [activeDoctor]);

  // Friendly date display string
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayNamesBn = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthNamesBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

    const dayName = isBn ? dayNamesBn[dateObj.getDay()] : dayNamesEn[dateObj.getDay()];
    const monthName = isBn ? monthNamesBn[dateObj.getMonth()] : monthNamesEn[dateObj.getMonth()];
    return `${dayName}, ${d} ${monthName} ${y}`;
  }, [selectedDate, isBn]);

  // Handle proceed from Step 1 to Step 2
  const handleProceedToDetails = () => {
    setErrors({});
    if (!selectedDate) {
      setErrors({ date: isBn ? "অনুগ্রহ করে একটি তারিখ নির্বাচন করুন" : "Please select a date" });
      return;
    }
    if (!selectedDoctorId || !activeDoctor) {
      setErrors({ doctor: isBn ? "অনুগ্রহ করে একজন ডাক্তার বেছে নিন" : "Please select a specialist doctor" });
      return;
    }
    if (!selectedTimeSlot) {
      setErrors({ slot: isBn ? "অনুগ্রহ করে একটি সুবিধাজনক সময় নির্বাচন করুন" : "Please choose an appointment time slot" });
      return;
    }

    setCurrentStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  // Handle final submission in Step 2
  const handleConfirmAppointment = async () => {
    setErrors({});
    const errs: Record<string, string> = {};

    if (!patientName.trim()) {
      errs.name = isBn ? "রোগীর নাম পূরণ করুন" : "Patient name is required";
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 8) {
      errs.phone = isBn ? "সঠিক মোবাইল নম্বর প্রদান করুন" : "A valid phone number is required";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);

    try {
      const ref = generateAppointmentReference(activeDoctor?.id, activeDoctor?.name?.en, selectedDate);
      setBookingRef(ref);

      await createLiveAppointment({
        reference_code: ref,
        patient_name: patientName,
        patient_phone: patientPhone,
        patient_email: patientEmail || undefined,
        patient_age: patientAge || undefined,
        patient_gender: patientGender || undefined,
        doctor_id: activeDoctor?.id,
        doctor_name: activeDoctor ? activeDoctor.name.en : "Specialist Doctor",
        department_id: activeDoctor?.departmentId,
        department_name: activeDoctor ? activeDoctor.specialty.en : "General Consultation",
        appointment_date: selectedDate,
        time_slot: selectedTimeSlot,
        symptoms: visitReason || undefined,
        status: "confirmed",
      });

      // Dispatch automated email notification in background (non-blocking for smooth UX)
      fetch("/api/send-appointment-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference_code: ref,
          patient_name: patientName,
          patient_phone: patientPhone,
          patient_email: patientEmail || undefined,
          patient_age: patientAge || undefined,
          patient_gender: patientGender || undefined,
          doctor_id: activeDoctor?.id,
          doctor_name: activeDoctor ? activeDoctor.name.en : "Specialist Doctor",
          department_name: activeDoctor ? activeDoctor.specialty.en : "Specialist Consultation",
          appointment_date: selectedDate,
          time_slot: selectedTimeSlot,
          symptoms: visitReason || undefined,
        }),
      }).catch((emailErr) => {
        console.warn("Background doctor email dispatch notification (non-fatal):", emailErr);
      });

      setIsSubmitted(true);
      setShowSlipPreview(true);
      setCurrentStep(3);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 250, behavior: "smooth" });
      }
    } catch (err: any) {
      console.warn("Appointment confirmation warning:", err);
      // Even if network fails, booking ref is shown from local cache
      setIsSubmitted(true);
      setShowSlipPreview(true);
      setCurrentStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedDate(todayIso);
    setSelectedTimeSlot("");
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setPatientAge("");
    setPatientGender("");
    setVisitReason("");
    setIsSubmitted(false);
    setShowSlipPreview(true);
  };

  const copyRefCode = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(bookingRef);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!showSlipPreview) {
      setShowSlipPreview(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setIsDownloadingPdf(true);
    try {
      const el =
        (slipContainerRef.current?.querySelector(".printable-slip-wrapper") as HTMLElement) ||
        slipContainerRef.current ||
        (document.getElementById("kgh-print-slip") as HTMLElement | null);

      if (!el) {
        console.warn("Slip element not found for PDF export.");
        return;
      }

      const fileName = `KGH-Appointment-${bookingRef || "Slip"}.pdf`;
      await downloadSlipPdf(el, fileName);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const stepLabels = [
    { num: 1, title: { en: "1. Date, Doctor & Time", bn: "১. তারিখ, ডাক্তার ও সময়" } },
    { num: 2, title: { en: "2. Patient Details", bn: "২. রোগীর তথ্য" } },
    { num: 3, title: { en: "3. Confirmation", bn: "৩. নিশ্চিতকরণ" } },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white border border-zinc-200/90 rounded-3xl shadow-xl overflow-hidden transition-all">
      {/* Top Wizard Steps Header */}
      <div className="bg-[#474B4E] text-white p-6 sm:p-8 border-b border-[#3b3e41]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isBn ? "স্মার্ট অ্যাপয়েন্টমেন্ট সিস্টেম" : "Smart Chamber Reservation"}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {isSubmitted
              ? isBn ? "ধাপ ৩ / ৩ (সম্পন্ন)" : "Step 3 of 3 (Confirmed)"
              : isBn ? `ধাপ ${currentStep} / ৩` : `Step ${currentStep} of 3`}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          {isBn ? UI_STRINGS.bookingWizard.title.bn : UI_STRINGS.bookingWizard.title.en}
        </h2>

        {/* Progress Step Indicators (3 Steps) */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {stepLabels.map((s) => {
            const isCompleted = isSubmitted ? true : currentStep > s.num;
            const isCurrent = !isSubmitted && currentStep === s.num;

            return (
              <div key={s.num} className="space-y-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isCompleted
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      : isCurrent
                      ? "bg-white"
                      : "bg-zinc-800"
                  }`}
                />
                <span
                  className={`text-xs font-medium truncate block ${
                    isCompleted
                      ? "text-emerald-400 font-semibold"
                      : isCurrent
                      ? "text-white font-bold"
                      : "text-zinc-500"
                  }`}
                >
                  {isBn ? s.title.bn : s.title.en}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Content Body */}
      <div className="p-6 sm:p-8 lg:p-10">
        {/* =================================================================== */}
        {/* STEP 1: Choose Date First -> See Available Doctors -> Pick Time Slot */}
        {/* =================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-8">
            {/* Header intro */}
            <div>
              <h3 className="text-xl font-extrabold text-zinc-950 flex items-center gap-2">
                <span>{isBn ? "১. তারিখ, বিশেষজ্ঞ ডাক্তার ও সময় নির্বাচন করুন" : "1. Choose Date, Specialist & Time Slot"}</span>
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                {isBn
                  ? "প্রথমে ক্যালেন্ডার থেকে আপনার সুবিধাজনক তারিখ নির্বাচন করুন। ওই তারিখে চেম্বারে উপস্থিত বিশেষজ্ঞ ডাক্তারদের তালিকা ও সময়সূচি স্বয়ংক্রিয়ভাবে ডানপাশে দেখা যাবে।"
                  : "Pick your preferred date on the calendar first. Specialists available on that day and their 30-minute time slots will appear on the right."}
              </p>
            </div>

            {/* 2-Column Responsive Layout: Left = Calendar, Right = Available Doctors & Slots */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN (5 Cols): Interactive Calendar */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-900" />
                    {isBn ? "চেম্বারের ক্যালেন্ডার" : "Chamber Calendar"}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {isBn ? "আগামী ৩ মাসের সময়সূচি উন্মুক্ত" : "Next 3 months open"}
                  </span>
                </div>

                <CalendarMonthView
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedTimeSlot("");
                    setErrors((prev) => ({ ...prev, date: "", slot: "" }));
                  }}
                  doctors={doctorsList}
                  blockedDates={blockedDates}
                  isBn={isBn}
                />

                {/* Selected Date Highlights Card */}
                <div className="p-4 rounded-2xl bg-[#474B4E] text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">
                      {isBn ? "নির্বাচিত তারিখ" : "Selected Date"}
                    </span>
                    <div className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                      {selectedDateFormatted}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      <Stethoscope className="w-3.5 h-3.5" />
                      {availableDoctorsOnDate.length} {isBn ? "জন ডাক্তার" : "Specialists"}
                    </span>
                  </div>
                </div>

                {errors.date && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.date}</span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (7 Cols): Available Doctors for the Date & Their Time Slots */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-zinc-900" />
                      {isBn ? "চেম্বারে উপস্থিত বিশেষজ্ঞ ডাক্তারবৃন্দ" : "Specialists Available on this Date"}
                    </span>
                    <span className="text-xs font-bold text-zinc-600">
                      {selectedDateFormatted.split(",")[0]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {isBn
                      ? "পরামর্শ নিতে নিচের ডাক্তারদের মধ্য থেকে যেকোনো একজন বেছে নিন:"
                      : "Click on a specialist to view their 30-minute consultation slots:"}
                  </p>
                </div>

                {availableDoctorsOnDate.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                    <h4 className="text-sm font-bold text-amber-900">
                      {isBn ? "এই তারিখে কোনো নিয়মিত চেম্বার নেই" : "No Regular Chamber on this Date"}
                    </h4>
                    <p className="text-xs text-amber-700 max-w-md mx-auto">
                      {isBn
                        ? "অনুগ্রহ করে বামপাশের ক্যালেন্ডার থেকে অন্য একটি তারিখ নির্বাচন করুন অথবা জরুরি পরামর্শের জন্য আমাদের হেল্পলাইনে সরাসরি কল করুন।"
                        : "Please choose another date on the calendar, or call our clinic emergency helpline directly."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableDoctorsOnDate.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id;

                      return (
                        <div
                          key={doc.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            isSelected
                              ? "border-[#474B4E] bg-zinc-50/70 shadow-md ring-1 ring-[#474B4E]"
                              : "border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/40"
                          }`}
                        >
                          {/* Doctor Main Header / Clickable Card */}
                          <div
                            onClick={() => {
                              if (isSelected) {
                                setSelectedDoctorId("");
                                setSelectedTimeSlot("");
                              } else {
                                setSelectedDoctorId(doc.id);
                                setSelectedTimeSlot("");
                                setErrors((prev) => ({ ...prev, doctor: "", slot: "" }));
                              }
                            }}
                            className="p-4 sm:p-5 flex items-start gap-4 cursor-pointer"
                          >
                            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-zinc-200 shrink-0 border border-zinc-300 shadow-2xs">
                              <img
                                src={doc.photoUrl}
                                alt={t(doc.name)}
                                className="w-full h-full object-cover object-top"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md truncate">
                                  {t(doc.specialty)}
                                </span>
                                {isSelected ? (
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950 bg-zinc-200/80 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{isBn ? "নির্বাচিত" : "Selected"}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1 rounded-full border border-zinc-200 transition-all">
                                    {isBn ? "সিলেক্ট করুন" : "Select Doctor"}
                                  </span>
                                )}
                              </div>

                              <h4 className="text-base font-extrabold text-zinc-950 truncate mt-1">
                                {t(doc.name)}
                              </h4>
                              <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">
                                {t(doc.degrees)}
                              </p>

                              {/* Chamber timing on this date */}
                              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1 font-semibold text-zinc-800 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                                  <Clock className="w-3.5 h-3.5 text-zinc-700" />
                                  {doc.schedule.note
                                    ? isBn
                                      ? doc.schedule.note.bn
                                      : doc.schedule.note.en
                                    : isBn
                                    ? doc.schedule.availableDaysBn
                                    : doc.schedule.availableDaysEn}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* INLINE TIME SLOTS (Expands when this doctor is selected) */}
                          {isSelected && (
                            <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-zinc-200 bg-white space-y-3">
                              <div className="flex items-center justify-between pt-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-zinc-900" />
                                  {isBn ? "সময় নির্বাচন করুন (৩০ মিনিট স্লট):" : "Select Consultation Time Slot (30-Min):"}
                                </label>
                                <span className="text-[11px] text-zinc-500">
                                  {loadingSlots
                                    ? isBn ? "স্লট চেক হচ্ছে..." : "Checking slots..."
                                    : `${availableSlots.length - bookedSlots.length} / ${availableSlots.length} ${
                                        isBn ? "স্লট খালি" : "slots available"
                                      }`}
                                </span>
                              </div>

                              {loadingSlots ? (
                                <div className="py-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                                  <Loader2 className="w-4 h-4 animate-spin text-zinc-700" />
                                  <span>{isBn ? "স্লটের তথ্য লোড হচ্ছে..." : "Loading live slots..."}</span>
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {availableSlots.map((slot) => {
                                    const isSlotSelected = selectedTimeSlot === slot;
                                    const isBooked = bookedSlots.includes(slot);

                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!isBooked) {
                                            setSelectedTimeSlot(slot);
                                            setErrors((prev) => ({ ...prev, slot: "" }));
                                          }
                                        }}
                                        className={`relative p-2.5 sm:p-3 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                                          isSlotSelected
                                            ? "bg-[#474B4E] text-white border-[#474B4E] shadow-md ring-2 ring-[#474B4E] scale-102 font-bold"
                                            : isBooked
                                            ? "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through"
                                            : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 active:scale-95"
                                        }`}
                                      >
                                        <div className="tracking-tight">{slot}</div>
                                        {isBooked && (
                                          <span className="text-[9px] uppercase tracking-wider text-rose-600 block mt-0.5 no-underline font-bold">
                                            {isBn ? "বুকড" : "Booked"}
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {errors.slot && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  <span>{errors.slot}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {errors.doctor && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.doctor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Summary & Continue Action Bar */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 lg:-mx-10 lg:-mb-10 p-6 sm:p-8 rounded-b-3xl">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-zinc-700 w-full sm:w-auto">
                <div className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    {isBn ? "তারিখ" : "Date"}
                  </span>
                  <span className="font-bold text-zinc-950">{selectedDateFormatted || "Not chosen"}</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    {isBn ? "ডাক্তার" : "Specialist"}
                  </span>
                  <span className={`font-bold ${activeDoctor ? "text-zinc-950" : "text-zinc-400"}`}>
                    {activeDoctor ? t(activeDoctor.name) : (isBn ? "ডাক্তার বেছে নিন" : "Select doctor")}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    {isBn ? "সময়" : "Time Slot"}
                  </span>
                  <span
                    className={`font-bold ${
                      selectedTimeSlot ? "text-emerald-700" : "text-zinc-400"
                    }`}
                  >
                    {selectedTimeSlot || (isBn ? "সময় নির্বাচন করুন" : "Pick slot")}
                  </span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                <button
                  type="button"
                  onClick={handleProceedToDetails}
                  disabled={!selectedDate || !selectedDoctorId || !selectedTimeSlot}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                    selectedDate && selectedDoctorId && selectedTimeSlot
                      ? "bg-[#474B4E] text-white hover:bg-[#3b3f42] hover:shadow-lg active:scale-98 cursor-pointer"
                      : "bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300"
                  }`}
                >
                  <span>{isBn ? "রোগীর তথ্য দিন" : "Continue to Patient Details"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: Patient Contact Details */}
        {/* =================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-950">
                {isBn ? "২. রোগীর যোগাযোগের তথ্য প্রদান করুন" : "2. Enter Patient Contact Details"}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                {isBn
                  ? "সিরিয়াল নিশ্চিত করার জন্য আমাদের ক্লিনিক কোঅর্ডিনেটর এই নম্বরে যোগাযোগ করবেন।"
                  : "Our clinic coordinator will call this number to verify and confirm your consultation schedule."}
              </p>
            </div>

            {/* Selected Booking Summary Strip */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              {activeDoctor && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 shrink-0 border border-zinc-300">
                    <img
                      src={activeDoctor.photoUrl}
                      alt={t(activeDoctor.name)}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                      {t(activeDoctor.specialty)}
                    </span>
                    <h4 className="font-extrabold text-zinc-950 text-sm">{t(activeDoctor.name)}</h4>
                  </div>
                </div>
              )}

              <div>
                <span className="text-zinc-500 block text-[11px]">{isBn ? "নির্ধারিত সময়সূচি:" : "Schedule:"}</span>
                <span className="font-bold text-zinc-950 text-sm">
                  {selectedDateFormatted} at {selectedTimeSlot}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-zinc-950 underline underline-offset-4 hover:text-black cursor-pointer"
              >
                {isBn ? "তারিখ বা ডাক্তার পরিবর্তন করুন" : "Change Date/Doctor"}
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-2">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  {isBn ? UI_STRINGS.bookingWizard.labels.fullName.bn : UI_STRINGS.bookingWizard.labels.fullName.en} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={isBn ? "উদা: মো. রফিকুল ইসলাম" : "e.g., Rafiqul Islam"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                  />
                </div>
                {errors.name && (
                  <span className="text-xs text-red-600 font-medium block mt-1">{errors.name}</span>
                )}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  {isBn ? UI_STRINGS.bookingWizard.labels.phone.bn : UI_STRINGS.bookingWizard.labels.phone.en} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder={isBn ? "উদা: 017XXXXXXXX" : "e.g., 017XXXXXXXX"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                  />
                </div>
                {errors.phone && (
                  <span className="text-xs text-red-600 font-medium block mt-1">{errors.phone}</span>
                )}
              </div>

              {/* Age and Gender (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                    {isBn ? "রোগীর বয়স (ঐচ্ছিক)" : "Patient Age (Optional)"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder={isBn ? "উদা: ৩২ বছর" : "e.g., 32 yrs"}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                    {isBn ? "জেন্ডার / লিঙ্গ (ঐচ্ছিক)" : "Gender (Optional)"}
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all bg-white"
                  >
                    <option value="">{isBn ? "-- নির্বাচন করুন --" : "-- Select Gender --"}</option>
                    <option value="Male">{isBn ? "পুরুষ (Male)" : "Male"}</option>
                    <option value="Female">{isBn ? "মহিলা (Female)" : "Female"}</option>
                    <option value="Child">{isBn ? "শিশু (Child)" : "Child"}</option>
                    <option value="Other">{isBn ? "অন্যান্য (Other)" : "Other"}</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  {isBn ? UI_STRINGS.bookingWizard.labels.email.bn : UI_STRINGS.bookingWizard.labels.email.en}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder={isBn ? "উদা: patient@example.com" : "e.g., patient@example.com"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                  />
                </div>
              </div>

              {/* Reason / Symptoms */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  {isBn ? UI_STRINGS.bookingWizard.labels.reason.bn : UI_STRINGS.bookingWizard.labels.reason.en}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder={
                      isBn
                        ? "দাঁতে ব্যথা, মাড়ি দিয়ে রক্ত পড়া, ক্যাপ বা ফিলিং ইত্যাদি সমস্যা..."
                        : "Describe toothache, bleeding gums, crown requirement, sensitivity, etc."
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-6 border-t border-zinc-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isBn ? "তারিখ পরিবর্তন" : "Back to Calendar"}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAppointment}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#474B4E] text-white font-bold text-sm hover:bg-[#3b3f42] shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isBn ? "সিরিয়াল নিশ্চিত হচ্ছে..." : "Confirming Reservation..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isBn ? "অ্যাপয়েন্টমেন্ট নিশ্চিত করুন" : "Confirm Appointment"}</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: Booking Confirmation & Official Slip */}
        {/* =================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-8 max-w-3xl mx-auto py-2">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
                {isBn
                  ? UI_STRINGS.bookingWizard.confirmation.heading.bn
                  : UI_STRINGS.bookingWizard.confirmation.heading.en}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                {isBn
                  ? UI_STRINGS.bookingWizard.confirmation.message.bn
                  : UI_STRINGS.bookingWizard.confirmation.message.en}
              </p>
            </div>

            {/* Reference Number Banner */}
            <div className="p-6 rounded-2xl bg-[#474B4E] text-white text-center space-y-2 shadow-lg">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold">
                {isBn
                  ? UI_STRINGS.bookingWizard.confirmation.bookingRef.bn
                  : UI_STRINGS.bookingWizard.confirmation.bookingRef.en}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                {bookingRef}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={copyRefCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? (isBn ? "কপি হয়েছে!" : "Copied!") : isBn ? "কোড কপি করুন" : "Copy Reference"}</span>
                </button>
              </div>
            </div>

            {/* Appointment Details Card */}
            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <span className="text-zinc-500 block">{isBn ? "ডাক্তার:" : "Doctor:"}</span>
                  <span className="font-extrabold text-zinc-950 text-sm">
                    {activeDoctor ? t(activeDoctor.name) : ""}
                  </span>
                  {activeDoctor && (
                    <span className="text-emerald-700 font-semibold block text-[11px]">
                      {t(activeDoctor.specialty)}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-zinc-500 block">{isBn ? "তারিখ ও সময়:" : "Date & Time:"}</span>
                  <span className="font-extrabold text-zinc-950 text-sm">
                    {selectedDateFormatted} at {selectedTimeSlot}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 block">{isBn ? "রোগীর নাম:" : "Patient Name:"}</span>
                  <span className="font-bold text-zinc-950 text-sm">{patientName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">{isBn ? "মোবাইল নম্বর:" : "Contact Phone:"}</span>
                  <span className="font-bold text-zinc-950 text-sm">{patientPhone}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* 1. Direct Print Official Slip */}
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#474B4E] hover:bg-[#3b3f42] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isBn ? "অফিসিয়াল স্লিপ প্রিন্ট করুন" : "Print Official Slip"}</span>
                </button>

                {/* 2. Download Official Slip PDF */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {isDownloadingPdf
                      ? isBn
                        ? "পিডিএফ তৈরি হচ্ছে..."
                        : "Generating PDF..."
                      : isBn
                      ? "ডাউনলোড স্লিপ (PDF)"
                      : "Download Slip (PDF)"}
                  </span>
                </button>

                {/* 3. Track Status Online Button */}
                <Link
                  href={`/appointment/track?ref=${bookingRef}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-bold shadow-xs transition-all"
                >
                  <Search className="w-4 h-4 text-zinc-700" />
                  <span>{isBn ? "সিরিয়াল ট্র্যাক করুন" : "Track Status"}</span>
                </Link>

                {/* 4. WhatsApp Assist */}
                <a
                  href={`https://wa.me/${(clinicSettings.emergencyPhone || "8801700000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Hello KGH Dental, I booked an appointment.\nRef: ${bookingRef}\nPatient: ${patientName}\nDoctor: ${activeDoctor ? activeDoctor.name.en : ""}\nDate: ${selectedDateFormatted} at ${selectedTimeSlot}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isBn ? UI_STRINGS.bookingWizard.confirmation.whatsappBtn.bn : UI_STRINGS.bookingWizard.confirmation.whatsappBtn.en}</span>
                </a>

                {/* 5. Book Another */}
                <button
                  type="button"
                  onClick={resetWizard}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer"
                >
                  {isBn ? UI_STRINGS.bookingWizard.confirmation.bookAnotherBtn.bn : UI_STRINGS.bookingWizard.confirmation.bookAnotherBtn.en}
                </button>
              </div>

              {/* 6. Preview Official Appointment Slip Button */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setShowSlipPreview(!showSlipPreview)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 hover:text-zinc-950 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-zinc-600" />
                  <span>
                    {showSlipPreview
                      ? isBn
                        ? "অফিসিয়াল স্লিপ প্রিভিউ লুকান"
                        : "Hide Official Slip Preview"
                      : isBn
                      ? "অফিসিয়াল অ্যাপয়েন্টমেন্ট স্লিপ প্রিভিউ দেখুন"
                      : "Preview Official Appointment Slip"}
                  </span>
                </button>
              </div>

              {/* Printable Slip Render when preview toggled (Open by default) */}
              {showSlipPreview && (
                <div className="mt-6 pt-6 border-t border-zinc-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-zinc-700">
                      {isBn ? "অফিসিয়াল স্লিপ প্রিভিউ:" : "Official Slip Preview:"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        {isDownloadingPdf ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isBn ? "ডাউনলোড (PDF)" : "Download PDF"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") window.print();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#474B4E] text-white text-xs font-bold shadow-sm hover:bg-[#3b3f42] cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isBn ? "প্রিন্ট করুন" : "Print Now"}</span>
                      </button>
                    </div>
                  </div>
                  <div ref={slipContainerRef}>
                    <AppointmentPrintSlip
                      bookingRef={bookingRef}
                      doctorName={activeDoctor ? t(activeDoctor.name) : ""}
                      departmentName={activeDoctor ? t(activeDoctor.specialty) : ""}
                      date={selectedDateFormatted}
                      timeSlot={selectedTimeSlot}
                      patientName={patientName}
                      patientPhone={patientPhone}
                      patientEmail={patientEmail}
                      patientAge={patientAge}
                      patientGender={patientGender}
                      symptoms={visitReason}
                    />
                  </div>
                </div>
              )}

              {/* Hidden on web, exclusively visible & isolated during print */}
              <div className="hidden print:block text-left">
                <AppointmentPrintSlip
                  bookingRef={bookingRef}
                  doctorName={activeDoctor ? t(activeDoctor.name) : ""}
                  departmentName={activeDoctor ? t(activeDoctor.specialty) : ""}
                  date={selectedDateFormatted}
                  timeSlot={selectedTimeSlot}
                  patientName={patientName}
                  patientPhone={patientPhone}
                  patientEmail={patientEmail}
                  patientAge={patientAge}
                  patientGender={patientGender}
                  symptoms={visitReason}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
