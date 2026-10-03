import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // 1. Strict rate limiting: max 10 appointment bookings per 15 minutes per IP
    const rateCheck = await checkRateLimit(req, "appointment_create", {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many booking requests. Please wait ${rateCheck.resetInSeconds} seconds before submitting again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      reference_code,
      patient_name,
      patient_phone,
      patient_email,
      patient_age,
      patient_gender,
      doctor_id,
      doctor_name,
      department_id,
      department_name,
      appointment_date,
      time_slot,
      symptoms,
      status,
    } = body;

    // 2. Strict Input Validation
    const cleanName = (patient_name || "").trim();
    const cleanPhone = (patient_phone || "").replace(/[^0-9+]/g, "").trim();
    const cleanRef = (reference_code || "").trim();

    if (!cleanName || cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Patient name is required (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "A valid mobile phone number is required." },
        { status: 400 }
      );
    }

    if (!appointment_date || !time_slot) {
      return NextResponse.json(
        { success: false, error: "Appointment date and time slot are required." },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      // Local development fallback
      return NextResponse.json({
        success: true,
        reference_code: cleanRef,
        message: "Appointment accepted (local mode).",
      });
    }

    const payload: any = {
      reference_code: cleanRef,
      patient_name: cleanName,
      patient_phone: cleanPhone,
      patient_email: patient_email ? patient_email.trim() : null,
      patient_age: patient_age ? String(patient_age).trim() : null,
      patient_gender: patient_gender ? String(patient_gender).trim() : null,
      doctor_id: doctor_id || doctor_name || "specialist-doctor",
      department_id: department_id || department_name || "general-consultation",
      appointment_date: appointment_date,
      time_slot: time_slot,
      symptoms: symptoms ? String(symptoms).trim() : null,
      status: status || "confirmed",
    };

    const supabaseAdmin = getSupabaseAdminClient();
    let { error } = await supabaseAdmin.from("appointments").insert(payload);

    // Fallback if patient_age or patient_gender columns are not present in Supabase table
    if (
      error &&
      (error.message?.includes("patient_age") ||
        error.message?.includes("patient_gender") ||
        error.code === "PGRST204")
    ) {
      delete payload.patient_age;
      delete payload.patient_gender;
      const retry = await supabaseAdmin.from("appointments").insert(payload);
      error = retry.error;
    }

    if (error) {
      console.error("Secure appointment creation database error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database error recording appointment. Please contact our reception.",
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reference_code: cleanRef,
      message: "Appointment confirmed and recorded successfully.",
    });
  } catch (err: any) {
    console.error("Unhandled appointment create error:", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error. Please try again." },
      { status: 500 }
    );
  }
}
