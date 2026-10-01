import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { DOCTORS } from "@/data/doctors";
import { DEPARTMENTS } from "@/data/departments";
import { CLINIC_SETTINGS } from "@/data/settings";
import { BLOG_POSTS } from "@/data/blog";
import { REVIEWS } from "@/data/reviews";
import {
  Doctor,
  Department,
  SubService,
  ClinicSettings,
  BlogPost,
  GalleryItem,
  BeforeAfterItem,
  GoogleReview,
  WhyChooseCard,
  ClinicalCreedData,
  CreedQuoteItem,
  FeaturedVideo,
} from "@/types";
import { notifyAppointmentsUpdated } from "@/lib/appointment-utils";

// ==============================================================================
// 1. DOCTORS API
// ==============================================================================

export async function fetchLiveDoctors(includePrivate: boolean = false): Promise<Doctor[]> {
  if (!isSupabaseConfigured) return DOCTORS;

  try {
    // Only select private email when explicitly requested by an authorized context
    const columns = includePrivate
      ? "*"
      : "id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn, designation_en, designation_bn, institution_en, institution_bn, experience_en, experience_bn, department_id, schedule, bio_en, bio_bn, photo_url, bmdc_reg, is_active";

    const { data, error } = await supabase
      .from("doctors")
      .select(columns)
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return DOCTORS;
    }

    const liveDocs: Doctor[] = data.map((d: any): Doctor => {
      const staticDoc = DOCTORS.find((s) => s.id === d.id);
      return {
        id: d.id,
        slug: staticDoc?.slug || d.id,
        name: { en: d.name_en || staticDoc?.name?.en || "", bn: d.name_bn || staticDoc?.name?.bn || "" },
        specialty: { en: d.specialty_en || staticDoc?.specialty?.en || "", bn: d.specialty_bn || staticDoc?.specialty?.bn || "" },
        degrees: (() => {
          if (d.id === "dr-rafia" && staticDoc?.degrees) {
            return staticDoc.degrees;
          }
          if (d.degrees_en) {
            return { en: d.degrees_en, bn: d.degrees_bn || "" };
          }
          return staticDoc?.degrees || { en: "", bn: "" };
        })(),
        designation: d.designation_en ? { en: d.designation_en, bn: d.designation_bn } : staticDoc?.designation,
        institution: (() => {
          if (d.id === "dr-rafia" && staticDoc?.institution) {
            return staticDoc.institution;
          }
          const inst = d.institution_en ? { en: d.institution_en, bn: d.institution_bn } : staticDoc?.institution;
          if (d.id === "dr-rifat" && inst) {
            return {
              en: inst.en.replace(/&?\s*Oncology\s*/gi, "").trim(),
              bn: inst.bn.replace(/ও?\s*অনকোলজি\s*/g, "").trim(),
            };
          }
          return inst;
        })(),
        experience: (() => {
          if (d.id === "dr-rafia" && staticDoc?.experience) {
            return staticDoc.experience;
          }
          return d.experience_en ? { en: d.experience_en, bn: d.experience_bn } : staticDoc?.experience;
        })(),
        departmentId: d.department_id || staticDoc?.departmentId,
        schedule: d.schedule || staticDoc?.schedule || {
          days: ["Everyday"],
          startTime: "17:00",
          endTime: "21:30",
          slotDurationMinutes: 30,
        },
        bio: (() => {
          if (d.id === "dr-rafia" && staticDoc?.bio) {
            return staticDoc.bio;
          }
          return { en: d.bio_en || staticDoc?.bio?.en || "", bn: d.bio_bn || staticDoc?.bio?.bn || "" };
        })(),
        photoUrl: d.photo_url || staticDoc?.photoUrl || "/images/doctors/dr-diean.jpg",
        bmdcReg: d.bmdc_reg || staticDoc?.bmdcReg || "",
        email: includePrivate ? (d.email || staticDoc?.email || "") : undefined,
        isConfirmed: true,
        isActive: d.is_active ?? true,
      };
    });

    const missingStaticDocs = DOCTORS.filter((s) => !liveDocs.some((l) => l.id === s.id));
    return [...liveDocs, ...missingStaticDocs];
  } catch (err) {
    console.error("fetchLiveDoctors error:", err);
    return DOCTORS;
  }
}

export async function saveLiveDoctor(doc: Doctor): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: true };
  }

  try {
    const payload = {
      id: doc.id,
      name_en: doc.name.en,
      name_bn: doc.name.bn,
      specialty_en: doc.specialty.en,
      specialty_bn: doc.specialty.bn,
      degrees_en: doc.degrees.en,
      degrees_bn: doc.degrees.bn,
      designation_en: doc.designation?.en || null,
      designation_bn: doc.designation?.bn || null,
      institution_en: doc.institution?.en || null,
      institution_bn: doc.institution?.bn || null,
      experience_en: doc.experience?.en || null,
      experience_bn: doc.experience?.bn || null,
      department_id: doc.departmentId || null,
      schedule: doc.schedule,
      bio_en: doc.bio.en,
      bio_bn: doc.bio.bn,
      photo_url: doc.photoUrl,
      bmdc_reg: doc.bmdcReg || null,
      email: doc.email || null,
      is_active: doc.isActive ?? true,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", table: "doctors", payload, onConflict: "id" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to save doctor");
      return { success: true };
    }

    const { error } = await supabase.from("doctors").upsert(payload, { onConflict: "id" });
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("saveLiveDoctor error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteLiveDoctor(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "doctors", id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to delete doctor");
      return { success: true };
    }

    const { error } = await supabase.from("doctors").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveDoctor error:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 2. DEPARTMENTS & SUB-SERVICES API
// ==============================================================================

export async function fetchLiveDepartments(): Promise<Department[]> {
  if (!isSupabaseConfigured) return DEPARTMENTS;

  try {
    const { data: deptData, error: deptErr } = await supabase
      .from("departments")
      .select("*")
      .order("sort_order", { ascending: true });

    const { data: subData, error: subErr } = await supabase
      .from("sub_services")
      .select("*")
      .order("number", { ascending: true });

    if (deptErr || !deptData || deptData.length === 0) {
      return DEPARTMENTS;
    }

    const liveDepts = deptData.map((d: any) => {
      const staticDept = DEPARTMENTS.find((dep) => dep.id === d.id);
      const subsForDept = (subData || [])
        .filter((s: any) => s.department_id === d.id)
        .map((s: any) => {
          const staticSub = staticDept?.subServices?.find((sub) => sub.id === s.id || sub.number === s.number);
          return {
            id: s.id,
            number: s.number,
            name: { en: s.name_en, bn: s.name_bn },
            why: { en: s.why_en, bn: s.why_bn },
            when: { en: s.when_en, bn: s.when_bn },
            benefit: { en: s.benefit_en, bn: s.benefit_bn },
            imageUrl: s.image_url || staticSub?.imageUrl,
          };
        });

      return {
        id: d.id,
        slug: d.slug,
        name: { en: d.name_en, bn: d.name_bn },
        shortDesc: { en: d.short_desc_en, bn: d.short_desc_bn },
        iconName: d.icon_name,
        leadDoctorId: d.lead_doctor_id,
        imageUrl: d.image_url,
        coverBannerUrl: d.cover_banner_url || staticDept?.coverBannerUrl,
        subServices: subsForDept.length > 0 ? subsForDept : (staticDept?.subServices || []),
      };
    });

    const missingStaticDepts = DEPARTMENTS.filter((s) => !liveDepts.some((l) => l.id === s.id));
    return [...liveDepts, ...missingStaticDepts];
  } catch (err) {
    console.error("fetchLiveDepartments error:", err);
    return DEPARTMENTS;
  }
}

export async function saveLiveDepartment(dept: Department): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      id: dept.id,
      slug: dept.slug,
      name_en: dept.name.en,
      name_bn: dept.name.bn,
      short_desc_en: dept.shortDesc.en,
      short_desc_bn: dept.shortDesc.bn,
      icon_name: dept.iconName,
      lead_doctor_id: dept.leadDoctorId || null,
      image_url: dept.imageUrl,
      cover_banner_url: dept.coverBannerUrl || null,
    };

    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", table: "departments", payload, onConflict: "id" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to save department");
      return { success: true };
    }

    const { error } = await supabase.from("departments").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveDepartment error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteLiveDepartment(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "departments", id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to delete department");
      return { success: true };
    }

    // Remove linked sub-services first
    await supabase.from("sub_services").delete().eq("department_id", id);
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveDepartment error:", err);
    return { success: false, error: err.message };
  }
}

