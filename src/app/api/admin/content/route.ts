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

// POST: Securely upsert or mutate CMS content using Service Role privileges
export async function POST(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ success: true, simulated: true });
  }

  try {
    const body = await req.json();
    const { action, table, payload, id, onConflict } = body;

    if (!table) {
      return NextResponse.json({ error: "Database table is required" }, { status: 400 });
    }

    // Whitelist tables that can be mutated via this endpoint
    const ALLOWED_TABLES = new Set([
      "doctors",
      "departments",
      "sub_services",
      "clinic_settings",
      "blog_posts",
      "reviews",
      "why_choose_cards",
      "clinical_creed",
      "gallery_items",
      "media_files",
      "doctor_blocked_dates",
    ]);

    if (!ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: "Invalid target table" }, { status: 403 });
    }

    const supabaseAdmin = getSupabaseAdminClient();

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "ID required for deletion" }, { status: 400 });
      }
      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "upsert") {
      if (!payload) {
        return NextResponse.json({ error: "Payload required for upsert" }, { status: 400 });
      }
      const options = onConflict ? { onConflict } : undefined;
      const { data, error } = await supabaseAdmin.from(table).upsert(payload, options).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === "insert") {
      if (!payload) {
        return NextResponse.json({ error: "Payload required for insert" }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin.from(table).insert(payload).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin content mutation error:", err);
    return NextResponse.json({ error: err.message || "Mutation failed" }, { status: 500 });
  }
}
