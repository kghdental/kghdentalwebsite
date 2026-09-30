import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

// Service role key has full admin rights on Supabase and bypasses RLS
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

let cachedAdminClient: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client with elevated administrative privileges.
 * Uses SUPABASE_SERVICE_ROLE_KEY if available; falls back to ANON key with a warning.
 * NEVER import this file in client-side ("use client") components!
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const effectiveKey = supabaseServiceKey || supabaseAnonKey;

  if (!supabaseUrl || !effectiveKey) {
    // Return a dummy client to avoid crashes if environment variables are not yet loaded
    return createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  if (!supabaseServiceKey) {
    console.warn(
      "[SECURITY NOTICE] SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Falling back to anon key on server."
    );
  }

  cachedAdminClient = createClient(supabaseUrl, effectiveKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
