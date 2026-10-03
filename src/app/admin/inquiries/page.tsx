"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Trash2,
  X,
  ExternalLink,
  CheckCheck,
  Loader2,
  RefreshCw,
  Send,
  MessageCircle,
  Tag,
  AlertCircle,
  Eye,
  FileText,
} from "lucide-react";
import { fetchLiveInquiries, updateLiveInquiryStatus, deleteLiveInquiry } from "@/lib/api/db";
import {
  exportInquiriesToCSV,
  getReadInquiryIds,
  isInquiryRead,
  markInquiryAsRead,
  markInquiryAsUnread,
  markAllInquiriesAsRead,
} from "@/lib/inquiry-utils";
import { ContactInquiry, InquiryStatus } from "@/types";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [timeHorizon, setTimeHorizon] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminNoteText, setAdminNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const loadInquiries = async () => {
    try {
      const data = await fetchLiveInquiries();
      setInquiries(data || []);
    } catch (err) {
      console.error("Error loading inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
    setReadIds(getReadInquiryIds());

    const handleSync = () => {
      setReadIds(getReadInquiryIds());
      loadInquiries();
    };

    window.addEventListener("kgh_inquiries_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("kgh_inquiries_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Stats computation
  const stats = useMemo(() => {
    const total = inquiries.length;
    const unread = inquiries.filter(
      (inq) => !isInquiryRead(inq.id, readIds) && inq.status !== "replied" && inq.status !== "archived"
    ).length;
    const replied = inquiries.filter((inq) => inq.status === "replied").length;

    const todayStr = new Date().toISOString().split("T")[0];
    const todayCount = inquiries.filter((inq) => inq.created_at?.startsWith(todayStr)).length;

    return { total, unread, replied, todayCount };
  }, [inquiries, readIds]);

  // Filtering and searching
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (inq.name || "").toLowerCase();
        const phone = (inq.phone || "").toLowerCase();
        const email = (inq.email || "").toLowerCase();
        const msg = (inq.message || "").toLowerCase();
        const notes = (inq.admin_notes || "").toLowerCase();
        if (!name.includes(q) && !phone.includes(q) && !email.includes(q) && !msg.includes(q) && !notes.includes(q)) {
          return false;
        }
      }

      // 2. Status Filter
      if (filterStatus === "unread") {
        if (isInquiryRead(inq.id, readIds) || inq.status === "replied" || inq.status === "archived") return false;
      } else if (filterStatus === "read") {
        if (!isInquiryRead(inq.id, readIds)) return false;
      } else if (filterStatus !== "all") {
        if (inq.status !== filterStatus) return false;
      }

      // 3. Time Horizon
      if (timeHorizon !== "all" && inq.created_at) {
        const itemDate = new Date(inq.created_at);
        const now = new Date();
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeHorizon === "today" && diffDays > 1) return false;
        if (timeHorizon === "week" && diffDays > 7) return false;
        if (timeHorizon === "month" && diffDays > 30) return false;
      }

      return true;
    });
  }, [inquiries, searchQuery, filterStatus, timeHorizon, readIds]);

  const handleOpenDetail = (inq: ContactInquiry) => {
    markInquiryAsRead(inq.id);
    setReadIds((prev) => Array.from(new Set([...prev, inq.id])));
    setSelectedInquiry(inq);
    setAdminNoteText(inq.admin_notes || "");
  };

  const handleToggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isInquiryRead(id, readIds)) {
      markInquiryAsUnread(id);
      setReadIds((prev) => prev.filter((r) => r !== id));
    } else {
      markInquiryAsRead(id);
      setReadIds((prev) => [...prev, id]);
    }
  };

  const handleMarkAllRead = () => {
    const allIds = inquiries.map((i) => i.id);
    markAllInquiriesAsRead(allIds);
    setReadIds(allIds);
  };

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    const updated = inquiries.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
    setInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
    await updateLiveInquiryStatus(id, newStatus);
  };

  const handleSaveAdminNote = async () => {
    if (!selectedInquiry) return;
    setIsSavingNote(true);
    try {
      await updateLiveInquiryStatus(selectedInquiry.id, selectedInquiry.status, adminNoteText.trim());
      setInquiries((prev) =>
        prev.map((i) => (i.id === selectedInquiry.id ? { ...i, admin_notes: adminNoteText.trim() } : i))
      );
      setSelectedInquiry((prev) => (prev ? { ...prev, admin_notes: adminNoteText.trim() } : null));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDelete = async (inq: ContactInquiry) => {
    const confirmed = window.confirm(`Permanently delete inquiry from ${inq.name}?`);
    if (!confirmed) return;

    await deleteLiveInquiry(inq.id);
    setInquiries((prev) => prev.filter((i) => i.id !== inq.id));
    if (selectedInquiry?.id === inq.id) {
      setSelectedInquiry(null);
    }
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/[^0-9]/g, "");
    const formatted = clean.startsWith("88") ? clean : clean.startsWith("0") ? `88${clean}` : `880${clean}`;
    const text = encodeURIComponent(
      `Hello ${name}, thank you for contacting KGH Dental Care Banani. We received your inquiry and are happy to assist you.`
    );
    return `https://wa.me/${formatted}?text=${text}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                Patient Inquiries & Leads
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Manage inbound inquiries, patient consultation queries, and contact form leads
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => exportInquiriesToCSV(filteredInquiries)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Excel (CSV)</span>
          </button>

          <button
            onClick={loadInquiries}
            className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer"
            title="Refresh Inquiries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Inquiries</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 mt-1">{stats.total}</div>
          <span className="text-[11px] text-zinc-400 mt-1 block">All registered inquiries</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">New / Unread</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{stats.unread}</div>
          <span className="text-[11px] text-amber-700 mt-1 block">Awaiting staff response</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Replied / Contacted</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{stats.replied}</div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Followed up by team</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 shadow-xs">
          <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Today's Leads</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-1">{stats.todayCount}</div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Received within 24 hours</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone number, email, or message..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1c362b] focus:border-transparent bg-zinc-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <div className="flex items-center rounded-xl border border-zinc-200 p-1 bg-zinc-50 text-xs font-bold">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: `Unread (${stats.unread})` },
                { key: "replied", label: "Replied" },
                { key: "archived", label: "Archived" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterStatus === tab.key
                      ? "bg-white text-zinc-900 shadow-xs font-extrabold"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-bold bg-white text-zinc-700 cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Content Table / Cards */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-zinc-200/80">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-500 font-medium">Loading patient inquiries...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-zinc-200/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900">No Patient Inquiries Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery || filterStatus !== "all"
              ? "No inquiries matched your search or status filters. Try clearing filters."
              : "No patient inquiries have been submitted through the contact form yet."}
          </p>
          {(searchQuery || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setTimeHorizon("all");
              }}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
          {filteredInquiries.map((inq) => {
            const isRead = isInquiryRead(inq.id, readIds) || inq.status === "replied" || inq.status === "archived";

            return (
              <div
                key={inq.id}
                onClick={() => handleOpenDetail(inq)}
                className={`p-4 sm:p-5 hover:bg-zinc-50/80 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  !isRead ? "bg-amber-50/30 font-semibold" : ""
                }`}
              >
                {/* Left: Patient Info & Message Preview */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="New Unread Message" />
                    )}
                    <h3 className={`text-sm text-zinc-900 truncate ${!isRead ? "font-extrabold" : "font-bold"}`}>
                      {inq.name}
                    </h3>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        inq.status === "replied"
                          ? "bg-emerald-100 text-emerald-800"
                          : inq.status === "archived"
                          ? "bg-zinc-100 text-zinc-600"
                          : !isRead
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {inq.status === "replied"
                        ? "Replied"
                        : inq.status === "archived"
                        ? "Archived"
                        : !isRead
                        ? "New"
                        : "Read"}
                    </span>

                    <span className="text-[11px] text-zinc-400 font-normal">
                      • {formatDate(inq.created_at)}
                    </span>
                  </div>

                  {/* Phone & Email line */}
                  <div className="flex items-center gap-4 text-xs text-zinc-600 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      {inq.phone}
                    </span>
                    {inq.email && (
                      <span className="inline-flex items-center gap-1 text-zinc-500 truncate max-w-xs">
                        <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                        {inq.email}
                      </span>
                    )}
                  </div>

                  {/* Message Excerpt */}
                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed pt-1">
                    {inq.message}
                  </p>

                  {/* Admin Note preview if present */}
                  {inq.admin_notes && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px]">
                      <FileText className="w-3 h-3 text-zinc-400" />
                      <span className="font-semibold">Note:</span> {inq.admin_notes}
                    </div>
                  )}
                </div>

                {/* Right: Quick Action Buttons */}
                <div
                  className="flex items-center gap-1.5 self-end md:self-center shrink-0 pt-2 md:pt-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={`tel:${inq.phone.replace(/[^0-9+]/g, "")}`}
                    className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                    title={`Call ${inq.name}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={getWhatsAppLink(inq.phone, inq.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>

                  {inq.email && (
                    <a
                      href={`mailto:${inq.email}?subject=KGH%20Dental%20Care%20Follow-up`}
                      className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={(e) => handleToggleRead(e, inq.id)}
                    className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
                    title={isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {isRead ? <Mail className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDelete(inq)}
                    className="p-2 rounded-xl hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Inquiry Details
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900 mt-0.5">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              {/* Patient Meta Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block mb-0.5">Phone Number</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-bold text-zinc-900 hover:text-emerald-700 font-mono"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-zinc-500 font-semibold block mb-0.5">Date Received</span>
                  <span className="font-bold text-zinc-900">
                    {formatDate(selectedInquiry.created_at)}
                  </span>
                </div>

                {selectedInquiry.email && (
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 col-span-2">
                    <span className="text-zinc-500 font-semibold block mb-0.5">Email Address</span>
                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="font-bold text-zinc-900 hover:text-emerald-700"
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Patient Message */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                  Patient Inquiry Message
                </label>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                  Inquiry Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "unread", label: "Unread" },
                    { key: "replied", label: "Replied" },
                    { key: "archived", label: "Archived" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleStatusChange(selectedInquiry.id, s.key as InquiryStatus)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        selectedInquiry.status === s.key
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                          : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coordinator Notes */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">
                  Internal Coordinator Notes (Saved to Database)
                </label>
                <textarea
                  rows={3}
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="e.g., Called patient on Oct 3, booked consultation with Dr. Diean..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1c362b]"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSaveAdminNote}
                    disabled={isSavingNote}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleDelete(selectedInquiry)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Inquiry</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={getWhatsAppLink(selectedInquiry.phone, selectedInquiry.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1c362b] hover:bg-[#14261e] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
