import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySignedSessionToken } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kgh_admin_session")?.value;
  return verifySignedSessionToken(token);
}

// GET: Fetch all inquiries for Admin Dashboard
export async function GET() {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ inquiries: [] });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // Table might not exist yet if SQL patch not run
      console.warn("Admin inquiries fetch notice:", error.message);
      return NextResponse.json({ inquiries: [] });
    }

    return NextResponse.json({ inquiries: data || [] });
  } catch (err: any) {
    console.error("Admin inquiries fetch error:", err);
    return NextResponse.json({ inquiries: [], error: err.message }, { status: 500 });
  }
}

// PATCH: Update status (unread, read, replied, archived) or admin_notes
export async function PATCH(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const updatePayload: any = {};
    if (status) updatePayload.status = status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;

    const { error } = await supabaseAdmin
      .from("contact_inquiries")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Inquiry status update database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Inquiry updated successfully" });
  } catch (err: any) {
    console.error("Inquiry PATCH error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Permanently delete an inquiry
export async function DELETE(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { error } = await supabaseAdmin.from("contact_inquiries").delete().eq("id", id);

    if (error) {
      console.error("Inquiry delete database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err: any) {
    console.error("Inquiry DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
