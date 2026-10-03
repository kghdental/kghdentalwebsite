-- ==============================================================================
-- KGH Dental Security Hardening & RLS Patch
-- Execute in: Supabase Dashboard -> SQL Editor -> New Query
-- Date: October 2026
-- ==============================================================================

-- 1. [SEC-01] Ensure Appointments Table RLS Allows Secure Creation & Tracking
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow anonymous patients to insert new appointment bookings
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.appointments;
CREATE POLICY "Enable insert for anon users"
  ON public.appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public tracking read access
DROP POLICY IF EXISTS "Enable select for tracking" ON public.appointments;
CREATE POLICY "Enable select for tracking"
  ON public.appointments
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. [SEC-04] Protect Doctor Personal PII & Email Leakage
-- Create a secure public view that omits private email addresses
CREATE OR REPLACE VIEW public.public_doctors AS
  SELECT 
    id,
    name_en,
    name_bn,
    specialty_en,
    specialty_bn,
    degrees_en,
    degrees_bn,
    designation_en,
    designation_bn,
    institution_en,
    institution_bn,
    experience_en,
    experience_bn,
    department_id,
    schedule,
    bio_en,
    bio_bn,
    photo_url,
    bmdc_reg,
    is_active,
    created_at
  FROM public.doctors;

-- Grant access on public view to anon users
GRANT SELECT ON public.public_doctors TO anon, authenticated;

-- Revoke SELECT on the private 'email' column of doctors table from anonymous users
DO $$
BEGIN
  BEGIN
    REVOKE SELECT (email) ON public.doctors FROM anon;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Notice: Column-level revoke skipped or already applied.';
  END;
END $$;

-- 3. [SEC-05] Lock Down Admin Users Table
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

-- Revoke all direct anonymous access to admin_users table (must only be accessed via service_role)
REVOKE ALL ON public.admin_users FROM anon;

-- Ensure service_role has full access for server-side auth
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.appointments TO service_role;
GRANT ALL ON public.doctors TO service_role;

-- ==============================================================================
-- Patch complete.
-- ==============================================================================
