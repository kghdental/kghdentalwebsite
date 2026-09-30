import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySignedSessionToken } from "@/lib/auth/session";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("kgh_admin_session")?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const verifiedUser = await verifySignedSessionToken(sessionToken);

  if (!verifiedUser) {
    cookieStore.delete("kgh_admin_session");
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Optionally verify active status in database if Supabase is connected
  if (isSupabaseConfigured) {
    try {
      const supabaseAdmin = getSupabaseAdminClient();
      const { data: adminUser, error } = await supabaseAdmin
        .from("admin_users")
        .select("id, email, is_active, role, name")
        .ilike("email", verifiedUser.email)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !adminUser) {
        cookieStore.delete("kgh_admin_session");
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }

      return NextResponse.json({
        authenticated: true,
        email: adminUser.email,
        name: adminUser.name || verifiedUser.name,
        role: adminUser.role || verifiedUser.role,
      });
    } catch {
      // If DB error happens, trust verified cryptographic session token
    }
  }

  return NextResponse.json({
    authenticated: true,
    email: verifiedUser.email,
    name: verifiedUser.name,
    role: verifiedUser.role,
  });
}