export async function saveLiveSubService(
  deptId: string,
  sub: SubService
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      id: sub.id.includes(deptId) ? sub.id : `${deptId}-${sub.id}`,
      department_id: deptId,
      number: sub.number,
      name_en: sub.name.en,
      name_bn: sub.name.bn,
      why_en: sub.why.en,
      why_bn: sub.why.bn,
      when_en: sub.when.en,
      when_bn: sub.when.bn,
      benefit_en: sub.benefit.en,
      benefit_bn: sub.benefit.bn,
      image_url: sub.imageUrl || null,
    };

    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", table: "sub_services", payload, onConflict: "id" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to save sub-service");
      return { success: true };
    }

    const { error } = await supabase.from("sub_services").upsert(payload, { onConflict: "id" });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveSubService error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteLiveSubService(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "sub_services", id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to delete sub-service");
      return { success: true };
    }

    const { error } = await supabase.from("sub_services").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveSubService error:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 3. APPOINTMENTS API
// ==============================================================================

/**
 * Resolves a doctor's slug or raw id (e.g. 'dr-bappy', 'dr-sanwar') to full clinical display name
 */
export function resolveDoctorDisplayName(idOrName: string | undefined): string {
  if (!idOrName) return "Specialist Doctor";
  const found = DOCTORS.find(
    (d) =>
      d.id.toLowerCase() === idOrName.toLowerCase() ||
      d.slug.toLowerCase() === idOrName.toLowerCase() ||
      d.name.en.toLowerCase() === idOrName.toLowerCase() ||
      d.name.bn === idOrName
  );
  return found ? found.name.en : idOrName;
}

/**
 * Resolves a department id or slug to full clinical specialty title
 */
export function resolveDepartmentDisplayName(deptIdOrName: string | undefined, doctorIdOrName?: string): string {
  if (doctorIdOrName) {
    const doc = DOCTORS.find(
      (d) =>
        d.id.toLowerCase() === doctorIdOrName.toLowerCase() ||
        d.slug.toLowerCase() === doctorIdOrName.toLowerCase() ||
        d.name.en.toLowerCase() === doctorIdOrName.toLowerCase()
    );
    if (doc) return doc.specialty.en;
  }
  if (!deptIdOrName || deptIdOrName === "general") {
    return "Specialist Consultation";
  }
  const foundDept = DEPARTMENTS.find(
    (d) => d.id.toLowerCase() === deptIdOrName.toLowerCase() || d.slug.toLowerCase() === deptIdOrName.toLowerCase()
  );
  if (foundDept) return foundDept.name.en;
  return deptIdOrName;
}

export async function fetchLiveAppointments(): Promise<any[]> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/appointments");
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.appointments)) {
          return json.appointments.map((a: any) => ({
            id: a.id,
            reference_code: a.reference_code,
            patient_name: a.patient_name,
            patient_phone: a.patient_phone,
            patient_email: a.patient_email || "",
            patient_age: a.patient_age || "",
            patient_gender: a.patient_gender || "",
            doctor_name: resolveDoctorDisplayName(a.doctor_name || a.doctor_id),
            department_name: resolveDepartmentDisplayName(
              a.department_name || a.department_id,
              a.doctor_name || a.doctor_id
            ),
            appointment_date: a.appointment_date,
            time_slot: a.time_slot,
            symptoms: a.symptoms || "",
            status: a.status || "confirmed",
            created_at: a.created_at ? a.created_at.substring(0, 16).replace("T", " ") : "",
          }));
        }
      }
    } catch (err) {
      console.error("fetchLiveAppointments API error:", err);
    }
  }
  return [];
}

export async function updateLiveAppointmentStatus(
  id: string,
  status: string,
  referenceCode?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    notifyAppointmentsUpdated();
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reference_code: referenceCode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Update appointment failed");
      return { success: true };
    } catch (err: any) {
      console.error("updateLiveAppointmentStatus error:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

export async function deleteLiveAppointment(
  id: string,
  referenceCode?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    notifyAppointmentsUpdated();
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reference_code: referenceCode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Delete appointment failed");
      return { success: true };
    } catch (err: any) {
      console.error("deleteLiveAppointment error:", err);
      return { success: false, error: err.message };
    }
  }
  return { success: true };
}

