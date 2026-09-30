-- ==============================================================================
-- KGH DENTAL CLINIC — SUPABASE COMPREHENSIVE SECURITY HARDENING & RLS LOCKDOWN
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<your-project-id>/sql
-- ==============================================================================

-- 1. LOCK DOWN ADMIN USERS TABLE (Prevent credential dumping & account takeover)
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all open / public policies on admin_users
DROP POLICY IF EXISTS "Public select active admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin manage admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow select admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Public read admin_users" ON public.admin_users;

-- Explicitly revoke public/anon direct table access (Next.js server with SERVICE_ROLE key will query this)
REVOKE ALL ON public.admin_users FROM anon;
REVOKE ALL ON public.admin_users FROM authenticated;

-- Ensure pgcrypto extension is active for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- 2. LOCK DOWN PATIENT APPOINTMENTS (HIPAA / Medical Data Protection)
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop all open public read / update / delete policies
DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admin manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public read appointments" ON public.appointments;

-- Allow public to ONLY insert new appointment reservations
DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
CREATE POLICY "Public insert appointments" ON public.appointments 
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);


-- 3. LOCK DOWN CMS CONTENT TABLES (Prevent unauthorized modifications by visitors)
-- Content is publicly viewable, but only editable via authenticated server / service role

-- 3.1 DOCTORS
ALTER TABLE IF EXISTS public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow public write doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (is_active = true OR is_active IS NULL);

-- 3.2 DEPARTMENTS & SUB-SERVICES
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write departments" ON public.departments;
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.sub_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write sub_services" ON public.sub_services;
DROP POLICY IF EXISTS "Public read sub_services" ON public.sub_services;
CREATE POLICY "Public read sub_services" ON public.sub_services FOR SELECT USING (true);

-- 3.3 CLINIC SETTINGS
ALTER TABLE IF EXISTS public.clinic_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow update clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Public read clinic_settings" ON public.clinic_settings;
CREATE POLICY "Public read clinic_settings" ON public.clinic_settings FOR SELECT USING (true);

-- 3.4 BLOG POSTS
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public insert blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public update blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public delete blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);

-- 3.5 REVIEWS
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

-- 3.6 WHY CHOOSE CARDS
ALTER TABLE IF EXISTS public.why_choose_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write why_choose_cards" ON public.why_choose_cards;
DROP POLICY IF EXISTS "Public read why_choose_cards" ON public.why_choose_cards;
CREATE POLICY "Public read why_choose_cards" ON public.why_choose_cards FOR SELECT USING (true);

-- 3.7 CLINICAL CREED
ALTER TABLE IF EXISTS public.clinical_creed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write clinical_creed" ON public.clinical_creed;
DROP POLICY IF EXISTS "Public read clinical_creed" ON public.clinical_creed;
CREATE POLICY "Public read clinical_creed" ON public.clinical_creed FOR SELECT USING (true);

-- 3.8 GALLERY ITEMS
ALTER TABLE IF EXISTS public.gallery_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);

-- 3.9 MEDIA FILES
ALTER TABLE IF EXISTS public.media_files ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin write media_files" ON public.media_files;
DROP POLICY IF EXISTS "Public read media_files" ON public.media_files;
CREATE POLICY "Public read media_files" ON public.media_files FOR SELECT USING (true);

-- 3.10 DOCTOR BLOCKED DATES (Leaves & Off-days)
ALTER TABLE IF EXISTS public.doctor_blocked_dates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates;
DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates FOR SELECT USING (true);


-- 4. STORAGE BUCKET HARDENING (kgh-media)
-- Public can read assets, but only authenticated server can insert, update, or delete
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public media insert" ON storage.objects;
    DROP POLICY IF EXISTS "Public media update" ON storage.objects;
    DROP POLICY IF EXISTS "Public media delete" ON storage.objects;

    -- Ensure public read remains intact
    DROP POLICY IF EXISTS "Public media read" ON storage.objects;
    CREATE POLICY "Public media read" ON storage.objects FOR SELECT USING (bucket_id = 'kgh-media');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Summary query to verify active RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
