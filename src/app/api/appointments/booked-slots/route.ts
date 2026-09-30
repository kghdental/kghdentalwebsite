import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName");
  const date = searchParams.get("date");

  if (!doctorId || !date) {
    return NextResponse.json({ bookedSlots: [] });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ bookedSlots: [] });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    let query = supabaseAdmin
      .from("appointments")
      .select("time_slot")
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (doctorName) {
      query = query.or(`doctor_id.eq.${doctorId},doctor_id.eq.${doctorName}`);
    } else {
      query = query.eq("doctor_id", doctorId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return NextResponse.json({ bookedSlots: [] });
    }

    const bookedSlots = Array.from(new Set(data.map((r: any) => r.time_slot).filter(Boolean)));
    return NextResponse.json({ bookedSlots });
  } catch (err) {
    console.warn("fetchBookedSlots error:", err);
    return NextResponse.json({ bookedSlots: [] });
  }
}
