import { NextRequest, NextResponse } from "next/server";
import { readdir, unlink } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifySignedSessionToken } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kgh_admin_session")?.value;
  return verifySignedSessionToken(token);
}

export async function GET() {
  const allMedia: Array<{ id: string; name: string; url: string; source: "supabase" | "local" }> = [];

  // 1. Fetch from Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("media_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        data.forEach((item) => {
          allMedia.push({
            id: item.id,
            name: item.name,
            url: item.url,
            source: "supabase",
          });
        });
      }
    } catch (e) {
      console.warn("Error fetching Supabase media_files:", e);
    }
  }

  // 2. Fetch local uploads and department assets from public/images/
  try {
    const foldersToScan = [
      { dir: path.join(process.cwd(), "public", "images", "uploads"), prefix: "/images/uploads" },
      { dir: path.join(process.cwd(), "public", "images", "departments"), prefix: "/images/departments" },
      { dir: path.join(process.cwd(), "public", "images", "services-images-for-7-services"), prefix: "/images/services-images-for-7-services" },
      { dir: path.join(process.cwd(), "public", "images", "Service-page-banner-cover"), prefix: "/images/Service-page-banner-cover" },
      { dir: path.join(process.cwd(), "public", "images", "SubServices-images"), prefix: "/images/SubServices-images" },
      { dir: path.join(process.cwd(), "public", "images", "doctors"), prefix: "/images/doctors" },
      { dir: path.join(process.cwd(), "public", "images", "logos"), prefix: "/images/logos" },
    ];

    for (const folder of foldersToScan) {
      try {
        const files = await readdir(/*turbopackIgnore: true*/ folder.dir);
        for (const file of files) {
          if (file.match(/\.(png|jpe?g|webp|gif|svg)$/i)) {
            const fullUrl = `${folder.prefix}/${file}`;
            // Avoid duplicate URLs if already in list
            if (!allMedia.some((m) => m.url === fullUrl)) {
              allMedia.push({
                id: `local-${folder.prefix}-${file}`,
                name: file,
                url: fullUrl,
                source: "local",
              });
            }
          }
        }
      } catch {
        // Directory may not exist yet, ignore
      }
    }
  } catch (err) {
    console.error("Local media read error:", err);
  }

  return NextResponse.json({ media: allMedia });
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAdminAuth();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    const { id, url, source } = await req.json();

    if (!id && !url) {
      return NextResponse.json({ error: "Media ID or URL is required" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const supabaseAdmin = getSupabaseAdminClient();
      const isUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (source === "supabase" || isUuid) {
        // Delete record from media_files table
        if (id) {
          await supabaseAdmin.from("media_files").delete().eq("id", id);
        }

        // Delete from storage bucket if present in kgh-media
        if (url) {
          const match = url.match(/\/kgh-media\/([^?#]+)/);
          if (match && match[1]) {
            const storagePath = decodeURIComponent(match[1]);
            await supabaseAdmin.storage.from("kgh-media").remove([storagePath]);
          }
        }
        return NextResponse.json({ success: true });
      }
    }

    // Local file delete (strictly isolated to public/images/uploads/)
    if (url && typeof url === "string" && url.startsWith("/images/uploads/")) {
      const filename = path.basename(url);
      const filePath = path.join(process.cwd(), "public", "images", "uploads", filename);
      try {
        await unlink(filePath);
      } catch {
        // Already unlinked or missing
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: "Asset reference cleared" });
  } catch (err: any) {
    console.error("Media delete error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete media" }, { status: 500 });
  }
}
