-- ==============================================================================
-- KGH DENTAL CLINIC: ADD DOCTOR EMAIL AND PATIENT DEMOGRAPHICS (AGE & GENDER)
-- Run this query in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

-- 1. Add doctor email column for appointment email notifications
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Add patient age and gender columns to appointments table
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_age TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_gender TEXT;

-- 3. Optional: Set initial emails for existing doctors if needed
-- (These can also be updated directly from the Admin > Doctors panel anytime)
UPDATE public.doctors SET email = 'dr.diean@kghdental.com' WHERE id = 'dr-diean' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.sanwar@kghdental.com' WHERE id = 'dr-sanwar' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.madhubi@kghdental.com' WHERE id = 'dr-madhubi' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.sharmin@kghdental.com' WHERE id = 'dr-sharmin' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.rafia@kghdental.com' WHERE id = 'dr-rafia' AND email IS NULL;
