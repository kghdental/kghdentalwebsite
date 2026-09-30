import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { cookies } from "next/headers";
import { verifySignedSessionToken } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/security/rate-limiter";

// Strict whitelist of allowed image extensions and MIME types (SVG disallowed due to XSS risk)
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Authentication Check: Only verified administrators can upload
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("kgh_admin_session")?.value;
    const adminUser = verifySignedSessionToken(sessionToken);

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required to upload files." },
        { status: 401 }
      );
    }

    // 2. Rate limiting (max 20 uploads per 10 minutes)
    const rateCheck = checkRateLimit(req, "admin_upload", {
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: `Upload rate limit reached. Please wait ${rateCheck.resetInSeconds}s.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. File Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds the 5 MB limit (file is ${(file.size / (1024 * 1024)).toFixed(2)} MB)` },
        { status: 400 }
      );
    }

    // 4. MIME Type Validation
    const mimeType = (file.type || "").toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.",
        },
        { status: 400 }
      );
    }

    // 5. File Extension Whitelisting & Path Sanitization
    const rawExt = path.extname(file.name || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only .jpg, .png, .webp, and .gif are permitted." },
        { status: 400 }
      );
    }

    // Generate non-enumerable, cryptographically secure random filename
    const safeExt = rawExt || (mimeType === "image/png" ? ".png" : ".jpg");
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}_${randomSuffix}${safeExt}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Upload to Supabase Storage if configured using Service Role
    if (isSupabaseConfigured) {
      try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from("kgh-media")
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from("kgh-media")
            .getPublicUrl(filename);

          const publicUrl = publicUrlData.publicUrl;

          // Record in media_files table
          await supabaseAdmin.from("media_files").insert({
            name: path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 100),
            url: publicUrl,
            size_bytes: file.size,
            mime_type: mimeType,
          });

          return NextResponse.json({
            success: true,
            url: publicUrl,
            name: file.name,
          });
        }
      } catch (err) {
        console.warn("Supabase storage upload failed, falling back to local storage:", err);
      }
    }

    // 7. Local Disk Fallback (confined strictly to public/images/uploads/)
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Double check resolved path cannot escape uploadDir
    const resolvedFilePath = path.resolve(uploadDir, filename);
    if (!resolvedFilePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: "Invalid file destination" }, { status: 400 });
    }

    await writeFile(resolvedFilePath, buffer);
    const localUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: localUrl,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
