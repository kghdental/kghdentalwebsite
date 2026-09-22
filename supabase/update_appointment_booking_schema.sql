-- ==============================================================================
-- KGH DENTAL: APPOINTMENT BOOKING & TRACKING ENGINE SCHEMA
-- Run this query in Supabase SQL Editor: https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CREATE OR UPDATE appointments TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT,
    department_id TEXT,
    department_name TEXT,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    symptoms TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist even if table was created in an earlier version
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS department_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 3. CREATE OR UPDATE doctor_blocked_dates TABLE (Leaves, Holidays, Off-days)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_blocked_dates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PERFORMANCE INDEXES (Instant Tracking & Slot Collision Prevention)
-- ------------------------------------------------------------------------------
-- Instant appointment lookup for patient tracking (/appointment/track?ref=...)
CREATE INDEX IF NOT EXISTS idx_appointments_ref_code ON public.appointments(reference_code);

-- Search by patient phone
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(patient_phone);

-- Real-time slot collision check (preventing double booking)
CREATE INDEX IF NOT EXISTS idx_appointments_slot_check ON public.appointments(doctor_id, appointment_date, status);

-- Doctor leaves & blocked dates lookup
CREATE INDEX IF NOT EXISTS idx_doctor_blocked_dates_lookup ON public.doctor_blocked_dates(doctor_id, blocked_date);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_blocked_dates ENABLE ROW LEVEL SECURITY;

-- APPOINTMENTS POLICIES:
-- Allow patients to submit appointment bookings online
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments" ON public.appointments 
    FOR INSERT 
    WITH CHECK (true);

-- Allow patients to look up and track their appointment by reference code or phone
DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
CREATE POLICY "Public read appointments" ON public.appointments 
    FOR SELECT 
    USING (true);

-- Allow clinic admin to manage, confirm, and update appointments
DROP POLICY IF EXISTS "Admin manage appointments" ON public.appointments;
CREATE POLICY "Admin manage appointments" ON public.appointments 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- DOCTOR BLOCKED DATES POLICIES:
-- Allow calendar to read doctor leaves & blocked days
DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates 
    FOR SELECT 
    USING (true);

-- Allow clinic admin to block/unblock doctor dates
DROP POLICY IF EXISTS "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);
