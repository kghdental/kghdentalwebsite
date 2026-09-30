-- ==============================================================================
-- KGH DENTAL CLINIC — COMPLETE DYNAMIC DATABASE UPDATE SCRIPT
-- ==============================================================================
-- Run this entire script in your Supabase Dashboard:
-- 1. Go to https://supabase.com -> Open your project
-- 2. Click "SQL Editor" on the left menu
-- 3. Click "New query" -> Paste this entire script -> Click "Run"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ADMIN USERS TABLE (Database-Driven Authentication)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Admin',
    role TEXT DEFAULT 'super_admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the Requested Admin Credentials (liakot.cse22@gmail.com)
INSERT INTO public.admin_users (email, password, name, role, is_active)
VALUES (
    'liakot.cse22@gmail.com',
    'liakot.cse22@gmail.com',
    'Super Admin',
    'super_admin',
    true
)
ON CONFLICT (email) 
DO UPDATE SET 
    password = EXCLUDED.password,
    is_active = true,
    updated_at = NOW();

-- Enable Row Level Security (RLS) for Admin Users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select active admin_users" ON public.admin_users;
CREATE POLICY "Public select active admin_users" ON public.admin_users 
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin manage admin_users" ON public.admin_users;
CREATE POLICY "Admin manage admin_users" ON public.admin_users 
FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 2. APPOINTMENTS TABLE (Fully Dynamic 2-Status Engine with Read Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    doctor_id TEXT,
    department_id TEXT,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    symptoms TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    admin_notes TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safely ensure all columns and default values exist
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.appointments ALTER COLUMN status SET DEFAULT 'confirmed';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Standardize existing statuses to confirmed / cancelled
UPDATE public.appointments 
SET status = 'confirmed' 
WHERE status NOT IN ('confirmed', 'cancelled');

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup 
ON public.appointments(doctor_id, appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_appointments_ref_search 
ON public.appointments(reference_code);

CREATE INDEX IF NOT EXISTS idx_appointments_phone_search 
ON public.appointments(patient_phone);

CREATE INDEX IF NOT EXISTS idx_appointments_read_status 
ON public.appointments(is_read);

-- Enable RLS for Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments" ON public.appointments 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
CREATE POLICY "Public read appointments" ON public.appointments 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update appointments" ON public.appointments;
CREATE POLICY "Admin update appointments" ON public.appointments 
FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete appointments" ON public.appointments;
CREATE POLICY "Admin delete appointments" ON public.appointments 
FOR DELETE USING (true);

DROP POLICY IF EXISTS "Admin manage all appointments" ON public.appointments;
CREATE POLICY "Admin manage all appointments" ON public.appointments 
FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 3. DOCTOR BLOCKED DATES TABLE (Leaves & Off-Days)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_blocked_dates (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_blocked_dates_lookup 
ON public.doctor_blocked_dates(doctor_id, blocked_date);

ALTER TABLE public.doctor_blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates 
FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. VERIFY / SEED INITIAL SAMPLE APPOINTMENTS (Optional preview)
-- ==============================================================================
INSERT INTO public.appointments (
    reference_code, 
    patient_name, 
    patient_phone, 
    patient_email, 
    doctor_id, 
    department_id, 
    appointment_date, 
    time_slot, 
    symptoms, 
    status,
    is_read
) VALUES 
(
    'KGH-ADS-472299',
    'Rafiqul Islam',
    '01712345678',
    'rafiqul@example.com',
    'dr-diean',
    'dept-prosthodontics',
    '2026-09-25',
    '05:30 PM',
    'Upper molar tooth replacement and crown inquiry.',
    'confirmed',
    false
),
(
    'KGH-FTM-819302',
    'Farhana Akter',
    '01898765432',
    'farhana@example.com',
    'dr-fatema',
    'dept-orthodontics',
    '2026-09-26',
    '06:00 PM',
    'Mild tooth crowding, interested in clear aligners.',
    'confirmed',
    true
)
ON CONFLICT (reference_code) DO NOTHING;
