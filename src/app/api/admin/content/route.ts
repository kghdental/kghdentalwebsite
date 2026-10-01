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
      "before_after_items",
      "featured_videos",
      "media_files",
      "doctor_blocked_dates",
    ]);

    if (!ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: "Invalid target table" }, { status: 403 });
    }

    const UUID_ID_TABLES = new Set([
      "gallery_items",
      "before_after_items",
      "featured_videos",
      "media_files",
      "blog_posts",
    ]);

    const supabaseAdmin = getSupabaseAdminClient();

    if (action === "delete") {
      if (!id) {
        return NextResponse.json({ error: "ID required for deletion" }, { status: 400 });
      }

      // If this table uses UUID primary keys and the provided ID is not a UUID,
      // it is a local dummy ID (e.g. gal-xxx) that was never persisted in PostgreSQL
      if (
        UUID_ID_TABLES.has(table) &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      ) {
        return NextResponse.json({ success: true, message: "Non-persisted ID skipped" });
      }

      const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "upsert") {
      if (!payload) {
        return NextResponse.json({ error: "Payload required for upsert" }, { status: 400 });
      }

      const isTableUuid = UUID_ID_TABLES.has(table);
      const hasValidUuid =
        payload.id &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id);

      // If the table uses UUID and payload.id is not a valid UUID (e.g. gal-xxx),
      // switch to insert without the invalid id string so PostgreSQL generates gen_random_uuid()
      if (isTableUuid && !hasValidUuid) {
        const cleanPayload = { ...payload };
        delete cleanPayload.id;
        const { data, error } = await supabaseAdmin.from(table).insert(cleanPayload).select();
        if (error) throw error;
        return NextResponse.json({ success: true, data });
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

      const cleanPayload = { ...payload };
      if (
        UUID_ID_TABLES.has(table) &&
        cleanPayload.id &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanPayload.id)
      ) {
        delete cleanPayload.id;
      }

      const { data, error } = await supabaseAdmin.from(table).insert(cleanPayload).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin content mutation error:", err);
    return NextResponse.json({ error: err.message || "Mutation failed" }, { status: 500 });
  }
}