export async function createLiveAppointment(record: {
  reference_code: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_age?: string;
  patient_gender?: string;
  doctor_id?: string;
  doctor_name: string;
  department_id?: string;
  department_name: string;
  appointment_date: string;
  time_slot: string;
  symptoms?: string;
  status?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Always cache locally
  if (typeof window !== "undefined") {
    try {
      const resolvedDoc = resolveDoctorDisplayName(record.doctor_name || record.doctor_id);
      const resolvedDept = resolveDepartmentDisplayName(record.department_name || record.department_id, record.doctor_name || record.doctor_id);
      const newRecord = {
        id: `app-${Date.now()}`,
        reference_code: record.reference_code,
        patient_name: record.patient_name,
        patient_phone: record.patient_phone,
        patient_email: record.patient_email || "",
        patient_age: record.patient_age || "",
        patient_gender: record.patient_gender || "",
        doctor_id: record.doctor_id || "",
        doctor_name: resolvedDoc,
        department_id: record.department_id || "",
        department_name: resolvedDept,
        appointment_date: record.appointment_date,
        time_slot: record.time_slot,
        symptoms: record.symptoms || "",
        status: record.status || "confirmed",
        created_at: new Date().toISOString().replace("T", " ").substring(0, 16),
      };
      const existing = localStorage.getItem("kgh_admin_appointments");
      const list = existing ? JSON.parse(existing) : [];
      // Prevent duplicate reference_code entries
      const filtered = list.filter((a: any) => a.reference_code !== record.reference_code);
      localStorage.setItem("kgh_admin_appointments", JSON.stringify([newRecord, ...filtered]));
      notifyAppointmentsUpdated();
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload: any = {
      reference_code: record.reference_code,
      patient_name: record.patient_name,
      patient_phone: record.patient_phone,
      patient_email: record.patient_email || null,
      patient_age: record.patient_age || null,
      patient_gender: record.patient_gender || null,
      doctor_id: record.doctor_id || record.doctor_name,
      department_id: record.department_id || record.department_name,
      appointment_date: record.appointment_date,
      time_slot: record.time_slot,
      symptoms: record.symptoms || null,
      status: record.status || "confirmed",
    };

    let { error } = await supabase.from("appointments").insert(payload);
    // Graceful fallback if patient_age / patient_gender columns are not yet added to Supabase table
    if (error && (error.message?.includes("patient_age") || error.message?.includes("patient_gender") || error.code === "PGRST204")) {
      delete payload.patient_age;
      delete payload.patient_gender;
      const retry = await supabase.from("appointments").insert(payload);
      error = retry.error;
    }
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("createLiveAppointment error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Real-time slot conflict detection:
 * Fetches already booked slots for a doctor on a specific date.
 */
export async function fetchBookedSlots(doctorId: string, date: string, doctorName?: string): Promise<string[]> {
  if (typeof window !== "undefined") {
    try {
      const url = new URL("/api/appointments/booked-slots", window.location.origin);
      url.searchParams.set("doctorId", doctorId);
      url.searchParams.set("date", date);
      if (doctorName) url.searchParams.set("doctorName", doctorName);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.bookedSlots)) {
          return json.bookedSlots;
        }
      }
    } catch (err) {
      console.warn("fetchBookedSlots API error:", err);
    }
  }

  return [];
}

/**
 * Fetch doctor blocked dates (leaves, holidays)
 */
export async function fetchDoctorBlockedDates(doctorId?: string): Promise<any[]> {
  if (!isSupabaseConfigured) return [];

  try {
    let query = supabase.from("doctor_blocked_dates").select("*");
    if (doctorId) {
      query = query.or(`doctor_id.eq.${doctorId},doctor_id.eq.all`);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Add a doctor blocked date
 */
export async function addDoctorBlockedDate(item: {
  doctor_id: string;
  blocked_date: string;
  reason?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const newRecord = {
    id: `blk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    doctor_id: item.doctor_id,
    blocked_date: item.blocked_date,
    reason: item.reason || "Doctor Leave / Clinic Holiday",
    created_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "insert", table: "doctor_blocked_dates", payload: newRecord }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to add blocked date");
      return { success: true, data: json.data || newRecord };
    } catch (err: any) {
      console.warn("addDoctorBlockedDate error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true, data: newRecord };
}

/**
 * Remove a doctor blocked date
 */
export async function removeDoctorBlockedDate(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "doctor_blocked_dates", id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to remove blocked date");
      return { success: true };
    } catch (err: any) {
      console.warn("removeDoctorBlockedDate error:", err);
      return { success: false, error: err.message };
    }
  }

  return { success: true };
}

/**
 * Patient tracking: Search appointment by reference code or phone number
 */
export async function fetchAppointmentsByQuery(query: string): Promise<any[]> {
  const q = query.trim();
  if (!q) return [];

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/appointments/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.records)) {
        return data.records;
      }
    } catch (e) {
      console.warn("fetchAppointmentsByQuery API error:", e);
    }
  }

  return [];
}

// ==============================================================================
// 4. CLINIC SETTINGS API
// ==============================================================================

export async function fetchLiveClinicSettings(): Promise<ClinicSettings> {
  let cached: ClinicSettings | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_clinic_settings");
      if (stored) cached = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return cached || CLINIC_SETTINGS;

  try {
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return cached || CLINIC_SETTINGS;

    const merged: ClinicSettings = {
      ...CLINIC_SETTINGS,
      name: data.name ?? cached?.name ?? CLINIC_SETTINGS.name,
      email: data.email ?? cached?.email ?? CLINIC_SETTINGS.email,
      phoneNumbers:
        Array.isArray(data.phone_numbers) && data.phone_numbers.length > 0
          ? data.phone_numbers
          : cached?.phoneNumbers && cached.phoneNumbers.length > 0
          ? cached.phoneNumbers
          : CLINIC_SETTINGS.phoneNumbers,
      emergencyPhone: data.emergency_phone ?? cached?.emergencyPhone ?? CLINIC_SETTINGS.emergencyPhone,
      workingHours: data.working_hours ?? cached?.workingHours ?? CLINIC_SETTINGS.workingHours,
      address: {
        en: data.address_en ?? cached?.address?.en ?? CLINIC_SETTINGS.address.en,
        bn: data.address_bn ?? cached?.address?.bn ?? CLINIC_SETTINGS.address.bn,
      },
      isAddressPlaceholder: data.is_address_placeholder ?? cached?.isAddressPlaceholder ?? false,
      googleMapUrl: data.google_map_url ?? cached?.googleMapUrl ?? CLINIC_SETTINGS.googleMapUrl,
      googleReviewUrl: data.google_review_url ?? cached?.googleReviewUrl ?? CLINIC_SETTINGS.googleReviewUrl,
      socialLinks: data.social_links ?? cached?.socialLinks ?? CLINIC_SETTINGS.socialLinks,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kgh_live_clinic_settings", JSON.stringify(merged));
      } catch {
        // ignore
      }
    }

    return merged;
  } catch (err) {
    console.error("fetchLiveClinicSettings error:", err);
    return cached || CLINIC_SETTINGS;
  }
}

export async function saveLiveClinicSettings(settings: ClinicSettings): Promise<{ success: boolean; error?: string }> {
  const cleanedPhoneNumbers = (settings.phoneNumbers || [])
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const finalPhoneNumbers = cleanedPhoneNumbers.length > 0 ? cleanedPhoneNumbers : [settings.emergencyPhone || "+880 1700-000000"];

  const sanitizedSettings: ClinicSettings = {
    ...settings,
    phoneNumbers: finalPhoneNumbers,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("kgh_live_clinic_settings", JSON.stringify(sanitizedSettings));
      // Dispatch custom event for instant cross-component sync on same page & storage event for cross-tabs
      window.dispatchEvent(new CustomEvent("kgh_settings_updated", { detail: sanitizedSettings }));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      id: 1,
      name: sanitizedSettings.name || "KGH Dental",
      email: sanitizedSettings.email || "care@kghdental.com",
      phone_numbers: sanitizedSettings.phoneNumbers,
      emergency_phone: sanitizedSettings.emergencyPhone,
      working_hours: sanitizedSettings.workingHours,
      address_en: sanitizedSettings.address.en,
      address_bn: sanitizedSettings.address.bn,
      is_address_placeholder: sanitizedSettings.isAddressPlaceholder,
      google_map_url: sanitizedSettings.googleMapUrl,
      google_review_url: sanitizedSettings.googleReviewUrl,
      social_links: sanitizedSettings.socialLinks,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upsert", table: "clinic_settings", payload, onConflict: "id" }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Failed to save clinic settings");
      return { success: true };
    }

    const { error } = await supabase.from("clinic_settings").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert warning for clinic_settings:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveClinicSettings error:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 5. GALLERY API
// ==============================================================================

export const INITIAL_GALLERY: GalleryItem[] = [];

export async function fetchLiveGalleryItems(): Promise<GalleryItem[]> {
  // 1. Prioritize live Supabase database
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const items = data.map((d: any) => ({
          id: d.id,
          title: { en: d.title_en, bn: d.title_bn },
          category: d.category,
          desc: { en: d.desc_en || "", bn: d.desc_bn || "" },
          imageUrl: d.image_url,
          sortOrder: d.sort_order,
        }));

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("kgh_gallery_items", JSON.stringify(items));
          } catch (e) {
            // ignore
          }
        }

        return items;
      }
    } catch (err) {
      console.error("fetchLiveGalleryItems error:", err);
    }
  }

  // 2. Client-side storage fallback only if Supabase is offline/unreachable
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_gallery_items");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Filter out any stale dummy demo items
          return parsed.filter(
            (i: any) =>
              !i.id?.startsWith("gal-clinic-") &&
              !i.id?.startsWith("gal-case-") &&
              !i.id?.startsWith("gal-team-") &&
              !i.id?.startsWith("gal-chamber-")
          );
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return [];
}

export async function saveLiveGalleryItem(item: GalleryItem): Promise<{ success: boolean; data?: any; error?: string }> {
  // Update client cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_gallery_items");
      let list: GalleryItem[] = cached ? JSON.parse(cached) : [];
      list = list.filter(
        (i) =>
          !i.id?.startsWith("gal-clinic-") &&
          !i.id?.startsWith("gal-case-") &&
          !i.id?.startsWith("gal-team-") &&
          !i.id?.startsWith("gal-chamber-")
      );
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list = [item, ...list];
      }
      localStorage.setItem("kgh_gallery_items", JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      title_en: item.title.en,
      title_bn: item.title.bn,
      category: item.category,
      desc_en: item.desc.en,
      desc_bn: item.desc.bn,
      image_url: item.imageUrl,
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);

    if (isUuid) {
      const { data, error } = await supabase
        .from("gallery_items")
        .upsert({ id: item.id, ...payload })
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from("gallery_items")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.error("saveLiveGalleryItem error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteLiveGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_gallery_items");
      let list: GalleryItem[] = cached ? JSON.parse(cached) : [];
      list = list.filter((i) => i.id !== id);
      localStorage.setItem("kgh_gallery_items", JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveGalleryItem error:", err);
    return { success: false, error: err.message };
  }
}

// ==============================================================================
// 5.1 BEFORE & AFTER API
// ==============================================================================

export const INITIAL_BEFORE_AFTER: BeforeAfterItem[] = [];

export async function fetchLiveBeforeAfterItems(): Promise<BeforeAfterItem[]> {
  // 1. Prioritize live Supabase database
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("before_after_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        const items: BeforeAfterItem[] = data.map((d: any) => ({
          id: d.id,
          title: { en: d.title_en, bn: d.title_bn },
          category: d.category || "General",
          beforeImageUrl: d.before_image_url,
          afterImageUrl: d.after_image_url,
          desc: { en: d.desc_en || "", bn: d.desc_bn || "" },
          sortOrder: d.sort_order || 0,
        }));

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("kgh_before_after_items", JSON.stringify(items));
          } catch (e) {
            // ignore
          }
        }

        return items;
      }
    } catch (err) {
      console.error("fetchLiveBeforeAfterItems error:", err);
    }
  }

  // 2. Client-side storage fallback only if Supabase is offline/unreachable
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_before_after_items");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed.filter((i: any) => !i.id?.startsWith("ba-"));
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return [];
}

export async function saveLiveBeforeAfterItem(
  item: BeforeAfterItem
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Update client cache
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_before_after_items");
      let list: BeforeAfterItem[] = cached ? JSON.parse(cached) : [];
      list = list.filter((i) => !i.id?.startsWith("ba-"));
      const idx = list.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list = [...list, item];
      }
      localStorage.setItem("kgh_before_after_items", JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      title_en: item.title.en,
      title_bn: item.title.bn,
      category: item.category,
      before_image_url: item.beforeImageUrl,
      after_image_url: item.afterImageUrl,
      desc_en: item.desc?.en || null,
      desc_bn: item.desc?.bn || null,
      sort_order: item.sortOrder ?? 0,
    };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);

    if (isUuid) {
      const { data, error } = await supabase
        .from("before_after_items")
        .upsert({ id: item.id, ...payload })
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from("before_after_items")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.error("saveLiveBeforeAfterItem error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteLiveBeforeAfterItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_before_after_items");
      let list: BeforeAfterItem[] = cached ? JSON.parse(cached) : [];
      list = list.filter((i) => i.id !== id);
      localStorage.setItem("kgh_before_after_items", JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase
      .from("before_after_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveBeforeAfterItem error:", err);
    return { success: false, error: err.message };
  }
}


// ==============================================================================
// 6. REVIEWS API
// ==============================================================================

export async function fetchLiveReviews(): Promise<GoogleReview[]> {
  let cached: GoogleReview[] | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_reviews");
      if (stored) cached = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) {
    return cached && cached.length > 0 ? cached : REVIEWS;
  }

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return cached && cached.length > 0 ? cached : REVIEWS;
    }

    const liveReviews: GoogleReview[] = data.map((d: any) => ({
      id: d.id,
      authorName: d.author_name,
      rating: d.rating || 5,
      date: d.date || "1 month ago",
      comment: {
        en: d.comment_en,
        bn: d.comment_bn,
      },
      treatment: d.treatment_en
        ? {
            en: d.treatment_en,
            bn: d.treatment_bn || d.treatment_en,
          }
        : undefined,
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kgh_live_reviews", JSON.stringify(liveReviews));
      } catch {
        // ignore
      }
    }

    return liveReviews;
  } catch (err) {
    console.error("fetchLiveReviews error:", err);
    return cached && cached.length > 0 ? cached : REVIEWS;
  }
}

export async function saveLiveReview(review: GoogleReview): Promise<{ success: boolean; error?: string }> {
  // Sync immediately to local storage cache
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_reviews");
      const currentList: GoogleReview[] = stored ? JSON.parse(stored) : [...REVIEWS];
      const index = currentList.findIndex((r) => r.id === review.id);
      if (index >= 0) {
        currentList[index] = review;
      } else {
        currentList.unshift(review);
      }
      localStorage.setItem("kgh_live_reviews", JSON.stringify(currentList));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      id: review.id,
      author_name: review.authorName,
      rating: review.rating,
      date: review.date,
      comment_en: review.comment.en,
      comment_bn: review.comment.bn,
      treatment_en: review.treatment?.en || null,
      treatment_bn: review.treatment?.bn || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("reviews").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert warning for reviews:", error.message);
    }
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveReview error:", err);
    return { success: true };
  }
}

export async function deleteLiveReview(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_reviews");
      const currentList: GoogleReview[] = stored ? JSON.parse(stored) : [...REVIEWS];
      const filtered = currentList.filter((r) => r.id !== id);
      localStorage.setItem("kgh_live_reviews", JSON.stringify(filtered));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete warning for reviews:", error.message);
    }
    return { success: true };
  } catch (err: any) {
    console.error("deleteLiveReview error:", err);
    return { success: true };
  }
}

// ==============================================================================
// 7. HOMEPAGE WHY CHOOSE US CARDS API
// ==============================================================================

export const DEFAULT_WHY_CHOOSE_CARDS: WhyChooseCard[] = [
  {
    id: "specialists",
    stepNumber: "01",
    badge: { en: "Specialist Board", bn: "বিশেষজ্ঞ প্যানেল" },
    title: { en: "Specialist-Led Care", bn: "বিশেষজ্ঞদের হাতে চিকিৎসা" },
    subtitle: {
      en: "Every department is led by a doctor trained specifically in that field — not a single general dentist trying to do everything.",
      bn: "প্রতিটা বিভাগ পরিচালনা করেন সেই নির্দিষ্ট বিষয়ে প্রশিক্ষিত ডাক্তার — একজন জেনারেল ডেন্টিস্ট দিয়ে সবকিছু করানো নয়।",
    },
    bullets: [
      { en: "FCPS & Masters Certified Surgeons", bn: "এফসিপিএস ও স্নাতকোত্তর ডিগ্রিধারী সার্জন" },
      { en: "Dedicated Department Heads", bn: "নির্দিষ্ট বিভাগের স্বতন্ত্র প্রধান" },
      { en: "Zero Generalist Guesswork", bn: "অনুমাননির্ভর চিকিৎসার সুযোগ নেই" },
    ],
    tags: [
      { en: "Orthodontics", bn: "অর্থোডন্টিক্স" },
      { en: "Oral Surgery", bn: "ওরাল সার্জারি" },
      { en: "Endodontics", bn: "এন্ডোডন্টিক্স" },
      { en: "Prosthodontics", bn: "প্রস্থোডন্টিক্স" },
    ],
    image: "/images/why-choose-us/specialist-care.jpg",
    accent: "#474B4E",
    protocolTitle: { en: "Specialist-Led Clinical Protocol", bn: "বিশেষজ্ঞ পরিচালিত চিকিৎসা প্রোটোকল" },
    protocolSubtitle: {
      en: "Every dental department at KGH is led exclusively by qualified specialist surgeons (FCPS, MS, PhD) who focus 100% on their specialized discipline.",
      bn: "কেজিএইচ ডেন্টালের প্রতিটি বিভাগ সরাসরি উচ্চশিক্ষিত ও সার্টিফায়েড বিশেষজ্ঞ চিকিৎসকদের (FCPS, MS, PhD) তত্ত্বাবধানে পরিচালিত হয়।",
    },
    protocolSteps: [
      {
        number: "01",
        title: { en: "Primary Specialty Assessment", bn: "প্রাথমিক বিভাগীয় মূল্যায়ন" },
        detail: { en: "Diagnostic imaging and focused examination by a certified department consultant.", bn: "বিভাগীয় বিশেষজ্ঞ কনসালটেন্ট কর্তৃক ডিজিটাল প্রতিচ্ছবি ও গভীর পরীক্ষা।" },
      },
      {
        number: "02",
        title: { en: "Inter-Disciplinary Board Review", bn: "সম্মিলিত মেডিকেল বোর্ড রিভিউ" },
        detail: { en: "Multi-specialist consensus on complex aligner, surgical, or implant therapies.", bn: "জটিল সার্জারি বা অ্যালাইনার চিকিৎসায় যৌথ মেডিকেল বোর্ডের সমন্বিত মতামত।" },
      },
      {
        number: "03",
        title: { en: "Precision Surgical Execution", bn: "নির্ভুল বিশেষজ্ঞ চিকিৎসা সম্পাদন" },
        detail: { en: "Implementation following global clinical guidelines and microscopic accuracy.", bn: "আন্তর্জাতিক মানদণ্ড এবং আধুনিক মাইক্রোস্কোপিক নির্ভুলতায় চিকিৎসা।" },
      },
    ],
    protocolGuarantees: [
      { en: "100% Specialist-Led Diagnosis — No Generalist Guesswork", bn: "১০০% বিশেষজ্ঞ চিকিৎসকের পরামর্শ — কোনো অনুমাননির্ভর চিকিৎসা নয়" },
    ],
  },
  {
    id: "chamber",
    stepNumber: "02",
    badge: { en: "Hospital Grade", bn: "হাসপাতাল মান" },
    title: { en: "Modern, Comfortable Chamber", bn: "আধুনিক ও আরামদায়ক চেম্বার" },
    subtitle: {
      en: "A clean, calm space designed around patient comfort, from your first visit to your last follow-up.",
      bn: "প্রথম ভিজিট থেকে শেষ ফলো-আপ পর্যন্ত, রোগীর স্বাচ্ছন্দ্যের কথা মাথায় রেখে সাজানো একটা পরিচ্ছন্ন, শান্ত পরিবেশ।",
    },
    bullets: [
      { en: "Ergonomic Memory-Foam Dental Chairs", bn: "আরামদায়ক মেমোরি-ফোম চেয়ার" },
      { en: "Class-B European Autoclave Sterilization", bn: "ক্লাস-বি অটোক্লেভ স্টেরিলাইজেশন" },
      { en: "Soothing Acoustic & Ambient Lighting", bn: "শান্ত ও আরামদায়ক পরিবেশ" },
    ],
    tags: [
      { en: "Class-B 134°C", bn: "ক্লাস-বি ১৩৪° সে." },
      { en: "Zero Cross-Infection", bn: "জীবাণুমুক্ত নিশ্চয়তা" },
      { en: "Calm Atmosphere", bn: "শান্ত পরিবেশ" },
    ],
    image: "/images/why-choose-us/modern-chamber.jpg",
    accent: "#474B4E",
    protocolTitle: { en: "European Sterilization & Chamber Protocol", bn: "ইউরোপীয় স্টেরিলাইজেশন ও চেম্বার প্রোটোকল" },
    protocolSubtitle: {
      en: "We designed our clinic from the ground up to replace medical anxiety with absolute calm, hygiene, and hospital-grade sterilization.",
      bn: "রোগীর ভয় ও অস্বস্তি দূর করে একটি শান্ত, মনোরম ও আন্তর্জাতিক মানের স্বাস্থ্যকর পরিবেশ নিশ্চিত করতে আমাদের চেম্বারটি সাজানো।",
    },
    protocolSteps: [
      {
        number: "01",
        title: { en: "Class-B Vacuum Decontamination", bn: "ক্লাস-বি ভ্যাকুয়াম জীবাণুমুক্তকরণ" },
        detail: { en: "134°C steam under pressure guarantees 100% viral and bacterial eradication.", bn: "১৩৪° সেলসিয়াস তাপমাত্রায় উচ্চ চাপে প্রতিটি যন্ত্রের শতভাগ জীবাণুমুক্তকরণ।" },
      },
      {
        number: "02",
        title: { en: "Sealed Barrier Pouches", bn: "সিল করা জীবাণুমুক্ত প্যাকেট" },
        detail: { en: "Instruments are opened exclusively in front of each individual patient.", bn: "প্রতিটি রোগীর চোখের সামনেই সিল করা নতুন জীবাণুমুক্ত প্যাকেট খোলা হয়।" },
      },
      {
        number: "03",
        title: { en: "Operatory Surface Disinfection", bn: "চেয়ার ও মেঝের বায়ো-ডিসইনফেকশন" },
        detail: { en: "Medical-grade hospital wipes applied after every single appointment.", bn: "প্রতিটি রোগীর পরপরই সম্পূর্ণ চেয়ার ও যন্ত্রপাতি স্প্রে দ্বারা ডিসইনফেক্ট করা হয়।" },
      },
    ],
    protocolGuarantees: [
      { en: "Strict European Class-B Sterilization Protocol for Every Patient", bn: "প্রতিটি রোগীর জন্য কঠোর ইউরোপীয় ক্লাস-বি স্টেরিলাইজেশন প্রোটোকল" },
    ],
  },
  {
    id: "plans",
    stepNumber: "03",
    badge: { en: "Clear & Honest", bn: "স্বচ্ছ ও নির্ভরযোগ্য" },
    title: { en: "Transparent Treatment Plans", bn: "স্পষ্ট চিকিৎসা পরিকল্পনা" },
    subtitle: {
      en: "We explain why a treatment is needed, when it's needed, and what to expect — before any decision is made.",
      bn: "কোনো সিদ্ধান্ত নেওয়ার আগেই আমরা বুঝিয়ে বলি কেন এই চিকিৎসা দরকার, কখন দরকার, আর তাতে কী উপকার পাবেন।",
    },
    bullets: [
      { en: "HD Intraoral Digital Camera Screening", bn: "এইচডি ইন্ট্রাওরাল স্ক্রিনিং" },
      { en: "Itemized Cost Breakdown — Zero Hidden Bills", bn: "অগ্রিম খরচের স্বচ্ছ বিবরণ" },
      { en: "Clear Step-by-Step Clinical Roadmap", bn: "ধাপভিত্তিক স্পষ্ট পরিকল্পনা" },
    ],
    tags: [
      { en: "Written Estimate", bn: "লিখিত খরচের বিবরণ" },
      { en: "HD Live Screen", bn: "লাইভ এইচডি স্ক্রিন" },
      { en: "No Hidden Costs", bn: "কোনো গোপন খরচ নেই" },
    ],
    image: "/images/why-choose-us/transparent-plans-hd.jpeg",
    accent: "#474B4E",
    protocolTitle: { en: "Clinical Transparency & Cost Protocol", bn: "চিকিৎসা ও খরচের স্বচ্ছতা প্রোটোকল" },
    protocolSubtitle: {
      en: "We believe healthcare should have complete clarity. We show you the exact clinical condition and transparent costs before touching a tooth.",
      bn: "আমরা বিশ্বাস করি চিকিৎসার প্রতিটি ধাপে স্বচ্ছতা জরুরি। চিকিৎসা শুরুর আগেই দাঁতের প্রকৃত অবস্থা ও খরচের স্পষ্ট ধারণা দেওয়া হয়।",
    },
    protocolSteps: [
      {
        number: "01",
        title: { en: "Live Intraoral Camera Display", bn: "লাইভ ইন্ট্রাওরাল ক্যামেরা ডিসপ্লে" },
        detail: { en: "High-definition visuals on the chairside monitor so you see what the doctor sees.", bn: "চেয়ারের সামনে এইচডি মনিটরে সরাসরি দাঁতের প্রকৃত সমস্যা রোগীকে দেখানো।" },
      },
      {
        number: "02",
        title: { en: "Comprehensive Treatment Roadmap", bn: "ধাপভিত্তিক পূর্ণাঙ্গ পরিকল্পনা" },
        detail: { en: "Clear explanation of stages, expected recovery duration, and milestone visits.", bn: "চিকিৎসার প্রয়োজনীয় ধাপ, সময়কাল ও পরবর্তী চেকআপের স্পষ্ট ধারণা।" },
      },
      {
        number: "03",
        title: { en: "Fixed Itemized Cost Estimate", bn: "নির্ধারিত খরচের লিখিত তালিকা" },
        detail: { en: "Transparent billing with zero surprise add-ons or sudden charges.", bn: "চিকিৎসা শুরুর পূর্বেই লিখিত খরচের বিবরণ — কোনো বাড়তি গোপন চার্জ নেই।" },
      },
    ],
    protocolGuarantees: [
      { en: "Full Cost & Clinical Transparency — Zero Hidden Charges", bn: "চিকিৎসা ও খরচে ১০০% স্বচ্ছতা — কোনো গোপন চার্জ নেই" },
    ],
  },
  {
    id: "booking",
    stepNumber: "04",
    badge: { en: "Instant & Smooth", bn: "সহজ ও দ্রুত" },
    title: { en: "Easy Appointment Booking", bn: "সহজ অ্যাপয়েন্টমেন্ট বুকিং" },
    subtitle: {
      en: "Pick your doctor, pick your time — book online in a few taps, no phone tag or long waiting lines.",
      bn: "নিজের পছন্দের ডাক্তার আর সময় বেছে নিন — কয়েকটা ক্লিকেই বুকিং, বারবার ফোন করার ঝামেলা নেই।",
    },
    bullets: [
      { en: "Select Specialist & Preferred Day in < 2 Mins", bn: "ডাক্তার ও সুবিধাজনক দিন পছন্দ" },
      { en: "Instant WhatsApp & SMS Confirmation", bn: "তাৎক্ষণিক হোয়াটসঅ্যাপ নিশ্চিতকরণ" },
      { en: "Dedicated Clinic Care Coordinator Support", bn: "ডেডিকেটেড কেয়ার কোঅর্ডিনেটর" },
    ],
    tags: [
      { en: "2-Min Booking", bn: "২ মিনিটে বুকিং" },
      { en: "WhatsApp Updates", bn: "হোয়াটসঅ্যাপ আপডেট" },
      { en: "Min Waiting", bn: "অপেক্ষাহীন সেবা" },
    ],
    image: "/images/why-choose-us/easy-booking.jpg",
    accent: "#474B4E",
    protocolTitle: { en: "Smart Scheduling & Waiting Protocol", bn: "স্মার্ট শিডিউলিং ও সিরিয়াল প্রোটোকল" },
    protocolSubtitle: {
      en: "No endless phone calls or crowded waiting rooms. Our digital booking system respects your busy schedule with precision time slots.",
      bn: "বারবার ফোন করার ঝামেলা কিংবা চেম্বারে বসে ঘণ্টার পর ঘণ্টা অপেক্ষা করার দিন শেষ। ডিজিটাল পদ্ধতিতে দ্রুততম সময়ে সিরিয়াল নিন।",
    },
    protocolSteps: [
      {
        number: "01",
        title: { en: "Online Booking in 3 Easy Steps", bn: "৩টি সহজ ধাপে অনলাইন বুকিং" },
        detail: { en: "Choose department, preferred doctor, and available time slot in under 2 minutes.", bn: "বিভাগ, কাঙ্ক্ষিত ডাক্তার ও সুবিধাজনক সময় বেছে নিয়ে দ্রুত সিরিয়াল নিশ্চিতকরণ।" },
      },
      {
        number: "02",
        title: { en: "Instant WhatsApp Confirmation", bn: "তাৎক্ষণিক হোয়াটসঅ্যাপ নোটিফিকেশন" },
        detail: { en: "Receive reference code, appointment time, and direct Google Maps location pin.", bn: "সিরিয়াল রেফারেন্স কোড, সময় ও গুগল ম্যাপ লোকেশন সরাসরি মেসেজে প্রাপ্তি।" },
      },
      {
        number: "03",
        title: { en: "Zero-Wait Queue Management", bn: "যথাসময়ে সিরিয়াল প্রদান" },
        detail: { en: "Our front desk prepares all sterile setup in advance to minimize waiting time.", bn: "রোগীর পৌঁছানোর পূর্বেই চেম্বার প্রস্তুতি সম্পন্ন করে অপেক্ষার সময় কমিয়ে আনা।" },
      },
    ],
    protocolGuarantees: [
      { en: "Guaranteed Dedicated Time Slot — Minimized Waiting Time", bn: "নির্দিষ্ট সময়ে সিরিয়াল কনফার্মেশন — দীর্ঘ অপেক্ষার অবসান" },
    ],
  },
];

export async function fetchLiveWhyChooseCards(): Promise<WhyChooseCard[]> {
  let cached: WhyChooseCard[] | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_why_choose_cards");
      if (stored) cached = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) {
    return cached && cached.length > 0 ? cached : DEFAULT_WHY_CHOOSE_CARDS;
  }

  try {
    const { data, error } = await supabase
      .from("why_choose_cards")
      .select("*")
      .order("step_number", { ascending: true });

    if (error || !data || data.length === 0) {
      return cached && cached.length > 0 ? cached : DEFAULT_WHY_CHOOSE_CARDS;
    }

    const liveCards: WhyChooseCard[] = data.map((d: any) => ({
      id: d.id,
      stepNumber: d.step_number,
      badge: { en: d.badge_en, bn: d.badge_bn },
      title: { en: d.title_en, bn: d.title_bn },
      subtitle: { en: d.subtitle_en, bn: d.subtitle_bn },
      bullets: d.bullets || [],
      tags: d.tags || [],
      image: d.image || "/images/why-choose-us/specialist-care.jpg",
      accent: d.accent || "#474B4E",
      protocolTitle: { en: d.protocol_title_en, bn: d.protocol_title_bn },
      protocolSubtitle: { en: d.protocol_subtitle_en, bn: d.protocol_subtitle_bn },
      protocolSteps: d.protocol_steps || [],
      protocolGuarantees: d.protocol_guarantees || [],
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kgh_live_why_choose_cards", JSON.stringify(liveCards));
      } catch {
        // ignore
      }
    }

    return liveCards;
  } catch (err) {
    console.error("fetchLiveWhyChooseCards error:", err);
    return cached && cached.length > 0 ? cached : DEFAULT_WHY_CHOOSE_CARDS;
  }
}

export async function saveLiveWhyChooseCards(cards: WhyChooseCard[]): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("kgh_live_why_choose_cards", JSON.stringify(cards));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = cards.map((c) => ({
      id: c.id,
      step_number: c.stepNumber,
      badge_en: c.badge.en,
      badge_bn: c.badge.bn,
      title_en: c.title.en,
      title_bn: c.title.bn,
      subtitle_en: c.subtitle.en,
      subtitle_bn: c.subtitle.bn,
      bullets: c.bullets,
      tags: c.tags,
      image: c.image,
      accent: c.accent,
      protocol_title_en: c.protocolTitle.en,
      protocol_title_bn: c.protocolTitle.bn,
      protocol_subtitle_en: c.protocolSubtitle.en,
      protocol_subtitle_bn: c.protocolSubtitle.bn,
      protocol_steps: c.protocolSteps,
      protocol_guarantees: c.protocolGuarantees,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("why_choose_cards").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsert warning for why_choose_cards:", error.message);
    }
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveWhyChooseCards error:", err);
    return { success: true };
  }
}

// ==============================================================================
// 8. HOMEPAGE CLINICAL CREED API
// ==============================================================================

export const DEFAULT_CLINICAL_CREED_QUOTES: CreedQuoteItem[] = [
  {
    id: "quote-1",
    highlight: {
      en: "Transforming how you live and smile.",
      bn: "আপনার জীবন ও হাসিতে নতুন আত্মবিশ্বাস।",
    },
    quote: {
      en: "A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn't just about fixing teeth, it's about transforming how you live.",
      bn: "একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।",
    },
    author: {
      en: "Clinical Advisory Council",
      bn: "ক্লিনিক্যাল অ্যাডভাইজরি কাউন্সিল",
    },
    role: {
      en: "KGH Dental Multi-Specialty Chamber",
      bn: "কেজিএইচ ডেন্টাল মাল্টি-স্পেশালিটি চেম্বার",
    },
    image: "/images/philosophy/slide-1-xray-diagnosis.jpg",
  },
  {
    id: "quote-2",
    highlight: {
      en: "Complete transparency before any decision.",
      bn: "কোনো সিদ্ধান্তের আগেই সম্পূর্ণ স্বচ্ছতা।",
    },
    quote: {
      en: "Zero guesswork, zero rushed decisions. From digital low-radiation imaging to high-magnification diagnosis, every patient sees what we see before any procedure begins.",
      bn: "কোনো অনুমান নয়, তাড়াহুড়ো করে নেওয়া সিদ্ধান্ত নয়। ডিজিটাল লো-রেডিয়েশন এক্স-রে এবং স্পষ্ট স্ক্রিনিংয়ের মাধ্যমে রোগীকে আগে তার সমস্যাটি বোঝানো হয়, তারপর চিকিৎসা শুরু হয়।",
    },
    author: {
      en: "Board of Department Leads",
      bn: "বিভাগীয় প্রধান চিকিৎসক পরিষদ",
    },
    role: {
      en: "Precision Diagnostics & Clinical Governance",
      bn: "প্রেসিশন ডায়াগনস্টিকস ও ক্লিনিক্যাল গভর্ন্যান্স",
    },
    image: "/images/philosophy/slide-2-shade-guide-smile.jpg",
  },
  {
    id: "quote-3",
    highlight: {
      en: "Eight specialist fields under one unified roof.",
      bn: "এক ছাদের নিচে আটটি বিশেষায়িত বিভাগ।",
    },
    quote: {
      en: "Every smile has unique anatomy. By bringing eight distinct surgical and clinical sub-disciplines under one unified roof, we ensure you receive the exact specialist your teeth deserve.",
      bn: "প্রতিটি দাঁত ও হাসির গঠন সম্পূর্ণ আলাদা। আধুনিক ডেন্টিস্ট্রির আটটি ভিন্ন বিশেষায়িত বিভাগকে এক ছাদের নিচে এনে আমরা নিশ্চিত করি যে আপনি কেবল সঠিক বিশেষজ্ঞের হাতেই সেবা পাচ্ছেন।",
    },
    author: {
      en: "Consultant Dental Surgeons",
      bn: "কনসালটেন্ট ডেন্টাল সার্জনবৃন্দ",
    },
    role: {
      en: "Specialist Care Collaborative",
      bn: "বিশেষজ্ঞ সমন্বিত চিকিৎসা দল",
    },
    image: "/images/philosophy/slide-3-orthodontic-braces.jpg",
  },
];

export const DEFAULT_CLINICAL_CREED: ClinicalCreedData = {
  tag: {
    en: "OUR CLINICAL CREED",
    bn: "আমাদের চিকিৎসা দর্শন",
  },
  quote: {
    en: "A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn't just about fixing teeth, it's about transforming how you live.",
    bn: "একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।",
  },
  subQuote: {
    en: "Transforming how you live and smile.",
    bn: "আপনার জীবন ও হাসিতে নতুন আত্মবিশ্বাস।",
  },
  authority: {
    en: "Clinical Advisory Council",
    bn: "ক্লিনিক্যাল অ্যাডভাইজরি কাউন্সিল",
  },
  designation: {
    en: "KGH Dental Multi-Specialty Chamber",
    bn: "কেজিএইচ ডেন্টাল মাল্টি-স্পেশালিটি চেম্বার",
  },
  stats: [
    {
      value: { en: "100%", bn: "১০০%" },
      label: { en: "Sterilization Standard", bn: "জীবাণুমুক্তকরণ মানদণ্ড" },
    },
    {
      value: { en: "15+", bn: "১৫+" },
      label: { en: "Years Combined Board Mastery", bn: "সম্মিলিত বোর্ড অভিজ্ঞতা" },
    },
    {
      value: { en: "Zero", bn: "জিরো" },
      label: { en: "Unscheduled Waiting Delay", bn: "অতিরিক্ত অপেক্ষাহীন সেবা" },
    },
  ],
  quotes: DEFAULT_CLINICAL_CREED_QUOTES,
};

export async function fetchLiveClinicalCreed(): Promise<ClinicalCreedData> {
  let cached: ClinicalCreedData | null = null;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("kgh_live_clinical_creed");
      if (stored) cached = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) {
    return cached || DEFAULT_CLINICAL_CREED;
  }

  try {
    const { data, error } = await supabase
      .from("clinical_creed")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) {
      return cached || DEFAULT_CLINICAL_CREED;
    }

    const liveCreed: ClinicalCreedData = {
      tag: { en: data.tag_en, bn: data.tag_bn },
      quote: { en: data.quote_en, bn: data.quote_bn },
      subQuote: { en: data.sub_quote_en, bn: data.sub_quote_bn },
      authority: { en: data.authority_en, bn: data.authority_bn },
      designation: { en: data.designation_en, bn: data.designation_bn },
      stats: data.stats || DEFAULT_CLINICAL_CREED.stats,
      quotes: data.quotes || cached?.quotes || DEFAULT_CLINICAL_CREED.quotes,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kgh_live_clinical_creed", JSON.stringify(liveCreed));
      } catch {
        // ignore
      }
    }

    return liveCreed;
  } catch (err) {
    console.error("fetchLiveClinicalCreed error:", err);
    return cached || DEFAULT_CLINICAL_CREED;
  }
}

export async function saveLiveClinicalCreed(creed: ClinicalCreedData): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("kgh_live_clinical_creed", JSON.stringify(creed));
    } catch {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const primaryQuote = creed.quotes?.[0];
    const payload: any = {
      id: 1,
      tag_en: creed.tag.en,
      tag_bn: creed.tag.bn,
      quote_en: primaryQuote?.quote.en || creed.quote.en,
      quote_bn: primaryQuote?.quote.bn || creed.quote.bn,
      sub_quote_en: primaryQuote?.highlight.en || creed.subQuote.en,
      sub_quote_bn: primaryQuote?.highlight.bn || creed.subQuote.bn,
      authority_en: primaryQuote?.author.en || creed.authority.en,
      authority_bn: primaryQuote?.author.bn || creed.authority.bn,
      designation_en: primaryQuote?.role.en || creed.designation.en,
      designation_bn: primaryQuote?.role.bn || creed.designation.bn,
      stats: creed.stats,
      updated_at: new Date().toISOString(),
    };

    if (creed.quotes && creed.quotes.length > 0) {
      payload.quotes = creed.quotes;
    }

    let { error } = await supabase.from("clinical_creed").upsert(payload, { onConflict: "id" });
    if (error && error.message?.includes("quotes")) {
      delete payload.quotes;
      const res = await supabase.from("clinical_creed").upsert(payload, { onConflict: "id" });
      error = res.error;
    }
    if (error) {
      console.warn("Supabase upsert warning for clinical_creed:", error.message);
    }
    return { success: true };
  } catch (err: any) {
    console.error("saveLiveClinicalCreed error:", err);
    return { success: true };
  }
}

// ==============================================================================
// 10. BLOG POSTS API (With Rich Text & Media Support)
// ==============================================================================

export const ENRICHED_BLOG_POSTS: BlogPost[] = BLOG_POSTS.map((post, idx) => {
  const covers = [
    "/images/sub_services/3. 1. Root Canal Treatment.png",
    "/images/sub_services/1. B. Clear Aligners.png",
    "/images/sub_services/2.2. Impacted Wisdom Tooth.png",
    "/images/sub_services/4. 1. Dental Crowns.png",
    "/images/sub_services/5.8. Child Dental Check-up & Preventive Counselling.png",
    "/images/sub_services/6. 3. Gum Disease.png",
    "/images/sub_services/3. 9. Toothe whitening.png",
    "/images/sub_services/1. c. Smile Design.png",
    "/images/sub_services/6. 8. Bad Breath (Halitosis) Management.png",
    "/images/sub_services/8. 5. Emergency Dental Care.png",
  ];

  return {
    ...post,
    coverImage: post.coverImage || covers[idx % covers.length] || "/images/departments/consultation-cta.jpg",
    authorName: post.authorName || { en: "Admin", bn: "এডমিন" },
    authorRole: post.authorRole || { en: "Admin", bn: "এডমিন" },
    authorPhotoUrl: post.authorPhotoUrl || "",
    tags: post.tags || [post.departmentSlug, "dental health", "kgh dental"],
  };
});

export async function fetchLiveBlogPosts(): Promise<BlogPost[]> {
  // 1. If Supabase is configured, fetch fresh posts from Supabase first
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const livePosts: BlogPost[] = data.map((d: any) => {
          const staticPost = ENRICHED_BLOG_POSTS.find((s) => s.slug === d.slug || s.id === d.id);
          return {
            id: d.id,
            slug: d.slug,
            title: {
              en: d.title_en || staticPost?.title.en || "",
              bn: d.title_bn || staticPost?.title.bn || "",
            },
            excerpt: {
              en: d.excerpt_en || staticPost?.excerpt.en || "",
              bn: d.excerpt_bn || staticPost?.excerpt.bn || "",
            },
            coverImage: d.cover_image || staticPost?.coverImage || "/images/departments/consultation-cta.jpg",
            departmentSlug: d.department_slug || staticPost?.departmentSlug || "general-consultation",
            departmentName: {
              en: d.department_name_en || staticPost?.departmentName.en || "General Consultation",
              bn: d.department_name_bn || staticPost?.departmentName.bn || "সাধারণ পরামর্শ",
            },
            readTime: d.read_time || staticPost?.readTime || "8 min read",
            date: d.date_str || staticPost?.date || "Updated 2026",
            targetKeyword: d.target_keyword || staticPost?.targetKeyword || "",
            authorName: d.author_name_en
              ? { en: d.author_name_en, bn: d.author_name_bn || d.author_name_en }
              : { en: "Admin", bn: "এডমিন" },
            authorRole: {
              en: d.author_role_en || "Admin",
              bn: d.author_role_bn || "এডমিন",
            },
            authorPhotoUrl: d.author_photo_url || staticPost?.authorPhotoUrl || "",
            tags: d.tags || staticPost?.tags || [],
            contentHtml: {
              en: d.content_html_en || staticPost?.contentHtml?.en || "",
              bn: d.content_html_bn || staticPost?.contentHtml?.bn || "",
            },
            content: d.legacy_content || staticPost?.content || undefined,
          };
        });

        const missingStatic = ENRICHED_BLOG_POSTS.filter(
          (s) => !livePosts.some((l) => l.slug === s.slug || l.id === s.id)
        );
        const combined = [...livePosts, ...missingStatic];

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("kgh_blog_posts", JSON.stringify(combined));
          } catch (e) {
            // ignore
          }
        }
        return combined;
      }
    } catch (err) {
      console.warn("fetchLiveBlogPosts Supabase query error, falling back:", err);
    }
  }

  // 2. Client-side local cache fallback
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_blog_posts");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mapped = parsed.map((p: BlogPost) => {
            const staticPost = ENRICHED_BLOG_POSTS.find((s) => s.id === p.id || s.slug === p.slug);
            return {
              ...staticPost,
              ...p,
              departmentName: p.departmentName || staticPost?.departmentName || { en: "General Consultation", bn: "সাধারণ পরামর্শ" },
              contentHtml: (p.contentHtml && (p.contentHtml.en || p.contentHtml.bn)) ? p.contentHtml : staticPost?.contentHtml,
            };
          });
          const missingStatic = ENRICHED_BLOG_POSTS.filter(
            (s) => !mapped.some((m) => m.slug === s.slug || m.id === s.id)
          );
          return [...mapped, ...missingStatic];
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Static initial fallback
  return ENRICHED_BLOG_POSTS;
}

export async function fetchLiveBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await fetchLiveBlogPosts();
  return allPosts.find((p) => p.slug === slug) || null;
}

export async function saveLiveBlogPost(
  post: BlogPost,
  originalSlug?: string,
  originalId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const isExistingEdit = Boolean(originalSlug || originalId);
  const targetId = originalId || post.id;
  const isTargetUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

  // If new post without a valid UUID, generate one so Supabase primary key is well-formed
  let finalPostId = post.id;
  if (!isExistingEdit && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalPostId)) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      finalPostId = crypto.randomUUID();
    }
  }
  const postToSave: BlogPost = { ...post, id: finalPostId };

  // Always update client storage cache so local testing and offline fallback work immediately
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_blog_posts");
      let list: BlogPost[] = cached ? JSON.parse(cached) : [...ENRICHED_BLOG_POSTS];

      const idx = list.findIndex(
        (p) =>
          (targetId && p.id === targetId) ||
          (originalSlug && p.slug === originalSlug) ||
          p.id === postToSave.id ||
          p.slug === postToSave.slug
      );

      if (idx >= 0) {
        list[idx] = postToSave;
      } else {
        list = [postToSave, ...list];
      }
      localStorage.setItem("kgh_blog_posts", JSON.stringify(list));

      // Dispatch custom reactive event for instant intra-tab and cross-tab update
      window.dispatchEvent(new CustomEvent("kgh_blogs_updated", { detail: postToSave }));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true, data: postToSave };

  try {
    const payload = {
      slug: postToSave.slug,
      title_en: postToSave.title.en,
      title_bn: postToSave.title.bn,
      excerpt_en: postToSave.excerpt.en,
      excerpt_bn: postToSave.excerpt.bn,
      cover_image: postToSave.coverImage || "/images/departments/consultation-cta.jpg",
      department_slug: postToSave.departmentSlug,
      department_name_en: postToSave.departmentName.en,
      department_name_bn: postToSave.departmentName.bn,
      read_time: postToSave.readTime,
      date_str: postToSave.date,
      target_keyword: postToSave.targetKeyword,
      author_name_en: postToSave.authorName?.en || "Admin",
      author_name_bn: postToSave.authorName?.bn || "এডমিন",
      author_role_en: postToSave.authorRole?.en || "Admin",
      author_role_bn: postToSave.authorRole?.bn || "এডমিন",
      author_photo_url: postToSave.authorPhotoUrl || "",
      tags: postToSave.tags || [],
      content_html_en: postToSave.contentHtml?.en || "",
      content_html_bn: postToSave.contentHtml?.bn || "",
      legacy_content: postToSave.content || null,
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert",
          table: "blog_posts",
          payload: isTargetUuid ? { id: targetId, ...payload } : payload,
          onConflict: isTargetUuid ? "id" : "slug",
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Save blog post failed");
      return { success: true, data: json.data || postToSave };
    }

    if (isExistingEdit) {
      let query = supabase.from("blog_posts").update(payload as any);
      if (isTargetUuid) {
        query = query.eq("id", targetId);
      } else if (originalSlug) {
        query = query.eq("slug", originalSlug);
      } else {
        query = query.eq("slug", postToSave.slug);
      }

      const { data, error } = await query.select();
      if (error || !data || data.length === 0) {
        const { data: upsertData, error: upsertError } = await supabase
          .from("blog_posts")
          .upsert(
            (isTargetUuid ? { id: targetId, ...payload } : payload) as any,
            { onConflict: isTargetUuid ? "id" : "slug" }
          )
          .select()
          .single();
        if (upsertError) throw upsertError;
        return { success: true, data: upsertData };
      }
      return { success: true, data: data[0] };
    } else {
      const insertPayload = isTargetUuid
        ? { id: postToSave.id, ...payload }
        : payload;

      const { data, error } = await supabase
        .from("blog_posts")
        .upsert(insertPayload as any, { onConflict: "slug" })
        .select()
        .single();
      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.warn("saveLiveBlogPost database error (local state active):", err?.message || err);
    return { success: true, data: postToSave };
  }
}

export async function deleteLiveBlogPost(
  id: string,
  slug?: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_blog_posts");
      let list: BlogPost[] = cached ? JSON.parse(cached) : [...ENRICHED_BLOG_POSTS];
      list = list.filter((p) => p.id !== id && (!slug || p.slug !== slug));
      localStorage.setItem("kgh_blog_posts", JSON.stringify(list));

      window.dispatchEvent(
        new CustomEvent("kgh_blogs_updated", { detail: { id, slug, deleted: true } })
      );
      window.dispatchEvent(new Event("storage"));

      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "blog_posts", id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Delete blog post failed");
      return { success: true };
    } catch (e) {
      console.warn("deleteLiveBlogPost warning:", e);
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await supabase.from("blog_posts").delete().eq("id", id);
    }

    const targetSlug = slug || (!isUuid ? id : undefined);
    if (targetSlug) {
      await supabase.from("blog_posts").delete().eq("slug", targetSlug);
    }

    return { success: true };
  } catch (err: any) {
    console.warn("deleteLiveBlogPost database warning:", err);
    return { success: true };
  }
}

// ==============================================================================
// 11. FEATURED VIDEOS API (YOUTUBE & FACEBOOK REELS)
// ==============================================================================

export function parseVideoUrl(url: string): {
  isValid: boolean;
  platform: "youtube" | "facebook";
  embedUrl: string;
  thumbnailUrl: string;
  aspectRatio: "16:9" | "9:16";
  error?: string;
} {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return {
      isValid: false,
      platform: "youtube",
      embedUrl: "",
      thumbnailUrl: "",
      aspectRatio: "16:9",
      error: "Please enter a video URL",
    };
  }

  // 1. YouTube Detection
  // Matches: youtube.com/watch?v=xxx, youtu.be/xxx, youtube.com/shorts/xxx, youtube.com/embed/xxx
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const isShort = trimmed.toLowerCase().includes("/shorts/");
    return {
      isValid: true,
      platform: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      aspectRatio: isShort ? "9:16" : "16:9",
    };
  }

  // 2. Facebook Detection
  // Matches: facebook.com/reel/xxx, facebook.com/.../videos/xxx, fb.watch/xxx, facebook.com/watch/?v=xxx
  const isFb = /facebook\.com|fb\.watch/i.test(trimmed);
  if (isFb) {
    const isReel = /reel|fb\.watch/i.test(trimmed);
    return {
      isValid: true,
      platform: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        trimmed
      )}&show_text=false&autoplay=true`,
      thumbnailUrl: "",
      aspectRatio: isReel ? "9:16" : "16:9",
    };
  }

  return {
    isValid: false,
    platform: "youtube",
    embedUrl: "",
    thumbnailUrl: "",
    aspectRatio: "16:9",
    error: "Supported formats: YouTube (video, Shorts) or Facebook (Reels, video posts)",
  };
}

export const INITIAL_FEATURED_VIDEOS: FeaturedVideo[] = [];

export async function fetchLiveVideos(includeInactive: boolean = false): Promise<FeaturedVideo[]> {
  // 1. Try fetching from Supabase (100% dynamic from database)
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from("featured_videos")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (!error && data) {
        const items: FeaturedVideo[] = data.map((d: any) => ({
          id: d.id,
          title: {
            en: d.title_en || "Video Showcase",
            bn: d.title_bn || "ভিডিও উপস্থাপনা",
          },
          videoUrl: d.video_url,
          embedUrl: d.embed_url,
          platform: d.platform as "youtube" | "facebook",
          aspectRatio: (d.aspect_ratio || "16:9") as "16:9" | "9:16",
          thumbnailUrl: d.thumbnail_url || "",
          category: d.category || "treatment_guide",
          isActive: d.is_active ?? true,
          sortOrder: d.sort_order ?? 0,
          createdAt: d.created_at,
        }));

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("kgh_featured_videos", JSON.stringify(items));
          } catch (e) {
            // ignore
          }
        }

        return items;
      }
    } catch (err) {
      // ignore
    }
  }

  // 2. Fallback to localStorage cache only
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_featured_videos");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return includeInactive ? parsed : parsed.filter((v: FeaturedVideo) => v.isActive);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return [];
}

export async function saveLiveVideo(
  video: FeaturedVideo
): Promise<{ success: boolean; data?: FeaturedVideo; error?: string }> {
  // 1. Update localStorage cache first for zero latency
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_featured_videos");
      let list: FeaturedVideo[] = cached ? JSON.parse(cached) : [...INITIAL_FEATURED_VIDEOS];
      const existingIdx = list.findIndex((v) => v.id === video.id);
      if (existingIdx >= 0) {
        list[existingIdx] = video;
      } else {
        list.push(video);
      }
      localStorage.setItem("kgh_featured_videos", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("kgh_videos_updated", { detail: video }));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  }

  // 2. Sync to Supabase
  if (!isSupabaseConfigured) return { success: true, data: video };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(video.id);
    const payload: any = {
      title_en: video.title.en,
      title_bn: video.title.bn,
      video_url: video.videoUrl,
      embed_url: video.embedUrl,
      platform: video.platform,
      aspect_ratio: video.aspectRatio,
      thumbnail_url: video.thumbnailUrl || "",
      category: video.category,
      is_active: video.isActive,
      sort_order: video.sortOrder,
      updated_at: new Date().toISOString(),
    };

    if (isUuid) {
      payload.id = video.id;
    }

    const { data, error } = await supabase
      .from("featured_videos")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase upsert warning for featured_videos:", error.message);
      return { success: true, data: video };
    }

    return {
      success: true,
      data: {
        ...video,
        id: data.id,
      },
    };
  } catch (err: any) {
    console.error("saveLiveVideo error:", err);
    return { success: true, data: video };
  }
}

export async function deleteLiveVideo(id: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("kgh_featured_videos");
      let list: FeaturedVideo[] = cached ? JSON.parse(cached) : [...INITIAL_FEATURED_VIDEOS];
      list = list.filter((v) => v.id !== id);
      localStorage.setItem("kgh_featured_videos", JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("kgh_videos_updated", { detail: { id, deleted: true } }));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      // ignore
    }
  }

  if (!isSupabaseConfigured) return { success: true };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      await supabase.from("featured_videos").delete().eq("id", id);
    }
    return { success: true };
  } catch (err: any) {
    console.warn("deleteLiveVideo warning:", err);
    return { success: true };
  }
}



