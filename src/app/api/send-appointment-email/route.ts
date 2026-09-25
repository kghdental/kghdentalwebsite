import { NextResponse } from "next/server";
import {
  sendDoctorAppointmentEmail,
  EmailAppointmentPayload,
} from "@/lib/email/appointment-email";
import { fetchLiveDoctors } from "@/lib/api/db";

export const dynamic = "force-dynamic";
export const maxDuration = 15; // 15-second timeout for serverless environments

export async function POST(request: Request) {
  try {
    const body = await request.json();

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

    if (!patient_name || !patient_phone || !appointment_date || !time_slot) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required appointment fields (patient_name, phone, date, slot).",
        },
        { status: 400 }
      );
    }

    // Resolve doctor email if not directly provided in the payload
    let resolvedDoctorEmail = doctor_email;
    if (!resolvedDoctorEmail && doctor_id) {
      try {
        const doctors = await fetchLiveDoctors();
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
      reference_code: reference_code || `KGH-${Date.now().toString(36).toUpperCase()}`,
      patient_name,
      patient_phone,
      patient_email,
      patient_age,
      patient_gender,
      doctor_id,
      doctor_name: doctor_name || "Specialist Doctor",
      doctor_email: resolvedDoctorEmail,
      department_name,
      appointment_date,
      time_slot,
      symptoms,
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
