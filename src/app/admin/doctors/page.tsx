"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Award,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Search,
  Check,
} from "lucide-react";
import { DOCTORS } from "@/data/doctors";
import { Doctor } from "@/types";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { fetchLiveDoctors, saveLiveDoctor, deleteLiveDoctor } from "@/lib/api/db";

export default function AdminDoctorsPage() {
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(DOCTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Doctor>({
    id: "",
    slug: "",
    name: { en: "", bn: "" },
    specialty: { en: "", bn: "" },
    degrees: { en: "", bn: "" },
    schedule: {
      availableDaysEn: "Every day except Tuesday",
      availableDaysBn: "মঙ্গলবার ব্যতীত প্রতিদিন",
      daysOfWeek: [0, 1, 3, 4, 5, 6],
      startTime: "17:00",
      endTime: "21:30",
      slotDurationMinutes: 30,
      note: { en: "5:00 PM – 9:30 PM", bn: "বিকাল ৫:০০ – রাত ৯:৩০" },
    },
    bio: { en: "", bn: "" },
    photoUrl: "/images/doctors/dr-diean.jpg",
    bmdcReg: "",
    isConfirmed: true,
    isActive: true,
  });

  // Load from Supabase on mount
  useEffect(() => {
    fetchLiveDoctors().then((docs) => {
      if (docs && docs.length > 0) {
        setDoctorsList(docs);
      }
    });
  }, []);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      id: `dr-${Date.now()}`,
      slug: `doctor-${Date.now()}`,
      name: { en: "", bn: "" },
      specialty: { en: "", bn: "" },
      degrees: { en: "", bn: "" },
      schedule: {
        availableDaysEn: "Every day except Tuesday",
        availableDaysBn: "মঙ্গলবার ব্যতীত প্রতিদিন",
        daysOfWeek: [0, 1, 3, 4, 5, 6],
        startTime: "17:00",
        endTime: "21:30",
        slotDurationMinutes: 30,
        note: { en: "5:00 PM – 9:30 PM", bn: "বিকাল ৫:০০ – রাত ৯:৩০" },
      },
      bio: { en: "", bn: "" },
      photoUrl: "/images/doctors/dr-diean.jpg",
      bmdcReg: "",
      isConfirmed: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData(doc);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this doctor from the directory? This will update the live website immediately.")) {
      const updated = doctorsList.filter((d) => d.id !== id);
      setDoctorsList(updated);
      await deleteLiveDoctor(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await saveLiveDoctor(formData);

      if (editingDoctor) {
        setDoctorsList(doctorsList.map((d) => (d.id === editingDoctor.id ? formData : d)));
      } else {
        setDoctorsList([...doctorsList, formData]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save doctor error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDoctors = doctorsList.filter(
    (d) =>
      d.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.name.bn.includes(searchQuery) ||
      d.specialty.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Specialist Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
            Doctors Directory ({doctorsList.length})
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600">
            Manage qualifications, degrees, chamber schedules, and doctor profile photos.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Specialist</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by doctor name or clinical specialty..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-zinc-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-950 shadow-xs"
        />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Doctor Avatar & Basic Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                  <img
                    src={doc.photoUrl}
                    alt={doc.name.en}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block truncate">
                    {doc.specialty.en}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-950 mt-0.5 truncate">
                    {doc.name.en}
                  </h3>
                  <p className="text-xs text-zinc-600 truncate">{doc.name.bn}</p>
                  {doc.bmdcReg && (
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                      BMDC: {doc.bmdcReg}
                    </span>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs mb-4">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-800">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{doc.schedule.availableDaysEn}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{doc.schedule.note?.en || "Standard consultation hours"}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                {doc.degrees.en}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={() => handleOpenEdit(doc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete Doctor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-950">
                  {editingDoctor ? "Edit Doctor Profile" : "Add New Specialist Doctor"}
                </h3>
                <p className="text-xs text-zinc-500">
                  Fill in doctor credentials, weekly recurring schedule, and photo.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Photo Selector with MediaPickerModal */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Doctor Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-300 shrink-0">
                    <img
                      src={formData.photoUrl}
                      alt="Doctor Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors border border-zinc-200"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload or Choose from Gallery</span>
                    </button>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Current: {formData.photoUrl}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name (English & Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Doctor Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value },
                      })
                    }
                    placeholder="e.g. Dr. Ahamed Diean Sammir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Doctor Name (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, bn: e.target.value },
                      })
                    }
                    placeholder="উদা: ডা. আহমেদ দিয়ান সাম্মির"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Specialty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Specialty (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialty: { ...formData.specialty, en: e.target.value },
                      })
                    }
                    placeholder="e.g. Prosthodontics & Implantology"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Specialty (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialty: { ...formData.specialty, bn: e.target.value },
                      })
                    }
                    placeholder="উদা: প্রস্থোডন্টিক্স ও ইমপ্ল্যান্ট বিশেষজ্ঞ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Degrees & Qualifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Degrees (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degrees.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        degrees: { ...formData.degrees, en: e.target.value },
                      })
                    }
                    placeholder="e.g. BDS, MS - Prosthodontics (BSMMU)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Degrees (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degrees.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        degrees: { ...formData.degrees, bn: e.target.value },
                      })
                    }
                    placeholder="উদা: বিডিএস, এমএস - প্রস্থোডন্টিক্স"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* BMDC Reg Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  BMDC Registration Number
                </label>
                <input
                  type="text"
                  value={formData.bmdcReg || ""}
                  onChange={(e) => setFormData({ ...formData, bmdcReg: e.target.value })}
                  placeholder="e.g. 6150"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                />
              </div>

              {/* Schedule Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Available Days (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schedule.availableDaysEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, availableDaysEn: e.target.value },
                      })
                    }
                    placeholder="e.g. Saturday only"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Available Days (Bengali) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schedule.availableDaysBn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, availableDaysBn: e.target.value },
                      })
                    }
                    placeholder="উদা: প্রতি শনিবার / প্রতি মঙ্গলবার"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Bio (English & Bengali) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Biographical Overview (English)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bio: { ...formData.bio, en: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Biographical Overview (Bengali)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio.bn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bio: { ...formData.bio, bn: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 rounded-xl hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingDoctor ? "Save Changes" : "Create Specialist Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal for Photo Selection */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setFormData({ ...formData, photoUrl: url })}
        title="Select Doctor Profile Photo"
        currentValue={formData.photoUrl}
      />
    </div>
  );
}
