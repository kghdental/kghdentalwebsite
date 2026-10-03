import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createSignedSessionToken } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { checkRateLimit } from "@/lib/security/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // 1. Enforce strict rate limiting to prevent brute-force attacks (5 attempts per 15 min)
    const rateCheck = await checkRateLimit(req, "admin_login", {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    const inputEmail = (email || "").trim().toLowerCase();
    const inputPassword = (password || "").trim();

    // Email syntax validation to prevent SQL syntax fuzzing or wildcard probes (CWE-209 / SEC-05)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(inputEmail) || inputEmail.length > 254) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 2. Fallback to server environment variables if Supabase is offline/not configured
    const envAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const envAdminPassword = (process.env.ADMIN_PASSWORD || "").trim();

    if (
      envAdminEmail &&
      envAdminPassword &&
      inputEmail === envAdminEmail &&
      inputPassword === envAdminPassword
    ) {
      const sessionToken = await createSignedSessionToken({
        email: envAdminEmail,
        name: "Clinic Administrator",
        role: "super_admin",
      });

      const cookieStore = await cookies();
      cookieStore.set("kgh_admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        adminEmail: envAdminEmail,
        adminName: "Clinic Administrator",
        role: "super_admin",
      });
    }

    // 3. Verify against the Supabase database `admin_users` table using privileged admin client
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration error. Please ensure Supabase credentials are set.",
        },
        { status: 503 }
      );
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: adminUser, error: dbError } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, password, is_active, role, name")
      .eq("email", inputEmail)
      .eq("is_active", true)
      .maybeSingle();

    if (dbError) {
      console.error("Supabase admin verification database error:", dbError);
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    // Cryptographic verification with transparent bcrypt upgrade
    const isPasswordValid = await verifyPassword(inputPassword, adminUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin email or password" },
        { status: 401 }
      );
    }

    // Transparently upgrade plaintext password in database to bcrypt hash
    if (!adminUser.password.startsWith("$2a$") && !adminUser.password.startsWith("$2b$")) {
      try {
        const secureHash = await hashPassword(inputPassword);
        await supabaseAdmin
          .from("admin_users")
          .update({
            password: secureHash,
            updated_at: new Date().toISOString(),
          })
          .eq("id", adminUser.id);
      } catch (hashUpgradeErr) {
        console.warn("Failed to upgrade legacy password to bcrypt:", hashUpgradeErr);
      }
    }

    const authenticatedEmail = adminUser.email;
    const sessionToken = await createSignedSessionToken({
      email: authenticatedEmail,
      name: adminUser.name || "Admin",
      role: adminUser.role || "super_admin",
    });

    const cookieStore = await cookies();
    cookieStore.set("kgh_admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      adminEmail: authenticatedEmail,
      adminName: adminUser.name || "Admin",
      role: adminUser.role || "super_admin",
    });
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
