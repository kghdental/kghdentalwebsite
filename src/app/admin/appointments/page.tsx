"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  FileText,
  Download,
  CalendarOff,
  Trash2,
  Plus,
  X,
  Printer,
  ChevronDown,
  Mail,
  MailOpen,
  CheckCheck,
} from "lucide-react";
import {
  fetchLiveAppointments,
  updateLiveAppointmentStatus,
  deleteLiveAppointment,
  fetchDoctorBlockedDates,
  addDoctorBlockedDate,
  removeDoctorBlockedDate,
  resolveDoctorDisplayName,
  resolveDepartmentDisplayName,
} from "@/lib/api/db";
import { DOCTORS } from "@/data/doctors";
import { AppointmentRecord, DoctorBlockedDate } from "@/types";
import {
  exportAppointmentsToCSV,
  getReadAppointmentRefs,
  isAppointmentRead,
  markAppointmentAsRead,
  markAppointmentAsUnread,
  markAllAppointmentsAsRead,
} from "@/lib/appointment-utils";

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: "app-1",
    reference_code: "KGH-ADS202606Sep-001",
    patient_name: "Rafiqul Islam",
    patient_phone: "01712345678",
    patient_email: "rafiqul@example.com",
    doctor_name: "Dr. Ahamed Diean Sammir",
    department_name: "Prosthodontics",
    appointment_date: "2026-09-06",
    time_slot: "05:30 PM",
    symptoms: "Upper molar tooth replacement and crown inquiry.",
    status: "confirmed",
    created_at: "2026-09-02 18:30",
  },
  {
    id: "app-2",
    reference_code: "KGH-FTM202608Sep-002",
    patient_name: "Farhana Akter",
    patient_phone: "01898765432",
    doctor_name: "Dr. Fatema Tasrin Madhubi",
    department_name: "Orthodontics",
    appointment_date: "2026-09-08",
    time_slot: "06:00 PM",
    symptoms: "Mild tooth crowding, interested in clear aligners.",
    status: "confirmed",
    created_at: "2026-09-01 15:20",
  },
  {
    id: "app-3",
    reference_code: "KGH-SMH202605Sep-003",
    patient_name: "Kamal Hossain",
    patient_phone: "01911223344",
    doctor_name: "Dr. Md. Sanwar Hossain",
    department_name: "Oral & Maxillofacial Surgery",
    appointment_date: "2026-09-05",
    time_slot: "07:00 PM",
    symptoms: "Lower impacted wisdom tooth severe pain.",
    status: "confirmed",
    created_at: "2026-09-01 11:10",
  },
  {
    id: "app-4",
    reference_code: "KGH-ADS202604Sep-004",
    patient_name: "Nusrat Jahan",
    patient_phone: "01677889900",
    doctor_name: "Dr. Ahamed Diean Sammir",
    department_name: "Conservative Dentistry",
    appointment_date: "2026-09-04",
    time_slot: "06:30 PM",
    symptoms: "Tooth sensitivity to cold water, needs filling.",
    status: "confirmed",
    created_at: "2026-08-30 14:00",
  },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);
  const [readRefs, setReadRefs] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [timeHorizon, setTimeHorizon] = useState<"all" | "today" | "week" | "month">("all");
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppointmentRecord | null>(null);

  // Leave / Blocked Dates Management
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [blockedDates, setBlockedDates] = useState<DoctorBlockedDate[]>([]);
  const [leaveDoctorId, setLeaveDoctorId] = useState(DOCTORS[0]?.id || "");
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  // Load appointments and read state on mount
  useEffect(() => {
    // Read cached/live appointments
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("kgh_admin_appointments");
      if (cached) {
        try {
          const list = JSON.parse(cached);
          if (Array.isArray(list) && list.length > 0) {
            setAppointments(
              list.map((a) => ({
                ...a,
                status: a.status === "cancelled" ? "cancelled" : "confirmed",
              }))
            );
          }
        } catch {
          // ignore
        }
      }
    }

    fetchLiveAppointments().then((liveApps) => {
      if (liveApps && liveApps.length > 0) {
        const normalized = liveApps.map((a) => ({
          ...a,
          doctor_name: resolveDoctorDisplayName(a.doctor_name || a.doctor_id),
          department_name: resolveDepartmentDisplayName(
            a.department_name || a.department_id,
            a.doctor_name || a.doctor_id
          ),
          status: a.status === "cancelled" ? "cancelled" : "confirmed",
        }));
        setAppointments(normalized);
      }
    });

    fetchDoctorBlockedDates().then((blks) => {
      if (blks) setBlockedDates(blks);
    });

    setReadRefs(getReadAppointmentRefs());

    const handleSync = () => {
      setReadRefs(getReadAppointmentRefs());
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("kgh_admin_appointments");
        if (cached) {
          try {
            const list = JSON.parse(cached);
            if (Array.isArray(list) && list.length > 0) {
              setAppointments(
                list.map((a) => ({
                  ...a,
                  status: a.status === "cancelled" ? "cancelled" : "confirmed",
                }))
              );
            }
          } catch {
            // ignore
          }
        }
      }
    };

    window.addEventListener("kgh_appointments_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("kgh_appointments_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const unreadCount = useMemo(() => {
    return appointments.filter(
      (a) => !isAppointmentRead(a.reference_code, readRefs) && !isAppointmentRead(a.id, readRefs)
    ).length;
  }, [appointments, readRefs]);

  const handleStatusChange = async (
    id: string,
    newStatus: "confirmed" | "cancelled",
    referenceCode?: string
  ) => {
    const updated = appointments.map((a) =>
      a.id === id || (referenceCode && a.reference_code === referenceCode)
        ? { ...a, status: newStatus }
        : a
    );
    setAppointments(updated);
    if (
      selectedApp &&
      (selectedApp.id === id || (referenceCode && selectedApp.reference_code === referenceCode))
    ) {
      setSelectedApp({ ...selectedApp, status: newStatus });
    }
    await updateLiveAppointmentStatus(id, newStatus, referenceCode);
  };

  const handleOpenDetails = (app: AppointmentRecord) => {
    markAppointmentAsRead(app.reference_code);
    setReadRefs((prev) => Array.from(new Set([...prev, app.reference_code])));
    setSelectedApp(app);
  };

  const handleToggleRead = (e: React.MouseEvent, refCode: string) => {
    e.stopPropagation();
    if (isAppointmentRead(refCode, readRefs)) {
      markAppointmentAsUnread(refCode);
      setReadRefs((prev) => prev.filter((r) => r !== refCode));
    } else {
      markAppointmentAsRead(refCode);
      setReadRefs((prev) => [...prev, refCode]);
    }
  };

  const handleMarkAllRead = () => {
    const allRefs = appointments.map((a) => a.reference_code);
    markAllAppointmentsAsRead(allRefs);
    setReadRefs(allRefs);
  };

  const handleDeleteAppointment = async (app: AppointmentRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete appointment #${app.reference_code} for ${app.patient_name}?`
    );
    if (!confirmed) return;

    await deleteLiveAppointment(app.id, app.reference_code);
    setAppointments((prev) =>
      prev.filter((a) => a.reference_code !== app.reference_code && a.id !== app.id)
    );
    if (
      selectedApp?.reference_code === app.reference_code ||
      selectedApp?.id === app.id
    ) {
      setSelectedApp(null);
    }
  };

  // Distinct doctors list for dropdown: Strictly the 6 registered clinical specialists
  const doctorsOptions = useMemo(() => {
    return DOCTORS.map((d) => d.name.en);
  }, []);

  // Filtered Appointments Logic
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Compute start and end of week (Sunday to Saturday)
    const currentDay = now.getDay();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - currentDay);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM

    return appointments.filter((app) => {
      // Status & Unread filter
      if (filterStatus === "unread") {
        const isUnread =
          !isAppointmentRead(app.reference_code, readRefs) &&
          !isAppointmentRead(app.id, readRefs);
        if (!isUnread) return false;
      } else if (filterStatus === "confirmed") {
        if (app.status === "cancelled") return false;
      } else if (filterStatus === "cancelled") {
        if (app.status !== "cancelled") return false;
      }

      // Doctor filter
      if (filterDoctor !== "all") {
        const resolvedDoc = resolveDoctorDisplayName(app.doctor_name || app.doctor_id);
        if (resolvedDoc !== filterDoctor) return false;
      }

      // Time Horizon filter
      if (timeHorizon === "today" && app.appointment_date !== todayStr) return false;
      if (
        timeHorizon === "week" &&
        (app.appointment_date < weekStartStr || app.appointment_date > weekEndStr)
      )
        return false;
      if (timeHorizon === "month" && !app.appointment_date.startsWith(currentYearMonth))
        return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cleanQ = q.replace(/[\s-]/g, "");
        const cleanRef = app.reference_code.toLowerCase().replace(/[\s-]/g, "");
        const docName = resolveDoctorDisplayName(app.doctor_name || app.doctor_id).toLowerCase();
        const deptName = resolveDepartmentDisplayName(
          app.department_name || app.department_id,
          app.doctor_name
        ).toLowerCase();
        const matchesQuery =
          app.patient_name.toLowerCase().includes(q) ||
          app.patient_phone.includes(q) ||
          app.reference_code.toLowerCase().includes(q) ||
          (cleanQ.length >= 3 && cleanRef.includes(cleanQ)) ||
          docName.includes(q) ||
          deptName.includes(q);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [appointments, filterStatus, filterDoctor, timeHorizon, searchQuery, readRefs]);

  // Handle Export to Excel (CSV)
  const handleExportCSV = () => {
    const filename = `KGH_Appointments_${timeHorizon}_${new Date().toISOString().split("T")[0]}.csv`;
    exportAppointmentsToCSV(filteredAppointments, filename);
  };

  // Handle Adding a Doctor Blocked Date
  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDoctorId || !leaveDate) return;

    setIsSubmittingLeave(true);
    try {
      const res = await addDoctorBlockedDate({
        doctor_id: leaveDoctorId,
        blocked_date: leaveDate,
        reason: leaveReason || "Doctor Leave / Off-Day",
      });

      if (res.success && res.data) {
        setBlockedDates((prev) => [res.data, ...prev]);
        setLeaveDate("");
        setLeaveReason("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Handle Removing a Doctor Blocked Date
  const handleRemoveLeave = async (id: string) => {
    await removeDoctorBlockedDate(id);
    setBlockedDates((prev) => prev.filter((b) => b.id !== id));
  };

  const getStatusBadge = (status: AppointmentRecord["status"]) => {
    if (status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Confirmed
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Patient Registry & Reception Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Appointment Bookings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Real-time consultation schedules, patient conflict prevention, and export center.
          </p>
        </div>

        {/* Action Controls: Export to CSV & Manage Leaves */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold shadow-xs hover:border-zinc-300 transition-all"
            title="Download CSV for Microsoft Excel"
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>Export to Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <CalendarOff className="w-4 h-4" />
            <span>Doctor Leaves / Off-Days</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Time Horizon & Status */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Time Horizon Tabs (Day / Week / Month / All) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 self-start">
            {[
              { key: "all", label: "All Dates" },
              { key: "today", label: "Today (আজ)" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
            ].map((th) => (
              <button
                key={th.key}
                onClick={() => setTimeHorizon(th.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeHorizon === th.key
                    ? "bg-white text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>

          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">Doctor:</span>
            <div className="relative">
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="pl-3 pr-8 py-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-900 focus:outline-hidden focus:ring-1 focus:ring-zinc-950 appearance-none"
              >
                <option value="all">All Doctors (সব ডাক্তার)</option>
                {doctorsOptions.map((docName) => (
                  <option key={docName} value={docName}>
                    {docName}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Search & Status Tabs */}
        <div className="pt-2 border-t border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status & Unread Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: `All (${appointments.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "confirmed", label: "Confirmed" },
              { key: "cancelled", label: "Cancelled" },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setFilterStatus(st.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st.key
                    ? st.key === "cancelled"
                      ? "bg-red-700 text-white shadow-2xs"
                      : st.key === "unread"
                      ? "bg-sky-600 text-white shadow-2xs"
                      : st.key === "confirmed"
                      ? "bg-emerald-700 text-white shadow-2xs"
                      : "bg-zinc-900 text-white shadow-2xs"
                    : st.key === "unread" && unreadCount > 0
                    ? "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100"
                    : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                {st.key === "unread" && unreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                )}
                {st.key === "confirmed" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                {st.key === "cancelled" && <XCircle className="w-3 h-3 text-red-600" />}
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ref, patient, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs focus:outline-hidden focus:ring-1 focus:ring-zinc-950 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Appointments Counter & Table */}
      <div className="rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-zinc-950">{filteredAppointments.length}</strong> appointments
            </span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 animate-pulse" />
                {unreadCount} unread / new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
                title="Mark all appointments as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-zinc-500" />
                <span>Mark all as read</span>
              </button>
            )}
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              KGH Dental Reception Desk
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-600 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 text-xs">
                    No appointments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => {
                  const isUnread =
                    !isAppointmentRead(app.reference_code, readRefs) &&
                    !isAppointmentRead(app.id, readRefs);

                  return (
                    <tr
                      key={app.id || app.reference_code}
                      onClick={() => handleOpenDetails(app)}
                      className={`transition-colors cursor-pointer group ${
                        isUnread
                          ? "bg-sky-50/75 hover:bg-sky-100/80 border-l-4 border-l-sky-600 font-semibold"
                          : "bg-white hover:bg-zinc-50/80 text-zinc-700 border-l-4 border-l-transparent"
                      }`}
                    >
                      {/* Ref Code */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          {isUnread && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-600 text-white text-[9px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                              NEW
                            </span>
                          )}
                          <span
                            className={
                              isUnread
                                ? "font-extrabold text-zinc-950"
                                : "font-bold text-zinc-800"
                            }
                          >
                            {app.reference_code}
                          </span>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="py-3.5 px-4">
                        <div
                          className={
                            isUnread
                              ? "font-extrabold text-zinc-950 flex items-center gap-1.5"
                              : "font-bold text-zinc-900 flex items-center gap-1.5"
                          }
                        >
                          <span>{app.patient_name}</span>
                          {(app.patient_age || app.patient_gender) && (
                            <span className="text-[10px] font-normal text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                              {[app.patient_age ? `${app.patient_age}y` : null, app.patient_gender].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[11px] mt-0.5">
                          <a
                            href={`tel:${app.patient_phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline flex items-center gap-1 font-mono"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{app.patient_phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/88${app.patient_phone}?text=${encodeURIComponent(
                              `Hello ${app.patient_name}, this is KGH Dental regarding your appointment (#${app.reference_code}) with ${app.doctor_name} on ${app.appointment_date} at ${app.time_slot}.`
                            )}`}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800"
                            title="Message on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Doctor Info */}
                      <td className="py-3.5 px-4">
                        <div
                          className={
                            isUnread
                              ? "font-bold text-zinc-950"
                              : "font-semibold text-zinc-900"
                          }
                        >
                          {resolveDoctorDisplayName(app.doctor_name || app.doctor_id)}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {resolveDepartmentDisplayName(
                            app.department_name || app.department_id,
                            app.doctor_name
                          )}
                        </div>
                      </td>

                      {/* Date & Slot */}
                      <td className="py-3.5 px-4">
                        <div
                          className={
                            isUnread
                              ? "font-bold text-zinc-950"
                              : "font-semibold text-zinc-900"
                          }
                        >
                          {app.appointment_date}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{app.time_slot}</span>
                        </div>
                      </td>

                      {/* Status with Direct Change Dropdown (Only Confirmed / Cancelled) */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            value={app.status === "cancelled" ? "cancelled" : "confirmed"}
                            onChange={(e) =>
                              handleStatusChange(
                                app.id,
                                e.target.value as "confirmed" | "cancelled",
                                app.reference_code
                              )
                            }
                            className={`text-xs font-bold pl-3 pr-7 py-1.5 rounded-full border cursor-pointer appearance-none transition-all focus:outline-hidden focus:ring-2 focus:ring-offset-1 shadow-2xs ${
                              app.status === "cancelled"
                                ? "bg-red-50 text-red-800 border-red-300 focus:ring-red-500"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300 focus:ring-emerald-500"
                            }`}
                            title="Click to switch status"
                          >
                            <option value="confirmed">✓ Confirmed</option>
                            <option value="cancelled">✕ Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>

                      {/* Actions: Toggle Read, Confirm/Cancel, Details, Delete */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* Gmail style Toggle Read/Unread button */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleRead(e, app.reference_code)}
                            className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                            title={isUnread ? "Mark as Read" : "Mark as Unread"}
                          >
                            {isUnread ? (
                              <Mail className="w-3.5 h-3.5 text-sky-600" />
                            ) : (
                              <MailOpen className="w-3.5 h-3.5 text-zinc-400" />
                            )}
                          </button>

                          {/* Quick Status Button */}
                          {app.status === "cancelled" ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(app.id, "confirmed", app.reference_code)
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
                              title="Restore to Confirmed"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(app.id, "cancelled", app.reference_code)
                              }
                              className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold cursor-pointer transition-colors"
                              title="Cancel Appointment"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(app)}
                            className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Details
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAppointment(app)}
                            className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                            title="Delete Appointment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  Appointment Details
                </span>
                <h3 className="text-lg font-bold text-zinc-950 font-mono">
                  {selectedApp.reference_code}
                </h3>
              </div>
              {getStatusBadge(selectedApp.status)}
            </div>

            {/* Admin Status Controller (Only 2 statuses: Confirmed / Cancelled) */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between">
                <span>Appointment Status / স্ট্যাটাস:</span>
                <span className="text-[11px] font-normal text-zinc-500">Instant Sync</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApp.id, "confirmed", selectedApp.reference_code)
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedApp.status !== "cancelled"
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-600/30 shadow-xs"
                      : "bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                  }`}
                >
                  ✓ Confirmed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStatusChange(selectedApp.id, "cancelled", selectedApp.reference_code)
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedApp.status === "cancelled"
                      ? "bg-red-600 text-white ring-2 ring-red-600/30 shadow-xs"
                      : "bg-white border border-red-300 text-red-800 hover:bg-red-50"
                  }`}
                >
                  ✕ Cancelled
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Patient Name:</span>
                  <span className="font-bold text-zinc-900">{selectedApp.patient_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phone Number:</span>
                  <a
                    href={`tel:${selectedApp.patient_phone}`}
                    className="font-bold text-zinc-900 hover:underline"
                  >
                    {selectedApp.patient_phone}
                  </a>
                </div>
                {(selectedApp.patient_age || selectedApp.patient_gender) && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Demographics:</span>
                    <span className="text-zinc-800 font-medium">
                      {[selectedApp.patient_age ? `${selectedApp.patient_age} yrs` : null, selectedApp.patient_gender].filter(Boolean).join(" • ")}
                    </span>
                  </div>
                )}
                {selectedApp.patient_email && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email:</span>
                    <span className="text-zinc-800">{selectedApp.patient_email}</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Doctor:</span>
                  <span className="font-bold text-zinc-900">
                    {resolveDoctorDisplayName(selectedApp.doctor_name || selectedApp.doctor_id)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Department:</span>
                  <span className="font-semibold text-zinc-800">
                    {resolveDepartmentDisplayName(
                      selectedApp.department_name || selectedApp.department_id,
                      selectedApp.doctor_name
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date & Slot:</span>
                  <span className="font-bold text-zinc-900">
                    {selectedApp.appointment_date} at {selectedApp.time_slot}
                  </span>
                </div>
              </div>

              {selectedApp.symptoms && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="text-zinc-500 font-medium">
                    Patient Symptoms / Chief Complaint:
                  </span>
                  <p className="text-zinc-800 font-normal leading-relaxed">
                    {selectedApp.symptoms}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions: WhatsApp, Delete, Close */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={`https://wa.me/88${selectedApp.patient_phone}?text=${encodeURIComponent(
                  `Hello ${selectedApp.patient_name}, this is KGH Dental regarding your appointment (#${selectedApp.reference_code}) with ${resolveDoctorDisplayName(
                    selectedApp.doctor_name || selectedApp.doctor_id
                  )} on ${selectedApp.appointment_date} at ${selectedApp.time_slot}. Status: ${selectedApp.status.toUpperCase()}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Message</span>
              </a>

              <button
                type="button"
                onClick={() => handleDeleteAppointment(selectedApp)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                title="Delete this appointment"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Leave / Off-Day Manager Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">
                    Doctor Leaves & Off-Days
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Block specific dates from the public booking calendar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Leave Form */}
            <form onSubmit={handleAddLeave} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Block a New Date for Doctor
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Select Doctor:
                  </label>
                  <select
                    value={leaveDoctorId}
                    onChange={(e) => setLeaveDoctorId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-900 bg-white"
                  >
                    <option value="all">All Doctors (Clinic Holiday)</option>
                    {DOCTORS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                    Date to Block:
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  Reason / Note (Optional):
                </label>
                <input
                  type="text"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Attending dental conference, personal emergency..."
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLeave || !leaveDate}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-zinc-300 text-white text-xs font-bold transition-colors shadow-xs"
              >
                {isSubmittingLeave ? "Blocking Date..." : "Block This Date"}
              </button>
            </form>

            {/* Currently Blocked Dates List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                <span>Active Blocked Dates ({blockedDates.length})</span>
                <span className="text-[11px] font-normal text-zinc-500">
                  Patients cannot book on these dates
                </span>
              </div>

              {blockedDates.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  No active leaves or blocked dates configured.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {blockedDates.map((b) => {
                    const doc = DOCTORS.find((d) => d.id === b.doctor_id);
                    const docName = b.doctor_id === "all" ? "All Doctors" : doc ? doc.name.en : b.doctor_id;

                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-zinc-900">
                            {b.blocked_date}{" "}
                            <span className="text-zinc-500 font-normal">({docName})</span>
                          </div>
                          {b.reason && (
                            <div className="text-[11px] text-zinc-500">{b.reason}</div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLeave(b.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Unblock date"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
