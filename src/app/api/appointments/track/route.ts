import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { resolveDoctorDisplayName, resolveDepartmentDisplayName } from "@/lib/api/db";

/**
 * Masks a phone number for public privacy: "01712345678" -> "0171****678"
 */
function maskPhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    const start = digits.slice(0, 4);
    const end = digits.slice(-3);
    return `${start}****${end}`;
  }
  return phone;
}

/**
 * Masks an email for public privacy: "patient@example.com" -> "p***t@example.com"
 */
function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting: max 15 tracking checks per 10 minutes per IP
    const rateCheck = await checkRateLimit(req, "patient_track", {
      limit: 15,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many tracking searches. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
          records: [],
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawQuery = (body.query || "").trim();

    // 2. Strict Input Validation (Min 4 chars, prevent blank / wildcard search)
    const sanitized = rawQuery.replace(/[%_\\]/g, ""); // strip SQL wildcard characters
    if (!sanitized || sanitized.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid reference code (e.g. KGH-...) or full 11-digit mobile number.",
          records: [],
        },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, records: [] });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const cleanDigits = sanitized.replace(/[^0-9]/g, "");
    const cleanRef = sanitized.toUpperCase().replace(/\s+/g, "");

    let queryBuilder = supabaseAdmin.from("appointments").select(
      "id, reference_code, patient_name, patient_phone, patient_email, doctor_id, department_id, appointment_date, time_slot, symptoms, status, created_at"
    );

    // Case-insensitive reference matching (PostgreSQL .eq is case-sensitive, month names in codes vary)
    const normalizedRef = cleanRef.trim();
    const prefixedRef = normalizedRef.startsWith("KGH-") ? normalizedRef : `KGH-${normalizedRef}`;

    if (normalizedRef.startsWith("KGH-")) {
      queryBuilder = queryBuilder.ilike("reference_code", normalizedRef);
    } else if (cleanDigits.length >= 10) {
      // 10 or 11 digits phone match
      const last10 = cleanDigits.slice(-10);
      queryBuilder = queryBuilder.ilike("patient_phone", `%${last10}%`);
    } else if (normalizedRef.includes("-")) {
      queryBuilder = queryBuilder.or(`reference_code.ilike.${normalizedRef},reference_code.ilike.${prefixedRef}`);
    } else {
      queryBuilder = queryBuilder.or(`reference_code.ilike.${normalizedRef},reference_code.ilike.${prefixedRef}`);
    }

    const { data, error } = await queryBuilder.limit(5);

    if (error) {
      console.error("Secure track lookup error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to retrieve tracking records.", records: [] },
        { status: 500 }
      );
    }

    // 3. Mask sensitive PII before responding to public web clients
    const safeRecords = (data || []).map((a: any) => ({
      id: a.id,
      reference_code: a.reference_code,
      patient_name: a.patient_name,
      patient_phone: maskPhoneNumber(a.patient_phone || ""),
      patient_email: maskEmail(a.patient_email),
      doctor_name: resolveDoctorDisplayName(a.doctor_id),
      department_name: resolveDepartmentDisplayName(a.department_id, a.doctor_id),
      appointment_date: a.appointment_date,
      time_slot: a.time_slot,
      symptoms: a.symptoms || "",
      status: a.status || "confirmed",
      created_at: a.created_at ? a.created_at.substring(0, 16).replace("T", " ") : "",
    }));

    return NextResponse.json({
      success: true,
      records: safeRecords,
    });
  } catch (err: any) {
    console.error("Track route error:", err);
    return NextResponse.json(
      { success: false, error: "Internal tracking server error", records: [] },
      { status: 500 }
    );
  }
}
