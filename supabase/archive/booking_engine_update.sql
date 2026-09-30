-- ==============================================================================
-- KGH DENTAL - ADVANCED IN-HOUSE BOOKING ENGINE ENHANCEMENT
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Ensure APPOINTMENTS table exists and has all required columns
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
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist (safe for existing tables)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS doctor_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create table for Doctor Blocked Dates (leaves, holidays, emergency blocks)
CREATE TABLE IF NOT EXISTS public.doctor_blocked_dates (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Performance indexes for real-time double booking checks and patient search
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup 
ON public.appointments(doctor_id, appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_appointments_ref_search 
ON public.appointments(reference_code);

CREATE INDEX IF NOT EXISTS idx_appointments_phone_search 
ON public.appointments(patient_phone);

CREATE INDEX IF NOT EXISTS idx_doctor_blocked_dates_lookup 
ON public.doctor_blocked_dates(doctor_id, blocked_date);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_blocked_dates ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies for APPOINTMENTS
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage appointments" ON public.appointments;
CREATE POLICY "Admin manage appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- 6. Access Policies for DOCTOR_BLOCKED_DATES
DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public manage doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Public manage doctor_blocked_dates" ON public.doctor_blocked_dates FOR ALL USING (true) WITH CHECK (true);
