import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySignedSessionToken } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kgh_admin_session")?.value;
  return verifySignedSessionToken(token);
}

// GET: Fetch all appointments for Admin Dashboard
export async function GET() {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ appointments: [] });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ appointments: data || [] });
  } catch (err: any) {
    console.error("Admin appointments fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update appointment status or admin notes
export async function PATCH(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, reference_code, status, admin_notes } = body;

    if (!id && !reference_code) {
      return NextResponse.json({ error: "Appointment ID or reference code required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    let query = supabaseAdmin.from("appointments").update(updates);
    if (id && !String(id).startsWith("app-")) {
      query = query.eq("id", id);
    } else {
      query = query.eq("reference_code", reference_code);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin appointment update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete an appointment record
export async function DELETE(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, reference_code } = body;

    if (!id && !reference_code) {
      return NextResponse.json({ error: "Appointment ID or reference code required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    let query = supabaseAdmin.from("appointments").delete();

    if (id && !String(id).startsWith("app-")) {
      query = query.eq("id", id);
    } else {
      query = query.eq("reference_code", reference_code);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin appointment delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
