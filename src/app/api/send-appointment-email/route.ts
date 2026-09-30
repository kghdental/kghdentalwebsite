import { NextRequest, NextResponse } from "next/server";
import {
  sendDoctorAppointmentEmail,
  EmailAppointmentPayload,
} from "@/lib/email/appointment-email";
import { fetchLiveDoctors } from "@/lib/api/db";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";
export const maxDuration = 15; // 15-second timeout for serverless environments

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting: Prevent email flooding / quota exhaustion (max 6 requests per 10 min)
    const rateCheck = checkRateLimit(request, "send_appointment_email", {
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many email dispatch attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const {
      reference_code,
      patient_name,
      patient_phone,
      patient_email,
      patient_age,
      patient_gender,
      doctor_id,
      doctor_name,
      doctor_email,
      department_name,
      appointment_date,
      time_slot,
      symptoms,
    } = body;

    // 2. Strict Input Validation
    const cleanPatientName = (patient_name || "").trim().slice(0, 100);
    const cleanPatientPhone = (patient_phone || "").trim().slice(0, 25);
    const cleanAppointmentDate = (appointment_date || "").trim().slice(0, 20);
    const cleanTimeSlot = (time_slot || "").trim().slice(0, 30);

    if (!cleanPatientName || !cleanPatientPhone || !cleanAppointmentDate || !cleanTimeSlot) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required appointment fields (patient_name, phone, date, slot).",
        },
        { status: 400 }
      );
    }

    // Basic format validation
    if (cleanPatientPhone.replace(/[^0-9]/g, "").length < 8) {
      return NextResponse.json(
        { success: false, error: "Invalid patient phone number." },
        { status: 400 }
      );
    }

    // Resolve doctor email if not directly provided in the payload
    let resolvedDoctorEmail = doctor_email;
    if (!resolvedDoctorEmail && doctor_id) {
      try {
        const doctors = await fetchLiveDoctors(true);
        const doc = doctors.find(
          (d) =>
            d.id.toLowerCase() === doctor_id.toLowerCase() ||
            d.slug.toLowerCase() === doctor_id.toLowerCase()
        );
        if (doc?.email) {
          resolvedDoctorEmail = doc.email;
        }
      } catch (err) {
        console.warn("Could not lookup doctor email from database:", err);
      }
    }

    const payload: EmailAppointmentPayload = {
      reference_code: (reference_code || `KGH-${Date.now().toString(36).toUpperCase()}`).trim().slice(0, 50),
      patient_name: cleanPatientName,
      patient_phone: cleanPatientPhone,
      patient_email: (patient_email || "").trim().slice(0, 100) || undefined,
      patient_age: (patient_age || "").trim().slice(0, 10) || undefined,
      patient_gender: (patient_gender || "").trim().slice(0, 20) || undefined,
      doctor_id: (doctor_id || "").trim().slice(0, 50) || undefined,
      doctor_name: (doctor_name || "Specialist Doctor").trim().slice(0, 100),
      doctor_email: resolvedDoctorEmail,
      department_name: (department_name || "Specialist Consultation").trim().slice(0, 100),
      appointment_date: cleanAppointmentDate,
      time_slot: cleanTimeSlot,
      symptoms: (symptoms || "").trim().slice(0, 500) || undefined,
    };

    const result = await sendDoctorAppointmentEmail(payload);

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      recipient: result.recipient,
      simulated: result.simulated,
      error: result.error,
    });
  } catch (error: any) {
    console.error("API /api/send-appointment-email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error while processing email notification",
      },
      { status: 500 }
    );
  }
}
