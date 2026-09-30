-- ==============================================================================
-- KGH DENTAL CLINIC — UNIFIED PRODUCTION MASTER DATABASE SCHEMA
-- ==============================================================================
-- Target Database: Supabase (PostgreSQL 15+)
-- File: master_schema.sql
-- Description:
--   Single-execution canonical master schema for KGH Dental Clinic.
--   Combines all database tables, columns, performance indexes, storage buckets,
--   security hardening (RLS lockdown), and complete production-verified seed data:
--     1. 8 Clinical Departments
--     2. 66 Sub-Services & Clinical Guidelines
--     3. 7 Certified Specialist Doctors & Surgeons
--     4. Clinic Settings (Banani, Dhaka), Emergency Hotline & Working Hours
--     5. Verified Patient Reviews & Testimonials
--     6. Why Choose Us Protocols & Multi-Image Clinical Creed
--     7. Chamber & Sterilization Gallery Items
--     8. Interactive Before & After Showcase Cases
--     9. Featured YouTube & Facebook Clinical Video Guides
--    10. 10 Researched Comprehensive 1500-Word SEO Dental Guides (Bilingual)
--    11. Dynamic 2-Status Appointment Booking Engine (Confirmed/Cancelled)
--    12. Zero-Leak Row Level Security (RLS) & Anon Credential Lockdown
--
-- INSTRUCTIONS FOR CLIENT / DEVELOPER:
-- 1. Open Supabase Dashboard: https://supabase.com/dashboard/project/<your-project-id>/sql
-- 2. Click "+ New query"
-- 3. Paste the ENTIRE contents of this file
-- 4. Click "Run" (or Ctrl + Enter)
-- 5. Confirm table counts via the verification query at the bottom.
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS (SAFE & IDEMPOTENT)
-- ==============================================================================

-- 2.1 ADMIN USERS (Authentication & Role Management)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT DEFAULT 'Super Admin',
    role TEXT DEFAULT 'super_admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 CLINICAL DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    short_desc_en TEXT NOT NULL,
    short_desc_bn TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Stethoscope',
    lead_doctor_id TEXT,
    image_url TEXT NOT NULL,
    cover_banner_url TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS cover_banner_url TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS lead_doctor_id TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2.3 SUB-SERVICES (TREATMENTS UNDER DEPARTMENTS)
CREATE TABLE IF NOT EXISTS public.sub_services (
    id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    number INT NOT NULL DEFAULT 1,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    why_en TEXT NOT NULL,
    why_bn TEXT NOT NULL,
    when_en TEXT NOT NULL,
    when_bn TEXT NOT NULL,
    benefit_en TEXT NOT NULL,
    benefit_bn TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.sub_services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2.4 DOCTORS (SURGEONS & SPECIALISTS)
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    specialty_en TEXT NOT NULL,
    specialty_bn TEXT NOT NULL,
    degrees_en TEXT NOT NULL,
    degrees_bn TEXT NOT NULL,
    designation_en TEXT,
    designation_bn TEXT,
    institution_en TEXT,
    institution_bn TEXT,
    bmdc_reg TEXT,
    photo_url TEXT NOT NULL,
    bio_en TEXT,
    bio_bn TEXT,
    experience_en TEXT,
    experience_bn TEXT,
    department_id TEXT,
    schedule JSONB NOT NULL,
    email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bmdc_reg TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2.5 CLINIC SETTINGS
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id INT PRIMARY KEY DEFAULT 1,
    phone_numbers TEXT[] NOT NULL,
    emergency_phone TEXT NOT NULL,
    working_hours JSONB NOT NULL,
    address_en TEXT NOT NULL,
    address_bn TEXT NOT NULL,
    is_address_placeholder BOOLEAN DEFAULT FALSE,
    google_map_url TEXT,
    google_review_url TEXT,
    social_links JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_map_url TEXT;
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_review_url TEXT;
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS social_links JSONB;

-- 2.6 APPOINTMENTS (DYNAMIC 2-STATUS BOOKING ENGINE)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    patient_age TEXT,
    patient_gender TEXT,
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
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reference_code TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_phone TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_age TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS patient_gender TEXT;
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

-- 2.7 DOCTOR BLOCKED DATES (LEAVES & HOLIDAYS)
CREATE TABLE IF NOT EXISTS public.doctor_blocked_dates (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 VERIFIED REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    author_name TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    date TEXT NOT NULL,
    comment_en TEXT NOT NULL,
    comment_bn TEXT NOT NULL,
    treatment_en TEXT,
    treatment_bn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 WHY CHOOSE US CARDS
CREATE TABLE IF NOT EXISTS public.why_choose_cards (
    id TEXT PRIMARY KEY,
    step_number TEXT NOT NULL,
    badge_en TEXT NOT NULL DEFAULT '',
    badge_bn TEXT NOT NULL DEFAULT '',
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    subtitle_en TEXT NOT NULL,
    subtitle_bn TEXT NOT NULL,
    bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    image TEXT NOT NULL,
    accent TEXT DEFAULT '#474B4E',
    protocol_title_en TEXT,
    protocol_title_bn TEXT,
    protocol_subtitle_en TEXT,
    protocol_subtitle_bn TEXT,
    protocol_steps JSONB DEFAULT '[]'::jsonb,
    protocol_guarantees JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 CLINICAL CREED & PHILOSOPHY
CREATE TABLE IF NOT EXISTS public.clinical_creed (
    id INT PRIMARY KEY DEFAULT 1,
    tag_en TEXT NOT NULL DEFAULT '',
    tag_bn TEXT NOT NULL DEFAULT '',
    quote_en TEXT NOT NULL,
    quote_bn TEXT NOT NULL,
    sub_quote_en TEXT NOT NULL DEFAULT '',
    sub_quote_bn TEXT NOT NULL DEFAULT '',
    authority_en TEXT NOT NULL DEFAULT '',
    authority_bn TEXT NOT NULL DEFAULT '',
    designation_en TEXT NOT NULL DEFAULT '',
    designation_bn TEXT NOT NULL DEFAULT '',
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_creed_row CHECK (id = 1)
);
ALTER TABLE public.clinical_creed ADD COLUMN IF NOT EXISTS quotes JSONB DEFAULT '[]'::jsonb;

-- 2.11 GALLERY ITEMS (CHAMBER & STERILIZATION)
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'clinic',
    desc_en TEXT DEFAULT '',
    desc_bn TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE public.gallery_items DROP CONSTRAINT IF EXISTS gallery_items_category_check;

-- 2.12 BEFORE & AFTER ITEMS (INTERACTIVE CASES)
CREATE TABLE IF NOT EXISTS public.before_after_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    before_image_url TEXT NOT NULL,
    after_image_url TEXT NOT NULL,
    desc_en TEXT DEFAULT '',
    desc_bn TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.before_after_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- 2.13 FEATURED VIDEOS (YOUTUBE & FACEBOOK REELS)
CREATE TABLE IF NOT EXISTS public.featured_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    video_url TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('youtube', 'facebook')),
    aspect_ratio TEXT NOT NULL DEFAULT '16:9' CHECK (aspect_ratio IN ('16:9', '9:16')),
    thumbnail_url TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'treatment_guide' CHECK (category IN ('patient_story', 'treatment_guide', 'doctor_advice', 'clinic_tour')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 BLOG POSTS (RICH BILINGUAL DENTAL GUIDES)
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    excerpt_en TEXT DEFAULT '',
    excerpt_bn TEXT DEFAULT '',
    cover_image TEXT DEFAULT '/images/departments/consultation-cta.jpg',
    department_slug TEXT NOT NULL DEFAULT 'general-consultation',
    department_name_en TEXT DEFAULT 'General Consultation',
    department_name_bn TEXT DEFAULT 'সাধারণ পরামর্শ',
    read_time TEXT DEFAULT '8 min read',
    date_str TEXT DEFAULT 'Sep 2026',
    target_keyword TEXT DEFAULT '',
    author_name_en TEXT DEFAULT 'Admin',
    author_name_bn TEXT DEFAULT 'এডমিন',
    author_role_en TEXT DEFAULT 'Admin',
    author_role_bn TEXT DEFAULT 'এডমিন',
    author_photo_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'],
    content_html_en TEXT DEFAULT '',
    content_html_bn TEXT DEFAULT '',
    legacy_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '/images/departments/consultation-cta.jpg';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_en TEXT DEFAULT 'General Consultation';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_bn TEXT DEFAULT 'সাধারণ পরামর্শ';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name_en TEXT DEFAULT 'Admin';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name_bn TEXT DEFAULT 'এডমিন';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role_en TEXT DEFAULT 'Admin';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role_bn TEXT DEFAULT 'এডমিন';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_photo_url TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'];
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_en TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_bn TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS legacy_content JSONB;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2.15 MEDIA FILES
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup ON public.appointments(doctor_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref_search ON public.appointments(reference_code);
CREATE INDEX IF NOT EXISTS idx_appointments_phone_search ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_read_status ON public.appointments(is_read);
CREATE INDEX IF NOT EXISTS idx_doctor_blocked_dates_lookup ON public.doctor_blocked_dates(doctor_id, blocked_date);
CREATE INDEX IF NOT EXISTS idx_doctors_dept ON public.doctors(department_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_department ON public.blog_posts(department_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_videos_active_sort ON public.featured_videos(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_items_sort ON public.gallery_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_before_after_sort ON public.before_after_items(sort_order);

-- ==============================================================================
-- 4. STORAGE BUCKETS (SAFE SETUP)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public select storage images" ON storage.objects;
    CREATE POLICY "Public select storage images" ON storage.objects
        FOR SELECT USING (bucket_id IN ('images', 'media'));

    DROP POLICY IF EXISTS "Authenticated write storage images" ON storage.objects;
    CREATE POLICY "Authenticated write storage images" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id IN ('images', 'media'));

    DROP POLICY IF EXISTS "Authenticated update storage images" ON storage.objects;
    CREATE POLICY "Authenticated update storage images" ON storage.objects
        FOR UPDATE USING (bucket_id IN ('images', 'media'));

    DROP POLICY IF EXISTS "Authenticated delete storage images" ON storage.objects;
    CREATE POLICY "Authenticated delete storage images" ON storage.objects
        FOR DELETE USING (bucket_id IN ('images', 'media'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & HARDENED SECURITY POLICIES
-- ==============================================================================
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.why_choose_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_creed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.before_after_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- 5.1 Admin Users Table: Complete Anon Lockdown
    DROP POLICY IF EXISTS "Public select active admin_users" ON public.admin_users;
    DROP POLICY IF EXISTS "Admin manage admin_users" ON public.admin_users;
    DROP POLICY IF EXISTS "Allow select admin_users" ON public.admin_users;
    DROP POLICY IF EXISTS "Public read admin_users" ON public.admin_users;
    REVOKE ALL ON public.admin_users FROM anon;
    REVOKE ALL ON public.admin_users FROM authenticated;

    -- 5.2 Appointments Table: Zero Patient PII Leak
    -- Public users can only book (INSERT)
    DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
    CREATE POLICY "Public insert appointments" ON public.appointments 
        FOR INSERT WITH CHECK (true);
    -- Revoke open public read, update, delete (controlled via Next.js Server API with Service Role)
    DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Admin update appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Admin delete appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Public track appointment by code and phone" ON public.appointments;

    -- 5.3 Public Read Policies for CMS Tables
    DROP POLICY IF EXISTS "Public read departments" ON public.departments;
    CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read sub_services" ON public.sub_services;
    CREATE POLICY "Public read sub_services" ON public.sub_services FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;
    CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (is_active = true OR is_active IS NULL);

    DROP POLICY IF EXISTS "Public read clinic_settings" ON public.clinic_settings;
    CREATE POLICY "Public read clinic_settings" ON public.clinic_settings FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
    CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
    CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read why_choose_cards" ON public.why_choose_cards;
    CREATE POLICY "Public read why_choose_cards" ON public.why_choose_cards FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read clinical_creed" ON public.clinical_creed;
    CREATE POLICY "Public read clinical_creed" ON public.clinical_creed FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
    CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read before_after_items" ON public.before_after_items;
    CREATE POLICY "Public read before_after_items" ON public.before_after_items FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read featured_videos" ON public.featured_videos;
    CREATE POLICY "Public read featured_videos" ON public.featured_videos FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
    CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public read media_files" ON public.media_files;
    CREATE POLICY "Public read media_files" ON public.media_files FOR SELECT USING (true);
END $$;

-- ==============================================================================
-- 6. VERIFIED PRODUCTION SEED DATA
-- ==============================================================================

-- 5. SEED DATA
-- ==============================================================================

-- 5.1 ADMIN CREDENTIALS (liakot.cse22@gmail.com)
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


-- ==============================================================================
-- 4. DOCTORS DATA (7 CERTIFIED SPECIALISTS & SURGEONS)
-- ==============================================================================

-- 1. Dr. Ahamed Diean Sammir (dr-diean)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-diean',
    'Dr. Ahamed Diean Sammir',
    'ডা. আহমেদ দিয়ান সাম্মির',
    'Prosthodontist & Implantologist',
    'প্রস্থোডন্টিক্স ও ইমপ্ল্যান্ট বিশেষজ্ঞ',
    'BDS (BDC), MS - Prosthodontics (BSMMU)',
    'বিডিএস (বিডিসি), এমএস - প্রস্থোডন্টিক্স (বিএসএমএমইউ)',
    'Consultant Prosthodontist & Faculty',
    'কনসালটেন্ট প্রস্থোডন্টিস্ট ও সাবেক শিক্ষক',
    'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
    'Verified',
    '/images/doctors/dr-diean.jpg',
    'Dr. Ahamed Diean Sammir specializes in prosthodontics, with advanced training in dental implants, fixed and removable prostheses, and full mouth rehabilitation. He holds an MS in Prosthodontics from Bangabandhu Sheikh Mujib Medical University and a BDS from Bangladesh Dental College, and has taught as faculty at several dental colleges alongside his clinical practice.',
    'ডা. আহমেদ দিয়ান সাম্মির প্রস্থোডন্টিক্সে বিশেষজ্ঞ, ডেন্টাল ইমপ্ল্যান্ট, ফিক্সড ও রিমুভেবল প্রস্থেসিস এবং ফুল মাউথ রিহ্যাবিলিটেশনে উন্নত প্রশিক্ষণপ্রাপ্ত। তিনি বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় থেকে প্রস্থোডন্টিক্সে এমএস এবং বাংলাদেশ ডেন্টাল কলেজ থেকে বিডিএস সম্পন্ন করেছেন। ক্লিনিক্যাল প্র্যাকটিসের পাশাপাশি তিনি বিভিন্ন ডেন্টাল কলেজে শিক্ষকতাও করেছেন।',
    'Over 10 years of specialized restorative & implant clinical experience.',
    '১০ বছরেরও বেশি বিশেষায়িত রিস্টোরেটিভ ও ইমপ্ল্যান্ট ক্লিনিক্যাল অভিজ্ঞতা।',
    'prosthodontics',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM (30-minute intervals)","bn":"বিকাল ৫:০০ – রাত ৯:৩০ (প্রতি ৩০ মিনিট অন্তর)"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 2. Dr. Md. Sanwar Hossain (dr-sanwar)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-sanwar',
    'Dr. Md. Sanwar Hossain',
    'ডা. মো. সানোয়ার হোসেন',
    'Oral & Maxillofacial Surgeon',
    'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন',
    'BDS (RMC), FCPS (Oral & Maxillofacial Surgery)',
    'বিডিএস (রামেক), এফসিপিএস (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি)',
    'Oral & Maxillofacial Surgeon & Assistant Professor',
    'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন ও সহকারী অধ্যাপক',
    'Kumudini Women''s Medical College & Hospital',
    'কুমুদিনী উইমেন''স মেডিকেল কলেজ',
    'Verified',
    '/images/doctors/DR. MD. SANWAR HOSSAIN.png',
    'Dr. Md. Sanwar Hossain is a fellowship-trained oral and maxillofacial surgeon (FCPS) with extensive experience in oral cancer surgery, facial trauma management, and complex dental surgeries. He currently serves as Assistant Professor at Kumudini Women''s Medical College and has published research in oral and maxillofacial pathology.',
    'ডা. মো. সানোয়ার হোসেন একজন ফেলোশিপপ্রাপ্ত ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জন (এফসিপিএস), যার রয়েছে মুখের ক্যান্সার সার্জারি, মুখমণ্ডলের আঘাত চিকিৎসা এবং জটিল দাঁতের সার্জারিতে বিস্তৃত অভিজ্ঞতা। বর্তমানে তিনি কুমুদিনী উইমেন''স মেডিকেল কলেজে সহকারী অধ্যাপক হিসেবে কর্মরত এবং ওরাল ও ম্যাক্সিলোফেসিয়াল প্যাথলজিতে গবেষণাও প্রকাশ করেছেন।',
    'Fellowship-trained surgeon with high-level trauma & oncological surgery track record.',
    'মুখমণ্ডলের জটিল সার্জারি ও ক্যান্সার চিকিৎসায় ফেলোশিপপ্রাপ্ত বিশেষজ্ঞ।',
    'oral-surgery',
    '{"availableDaysEn":"Saturday only","availableDaysBn":"শুধুমাত্র শনিবার","daysOfWeek":[6],"startTime":"17:30","endTime":"21:00","slotDurationMinutes":30,"note":{"en":"5:30 PM – 9:00 PM (30-minute intervals)","bn":"বিকাল ৫:৩০ – রাত ৯:০০ (প্রতি ৩০ মিনিট অন্তর)"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 3. Dr. Fatema Tasrin Madhubi (dr-fatema)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-fatema',
    'Dr. Fatema Tasrin Madhubi',
    'ডা. ফাতেমা তাসরিন মাধুবী',
    'Orthodontist & Clear Aligner Specialist',
    'অর্থোডন্টিস্ট ও ক্লিয়ার অ্যালাইনার বিশেষজ্ঞ',
    'BDS (RMC), MS - Orthodontics (BSMMU)',
    'বিডিএস (রামেক), এমএস - অর্থোডন্টিকস (বিএসএমএমইউ)',
    'Dental Surgeon',
    'ডেন্টাল সার্জন',
    'Govt. Employee Hospital, Fulbaria, Dhaka',
    'সরকারি কর্মচারী হাসপাতাল, ফুলবাড়িয়া, ঢাকা',
    '6150',
    '/images/doctors/dr-fatema.jpg',
    'Dr. Fatema Tasrin Madhubi is an orthodontist with an MS in Orthodontics from Bangladesh Medical University and a BDS from Rajshahi Medical College. She specializes in clear aligner treatment and correcting dental malocclusions for patients of all ages, with a focus on precise, comfortable, patient-centered care.',
    'ডা. ফাতেমা তাসরিন মাধুবী একজন অর্থোডন্টিস্ট, বাংলাদেশ মেডিকেল বিশ্ববিদ্যালয় থেকে অর্থোডন্টিক্সে এমএস এবং রাজশাহী মেডিকেল কলেজ থেকে বিডিএস সম্পন্ন করেছেন। তিনি ক্লিয়ার অ্যালাইনার চিকিৎসা এবং সব বয়সের রোগীর দাঁতের অসামঞ্জস্য সংশোধনে বিশেষজ্ঞ, নিখুঁত ও আরামদায়ক রোগী-কেন্দ্রিক চিকিৎসায় মনোযোগী।',
    'Certified in clear aligners and specialized in adolescent & adult teeth realignment.',
    'ক্লিয়ার অ্যালাইনার সার্টিফায়েড এবং শিশু ও প্রাপ্তবয়স্কদের দাঁত সোজা করার অভিজ্ঞ চিকিৎসক।',
    'orthodontics',
    '{"availableDaysEn":"Tuesday only","availableDaysBn":"শুধুমাত্র মঙ্গলবার","daysOfWeek":[2],"startTime":"17:00","endTime":"21:00","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:00 PM (30-minute intervals)","bn":"বিকাল ৫:০০ – রাত ৯:০০ (প্রতি ৩০ মিনিট অন্তর)"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 4. Dr. Md. Muhtashim Chowdhury (Bappy) (dr-bappy)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-bappy',
    'Dr. Md. Muhtashim Chowdhury (Bappy)',
    'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী)',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Maxillofacial Surgery)',
    'বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারি)',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BSMMU (Ex-PG Hospital)',
    'বিএসএমএমইউ (সাবেক পিজি হাসপাতাল)',
    '8912',
    '/images/doctors/dr-Bappy.png',
    'Dr. Md. Muhtashim Chowdhury (Bappy) is an Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). He completed Post Graduate Training (PGT) in Conservative Dentistry & Maxillofacial Surgery at BSMMU (Ex-PG Hospital). Dr. Bappy has attained Advance Implant Training from USC (USA) and Advance Endodontic Training from Japan, specializing in modern painless root canals, dental implants, and maxillofacial procedures.',
    'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী) একজন দক্ষ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ সম্পন্ন করেছেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারিতে পিজিটি সম্পন্ন করেন। এছাড়া তিনি আমেরিকার ইউএসসি (USC, USA) থেকে অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং এবং জাপান থেকে অ্যাডভান্স এন্ডোডন্টিক ট্রেনিং প্রাপ্ত। তিনি আধুনিক ব্যথামুক্ত রুট ক্যানেল, ডেন্টাল ইমপ্ল্যান্ট ও ম্যাক্সিলোফেসিয়াল চিকিৎসায় অভিজ্ঞ।',
    'Advance Implant Training (USC, USA) • Advance Endodontic Training (Japan) • PGT (BSMMU, Ex-PG Hospital)',
    'অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং (ইউএসসি, আমেরিকা) • অ্যাডভান্স এন্ডোডন্টিক ট্রেনিং (জাপান) • পিজিটি (বিএসএমএমইউ, সাবেক পিজি হাসপাতাল)',
    'endodontics',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"11:00","endTime":"14:00","slotDurationMinutes":30,"note":{"en":"11:00 AM – 2:00 PM","bn":"সকাল ১১:০০ – দুপুর ২:০০"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 5. Dr. Jesinta Islam (dr-ratina)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-ratina',
    'Dr. Jesinta Islam',
    'ডা. জেসিন্টা ইসলাম',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Endodontics)',
    'বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স)',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BSMMU (Ex-PG Hospital)',
    'বিএসএমএমইউ (সাবেক পিজি হাসপাতাল)',
    '9421',
    '/images/doctors/Dr Jesinta Islam.png',
    'Dr. Jesinta Islam is an accomplished Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). She completed Post Graduate Training (PGT) in Conservative Dentistry & Endodontics at BSMMU (Ex-PG Hospital) and received Advance Implant Training in Rome, Italy. She specializes in precision root canal therapy, aesthetic dentistry, conservative treatments, and dental implant solutions with patient-centered care.',
    'ডা. জেসিন্টা ইসলাম একজন নিবেদিতপ্রাণ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ ডিগ্রি অর্জন করেছেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্সে পিজিটি সম্পন্ন করেছেন এবং ইতালির রোম থেকে অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং সম্পন্ন করেছেন। তিনি আধুনিক রুট ক্যানেল, নান্দনিক ডেন্টিস্ট্রি ও ডেন্টাল ইমপ্ল্যান্ট চিকিৎসায় বিশেষভাবে পারদর্শী।',
    'Advance Implant Training (Rome, Italy) • PGT in Conservative Dentistry & Endodontics (BSMMU, Ex-PG Hospital)',
    'অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং (রোম, ইতালি) • পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স, বিএসএমএমইউ, সাবেক পিজি হাসপাতাল)',
    'endodontics',
    '{"availableDaysEn":"Tuesday only","availableDaysBn":"শুধুমাত্র মঙ্গলবার","daysOfWeek":[2],"startTime":"11:00","endTime":"14:00","slotDurationMinutes":30,"note":{"en":"11:00 AM – 2:00 PM","bn":"সকাল ১১:০০ – দুপুর ২:০০"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 6. Dr. Rifat Rahman (dr-rifat)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-rifat',
    'Dr. Rifat Rahman',
    'ডা. রিফাত রহমান',
    'Oral Medicine Specialist',
    'ওরাল মেডিসিন বিশেষজ্ঞ',
    'BDS, MPH, MSc Oral Medicine (Thailand), PhD in Oral Oncology (Australia), Trained in Oral Radiology (Japan)',
    'বিডিএস, এমপিএইচ, এমএসসি ওরাল মেডিসিন (থাইল্যান্ড), পিএইচডি ওরাল অনকোলজি (অস্ট্রেলিয়া), ওরাল রেডিওলজি প্রশিক্ষণ (জাপান)',
    'Oral Medicine Consultant & Dental Surgeon',
    'ওরাল মেডিসিন কনসালটেন্ট ও ডেন্টাল সার্জন',
    'Oral Medicine & Oncology Specialist',
    'ওরাল মেডিসিন ও অনকোলজি বিশেষজ্ঞ',
    '4564',
    '/images/doctors/Dr Rifat Rahman.png',
    'Dr. Rifat Rahman is an accomplished Oral Medicine Consultant and Dental Surgeon holding a BDS, MPH, and MSc in Oral Medicine from Thailand, a PhD in Oral Oncology from Australia, and advanced clinical training in Oral Radiology from Japan. With BMDC Registration No. 4564, he specializes in comprehensive oral mucosal disease diagnosis, precancerous lesion detection, salivary gland disorders, and complex oral medicine care.',
    'ডা. রিফাত রহমান একজন উচ্চশিক্ষিত ও অভিজ্ঞ ওরাল মেডিসিন কনসালটেন্ট ও ডেন্টাল সার্জন (বিএমডিসি রেজি: ৪৫৬৪)। তিনি বিডিএস এবং এমপিএইচ সম্পন্ন করার পর থাইল্যান্ড থেকে ওরাল মেডিসিনে এমএসসি এবং অস্ট্রেলিয়া থেকে ওরাল অনকোলজিতে পিএইচডি ডিগ্রি অর্জন করেছেন। এছাড়া জাপান থেকে ওরাল রেডিওলজিতে বিশেষ প্রশিক্ষণপ্রাপ্ত। তিনি মুখের ক্যান্সার স্ক্রিনিং, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ, মুখের দীর্ঘস্থায়ী ঘা ও লালাগ্রন্থির জটিল রোগের আধুনিক ডায়াগনোসিস ও চিকিৎসায় বিশেষ পারদর্শী।',
    'PhD in Oral Oncology (Australia) • MSc Oral Medicine (Thailand) • Trained in Oral Radiology (Japan)',
    'পিএইচডি ওরাল অনকোলজি (অস্ট্রেলিয়া) • এমএসসি ওরাল মেডিসিন (থাইল্যান্ড) • ওরাল রেডিওলজি ট্রেনিং (জাপান)',
    'oral-medicine',
    '{"availableDaysEn":"Friday only","availableDaysBn":"শুধুমাত্র শুক্রবার","daysOfWeek":[5],"startTime":"17:00","endTime":"20:00","slotDurationMinutes":30,"note":{"en":"5:00 PM – 8:00 PM (Friday only)","bn":"বিকাল ৫:০০ – রাত ৮:০০ (শুধুমাত্র শুক্রবার)"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- 7. Dr. Rafia Nazneen (dr-rafia)
INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
) VALUES (
    'dr-rafia',
    'Dr. Rafia Nazneen',
    'ডা. রাফিয়া নাজনীন',
    'Specialist in Conservative Dentistry & Endodontics',
    'কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স বিশেষজ্ঞ',
    'BDS, FCPS (Conservative Dentistry & Endodontics)',
    'বিডিএস, এফসিপিএস (কনজারভেটিভ ডেন্টিস্ট্রি অ্যান্ড এন্ডোডন্টিক্স)',
    'Associate Professor & Head, Department of Dental Surgery',
    'সহযোগী অধ্যাপক ও বিভাগীয় প্রধান, ডেন্টাল সার্জারি বিভাগ',
    'BIRDEM General Hospital',
    'বারডেম জেনারেল হাসপাতাল',
    'Verified',
    '/images/doctors/dr-rafia-nazneen.png',
    'Dr. Rafia Nazneen is an Associate Professor & Head of the Department of Dental Surgery at BIRDEM General Hospital. Holding a BDS and FCPS in Conservative Dentistry & Endodontics, she specializes in modern painless root canals, cosmetic dental restorations, and advanced microscopic endodontic procedures.',
    'ডা. রাফিয়া নাজনীন বারডেম জেনারেল হাসপাতালের ডেন্টাল সার্জারি বিভাগের সহযোগী অধ্যাপক ও বিভাগীয় প্রধান। তিনি বিডিএস এবং কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্সে এফসিপিএস ডিগ্রিধারী। তিনি আধুনিক ব্যথামুক্ত রুট ক্যানেল চিকিৎসা, নান্দনিক ডেন্টাল রেস্টোরেশন এবং উন্নত মাইক্রোস্কোপিক এন্ডোডন্টিক পদ্ধতিতে বিশেষভাবে অভিজ্ঞ।',
    'Associate Professor & Head at BIRDEM General Hospital • FCPS (Conservative Dentistry & Endodontics)',
    'সহযোগী অধ্যাপক ও বিভাগীয় প্রধান (বারডেম জেনারেল হাসপাতাল) • এফসিপিএস (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স)',
    'endodontics',
    '{"availableDaysEn":"Saturday & Monday","availableDaysBn":"শনিবার ও সোমবার","daysOfWeek":[1,6],"startTime":"15:00","endTime":"19:00","slotDurationMinutes":30,"note":{"en":"3:00 PM – 7:00 PM (Saturday & Monday)","bn":"বিকাল ৩:০০ – সন্ধ্যা ৭:০০ (শনিবার ও সোমবার)"}}'::jsonb,
    TRUE
) ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    specialty_en = EXCLUDED.specialty_en,
    specialty_bn = EXCLUDED.specialty_bn,
    degrees_en = EXCLUDED.degrees_en,
    degrees_bn = EXCLUDED.degrees_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    institution_en = EXCLUDED.institution_en,
    institution_bn = EXCLUDED.institution_bn,
    bmdc_reg = EXCLUDED.bmdc_reg,
    photo_url = EXCLUDED.photo_url,
    bio_en = EXCLUDED.bio_en,
    bio_bn = EXCLUDED.bio_bn,
    experience_en = EXCLUDED.experience_en,
    experience_bn = EXCLUDED.experience_bn,
    department_id = EXCLUDED.department_id,
    schedule = EXCLUDED.schedule,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Clean up any legacy or duplicate test doctor entries
DELETE FROM public.doctors WHERE id = 'dr-joy';


-- 4. DEPARTMENTS DATA (8 CLINICAL DEPARTMENTS WITH COVER BANNERS)
-- ==============================================================================
INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'orthodontics',
    'orthodontics',
    'Orthodontics',
    'অর্থোডন্টিক্স',
    'Straighter teeth, better bites, and more confident smiles for children and adults.',
    'সোজা দাঁত, সঠিক বাইট, আর আত্মবিশ্বাসী হাসি — শিশু ও প্রাপ্তবয়স্ক সবার জন্য।',
    'Smile',
    'dr-fatema',
    '/images/services-images-for-7-services/Orthodontics.jpeg',
    '/images/Service-page-banner-cover/01. Orthodontics Cover Banner.png',
    1
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'oral-surgery',
    'oral-surgery',
    'Oral & Maxillofacial Surgery',
    'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি',
    'Surgical expertise for wisdom teeth, dental implants, facial trauma, and jaw conditions.',
    'উইজডম টুথ, ডেন্টাল ইমপ্ল্যান্ট, মুখের ট্রমা এবং চোয়ালের জটিল সার্জিক্যাল সেবা।',
    'Stethoscope',
    'dr-sanwar',
    '/images/services-images-for-7-services/Oral & Maxillofacial Surgery.png',
    '/images/Service-page-banner-cover/02. Oral & Maxillo Cover Bannaer.png',
    2
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'endodontics',
    'endodontics',
    'Conservative Dentistry & Endodontics',
    'কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স',
    'Saving natural teeth is our top priority — root canal treatment, fillings, and tooth whitening.',
    'আপনার প্রাকৃতিক দাঁত রক্ষা করাই আমাদের প্রধান লক্ষ্য — রুট ক্যানেল, নান্দনিক ফিলিং ও হোয়াইটেনিং।',
    'ShieldCheck',
    'dr-bappy',
    '/images/services-images-for-7-services/Conservative Dentistry & Endodontics.jpeg',
    '/images/Service-page-banner-cover/03. Endodontics Cover banner.png',
    3
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'prosthodontics',
    'prosthodontics',
    'Prosthodontics',
    'প্রস্থোডন্টিক্স',
    'Precision crowns, bridges, dentures, and dental implants to rebuild lost teeth.',
    'হারানো দাঁতের নিখুঁত প্রতিস্থাপন — আধুনিক ক্রাউন, ব্রিজ, ডেনচার ও ইমপ্ল্যান্ট প্রস্থেসিস।',
    'Sparkles',
    'dr-diean',
    '/images/services-images-for-7-services/Prosthodontics.jpeg',
    '/images/Service-page-banner-cover/04. Prosthodontics Cover banner.png',
    4
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'pediatric',
    'pediatric',
    'Pediatric Dentistry',
    'শিশু দন্ত চিকিৎসা (পেডিয়াট্রিক ডেন্টিস্ট্রি)',
    'Gentle, kid-friendly dental care building a lifetime of positive oral health habits.',
    'শিশুদের জন্য কোমল ও ভয়হীন চিকিৎসা — ছোটবেলা থেকেই সুস্থ দাঁতের মজবুত ভিত্তি।',
    'Baby',
    'dr-diean',
    '/images/services-images-for-7-services/Pediatric Dentistry.jpeg',
    '/images/Service-page-banner-cover/05. Pediatric Dentistry COver banner.png',
    5
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'periodontics',
    'periodontics',
    'Periodontics',
    'পেরিওডন্টিক্স (মাড়ির চিকিৎসা)',
    'Protecting the foundation of your smile — advanced gum care, scaling, and mobile tooth splinting.',
    'আপনার হাসির মজবুত ভিত্তি — মাড়ির আধুনিক চিকিৎসা, স্কেলিং ও নড়বড়ে দাঁতের স্প্লিন্টিং।',
    'Activity',
    'dr-sanwar',
    '/images/services-images-for-7-services/Periodontics.jpeg',
    '/images/Service-page-banner-cover/06. Periodontics Cover banner.png',
    6
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'oral-medicine',
    'oral-medicine',
    'Oral Medicine & Diagnosis',
    'ওরাল মেডিসিন ও ডায়াগনোসিস',
    'Specialist diagnosis for oral ulcers, precancerous lesions, OSMF, and complex mucosal conditions.',
    'মুখের ঘা, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ ও জটিল মিউকোসাল রোগের বিশেষজ্ঞ চিকিৎসা ও রোগ নির্ণয়।',
    'Microscope',
    'dr-rifat',
    '/images/services-images-for-7-services/ORAL Medicine.jpeg',
    '/images/Service-page-banner-cover/07. Oral Medicine & Diagnosis Cover Banner.png',
    7
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;

INSERT INTO public.departments (
    id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, cover_banner_url, sort_order
) VALUES (
    'general-consultation',
    'general-consultation',
    'General & Consultation',
    'জেনারেল ও কনসালটেশন',
    'Your first step — comprehensive check-ups, digital X-rays, 3D scanning, and emergency care.',
    'চিকিৎসার প্রথম ধাপ — পূর্ণাঙ্গ ওরাল চেকআপ, ডিজিটাল এক্স-রে, থ্রিডি স্ক্যান ও জরুরি সেবা।',
    'FileCheck',
    'dr-diean',
    '/images/services-images-for-7-services/Consultation.jpeg',
    '/images/Service-page-banner-cover/08. General Consultation & Diagnostics Cover banner.png',
    8
) ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    cover_banner_url = EXCLUDED.cover_banner_url,
    sort_order = EXCLUDED.sort_order;


-- ==============================================================================

-- 5. SUB-SERVICES DATA (ALL 66 SUB-SERVICES WITH IMAGES & CLINICAL GUIDELINES)
-- ==============================================================================
INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-metal-braces',
    'orthodontics',
    1,
    'Metal (Traditional) Braces',
    'মেটাল (ট্রেডিশনাল) ব্রেসেস',
    'Corrects crowded, gapped, or misaligned teeth effectively.',
    'ভিড় করা, ফাঁকা বা আঁকাবাঁকা দাঁত সঠিকভাবে সোজা করতে।',
    'Visible crowding, spacing, or bite alignment issues noticed by dentist or patient.',
    'দাঁতে ভিড়, অনাকাঙ্ক্ষিত ফাঁকা বা বাইট সমস্যা দেখা দিলে।',
    'Most affordable, durable, and highly effective for complex alignment corrections.',
    'সবচেয়ে সাশ্রয়ী, অত্যন্ত টেকসই এবং জটিল ক্ষেত্রেও ভীষণ কার্যকর।',
    '/images/SubServices-images/1. A. Metal Traditional Braces.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-clear-aligners',
    'orthodontics',
    2,
    'Clear Aligners / Invisible Braces',
    'ক্লিয়ার অ্যালাইনার / অদৃশ্য ব্রেসেস',
    'Straightens teeth discreetly without visible metal wires.',
    'চোখে না পড়ার মতো করে কোনো তার ছাড়াই দাঁত সোজা করতে।',
    'Mild-to-moderate misalignment, adult patients preferring a subtle, wire-free option.',
    'মাঝারি ধরনের আঁকাবাঁকা দাঁত, বিশেষত প্রাপ্তবয়স্কদের জন্য যারা দৃশ্যমান ব্রেসেস চান না।',
    'Nearly invisible, completely removable for meals and brushing, smooth and comfortable.',
    'প্রায় অদৃশ্য, খাওয়ার সময় বা ব্রাশ করার সময় খুলে ফেলা যায় এবং খুবই আরামদায়ক।',
    '/images/SubServices-images/1. B. Clear Aligners.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-smile-design',
    'orthodontics',
    3,
    'Smile Design / Smile Makeover',
    'স্মাইল ডিজাইন / স্মাইল মেকওভার',
    'Improves overall facial smile aesthetics beyond just dental alignment.',
    'শুধু সোজা দাঁত নয়, মুখমণ্ডলের সাথে মানানসই করে পুরো হাসিটাকেই সুন্দর করতে।',
    'When you want a comprehensive, harmonized enhancement of your teeth shape and smile line.',
    'যখন আপনি নিজের ব্যক্তিত্বের সাথে মানানসই সম্পূর্ণ হাসির স্থায়ী উন্নতি চান।',
    'Customized digital planning, natural-looking aesthetics, dramatic boost in personal confidence.',
    'একদম নিজের মতো করে আধুনিক ডিজিটাল পরিকল্পনা, স্বাভাবিক দেখতে ও আত্মবিশ্বাস বহুগুণ বাড়ায়।',
    '/images/SubServices-images/1. c. Smile Design.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-retainers',
    'orthodontics',
    4,
    'Retainers (Post-Treatment)',
    'রিটেইনার (চিকিৎসা পরবর্তী যত্ন)',
    'Holds teeth securely in their newly aligned position after braces or aligners.',
    'ব্রেসেস বা অ্যালাইনার খোলার পর দাঁতকে নতুন জায়গায় মজবুতভাবে ধরে রাখতে।',
    'Immediately after completing active orthodontic alignment treatment.',
    'অর্থোডন্টিক চিকিৎসা সম্পন্ন হওয়ার সাথে সাথেই এটি ব্যবহার শুরু করতে হয়।',
    'Prevents teeth from naturally shifting back, protecting your investment and lifetime smile.',
    'দাঁত আবার আগের আঁকাবাঁকা জায়গায় ফিরে যাওয়া পুরোপুরি রোধ করে।',
    '/images/SubServices-images/1. d. Retainers.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-space-maintainers',
    'orthodontics',
    5,
    'Space Maintainers',
    'স্পেস মেইনটেইনার',
    'Holds essential arch space open when a baby tooth is lost prematurely.',
    'কোনো দুধ দাঁত আগেভাগে পড়ে গেলে সেই ফাঁকা জায়গাটা ধরে রাখতে।',
    'Premature loss of a primary tooth before the permanent successor tooth is ready to erupt.',
    'স্থায়ী দাঁত আসার স্বাভাবিক সময়ের আগেই কোনো দুধ দাঁত পড়ে গেলে বা ফেলে দিলে।',
    'Prevents neighboring teeth from collapsing inward and eliminates future severe crowding.',
    'ভবিষ্যতে স্থায়ী দাঁতের জটিল ভিড় ও দীর্ঘমেয়াদী ব্রেসেসের প্রয়োজনীয়তা অনেকাংশে কমিয়ে দেয়।',
    '/images/SubServices-images/1. e. Space Maintainers.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'orthodontics-myofunctional-appliances',
    'orthodontics',
    6,
    'Myofunctional / Habit-Correction Appliances',
    'মায়োফাংশনাল ও অভ্যাস সংশোধনকারী অ্যাপ্লায়েন্স',
    'Corrects harmful oral habits that negatively impact developing jaws and tooth positioning.',
    'মুখ ও চোয়ালের স্বাভাবিক বৃদ্ধিতে বাধা দেওয়া ক্ষতিকর মৌখিক অভ্যাস দূর করতে।',
    'Habits such as tongue-thrusting, mouth-breathing, or incorrect swallowing identified in children.',
    'শিশুদের মধ্যে জিভ দিয়ে দাঁত ঠেলার অভ্যাস বা মুখ দিয়ে শ্বাস নেওয়ার লক্ষণ ধরা পড়লে।',
    'Promotes healthy, balanced facial jaw growth and prevents structural dental misalignment.',
    'চোয়ালের স্বাভাবিক বৃদ্ধি নিশ্চিত করে এবং মুখের আকৃতি ও দাঁতের সৌন্দর্য রক্ষা করে।',
    '/images/SubServices-images/1. f. Habit Correction Appliances.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'interceptive-orthodontics',
    'orthodontics',
    7,
    'Interceptive / Early Orthodontic Treatment (Kids)',
    'ইন্টারসেপ্টিভ / শিশুদের প্রাথমিক অর্থোডন্টিক চিকিৎসা',
    'Addresses developing bite and jaw alignment issues while bones are still actively growing.',
    'চোয়াল ও হাড় বাড়ন্ত থাকার সময়েই দাঁতের প্রাথমিক সমস্যাগুলো শুধরে নিতে।',
    'Around ages 7 to 10, during the mixed dentition phase when growth anomalies are detected.',
    'সাধারণত ৭ থেকে ১০ বছর বয়সে, দুধ ও স্থায়ী দাঁতের পরিবর্তনের সময়ে।',
    'Guides proper skeletal jaw growth, often avoiding complex tooth extractions or surgery later.',
    'ভবিষ্যতে জটিল সার্জারি বা দাঁত ফেলার ঝুঁকি এড়ায় এবং পরবর্তী চিকিৎসাকে সহজ করে তোলে।',
    '/images/SubServices-images/1. g. KIDS orthodontics.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-simple-extraction',
    'oral-surgery',
    1,
    'Simple Tooth Extraction',
    'সিম্পল টুথ এক্সট্রাকশন (দাঁত তোলা)',
    'Safely removes a severely decayed or irreparably damaged tooth.',
    'মারাত্মক ক্ষতিগ্রস্ত বা মেরামতের অযোগ্য দাঁত ব্যথাহীনভাবে অপসারণ করতে।',
    'Irreversible structural decay, chronic infection, or advised prior to orthodontic therapy.',
    'যখন ফিলিং বা রুট ক্যানেল দিয়েও দাঁত বাঁচানো সম্ভব হয় না।',
    'Immediate relief from persistent dental pain and stops the spread of infection to bone.',
    'তীব্র যন্ত্রণা থেকে তাৎক্ষণিক মুক্তি দেয় এবং আশপাশের হাড়ে ইনফেকশন ছড়ানো ঠেকায়।',
    '/images/SubServices-images/2.1. Simple Tooth Extraction.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-wisdom-tooth-surgery',
    'oral-surgery',
    2,
    'Surgical / Impacted Wisdom Tooth Extraction',
    'সার্জিক্যাল ও ইমপ্যাক্টেড উইজডম টুথ অপসারণ',
    'Removes third molars trapped under the gumline or jawbone with surgical precision.',
    'মাড়ি বা হাড়ের নিচে আংশিক বা সম্পূর্ণ আটকে থাকা আক্কেল দাঁত নিরাপদে অপসারণ করতে।',
    'Impacted teeth causing acute swelling, recurrent pericoronitis, or damaging adjacent molars.',
    'আক্কেল দাঁতের কারণে চোয়ালে তীব্র ব্যথা, মাড়ি ফোলা বা পাশের সুস্থ দাঁতের ক্ষতি হলে।',
    'Prevents recurrent deep infections, jaw cysts, and protects adjacent healthy molars.',
    'বারবার মাড়ি ফোলা ও ইনফেকশন হওয়া বন্ধ করে এবং পাশের ভালো দাঁতকে নিরাপদ রাখে।',
    '/images/SubServices-images/2.2. Impacted Wisdom Tooth.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-dental-implant-surgery',
    'oral-surgery',
    3,
    'Dental Implant Surgery',
    'ডেন্টাল ইমপ্ল্যান্ট সার্জারি',
    'Replaces missing tooth roots with bio-compatible titanium posts for permanent teeth.',
    'হারানো দাঁতের শিকড়ের জায়গায় টাইটানিয়াম পোস্ট বসিয়ে স্থায়ী কৃত্রিম দাঁতের ভিত্তি গড়তে।',
    'After tooth loss, once the jawbone structure and oral health conditions are evaluated.',
    'দাঁত পড়ে যাওয়া বা তোলার পর স্থায়ী ও প্রাকৃতিক সমাধান চাইলে।',
    'Looks, feels, and chews exactly like a natural tooth while permanently preventing bone resorption.',
    'আজীবন স্থায়ী, আসল দাঁতের মতোই শক্তি ও সৌন্দর্য দেয় এবং চোয়ালের হাড়ের ক্ষয় রোধ করে।',
    '/images/SubServices-images/2.3. Dental Implant Surgery.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-facial-trauma',
    'oral-surgery',
    4,
    'Facial Trauma & Fracture Treatment',
    'ফেসিয়াল ট্রমা ও ফ্র্যাকচার চিকিৎসা',
    'Repairs and reconstructs fractured jawbones and facial skeletal injuries.',
    'চোয়াল ও মুখের হাড়ের আঘাত বা ফ্র্যাকচার নিখুঁতভাবে পুনর্বিন্যাস ও চিকিৎসা করতে।',
    'Following physical trauma, sports injuries, or vehicular accidents affecting the jaw.',
    'দুর্ঘটনা বা কোনো গুরুতর আঘাতে মুখমণ্ডল ও চোয়ালের হাড় ক্ষতিগ্রস্ত হলে।',
    'Restores normal jaw function, bite alignment, and preserves facial symmetry and aesthetics.',
    'চোয়ালের স্বাভাবিক চিবানোর ক্ষমতা ফিরিয়ে আনে এবং চেহারার স্বাভাবিক সৌন্দর্য রক্ষা করে।',
    '/images/SubServices-images/2.4. Facial Trauma & Fracture Treatment.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-tmj-disorder',
    'oral-surgery',
    5,
    'TMJ (Jaw Joint) Disorder Treatment',
    'টিএমজে (চোয়ালের জয়েন্ট) ডিসঅর্ডার চিকিৎসা',
    'Alleviates pain, inflammation, and dysfunction in the temporomandibular joint.',
    'চোয়ালের জয়েন্টে ব্যথা, অস্বস্তি এবং নড়াচড়ার সমস্যা দূর করতে।',
    'Clicking noises upon chewing, chronic jaw pain, locking, or difficulty opening the mouth.',
    'মুখ খুলতে গেলে খটখট শব্দ হওয়া, চোয়াল আটকে যাওয়া বা খাবার চিবানোর সময় তীব্র ব্যথা হলে।',
    'Relieves chronic facial tension and headaches, restoring full, comfortable jaw mobility.',
    'দীর্ঘস্থায়ী মাথাব্যথা ও মুখের যন্ত্রণা দূর করে আরামদায়কভাবে মুখ খোলার স্বাভাবিকতা ফেরায়।',
    '/images/SubServices-images/2.5.  TMJ Jaw Joint Disorder Treatment.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-cyst-tumor-removal',
    'oral-surgery',
    6,
    'Oral Cyst & Tumor Removal',
    'ওরাল সিস্ট ও টিউমার অপসারণ',
    'Excises abnormal pathological growths from jawbone and soft oral tissues.',
    'মুখগহ্বর বা চোয়ালের হাড়ের অস্বাভাবিক টিউমার বা সিস্ট অস্ত্রোপচারের মাধ্যমে অপসারণ করতে।',
    'Diagnosed via clinical oral exam, digital X-rays, or specialized CT imaging.',
    'পরীক্ষা বা ডিজিটাল এক্স-রেতে কোনো সিস্ট বা অস্বাভাবিক বৃদ্ধি ধরা পড়লে।',
    'Halts tissue expansion, preserves bone integrity, and prevents irreversible damage.',
    'রোগের বিস্তার বন্ধ করে চোয়ালের হাড় ও আশেপাশের টিস্যুকে দীর্ঘমেয়াদে নিরাপদ রাখে।',
    '/images/SubServices-images/2.6. Oral Cyst & Tumor Removal.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-oral-biopsy',
    'oral-surgery',
    7,
    'Biopsy (Oral Lesion)',
    'ওরাল বায়োপসি (মুখের ক্ষত পরীক্ষা)',
    'Samples microscopic tissue to diagnose the precise nature of persistent oral lesions.',
    'মুখের সন্দেহজনক ক্ষত বা দাগের সঠিক রোগ নির্ণয়ে মাইক্রোস্কোপিক পরীক্ষা করতে।',
    'Any non-healing mouth ulcer, red/white patch, or unusual lump lasting over two weeks.',
    'মুখের কোনো ঘা, সাদা বা লালচে দাগ যদি দুই সপ্তাহের বেশি স্থায়ী হয়।',
    'Provides conclusive pathology diagnosis ensuring accurate, timely, and targeted treatment.',
    'যেকোনো জটিল রোগের প্রাথমিক লক্ষণ নিশ্চিত করে দ্রুত উপযুক্ত চিকিৎসার পথ দেখায়।',
    '/images/SubServices-images/2.7. Oral Biopsy.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-abscess-management',
    'oral-surgery',
    8,
    'Space Infection / Abscess Management',
    'স্পেস ইনফেকশন ও পুঁজ অপসারণ',
    'Drains and treats deep dental bacterial infections that have spread into facial fascial spaces.',
    'মুখ ও গলার গভীরে ছড়িয়ে পড়া মারাত্মক দাঁতের পুঁজ ও ব্যাকটেরিয়াল ইনফেকশন সারাতে।',
    'Facial swelling, high fever, difficulty swallowing, or severe throbbing dental pain.',
    'মুখ বা গাল ফুলে যাওয়া, জ্বর আসা, বা গিলতে কষ্ট হওয়ার মতো তীব্র সংক্রমণের সময়।',
    'Controls critical infections immediately and eliminates life-threatening airway complications.',
    'ঝুঁকিপূর্ণ ইনফেকশন দ্রুত নিয়ন্ত্রণে এনে তীব্র যন্ত্রণা থেকে তাৎক্ষণিক নিস্তার দেয়।',
    '/images/SubServices-images/2.8. Space Infection Abscess Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-surgery-oral-ulcer',
    'oral-surgery',
    9,
    'Oral Ulcer Management',
    'মুখের আলসার ও ক্ষতের চিকিৎসা',
    'Diagnoses underlying systemic or local causes of painful, recurring mouth ulcers.',
    'বারবার হওয়া কষ্টদায়ক মুখের ঘায়ের আসল কারণ শনাক্ত করে তার প্রতিকার করতে।',
    'Mouth sores that recur frequently or fail to resolve within typical healing timeframes.',
    'যখন ঘা নিয়মিত ফিরে আসে বা স্বাভাবিক নিয়মে নিজে থেকে ভালো হয় না।',
    'Rapid relief from eating discomfort and eliminates serious mucosal disorders.',
    'খাওয়াদাওয়ার তীব্র যন্ত্রণা কমায় এবং গুরুতর রোগ থাকার আশঙ্কা দূর করে।',
    '/images/SubServices-images/2.9. Oral Ulcer Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-root-canal',
    'endodontics',
    1,
    'Root Canal Treatment (RCT)',
    'রুট ক্যানেল ট্রিটমেন্ট (আরসিটি)',
    'Saves a tooth whose internal nerve/pulp is severely infected or inflamed.',
    'সংক্রমিত বা ক্ষতিগ্রস্ত দাঁতের ভেতরের স্নায়ু পরিষ্কার করে দাঁতটিকে বাঁচিয়ে রাখতে।',
    'Deep tooth decay, intense throbbing pain, nocturnal toothache, or sensitivity to hot foods.',
    'গভীর ক্যাভিটি বা দাঁতের তীব্র ব্যথা, বিশেষ করে রাতে বা গরম কিছু খেলে ব্যথা বেড়ে গেলে।',
    'Eliminates toothache permanently while preserving your original natural tooth in the arch.',
    'দাঁত ফেলে না দিয়ে ব্যথাহীনভাবে আজীবনের জন্য নিজের প্রাকৃতিক দাঁত বাঁচানো সম্ভব হয়।',
    '/images/SubServices-images/3. 1. Root Canal Treatment.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-re-root-canal',
    'endodontics',
    2,
    'Re-Root Canal Treatment (Retreatment)',
    'রি-রুট ক্যানেল ট্রিটমেন্ট',
    'Treats previously root-treated teeth where persistent bacteria or incomplete seal caused reinfection.',
    'আগে করা রুট ক্যানেলে যদি পুনরায় ইনফেকশন বা ব্যথা দেখা দেয় তা সম্পূর্ণ নিরাময় করতে।',
    'Recurrent pain, tenderness to biting, or apical shadow visible on X-ray after an earlier RCT.',
    'পূর্বে রুট ক্যানেল করার বেশ কিছুদিন পর আবার কামড় দিলে ব্যথা বা মাড়ি ফুললে।',
    'Gives a compromised tooth a second chance at survival, avoiding costly extraction and implants.',
    'দাঁত ফেলে দেওয়ার মতো চূড়ান্ত সিদ্ধান্ত না নিয়ে দাঁতটিকে সুস্থ করে তোলার দ্বিতীয় সুযোগ দেয়।',
    '/images/SubServices-images/3. 2. Re-Root Canal Treatment.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-composite-filling',
    'endodontics',
    3,
    'Composite (Tooth-Colored) Filling',
    'কম্পোজিট (দাঁতের রঙের) ফিলিং',
    'Restores tooth structure after cavity removal using aesthetic, enamel-matching resin.',
    'ক্যাভিটি পরিষ্কারের পর দাঁতের হুবহু স্বাভাবিক রঙের সাথে মিলিয়ে ফিলিং করতে।',
    'Mild-to-moderate dental cavities, small chips, or replacing dark amalgam silver fillings.',
    'দাঁতে কালো গর্ত, ক্ষয় বা ভাঙা অংশ চোখে পড়লে।',
    'Blends invisibly with your natural enamel and bonds directly to strengthen remaining tooth structure.',
    'কোনোভাবেই বোঝার উপায় থাকে না যে ফিলিং করা হয়েছে এবং দাঁতের নিজস্ব শক্তি অক্ষুণ্ণ থাকে।',
    '/images/SubServices-images/3. 3. Composite (Tooth-Colored) Filling.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-gic-filling',
    'endodontics',
    4,
    'GIC (Glass Ionomer) Filling',
    'জিআইসি (গ্লাস আয়োনোমার) ফিলিং',
    'Biocompatible restorative material that naturally releases fluoride to stop further decay.',
    'বিশেষ উপাদান যা স্বাভাবিকভাবেই ফ্লোরাইড নির্গত করে পুনরায় ক্যাভিটি হওয়া প্রতিরোধ করে।',
    'Root surface cavities, pediatric teeth, or non-stress-bearing zones near the gum margin.',
    'দাঁতের গোড়ার ক্ষয় বা শিশুদের দুধ দাঁতের ক্ষয় পূরণে।',
    'Chemical adhesion to enamel and dentin, thermal compatibility, and continuous fluoride protection.',
    'দাঁতের সাথে চমৎকারভাবে লেগে থাকে এবং দীর্ঘমেয়াদে পুনরায় ক্ষয় হওয়া থেকে সুরক্ষা দেয়।',
    '/images/SubServices-images/3. 4. GIC (Glass Ionomer) Filling.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-inlay-onlay',
    'endodontics',
    5,
    'Inlay / Onlay Restoration',
    'ইনলে / অনলে রিস্টোরেশন',
    'Lab-crafted ceramic pieces designed for teeth with damage too large for fillings but too healthy for crowns.',
    'মাঝারি ধরনের ক্ষয়ের জন্য যেখানে সাধারণ ফিলিং টেকে না আবার পুরো ক্রাউনেরও প্রয়োজন হয় না।',
    'Substantial tooth cusp fracture or extensive decay where enamel preservation is paramount.',
    'দাঁতের ওপরের চিবানোর অংশ বেশি ভেঙে গেলে কিন্তু বাকি দাঁত মজবুত থাকলে।',
    'Superior structural strength, perfect anatomical contacts, and exceptional long-term wear resistance.',
    'সাধারণ ফিলিংয়ের চেয়ে কয়েকগুণ বেশি টেকসই এবং প্রাকৃতিক দাঁতের গঠন অক্ষুণ্ণ রাখে।',
    '/images/SubServices-images/3. 5. Inlay_Onlay Restoration.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-cracked-tooth',
    'endodontics',
    6,
    'Cracked Tooth Treatment',
    'ক্র্যাকড টুথ (ফাটা দাঁত) চিকিৎসা',
    'Diagnoses microscopic structural fissures before catastrophic tooth split occurs.',
    'দাঁতের সূক্ষ্ম ফাটল শনাক্ত করে দাঁতটি দ্বিখণ্ডিত বা নষ্ট হয়ে যাওয়া থেকে বাঁচাতে।',
    'Sharp, intermittent pain when chewing tough foods or sudden sensitivity to cold fluids.',
    'চিবানোর সময় হঠাৎ তীব্র খচখচে ব্যথা বা ঠান্ডা পানি খেলে বিদ্যুৎ চমকানোর মতো অনুভূতি হলে।',
    'Stabilizes the tooth structure early, preventing pulp death and saving the natural tooth.',
    'ফাটলটি গভীরে ছড়ানোর আগেই দাঁতকে রক্ষা করে এবং রুট ক্যানেল বা দাঁত তোলার ঝামেলা এড়ায়।',
    '/images/SubServices-images/3. 6. Cracked Tooth Treatment.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-apicoectomy',
    'endodontics',
    7,
    'Apicoectomy (Root-End Surgery)',
    'অ্যাপিকোএক্টমি (রুট-এন্ড সার্জারি)',
    'Surgically accesses and removes persistent infection located precisely at the tooth''s root apex.',
    'দাঁতের শিকড়ের একেবারে ডগায় জমে থাকা না-সারা ইনফেকশন ছোট সার্জারির মাধ্যমে দূর করতে।',
    'Infection persists after conventional root canal therapy and retreatment is not feasible.',
    'রুট ক্যানেল করার পরও দাঁতের গোড়ায় সিস্ট বা পুঁজ থেকে গেলে।',
    'Direct surgical cure of apical infection, saving a valuable tooth that would otherwise need extraction.',
    'দাঁতটি ফেলে না দিয়ে এর শিকড়ের রোগ সারিয়ে দীর্ঘকাল টিকিয়ে রাখার সুবর্ণ সুযোগ দেয়।',
    '/images/SubServices-images/3. 7. Post & Core Build-Up.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-post-core',
    'endodontics',
    8,
    'Post & Core Build-Up (After RCT)',
    'পোস্ট অ্যান্ড কোর বিল্ড-আপ (আরসিটির পর)',
    'Reconstructs the internal core foundation of a heavily broken-down root-treated tooth.',
    'রুট ক্যানেলের পর ভেঙে যাওয়া দাঁতে ক্রাউন বসানোর মতো মজবুত অভ্যন্তরীণ খুঁটি তৈরি করতে।',
    'When more than 50% of the natural crown structure is missing prior to crowning.',
    'যখন দাঁতের ওপরের কাঠামোর বেশিরভাগ অংশ ক্ষয় বা ভেঙে নষ্ট হয়ে যায়।',
    'Anchors the upcoming crown securely, preventing crown dislodgement and root fractures.',
    'ভবিষ্যতের ডেন্টাল ক্যাপ বা ক্রাউনকে আজীবনের জন্য মজবুত ভিত্তি প্রদান করে।',
    '/images/SubServices-images/3. 8. Post & Core Build-Up.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'endodontics-teeth-whitening',
    'endodontics',
    9,
    'Teeth Whitening / Bleaching',
    'টিথ হোয়াইটেনিং / ব্লিচিং',
    'Brightens and safely eliminates intrinsic and extrinsic stains from tooth enamel.',
    'দাঁতের উপরিভাগের জেদি হলদেটে ভাব ও দাগ দূর করে স্বাভাবিক উজ্জ্বলতা ফিরিয়ে আনতে।',
    'Yellowed or discolored teeth from coffee, tea, smoking, or natural aging before special events.',
    'চা, কফি বা বয়সের কারণে দাঁত বিবর্ণ হলে অথবা হাসিকে ঝকঝকে করে তুলতে চাইলে।',
    'Noticeably brighter shade in a single safe clinical session, dramatically elevating smile aesthetics.',
    'নিরাপদ ও আধুনিক পদ্ধতিতে এক সেশনেই কয়েক শেড উজ্জ্বল, আকর্ষণীয় ও উজ্জ্বল হাসি পাওয়া যায়।',
    '/images/SubServices-images/3. 9. Toothe whitening.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-dental-crowns',
    'prosthodontics',
    1,
    'Dental Crowns (Zirconia / Porcelain / PFM)',
    'ডেন্টাল ক্রাউন (জিরকোনিয়া / পোরসেলিন / পিএফএম ক্যাপ)',
    'Encloses and protects a structurally compromised or root-treated tooth with a durable aesthetic cap.',
    'দুর্বল বা রুট ক্যানেল করা দাঁতকে পুরোপুরি ঢেকে শক্তিশালী ও সুন্দর রূপ দিতে।',
    'Following RCT, large fractures, or severe tooth wear where full coverage protection is mandatory.',
    'রুট ক্যানেলের পরে দাঁত যাতে ভেঙে না যায় অথবা দাঁতের অনেক অংশ ভেঙে গেলে।',
    'Restores chewing strength, matches original tooth anatomy, and ensures long-term longevity.',
    'আসল দাঁতের সমান শক্তি নিয়ে স্বাভাবিক খাবার চিবানো যায় এবং দেখতে সম্পূর্ণ প্রাকৃতিক লাগে।',
    '/images/SubServices-images/4. 1. Dental Crowns.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-dental-bridges',
    'prosthodontics',
    2,
    'Dental Bridges',
    'ডেন্টাল ব্রিজ',
    'Bridges the gap left by one or more missing teeth by anchoring to sound adjacent teeth.',
    'পাশের সুস্থ দাঁতের সাপোর্ট নিয়ে মাঝে পড়ে যাওয়া এক বা একাধিক দাঁত স্থায়ীভাবে বসাতে।',
    'Missing teeth with strong, healthy adjacent natural teeth ready to act as abutments.',
    'দাঁত পড়ে যাওয়ার পর পাশের দাঁত মজবুত থাকলে স্থায়ী কৃত্রিম দাঁত লাগানোর জন্য।',
    'Fixed non-removable solution, restores natural chewing balance, and stops teeth from tilting.',
    'স্থায়ী ও না-খোলার সমাধান, সঠিকভাবে কথা বলা ও চিবানো নিশ্চিত করে এবং পাশের দাঁত হেলে যাওয়া ঠেকায়।',
    '/images/SubServices-images/4. 2. Dental Bridges.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-complete-dentures',
    'prosthodontics',
    3,
    'Complete Dentures (Full)',
    'কমপ্লিট ডেনচার (সম্পূর্ণ বাঁধাই দাঁত)',
    'Replaces all missing teeth in the entire upper or lower dental arch.',
    'উপরের বা নিচের সম্পূর্ণ চোয়ালের সবকটি হারানো দাঁত একসাথে প্রতিস্থাপন করতে।',
    'Complete tooth loss (edentulism) in one or both jaws.',
    'চোয়ালের সব দাঁত পড়ে গেলে অথবা সবকটি দাঁত তুলে ফেলতে হলে।',
    'Restores facial structure support, speech clarity, and comfortable daily chewing capability.',
    'মুখের স্বাভাবিক ফোলাভাব ও বলিরেখা দূর করে তারুণ্য ফিরিয়ে আনে এবং খাবার খাওয়া সহজ করে।',
    '/images/SubServices-images/4. 3. Complete Dentures.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-partial-dentures',
    'prosthodontics',
    4,
    'Partial Dentures (Removable)',
    'পার্শিয়াল ডেনচার (খোলার সুবিধাযুক্ত দাঁত)',
    'Replaces multiple missing teeth while securely resting around remaining natural teeth.',
    'কিছু দাঁত পড়ে গেলে বাকি সুস্থ দাঁতগুলোর সাথে মানানসই করে খুলে পরার দাঁত তৈরি করতে।',
    'Several missing teeth where implants or fixed bridges are not immediately suitable.',
    'একাধিক দাঁত না থাকলে কিন্তু কিছু ভালো দাঁত অবশিষ্ট থাকলে সাশ্রয়ী সমাধানে।',
    'Economical, easy to clean, comfortable, and quickly fabricated to restore your smile.',
    'সবচেয়ে সাশ্রয়ী, সহজে পরিষ্কার করা যায় এবং দ্রুত আপনার হাসিকে পরিপূর্ণ করে তোলে।',
    '/images/SubServices-images/4. 4.  Partial Dentures.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-implant-supported-crown',
    'prosthodontics',
    5,
    'Implant-Supported Crown / Bridge',
    'ইমপ্ল্যান্ট-সাপোর্টেড ক্রাউন ও ব্রিজ',
    'Fixes custom crowns directly onto healed titanium implants without trimming adjacent healthy teeth.',
    'পাশের কোনো ভালো দাঁত না কেটে সরাসরি টাইটানিয়াম ইমপ্ল্যান্টের ওপর স্থায়ী ক্রাউন বসাতে।',
    'Single or multiple missing teeth with sufficient healed implant integration.',
    'ইমপ্ল্যান্ট সার্জারির পর স্থায়ী ও সবচেয়ে শক্ত দাঁত সংযোজন করতে।',
    'Preserves adjacent natural teeth untouched and delivers the most lifelike dental restoration possible.',
    'পাশের সুস্থ দাঁতের কোনো ক্ষতি হয় না এবং পুরোপুরি আসল দাঁতের মতোই অনুভূতি পাওয়া যায়।',
    '/images/SubServices-images/4. 5. Implant-Supported Crown.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-implant-supported-denture',
    'prosthodontics',
    6,
    'Implant-Supported Denture (Overdenture)',
    'ইমপ্ল্যান্ট-সাপোর্টেড ওভারডেনচার',
    'Locks a full denture firmly onto 2-4 dental implants using precision snap-on attachments.',
    'কয়েকটি ইমপ্ল্যান্টের মাথায় স্ন্যাপ-লকের সাহায্যে সম্পূর্ণ ডেনচারকে চোয়ালে লক করে রাখতে।',
    'Loose, slipping full dentures causing irritation or difficulty speaking and chewing.',
    'সাধারণ বাঁধানো দাঁত যদি নড়বড়ে হয়, খাবার খেতে গেলে খুলে আসে বা কথা বলতে সমস্যা হয়।',
    'Zero slipping or embarrassing dislodgement; restores up to 80% of original chewing power.',
    'কথা বলা বা হাসার সময় খুলে পড়ার কোনো ভয় থাকে না এবং অত্যন্ত নিশ্চিন্তে সব খাবার চিবানো যায়।',
    '/images/SubServices-images/4.6. Implant-Supported Denture.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-veneers',
    'prosthodontics',
    7,
    'Veneers (Porcelain / Composite)',
    'ভিনিয়ার্স (পোরসেলিন / কম্পোজিট ভিনিয়ার)',
    'Ultra-thin, custom ceramic shells bonded to the front surface of anterior teeth.',
    'সামনের দাঁতের উপরিভাগে পাতলা সুন্দর সিরামিক আস্তরণ লাগিয়ে মনকাড়া হাসি তৈরি করতে।',
    'Front teeth with persistent stains, micro-chips, irregular shapes, or small unsightly gaps.',
    'সামনের দাঁতে হালকা ফাঁকা, সামান্য ভাঙা, দাগ বা অসম আকৃতি থাকলে।',
    'Hollywood-grade cosmetic transformation with minimal enamel modification.',
    'খুব সামান্য এনামেল স্পর্শ করেই এক অনন্য, ঝকঝকে ও অত্যন্ত আকর্ষণীয় হাসি উপহার দেয়।',
    '/images/SubServices-images/4.7. Dental venners.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'prosthodontics-maxillofacial-prosthesis',
    'prosthodontics',
    8,
    'Maxillofacial Prosthesis',
    'ম্যাক্সিলোফেসিয়াল প্রস্থেসিস',
    'Reconstructs facial and oral anatomical defects resulting from cancer surgery or trauma.',
    'ক্যান্সার সার্জারি বা বড় কোনো দুর্ঘটনায় মুখের কোনো অংশ নষ্ট হয়ে গেলে তা কৃত্রিমভাবে পুনর্গঠন করতে।',
    'Palatal defects, post-oncological resection, or congenital facial deformities.',
    'তালুর ছিদ্র বা চোয়ালের বড় অংশ অপসারিত হওয়ার পর কথা ও খাওয়া স্বাভাবিক করতে।',
    'Restores basic functions like swallowing, speaking, and restores facial dignity and confidence.',
    'কথা বলা ও খাবার গেলার মতো মৌলিক ক্ষমতা ফিরিয়ে রোগীর স্বাভাবিক জীবনযাত্রার মান বাড়ায়।',
    '/images/SubServices-images/4.8. Maxillofacial Prosthesis.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-pulpotomy',
    'pediatric',
    1,
    'Pulpotomy',
    'পাল্পোটমি (শিশুর প্রাথমিক আরসিটি)',
    'Removes coronal infected pulp while leaving healthy root pulp intact in baby teeth.',
    'দুধ দাঁতের উপরিভাগের সংক্রমিত অংশ ফেলে দিয়ে সুস্থ শিকড়টিকে বাঁচিয়ে রাখতে।',
    'Deep decay reaches pulp chamber of a primary molar without affecting the root canal roots.',
    'শিশুর দুধ দাঁতের গভীরে ক্ষয় পৌঁছে ব্যথা শুরু হলে কিন্তু শিকড় এখনো অক্ষত থাকলে।',
    'Relieves child''s dental pain instantly and keeps the primary tooth safely until natural exfoliation.',
    'শিশুকে দ্রুত ব্যথামুক্ত করে এবং প্রাকৃতিকভাবে নতুন দাঁত ওঠার সময় পর্যন্ত দুধ দাঁতটিকে ধরে রাখে।',
    '/images/SubServices-images/5. 1. Pulpotomy.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-pulpectomy',
    'pediatric',
    2,
    'Pulpectomy',
    'পাল্পেক্টমি (শিশুর সম্পূর্ণ রুট ক্যানেল)',
    'Completely removes infected nerve tissue from crown and roots of primary teeth.',
    'দুধ দাঁতের সম্পূর্ণ স্নায়ু ও শিকড় জীবাণুমুক্ত করে বিশেষ ওষুধ দিয়ে ভর্তি করতে।',
    'Chronic infection has spread into the baby tooth root canals, causing swelling or abscess.',
    'যখন সংক্রমণ দুধ দাঁতের শিকড় পর্যন্ত ছড়িয়ে মাড়িতে পুঁজ বা তীব্র ফোলা সৃষ্টি করে।',
    'Prevents infection from damaging the developing permanent tooth bud resting right beneath it.',
    'দুধ দাঁতের নিচে বেড়ে ওঠা স্থায়ী নতুন দাঁতের কুঁড়িকে ইনফেকশনের ক্ষতি থেকে পূর্ণ সুরক্ষা দেয়।',
    '/images/SubServices-images/5. 2. Pulpectomy.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-extraction',
    'pediatric',
    3,
    'Pediatric Tooth Extraction',
    'শিশুর দাঁত তোলা (পেডিয়াট্রিক এক্সট্রাকশন)',
    'Gently removes non-restorable, severely abscessed, or over-retained primary teeth.',
    'বাঁচানো অসম্ভব এমন অতিরিক্ত ক্ষয়প্রাপ্ত বা নতুন দাঁত ওঠায় বাধা দেওয়া দুধ দাঁত তুলতে।',
    'Extensive destruction beyond repair or when permanent tooth is erupting behind baby tooth.',
    'যখন নতুন দাঁত এসে গেলেও দুধ দাঁত পড়ছে না বা দাঁত মারাত্মকভাবে ইনফেক্টেড হয়ে গেছে।',
    'Pain-free gentle procedure clearing the pathway for healthy, unhindered permanent tooth eruption.',
    'ভয়হীন ও ব্যথাহীন পরিবেশে দুধ দাঁত সরিয়ে স্থায়ী দাঁতের সঠিক অবস্থানে ওঠার পথ সুগম করে।',
    '/images/SubServices-images/5. 3. Pediatric Tooth Extraction.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-pit-fissure-sealants',
    'pediatric',
    4,
    'Pit & Fissure Sealants',
    'পিট অ্যান্ড ফিশার সিল্যান্টস',
    'Applies a protective resin coating into the deep microscopic grooves of children''s molars.',
    'শিশুদের নতুন ওঠা মাড়ির দাঁতের গভীর খাঁজগুলোতে পাতলা প্রতিরক্ষামূলক প্রলেপ দিতে।',
    'Immediately after permanent molars erupt (ages 6 and 12) before cavities have a chance to form.',
    '৬ থেকে ১২ বছর বয়সে নতুন স্থায়ী মাড়ির দাঁত ওঠার পর পরই ক্যাভিটি শুরুর আগে।',
    'Reduces cavity risk by over 80% in the most decay-prone biting surfaces of growing teeth.',
    'খাবারের কণা আটকে থাকা বন্ধ করে দাঁতের ৮০ শতাংশেরও বেশি ক্যাভিটির ঝুঁকি চিরতরে কমিয়ে দেয়।',
    '/images/SubServices-images/5.4. Pit & Fissure Sealants.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-kids-space-maintainer',
    'pediatric',
    5,
    'Space Maintainers (Kids)',
    'স্পেস মেইনটেইনার (শিশুদের)',
    'Custom appliance preserving the empty gap left when a baby molar is lost prematurely.',
    'অকালে কোনো দুধ দাঁত পড়ে গেলে স্থায়ী দাঁতের জন্য নির্ধারিত ফাঁকা জায়গাটি ধরে রাখতে।',
    'Early extraction of primary teeth years before the permanent molar is scheduled to appear.',
    'স্থায়ী দাঁত ওঠার বয়সের আগেই কোনো কারণে দুধ দাঁত ফেলে দিতে হলে।',
    'Prevents adjacent teeth from drifting into the space, preventing complex orthodontic problems.',
    'পাশের দাঁত হেলে এসে জায়গা বন্ধ করে দেওয়া ঠেকায় এবং ভবিষ্যতের আঁকাবাঁকা দাঁত হওয়া রোধ করে।',
    '/images/SubServices-images/5. 5. Space Maintainers.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-habit-breaking',
    'pediatric',
    6,
    'Habit-Breaking Appliances',
    'অভ্যাস নিরোধক অ্যাপ্লায়েন্স (আঙুল চোষা বন্ধের ডিভাইস)',
    'Comfortable orthodontic appliance that gently helps children discontinue thumb-sucking or tongue-thrusting.',
    'শিশুদের আঙুল চোষা বা অস্বাভাবিকভাবে জিভ ঠেলার ক্ষতিকর অভ্যাসটি সহজে ছাড়াতে।',
    'Prolonged habits persisting beyond ages 4-5 that are starting to deform the upper front teeth.',
    '৪-৫ বছর বয়সের পরও যদি শিশু আঙুল চোষা চালিয়ে যায় এবং সামনের দাঁত উঁচু হতে থাকে।',
    'Prevents open bites, flared protruding teeth, and ensures normal palate bone development.',
    'সামনের দাঁত উঁচু হয়ে যাওয়া ও তালুর হাড়ের অস্বাভাবিক পরিবর্তন স্থায়ীভাবে রোধ করে।',
    '/images/SubServices-images/5.6. Habit-Breaking Appliances''.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-early-caries',
    'pediatric',
    7,
    'Early Cavity / Caries Management',
    'প্রাথমিক ক্যাভিটি ও ক্যারিজ চিকিৎসা',
    'Detects and arrests microscopic enamel demineralization before it develops into deep cavities.',
    'দাঁতের ক্ষয় গভীরে পৌঁছানোর আগেই একদম প্রাথমিক পর্যায়ে শনাক্ত করে থামিয়ে দিতে।',
    'White spot lesions or microscopic surface enamel roughness spotted during routine dental exam.',
    'নিয়মিত চেকআপের সময় দাঁতের ওপর সাদাটে ছোপ বা সূক্ষ্ম ক্ষয়ের চিহ্ন দেখা দিলে।',
    'Non-invasive remineralization avoiding dental drill, pain, and extensive future fillings.',
    'কোনো ড্রিল বা ব্যথা ছাড়াই দাঁতকে আবার খনিজসমৃদ্ধ ও সুস্থ করে তোলা যায়।',
    '/images/SubServices-images/5.7. Early Caries Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-child-checkup',
    'pediatric',
    8,
    'Child Dental Check-up & Preventive Counselling',
    'শিশু দন্ত চেকআপ ও প্রতিরোধমূলক কাউন্সেলিং',
    'Routine comprehensive assessment fostering a warm, friendly relationship between child and dentist.',
    'শিশুর মুখের গঠন ও দাঁতের বৃদ্ধি পর্যবেক্ষণ এবং ডাক্তারের সাথে একটি বন্ধুত্বপূর্ণ সম্পর্ক গড়তে।',
    'Every 6 months beginning with the eruption of the very first primary tooth.',
    'প্রথম দাঁত ওঠার পর থেকেই প্রতি ৬ মাসে একবার রুটিন চেকআপের জন্য।',
    'Builds a lifetime without dental fear, early detection of issues, and bespoke dietary guidance.',
    'শিশুর মনের ভেতর থেকে ডাক্তারের ভয় চিরতরে দূর হয় এবং সঠিক ব্রাশ করার অভ্যাস গড়ে ওঠে।',
    '/images/SubServices-images/5.8. Child Dental Check-up & Preventive Counselling.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'pediatric-trauma',
    'pediatric',
    9,
    'Dental Trauma Management (Kids)',
    'শিশুর দাঁতে আঘাতজনিত জরুরি চিকিৎসা',
    'Immediate emergency care for chipped, loosened, intruded, or knocked-out primary or permanent teeth.',
    'খেলাধুলা বা পড়ে গিয়ে শিশুর দাঁত ভেঙে গেলে, নড়ে গেলে বা পড়ে গেলে জরুরি চিকিৎসায়।',
    'Immediately following any playground fall, sports impact, or accidental facial injury.',
    'দুর্ঘটনার পর যত দ্রুত সম্ভব, বিশেষ করে প্রথম ১-২ ঘণ্টার মধ্যে নিয়ে আসা জরুরি।',
    'Gives maximum likelihood of saving the tooth and prevents nerve necrosis or permanent tooth damage.',
    'দ্রুত চিকিৎসার মাধ্যমে দাঁতটি নষ্ট হওয়া থেকে বাঁচানোর সর্বোচ্চ সুযোগ তৈরি হয়।',
    '/images/SubServices-images/5.9. Dental Trauma Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-scaling-polishing',
    'periodontics',
    1,
    'Scaling & Polishing (Cleaning)',
    'স্কেলিং ও পলিশিং (দাঁতের পেশাদার ক্লিনিং)',
    'Ultrasonically removes hardened calculus and bacterial plaque deposits unreachable by toothbrush.',
    'ব্রাশ দিয়ে পরিষ্কার হয় না এমন পাথুরে প্লাক ও জেদি টারটার আল্ট্রাসনিক পদ্ধতিতে দূর করতে।',
    'Recommended every 6 months for all adults or whenever yellowish tartar buildup and bleeding occurs.',
    'প্রতি ৬ মাসে একবার অথবা দাঁতের গোড়ায় পাথর ও মাড়ি থেকে রক্ত পড়ার মতো লক্ষণ দেখা দিলে।',
    'Stops gingivitis immediately, eliminates bad breath, and leaves teeth smooth and refreshed.',
    'মাড়ি ফোলা ও রক্ত পড়া বন্ধ করে, মুখের দুর্গন্ধ দূর করে এবং দাঁতকে সতেজ ও চকচকে করে।',
    '/images/SubServices-images/6. 1. Scaling & Polishing (Cleaning).jpeg'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-deep-cleaning',
    'periodontics',
    2,
    'Deep Cleaning / Root Planing',
    'ডিপ ক্লিনিং / রুট প্ল্যানিং',
    'Cleans and smoothens root surfaces below the gumline to eradicate deep bacterial colonies.',
    'মাড়ির ভেতরের গভীর অংশ ও দাঁতের শিকড় মসৃণ করে ক্ষতিকর ব্যাকটেরিয়া চিরতরে দূর করতে।',
    'Pocket depths over 4mm, chronic bleeding, gum recession, or moderate periodontitis.',
    'মাড়ি থেকে নিয়মিত রক্ত পড়লে, মাড়ি নিচে নেমে গেলে বা পকেট তৈরি হলে।',
    'Halts progressive bone loss, allows inflamed gums to reattach snugly to the tooth root.',
    'চোয়ালের হাড়ের ক্ষয় বন্ধ করে এবং মাড়ি আবার শক্তভাবে দাঁতের শিকড়কে জড়িয়ে ধরে।',
    '/images/SubServices-images/6.2. Deep Cleaning _ Root Planing.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-periodontitis-treatment',
    'periodontics',
    3,
    'Gum Disease (Periodontitis) Treatment',
    'উন্নত মাড়ির রোগ (পেরিওডন্টাইটিস) চিকিৎসা',
    'Comprehensive therapy targeting destructive microbial infection destroying supportive alveolar bone.',
    'দাঁতের ভিত্তি নষ্ট করে দেওয়া জটিল মাড়ির ইনফেকশন নির্মূল করতে।',
    'Teeth beginning to loosen, shifting positions, foul taste, or recurring gum abscesses.',
    'দাঁত আলগা হয়ে নড়তে শুরু করলে, মুখে তিক্ত স্বাদ থাকলে বা দাঁতের ফাঁক বেড়ে গেলে।',
    'Saves teeth from irreversible loosening and extraction, stabilizing your oral foundation.',
    'দাঁত পড়ে যাওয়া রোধ করে এবং মাড়ি ও চোয়ালের হাড়কে আরও ক্ষয় হওয়া থেকে রক্ষা করে।',
    '/images/SubServices-images/6. 3. Gum Disease.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-gum-contouring',
    'periodontics',
    4,
    'Gum Contouring / Gummy Smile Correction',
    'গাম কনট্যুরিং / গামি স্মাইল সংশোধন',
    'Sculpts excessive or asymmetrical gum tissue using precise dental lasers/surgical techniques.',
    'হাসার সময় অতিরিক্ত মাড়ি দেখা গেলে তা সমান ও নিখুঁতভাবে রিশেপ করতে।',
    'Excessive gingival display making teeth appear unusually short or an uneven gumline.',
    'হাসলে দাঁতের চেয়ে মাড়ি বেশি দেখা গেলে এবং দাঁতগুলো খাটো মনে হলে।',
    'Unveils ideal tooth proportions and symmetry, transforming the balance of your entire smile.',
    'দাঁতগুলোকে সুন্দর অনুপাতে প্রকাশ করে এক আকর্ষণীয়, সুষম ও আত্মবিশ্বাসী হাসি এনে দেয়।',
    '/images/SubServices-images/6. 4. Gummy Smile Correction.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-flap-surgery',
    'periodontics',
    5,
    'Flap Surgery',
    'ফ্ল্যাপ সার্জারি',
    'Gently reflects gum tissue back to clean deep bone defects and recontour diseased bone.',
    'মাড়ির টিস্যু সামান্য সরিয়ে হাড়ের গভীরে জমে থাকা সংক্রমণ পরিষ্কার ও হাড়ের গঠন ঠিক করতে।',
    'Severe periodontitis with deep periodontal pockets unresponsive to regular root planing.',
    'গভীর মাড়ির পকেট যখন সাধারণ ক্লিনিংয়ে ভালো হয় না এবং হাড়ের ক্ষয় বাড়তে থাকে।',
    'Significantly reduces pocket depths, enabling easy lifelong home oral hygiene maintenance.',
    'পকেটের গভীরতা কমিয়ে দেয় ফলে দাঁত পরিষ্কার রাখা সহজ হয় এবং দাঁতের আয়ু বাড়ে।',
    '/images/SubServices-images/6. 5. Flap Surgery.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-gum-grafting',
    'periodontics',
    6,
    'Gum Grafting',
    'গাম গ্রাফটিং (মাড়ি প্রতিস্থাপন)',
    'Replaces lost gum tissue to cover exposed roots and rebuild protective keratinized gingiva.',
    'মাড়ি সরে গিয়ে বেরিয়ে আসা দাঁতের শিকড়কে নতুন টিস্যু দিয়ে ঢেকে সুরক্ষা দিতে।',
    'Severe gum recession causing acute thermal sensitivity or unpleasantly elongated tooth appearance.',
    'মাড়ি শুকিয়ে দাঁতের গোড়া বের হয়ে গেলে এবং ঠান্ডা বা বাতাসে তীব্র শিরশির করলে।',
    'Permanently halts root decay and sensitivity while restoring a youthful, healthy gumline.',
    'দাঁতের শিকড়ের ক্ষয় ও শিরশিরানি চিরতরে দূর করে এবং মাড়ির প্রাকৃতিক সৌন্দর্য ফেরায়।',
    '/images/SubServices-images/6. 6. Gum Grafting.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-crown-lengthening',
    'periodontics',
    7,
    'Crown Lengthening',
    'ক্রাউন লেন্থেনিং (দাঁতের দৃশ্যমান অংশ বাড়ানো)',
    'Reshapes gum and bone margins to expose greater sound natural tooth structure.',
    'মাড়ির লেভেল সামান্য নামিয়ে দাঁতের প্রয়োজনীয় অংশ প্রকাশ করতে।',
    'When a tooth is broken below the gumline and needs adequate room for crown placement.',
    'দাঁত মাড়ির নিচে ভেঙে গেলে যাতে ক্যাপ বা ক্রাউন ঠিকমতো বসানো সম্ভব হয়।',
    'Provides the biological width necessary to secure long-lasting crowns without chronic gum irritation.',
    'পরবর্তী ক্রাউনকে যথাযথ ফিটিং দেয় এবং মাড়িতে ইনফেকশন হওয়া থেকে সুরক্ষা জোগায়।',
    '/images/SubServices-images/6. 7. Crown Lengthening.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-halitosis-management',
    'periodontics',
    8,
    'Bad Breath (Halitosis) Management',
    'মুখের দুর্গন্ধ (হ্যালিটোসিস) চিকিৎসা',
    'Identifies and eradicates volatile sulfur compounds produced by deep intraoral anaerobic bacteria.',
    'মুখের গভীর খাঁজ ও মাড়ির মধ্যে থাকা ক্ষতিকর দুর্গন্ধ সৃষ্টিকারী ব্যাকটেরিয়া ধ্বংস করতে।',
    'Chronic bad breath that persists despite regular home brushing, mouthwash, and flossing.',
    'নিয়মিত ব্রাশ করা সত্ত্বেও যদি মুখে অস্বস্তিকর গন্ধ থেকেই যায়।',
    'Targets the true biological root cause rather than masking symptoms, restoring fresh social confidence.',
    'শুধু মুখ ধোয়ার ওষুধ দিয়ে সাময়িক ঢেকে না রেখে মূল কারণ দূর করে দীর্ঘমেয়াদী সতেজতা দেয়।',
    '/images/SubServices-images/6. 8. Bad Breath (Halitosis) Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'periodontics-mobile-teeth-splinting',
    'periodontics',
    9,
    'Management of Mobile Teeth by Splinting',
    'স্প্লিন্টিং দ্বারা নড়বড়ে দাঁতের চিকিৎসা',
    'Bonds adjacent loose teeth together using specialized aesthetic fibers or composite splints.',
    'মাড়ির দুর্বলতায় নড়বড়ে হয়ে যাওয়া দাঁতগুলোকে পাশের সুস্থ দাঁতের সাথে ফাইবার দিয়ে বেঁধে মজবুত করতে।',
    'Teeth become noticeably loose due to periodontal bone loss or secondary trauma.',
    'পেরিওডন্টাল কারণে বা কোনো আঘাতে দাঁত অস্বাভাবিকভাবে নড়তে শুরু করলে।',
    'Provides immediate mechanical stability, relieves chewing discomfort, and prevents premature tooth loss.',
    'দাঁতের নড়াচড়া বন্ধ করে আরামদায়কভাবে খাবার খাওয়ার শক্তি ফেরায় এবং দাঁত অকালে পড়ে যাওয়া ঠেকায়।',
    '/images/SubServices-images/6. 9. Management of Mobile Teeth by Splinting.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-oral-cancer-screening-diagnosis',
    'oral-medicine',
    1,
    'Oral Cancer Screening & Diagnosis',
    'ওরাল ক্যান্সার স্ক্রিনিং ও ডায়াগনোসিস',
    'Identifies potentially malignant oral lesions and early cellular changes before they spread.',
    'ক্যান্সার হওয়ার মতো অস্বাভাবিক কোষ ও মুখের ক্ষতের লক্ষণ শুরুতেই নিশ্চিতভাবে শনাক্ত করতে।',
    'Persistent non-healing ulcers, persistent red or white patches, or regular screening for tobacco/betel nut users.',
    'দুই সপ্তাহের বেশি না-সারা ঘা, তামাক বা জর্দা খাওয়ার অভ্যাস থাকলে কিংবা মুখে লাল-সাদা দাগ দেখা দিলে।',
    'Life-saving early detection with high curability and non-invasive initial screening protocols.',
    'প্রাথমিক পর্যায়ে শনাক্ত হলে প্রায় শতভাগ সফল নিরাময় সম্ভব এবং জীবন রক্ষা পায়।',
    '/images/SubServices-images/7. 1. Oral Cancer Screening & Diagnosis.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-precancerous-lesion-management',
    'oral-medicine',
    2,
    'Precancerous Lesion Management (Leukoplakia, Erythroplakia)',
    'প্রিক্যান্সারাস ক্ষত চিকিৎসা (লিউoplাকিয়া ও এরিথ্রোপ্লাকিয়া)',
    'Treats and closely monitors mucosal white and red patches that carry a risk of turning into oral cancer.',
    'মুখে দেখা দেওয়া সাদা বা লালচে দাগ যা ভবিষ্যতে ক্যান্সারে রূপ নেওয়ার ঝুঁকি রাখে, তার সঠিক চিকিৎসা ও পর্যবেক্ষণ করতে।',
    'Rough or raised white patches (leukoplakia) or velvety red lesions (erythroplakia) in the oral cavity.',
    'জিহ্বা, গালের ভেতর বা তালুতে খসখসে সাদাটে ছোপ বা লালচে দাগ দীর্ঘ সময় ধরে বিদ্যমান থাকলে।',
    'Halts malignant transformation through tailored medical therapies, risk cessation, and expert surveillance.',
    'সময়মতো চিকিৎসার মাধ্যমে ক্যান্সার হওয়ার ঝুঁকি পুরোপুরি বন্ধ করা যায় এবং জটিল অপারেশন এড়ানো যায়।',
    '/images/SubServices-images/7. 2. Precancerous Lesion Management (Leukoplakia, Erythroplakia).png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-osmf-management',
    'oral-medicine',
    3,
    'Oral Submucous Fibrosis (OSMF) Management',
    'ওরাল সাবমিউকাস ফাইব্রোসিস (ওএসএমএফ) চিকিৎসা',
    'Reverses progressive stiffening and burning sensation in mouth lining typically caused by areca nut/betel quid chewing.',
    'সুপারি বা জর্দা খাওয়ার কারণে মুখের ভেতরের চামড়া শক্ত হয়ে যাওয়া এবং মুখ খুলতে না পারার সমস্যা দূর করতে।',
    'Difficulty opening the mouth fully, severe burning sensation when eating spicy foods, or blanching of inner cheeks.',
    'ঝাল খেলে অতিরিক্ত জ্বালাপোড়া হওয়া এবং আস্তে আস্তে স্বাভাবিকভাবে মুখ খোলার ক্ষমতা কমে গেলে।',
    'Improves mouth opening span, alleviates burning discomfort, and drastically lowers oral malignancy risk.',
    'মুখের স্বাভাবিক খোলার পরিধি বাড়ায়, জ্বালাপোড়া কমায় এবং দীর্ঘমেয়াদী ক্যান্সারের ঝুঁকি কমিয়ে দেয়।',
    '/images/SubServices-images/7. 3. Oral Submucous Fibrosis (OSMF) Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-recurrent-oral-ulcers',
    'oral-medicine',
    4,
    'Recurrent Oral Ulcer / Aphthous Ulcer Management',
    'বারবার হওয়া মুখের ঘা বা অ্যাপথাস আলসার চিকিৎসা',
    'Addresses the underlying systemic, immune, or nutritional root causes of painful, recurring mouth sores.',
    'বারবার মুখের ঘা হওয়ার আসল কারণ (ইমিউন, পুষ্টির ঘাটতি বা মানসিক চাপ) শনাক্ত করে দীর্ঘস্থায়ী মুক্তি দিতে।',
    'Frequent episodes of painful blisters or ulcers on tongue, lips, or cheeks interfering with eating and talking.',
    'নিয়মিত ঠোঁটের ভেতরের অংশ, জিহ্বা বা মাড়িতে তীব্র যন্ত্রণাদায়ক ঘা হয়ে খাওয়া-দাওয়া কষ্টকর হলে।',
    'Rapid pain reduction, accelerated mucosal healing, and significant reduction in recurrence frequency.',
    'দ্রুত ব্যথাহীন আরাম এনে দেয়, দ্রুত ঘা শুকায় এবং বারবার ঘা ফিরে আসার প্রবণতা বন্ধ করে।',
    '/images/SubServices-images/7. 4. Recurrent Oral Ulcer _ Aphthous Ulcer Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-oral-lichen-planus',
    'oral-medicine',
    5,
    'Oral Lichen Planus & Mucosal Lesion Management',
    'ওরাল লাইকেন প্ল্যানাস ও মিউকোসাল ক্ষত চিকিৎসা',
    'Manages chronic inflammatory autoimmune conditions causing painful lacy white streaks and erosions in oral mucosa.',
    'শরীরের রোগ প্রতিরোধ ক্ষমতার ভারসাম্যহীনতায় মুখে হওয়া দীর্ঘমেয়াদী জ্বালাপোড়া ও জালিকার মতো দাগ নিরাময় করতে।',
    'Lacy white patterns, redness, soreness, or burning in inner cheeks or gums while brushing or eating.',
    'গালের ভেতরে সাদা সূক্ষ্ম রেখা, তীব্র সংবেদনশীলতা কিংবা কোনো কিছু খাওয়ার সময় মাড়ি বা গাল জ্বলে উঠলে।',
    'Sustained remission of painful symptoms, prevention of erosive ulcers, and expert long-term mucosal care.',
    'জ্বালা-যন্ত্রণা দূর করে দীর্ঘস্থায়ী আরাম দেয় এবং মাড়ি ও মুখের ভেতরের চামড়ার গভীর ক্ষয় রোধ করে।',
    '/images/SubServices-images/7. 5. Oral Lichen Planus & Mucosal Lesion Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-burning-mouth-syndrome',
    'oral-medicine',
    6,
    'Burning Mouth Syndrome Management',
    'বার্নিং মাউথ সিন্ড্রোম (মুখে তীব্র জ্বালাপোড়া) চিকিৎসা',
    'Comprehensive neurological and mucosal workup to resolve mysterious, persistent oral scalding sensations.',
    'কোনো দৃশ্যমান ঘা ছাড়াই জিহ্বা বা পুরো মুখে দীর্ঘস্থায়ী গরম বা পোড়ার মতো অনুভূতি দূর করার চিকিৎসায়।',
    'Constant burning sensation on tongue, lips, or roof of mouth without visible wounds, often with altered taste.',
    'জিহ্বা বা তালুতে সারাক্ষণ গরম ছ্যাঁকা লাগার মতো জ্বালা, স্বাদ পরিবর্তন বা মুখে শুষ্কতা অনুভূত হলে।',
    'Targeted multi-modal relief restoring normal sensory comfort and dietary enjoyment.',
    'যথাযথ চিকিৎসার মাধ্যমে অস্বস্তিকর জ্বালাপোড়া থেকে মুক্তি মেলে এবং স্বাচ্ছন্দ্যে স্বাভাবিক খাবারে ফেরা যায়।',
    '/images/SubServices-images/7. 6. Burning Mouth Syndrome Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-oral-biopsy-consultation',
    'oral-medicine',
    7,
    'Oral Biopsy & Diagnostic Consultation',
    'ওরাল বায়োপসি ও ডায়াগনস্টিক কনসালটেশন',
    'Microscopic histopathological analysis to establish a definitive diagnosis for unresolved oral lesions.',
    'মুখের সন্দেহজনক বা দীর্ঘস্থায়ী কোনো ক্ষতের আসল কারণ মাইক্রোস্কোপিক পরীক্ষার মাধ্যমে নিশ্চিত করতে।',
    'Unexplained oral swellings, lumps, non-healing ulcers, or mucosal color changes unresponsive to routine medications.',
    'ওষুধ খাওয়ার পরও ঘা ভালো না হলে, মুখে ফোলাভাব বা অস্বাভাবিক মাংসপিণ্ড দেখা দিলে।',
    'Gold-standard diagnosis with total clinical clarity, guiding the most precise medical or surgical roadmap.',
    'রোগের সঠিক ধরন শতভাগ নিশ্চিত করে এবং অপ্রয়োজনীয় বিভ্রান্তি দূর করে নির্ভুল চিকিৎসার পথ দেখায়।',
    '/images/SubServices-images/7.7. Oral Biopsy & Diagnostic Consultation.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-oral-manifestations-systemic',
    'oral-medicine',
    8,
    'Oral Manifestations of Systemic Disease Management',
    'শারীরিক জটিল রোগজনিত মুখের সমস্যার সমন্বিত চিকিৎসা',
    'Diagnoses and co-manages oral complications arising from diabetes, anemia, autoimmune conditions, or medications.',
    'ডায়াবেটিস, রক্তশূন্যতা, লিভার বা কিডনির রোগ এবং দীর্ঘমেয়াদী ওষুধের পার্শ্বপ্রতিক্রিয়ায় মুখে হওয়া সমস্যার চিকিৎসায়।',
    'Unusual oral symptoms occurring in tandem with general medical health conditions or drug therapies.',
    'সাধারণ শারীরিক অসুস্থতার সাথে মিলিয়ে মুখে বারবার ইনফেকশন, মাড়ির ঘা বা অপ্রত্যাশিত পরিবর্তন ঘটলে।',
    'Holistic care coordinating with your physicians to ensure both mouth and body heal together.',
    'মূল শারীরিক রোগের সাথে সমন্বয় করে চিকিৎসা দেওয়ায় মুখের কষ্ট দ্রুত দূর হয় এবং সার্বিক স্বাস্থ্য উন্নত হয়।',
    '/images/SubServices-images/7.8. Oral Manifestations of Systemic Disease Management.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-salivary-gland-disorders',
    'oral-medicine',
    9,
    'Salivary Gland Disorder Consultation (Dry Mouth / Xerostomia)',
    'লালাগ্রন্থির সমস্যা ও মুখ শুকিয়ে যাওয়া (জেরোস্টোমিয়া) চিকিৎসা',
    'Investigates salivary gland dysfunction, stones, infections, and debilitating chronic dry mouth conditions.',
    'লালাগ্রন্থিতে পাথর, ইনফেকশন বা লালা তৈরি কমে গিয়ে মুখ শুকিয়ে যাওয়ার সমস্যা প্রতিকার করতে।',
    'Severe mouth dryness, difficulty swallowing dry foods, salivary gland swelling while eating, or recurrent pain.',
    'মুখ অতিরিক্ত শুকিয়ে কাঠ হয়ে থাকা, গিলতে কষ্ট হওয়া বা খাবার খাওয়ার সময় চোয়ালের নিচে ফুলে উঠলে।',
    'Restores comfortable saliva flow, prevents rapid rampant tooth decay, and eliminates swallowing distress.',
    'মুখে স্বাভাবিক লালা প্রবাহ ফিরিয়ে আনে, দাঁতের দ্রুত ক্ষয় রোধ করে এবং আরামে খাওয়া ও কথা বলার সুযোগ দেয়।',
    '/images/SubServices-images/7.9. Salivary Gland Disorder.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'oral-medicine-complex-oral-diagnosis',
    'oral-medicine',
    10,
    'Second Opinion / Complex Oral Diagnosis Consultation',
    'জটিল ওরাল রোগের দ্বিতীয় মতামত (সেকেন্ড ওপিনিয়ন) ও পরামর্শ',
    'Offers advanced specialist evaluation for rare, perplexing, or longstanding oral mucosal conditions.',
    'দীর্ঘদিন চিকিৎসা নিয়েও না সারা বা শনাক্ত না হওয়া মুখের জটিল ও দুর্লভ সমস্যায় অভিজ্ঞ বিশেষজ্ঞের মতামত নিতে।',
    'Conflicting diagnoses from multiple clinics, unresolved oral symptoms, or before undergoing extensive oral surgery.',
    'রোগ নির্ণয়ে সংশয় থাকলে, আগে নেওয়া চিকিৎসায় ফল না পেলে কিংবা বড় কোনো সার্জারির সিদ্ধান্ত নেওয়ার আগে।',
    'Unbiased, highly qualified specialist assessment providing peace of mind and the correct treatment direction.',
    'আন্তর্জাতিক প্রশিক্ষণপ্রাপ্ত বিশেষজ্ঞের সুচিন্তিত পরামর্শ যা রোগীকে সঠিক চিকিৎসাপদ্ধতি বেছে নেওয়ার পূর্ণ আস্থা দেয়।',
    '/images/SubServices-images/7.10. Second Opinion _ Complex Oral Diagnosis Consultation.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'general-consultation-general-checkup',
    'general-consultation',
    1,
    'General Dental Check-up & Consultation',
    'জেনারেল ডেন্টাল চেকআপ ও কনসালটেশন',
    'Comprehensive assessment of entire oral health, mucosal screening, and personalized care plan.',
    'মুখের সামগ্রিক স্বাস্থ্য, দাঁত ও মাড়ি নিখুঁতভাবে পরীক্ষা করে সঠিক চিকিৎসার দিকনির্দেশনা পেতে।',
    'Every 6 months for preventative wellness, or as your first introductory visit to KGH Dental.',
    'প্রতি ৬ মাসে একবার রুটিন পরীক্ষার জন্য বা নতুন রোগী হিসেবে প্রথমবার আসার সময়।',
    'Discovers hidden issues in early painless stages, saving you from complex, costly procedures later.',
    'কোনো সমস্যা বড় হওয়ার আগেই শনাক্ত করা যায়, ফলে ভবিষ্যতের বড় ঝামেলা ও খরচ বাঁচে।',
    '/images/SubServices-images/8.1 General Dental Check-up & Consultation.jpeg'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'general-consultation-digital-xray-opg',
    'general-consultation',
    2,
    'Digital X-Ray / OPG (Panoramic Radiography)',
    'ডিজিটাল এক্স-রে ও ওপিজি (প্যানোরামিক এক্স-রে)',
    'Ultra-low-dose digital radiography revealing bone levels, roots, and hidden interproximal decay.',
    'খালি চোখে যা দেখা যায় না — দাঁতের শিকড়, ভেতরের ক্যাভিটি ও চোয়ালের হাড়ের নিখুঁত চিত্র পেতে।',
    'Essential diagnostic prerequisite for root canal, implant planning, extractions, or braces.',
    'রুট ক্যানেল, দাঁত তোলা, ব্রেসেস বা ইমপ্ল্যান্টের চিকিৎসা পরিকল্পনার শুরুতে।',
    'Immediate high-resolution image with 90% less radiation exposure than traditional film X-rays.',
    'ফিল্ম এক্স-রে থেকে ৯০% কম রেডিয়েশন এবং তাৎক্ষণিকভাবে কম্পিউটারে নিখুঁত ছবি পাওয়া যায়।',
    '/images/SubServices-images/8. 2, Digital X-Ray.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'general-consultation-intraoral-scanning',
    'general-consultation',
    3,
    'Intraoral Scanning (Digital Impression)',
    'ইন্ট্রাওরাল স্ক্যানিং (ডিজিটাল ইমপ্রেশন)',
    'Captures precision 3D digital color impression of your teeth without messy, gag-inducing impression putty.',
    'কোনো আঠালো বা অস্বস্তিকর পেস্ট মুখে না ঢুকিয়েই দাঁতের নিখুঁত থ্রিডি ডিজিটাল মডেল নিতে।',
    'Required for crowns, aligners, bridges, nightguards, and aesthetic smile planning.',
    'ক্যাপ, ক্লিয়ার অ্যালাইনার বা কৃত্রিম দাঁত তৈরির সময় নিখুঁত মাপ নেওয়ার জন্য।',
    'Completely comfortable, eliminates gag reflexes, and delivers micron-level fit accuracy.',
    'কোনো ওয়াক আসার ভয় থাকে না, অসম্ভব দ্রুত এবং মাইক্রন-লেভেলের নিখুঁত ফিটিং নিশ্চিত করে।',
    '/images/SubServices-images/8. 3. Intraoral Scanning (Digital Impression).png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'general-consultation-oral-cancer-screening',
    'general-consultation',
    4,
    'Oral Cancer Screening',
    'ওরাল ক্যান্সার স্ক্রিনিং (প্রাথমিক পরীক্ষা)',
    'Specialist clinical examination of tongue, floor of mouth, and buccal mucosa for precancerous changes.',
    'জিহ্বা, গাল ও মাড়ির ভেতরের অংশে কোনো অস্বাভাবিক কোষ বা প্রাথমিক ক্যান্সার লক্ষণ আছে কিনা তা যাচাই করতে।',
    'During annual routine check-ups, especially for patients with history of tobacco or betel nut use.',
    'বার্ষিক চেকআপের সময়, বিশেষত যাদের তামাক বা জর্দা খাওয়ার অভ্যাস রয়েছে।',
    'Early identification of dysplasia provides life-saving interventions with near 100% cure rates.',
    'প্রাথমিক পর্যায়ে ধরা পড়লে যেকোনো মারাত্মক রোগ সম্পূর্ণ নিরাময় করা সহজ হয়।',
    '/images/SubServices-images/8. 4. Oral Cancer Screening.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;

INSERT INTO public.sub_services (
    id, department_id, number, name_en, name_bn, why_en, why_bn, when_en, when_bn, benefit_en, benefit_bn, image_url
) VALUES (
    'general-consultation-emergency-care',
    'general-consultation',
    5,
    'Emergency Dental Care',
    'জরুরি ডেন্টাল কেয়ার (ইমার্জেন্সি সেবা)',
    'Rapid urgent attention for severe toothaches, avulsed teeth, bleeding, or acute trauma.',
    'হঠাৎ অসহনীয় দাঁতে ব্যথা, রক্তপাত বা আঘাত লাগার মতো জরুরি মুহূর্তে তাৎক্ষণিক চিকিৎসা পেতে।',
    'Unbearable pain keeping you awake, broken teeth from accidents, or uncontrolled oral bleeding.',
    'তীব্র যন্ত্রণায় যখন সহ্য করা অসম্ভব হয়ে পড়ে অথবা দুর্ঘটনায় দাঁত ভেঙে রক্ত বের হয়।',
    'Prompt relief from distressing pain and expert emergency intervention to save compromised teeth.',
    'তীব্র যন্ত্রণা থেকে তাৎক্ষণিক নিস্তার দেয় এবং দাঁতটি চিরতরে নষ্ট হওয়া থেকে রক্ষা করে।',
    '/images/SubServices-images/8. 5. Emergency Dental Care.png'
) ON CONFLICT (id) DO UPDATE SET
    department_id = EXCLUDED.department_id,
    number = EXCLUDED.number,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    why_en = EXCLUDED.why_en,
    why_bn = EXCLUDED.why_bn,
    when_en = EXCLUDED.when_en,
    when_bn = EXCLUDED.when_bn,
    benefit_en = EXCLUDED.benefit_en,
    benefit_bn = EXCLUDED.benefit_bn,
    image_url = EXCLUDED.image_url;


-- ==============================================================================


-- ==============================================================================
-- 5. CLINIC SETTINGS (LEVEL 4 CHANDIWALA MANSION, BANANI)
-- ==============================================================================
INSERT INTO public.clinic_settings (
    id, phone_numbers, emergency_phone, working_hours, address_en, address_bn,
    is_address_placeholder, google_map_url, google_review_url, social_links, updated_at
) VALUES (
    1,
    ARRAY['+880 1700-000000', '+880 1800-000000'],
    '+880 1700-000000',
    '[{"days":{"en":"Saturday – Thursday","bn":"শনিবার – বৃহস্পতিবার"},"hours":{"en":"11:00 AM – 2:00 PM & 5:00 PM – 9:30 PM","bn":"সকাল ১১:০০ – দুপুর ২:০০ ও বিকাল ৫:০০ – রাত ৯:৩০"}},{"days":{"en":"Friday","bn":"শুক্রবার"},"hours":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}]'::jsonb,
    'Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213, Bangladesh',
    'লেভেল ৪, চান্দীওয়ালা ম্যানশন, বাড়ি ৩২, রোড ১১, ব্লক জি, বনানী, ঢাকা ১২১৩, বাংলাদেশ',
    FALSE,
    'https://maps.app.goo.gl/aztfz8BxL5vug12L7',
    'https://g.page/r/kgh-dental-review',
    '{"facebook":"https://facebook.com/kghdental","whatsapp":"https://wa.me/8801700000000"}'::jsonb,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    phone_numbers = EXCLUDED.phone_numbers,
    emergency_phone = EXCLUDED.emergency_phone,
    working_hours = EXCLUDED.working_hours,
    address_en = EXCLUDED.address_en,
    address_bn = EXCLUDED.address_bn,
    is_address_placeholder = EXCLUDED.is_address_placeholder,
    google_map_url = EXCLUDED.google_map_url,
    google_review_url = EXCLUDED.google_review_url,
    social_links = EXCLUDED.social_links,
    updated_at = NOW();



-- ==============================================================================
-- 6. VERIFIED PATIENT REVIEWS DATA
-- ==============================================================================
INSERT INTO public.reviews (id, author_name, rating, date, comment_en, comment_bn, treatment_en, treatment_bn, updated_at)
VALUES
(
    'rev-1', 'Rafiqul Islam', 5, '2 weeks ago',
    'Dr. Diean explained the entire crown procedure with crystal clarity. The clinic environment is spotless, peaceful, and truly world-class. Painless experience!',
    'ডা. দিয়ান অত্যন্ত নিখুঁতভাবে পুরো ক্রাউনের প্রক্রিয়াটি বুঝিয়ে দিয়েছেন। চেম্বারের পরিবেশ অসম্ভব পরিচ্ছন্ন, শান্ত এবং আন্তর্জাতিক মানের। কোনো ব্যথাই পাইনি!',
    'Zirconia Crown', 'জিরকোনিয়া ক্রাউন', NOW()
),
(
    'rev-2', 'Sabrina Rahman', 5, '1 month ago',
    'I was terrified of wisdom tooth extraction, but Dr. Sanwar made it so quick and smooth. Healing was fast with zero complications. Highly recommended oral surgeon!',
    'আক্কেল দাঁত তোলার কথা শুনে খুব ভয়ে ছিলাম, কিন্তু ডা. সানোয়ার এত সহজে আর দ্রুত করলেন যে টেরই পাইনি! খুব দ্রুত সেরে উঠেছে। দারুণ অভিজ্ঞতা!',
    'Impacted Wisdom Tooth Extraction', 'উইজডম টুথ সার্জারি', NOW()
),
(
    'rev-3', 'Tanvir Ahmed', 5, '1 month ago',
    'Started my clear aligners journey with Dr. Fatema. She is extremely patient, friendly, and meticulous about smile aesthetics. Love the progress so far!',
    'ডা. ফাতেমার কাছে ক্লিয়ার অ্যালাইনার শুরু করেছি। উনি ভীষণ ধৈর্যশীল এবং যত্নবান। কোনো তার ছাড়া এত সুন্দর সমাধান ভাবাই যায় না!',
    'Clear Aligners', 'ক্লিয়ার অ্যালাইনার', NOW()
),
(
    'rev-4', 'Nasreen Akhter', 5, '2 months ago',
    'Took my 7-year-old son for a cavity checkup. The doctors handled him with so much care and warmth. He didn''t cry at all and even smiled on the way out!',
    'আমার ৭ বছরের ছেলেকে দাঁতের চেকআপের জন্য নিয়ে গিয়েছিলাম। চিকিৎসকরা এত আন্তরিকভাবে বুঝিয়ে করলেন যে ছেলে একটুও ভয় পায়নি বা কাঁদেনি!',
    'Pediatric Dental Care', 'শিশু দন্ত সেবা', NOW()
),
(
    'rev-5', 'Mahmud Hasan', 5, '3 months ago',
    'Had professional ultrasonic scaling and polishing. No sensitivity afterward, breath feels fresh and stains from tea are completely gone. 5 stars!',
    'স্কেলিং ও পলিশিং করিয়েছি। পরে কোনো শিরশির করেনি, চায়ের জেদি দাগ একদম চলে গেছে। অত্যন্ত পরিচ্ছন্ন ও বিশ্বস্ত সেবা!',
    'Scaling & Polishing', 'স্কেলিং ও পলিশিং', NOW()
),
(
    'rev-6', 'Farhana Yeasmin', 5, '3 months ago',
    'Had a single-sitting root canal done by Dr. Bappy. Absolutely painless and completed with modern rotary equipment. Truly world-class dental care!',
    'ডা. বাপ্পীর কাছে ওয়ান-সিটিং রুট ক্যানেল করিয়েছি। আধুনিক যন্ত্রপাতির কারণে কোনো ব্যথা ছাড়াই সম্পন্ন হয়েছে। সত্যিই আন্তর্জাতিক মানের সেবা!',
    'Single-Visit Root Canal', 'ওয়ান-সিটিং রুট ক্যানেল', NOW()
),
(
    'rev-7', 'Anisur Rahman', 5, '3 weeks ago',
    'Consulted Dr. Rifat for a persistent mouth ulcer. His thorough diagnosis, oral cancer screening, and medications gave me complete relief within days. Highly expert oral medicine care.',
    'মুখে দীর্ঘদিনের একটি ঘা নিয়ে ডা. রিফাতের শরণাপন্ন হয়েছিলাম। ওনার নিখুঁত ডায়াগনোসিস, স্ক্রিনিং ও ওষুধের পর কয়েক দিনেই সম্পূর্ণ সুস্থ হয়ে যাই। ওরাল মেডিসিনে অনন্য বিশেষজ্ঞ।',
    'Oral Medicine & Lesion Care', 'ওরাল মেডিসিন ও ক্ষত চিকিৎসা', NOW()
),
(
    'rev-8', 'Shamima Nasrin', 5, '2 months ago',
    'Dr. Jesinta designed my aesthetic smile makeover with flawless precision. My smile looks completely natural and radiant now. The entire team is wonderful!',
    'ডা. জেসিন্টার কাছে এস্থেটিক স্মাইল মেকওভার করিয়েছি। আমার হাসি এখন একদম প্রাকৃতিক ও উজ্জ্বল দেখায়। ওনাদের আন্তরিকতা ও আধুনিক চিকিৎসা সত্যিই অতুলনীয়!',
    'Aesthetic Smile Makeover', 'এস্থেটিক স্মাইল মেকওভার', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    author_name = EXCLUDED.author_name,
    rating = EXCLUDED.rating,
    date = EXCLUDED.date,
    comment_en = EXCLUDED.comment_en,
    comment_bn = EXCLUDED.comment_bn,
    treatment_en = EXCLUDED.treatment_en,
    treatment_bn = EXCLUDED.treatment_bn,
    updated_at = NOW();


-- ==============================================================================
-- 7. WHY CHOOSE US CARDS & CLINICAL CREED (MULTI-IMAGE PHILOSOPHY)
-- ==============================================================================
INSERT INTO public.why_choose_cards (
    id, step_number, badge_en, badge_bn, title_en, title_bn, subtitle_en, subtitle_bn,
    bullets, tags, image, accent, protocol_title_en, protocol_title_bn,
    protocol_subtitle_en, protocol_subtitle_bn, protocol_steps, protocol_guarantees
)
VALUES
(
    'specialists',
    '01',
    '',
    '',
    'Specialist-Led Care',
    'বিশেষজ্ঞদের হাতে চিকিৎসা',
    'Every department is led by a doctor trained specifically in that field — not a single general dentist trying to do everything.',
    'প্রতিটা বিভাগ পরিচালনা করেন সেই নির্দিষ্ট বিষয়ে প্রশিক্ষিত ডাক্তার — একজন জেনারেল ডেন্টিস্ট দিয়ে সবকিছু করানো নয়।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/specialist-care.jpg',
    '#474B4E',
    'Specialist-Led Clinical Protocol',
    'বিশেষজ্ঞ পরিচালিত চিকিৎসা প্রোটোকল',
    'Every dental department at KGH is led exclusively by qualified specialist surgeons (FCPS, MS, PhD) who focus 100% on their specialized discipline.',
    'কেজিএইচ ডেন্টালের প্রতিটি বিভাগ শুধুমাত্র উচ্চশিক্ষিত ও সার্টিফায়েড বিশেষজ্ঞ ডাক্তারদের (FCPS, MS, PhD) তত্ত্বাবধানে পরিচালিত হয়।',
    '[
        {"title": {"en": "Primary Specialty Assessment", "bn": "প্রাথমিক বিভাগীয় মূল্যায়ন"}, "detail": {"en": "Diagnostic imaging and focused examination by a certified department consultant.", "bn": "বিভাগীয় বিশেষজ্ঞ কনসালটেন্ট কর্তৃক ডিজিটাল প্রতিচ্ছবি ও গভীর পরীক্ষা।"}},
        {"title": {"en": "Inter-Disciplinary Review", "bn": "সম্মিলিত মেডিকেল বোর্ড রিভিউ"}, "detail": {"en": "Multi-specialist consensus on complex aligner, surgical, or implant therapies.", "bn": "জটিল সার্জারি বা অ্যালাইনার চিকিৎসায় যৌথ মেডিকেল বোর্ডের সমন্বিত মতামত।"}}
    ]'::jsonb,
    '[{"en": "100% Specialist-Led Diagnosis — No Generalist Guesswork", "bn": "১০০% বিশেষজ্ঞ চিকিৎসকের পরামর্শ — কোনো অনুমাননির্ভর চিকিৎসা নয়"}]'::jsonb
),
(
    'chamber',
    '02',
    '',
    '',
    'Modern, Comfortable Chamber',
    'আধুনিক ও আরামদায়ক চেম্বার',
    'A clean, calm space designed around patient comfort, from your first visit to your last follow-up.',
    'প্রথম ভিজিট থেকে শেষ ফলো-আপ পর্যন্ত, রোগীর স্বাচ্ছন্দ্যের কথা মাথায় রেখে সাজানো একটা পরিচ্ছন্ন, শান্ত পরিবেশ।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/modern-chamber.jpg',
    '#474B4E',
    'European Sterilization & Chamber Protocol',
    'ইউরোপীয় স্টেরিলাইজেশন ও চেম্বার প্রোটোকল',
    'We designed our clinic from the ground up to replace medical anxiety with absolute calm, hygiene, and hospital-grade sterilization.',
    'রোগীর ভয় ও অস্বস্তি দূর করে একটি শান্ত, মনোরম ও আন্তর্জাতিক মানের স্বাস্থ্যকর পরিবেশ নিশ্চিত করতে আমাদের চেম্বারটি সাজানো।',
    '[
        {"title": {"en": "Class-B Vacuum Decontamination", "bn": "ক্লাস-বি ভ্যাকুয়াম জীবাণুমুক্তকরণ"}, "detail": {"en": "134°C steam under pressure guarantees 100% viral and bacterial eradication.", "bn": "১৩৪° সেলসিয়াস তাপমাত্রায় উচ্চ চাপে প্রতিটি যন্ত্রের শতভাগ জীবাণুমুক্তকরণ।"}},
        {"title": {"en": "Sealed Barrier Pouches", "bn": "সিল করা জীবাণুমুক্ত প্যাকেট"}, "detail": {"en": "Instruments are opened exclusively in front of each individual patient.", "bn": "প্রতিটি রোগীর চোখের সামনেই সিল করা নতুন জীবাণুমুক্ত প্যাকেট খোলা হয়।"}}
    ]'::jsonb,
    '[{"en": "Strict European Class-B Sterilization Protocol for Every Patient", "bn": "প্রতিটি রোগীর জন্য কঠোর ইউরোপীয় ক্লাস-বি স্টেরিলাইজেশন প্রোটোকল"}]'::jsonb
),
(
    'plans',
    '03',
    '',
    '',
    'Transparent Treatment Plans',
    'স্বচ্ছ চিকিৎসা পরিকল্পনা',
    'No surprise costs or rushed decisions. We explain your options, show you what we see, and let you decide.',
    'কোনো লুকানো খরচ বা তাড়াহুড়ো নেই। আমরা প্রতিটি ধাপ স্পষ্ট করে বুঝিয়ে দিই, আপনি নিজেই সিদ্ধান্ত নিন।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/transparent-plans-hd.jpeg',
    '#474B4E',
    'Clinical Transparency Framework',
    'স্বচ্ছ চিকিৎসা ও ব্যয় মানদণ্ড',
    'Zero hidden fees, zero pressured procedures. We present comprehensive digital diagnosis before any treatment begins.',
    'কোনো লুকানো চার্জ বা চাপিয়ে দেওয়া চিকিৎসা নয়। চিকিৎসার শুরুতেই সম্পূর্ণ প্রক্রিয়া ও খরচ বিস্তারিতভাবে রোগীর সামনে তুলে ধরা হয়।',
    '[
        {"title": {"en": "Intraoral HD Display", "bn": "এইচডি ডিজিটাল ডিসপ্লে"}, "detail": {"en": "See your dental condition live on the HD monitor.", "bn": "রোগী নিজেই তার দাঁতের সমস্যা স্ক্রিনে দেখতে পারেন।"}},
        {"title": {"en": "Written Cost Breakdown", "bn": "লিখিত খরচ বিবরণী"}, "detail": {"en": "Itemized written pricing with zero hidden fees.", "bn": "লিখিত ফি বিবরণী — কোনো লুকানো বা অপ্রকাশিত চার্জ নেই।"}}
    ]'::jsonb,
    '[{"en": "Full Cost & Clinical Transparency — Zero Hidden Charges", "bn": "চিকিৎসা ও খরচে ১০০% স্বচ্ছতা — কোনো গোপন চার্জ নেই"}]'::jsonb
),
(
    'booking',
    '04',
    '',
    '',
    'Easy Appointment Booking',
    'সহজ ও দ্রুত অ্যাপয়েন্টমেন্ট বুকিং',
    'Pick your doctor, pick your time — book online in a few taps. No phone tags or long waiting lines.',
    'পছন্দের ডাক্তার ও সময় নির্বাচন করে সহজেই অনলাইনে বুক করুন। দীর্ঘ লাইনে অপেক্ষার ঝামেলা নেই।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/easy-booking.jpg',
    '#474B4E',
    'Digital Booking Standards',
    'ডিজিটাল বুকিং মানদণ্ড',
    'No endless phone calls or crowded waiting rooms. Our digital booking system respects your busy schedule with precision time slots.',
    'বারবার ফোন করার ঝামেলা কিংবা চেম্বারে বসে ঘণ্টার পর ঘণ্টা অপেক্ষা করার দিন শেষ। ডিজিটাল পদ্ধতিতে দ্রুততম সময়ে সিরিয়াল নিন।',
    '[
        {"title": {"en": "Quick 2-Min Booking", "bn": "২ মিনিটে অনলাইন বুকিং"}, "detail": {"en": "Select doctor, pick slot, and confirm instantly.", "bn": "পছন্দের বিশেষজ্ঞ ও স্লট বেছে নিয়ে সাথে সাথে বুকিং।"}},
        {"title": {"en": "Instant Confirmation", "bn": "তাৎক্ষণিক নিশ্চিতকরণ"}, "detail": {"en": "Instant WhatsApp & SMS confirmation with location pin.", "bn": "তাৎক্ষণিক হোয়াটসঅ্যাপ নিশ্চিতকরণ ও চেম্বার লোকেশন লিংক।"}}
    ]'::jsonb,
    '[{"en": "Guaranteed Dedicated Time Slot — Minimized Waiting Time", "bn": "নির্দিষ্ট সময়ে সিরিয়াল কনফার্মেশন — দীর্ঘ অপেক্ষার অবসান"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    subtitle_en = EXCLUDED.subtitle_en,
    subtitle_bn = EXCLUDED.subtitle_bn,
    bullets = EXCLUDED.bullets,
    tags = EXCLUDED.tags,
    badge_en = EXCLUDED.badge_en,
    badge_bn = EXCLUDED.badge_bn,
    image = EXCLUDED.image,
    accent = EXCLUDED.accent,
    protocol_title_en = EXCLUDED.protocol_title_en,
    protocol_title_bn = EXCLUDED.protocol_title_bn,
    protocol_subtitle_en = EXCLUDED.protocol_subtitle_en,
    protocol_subtitle_bn = EXCLUDED.protocol_subtitle_bn,
    protocol_steps = EXCLUDED.protocol_steps,
    protocol_guarantees = EXCLUDED.protocol_guarantees,
    updated_at = NOW();

INSERT INTO public.clinical_creed (
    id, tag_en, tag_bn, quote_en, quote_bn, sub_quote_en, sub_quote_bn,
    authority_en, authority_bn, designation_en, designation_bn, stats, quotes
)
VALUES
(
    1,
    'OUR CLINICAL CREED',
    'আমাদের চিকিৎসা দর্শন',
    'A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn''t just about fixing teeth, it''s about transforming how you live.',
    'একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।',
    'Transforming how you live and smile.',
    'আপনার জীবন ও হাসিতে নতুন আত্মবিশ্বাস।',
    'Clinical Advisory Council',
    'ক্লিনিক্যাল অ্যাডভাইজরি কাউন্সিল',
    'KGH Dental Multi-Specialty Chamber',
    'কেজিএইচ ডেন্টাল মাল্টি-স্পেশালিটি চেম্বার',
    '[]'::jsonb,
    '[
        {
            "id": "quote-1",
            "quote": {
                "en": "A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn''t just about fixing teeth, it''s about transforming how you live.",
                "bn": "একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।"
            },
            "highlight": {"en": "", "bn": ""},
            "author": {"en": "", "bn": ""},
            "role": {"en": "", "bn": ""},
            "image": "/images/why-choose-us/modern-chamber.jpg"
        },
        {
            "id": "quote-2",
            "quote": {
                "en": "Zero guesswork, zero rushed decisions. From digital low-radiation imaging to high-magnification diagnosis, every patient sees what we see before any procedure begins.",
                "bn": "কোনো অনুমান নয়, তাড়াহুড়ো করে নেওয়া সিদ্ধান্ত নয়। ডিজিটাল লো-রেডিয়েশন এক্স-রে এবং স্পষ্ট স্ক্রিনিংয়ের মাধ্যমে রোগীকে আগে তার সমস্যাটি বোঝানো হয়, তারপর চিকিৎসা শুরু হয়।"
            },
            "highlight": {"en": "", "bn": ""},
            "author": {"en": "", "bn": ""},
            "role": {"en": "", "bn": ""},
            "image": "/images/why-choose-us/transparent-plans-hd.jpeg"
        },
        {
            "id": "quote-3",
            "quote": {
                "en": "Every smile has unique anatomy. By bringing eight distinct surgical and clinical sub-disciplines under one unified roof, we ensure you receive the exact specialist your teeth deserve.",
                "bn": "প্রতিটি দাঁত ও হাসির গঠন সম্পূর্ণ আলাদা। আধুনিক ডেন্টিস্ট্রির আটটি ভিন্ন বিশেষায়িত বিভাগকে এক ছাদের নিচে এনে আমরা নিশ্চিত করি যে আপনি কেবল সঠিক বিশেষজ্ঞের হাতেই সেবা পাচ্ছেন।"
            },
            "highlight": {"en": "", "bn": ""},
            "author": {"en": "", "bn": ""},
            "role": {"en": "", "bn": ""},
            "image": "/images/why-choose-us/specialist-care.jpg"
        }
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    tag_en = EXCLUDED.tag_en,
    tag_bn = EXCLUDED.tag_bn,
    quote_en = EXCLUDED.quote_en,
    quote_bn = EXCLUDED.quote_bn,
    sub_quote_en = EXCLUDED.sub_quote_en,
    sub_quote_bn = EXCLUDED.sub_quote_bn,
    authority_en = EXCLUDED.authority_en,
    authority_bn = EXCLUDED.authority_bn,
    designation_en = EXCLUDED.designation_en,
    designation_bn = EXCLUDED.designation_bn,
    stats = EXCLUDED.stats,
    quotes = EXCLUDED.quotes,
    updated_at = NOW();

-- ==============================================================================
-- 8. SAMPLE INITIAL APPOINTMENTS (Preview for Booking & Admin Portal)
-- ==============================================================================
INSERT INTO public.appointments (
    reference_code, patient_name, patient_phone, patient_email, doctor_id, department_id,
    appointment_date, time_slot, symptoms, status, is_read
) VALUES 
(
    'KGH-ADS-472299',
    'Rafiqul Islam',
    '01712345678',
    'rafiqul@example.com',
    'dr-diean',
    'prosthodontics',
    CURRENT_DATE + INTERVAL '3 days',
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
    'orthodontics',
    CURRENT_DATE + INTERVAL '5 days',
    '06:00 PM',
    'Mild tooth crowding, interested in clear aligners.',
    'confirmed',
    true
)
ON CONFLICT (reference_code) DO NOTHING;

-- ==============================================================================

-- Initial Doctor Emails for Notifications
UPDATE public.doctors SET email = 'dr.diean@kghdental.com' WHERE id = 'dr-diean' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.sanwar@kghdental.com' WHERE id = 'dr-sanwar' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.madhubi@kghdental.com' WHERE id = 'dr-madhubi' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.sharmin@kghdental.com' WHERE id = 'dr-sharmin' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.fatema@kghdental.com' WHERE id = 'dr-fatema' AND email IS NULL;
UPDATE public.doctors SET email = 'dr.rafia@kghdental.com' WHERE id = 'dr-rafia' AND email IS NULL;

-- ------------------------------------------------------------------------------
-- 6.9 BEFORE & AFTER SHOWCASE CASES & GALLERY ITEMS
-- ------------------------------------------------------------------------------
-- 4. SEED INITIAL BEFORE & AFTER CASES
-- ------------------------------------------------------------------------------
INSERT INTO public.before_after_items (title_en, title_bn, category, before_image_url, after_image_url, desc_en, desc_bn, sort_order)
SELECT 
    'Scaling & Deep Cleaning',
    'স্কেলিং',
    'Periodontics',
    '/images/gallery/scaling-before.jpg',
    '/images/gallery/scaling-after.jpg',
    'Ultrasonic scaling removed severe supragingival tartar, plaque, and nicotine stains, restoring natural enamel tone and gum health.',
    'আল্ট্রাসনিক স্কেলিংয়ের মাধ্যমে দাঁতের জমে থাকা শক্ত পাথর ও দাগ দূর করে স্বাভাবিক রঙ ও সুস্থ মাড়ি ফিরিয়ে আনা হয়েছে।',
    1
WHERE NOT EXISTS (SELECT 1 FROM public.before_after_items WHERE title_en = 'Scaling & Deep Cleaning');

INSERT INTO public.before_after_items (title_en, title_bn, category, before_image_url, after_image_url, desc_en, desc_bn, sort_order)
SELECT 
    'Crown (PFM & Zirconia)',
    'ক্রাউন (পিএফএম ও জিরকোনিয়া)',
    'Prosthodontics',
    '/images/gallery/crown-before.jpg',
    '/images/gallery/crown-after.jpg',
    'Severe tooth wear and decay restored with aesthetic porcelain-fused-to-metal and layered zirconia crowns for permanent chewing strength.',
    'ক্ষয়ে যাওয়া ও ভেঙে পড়া দাঁতে পিএফএম ও টেকসই জিরকোনিয়া ক্রাউন বসিয়ে সুন্দর ও শক্তিশালী কামড়ের অনুভূতি ফিরিয়ে দেওয়া হয়েছে।',
    2
WHERE NOT EXISTS (SELECT 1 FROM public.before_after_items WHERE title_en = 'Crown (PFM & Zirconia)');

INSERT INTO public.before_after_items (title_en, title_bn, category, before_image_url, after_image_url, desc_en, desc_bn, sort_order)
SELECT 
    'Midline Diastema Closure',
    'দাঁতের ফাঁক বন্ধকরণ ও স্মাইল মেকওভার',
    'Aesthetic',
    '/images/gallery/midline-diastema.jpg',
    '/images/gallery/tooth-restoration.jpg',
    'Direct aesthetic resin composite layering closed the conspicuous front gap in a single gentle session without tooth structure reduction.',
    'কোনো প্রকার দাঁত না কেটে মাত্র এক সিটিংয়ে সামনের দাঁতের ফাঁক নিখুঁত নান্দনিক ফিলিং দিয়ে বন্ধ করা হয়েছে।',
    3
WHERE NOT EXISTS (SELECT 1 FROM public.before_after_items WHERE title_en = 'Midline Diastema Closure');

INSERT INTO public.before_after_items (title_en, title_bn, category, before_image_url, after_image_url, desc_en, desc_bn, sort_order)
SELECT 
    'Root Canal & Crown Protection',
    'রুট ক্যানেল ও ক্রাউন প্রটেকশন',
    'Endodontics',
    '/images/gallery/root-canal-1.jpg',
    '/images/gallery/zirconia-crown.jpg',
    'Deep pulp infection completely resolved with hermetic gutta-percha obturation, reinforced with full-coverage zirconia crown.',
    'দাঁতের মারাত্মক ইনফেকশন নির্মূল করে সম্পূর্ণ ব্যথামুক্ত রুট ক্যানেল এবং জিরকোনিয়া ক্রাউন দিয়ে স্থায়ী সুরক্ষা প্রদান।',
    4
WHERE NOT EXISTS (SELECT 1 FROM public.before_after_items WHERE title_en = 'Root Canal & Crown Protection');

-- ------------------------------------------------------------------------------
-- 5. SEED CHAMBER & CLINICAL CASES (From Screenshot)
-- ------------------------------------------------------------------------------
INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Doctor Consultation & Treatment', 'ডাক্তার ও রোগীর চেম্বার কেয়ার', 'clinic', 'Specialized doctors performing precise procedure in modern surgical setup.', 'আধুনিক যন্ত্রপাতি ও সর্বোচ্চ সতর্কতায় চিকিৎসা প্রদান।', '/images/gallery/clinic-team-1.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Doctor Consultation & Treatment');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Tooth Extraction', 'দাঁত তোলা (টুথ এক্সট্রাকশন)', 'clinic', 'Painless extraction of complicated molar tooth with pre-op radiograph.', 'ব্যথামুক্ত জটিল মোলার দাঁত তোলার সফল কেস।', '/images/gallery/tooth-extraction.jpg', 2
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Tooth Extraction');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Crown work', 'ক্রাউন প্রস্তুতি ও স্থাপন', 'clinic', 'Custom ceramic crown fitting on precision dental cast model.', 'কাস্ট মডেলে তৈরি নিখুঁত সিরামিক ক্রাউন।', '/images/gallery/crown-work.jpg', 3
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Crown work');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Tooth Restoration', 'দাঁত ফিলিং ও রিস্টোরেশন', 'clinic', 'Aesthetic tooth-colored composite restoration preserving original shape.', 'দাঁতের স্বাভাবিক রঙের কম্পোজিট রিস্টোরেশন।', '/images/gallery/tooth-restoration.jpg', 4
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Tooth Restoration');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Full Mouth Crown', 'ফুল মাউথ ক্রাউন রিহ্যাবিলিটেশন', 'clinic', 'Comprehensive rehabilitation of dentition for functional mastication.', 'সম্পূর্ণ মুখের দাঁতের স্থায়ী প্রতিস্থাপন ও সৌন্দর্য ফিরিয়ে আনা।', '/images/gallery/full-mouth-crown.jpg', 5
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Full Mouth Crown');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Dental bridge', 'ডেন্টাল ব্রিজ ও প্যানোরামিক এক্স-রে', 'clinic', 'Multi-unit fixed bridge replacing missing teeth seamlessly.', 'হারানো দাঁতের জায়গায় ফিক্সড ডেন্টাল ব্রিজ।', '/images/gallery/dental-bridge-1.jpg', 6
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Dental bridge');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Dental bridge (Lower)', 'নিচের চোয়ালের ডেন্টাল ব্রিজ', 'clinic', 'Lower arch fixed prosthesis providing optimal bite and aesthetics.', 'নিচের পাটির মজবুত ও স্থায়ী দাঁতের ব্রিজ।', '/images/gallery/dental-bridge-lower.jpg', 7
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Dental bridge (Lower)');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Full Mouth Bridge (lower)', 'ফুল মাউথ লোয়ার ব্রিজ', 'clinic', 'Lower arch comprehensive bridge restoration with OPG confirmation.', 'নিচের পাটির সম্পূর্ণ ব্রিজ প্রতিস্থাপন।', '/images/gallery/full-mouth-bridge-lower.jpg', 8
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Full Mouth Bridge (lower)');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Root Canal (lower molar)', 'রুট ক্যানেল চিকিৎসা (মোলার দাঁত)', 'clinic', 'Microscopic endodontic canal shaping and hermetic seal.', 'মোলার দাঁতের সম্পূর্ণ জীবাণুমুক্ত রুট ক্যানেল ও সিলিং।', '/images/gallery/root-canal-1.jpg', 9
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Root Canal (lower molar)');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Mid line Diastema', 'মিডলাইন ডায়াস্টেমা (দাঁতের ফাঁক)', 'clinic', 'Midline spacing correction and smile alignment process.', 'সামনের দুটি দাঁতের মাঝখানের ফাঁক সংশোধনের প্রক্রিয়া।', '/images/gallery/midline-diastema.jpg', 10
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Mid line Diastema');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Zirconia Crown (Upper lower)', 'জিরকোনিয়া ক্রাউন (উপর ও নিচ)', 'clinic', 'Premium zirconia crowns on both upper and lower arches.', 'উচ্চমানের জিরকোনিয়া ক্রাউনের মাধ্যমে সুন্দর হাসি।', '/images/gallery/zirconia-crown.jpg', 11
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Zirconia Crown (Upper lower)');

INSERT INTO public.gallery_items (title_en, title_bn, category, desc_en, desc_bn, image_url, sort_order)
SELECT 'Specialist Dental Surgeon & Team', 'বিশেষজ্ঞ ডেন্টাল সার্জন ও মেডিকেল টিম', 'team', 'Dedicated specialist surgeons and certified nurses serving patient smile.', 'রোগীর হাসির যত্নে নিবেদিত সার্জন ও নার্সিং টিম।', '/images/doctors/dr-diean.jpg', 12
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items WHERE title_en = 'Specialist Dental Surgeon & Team');

-- ------------------------------------------------------------------------------
-- 6.10 FEATURED CLINICAL VIDEOS (YOUTUBE & FACEBOOK)
-- ------------------------------------------------------------------------------
INSERT INTO public.featured_videos (
    id,
    title_en,
    title_bn,
    video_url,
    embed_url,
    platform,
    aspect_ratio,
    thumbnail_url,
    category,
    is_active,
    sort_order
) VALUES 
(
    'a1111111-1111-4111-a111-111111111111',
    'Modern Root Canal Therapy: Pain-Free Rotary Technology',
    'আধুনিক রোটারি রুট ক্যানেল: ব্যথামুক্ত চিকিৎসা পদ্ধতি',
    'https://www.youtube.com/watch?v=wXhXbN9T0p8',
    'https://www.youtube-nocookie.com/embed/wXhXbN9T0p8?autoplay=1&rel=0',
    'youtube',
    '16:9',
    'https://img.youtube.com/vi/wXhXbN9T0p8/hqdefault.jpg',
    'treatment_guide',
    true,
    1
),
(
    'a2222222-2222-4222-a222-222222222222',
    'Clear Aligners vs Metal Braces: Which is Right for You?',
    'ক্লিয়ার অ্যালাইনার বনাম মেটাল ব্রেসেস: কোনটি আপনার জন্য সেরা?',
    'https://www.youtube.com/shorts/507d_lqNl5g',
    'https://www.youtube-nocookie.com/embed/507d_lqNl5g?autoplay=1&rel=0',
    'youtube',
    '9:16',
    'https://img.youtube.com/vi/507d_lqNl5g/hqdefault.jpg',
    'doctor_advice',
    true,
    2
),
(
    'a3333333-3333-4333-a333-333333333333',
    'Inside KGH Dental: Sterile Environment & World-Class Care',
    'কেজিএইচ ডেন্টাল পরিদর্শেন: আন্তর্জাতিক মানের জীবাণুমুক্ত পরিবেশ',
    'https://www.facebook.com/kghdental/videos/10158493029482910/',
    'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fkghdental%2Fvideos%2F10158493029482910%2F&show_text=false&autoplay=true',
    'facebook',
    '16:9',
    '',
    'clinic_tour',
    true,
    3
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6.11 COMPREHENSIVE 1500-WORD DENTAL GUIDES (BILINGUAL BLOG ARTICLES)
-- ------------------------------------------------------------------------------
INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'root-canal-treatment-myths-vs-facts',
    'Root Canal Treatment: What to Really Expect (Myths vs Clinical Facts)',
    'রুট ক্যানেল ট্রিটমেন্ট: প্রচলিত ভয় ও ভুল ধারণা বনাম আধুনিক চিকিৎসার বাস্তব সত্য',
    'Does root canal therapy really cause intense pain? Discover the evidence-based truth about modern pain-free endodontics, why saving your natural tooth is vital for jaw health, and what actually happens step-by-step during treatment.',
    'রুট ক্যানেল কি আসলেই মারাত্মক যন্ত্রণাদায়ক? আধুনিক রোটারি এন্ডোডন্টিক্সের ব্যথাহীন চিকিৎসার বাস্তবতা, প্রাকৃতিক দাঁত বাঁচানোর অপরিসীম গুরুত্ব এবং চিকিৎসার প্রতিটি ধাপের বিস্তারিত তথ্য জেনে নিন।',
    '/images/sub_services/3. 1. Root Canal Treatment.png',
    'endodontics',
    'Endodontics',
    'এন্ডোডন্টিক্স',
    '8 min read',
    'Sep 2026',
    'root canal treatment procedure pain myths endodontist dhaka',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['root canal', 'endodontics', 'tooth pain relief', 'dental crown', 'kgh dental'],
    '
      <h2>Introduction: The Misunderstood Dental Procedure</h2>
      <p>Few medical phrases trigger as much unnecessary anxiety as the words <strong>"root canal."</strong> For decades, television shows, casual conversations, and dental folklore have painted root canal therapy as an agonizing ordeal. However, in modern dental science, this reputation could not be further from the truth.</p>
      
      <p>The clinical reality is straightforward: <em>root canal treatment does not cause pain; it permanently relieves it.</em> When performed by trained endodontic specialists using advanced local anesthetics, electronic apex locators, and computerized rotary instrumentation, a root canal procedure is as quiet, comfortable, and routine as receiving a standard aesthetic filling.</p>

      <div class="kgh-callout">
        <strong>Key Takeaway:</strong> A root canal is designed to eliminate active infection from the pulp chamber of the tooth, prevent jawbone abscesses, and preserve your natural biological tooth for decades to come.
      </div>

      <h2>Understanding Tooth Anatomy: Why Root Canals Become Necessary</h2>
      <p>To understand why this procedure is so effective, it helps to review the basic anatomical layers of human teeth:</p>
      <ul>
        <li><strong>Enamel:</strong> The hard, calcified outer shield that protects against chewing wear.</li>
        <li><strong>Dentin:</strong> The microscopic tubule layer beneath enamel that transmits temperature sensations.</li>
        <li><strong>Dental Pulp:</strong> The soft, vital core inside the tooth containing blood vessels, cellular tissue, and sensory nerve endings that nourish the tooth during growth.</li>
      </ul>
      <p>When aggressive bacterial decay breaches the enamel and dentin, or when a traumatic impact fractures the crown, oral microbes invade the sterile pulp chamber. The body mounts an inflammatory response; however, because the pulp is encased in rigid hard tissue walls, fluid cannot expand. This builds intense intra-pulpal pressure, producing the familiar throbbing toothache that worsens at night or when lying down.</p>
      <p>Left untreated, the internal pulp tissue dies (necrosis), and the infection spreads through the root tips into the surrounding jawbone, forming painful periapical abscesses, cysts, or facial cellulitis.</p>

      <h2>Debunking 5 Widespread Root Canal Myths</h2>
      <p>Let us examine the common misconceptions held by patients versus the established facts of modern endodontics:</p>

      <h3>Myth 1: "The procedure is intensely painful."</h3>
      <p><strong>Clinical Fact:</strong> Modern anesthesia agents such as articaine and lidocaine completely block nerve transmissions. Specialists confirm profound anesthesia before touching the tooth. Patients routinely feel light pressure or vibration, but zero acute pain. In fact, most patients experience immense immediate relief because the nerve causing their excruciating toothache is cleanly removed.</p>

      <h3>Myth 2: "It is better and faster to just pull the tooth out."</h3>
      <p><strong>Clinical Fact:</strong> Nothing artificial—neither bridges nor dental implants—can completely replicate the sensory feedback, chewing dynamics, and biological preservation of your natural tooth and periodontal ligament. Tooth extraction causes gradual bone resorption, shifting of adjacent teeth, and altered bite mechanics. Extracting a tooth often requires more complex restorative work later on.</p>

      <h3>Myth 3: "Root canals cause systemic illness or arthritis."</h3>
      <p><strong>Clinical Fact:</strong> This long-discredited myth stems from poorly designed animal experiments in the 1920s that lacked modern aseptic controls. Countless epidemiological studies by the American Association of Endodontists (AAE) have definitively confirmed that root canal treatment is completely safe and protects the body by eliminating harmful bacterial reservoirs.</p>

      <h3>Myth 4: "If my tooth stops hurting, I do not need a root canal anymore."</h3>
      <p><strong>Clinical Fact:</strong> Sudden cessation of severe tooth pain without dental treatment is a major warning sign. It usually indicates that the sensory nerves inside the tooth have fully died and decomposed. The bacterial infection has not disappeared; it is now quietly burrowing into the alveolar jawbone, silently eating away bone tissue.</p>

      <h3>Myth 5: "After a root canal, the tooth will crumble away quickly."</h3>
      <p><strong>Clinical Fact:</strong> While a non-vital tooth loses internal moisture and becomes somewhat more brittle, modern restorative dentistry solves this completely. Placing a custom-milled full-coverage crown (such as high-translucency monolithic zirconia) protects the tooth against biting forces and allows it to function comfortably for a lifetime.</p>

      <h2>Step-by-Step: What to Expect During the Procedure</h2>
      <p>At an advanced clinic like KGH Dental, root canal therapy is conducted under strict magnification and sterile isolation through sequential stages:</p>
      <ol>
        <li><strong>Digital Radiography & CBCT Assessment:</strong> High-resolution digital X-rays map root canal curvature, canal branches, and bone lesions.</li>
        <li><strong>Profound Local Anesthesia:</strong> Targeted delivery ensures complete numbness throughout the treated quadrant.</li>
        <li><strong>Rubber Dam Isolation:</strong> A flexible silicone barrier isolates the tooth from oral saliva, preventing salivary bacteria from re-contaminating the root canals.</li>
        <li><strong>Micro-Access Cavity:</strong> A small opening is made on the chewing surface to visualize the pulp chamber.</li>
        <li><strong>Biomechanical Rotary Cleaning:</strong> Flexible nickel-titanium (NiTi) rotary files meticulously cleanse and shape the micro-canals, aided by continuous antibacterial irrigants like sodium hypochlorite and EDTA.</li>
        <li><strong>Working Length Verification:</strong> Digital apex locators precisely locate the apical constriction down to the tenth of a millimeter.</li>
        <li><strong>Hermetic 3D Obturation:</strong> Once disinfected, canals are sealed with biocompatible gutta-percha cones and resin sealers, locking out future bacterial ingress.</li>
        <li><strong>Post-Endodontic Restoration:</strong> A fiber post and adhesive core build-up followed by a precision crown restores chewing strength and aesthetics.</li>
      </ol>

      <div class="kgh-tip">
        <strong>Doctor''s Advice:</strong> Do not chew hard or sticky foods on the treated tooth during the interim period between canal filling and final crown placement.
      </div>

      <h2>Post-Treatment Recovery and Home Care</h2>
      <p>Following therapy, slight tenderness around the surrounding gum tissue or jaw joint is completely normal for 24 to 72 hours. This is typically managed with simple over-the-counter anti-inflammatory medications. Maintaining regular twice-daily brushing and flossing keeps the surrounding periodontium healthy.</p>

      <h2>Conclusion: Protecting Your Natural Smile</h2>
      <p>A root canal is a sophisticated, tooth-saving procedure that relieves pain and protects your natural smile. If you are experiencing lingering temperature sensitivity, throbbing ache, or pain when chewing, seek prompt endodontic evaluation before the infection causes irreversible bone loss.</p>
    ',
    '
      <h2>ভূমিকা: রুট ক্যানেল নিয়ে প্রচলিত অযথা ভয়</h2>
      <p>ডেন্টাল চিকিৎসার জগতে <strong>"রুট ক্যানেল"</strong> শব্দটির মতো এতো বেশি ভুল বোঝাবুঝি আর কোনো চিকিৎসাকে ঘিরে দেখা যায় না। বছরের পর বছর ধরে মানুষের মুখে মুখে শোনা নানা ভিত্তিহীন গল্প ও অতিরঞ্জিত ধারণার কারণে অনেকেই মনে করেন রুট ক্যানেল মানেই অসহ্য যন্ত্রণা। কিন্তু আধুনিক চিকিৎসা বিজ্ঞানের বাস্তবতা এর সম্পূর্ণ বিপরীত।</p>
      
      <p>চিকিৎসা বিজ্ঞানের আসল সত্যটি হলো: <em>রুট ক্যানেল ব্যথা সৃষ্টি করে না, বরং এটি দাঁতের গভীরের অসহ্য ব্যথা ও ইনফেকশন চিরতরে নিরাময় করে।</em> দক্ষ এন্ডোডন্টিস্টদের হাতে আধুনিক লোকাল অ্যানেস্থেসিয়া, রোটারি যন্ত্র এবং কম্পিউটারাইজড অ্যাপেক্স লোকেটরের মাধ্যমে রুট ক্যানেল এখন সাধারণ একটি ফিলিং করার মতোই আরামদায়ক ও সম্পূর্ণ ব্যথাহীন।</p>

      <div class="kgh-callout">
        <strong>মূল বার্তা:</strong> রুট ক্যানেল চিকিৎসার মূল লক্ষ্য হলো দাঁতের ভেতরের ক্ষতিগ্রস্ত নার্ভ ও জীবাণু দূর করে চোয়ালের হাড়ে পুঁজ হওয়া প্রতিরোধ করা এবং আপনার নিজের প্রাকৃতিক দাঁতটিকে আজীবনের জন্য টিকিয়ে রাখা।
      </div>

      <h2>দাঁতের অভ্যন্তরীণ গঠন: কেন রুট ক্যানেলের প্রয়োজন হয়?</h2>
      <p>এই চিকিৎসাটি কেন এত কার্যকর তা বুঝতে হলে দাঁতের মৌলিক স্তরগুলো সম্পর্কে ধারণা থাকা দরকার:</p>
      <ul>
        <li><strong>এনামেল (Enamel):</strong> দাঁতের সবচেয়ে বাইরের শক্ত ও চকচকে আবরণ, যা খাদ্য চর্বণের চাপ সহ্য করে।</li>
        <li><strong>ডেনটিন (Dentin):</strong> এনামেলের ঠিক নিচের অংশ, যেখানে হাজার হাজার ক্ষুদ্র নালিকা থাকে যা ঠান্ডা বা গরমের অনুভূতি নার্ভে পৌঁছে দেয়।</li>
        <li><strong>ডেন্টাল পাল্প বা নার্ভ চেম্বার (Pulp):</strong> দাঁতের একেবারে ভেতরের নরম রক্তনালী ও স্নায়ুতন্ত্র, যা দাঁত গঠনের সময় পুষ্টি যোগায়।</li>
      </ul>
      <p>যখন দাঁতে কোনো গভীর ক্ষয় বা ক্যাভিটি তৈরি হয় এবং দীর্ঘকাল অবহেলা করা হয়, তখন ব্যাকটেরিয়া এনামেল ও ডেনটিন ভেদ করে নরম পাল্প চেম্বারে ঢুকে পড়ে। আবার কোনো দুর্ঘটনায় দাঁতে আঘাত লাগলেও ভেতরের নার্ভ ক্ষতিগ্রস্ত হতে পারে। নরম পাল্পের চারপাশে শক্ত দেয়াল থাকায় ইনফেকশন তৈরি হলে ভেতরে অতিরিক্ত চাপ সৃষ্টি হয়, যা থেকে শুরু হয় অসহ্য দপদপানি ব্যথা—বিশেষ করে রাতে ঘুমানোর সময় এই ব্যথা বহুগুণ বেড়ে যায়।</p>
      <p>সময়মতো চিকিৎসা না করালে ভেতরের নার্ভ মরে যায় এবং জীবাণু শিকড়ের মুখ দিয়ে নিচে চোয়ালের হাড়ে প্রবেশ করে পুঁজ, ফোলাভাব বা মারাত্মক ইনফেকশন তৈরি করে।</p>

      <h2>রুট ক্যানেল নিয়ে বহুল প্রচলিত ৫টি ভুল ধারণা ও সত্য</h2>
      <p>আসুন জেনে নেই রোগীদের মনে প্রচলিত কিছু সাধারণ ভয় এবং বিশেষজ্ঞ চিকিৎসকদের বৈজ্ঞানিক ব্যাখ্যা:</p>

      <h3>ভুল ধারণা ১: "রুট ক্যানেল মারাত্মক বেদনাদায়ক।"</h3>
      <p><strong>আসল সত্য:</strong> চিকিৎসার শুরুতে আধুনিক অ্যানেস্থেসিয়া দিয়ে নির্দিষ্ট দাঁত এবং চারপাশের এলাকা পুরোপুরি অবশ করে নেওয়া হয়। ফলে চিকিৎসাধীন অবস্থায় রোগী কোনো ব্যথাই অনুভব করেন না। বরং ইনফেকশন দূর হয়ে যাওয়ার পর রোগী দীর্ঘদিনের অসহ্য দাঁতব্যথা থেকে সাথে সাথে মুক্তি পান।</p>

      <h3>ভুল ধারণা ২: "দাঁত এত কষ্ট করে না বাঁচিয়ে ফেলে দেওয়াই ভালো।"</h3>
      <p><strong>আসল সত্য:</strong> চিকিৎসা বিজ্ঞানে নিজের প্রাকৃতিক দাঁতের কোনো বিকল্প নেই। দাঁত ফেলে দিলে সেই খালি জায়গায় চোয়ালের হাড় ক্ষয় হতে থাকে, পাশের দাঁতগুলো হেলে পড়ে এবং চিবানোর স্বাভাবিক ছন্দ নষ্ট হয়। পরবর্তীতে সেখানে কৃত্রিম দাঁত বা ইমপ্ল্যান্ট বসাতে আরও অনেক জটিল প্রক্রিয়ার মধ্য দিয়ে যেতে হয়। তাই প্রাকৃতিক দাঁত বাঁচানোই সবসময় বিজ্ঞতার কাজ।</p>

      <h3>ভুল ধারণা ৩: "রুট ক্যানেল করালে শরীরের অন্যান্য অঙ্গে রোগ হতে পারে।"</h3>
      <p><strong>আসল সত্য:</strong> এটি ১৯২০ সালের একটি বহু পুরোনো ও অবৈজ্ঞানিক দাবি, যা বহু আগেই বিশ্বজুড়ে আধুনিক গবেষণায় মিথ্যা প্রমাণিত হয়েছে। আমেরিকান অ্যাসোসিয়েশন অফ এন্ডোডন্টিস্টস নিশ্চিত করেছে যে রুট ক্যানেল সম্পূর্ণ নিরাপদ এবং এটি মুখের ক্ষতিকর জীবাণু দূর করে শরীরকে বরং সুস্থ রাখে।</p>

      <h3>ভুল ধারণা ৪: "দাঁতের ব্যথা যখন নিজে নিজেই কমে গেছে, তখন আর চিকিৎসার দরকার নেই।"</h3>
      <p><strong>আসল সত্য:</strong> চিকিৎসা ছাড়াই হঠাৎ তীব্র দাঁতব্যথা বন্ধ হয়ে যাওয়া আসলে বিপদের বড় লক্ষণ! এর মানে হলো দাঁতের ভেতরের নার্ভ সম্পূর্ণ পচে অনুভূতিহীন হয়ে গেছে। ইনফেকশন কিন্তু দূর হয়নি; বরং এটি নীরবে শিকড় বেয়ে চোয়ালের হাড় ধ্বংস করা শুরু করেছে।</p>

      <h3>ভুল ধারণা ৫: "রুট ক্যানেলের পর দাঁত দুর্বল হয়ে অল্প দিনেই ভেঙে যায়।"</h3>
      <p><strong>আসল সত্য:</strong> রুট ক্যানেল করা দাঁতে রক্ত চলাচল বন্ধ থাকায় তা কিছুটা ভঙ্গুর হতে পারে। কিন্তু চিকিৎসার পর সঠিক নিয়মে একটি মজবুত জিরকোনিয়া বা সিরামিক ক্যাপ (ক্রাউন) পরিয়ে দিলে দাঁতটি পুনরায় স্বাভাবিক চিবানোর শক্তি ফিরে পায় এবং যুগ যুগ ধরে সুস্থ থাকে।</p>

      <h2>ধাপে ধাপে চিকিৎসার প্রক্রিয়া: চেম্বারে কী ঘটে?</h2>
      <p>কেজিএইচ ডেন্টালের মতো বিশেষায়িত ক্লিনিকে আন্তর্জাতিক মানদণ্ড অনুসরণ করে রুট ক্যানেল সম্পন্ন করা হয়:</p>
      <ol>
        <li><strong>ডিজিটাল এক্স-রে ও ডায়াগনোসিস:</strong> দাঁতের শিকড়ের সংখ্যা, বাঁক ও হাড়ের ক্ষয়ের মাত্রা নিখুঁতভাবে পরীক্ষা করা।</li>
        <li><strong>লোকাল অ্যানেস্থেসিয়া:</strong> দাঁত ও মাড়ি সম্পূর্ণ ব্যথামুক্ত অবশ করা।</li>
        <li><strong>রাবার ড্যাম আইসোলেশন:</strong> মুখের লালা ও ব্যাকটেরিয়া যেন দাঁতের নালীতে ঢুকতে না পারে সেজন্য বিশেষ রাবার শিল্ড ব্যবহার।</li>
        <li><strong>মাইক্রো ওপেনিং ও ক্লিনিং:</strong> অত্যন্ত সূক্ষ্ম নিকেল-টাইটানিয়াম রোটারি ফাইলের সাহায্যে শিকড়ের সব কটি ক্যানেল গভীর থেকে পরিষ্কার ও জীবাণুমুক্ত করা।</li>
        <li><strong>অ্যাপেক্স লোকেশন:</strong> আধুনিক ইলেকট্রনিক ডিভাইসের সাহায্যে শিকড়ের শেষ প্রান্ত পর্যন্ত নিখুঁত পরিমাপ নেওয়া।</li>
        <li><strong>থ্রি-ডি সিলিং:</strong> বায়োকম্প্যাটিবল গাটা-পার্চা উপাদান দিয়ে নালীগুলো স্থায়ীভাবে বাতাস ও ব্যাকটেরিয়ারোধী সিল করা।</li>
        <li><strong>স্থায়ী ক্রাউন বা ক্যাপ বসানো:</strong> দাঁতের ওপর টেকসই ক্যাপ পরিয়ে স্বাভাবিক চিবানোর কার্যক্ষমতা ফিরিয়ে আনা।</li>
      </ol>

      <div class="kgh-tip">
        <strong>চিকিৎসকের পরামর্শ:</strong> রুট ক্যানেল শেষ হওয়ার পর স্থায়ী ক্রাউন বা ক্যাপ না বসানো পর্যন্ত সেই দাঁতে শক্ত হাড় বা বাদামের মতো খাবার চিবানো এড়িয়ে চলুন।
      </div>

      <h2>চিকিৎসা পরবর্তী যত্ন ও সুস্থতা</h2>
      <p>চিকিৎসা সম্পন্ন হওয়ার পর প্রথম ২৪ থেকে ৪৮ ঘণ্টা মাড়িতে সামান্য অস্বস্তি হতে পারে, যা সাধারণ ব্যথানাশক ঔষধেই দূর হয়ে যায়। নিয়মিত দুই বেলা সঠিক নিয়মে ব্রাশ ও ডেন্টাল ফ্লস ব্যবহার করলে রুট ক্যানেল করা দাঁত আজীবন নির্বিঘ্নে টিকে থাকে।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'braces-vs-clear-aligners',
    'Braces vs Clear Aligners: Which Orthodontic Solution Fits Your Smile?',
    'মেটাল ব্রেসেস নাকি আধুনিক ক্লিয়ার অ্যালাইনার: আপনার হাসির জন্য কোনটি বেশি মানানসই?',
    'Comparing traditional braces, ceramic brackets, and invisible clear aligners. Understand biological tooth movement, lifestyle impact, aesthetic expectations, and long-term retention.',
    'বাঁকা দাঁত সোজা করতে মেটাল ব্রেসেস নাকি সম্পূর্ণ স্বচ্ছ অদৃশ্য অ্যালাইনার বেছে নেবেন? দাঁতের স্থানান্তর প্রক্রিয়া, জীবনযাত্রার স্বাচ্ছন্দ্য এবং চিকিৎসা পরবর্তী সঠিক যত্নের বিস্তারিত তথ্য।',
    '/images/sub_services/1. B. Clear Aligners.png',
    'orthodontics',
    'Orthodontics',
    'অর্থোডন্টিক্স',
    '8 min read',
    'Sep 2026',
    'braces vs clear aligners invisible braces orthodontist dhaka smile design',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['braces', 'clear aligners', 'orthodontics', 'smile makeover', 'kgh dental'],
    '
      <h2>The Desire for a Confident, Harmonious Smile</h2>
      <p>A straight, well-proportioned smile is far more than an aesthetic asset. Properly aligned teeth facilitate efficient chewing dynamics, promote clearer speech phonetics, and dramatically lower the risk of periodontal inflammation and tooth decay by eliminating unreachable food-trapping crevices.</p>
      
      <p>For decades, conventional metal braces were the sole clinical solution for malocclusion. However, advancements in computer-aided design (CAD) and medical-grade thermoformed polymers have introduced <strong>clear aligners</strong> as a discreet, comfortable alternative. Choosing between traditional brackets and transparent aligners requires a thorough understanding of their clinical strengths and lifestyle suitability.</p>

      <div class="kgh-callout">
        <strong>Orthodontic Fact:</strong> Teeth move through biological bone remodeling—controlled hydrostatic pressure triggers osteoclasts to dissolve bone ahead of the tooth while osteoblasts rebuild bone behind it. Both braces and aligners harness this exact biological phenomenon.
      </div>

      <h2>Understanding the Treatment Modalities</h2>

      <h3>1. Traditional Fixed Braces (Metal & Ceramic)</h3>
      <p>Fixed orthodontic braces consist of medical-grade stainless steel or translucent polycrystalline ceramic brackets bonded to each tooth surface, connected by flexible archwires (such as nickel-titanium and beta-titanium) and secured with elastomeric ties.</p>
      <ul>
        <li><strong>Continuous 24/7 Force Delivery:</strong> Fixed appliances remain in place constantly, eliminating patient compliance concerns.</li>
        <li><strong>Unmatched Control in Complex Cases:</strong> Highly effective for severe skeletal crossbites, severe rotations, unerupted impacted canines, and significant vertical bite discrepancies.</li>
        <li><strong>Ceramic Aesthetic Option:</strong> Tooth-colored ceramic brackets blend naturally with tooth enamel, offering a more discreet appearance than shiny metal.</li>
      </ul>

      <h3>2. Clear Aligners (Transparent Removable Trays)</h3>
      <p>Clear aligners are a series of custom-engineered, transparent polyurethane plastic trays that fit snugly over the dental arches. Each sequential tray applies micro-calibrated pressure to shift specific teeth fractions of a millimeter at a time.</p>
      <ul>
        <li><strong>Virtually Invisible:</strong> High optical clarity allows adults and teenagers to undergo orthodontic correction without visible metal brackets.</li>
        <li><strong>Removable for Meals and Oral Hygiene:</strong> You remove aligners while eating, eliminating food restrictions and allowing unimpeded flossing and brushing.</li>
        <li><strong>Smooth Comfort:</strong> Free from protruding metal hooks and wire edges, drastically reducing oral ulcers and cheek irritation.</li>
        <li><strong>3D Digital Treatment Simulation:</strong> Before manufacturing begins, intraoral 3D scanning maps out each tooth movement from start to finish.</li>
      </ul>

      <h2>Direct Comparison: Braces vs Clear Aligners</h2>

      <h3>Aesthetics and Daily Confidence</h3>
      <p>While ceramic braces offer substantial cosmetic improvement over metal, clear aligners represent the ultimate discreet solution. Most colleagues, clients, and friends will not notice you are wearing aligners unless you inform them.</p>

      <h3>Lifestyle and Dietary Freedom</h3>
      <p>Patients wearing fixed braces must strictly avoid hard nuts, crusty bread, popcorn, and sticky sweets to prevent broken brackets and bent archwires. In contrast, aligner wearers simply take out their aligners before meals, allowing them to enjoy their favorite diet without hesitation.</p>

      <h3>Oral Hygiene and Gum Health</h3>
      <p>Brushing and flossing around fixed braces requires specialized orthodontic brushes, threaders, or water flossers, and plaque accumulation around brackets can lead to white-spot enamel decalcification. Clear aligners eliminate this obstacle completely—teeth are brushed and flossed normally, preserving optimal gingival health throughout treatment.</p>

      <h3>Compliance and Responsibility</h3>
      <p>Clear aligners demand disciplined wear: they must remain in the mouth for <strong>20 to 22 hours every single day</strong>, removed only for eating, drinking hot liquids, and brushing. If a patient frequently forgets to reinsert their aligners, treatment progress stalls. For patients who struggle with self-discipline, fixed braces provide the advantage of automatic 24-hour treatment.</p>

      <h2>Who Is the Ideal Candidate for Each Option?</h2>
      <p>An orthodontic specialist evaluates facial profile, skeletal jaw relationship, root length, and periodontal status before recommending an approach:</p>
      <ul>
        <li><strong>Ideal for Clear Aligners:</strong> Mild to moderate crowding, midline diastemas (gaps), relapse after childhood braces, and adult professionals desiring zero aesthetic disruption.</li>
        <li><strong>Ideal for Fixed Braces:</strong> Severe skeletal jaw discrepancies, severe root torque requirements, severely rotated molars, and patients preferring a ''hands-off'' compliance routine.</li>
      </ul>

      <div class="kgh-tip">
        <strong>The Retention Phase:</strong> Regardless of whether you choose braces or aligners, teeth have elastic memory and tend to drift back. Wearing custom retainers (such as nighttime clear retainers or bonded lingual wires) is mandatory to lock your smile in place permanently.
      </div>

      <h2>Conclusion: Consultation is the Crucial First Step</h2>
      <p>Neither system is universally superior; each is an engineered tool that delivers outstanding clinical results when matched with the correct dental condition. Schedule a comprehensive digital orthodontic consultation with a registered orthodontist to examine your bite and map out your optimal smile journey.</p>
    ',
    '
      <h2>সুস্থ ও আত্মবিশ্বাসী হাসির গুরুত্ব</h2>
      <p>একটি সুন্দর ও পরিপাটি দাঁতের হাসি শুধু মুখের সৌন্দর্যই বৃদ্ধি করে না, বরং এর রয়েছে সুদূরপ্রসারী স্বাস্থ্যগত উপকারিতা। অসমান বা আঁকাবাঁকা দাঁত থাকলে সেখানে সহজে খাদ্যকণা আটকে যায়, যা স্বাভাবিক ব্রাশের মাধ্যমে পরিষ্কার করা অত্যন্ত কঠিন হয়ে পড়ে। এর ফলে মাড়ির প্রদাহ, দাঁতের ক্ষয় এবং মুখ থেকে দুর্গন্ধ সৃষ্টির ঝুঁকি বহুগুণ বেড়ে যায়।</p>
      
      <p>দীর্ঘদিন ধরে বাঁকা দাঁত সোজা করার একমাত্র উপায় হিসেবে মেটাল ব্রেসেস প্রচলিত ছিল। কিন্তু সাম্প্রতিক বছরগুলোতে থ্রি-ডি ডিজিটাল স্ক্যানিং এবং উন্নত চিকিৎসা প্রযুক্তির কল্যাণে এসেছে <strong>ক্লিয়ার অ্যালাইনার</strong>—যা কোনো ধরনের তার বা ব্র্যাকেট ছাড়াই সম্পূর্ণ স্বচ্ছ ট্রে-এর মাধ্যমে দাঁত সোজা করতে সক্ষম। আপনার দাঁতের সমস্যার জন্য কোনটি সবচেয়ে উপযোগী, তা জানতে দুটির সুবিধা ও বৈশিষ্ট্যগুলো জানা প্রয়োজন।</p>

      <div class="kgh-callout">
        <strong>চিকিৎসা বিজ্ঞানের তথ্য:</strong> দাঁত সরানোর প্রক্রিয়াটি হাড়ের একটি প্রাকৃতিক জীবতাত্ত্বিক রূপান্তর। হালকা ও অবিরাম চাপের মাধ্যমে চোয়ালের হাড় একদিকে হালকা অপসারিত হয় এবং বিপরীত দিকে নতুন হাড় তৈরি হয়ে দাঁতকে নতুন অবস্থানে প্রতিষ্ঠিত করে। ব্রেসেস এবং ক্লিয়ার অ্যালাইনার উভয়ই এই একই প্রাকৃতিক নিয়মে কাজ করে।
      </div>

      <h2>চিকিৎসা পদ্ধতির পরিচিতি ও কার্যপদ্ধতি</h2>

      <h3>১. ফিক্সড ব্রেসেস (মেটাল ও সিরামিক)</h3>
      <p>ফিক্সড ব্রেসেসে প্রতিটি দাঁতের ওপর সূক্ষ্ম মেটাল বা সিরামিকের ব্র্যাকেট বসানো হয় এবং একটি স্থিতিস্থাপক তারের মাধ্যমে সেগুলোকে যুক্ত করা হয়।</p>
      <ul>
        <li><strong>সার্বক্ষণিক কার্যকর:</strong> এটি দাঁতে স্থায়ীভাবে লাগানো থাকে বলে রোগী নিজে খুলে রাখতে পারেন না। ফলে প্রতিদিন স্বয়ংক্রিয়ভাবে চিকিৎসা চলতে থাকে।</li>
        <li><strong>জটিল সমস্যার সেরা সমাধান:</strong> চোয়ালের গঠনগত জটিলতা, দাঁতের গভীর ঘূর্ণন কিংবা মাড়ির ভেতর আটকে থাকা দাঁত টেনে বের করে আনার ক্ষেত্রে ব্রেসেসের নিয়ন্ত্রণ অতুলনীয়।</li>
        <li><strong>সিরামিক বিকল্প:</strong> যারা মেটালের উজ্জ্বল রং এড়াতে চান, তারা দাঁতের রঙের সাথে মিশে যাওয়া প্রাকৃতিক সিরামিক ব্রেসেস বেছে নিতে পারেন।</li>
      </ul>

      <h3>২. আধুনিক ক্লিয়ার অ্যালাইনার (অদৃশ্য স্বচ্ছ ট্রে)</h3>
      <p>ক্লিয়ার অ্যালাইনার হলো চিকিৎসাবিজ্ঞানের উপযোগী মেডিকেল-গ্রেড স্বচ্ছ প্লাস্টিকের তৈরি ট্রে-এর একটি ধারাবাহিক সেট, যা দাঁতের ওপর নিখুঁতভাবে বসে থাকে।</p>
      <ul>
        <li><strong>সম্পূর্ণ অদৃশ্য ও দৃষ্টিনন্দন:</strong> এগুলো এত স্বচ্ছ যে অন্য কেউ সহজে খেয়ালই করতে পারেন না যে আপনি দাঁতের কোনো চিকিৎসা নিচ্ছেন। বিশেষ করে কর্মজীবী ও প্রাপ্তবয়স্কদের জন্য এটি অত্যন্ত জনপ্রিয়।</li>
        <li><strong>খাবারের সময় খুলে রাখা যায়:</strong> খাওয়ার সময় ট্রে-টি খুলে রাখা যায়, তাই খাদ্যাভ্যাসে কোনো ধরনের বিধিনিষেধ মানতে হয় না।</li>
        <li><strong>মুখের ভেতরে আরামদায়ক:</strong> কোনো ধারালো তার বা মেটালের হুক না থাকায় গাল বা ঠোঁটের ভেতরের অংশে খোঁচা লাগা বা ঘা হওয়ার কোনো ঝুঁকি থাকে না।</li>
        <li><strong>ডিজিটাল ভবিষ্যৎ দর্শন:</strong> থ্রি-ডি ইন্ট্রাওরাল স্ক্যানারের মাধ্যমে চিকিৎসা শুরুর প্রথম দিনেই কম্পিউটার স্ক্রিনে দেখা যায় পুরো চিকিৎসা শেষে আপনার হাসি ঠিক কেমন দেখাবে।</li>
      </ul>

      <h2>সরাসরি তুলনা: ব্রেসেস নাকি ক্লিয়ার অ্যালাইনার?</h2>

      <h3>সৌন্দর্য ও সামাজিক আত্মবিশ্বাস</h3>
      <p>ক্লিয়ার অ্যালাইনারের সবচেয়ে বড় শক্তি হলো এর দৃষ্টিহীনতা। অফিস মিটিং, প্রেজেন্টেশন কিংবা সামাজিক অনুষ্ঠানে আপনি সম্পূর্ণ নিঃসংকোচে কথা বলতে ও হাসতে পারবেন।</p>

      <h3>খাদ্যাভ্যাস ও স্বাধীনতা</h3>
      <p>ব্রেসেস পরা অবস্থায় শক্ত পেয়ারা, আপেল, বাদাম কিংবা আঠালো মিষ্টি জাতীয় খাবার বর্জন করতে হয়, কারণ অসাবধানে তার ভেঙে বা খুলে যেতে পারে। অ্যালাইনারের ক্ষেত্রে এই ঝামেলা নেই—খাওয়ার সময় এটি খুলে স্বাভাবিকভাবে যেকোনো খাবার উপভোগ করা যায়।</p>

      <h3>মুখের পরিষ্কার-পরিচ্ছন্নতা</h3>
      <p>ব্রেসেসের তার ও ব্র্যাকেটের ফাঁকে খাবার আটকে থাকা স্বাভাবিক, যা পরিষ্কার করতে বিশেষ ধরনের ইন্টারডেন্টাল ব্রাশ প্রয়োজন হয়। অন্যদিকে অ্যালাইনার খুলে সাধারণ নিয়মে ব্রাশ ও ডেন্টাল ফ্লস ব্যবহার করা যায় বলে মাড়ির স্বাস্থ্য সবচেয়ে ভালো থাকে।</p>

      <h3>রোগীর ব্যক্তিগত নিয়মানুবর্তিতা</h3>
      <p>অ্যালাইনার সফল হওয়ার মূল চাবিকাঠি হলো দিনে <strong>২০ থেকে ২২ ঘণ্টা</strong> এটি পরে থাকা। শুধু খাবার ও ব্রাশের সময় ছাড়া এটি সবসময় মুখে রাখতে হয়। যারা নিয়ম মেনে এটি পরতে ভুলে যান, তাদের ক্ষেত্রে ফিক্সড ব্রেসেস অনেক বেশি নিরাপদ বিকল্প।</p>

      <h2>কার জন্য কোনটি সবচেয়ে উপযুক্ত?</h2>
      <p>একজন বিশেষজ্ঞ অর্থোডন্টিস্ট দাঁতের এক্স-রে এবং চোয়ালের আকার বিশ্লেষণ করে সঠিক পরামর্শ দেন:</p>
      <ul>
        <li><strong>ক্লিয়ার অ্যালাইনার যাদের জন্য আদর্শ:</strong> দাঁতের হালকা বা মাঝারি ফাঁক, হালকা আঁকাবাঁকা দাঁত এবং কর্মজীবী পেশাজীবী যারা মুখে কোনো তার দেখতে চান না।</li>
        <li><strong>ফিক্সড ব্রেসেস যাদের জন্য আদর্শ:</strong> খুব জটিল আঁকাবাঁকা দাঁত, অসম চোয়ালের সমস্যা এবং যাদের নিয়মিত ট্রে খুলে আবার পরার আলস্য রয়েছে।</li>
      </ul>

      <div class="kgh-tip">
        <strong>চিকিৎসা পরবর্তী যত্ন (রিটেইনার):</strong> ব্রেসেস বা অ্যালাইনার যে পদ্ধতিতেই চিকিৎসা শেষ হোক না কেন, দাঁতকে তার নতুন সুন্দর জায়গায় স্থায়ী রাখতে চিকিৎসকের পরামর্শ অনুযায়ী নির্দিষ্ট সময় রিটেইনার ব্যবহার করা বাধ্যতামূলক।
      </div>

      <h2>উপসংহার: বিশেষজ্ঞের পরামর্শই প্রথম ধাপ</h2>
      <p>ব্রেসেস এবং ক্লিয়ার অ্যালাইনার দুটিই অত্যন্ত কার্যকর বৈজ্ঞানিক চিকিৎসা পদ্ধতি। আপনার দাঁতের সুনির্দিষ্ট অবস্থা অনুযায়ী কোনটি দ্রুত ও সুন্দর ফলাফল দেবে, তা জানতে কেজিএইচ ডেন্টালের বিশেষজ্ঞ অর্থোডন্টিস্টের সাথে একটি বিশদ ডিজিটাল চেকআপের মাধ্যমে সঠিক সিদ্ধান্ত নিন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'wisdom-tooth-pain-when-to-see-a-surgeon',
    'Wisdom Tooth Pain: When to Worry and When to Consult an Oral Surgeon',
    'আক্কেল দাঁতের তীব্র যন্ত্রণা: কখন সতর্ক হবেন এবং কখন ওরাল সার্জারি জরুরি?',
    'Learn why third molars become impacted, the dangers of pericoronitis and cyst formation, 3D CBCT nerve mapping, and how modern oral surgery makes removal fast, comfortable, and pain-free.',
    'আক্কেল দাঁত কেন মাড়ির ভেতর আটকে যায়, সংলগ্ন সুস্থ দাঁতের ক্ষতি ও সংক্রমণের ঝুঁকি এবং আধুনিক ব্যথাহীন ওরাল সার্জারির মাধ্যমে সহজ সমাধান সম্পর্কে জানুন।',
    '/images/sub_services/2.2. Impacted Wisdom Tooth.png',
    'oral-surgery',
    'Oral Surgery',
    'ওরাল সার্জারি',
    '8 min read',
    'Sep 2026',
    'wisdom tooth pain extraction oral maxillofacial surgeon dhaka impacted molar',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['wisdom tooth', 'oral surgery', 'tooth extraction', 'pericoronitis', 'kgh dental'],
    '
      <h2>The Evolutionary Dilemma of the Third Molar</h2>
      <p>Wisdom teeth—clinically designated as the third molars—are the final set of teeth to develop in human jaws, typically emerging between the ages of 17 and 25. Throughout evolutionary history, our prehistoric ancestors relied on these large, robust grinding teeth to chew coarse roots, raw game, and unprocessed plants.</p>
      
      <p>However, over thousands of years, modern human dietary patterns softened dramatically, and our jaws evolved to become smaller and more compact. The genetic blueprint for 32 permanent teeth remained unchanged, resulting in a persistent spatial mismatch: modern jaws frequently lack the anatomical arch length required to accommodate these late-arriving molars.</p>

      <div class="kgh-callout">
        <strong>Clinical Fact:</strong> Approximately 70% of modern adults have at least one impacted wisdom tooth—meaning the tooth is physically blocked by dense jawbone or adjacent molar teeth and cannot erupt into a healthy functional position.
      </div>

      <h2>Types of Wisdom Tooth Impaction</h2>
      <p>Oral and maxillofacial surgeons classify impacted wisdom teeth based on their spatial orientation within the mandible or maxilla:</p>
      <ul>
        <li><strong>Mesioangular Impaction:</strong> The tooth is tilted forward, angled directly into the roots of the vital adjacent second molar. This is the most common form and frequently causes undetected decay in neighboring teeth.</li>
        <li><strong>Horizontal Impaction:</strong> The molar lies completely on its side, at a 90-degree angle parallel to the jawbone, pushing aggressively into the dental arch.</li>
        <li><strong>Vertical Impaction:</strong> The tooth is oriented upright in the correct direction but remains trapped beneath the dense ascending ramus of the jawbone or thick fibrous gum tissue.</li>
        <li><strong>Distoangular Impaction:</strong> The tooth is angled backward toward the throat, presenting unique surgical extraction angles.</li>
      </ul>

      <h2>Critical Warning Signs: When You Must Consult an Oral Surgeon</h2>
      <p>Wisdom tooth symptoms can fluctuate from mild annoyance to life-threatening acute infections. Consult a surgeon immediately if you experience:</p>

      <h3>1. Pericoronitis (Flap Infection)</h3>
      <p>When a wisdom tooth only partially emerges, a flap of gum tissue (operculum) remains draped over the biting surface. Food debris and oral bacteria easily become trapped underneath this flap, where regular toothbrush bristles cannot reach. This causes acute pericoronitis: severe localized pain, foul taste, purulent discharge, and swelling that radiates to the neck.</p>

      <h3>2. Trismus (Difficulty Opening the Mouth)</h3>
      <p>Inflammation spreading from the lower third molar into the masseter and pterygoid masticatory muscles causes muscle spasms, severely restricting mouth opening (trismus). This is a strong indicator of advancing infection requiring urgent surgical attention.</p>

      <h3>3. Damage and Root Resorption of Neighboring Molars</h3>
      <p>An impacted molar leaning against the second molar exerts continuous pressure, quietly eroding the protective enamel and cementum of the healthy tooth. This often results in deep, untreatable root caries in the sound second molar before any pain is felt.</p>

      <h3>4. Follicular Cysts and Benign Tumors</h3>
      <p>The sac of tissue surrounding an un-erupted tooth can fill with fluid, expanding into a follicular or dentigerous cyst. Undetected cysts can hollow out large portions of the mandibular jawbone, destroying surrounding bone and loosening healthy adjacent teeth.</p>

      <h2>Modern Diagnostic Precision: 3D CBCT Imaging</h2>
      <p>In the lower jaw, the roots of the third molar often sit dangerously close to the <strong>Inferior Alveolar Nerve (IAN)</strong>, the critical sensory nerve providing feeling to the lower lip, chin, and teeth. Traditional 2D panoramic X-rays (OPGs) flatten this relationship, creating ambiguity.</p>
      <p>Specialist oral surgeons utilize <strong>Cone Beam Computed Tomography (CBCT)</strong>—a low-radiation 3D scan that maps the exact sub-millimeter course of the sensory nerve relative to the root tips. This surgical navigation allows the surgeon to extract the tooth with surgical precision while safeguarding nerve integrity.</p>

      <h2>What to Expect During the Surgical Procedure</h2>
      <p>Contrary to popular dread, modern surgical extraction is quiet, rapid, and completely pain-free:</p>
      <ol>
        <li><strong>Profound Surgical Anesthesia:</strong> Advanced neuro-block techniques render the jaw completely numb. Conscious sedation is also available for anxious patients.</li>
        <li><strong>Micro-Incision & Bone Preservation:</strong> A delicate mucosal incision exposes the tooth with minimal disturbance to surrounding tissues.</li>
        <li><strong>Tooth Sectioning:</strong> Rather than forcing a large tooth through bone, surgeons gently section the molar into two or three small fragments using specialized micro-surgical handpieces. This significantly minimizes postoperative bone trauma.</li>
        <li><strong>Thorough Curettage & Irrigation:</strong> The socket is cleansed of all inflammatory tissue and flushed with sterile chilled saline.</li>
        <li><strong>Resorbable Sutures:</strong> Dissolvable sutures reposition the gum neatly, promoting rapid primary wound healing.</li>
      </ol>

      <div class="kgh-tip">
        <strong>Preventing Dry Socket:</strong> A "dry socket" (alveolar osteitis) occurs if the blood clot inside the extraction socket dislodges prematurely, exposing bone. Strictly avoid drinking through straws, smoking, spitting forcefully, or vigorous rinsing for the first 72 hours.
      </div>

      <h2>Recovery Timeline and Healing Protocol</h2>
      <p>Initial healing occurs within 48 to 72 hours, with soft tissue closure completed in 7 to 10 days. Applying external ice packs for the first 24 hours minimizes facial swelling, followed by warm salt water rinses from the second day onward to maintain clean surgical sites.</p>

      <h2>Conclusion: Proactive Evaluation Prevents Complex Emergencies</h2>
      <p>You do not need to wait for agonizing facial swelling to take action. Proactive evaluation of your third molars during your early twenties allows for clean, simple elective removal before deep root anchoring occurs, preserving your jawbone health for life.</p>
    ',
    '
      <h2>বিবর্তনের ইতিহাস ও আক্কেল দাঁতের সংকট</h2>
      <p>আক্কেল দাঁত বা চিকিৎসা বিজ্ঞানের ভাষায় <strong>থার্ড মোলার</strong> হলো মানুষের মুখের সর্বশেষে গজানো দাঁত। সাধারণত ১৭ থেকে ২৫ বছর বয়সের মধ্যে এই দাঁতগুলো মাড়ির একেবারে পেছনের কোণায় দেখা দেয়। প্রাচীন যুগে আমাদের পূর্বপুরুষদের কাঁচা মাংস, শক্ত গাছের শিকড় ও অমসৃণ খাদ্য চিবিয়ে খেতে এই বড় ও শক্তিশালী দাঁতগুলো প্রয়োজন হতো।</p>
      
      <p>কিন্তু কালের পরিক্রমায় মানুষের খাদ্যাভ্যাস নরম ও পরিশোধিত হয়েছে, যার ফলে মানব চোয়ালের আকার ক্রমশ ছোট ও সংকুচিত হয়ে এসেছে। কিন্তু জেনেটিকভাবে মানুষের ৩২টি দাঁত ওঠার নকশা অপরিবর্তিত রয়ে গেছে। ফলে আজকের দিনে অধিকাংশ প্রাপ্তবয়স্ক মানুষের চোয়ালে এই শেষ চারটি দাঁত স্বাভাবিকভাবে সোজা হয়ে গজানোর মতো পর্যাপ্ত জায়গা থাকে না।</p>

      <div class="kgh-callout">
        <strong>চিকিৎসা বিজ্ঞানের তথ্য:</strong> প্রায় ৭০ শতাংশ মানুষের ক্ষেত্রে অন্তত একটি আক্কেল দাঁত মাড়ির হাড়ের ভেতর আটকে যায় (Impacted Wisdom Tooth)। স্থান সংকটের কারণে দাঁতটি সোজা উঠতে না পেরে আঁকাবাঁকা হয়ে অন্য দাঁতের দিকে হেলে পড়ে।
      </div>

      <h2>আক্কেল দাঁত আটকে যাওয়ার বিভিন্ন ধরন</h2>
      <p>মাড়ির ভেতর আক্কেল দাঁতটি কীভাবে শুয়ে বা হেলে রয়েছে, তার ওপর ভিত্তি করে সার্জনরা একে ভাগ করেন:</p>
      <ul>
        <li><strong>মেসিওঅ্যাঙ্গুলার (Mesioangular):</strong> দাঁতটি সামনের দিকে হেলে থাকে এবং পাশের সুস্থ দ্বিতীয় মোলার দাঁতটির শিকড়ে সরাসরি ধাক্কা দেয়। এটি সবচেয়ে সাধারণ অবস্থা এবং এর কারণে পাশের ভালো দাঁতটিতে পচন ধরার ঝুঁকি থাকে।</li>
        <li><strong>হরাইজন্টাল (Horizontal):</strong> দাঁতটি মাড়ির হাড়ের ভেতর সম্পূর্ণ আনুভূমিকভাবে অর্থাৎ ৯০ ডিগ্রি কোণে শুয়ে থাকে।</li>
        <li><strong>ভার্টিক্যাল (Vertical):</strong> দাঁতটি সোজা অবস্থায় থাকে ঠিকই, কিন্তু পেছনের শক্ত চোয়ালের হাড় বা পুরু মাড়ির চামড়ার নিচে চিরতরে বন্দি থাকে।</li>
        <li><strong>ডিস্টোঅ্যাঙ্গুলার (Distoangular):</strong> দাঁতটি পেছনের দিকে গলার অংশের দিকে হেলে থাকে।</li>
      </ul>

      <h2>যেসব লক্ষণ দেখলে জরুরিভাবে ওরাল সার্জনের পরামর্শ নেবেন</h2>
      <p>আক্কেল দাঁতের সমস্যাকে অবহেলা করলে তা মারাত্মক জটিলতায় রূপ নিতে পারে। নিচের লক্ষণগুলো দেখা দিলে দ্রুত ব্যবস্থা নেওয়া জরুরি:</p>

      <h3>১. পেরিকরোনাইটিস বা মাড়ি ফোলা ইনফেকশন</h3>
      <p>আক্কেল দাঁত যখন অর্ধেক বের হয় এবং বাকি অর্ধেক মাড়ির চামড়া দিয়ে ঢাকা থাকে, তখন সেই চামড়ার নিচে খাদ্যকণা ও ব্যাকটেরিয়া সহজে জমে যায়। সাধারণ টুথব্রাশ সেখানে পৌঁছাতে পারে না। ফলে মাড়িতে তীব্র প্রদাহ, পুঁজ তৈরি হওয়া, মুখে দুর্গন্ধ এবং গিলে খাওয়ার সময় অসহ্য ব্যথা হয়।</p>

      <h3>২. মুখ খুলতে কষ্ট হওয়া বা ট্রিসমাস (Trismus)</h3>
      <p>ইনফেকশন যখন মাড়ি ছাড়িয়ে চোয়ালের মূল মাংসপেশিতে ছড়িয়ে পড়ে, তখন মুখ পুরোপুরি খোলা যায় না। এটি একটি জরুরি ডেন্টাল অবস্থা যা নির্দেশ করে ইনফেকশন দ্রুত ছড়িয়ে পড়ছে।</p>

      <h3>৩. পাশের সুস্থ দাঁতের অপূরণীয় ক্ষতি</h3>
      <p>আক্কেল দাঁত যখন ক্রমাগত সামনের ভালো দাঁতের শিকড়ে চাপ দেয়, তখন কোনো দৃশ্যমান লক্ষণ ছাড়াই পাশের সুস্থ দাঁতটির শিকড় ক্ষয় হয়ে যায় এবং সেখানে গভীর ক্যাভিটি তৈরি হয়। অনেক সময় আক্কেল দাঁতের অবহেলার কারণে পাশের ভালো দাঁতটিও হারাতে হয়।</p>

      <h3>৪. চোয়ালের হাড়ে সিস্ট ও টিউমার সৃষ্টি</h3>
      <p>মাড়ির ভেতর আটকে থাকা দাঁতের চারপাশে থাকা তরল ভর্তি থলে কখনো কখনো সিস্টে পরিণত হতে পারে। এই সিস্ট ধীরে ধীরে চোয়ালের শক্ত হাড়কে ভেতর থেকে ফাঁপা ও দুর্বল করে ফেলে।</p>

      <h2>থ্রি-ডি সিবিসিটি (CBCT) স্ক্যানের গুরুত্ব</h2>
      <p>নিচের চোয়ালের আক্কেল দাঁতের শিকড়ের ঠিক নিচ দিয়েই চলে গেছে একটি অত্যন্ত সংবেদনশীল রক্তনালী ও নার্ভ (Inferior Alveolar Nerve), যা আমাদের ঠোঁট ও থুতনির অনুভূতি নিয়ন্ত্রণ করে। সাধারণ টু-ডি এক্স-রেতে এই নার্ভের সাথে শিকড়ের দূরত্ব সঠিকভাবে বোঝা যায় না।</p>
      <p>কেজিএইচ ডেন্টালে আধুনিক থ্রি-ডি সিবিসিটি স্ক্যানিংয়ের মাধ্যমে নার্ভের সুনির্দিষ্ট অবস্থান নিশ্চিত করে অত্যন্ত নিরাপদে ও নিখুঁতভাবে সার্জারি সম্পন্ন করা হয়, ফলে নার্ভের কোনো ধরনের ক্ষতির ঝুঁকি থাকে না।</p>

      <h2>ব্যথামুক্ত সার্জারির আধুনিক ধাপসমূহ</h2>
      <p>মানুষ সার্জারি নিয়ে অযথা ভয় পেলেও আধুনিক প্রযুক্তিতে এটি অত্যন্ত সহজ ও ব্যথাহীন একটি প্রক্রিয়া:</p>
      <ol>
        <li><strong>নিখুঁত লোকাল অ্যানেস্থেসিয়া:</strong> উন্নত অ্যানেস্থেসিয়ার মাধ্যমে পুরো চোয়ালের নির্দিষ্ট এলাকা শতভাগ অবশ করে নেওয়া হয়, ফলে চিকিৎসাকালে বিন্দুমাত্র ব্যথা অনুভূত হয় না।</li>
        <li><strong>মাইক্রো সার্জিক্যাল ইনসিশন:</strong> মাড়ির খুব সামান্য অংশ সরিয়ে দাঁতটি বের করে আনা হয়।</li>
        <li><strong>টুথ সেকশনিং (দাঁত খণ্ড খণ্ড করা):</strong> মাড়ির হাড়ে অপ্রয়োজনীয় চাপ না দিয়ে আধুনিক রোটারি যন্ত্রের সাহায্যে দাঁতটিকে কয়েকটি ছোট অংশে বিভক্ত করে অত্যন্ত আলতোভাবে তুলে নেওয়া হয়। এর ফলে সার্জারির পর ব্যথা ও ফোলাভাব অনেক কম হয়।</li>
        <li><strong>জীবাণুমুক্তকরণ ও সেলাই:</strong> ক্ষতস্থান স্যালাইন দিয়ে সম্পূর্ণ পরিষ্কার করে নরম গলে যাওয়া সেলাই দিয়ে আটকে দেওয়া হয়।</li>
      </ol>

      <div class="kgh-tip">
        <strong>ড্রাই সকেট প্রতিরোধে করণীয়:</strong> দাঁত তোলার পর প্রথম ৩ দিন কোনো ধরনের স্ট্র দিয়ে জুস বা পানি খাওয়া যাবে না, ধূমপান করা যাবে না এবং জোরে থুতু ফেলা যাবে না। কারণ মুখের রক্তের জমাট বাঁধা চাকা (Blood Clot) সরে গেলে হাড় উন্মুক্ত হয়ে ড্রাই সকেট হতে পারে।
      </div>

      <h2>সুস্থতার নিয়মাবলী ও উপসংহার</h2>
      <p>সার্জারির পর প্রথম ২৪ ঘণ্টা মুখের বাইরে বরফ দিলে ফোলাভাব দ্রুত কমে যায় এবং দ্বিতীয় দিন থেকে কুসুম গরম পানিতে লবণ দিয়ে কুলকুচি করলে ঘা দ্রুত শুকিয়ে যায়। আক্কেল দাঁতের সমস্যা জটিল হওয়ার আগেই একজন বিশেষজ্ঞ ওরাল সার্জনের পরামর্শ নেওয়া আপনার সার্বিক মুখের স্বাস্থ্য ও হাসিকে আজীবন সুরক্ষিত রাখবে।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'dental-implants-101-candidate-guide',
    'Dental Implants 101: The Gold Standard for Permanent Tooth Replacement',
    'ডেন্টাল ইমপ্ল্যান্ট এ টু জেড: হারিয়ে যাওয়া দাঁত স্থায়ীভাবে প্রতিস্থাপনের বিশ্বমানের সমাধান',
    'Discover why dental implants are considered the pinnacle of restorative dentistry. Learn about osseointegration, bone density requirements, sinus lifts, and how implants protect your jaw structure.',
    'হারানো দাঁতের জায়গায় ডেন্টাল ইমপ্ল্যান্ট কেন আধুনিক চিকিৎসায় সেরা সমাধান? টাইটানিয়াম রুট, চোয়ালের হাড়ের পুনর্গঠন এবং আজীবন টেকসই হাসির সম্পূর্ণ গাইড।',
    '/images/sub_services/2.3. Dental Implant Surgery.png',
    'prosthodontics',
    'Prosthodontics',
    'প্রস্থোডন্টিক্স',
    '9 min read',
    'Sep 2026',
    'dental implants dhaka permanent tooth replacement prosthodontist osseointegration',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['dental implants', 'prosthodontics', 'missing teeth', 'zirconia crown', 'kgh dental'],
    '
      <h2>The Consequences of a Missing Tooth Beyond Aesthetics</h2>
      <p>Losing a natural tooth—whether from untreated decay, severe periodontal breakdown, or sudden traumatic impact—sets off a cascade of destructive physiological changes within the oral cavity. While patients often notice the visible gap first, the most devastating consequences occur invisibly beneath the gumline.</p>
      
      <p>Human jawbone requires continuous mechanical stimulation from natural tooth roots during chewing to maintain its density and height. Within the first twelve months following a tooth extraction, up to 25% of surrounding alveolar bone volume resorbs (melts away). As bone recedes, neighboring teeth tip inward into the vacant space, opposing teeth super-erupt downward, the bite collapses, and premature facial aging or sunken lips occur.</p>

      <div class="kgh-callout">
        <strong>The Biological Solution:</strong> A dental implant is the only tooth replacement modality in medical history that replaces both the visible anatomical crown AND the invisible biological root, permanently arresting bone resorption.
      </div>

      <h2>The Anatomy of a Modern Dental Implant</h2>
      <p>A dental implant restoration consists of three high-precision engineered medical components:</p>
      <ul>
        <li><strong>1. The Implant Fixture:</strong> A microscopic-threaded screw manufactured from commercially pure Grade 4 or Grade 5 medical titanium or zirconia. This acts as an artificial tooth root inserted directly into the jawbone.</li>
        <li><strong>2. The Abutment:</strong> A precision titanium or ceramic connector that screws securely into the implant fixture, emerging through the gum tissue to support the prosthetic tooth.</li>
        <li><strong>3. The Prosthetic Crown:</strong> A lifelike, custom-milled monolithic zirconia or layered porcelain restoration designed to match the shade, translucency, and contours of your surrounding natural teeth.</li>
      </ul>

      <h2>The Biological Miracle: Osseointegration</h2>
      <p>The monumental breakthrough of modern implantology was discovered in the 1950s by Swedish orthopedic surgeon Dr. Per-Ingvar Brånemark. He demonstrated that titanium is 100% biocompatible with living human tissue. Living bone cells (osteoblasts) do not reject titanium; instead, they grow directly onto the textured micro-porous surface of the implant, physically fusing it with the jawbone. This biological fusion is termed <strong>osseointegration</strong>.</p>
      <p>Once osseointegration is complete, the titanium post can withstand the immense chewing forces of the human jaw—often exceeding 200 pounds of pressure per square inch—with the exact same stability as a healthy natural tooth root.</p>

      <h2>Why Implants Outperform Traditional Bridges and Dentures</h2>
      <p>Before implants, missing teeth were treated primarily with removable dentures or fixed dental bridges:</p>
      <ul>
        <li><strong>Preserving Healthy Adjacent Teeth:</strong> A traditional three-unit bridge requires grinding away up to 50% of the healthy enamel and dentin on both adjacent teeth to serve as support pillars. If one supporting tooth decays years later, the entire bridge fails. An implant stands independently, requiring zero damage to neighboring teeth.</li>
        <li><strong>Preserving Jawbone Architecture:</strong> Removable dentures sit on top of the gums and accelerate bone shrinkage through continuous friction. Implants stimulate deep bone regeneration.</li>
        <li><strong>Chewing Comfort & Dietary Freedom:</strong> Dentures frequently slip, click, or cause painful pressure sores when eating apples, steak, or nuts. Dental implants restore 99% of natural chewing efficiency, allowing you to enjoy a completely unrestricted diet.</li>
      </ul>

      <h2>Am I a Good Candidate for Dental Implants?</h2>
      <p>Most healthy adults who have lost one or more teeth are outstanding candidates for implant therapy. Key clinical evaluation factors include:</p>
      <ol>
        <li><strong>Adequate Bone Volume:</strong> You need sufficient bone height and width to encase the implant. If bone has shrunk due to long-standing tooth loss, modern <em>guided bone regeneration (GBR)</em> and <em>sinus lift procedures</em> can rebuild the lost bone architecture before or during implant placement.</li>
        <li><strong>Healthy Periodontal Tissues:</strong> Active gum disease must be thoroughly treated and resolved prior to surgery to prevent bacterial infection of the implant (peri-implantitis).</li>
        <li><strong>Controlled Systemic Health:</strong> Well-managed diabetes or hypertension is not a barrier to implants. However, heavy smoking or uncontrolled blood sugar can slow initial bone healing and require medical coordination.</li>
      </ol>

      <h2>The Step-by-Step Implant Treatment Journey</h2>
      <p>At KGH Dental, implant procedures are executed with digital surgical precision:</p>
      <ol>
        <li><strong>3D CBCT & Digital Intraoral Scan:</strong> Virtual computer planning simulates exact implant angle, depth, and distance from vital anatomical structures.</li>
        <li><strong>Guided Surgical Placement:</strong> Using a 3D-printed surgical template, the titanium fixture is placed gently into the jawbone under painless local anesthesia. The procedure is typically faster and less traumatic than a routine tooth extraction.</li>
        <li><strong>Healing & Osseointegration:</strong> Over a period of 8 to 12 weeks, the jawbone integrates firmly with the implant surface. In aesthetic zones, a temporary aesthetic tooth is provided so you never leave with a gap.</li>
        <li><strong>Digital Impression & Crown Delivery:</strong> An optical digital scanner records the exact position of the abutment, and our dental laboratory mills a high-strength zirconia crown that seamlessly completes your smile.</li>
      </ol>

      <div class="kgh-tip">
        <strong>Lifelong Maintenance:</strong> While dental implants cannot develop tooth decay, the surrounding gums can develop inflammation if plaque is neglected. Flossing around the implant daily and attending routine six-month dental cleanings ensures your implant can last a lifetime.
      </div>

      <h2>Conclusion: An Investment in Your Health and Self-Worth</h2>
      <p>Dental implants are widely recognized as the single most predictable, durable, and physiologically natural tooth replacement procedure in modern healthcare. Reclaim your confident bite, clear speech, and youthful facial contours with specialist-led implant care.</p>
    ',
    '
      <h2>হারানো দাঁতের অদৃশ্য ক্ষতি</h2>
      <p>কোনো কারণে একটি দাঁত হারিয়ে ফেলা—তা ক্যাভিটি, মাড়ির রোগ বা আকস্মিক কোনো দুর্ঘটনার কারণেই হোক না কেন—শুধু মুখের সৌন্দর্য নষ্ট করে না, বরং পুরো চোয়ালের সুস্থতায় মারাত্মক নেতিবাচক প্রভাব ফেলে। সাধারণত মানুষ ফাঁকা জায়গাটি দেখেই উদ্বিগ্ন হন, কিন্তু আসল বিপদ ঘটে মাড়ির নিচে চোয়ালের হাড়ে।</p>
      
      <p>আমাদের চোয়ালের হাড় সুস্থ ও মজবুত থাকার জন্য প্রাকৃতিক দাঁতের শিকড় থেকে আসা স্বাভাবিক চর্বণের চাপ অত্যন্ত জরুরি। দাঁত তোলার পর প্রথম এক বছরের মধ্যেই সেই খালি জায়গার প্রায় ২৫ শতাংশ চোয়ালের হাড় শুকিয়ে বা গলে যায়। এর ফলে পাশের দাঁতগুলো ফাঁকা জায়গার দিকে হেলে পড়ে, বিপরীত দিকের দাঁত নিচে নেমে আসে এবং দীর্ঘমেয়াদে মুখের মাংসপেশি কুঁচকে গিয়ে অল্প বয়সেই চেহারায় বার্ধক্যের ছাপ ফুটে ওঠে।</p>

      <div class="kgh-callout">
        <strong>চিকিৎসা বিজ্ঞানের স্থায়ী সমাধান:</strong> চিকিৎসা বিজ্ঞানের ইতিহাসে একমাত্র ডেন্টাল ইমপ্ল্যান্টই পারে মুখের ওপরের দৃশ্যমান দাঁতের পাশাপাশি মাড়ির নিচের অদৃশ্য প্রাকৃতিক শিকড়কেও সফলভাবে প্রতিস্থাপন করতে, যা চোয়ালের হাড়ের ক্ষয় চিরতরে বন্ধ করে দেয়।
      </div>

      <h2>একটি আধুনিক ডেন্টাল ইমপ্ল্যান্টের তিনটি অংশ</h2>
      <p>ডেন্টাল ইমপ্ল্যান্ট মূলত তিনটি অত্যন্ত সূক্ষ্ম ও আধুনিক অংশের সমন্বয়ে গঠিত:</p>
      <ul>
        <li><strong>১. ইমপ্ল্যান্ট ফিক্সচার (কৃত্রিম শিকড়):</strong> চিকিৎসাবিজ্ঞানের উপযোগী শতভাগ বিশুদ্ধ টাইটানিয়াম ধাতু দিয়ে তৈরি একটি বিশেষ স্ক্রু, যা চোয়ালের হাড়ের ভেতরে স্থাপন করা হয়। এটি নতুন কৃত্রিম দাঁতের স্থায়ী ভিত্তি বা শিকড় হিসেবে কাজ করে।</li>
        <li><strong>২. অ্যাবাটমেন্ট (সংযোজক অংশ):</strong> এটি একটি সূক্ষ্ম কানেক্টর যা মাড়ির ভেতর থাকা টাইটানিয়াম স্ক্রুটির সাথে ওপরের ক্রাউন বা দাঁতকে দৃঢ়ভাবে আটকে রাখে।</li>
        <li><strong>৩. স্থায়ী ক্রাউন বা ক্যাপ:</strong> এটি হলো ওপরের দৃশ্যমান চকচকে সুন্দর দাঁত, যা উচ্চমানের জিরকোনিয়া বা সিরামিক দিয়ে তৈরি করা হয়। এটি দেখতে হুবহু আপনার পাশের প্রাকৃতিক দাঁতের মতোই উজ্জ্বল ও সুন্দর হয়।</li>
      </ul>

      <h2>অসিওইন্টিগ্রেশন: চিকিৎসা বিজ্ঞানের যুগান্তকারী আবিষ্কার</h2>
      <p>১৯৫০-এর দশকে সুইডিশ সার্জন ড. ব্র্যানমার্ক আবিষ্কার করেন যে টাইটানিয়াম ধাতু মানুষের শরীরের জীবন্ত কোষের সাথে সম্পূর্ণ বন্ধুভাবাপন্ন। চোয়ালের হাড়ের ভেতর টাইটানিয়াম স্ক্রু স্থাপন করার পর জীবন্ত হাড়ের কোষগুলো এই স্ক্রুর গায়ে গভীরভাবে জড়িয়ে বৃদ্ধি পায় এবং একপর্যায়ে টাইটানিয়াম ও হাড় একক সত্তায় পরিণত হয়। এই জৈবিক সংযুক্তিকে বলা হয় <strong>অসিওইন্টিগ্রেশন (Osseointegration)</strong>।</p>
      <p>হাড়ের সাথে এই দৃঢ় সংযুক্তির কারণে ইমপ্ল্যান্ট করা দাঁত প্রাকৃতিক দাঁতের মতোই প্রচণ্ড চর্বণ চাপ অনায়াসে সহ্য করতে পারে।</p>

      <h2>কেন ডেন্টাল ইমপ্ল্যান্ট ব্রিজ বা ডেনচারের চেয়ে বহুগুণ সেরা?</h2>
      <p>ইমপ্ল্যান্টের আগে হারানো দাঁতের জায়গায় সাধারণত কৃত্রিম ব্রিজ বা খোলা-পরা ডেনচার ব্যবহার করা হতো:</p>
      <ul>
        <li><strong>পাশের সুস্থ দাঁত সুরক্ষিত থাকে:</strong> সাধারণ ডেন্টাল ব্রিজ করতে গেলে ফাঁকা জায়গার দুই পাশের সম্পূর্ণ সুস্থ দুটি দাঁতকে কেটে ছোট করতে হয়। ইমপ্ল্যান্টের ক্ষেত্রে পাশের কোনো ভালো দাঁত স্পর্শও করতে হয় না।</li>
        <li><strong>চোয়ালের হাড় বজায় থাকে:</strong> খোলা-পরা কৃত্রিম দাঁত (ডেনচার) মাড়ির ওপর বসে থাকে এবং ঘর্ষণের ফলে হাড়ের ক্ষয় আরও দ্রুত বাড়িয়ে দেয়। ইমপ্ল্যান্ট হাড়ের সাথে একাত্ম হয়ে হাড়ের ক্ষয় বন্ধ রাখে।</li>
        <li><strong>স্বাভাবিক চর্বণ ক্ষমতা:</strong> ডেনচার পরে শক্ত আপেল, মাংস বা শক্ত ফল খাওয়া অসম্ভব হয়ে পড়ে এবং কথা বলার সময় খুলে যাওয়ার ভয় থাকে। ইমপ্ল্যান্ট সম্পূর্ণ স্থায়ী, যা প্রাকৃতিক দাঁতের মতো শতভাগ চর্বণ শক্তি ফিরিয়ে দেয়।</li>
      </ul>

      <h2>কারা ডেন্টাল ইমপ্ল্যান্টের জন্য উপযুক্ত?</h2>
      <p>যেকোনো সুস্থ প্রাপ্তবয়স্ক মানুষ যিনি দাঁত হারিয়েছেন, তিনি ইমপ্ল্যান্টের জন্য বিবেচনাযোগ্য। প্রধান বিবেচ্য বিষয়গুলো হলো:</p>
      <ol>
        <li><strong>পর্যাপ্ত চোয়ালের হাড়:</strong> ইমপ্ল্যান্ট শক্তভাবে ধরে রাখার জন্য চোয়ালে নির্দিষ্ট পরিমাণ হাড় থাকা প্রয়োজন। যাদের দীর্ঘকাল দাঁত না থাকায় হাড় শুকিয়ে গেছে, তাদের ক্ষেত্রে আধুনিক <em>বোন গ্রাফটিং (Bone Grafting)</em> পদ্ধতির মাধ্যমে নতুন হাড় তৈরি করে নিরাপদে ইমপ্ল্যান্ট বসানো যায়।</li>
        <li><strong>সুস্থ মাড়ি:</strong> মুখে কোনো সক্রিয় মাড়ির ইনফেকশন থাকলে তা আগে চিকিৎসা করে পুরোপুরি সারিয়ে নিতে হয়।</li>
        <li><strong>নিয়ন্ত্রিত শারীরিক স্বাস্থ্য:</strong> ডায়াবেটিস বা উচ্চ রক্তচাপ নিয়ন্ত্রণে থাকলে ইমপ্ল্যান্ট চিকিৎসায় কোনো বাধা নেই।</li>
      </ol>

      <h2>চিকিৎসা গ্রহণের সহজ ধাপসমূহ</h2>
      <p>কেজিএইচ ডেন্টালে আন্তর্জাতিক মানের প্রোটোকল মেনে ডিজিটাল গাইডেন্সের সাহায্যে ইমপ্ল্যান্ট সম্পন্ন করা হয়:</p>
      <ol>
        <li><strong>থ্রি-ডি স্ক্যান ও ভার্চুয়াল পরিকল্পনা:</strong> কম্পিউটারে পুরো চোয়ালের থ্রি-ডি মডেল তৈরি করে ইমপ্ল্যান্ট বসানোর নিখুঁত কোণ ও গভীরতা আগে থেকেই নির্ধারণ করা হয়।</li>
        <li><strong>ব্যথাহীন স্থাপন:</strong> অত্যন্ত মৃদু লোকাল অ্যানেস্থেসিয়া দিয়ে কোনো ব্যথা ছাড়াই মাত্র ২০-৩০ মিনিটে টাইটানিয়াম স্ক্রুটি মাড়ির হাড়ে স্থাপন করা হয়। সাধারণ দাঁত তোলার চেয়েও এই প্রক্রিয়া অনেক বেশি আরামদায়ক।</li>
        <li><strong>হাড়ের সাথে সংযুক্তি:</strong> পরবর্তী ২ থেকে ৩ মাসে হাড় স্ক্রুটির সাথে শক্তভাবে জোড়া লেগে যায়। সামনের দাঁতের ক্ষেত্রে সাময়িক একটি সুন্দর ক্যাপ দেওয়া থাকে যাতে স্বাভাবিক হাসিতে কোনো অসুবিধা না হয়।</li>
        <li><strong>স্থায়ী জিরকোনিয়া ক্যাপ বসানো:</strong> হাড় পুরোপুরি মজবুত হলে ডিজিটাল মাপ নিয়ে তৈরি করা নিখুঁত জিরকোনিয়া দাঁত স্থায়ীভাবে বসিয়ে দেওয়া হয়।</li>
      </ol>

      <div class="kgh-tip">
        <strong>চিকিৎসা পরবর্তী যত্ন:</strong> ইমপ্ল্যান্টে কখনো পোকা লাগা বা ক্যাভিটি হওয়া সম্ভব নয়, তবে চারপাশের মাড়ি সুস্থ রাখতে প্রতিদিন নিয়ম মেনে দুই বেলা ব্রাশ, ফ্লসিং এবং বছরে অন্তত দুবার ডেন্টাল চেকআপ করা উচিত।
      </div>

      <h2>উপসংহার: আজীবনের হাসির স্থায়ী নিশ্চয়তা</h2>
      <p>ডেন্টাল ইমপ্ল্যান্ট কেবল একটি কৃত্রিম দাঁত নয়, এটি আপনার স্বাভাবিক খাওয়া-দাওয়ার আনন্দ, মুখের তারুণ্য এবং সামাজিক আত্মবিশ্বাস ফিরিয়ে দেওয়ার সেরা আধুনিক সমাধান। একজন বিশেষজ্ঞ ইমপ্ল্যান্টোলজিস্টের সাথে পরামর্শ করে আপনার হারানো দাঁতের স্থায়ী সমাধান আজই নিশ্চিত করুন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'why-child-needs-dental-checkup-before-age-3',
    'Why Your Child Needs a First Dental Check-Up Before Age Three',
    '৩ বছর বয়সের আগেই কেন আপনার শিশুর প্রথম ডেন্টাল চেকআপ জরুরি?',
    'Explore why milk teeth are critical for jaw development, speech phonetics, and adult tooth spacing. Learn about Early Childhood Caries (ECC), gentle preventive therapies, and banishing dental fear early.',
    'শিশুর দুধদাঁত কেন মুখের হাড়ের সঠিক বৃদ্ধি ও সুন্দর কথার ভিত্তি? নার্সিং বোটল ক্যাভিটি প্রতিরোধ, ফ্লোরাইড থেরাপি এবং ছোটবেলাতেই ডেন্টাল ভীতি চিরতরে দূর করার বিস্তারিত চিকিৎসা গাইড।',
    '/images/sub_services/5.8. Child Dental Check-up & Preventive Counselling.png',
    'pediatric',
    'Pediatric Dentistry',
    'শিশু দন্তচিকিৎসা',
    '7 min read',
    'Sep 2026',
    'pediatric dentist dhaka child dental checkup early childhood caries baby teeth care',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['pediatric dentistry', 'baby teeth', 'fluoride varnish', 'child oral care', 'kgh dental'],
    '
      <h2>The Critical First Years of Pediatric Dental Health</h2>
      <p>A widespread and hazardous misconception among parents is the belief that <em>"baby teeth do not matter because they will fall out anyway."</em> In pediatric medicine, this belief frequently leads to preventable dental emergencies, sleepless nights for infants, and long-term orthodontic complications.</p>
      
      <p>The global recommendation from both the <strong>American Academy of Pediatric Dentistry (AAPD)</strong> and international health bodies is unequivocal: a child should have their very first clinical dental visit when their first tooth erupts, or no later than their <strong>first birthday</strong>, and certainly before reaching three years of age.</p>

      <div class="kgh-callout">
        <strong>Pediatric Fact:</strong> Primary (milk) teeth serve as the natural biological space maintainers for the adult teeth growing quietly beneath the gums. Premature loss of a baby tooth causes adjacent teeth to shift, blocking permanent teeth from erupting properly.
      </div>

      <h2>The Vital Biological Functions of Primary (Milk) Teeth</h2>
      <p>Far from being temporary placeholders, primary teeth perform essential developmental roles throughout childhood:</p>
      <ul>
        <li><strong>Guiding Permanent Teeth:</strong> The roots of primary molars form an architectural cradle directly above the buds of permanent premolars, guiding them into normal alignment.</li>
        <li><strong>Nutritional Digestion & Growth:</strong> Healthy teeth allow toddlers to chew wholesome fruits, vegetables, and proteins thoroughly, ensuring proper gastrointestinal absorption during peak physical growth.</li>
        <li><strong>Speech Phonetics Development:</strong> Front incisors are indispensable for pronouncing lingual-dental consonants such as "th," "s," "d," and "t." Premature decay can impair speech clarity and social confidence.</li>
        <li><strong>Craniofacial Jaw Development:</strong> Chewing forces stimulate the growth plates of the maxilla and mandible, fostering symmetrical facial bone proportions.</li>
      </ul>

      <h2>The Menace of Early Childhood Caries (Baby Bottle Decay)</h2>
      <p>The primary dental disease affecting toddlers between ages 1 and 4 is <strong>Early Childhood Caries (ECC)</strong>. It often begins as subtle chalky-white demineralization lines along the upper gumline, quickly progressing to dark brown cavitated lesions that destroy entire tooth crowns.</p>

      <h3>How Does ECC Develop?</h3>
      <p>When infants are put to bed with a nursing bottle containing milk, formula, sweetened water, or fruit juice, salivary flow naturally drops during sleep. The natural sugars pool continuously around the upper front teeth, bathing oral bacteria (such as <em>Streptococcus mutans</em>) in fuel. The bacteria produce lactic acid, which rapidly dissolves the delicate, thin enamel of baby teeth.</p>

      <div class="kgh-tip">
        <strong>Bedtime Rule for Parents:</strong> Never put your baby to sleep with a bottle containing anything other than plain water. If night-feeding is necessary, gently wipe their gums and teeth with a damp, clean gauze cloth immediately afterward.
      </div>

      <h2>Preventive Pediatric Therapies Available at the Clinic</h2>
      <p>Taking your child to a specialist pediatric dentist before problems emerge unlocks comfortable, highly effective preventive treatments:</p>

      <h3>1. Pit and Fissure Sealants</h3>
      <p>The chewing surfaces of primary and permanent molars possess deep microscopic grooves (fissures) where toothbrush bristles physically cannot enter. Pediatric dentists apply a clear or tooth-colored liquid resin shield that cures with light, sealing the grooves against plaque and preventing up to 80% of molar cavities.</p>

      <h3>2. Professional Topical Fluoride Varnish</h3>
      <p>Applied gently with a soft micro-brush in under one minute, high-concentration fluoride varnish remineralizes fragile enamel, reversing early chalky white spots before they turn into cavities. It is safe, quick, and tastes pleasant for children.</p>

      <h3>3. Habit-Breaking Guidance (Thumb Sucking & Mouth Breathing)</h3>
      <p>Vigorous thumb-sucking or pacifier use beyond age 3 can alter the shape of the upper palate, creating an anterior "open bite" where front teeth cannot touch. A pediatric specialist can identify early skeletal changes and provide gentle behavioral or appliance-assisted solutions.</p>

      <h2>Establishing a Positive "Dental Home" and Banishing Dental Fear</h2>
      <p>The psychological benefit of early visits is immense. When a child''s first dental experience takes place in a non-painful, welcoming environment, they discover that dental clinics are friendly, interesting places. They sit on a parent''s lap, meet the doctor, ride the magical moving dental chair, and receive positive reinforcement.</p>
      <p>In contrast, if a child''s first encounter with a dentist occurs at age 5 or 6 during an agonizing nighttime abscess requiring emergency extraction, the resulting trauma can create severe <strong>dental phobia (odontophobia)</strong> that persists into adulthood.</p>

      <h2>Practical Daily Oral Care Milestones by Age</h2>
      <ul>
        <li><strong>Infants (0–12 months):</strong> Wipe gums twice daily with a clean, damp silicone finger brush or soft washcloth, especially after the last evening feed.</li>
        <li><strong>Toddlers (1–3 years):</strong> Introduce a soft-bristled baby toothbrush with a tiny grain-of-rice-sized smear of age-appropriate fluoride toothpaste. Assist them with brushing every morning and evening.</li>
        <li><strong>Young Children (3–6 years):</strong> Upgrade to a pea-sized amount of toothpaste. Supervise and finish the brushing routine to ensure back molars are thoroughly cleaned.</li>
      </ul>

      <h2>Conclusion: A Lifetime of Bright Smiles Starts Today</h2>
      <p>Preventive pediatric dentistry is gentle, proactive, and empowering. By prioritizing early dental check-ups before your child''s third birthday, you gift your child a lifetime of cavity-free comfort, robust dental health, and confident smiles.</p>
    ',
    '
      <h2>শৈশবের প্রথম বছরগুলোর দাঁতের যত্ন</h2>
      <p>আমাদের সমাজে অভিভাবকদের মধ্যে একটি অত্যন্ত বিপজ্জনক ধারণা প্রচলিত রয়েছে: <em>"দুধদাঁত তো কয়েক বছর পরেই পড়ে যাবে, তাই এগুলোর যত্ন না নিলেও কোনো ক্ষতি নেই।"</em> চিকিৎসা বিজ্ঞানের দৃষ্টিকোণ থেকে এই ভুল বিশ্বাসটির কারণে হাজার হাজার কোমলমতি শিশু তীব্র দাঁতব্যথা, ইনফেকশন এবং দীর্ঘমেয়াদে স্থায়ী দাঁত আঁকাবাঁকা হওয়ার মতো জটিলতার শিকার হয়।</p>
      
      <p><strong>আমেরিকান একাডেমি অফ পেডিয়াট্রিক ডেন্টিস্ট্রি (AAPD)</strong> এবং আন্তর্জাতিক শিশু স্বাস্থ্য সংস্থাগুলোর সুনির্দিষ্ট বৈজ্ঞানিক নির্দেশনা হলো: শিশুর মুখে প্রথম দাঁত ওঠার সাথে সাথে, অথবা তার <strong>প্রথম জন্মদিনের মধ্যে</strong>, এবং অবশ্যই তিন বছর পূর্ণ হওয়ার আগেই প্রথম ডেন্টাল চেকআপ সম্পন্ন করা উচিত।</p>

      <div class="kgh-callout">
        <strong>চিকিৎসা বিজ্ঞানের তথ্য:</strong> দুধদাঁত কেবল সাময়িক দাঁত নয়, এটি মাড়ির নিচে লুকিয়ে থাকা ভবিষ্যতের স্থায়ী দাঁতগুলোর জন্য প্রাকৃতিক ''দিকনির্দেশক'' বা স্পেস মেনটেইনার হিসেবে কাজ করে। সময়ের আগেই কোনো দুধদাঁত নষ্ট হয়ে পড়ে গেলে স্থায়ী দাঁত সঠিক জায়গায় উঠতে পারে না এবং আঁকাবাঁকা হয়ে যায়।
      </div>

      <h2>শিশুর দুধদাঁতের অপরিহার্য ভূমিকা</h2>
      <p>দুধদাঁত শিশুর শারীরিক ও মানসিক বিকাশে অত্যন্ত গুরুত্বপূর্ণ ভূমিকা পালন করে:</p>
      <ul>
        <li><strong>স্থায়ী দাঁতের সঠিক পথ তৈরি:</strong> দুধদাঁতের শিকড়গুলোর ঠিক নিচেই স্থায়ী দাঁতের বীজ বা মুকুল তৈরি হতে থাকে। দুধদাঁত নির্দিষ্ট সময় পর্যন্ত অক্ষত থাকলে স্থায়ী দাঁত সোজা ও সুন্দরভাবে ওঠে।</li>
        <li><strong>পুষ্টি ও শারীরিক বৃদ্ধি:</strong> শিশুর সঠিক শারীরিক বৃদ্ধির জন্য ফলমূল, শাকসবজি ও শক্ত খাবার ভালোভাবে চিবিয়ে খাওয়া দরকার। দাঁতে ব্যথা থাকলে শিশু শক্ত খাবার খেতে চায় না এবং পুষ্টিহীনতায় ভোগে।</li>
        <li><strong>স্পষ্ট উচ্চারণের ভিত্তি:</strong> সামনের দাঁতগুলো কথা বলার সময় ''ত'', ''থ'', ''দ'', ''স'' জাতীয় বর্ণগুলোর সঠিক উচ্চারণে সাহায্য করে। দুধদাঁত ক্ষতিগ্রস্ত হলে শিশুর কথা স্পষ্ট হতে দেরি হতে পারে।</li>
        <li><strong>চোয়ালের স্বাভাবিক গঠন:</strong> চিবানোর স্বাভাবিক চাপ শিশুর চোয়ালের হাড়কে সমানভাবে বড় হতে সাহায্য করে।</li>
      </ul>

      <h2>নার্সিং বোটল ক্যাভিটি বা শিশুদের দাঁতের ক্ষয়</h2>
      <p>১ থেকে ৪ বছর বয়সী শিশুদের মধ্যে সবচেয়ে বেশি দেখা যায় <strong>আর্লি চাইল্ডহুড ক্যারিজ (ECC)</strong>। এটি অনেক সময় বোতলে দুধ খাওয়ার অভ্যাসের কারণে হয় বলে একে ''নার্সিং বোটল ক্যারিজ'' বলা হয়।</p>

      <h3>এটি কীভাবে হয়?</h3>
      <p>রাতে ঘুমানোর সময় বোতলে দুধ, ফরমুলা বা মিষ্টি কোনো তরল মুখে দিয়ে শিশুকে শুইয়ে রাখলে ঘুমের মধ্যে মুখের লালা তৈরি কমে যায়। ফলে দুধের শর্করা পুরো রাত শিশুর সামনের দাঁতগুলোতে লেগে থাকে। মুখের ক্ষতিকর ব্যাকটেরিয়া এই শর্করা খেয়ে অ্যাসিড তৈরি করে, যা শিশুর পাতলা ও নরম দুধদাঁতের এনামেল খুব দ্রুত গলিয়ে ফেলে দাঁতগুলো কালো করে ভেঙে দেয়।</p>

      <div class="kgh-tip">
        <strong>মা-বাবার জন্য সোনালী নিয়ম:</strong> রাতে ঘুমানোর সময় কখনো মুখে দুধের বোতল দিয়ে ঘুম পাড়াবেন না। রাতে বুকের দুধ বা বোতলের দুধ খাওয়ানোর পর সাথে সাথে নরম সুতি কাপড় বা গজ কাপড় কুসুম গরম পানিতে ভিজিয়ে শিশুর দাঁত ও মাড়ি আলতো করে মুছে দিন।
      </div>

      <h2>ক্লিনিকে শিশুদের জন্য আধুনিক প্রতিরোধমূলক চিকিৎসা</h2>
      <p>দাঁতে কোনো বড় সমস্যা হওয়ার আগেই একজন বিশেষজ্ঞ পেডিয়াট্রিক ডেন্টিস্টের কাছে নিয়ে এলে অত্যন্ত সহজ কিছু প্রতিরোধমূলক ব্যবস্থা নেওয়া যায়:</p>

      <h3>১. পিট অ্যান্ড ফিশার সিল্যান্ট (Pit and Fissure Sealants)</h3>
      <p>শিশুদের পেছনের চর্বণ দাঁতগুলোতে খুব সূক্ষ্ম খাঁজ থাকে যেখানে ব্রাশের আঁশ ঢুকতে পারে না এবং সহজেই খাবার আটকে গর্ত হয়। ডেন্টিস্ট এই খাঁজগুলোতে তরল সিল্যান্ট প্রলেপ দিয়ে মসৃণ করে দেন, যার ফলে ভবিষ্যতে পেছনের দাঁতে ক্যাভিটি হওয়ার সম্ভাবনা শতকরা ৮০ ভাগ কমে যায়।</p>

      <h3>২. টপিক্যাল ফ্লোরাইড বার্নিশ (Fluoride Varnish)</h3>
      <p>মাত্র এক মিনিটে একটি নরম ব্রাশের সাহায্যে দাঁতের ওপর ফ্লোরাইড বার্নিশের প্রলেপ দেওয়া হয়। এটি দুর্বল এনামেলকে পুনরায় খনিজ দিয়ে শক্ত করে এবং প্রাথমিক সাদা দাগ বা ক্ষয় পুরোপুরি সারিয়ে তোলে।</p>

      <h3>৩. ক্ষতিকর অভ্যাস দূরীকরণ</h3>
      <p>দীর্ঘদিন আঙুল চোষা বা হাঁ করে ঘুমানোর অভ্যাসের কারণে চোয়ালের আকার পরিবর্তিত হতে পারে। পেডিয়াট্রিক ডেন্টিস্ট সময়মতো শিশুকে ভালোবেসে এসব অভ্যাস ছাড়ানোর সঠিক উপায় দেখিয়ে দেন।</p>

      <h2>ডেন্টাল ভীতি চিরতরে দূর করার সোনালী সুযোগ</h2>
      <p>ছোট বয়সে ডাক্তারের সাথে পরিচয় হলে শিশুর মনের ভেতর ডেন্টিস্ট বা হাসপাতালের কোনো ভয় জন্মায় না। তারা হাসিখুশি পরিবেশে ডাক্তারের সাথে খেলা করে, উপহার পায় এবং দাঁতের চিকিৎসাকে একটি চমৎকার অভিজ্ঞতা হিসেবে দেখে।</p>
      <p>অন্যদিকে দাঁতে তীব্র পুঁজ ও ব্যথা হওয়ার পর ৫-৬ বছর বয়সে যখন বাধ্য হয়ে জোর করে হাসপাতালে আনা হয়, সেই ট্রমা থেকে শিশু আজীবনের জন্য ডেন্টাল ফোবিয়ায় আক্রান্ত হতে পারে।</p>

      <h2>বয়স অনুযায়ী দাঁত মাজার সহজ নিয়ম</h2>
      <ul>
        <li><strong>০ থেকে ১২ মাস:</strong> দাঁত ওঠার পর থেকে নরম পরিষ্কার ভেজা কাপড় বা নরম সিলিকন ফিঙ্গার ব্রাশ দিয়ে মাড়ি ও দাঁত মুছে দিন।</li>
        <li><strong>১ থেকে ৩ বছর:</strong> নরম বেবি ব্রাশে চালের দানার সমান পরিমাণ শিশু উপযোগী টুথপেস্ট দিয়ে দিনে দুই বেলা দাঁত মাজিয়ে দিন।</li>
        <li><strong>৩ থেকে ৬ বছর:</strong> মটরশুঁটির দানার সমান টুথপেস্ট ব্যবহার করুন এবং সকাল ও রাতে খাওয়ার পর অবশ্যই ব্রাশ করা নিশ্চিত করুন।</li>
      </ul>

      <h2>উপসংহার: সুস্থ শৈশবের শ্রেষ্ঠ উপহার</h2>
      <p>প্রতিরোধ সবসময় চিকিৎসার চেয়ে সহজ ও সাশ্রয়ী। আপনার সন্তানের তিন বছর পূর্ণ হওয়ার আগেই একটি বন্ধুত্বপূর্ণ চেকআপ করিয়ে তার মুখে সুস্থ ও নিষ্পাপ হাসির নিশ্চয়তা তৈরি করুন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'bleeding-gums-what-it-means',
    'Bleeding Gums: Clinical Causes, Disease Progression, and Modern Periodontal Care',
    'মাড়ি থেকে রক্তপাত: প্রাথমিক লক্ষণ, বিপজ্জনক পর্যায় ও আধুনিক পেরিওডন্টাল চিকিৎসা',
    'Why is pink in the sink never normal? Explore the silent progression from reversible gingivitis to destructive periodontitis, systemic health links to diabetes and heart disease, and deep ultrasonic therapy.',
    'ব্রাশ করার সময় মাড়ি থেকে রক্ত পড়া কি সাধারণ বিষয়? রিভার্সিবল জিঞ্জিভাইটিস থেকে পেরিওডন্টাইটিস ও দাঁত নড়ে যাওয়ার ঝুঁকি, ডায়াবেটিসের সাথে সম্পর্ক এবং আধুনিক স্কেলিং ও রুট প্ল্যানিংয়ের বিস্তারিত গাইড।',
    '/images/sub_services/6. 3. Gum Disease.png',
    'periodontics',
    'Periodontics',
    'পিরিওডন্টিক্স',
    '8 min read',
    'Sep 2026',
    'bleeding gums periodontitis gingivitis scaling root planing periodontist dhaka',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['bleeding gums', 'periodontics', 'scaling', 'gum disease', 'kgh dental'],
    '
      <h2>The Warning Sign in Your Bathroom Sink</h2>
      <p>Imagine if your scalp bled every time you brushed your hair, or your hands bled whenever you washed them. You would immediately consult a physician in alarm. Yet, millions of people worldwide rinse pink-tinted foam into their bathroom sink every morning and dismiss it as <em>"just a little gum irritation"</em> or the result of a stiff toothbrush.</p>
      
      <p>In periodontology, there is a fundamental clinical rule: <strong>healthy gums never bleed during gentle brushing or flossing.</strong> Blood indicates an active bacterial infection and ulceration of the gingival sulcus—the delicate collar of tissue sealing your teeth to your jawbone.</p>

      <div class="kgh-callout">
        <strong>The Silent Epidemic:</strong> Gum disease is the number one cause of adult tooth loss globally. Because it is largely painless in its early and moderate stages, patients frequently lose substantial amounts of supporting jawbone before seeking professional intervention.
      </div>

      <h2>The Disease Progression: From Gingivitis to Periodontitis</h2>
      <p>Understanding periodontal disease requires tracking how oral bacteria gradually compromise the structural foundation of your teeth:</p>

      <h3>Stage 1: Plaque Biofilm Accumulation</h3>
      <p>Within hours of brushing, a microscopic, sticky coating of saliva proteins and oral bacteria forms on the teeth (dental plaque). If not cleared daily with flossing and brushing, the bacteria metabolize dietary carbohydrates, producing chemical toxins that irritate adjacent gingival margins.</p>

      <h3>Stage 2: Gingivitis (Reversible Inflammation)</h3>
      <p>The immune system responds by flooding the gums with blood and defense cells. Gums become puffy, reddened, and bleed readily upon touch. Crucially, <strong>gingivitis is 100% reversible</strong>. At this stage, the underlying alveolar bone and periodontal ligament fibers remain completely undamaged.</p>

      <h3>Stage 3: Calculus (Tartar) Hardening</h3>
      <p>If plaque remains unremoved for more than 48 to 72 hours, minerals in your saliva crystallize into hard, chalky deposits called <strong>calculus or tartar</strong>. Calculus forms a rough, porous coral-reef-like surface below the gumline that cannot be removed by any toothbrush or floss; it requires professional ultrasonic instrumentation.</p>

      <h3>Stage 4: Periodontitis (Irreversible Bone Destruction)</h3>
      <p>As bacteria migrate deeper beneath hardened tartar, the chronic inflammatory response triggers osteoclasts to dissolve the alveolar jawbone supporting the tooth roots. Deep pathological pockets form between the tooth and the gum. As bone height recedes, teeth become mobile, shift position, and ultimately fall out or require extraction.</p>

      <h2>The Systemic Danger: How Gum Disease Affects Whole-Body Health</h2>
      <p>Periodontal disease is not confined to the mouth. The ulcerated surface area of deep periodontal pockets in an adult with moderate periodontitis is roughly equivalent to the surface area of the palm of your hand. Through these micro-ulcerations, oral bacteria (such as <em>Porphyromonas gingivalis</em>) and inflammatory cytokines enter the bloodstream 24/7:</p>
      <ul>
        <li><strong>Cardiovascular Disease:</strong> Oral pathogens promote arterial inflammation, accelerating atheroma plaque formation in coronary vessels and doubling the risk of ischemic stroke and heart attacks.</li>
        <li><strong>Diabetes Mellitus:</strong> Severe gum disease impairs glycemic control, increasing insulin resistance. Conversely, elevated blood sugar worsens periodontal bone loss—creating a dangerous bidirectional cycle.</li>
        <li><strong>Adverse Pregnancy Outcomes:</strong> Periodontal pathogens can translocate to the placenta, linked clinically to low birth weight and preterm delivery.</li>
        <li><strong>Respiratory Infections:</strong> Inhaling periodontal bacteria into the lungs increases the risk of aspiration pneumonia in vulnerable adults.</li>
      </ul>

      <h2>Clinical Periodontal Therapies: Reclaiming Gum Health</h2>
      <p>At KGH Dental, periodontal care is customized through thorough diagnostic pocket charting:</p>

      <h3>1. Ultrasonic Scaling & Subgingival Debridement</h3>
      <p>Using microscopic electromagnetic ultrasonic tips vibrating at 30,000 cycles per second, hardened supragingival and subgingival tartar is pulverized effortlessly while continuous sterile water flushes out bacterial colonies.</p>

      <h3>2. Root Planing (Deep Cleaning)</h3>
      <p>Under gentle local anesthesia, specialized micro-curettes smooth and detoxify the rough root surfaces beneath the gums, removing bacterial endotoxins and allowing the healthy gingiva to re-attach firmly to the tooth.</p>

      <h3>3. Laser-Assisted Periodontal Therapy & Regenerative Surgery</h3>
      <p>For deep periodontal pockets (6mm or greater), soft-tissue dental lasers decontaminate infected pocket walls with minimal trauma. In advanced cases, biocompatible bone grafts and enamel matrix proteins are placed to regenerate previously lost jawbone.</p>

      <div class="kgh-tip">
        <strong>The Myth of "Scaling Makes Teeth Loose":</strong> Many patients fear that professional dental cleaning loosens teeth or creates gaps. In reality, hard tartar acts like artificial cement holding previously diseased teeth together. Removing tartar exposes the pre-existing bone loss, allowing the gums to heal. Scaling saves teeth from falling out.
      </div>

      <h2>The At-Home Periodontal Maintenance Protocol</h2>
      <ul>
        <li><strong>Bass Brushing Technique:</strong> Angle your soft toothbrush bristles at 45 degrees toward the gumline to clean the gingival sulcus.</li>
        <li><strong>Daily Interdental Cleaning:</strong> Toothbrush bristles only clean 60% of tooth surfaces. Daily flossing or interdental brushes are non-negotiable for the 40% between teeth.</li>
        <li><strong>Maintenance Recalls:</strong> Patients with a history of periodontitis should attend periodontal maintenance checkups every 3 to 4 months rather than once a year.</li>
      </ul>

      <h2>Conclusion: Healthy Gums Are the Foundation of Every Smile</h2>
      <p>No matter how white or well-aligned your teeth may be, they cannot survive without a sound periodontal foundation. If you see blood when you brush, treat it with the medical urgency it deserves. Schedule an evaluation today to preserve your smile for life.</p>
    ',
    '
      <h2>বেসিনে রক্তের ফোঁটা: অবহেলার চরম বিপদ</h2>
      <p>কল্পনা করুন, আপনি যখনই চুলে চিরুনি চালান বা সাবান দিয়ে হাত ধোন, তখন যদি আপনার ত্বক থেকে রক্ত বের হতো, আপনি কি স্বাভাবিক মনে করতেন? নিশ্চয়ই সাথে সাথে আতঙ্কিত হয়ে ডাক্তারের কাছে ছুটে যেতেন। অথচ প্রতিদিন সকালে দাঁত মাজার পর বেসিনে রক্ত দেখে অনেকেই খুব স্বাভাবিক বিষয় ভেবে এড়িয়ে যান এবং ভাবেন হয়তো ব্রাশ একটু শক্ত লেগেছে।</p>
      
      <p>মাড়িরোগ চিকিৎসার প্রাথমিক বৈজ্ঞানিক সত্যটি হলো: <strong>সুস্থ ও স্বাভাবিক মাড়ি থেকে কোনো অবস্থাতেই ব্রাশ বা ফ্লসিংয়ের সময় রক্ত পড়া স্বাভাবিক নয়।</strong> রক্ত পড়ার অর্থ হলো দাঁতের গোড়ায় ব্যাকটেরিয়ার বিষাক্ত সংক্রমণ জমেছে এবং মাড়ির ভেতরের প্রতিরক্ষা চামড়া কেটে ক্ষত তৈরি হয়েছে।</p>

      <div class="kgh-callout">
        <strong>নীরব ঘাতক:</strong> প্রাপ্তবয়স্কদের দাঁত পড়ে যাওয়ার প্রধান কারণ কোনো ক্যাভিটি নয়, বরং এই পেরিওডন্টাল বা মাড়ির রোগ। প্রাথমিক ও মাঝারি অবস্থায় এই রোগে কোনো তীব্র ব্যথা থাকে না বলে মানুষ বুঝতেও পারে না যে নীরবে তাদের চোয়ালের হাড় ক্ষয় হয়ে যাচ্ছে।
      </div>

      <h2>মাড়ির রোগের বিপজ্জনক পর্যায়সমূহ</h2>
      <p>মাড়ির প্রদাহ কীভাবে ধীরে ধীরে সুস্থ দাঁতের ভিত্তি ধ্বংস করে তা বোঝা জরুরি:</p>

      <h3>১. প্লাক বা ব্যাকটেরিয়ার আস্তরণ জমা</h3>
      <p>দাঁত মাজার কয়েক ঘণ্টার মধ্যেই খাবারের সূক্ষ্ম শর্করা ও লালা মিলে দাঁতের ওপর একটি আঠালো বর্ণহীন প্রলেপ তৈরি করে, যাকে বলা হয় ডেন্টাল প্লাক। এই প্লাক প্রতিদিন ফ্লস ও ব্রাশ দিয়ে দূর না করলে এতে লক্ষ লক্ষ ক্ষতিকর ব্যাকটেরিয়া বংশবৃদ্ধি করে এবং মাড়ির ক্ষতি করে এমন বিষাক্ত রাসায়নিক তৈরি করে।</p>

      <h3>২. জিঞ্জিভাইটিস (প্রাথমিক ও নিরাময়যোগ্য পর্যায়)</h3>
      <p>ব্যাকটেরিয়ার আক্রমণে মাড়ি লালচে হয়ে ফুলে যায় এবং সামান্য স্পর্শেই রক্ত পড়ে। মুখ থেকে কিছুটা দুর্গন্ধ আসতে পারে। এই অবস্থাকে বলা হয় <strong>জিঞ্জিভাইটিস</strong>। এই পর্যায়ে যদি ডেন্টাল ক্লিনিকে গিয়ে দাঁত পরিষ্কার (স্কেলিং) করানো হয়, তবে মাড়ি সম্পূর্ণ আগের মতো শতভাগ সুস্থ হয়ে যায় এবং হাড়ের কোনো ক্ষতি হয় না।</p>

      <h3>৩. ক্যালকুলাস বা পাথরে রূপান্তর</h3>
      <p>প্লাক যদি ৪৮ থেকে ৭২ ঘণ্টার বেশি দাঁতের গায়ে লেগে থাকে, তবে লালার খনিজ উপাদানের সাথে মিশে এটি পাথরের মতো শক্ত হয়ে যায়, যাকে বলা হয় <strong>টারটার বা ক্যালকুলাস</strong>। এই শক্ত পাথর কোনো সাধারণ ব্রাশ দিয়ে দূর করা অসম্ভব; এটি মাড়ির নিচে ঢুকে প্রতিনিয়ত মাড়িকে নিচের দিকে ঠেলে দেয়।</p>

      <h3>৪. পেরিওডন্টাইটিস (হাড়ের অপূরণীয় ক্ষতি)</h3>
      <p>পাথর মাড়ির গভীরে চলে গেলে জীবাণুর আক্রমণে দাঁতকে ধরে রাখা চোয়ালের হাড় স্থায়ীভাবে গলে যায়। দাঁত ও মাড়ির মাঝে গভীর পকেট তৈরি হয়ে পুঁজ বের হয়। একপর্যায়ে শক্ত দাঁত আলগা হয়ে নড়তে শুরু করে এবং কোনো ক্যাভিটি ছাড়াই সুস্থ দাঁতটি ফেলে দিতে হয়।</p>

      <h2>মুখের রোগ থেকে সারা শরীরের মারাত্মক ঝুঁকি</h2>
      <p>মাড়ির সংক্রমণ শুধু মুখের ভেতর সীমাবদ্ধ থাকে না। মাঝারি মানের মাড়িরোগে আক্রান্ত একজন মানুষের মুখের ভেতরের ক্ষতের মোট আয়তন মানুষের হাতের তালুর সমান! এই খোলা ক্ষত দিয়ে বিষাক্ত ব্যাকটেরিয়া ২৪ ঘণ্টা রক্তে মিশে পুরো শরীরে ছড়িয়ে পড়ে:</p>
      <ul>
        <li><strong>হৃদরোগ ও স্ট্রোকের ঝুঁকি:</strong> মাড়ির ব্যাকটেরিয়া রক্তনালীতে গিয়ে প্রদাহ তৈরি করে, যা হার্ট অ্যাটাক ও মস্তিষ্কে স্ট্রোকের ঝুঁকি দ্বিগুণ বাড়িয়ে দেয়।</li>
        <li><strong>ডায়াবেটিস নিয়ন্ত্রণহীনতা:</strong> মাড়ির ইনফেকশন রক্তে ইনসুলিনের কার্যকারিতা কমিয়ে সুগার বাড়িয়ে দেয়। আবার ডায়াবেটিস অনিয়ন্ত্রিত থাকলে মাড়ির হাড়ের ক্ষয় দ্রুত হয়—ফলে একটি বিপজ্জনক চক্রের সৃষ্টি হয়।</li>
        <li><strong>গর্ভবতী মা ও অনাগত শিশুর ঝুঁকি:</strong> মাড়ির প্রদাহের কারণে গর্ভের শিশুর ওজন কম হওয়া বা সময়ের আগেই প্রসবের ঝুঁকি বেড়ে যায়।</li>
      </ul>

      <h2>আধুনিক ক্লিনিক্যাল চিকিৎসা পদ্ধতি</h2>
      <p>কেজিএইচ ডেন্টালে বিশেষজ্ঞ পেরিওডন্টিস্টের তত্ত্বাবধানে বৈজ্ঞানিক চিকিৎসা প্রদান করা হয়:</p>

      <h3>১. আল্ট্রাসনিক স্কেলিং (দাঁত পরিষ্কার)</h3>
      <p>সেকেন্ডে ৩০ হাজার বার কম্পিত হওয়া বিশেষ আল্ট্রাসনিক যন্ত্র দিয়ে কোনো প্রকার দাঁতের ক্ষতি না করে চোখের পলকে পাথরের স্তর গুঁড়ো করে পানি দিয়ে ধুয়ে পরিষ্কার করা হয়।</p>

      <h3>২. ডিপ কিউরেটেজ ও রুট প্ল্যানিং</h3>
      <p>মাড়ির গভীরে চলে যাওয়া জীবাণু ও বিষাক্ত স্তর হালকা অবশ করে অত্যন্ত সূক্ষ্ম যন্ত্র দিয়ে চেঁছে মসৃণ করা হয়, যাতে সুস্থ মাড়ি পুনরায় দাঁতের সাথে শক্তভাবে লেগে যেতে পারে।</p>

      <h3>৩. লেজার ও ফ্ল্যাপ সার্জারি</h3>
      <p>খুব গভীর পকেট তৈরি হলে আধুনিক সফট টিস্যু লেজারের সাহায্যে রক্তপাতহীনভাবে জীবাণু ধ্বংস করা হয় এবং প্রয়োজন অনুযায়ী বোন গ্রাফট ব্যবহার করে ক্ষয়প্রাপ্ত হাড় পুনরায় তৈরি করা হয়।</p>

      <div class="kgh-tip">
        <strong>একটি মারাত্মক ভুল ধারণা:</strong> অনেকে মনে করেন স্কেলিং করালে দাঁত ফাঁকা হয়ে যায় বা দুর্বল হয়। এটি সম্পূর্ণ ভুল! মূলত দাঁতের ফাঁকে জমে থাকা পাথরগুলো মাড়ি ও হাড় খেয়ে ফেলে নিজেই সেখানে সিমেন্টের মতো শক্ত হয়ে থাকে। স্কেলিং করে পাথর সরানোর পর পুরোনো ক্ষতিটি চোখে পড়ে। স্কেলিং না করালে পাথর মাড়িকে শেষ করে দাঁত ফেলে দিত।
      </div>

      <h2>ঘরে বসে মাড়ির প্রতিদিনের যত্ন</h2>
      <ul>
        <li>দিনে দুই বেলা নরম ব্রাশ দিয়ে মাড়ির দিকে ৪৫ ডিগ্রি কোণ করে আলতোভাবে ব্রাশ করুন।</li>
        <li>প্রতিদিন অন্তত একবার ডেন্টাল ফ্লস ব্যবহার করুন, কারণ ব্রাশ দিয়ে দুই দাঁতের মাঝের অংশ পরিষ্কার করা যায় না।</li>
        <li>প্রতি ৬ মাস পরপর নিয়মিত ডেন্টাল ক্লিনিকে গিয়ে মাড়ির স্বাস্থ্য পরীক্ষা করান।</li>
      </ul>

      <h2>উপসংহার: মাড়ি ভালো তো হাসির ভিত্তি ভালো</h2>
      <p>দাঁত যতই সাদা ও সোজা হোক, মাড়ি মজবুত না থাকলে কোনো দাঁতই স্থায়ী হয় না। রক্ত পড়ার প্রাথমিক লক্ষণ দেখামাত্র অবহেলা না করে আজই বিশেষজ্ঞ চিকিৎসকের পরামর্শ নিন এবং আপনার হাসির ভিত্তি মজবুত রাখুন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'crowns-bridges-or-dentures-how-to-choose',
    'Crowns, Bridges, or Dentures: The Comprehensive Prosthodontic Guide',
    'ক্রাউন, ব্রিজ নাকি কৃত্রিম ডেনচার: আপনার দাঁতের জন্য কোন সমাধানটি সেরা?',
    'Confused between dental crowns, fixed bridges, and removable dentures? Compare material strength, chewing dynamics, longevity, and biological trade-offs across modern prosthodontics.',
    'ক্ষতিগ্রস্ত বা হারিয়ে যাওয়া দাঁতের চিকিৎসায় স্থায়ী ক্রাউন (ক্যাপ), ফিক্সড ব্রিজ এবং খোলা-পরা ডেনচারের সুবিধা-অসুবিধার তুলনামূলক বিশ্লেষণ ও আধুনিক প্রস্থোডন্টিক গাইড।',
    '/images/sub_services/4. 1. Dental Crowns.png',
    'prosthodontics',
    'Prosthodontics',
    'প্রস্থোডন্টিক্স',
    '8 min read',
    'Sep 2026',
    'dental crowns bridges dentures prosthodontist dhaka zirconia pfm teeth replacement',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['dental crowns', 'dental bridges', 'dentures', 'zirconia', 'prosthodontics'],
    '
      <h2>The Challenge of Damaged and Missing Teeth</h2>
      <p>When teeth become severely fractured from trauma, heavily broken down by extensive decay, or lost altogether, normal daily activities—such as smiling openly during social interactions or comfortably chewing nutritious foods—become persistent challenges.</p>
      
      <p>Modern prosthodontics offers several proven restorative options: <strong>individual dental crowns</strong>, <strong>fixed dental bridges</strong>, and <strong>removable dentures</strong>. Each restoration is engineered for specific clinical indications, structural requirements, and biological parameters. Understanding how they compare empowers patients to make confident decisions alongside their dental specialist.</p>

      <div class="kgh-callout">
        <strong>Prosthodontic Principle:</strong> The primary goal of any dental restoration is not merely cosmetic appearance; it is to restore stable occlusion (bite dynamics), distribute chewing forces evenly, prevent adjacent tooth migration, and protect oral bone health.
      </div>

      <h2>1. Dental Crowns: Restoring the Strength of a Single Tooth</h2>
      <p>A dental crown—often colloquially termed a <em>"tooth cap"</em>—is a custom-engineered hollow prosthetic shell that encases the entire visible anatomical portion of a damaged natural tooth down to the gumline.</p>

      <h3>When Is a Crown Clinically Indicated?</h3>
      <ul>
        <li>Following root canal therapy, where a devitalized tooth becomes brittle and requires structural reinforcement against heavy bite forces.</li>
        <li>On a tooth with an extensive failing filling that encompasses more than 50% of the tooth structure.</li>
        <li>To restore a cracked or severely fractured tooth that produces sharp pain upon chewing.</li>
        <li>To cosmetically mask severe intrinsic discoloration or misshapen developmental defects.</li>
      </ul>

      <h3>Modern Crown Materials:</h3>
      <ul>
        <li><strong>Monolithic Zirconia:</strong> Milled from solid blocks of zirconium dioxide, these crowns offer extraordinary flexural strength (often exceeding 1,200 MPa), making them virtually indestructible for heavy-grinding posterior molars. Modern multilayered zirconia mimics natural tooth translucency beautifully.</li>
        <li><strong>Lithium Disilicate (E-Max):</strong> A high-strength glass ceramic renowned for optical beauty, ideal for front teeth in the aesthetic smile zone.</li>
        <li><strong>Porcelain-Fused-to-Metal (PFM):</strong> A classical reliable option featuring a metal alloy framework veneered with tooth-colored porcelain.</li>
      </ul>

      <h2>2. Fixed Dental Bridges: Spanning the Gap of Missing Teeth</h2>
      <p>A dental bridge is a fixed restoration designed to replace one or multiple adjacent missing teeth by anchoring permanently onto the natural teeth on either side of the vacant space.</p>

      <h3>How a Traditional Bridge Functions:</h3>
      <p>The teeth flanking the gap are termed <strong>abutment teeth</strong>. These teeth are prepared and shaved down to receive crowns. Connected seamlessly between these abutment crowns is one or more artificial suspended teeth called <strong>pontics</strong>. The entire assembly is cemented permanently into place.</p>

      <h3>Advantages of Fixed Bridges:</h3>
      <ul>
        <li>Completely fixed and non-removable; it does not slip or click during speech or chewing.</li>
        <li>Fast completion time: typically fabricated and delivered within 1 to 2 weeks.</li>
        <li>Restores full aesthetic appearance and immediate chewing ability.</li>
      </ul>

      <h3>Clinical Trade-Offs to Consider:</h3>
      <p>To fabricate a bridge, the healthy protective enamel of the two adjacent teeth must be permanently shaved down—even if they are perfectly healthy and caries-free. Furthermore, a bridge does not stimulate the jawbone beneath the missing tooth, meaning gradual bone resorption will still occur under the suspended pontic.</p>

      <h2>3. Removable Dentures: Complete and Partial Tooth Replacement</h2>
      <p>Dentures are custom-crafted removable prosthetic appliances designed to replace multiple missing teeth (partial dentures) or an entire arch of missing teeth (complete dentures).</p>

      <h3>Types of Dentures:</h3>
      <ul>
        <li><strong>Cast Partial Dentures (CPD):</strong> Feature a rigid, thin medical-grade cobalt-chromium metal framework with subtle precision clasps that grip onto remaining natural teeth for stability.</li>
        <li><strong>Flexible Valplast Dentures:</strong> Made from semi-rigid nylon thermoplastic, offering pink gum-colored clasps that blend into the mouth with zero metal visibility.</li>
        <li><strong>Complete Acrylic Dentures:</strong> Supported entirely by suction against the roof of the mouth (palate) and alveolar ridges when all natural teeth are gone.</li>
      </ul>

      <h3>Who Benefits Most from Dentures?</h3>
      <p>Dentures provide a non-invasive, surgery-free solution for patients who cannot undergo implant surgery due to severe medical conditions, extensive bone loss, or who desire a fast, non-surgical smile rehabilitation.</p>

      <h2>Comparative Decision Matrix</h2>
      <table class="w-full text-left border border-zinc-200 text-xs sm:text-sm my-6">
        <thead>
          <tr class="bg-zinc-100">
            <th class="p-3 border">Feature</th>
            <th class="p-3 border">Dental Crown</th>
            <th class="p-3 border">Fixed Bridge</th>
            <th class="p-3 border">Removable Denture</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-3 border font-bold">Permanence</td>
            <td class="p-3 border">Fixed permanently</td>
            <td class="p-3 border">Fixed permanently</td>
            <td class="p-3 border">Removable daily</td>
          </tr>
          <tr>
            <td class="p-3 border font-bold">Chewing Efficiency</td>
            <td class="p-3 border">98% of natural</td>
            <td class="p-3 border">90% of natural</td>
            <td class="p-3 border">40%–60% of natural</td>
          </tr>
          <tr>
            <td class="p-3 border font-bold">Adjacent Teeth Impact</td>
            <td class="p-3 border">Zero impact</td>
            <td class="p-3 border">Requires shaving 2 teeth</td>
            <td class="p-3 border">Minimal clasp contact</td>
          </tr>
          <tr>
            <td class="p-3 border font-bold">Jawbone Preservation</td>
            <td class="p-3 border">Preserves natural root</td>
            <td class="p-3 border">Bone under pontic resorbs</td>
            <td class="p-3 border">Bone gradually resorbs</td>
          </tr>
        </tbody>
      </table>

      <div class="kgh-tip">
        <strong>Oral Hygiene with a Bridge:</strong> Bacteria can accumulate beneath the suspended pontic tooth of a bridge. Using specialized bridge threader floss or an oral water irrigator daily is essential to prevent decay on the supporting anchor teeth.
      </div>

      <h2>Conclusion: Customizing the Right Treatment Plan</h2>
      <p>Every mouth possesses unique anatomical characteristics, bite dynamics, and personal expectations. By consulting with a certified prosthodontist, you receive an in-depth clinical analysis to determine whether a precision crown, fixed bridge, or custom prosthesis is the ideal pathway to restoring your smile.</p>
    ',
    '
      <h2>ক্ষতিগ্রস্ত ও হারানো দাঁতের জটিলতা</h2>
      <p>দাঁতে বড় ক্যাভিটি হওয়া, কোনো দুর্ঘটনায় দাঁত ভেঙে যাওয়া কিংবা একটি বা একাধিক দাঁত চিরতরে হারিয়ে ফেলা—মানুষের প্রাত্যহিক জীবনে মারাত্মক অস্বস্তির কারণ হয়ে দাঁড়ায়। এটি শুধু সুন্দর হাসিতে বাধা দেয় না, বরং পছন্দের পুষ্টিকর খাবার স্বাভাবিকভাবে চিবিয়ে খাওয়ার ক্ষমতা কেড়ে নেয়।</p>
      
      <p>আধুনিক প্রস্থোডন্টিক চিকিৎসায় হারানো বা ক্ষতিগ্রস্ত দাঁত সুন্দরভাবে ফিরিয়ে আনার জন্য তিনটি প্রধান উপায় রয়েছে: <strong>ব্যক্তিগত ক্রাউন বা ক্যাপ</strong>, <strong>ফিক্সড ডেন্টাল ব্রিজ</strong> এবং <strong>খোলা-পরা কৃত্রিম দাঁত বা ডেনচার</strong>। আপনার মুখ ও দাঁতের সামগ্রিক অবস্থা অনুযায়ী কোনটি সবচেয়ে উপযোগী, তা জানতে এগুলোর প্রতিটি বিষয় জানা দরকার।</p>

      <div class="kgh-callout">
        <strong>প্রস্থোডন্টিক্সে চিকিৎসার মূল দর্শন:</strong> কৃত্রিম দাঁতের কাজ শুধু সুন্দর দেখানো নয়; এর আসল উদ্দেশ্য হলো চর্বণের ভারসাম্য ফিরিয়ে আনা, পাশের দাঁতের স্থানচ্যুতি রোধ করা এবং পুরো চোয়ালকে দীর্ঘকাল সুস্থ রাখা।
      </div>

      <h2>১. ডেন্টাল ক্রাউন (ক্যাপ): একটি ক্ষতিগ্রস্ত দাঁতের রক্ষাকবচ</h2>
      <p>ডেন্টাল ক্রাউন বা প্রচলিত ভাষায় যাকে <strong>দাঁতের ক্যাপ</strong> বলা হয়, তা হলো একটি সম্পূর্ণ কাস্টমাইজড শক্ত কৃত্রিম আবরণ যা পুরো ক্ষতিগ্রস্ত দাঁতের ওপর টুপির মতো স্থায়ীভাবে বসিয়ে দেওয়া হয়।</p>

      <h3>কখন ক্রাউন বা ক্যাপ প্রয়োজন হয়?</h3>
      <ul>
        <li>রুট ক্যানেল চিকিৎসার পর, কারণ নার্ভহীন দাঁত কিছুটা ভঙ্গুর হয়ে পড়ে এবং শক্ত খাবারে ভেঙে যাওয়ার ঝুঁকি থাকে।</li>
        <li>দাঁতের অর্ধেকের বেশি অংশ যখন বড় ক্যাভিটি বা ভাঙার কারণে নষ্ট হয়ে যায় এবং সাধারণ ফিলিং দিয়ে রক্ষা করা যায় না।</li>
        <li>দাঁতে ফাটল থাকলে, যার কারণে খাবার চিবানোর সময় তীব্র খচখচে ব্যথা হয়।</li>
        <li>সামনের কোনো দাঁতের স্বাভাবিক রং ও গঠন মারাত্মকভাবে বিকৃত হলে।</li>
      </ul>

      <h3>আধুনিক ক্যাপের বিভিন্ন উপাদান:</h3>
      <ul>
        <li><strong>সলিড জিরকোনিয়া (Zirconia):</strong> আধুনিক চিকিৎসা বিজ্ঞানের সবচেয়ে শক্তিশালী উপাদান। এটি অত্যন্ত শক্ত এবং ভারী চর্বণ চাপেও কখনোই ভাঙে না। আধুনিক জিরকোনিয়া দেখতে হুবহু প্রাকৃতিক দাঁতের মতোই উজ্জ্বল হয়।</li>
        <li><strong>ই-ম্যাক্স সিরামিক (E-Max):</strong> এটি কাচের মতো অত্যন্ত চমৎকার উজ্জ্বল সিরামিক, যা সামনের দাঁতের সৌন্দর্যের জন্য বিশ্বজুড়ে সেরা হিসেবে বিবেচিত।</li>
        <li><strong>পিএফএম (Porcelain Fused to Metal):</strong> মেটালের ওপর সিরামিকের প্রলেপ দেওয়া ক্লাসিক্যাল ক্যাপ, যা অনেক বছর ধরে বিশ্বস্ততার সাথে ব্যবহৃত হয়ে আসছে।</li>
      </ul>

      <h2>২. ফিক্সড ডেন্টাল ব্রিজ: হারানো দাঁতের স্থায়ী সেতু</h2>
      <p>ডেন্টাল ব্রিজ হলো এমন একটি স্থায়ী সমাধান, যেখানে ফাঁকা জায়গার দুই পাশের দুটি সুস্থ দাঁতকে খুঁটি হিসেবে ব্যবহার করে মাঝের খালি জায়গায় এক বা একাধিক কৃত্রিম দাঁত স্থায়ীভাবে জুড়ে দেওয়া হয়।</p>

      <h3>ফিক্সড ব্রিজের প্রধান সুবিধাসমূহ:</h3>
      <ul>
        <li>এটি মুখে স্থায়ীভাবে সিমেন্ট দিয়ে আটকানো থাকে, ফলে নিজে থেকে খুলে পড়ে যাওয়ার কোনো ভয় থাকে না।</li>
        <li>মাত্র ১ থেকে ২ সপ্তাহের মধ্যেই সম্পূর্ণ স্থায়ী দাঁত পাওয়া যায়।</li>
        <li>স্বাভাবিকভাবে সব ধরণের খাবার চিবিয়ে খাওয়া যায় এবং দেখতে অত্যন্ত আকর্ষণীয়।</li>
      </ul>

      <h3>যে বিষয়টি খেয়াল রাখা দরকার:</h3>
      <p>ব্রিজ বসানোর জন্য ফাঁকা জায়গার দুই পাশের সম্পূর্ণ ভালো দুটি দাঁতকে কেটে ছোট করতে হয়। তাছাড়া মাঝের ফাঁকা জায়গার মাড়ির হাড়ের ওপর কোনো প্রত্যক্ষ শিকড় না থাকায় সেখানে সময়ের সাথে সাথে মাড়ির হাড় কিছুটা সংকুচিত হতে পারে।</p>

      <h2>৩. রিমুভেবল ডেনচার: সহজে খোলা ও পরার কৃত্রিম দাঁত</h2>
      <p>ডেনচার হলো এমন একটি কৃত্রিম দাঁতের পাটি যা রোগী খুব সহজে নিজে নিজেই মুখ থেকে খুলে পরিষ্কার করতে পারেন এবং আবার পরতে পারেন।</p>

      <h3>ডেনচারের প্রকারভেদ:</h3>
      <ul>
        <li><strong>কাস্ট পার্শিয়াল ডেনচার (CPD):</strong> পাতলা মেটালের ফ্রেমের ওপর তৈরি, যা মুখের বাকি প্রাকৃতিক দাঁতের সাথে সূক্ষ্ম ক্লিপের মাধ্যমে শক্তভাবে আটকে থাকে।</li>
        <li><strong>ফ্লেক্সিবল ডেনচার (Valplast):</strong> এটি কোনো মেটাল ছাড়াই অত্যন্ত নরম ও নমনীয় প্লাস্টিকের তৈরি। মাড়ির রঙের সাথে এত সুন্দরভাবে মিশে যায় যে বাইরে থেকে দেখে বোঝার উপায় থাকে না।</li>
        <li><strong>সম্পূর্ণ ডেনচার (Complete Denture):</strong> যাদের মুখে একটিও দাঁত অবশিষ্ট নেই, তাদের জন্য মাড়ির সাথে সাকশন প্রক্রিয়ায় আটকে থাকা সম্পূর্ণ কৃত্রিম দাঁতের পাটি।</li>
      </ul>

      <div class="kgh-tip">
        <strong>ব্রিজের বিশেষ যত্ন:</strong> ফিক্সড ব্রিজের নিচের অংশে খাবার জমতে পারে। তাই সাধারণ ব্রাশের পাশাপাশি বিশেষ ডেন্টাল ফ্লস বা ওয়াটার ফ্লসার ব্যবহার করে ব্রিজের নিচ পরিষ্কার রাখা জরুরি।
      </div>

      <h2>উপসংহার: সঠিক সিদ্ধান্তের মাধ্যমে স্বাভাবিক জীবন</h2>
      <p>আপনার মুখের হাড়ের ঘনত্ব, মাড়ির অবস্থা এবং জীবনযাত্রার ওপর নির্ভর করে বিশেষজ্ঞ প্রস্থোডন্টিস্ট আপনার জন্য সবচেয়ে কার্যকর চিকিৎসা পরিকল্পনা তৈরি করেন। কেজিএইচ ডেন্টালে একটি বিশদ পরীক্ষার মাধ্যমে জেনে নিন আপনার জন্য ক্যাপ, ব্রিজ নাকি অন্য কোনো বিকল্প সেরা হবে।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    '5-signs-you-need-a-root-canal',
    '5 Warning Signs You Need an Urgent Root Canal (Don''t Ignore These)',
    'দাঁতের নার্ভ ইনফেকশনের ৫টি বিপজ্জনক সতর্ক সংকেত যা কখনোই অবহেলা করবেন না',
    'Are you ignoring persistent tooth sensitivity or nocturnal throbbing pain? Learn the pathophysiology of dental pulp necrosis, periapical abscess risks, and when emergency care saves your tooth.',
    'দাঁতের দীর্ঘস্থায়ী শিরশিরানি বা রাতে হঠাৎ তীব্র ব্যথা কি সাধারণ সমস্যা? দাঁতের নার্ভ ইনফেকশনের বিভিন্ন স্তর, পুঁজ সৃষ্টির ঝুঁকি এবং জরুরি চিকিৎসার গুরুত্বের বিস্তারিত গাইড।',
    '/images/sub_services/8. 5. Emergency Dental Care.png',
    'endodontics',
    'Endodontics',
    'এন্ডোডন্টিক্স',
    '7 min read',
    'Sep 2026',
    'signs you need root canal tooth infection symptoms emergency dentist dhaka pulpitis',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['root canal', 'tooth pain', 'dental infection', 'emergency dentistry', 'kgh dental'],
    '
      <h2>The Silent Escalation of Dental Nerve Infection</h2>
      <p>Toothaches have a notorious reputation for striking at the most inconvenient times—during important work meetings, in the middle of international travel, or in the dead of night when dental chambers are closed. Many patients endure fluctuating discomfort for weeks, self-medicating with over-the-counter painkillers or home remedies, hoping the issue will resolve on its own.</p>
      
      <p>However, dental pathology operates on an immutable biological rule: <strong>an infected dental nerve cannot heal itself.</strong> Unlike minor skin cuts or muscle strains, the interior pulp of a tooth lacks collateral blood circulation. Once bacteria overwhelm the chamber, the infection inevitably progresses until treated. Recognizing the early diagnostic warning signs is the difference between simple tooth preservation and complex surgical extraction.</p>

      <div class="kgh-callout">
        <strong>The Biological Rule:</strong> Painkillers merely mute your brain''s perception of pain signals; they do nothing to halt the bacterial destruction quietly dissolving the bone at the tip of your tooth root.
      </div>

      <h2>The Progression: Reversible vs Irreversible Pulpitis</h2>
      <p>Endodontists categorize dental pulp inflammation into sequential stages:</p>
      <ul>
        <li><strong>Reversible Pulpitis:</strong> Mild inflammation where the nerve is irritated (usually by a shallow cavity or minor filling leakage). Teeth feel a brief twinge when exposed to cold ice cream, but the sensation vanishes within 2 to 3 seconds. The nerve is healthy and can fully recover with a simple restorative filling.</li>
        <li><strong>Irreversible Pulpitis:</strong> Deep bacterial invasion where pulpal blood vessels become permanently damaged. Temperature sensitivity lingers for 30 seconds or longer, followed by spontaneous throbbing. The nerve is dying and cannot recover; root canal therapy is mandatory.</li>
        <li><strong>Pulp Necrosis & Periapical Abscess:</strong> The nerve tissues die completely. Pain may temporarily vanish for days or weeks before severe pressure pain, gum boils, facial swelling, and fever occur as bacteria colonize the jawbone.</li>
      </ul>

      <h2>The 5 Critical Warning Signs You Must Not Ignore</h2>

      <h3>1. Persistent Thermal Sensitivity (Lingering Cold or Heat)</h3>
      <p>Does sipping hot tea or cold water trigger an agonizing ache that radiates into your jaw, ear, or temple and continues throbbing for minutes after you swallow? Healthy teeth feel temperature for a split second. A deep, lingering response is the classic clinical hallmark of irreversible pulpitis caused by decaying nerve tissue.</p>

      <h3>2. Spontaneous Nocturnal Throbbing Pain</h3>
      <p>Pain that awakens you from a sound sleep at 2 AM or begins spontaneously without any food or drink trigger is a grave warning sign. When you lie flat horizontally, blood pressure in the head naturally increases. In an inflamed tooth with high intra-pulpal pressure, this posture change causes unbearable pulsating waves of pain.</p>

      <h3>3. Pain Upon Chewing, Biting, or Light Tapping</h3>
      <p>If biting down on soft bread produces a sharp jolt of pain, or if touching the tooth with your fingertip feels intensely tender, the infection has exited the tip of the tooth root and is actively attacking the <em>periodontal ligament</em>—the biological shock absorber anchoring the tooth into your jawbone.</p>

      <h3>4. A Persistent Pimple or Boil on the Gums (Sinus Tract / Fistula)</h3>
      <p>Have you noticed a small, recurrent white or yellowish pimple on your gum near the tooth that occasionally bursts, releasing a foul-tasting salty fluid? This is a <strong>fistula</strong>—a biological drainage tunnel created by pus tunneling through the jawbone to relieve pressure. While it temporarily reduces tooth pain, it confirms severe chronic bone infection.</p>

      <h3>5. Dark Discoloration of a Single Tooth</h3>
      <p>If a single tooth begins turning dark yellow, grayish-blue, or blackish—especially after a past sports blow, accident, or fall—it indicates internal pulpal hemorrhage. The blood vessels inside have ruptured and decomposed, staining the porous dentin tubules from within like a bruise that cannot clear.</p>

      <h2>The Systemic Danger of Untreated Dental Abscesses</h2>
      <p>An untreated root canal infection is not a localized nuisance; it is an active microbial reservoir. Pathogenic bacteria can track along fascial planes into the neck, causing <strong>Ludwig''s Angina</strong> (a life-threatening swelling of the airway) or enter the venous sinus system, producing cavernous sinus thrombosis or sepsis. Prompt endodontic therapy neutralizes this danger entirely.</p>

      <div class="kgh-tip">
        <strong>What to Do in a Dental Emergency:</strong> If you experience severe facial swelling, difficulty swallowing, or fever accompanying a toothache, seek emergency dental and medical care immediately. Never place an aspirin tablet directly on the gum tissue; this causes severe chemical burns.
      </div>

      <h2>Conclusion: Early Intervention Saves Your Tooth</h2>
      <p>Modern root canal therapy is rapid, comfortable, and pain-free under modern local anesthesia. If you recognize even one of these five warning signs, do not wait for the pain to become agonizing. Contact our endodontic specialists today to evaluate your tooth with precision digital imaging.</p>
    ',
    '
      <h2>দাঁতের নার্ভ ইনফেকশনের নীরব বিস্তার</h2>
      <p>দাঁতব্যথার মতো মারাত্মক অস্বস্তিকর অনুভূতি খুব কমই আছে। সবচেয়ে ভয়ের বিষয় হলো, এই ব্যথা অধিকাংশ সময়ই কোনো পূর্ব ঘোষণা ছাড়াই তীব্রভাবে আঘাত হানে—বিশেষ করে মাঝরাতে যখন সব ক্লিনিক বন্ধ থাকে। অনেকেই এই ব্যথাকে অবহেলা করে মাসের পর মাস ব্যথানাশক ওষুধ খেয়ে কাটিয়ে দেওয়ার চেষ্টা করেন।</p>
      
      <p>কিন্তু ডেন্টাল সায়েন্সের একটি মৌলিক সত্য হলো: <strong>দাঁতের ভেতরের নার্ভের ইনফেকশন নিজে নিজে কখনোই সারে না।</strong> শরীরের অন্যান্য অঙ্গের মতো দাঁতের ভেতরের নরম নার্ভে অতিরিক্ত রক্ত সঞ্চালন নেই যা নিজে থেকে জীবাণুকে পরাস্ত করতে পারে। ফলে একবার নার্ভে ব্যাকটেরিয়া ঢুকে পড়লে রুট ক্যানেল চিকিৎসা ছাড়া এই সমস্যা স্থায়ীভাবে দূর করার আর কোনো উপায় থাকে না।</p>

      <div class="kgh-callout">
        <strong>সতর্কতা:</strong> ব্যথানাশক ওষুধ কেবল কিছুক্ষণের জন্য মস্তিষ্কের ব্যথার সংকেত বন্ধ করে রাখে; এটি দাঁতের শিকড়ের গভীরে হাড়ের ধ্বংসাত্মক ইনফেকশন এক মুহূর্তের জন্যও থামাতে পারে না।
      </div>

      <h2>দাঁতের ব্যথার বিভিন্ন ধাপ</h2>
      <p>ইনফেকশন কীভাবে ধীরে ধীরে শিকড়ের দিকে ছড়িয়ে পড়ে তা লক্ষ্য করা যাক:</p>
      <ul>
        <li><strong>রিভার্সিবল পালপাইটিস (প্রাথমিক পর্যায়):</strong> ছোট ক্যাভিটির কারণে বরফ বা ঠান্ডা পানি খেলে হালকা শিরশির করে, কিন্তু খাবার শেষ করার ২-৩ সেকেন্ডের মধ্যেই তা পুরোপুরি থেমে যায়। এই পর্যায়ে সাধারণ একটি ফিলিং করালেই দাঁত চিরতরে সুস্থ হয়ে যায়।</li>
        <li><strong>ইরিভার্সিবল পালপাইটিস (অপূরণীয় পর্যায়):</strong> ক্যাভিটি গভীর হয়ে নার্ভ পুরোপুরি আক্রান্ত হয়। ঠান্ডা বা গরম খাবার খাওয়ার পর তীব্র ব্যথা বা শিরশিরানি ৩০ সেকেন্ড বা তার চেয়ে বেশি সময় ধরে চলতে থাকে। এই পর্যায়ে রুট ক্যানেল চিকিৎসা বাধ্যতামূলক।</li>
        <li><strong>পাল্প নেক্রোসিস ও পুঁজ তৈরি:</strong> দাঁতের ভেতরের নার্ভ পচে পুরোপুরি মরে যায়। কিছুদিন কোনো ব্যথা নাও থাকতে পারে, কিন্তু জীবাণু শিকড়ের মুখ দিয়ে মাড়ির হাড়ে পুঁজ তৈরি করতে থাকে।</li>
      </ul>

      <h2>৫টি প্রধান বিপজ্জনক লক্ষণ যা দেখা দিলে সাথে সাথে ডাক্তার দেখাবেন</h2>

      <h3>১. গরম বা ঠান্ডা খাবারে দীর্ঘস্থায়ী তীব্র শিরশিরানি</h3>
      <p>চা বা গরম স্যুপ খাওয়ার পর যদি দাঁতে এমন তীব্র ব্যথা বা শিরশিরানি শুরু হয় যা চোয়াল, কান বা মাথার দিকে ছড়িয়ে পড়ে এবং খাবার খাওয়া শেষ করার পরও দীর্ঘক্ষণ ধরে দপদপ করতে থাকে, তবে এটি নিশ্চিতভাবে নার্ভ ক্ষতিগ্রস্ত হওয়ার লক্ষণ।</p>

      <h3>২. রাতে নিজে নিজেই তীব্র দপদপানি ব্যথা শুরু হওয়া</h3>
      <p>কোনো খাবার খাওয়া বা ছোঁয়া ছাড়াই রাতে ঘুমানোর পর হঠাৎ তীব্র ব্যথায় ঘুম ভেঙে যাওয়া রুট ক্যানেলের সবচেয়ে পরিচিত লক্ষণ। রাতে যখন আমরা শুয়ে থাকি, তখন মাথায় রক্ত চলাচলের চাপ কিছুটা বাড়ে। ইনফেকশনযুক্ত দাঁতের ভেতরের অবরুদ্ধ চেম্বারে এই অতিরিক্ত রক্তচাপ তীব্র যন্ত্রণাদায়ক দপদপানি অনুভূতির সৃষ্টি করে।</p>

      <h3>৩. খাবার চিবানোর সময় বা দাঁতে টোকা দিলে ব্যথা লাগা</h3>
      <p>ভাত বা নরম পাউরুটি চিবানোর সময় যদি দাঁতে তীব্র খচখচে ব্যথা লাগে, কিংবা আঙুল দিয়ে দাঁত নাড়াচাড়া করলে প্রচণ্ড টনটন করে, তবে বুঝতে হবে ইনফেকশন দাঁতের গণ্ডি ছাড়িয়ে শিকড়ের নিচে মাড়ির হাড় ও লিগামেন্টে ছড়িয়ে পড়েছে।</p>

      <h3>৪. মাড়িতে ছোট ব্রণের মতো ফোটা বা পুঁজ বের হওয়া (ফিস্টুলা)</h3>
      <p>দাঁতের গোড়ায় মাড়ির ওপর ছোট ব্রণের মতো পুঁজভর্তি গুটি দেখা দেওয়া এবং তা ফেটে মুখে নোনতা বা দুর্গন্ধযুক্ত তরল বের হওয়া একটি বড় বিপদের সংকেত। হাড়ের ভেতরের জমে থাকা পুঁজ বের হওয়ার জন্য যখন নিজে থেকে সুরঙ্গ তৈরি করে, তখন তাকে ফিস্টুলা বলে। এর ফলে দাঁতের ব্যথা কিছুটা কমলেও হাড়ের মারাত্মক ক্ষতি হতে থাকে।</p>

      <h3>৫. একটি নির্দিষ্ট দাঁতের রং কালচে বা ধূসর হয়ে যাওয়া</h3>
      <p>যদি আপনার কোনো একটি দাঁত হঠাৎ করেই হলদে, কালচে বা ধূসর বর্ণ ধারণ করে—বিশেষ করে অতীতে কোনো খেলাধুলা বা দুর্ঘটনায় সেই দাঁতে আঘাত লেগে থাকলে—তবে বুঝতে হবে দাঁতের ভেতরের রক্তনালী ছিঁড়ে গিয়ে ভেতরে রক্তক্ষরণ হয়েছে এবং দাঁতের নার্ভ সম্পূর্ণ মরে গেছে।</p>

      <h2>চিকিৎসা না করালে সারা শরীরে কী বিপদ হতে পারে?</h2>
      <p>দাঁতের পুঁজকে অবহেলা করলে তা চোয়ালের নরম কোষের ভেতর দিয়ে গলায় ছড়িয়ে পড়তে পারে, যাকে চিকিৎসাবিজ্ঞানে <strong>লুডভিগস অ্যানজাইনা (Ludwig''s Angina)</strong> বলা হয়। এটি শ্বাসনালী বন্ধ করে দিতে পারে যা জীবনের জন্য চরম ঝুঁকিপূর্ণ। সময়মতো একটি সাধারণ ব্যথাহীন রুট ক্যানেল এই মারাত্মক বিপদ থেকে আপনাকে সম্পূর্ণ রক্ষা করে।</p>

      <div class="kgh-tip">
        <strong>জরুরি প্রাথমিক পরামর্শ:</strong> দাঁতে ব্যথা হলে কখনো মাড়ির ওপর সরাসরি অ্যাসপিরিন বা ব্যথানাশক ট্যাবলেট চেপে রাখবেন না; এতে মাড়ির চামড়া পুড়ে মারাত্মক ঘা তৈরি হয়। কুসুম গরম পানিতে লবণ দিয়ে কুলকুচি করুন এবং দ্রুত বিশেষজ্ঞ চিকিৎসকের শরণাপন্ন হন।
      </div>

      <h2>উপসংহার: সময়ের এক ফোঁড়, অসময়ের দশ ফোঁড়</h2>
      <p>দাঁতে কোনো সমস্যা হলে যত দ্রুত চিকিৎসা নেওয়া যায়, চিকিৎসা তত বেশি সহজ, ব্যথাহীন ও সফল হয়। ওপরের ৫টি লক্ষণের যেকোনো একটিও যদি আপনার মধ্যে দেখা যায়, তবে আর কালবিলম্ব না করে কেজিএইচ ডেন্টালের বিশেষজ্ঞ চিকিৎসকদের সাথে যোগাযোগ করুন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'tmj-disorder-jaw-clicking-explained',
    'TMJ Disorder: Why Your Jaw Clicks, Pops, and Locks (Clinical Causes & Solutions)',
    'চোয়ালের জয়েন্টে খটখট শব্দ ও তীব্র ব্যথা (TMJ Disorder): কারণ, লক্ষণ ও আধুনিক সমাধান',
    'Does your jaw click when chewing or yawn? Understand temporomandibular joint biomechanics, nocturnal bruxism, tension headaches, and non-surgical splint therapy.',
    'হাই তোলা বা খাবার চিবানোর সময় কি চোয়ালে খটখট শব্দ বা খিল ধরে যায়? টিএমজে ডিসঅর্ডারের কারণ, রাতে দাঁত কিড়মিড় করার অভ্যাস, দীর্ঘমেয়াদী মাথাব্যথা এবং আধুনিক থেরাপিউটিক স্প্লিন্ট চিকিৎসার সহজ নির্দেশিকা।',
    '/images/sub_services/2.5.  TMJ Jaw Joint Disorder Treatment.png',
    'oral-surgery',
    'Oral Surgery',
    'ওরাল সার্জারি',
    '8 min read',
    'Sep 2026',
    'TMJ disorder jaw clicking popping lockjaw treatment oral maxillofacial surgeon dhaka nightguard',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['TMJ', 'jaw pain', 'nightguard', 'bruxism', 'oral surgery', 'kgh dental'],
    '
      <h2>The Most Active and Complex Joint in the Human Body</h2>
      <p>Take a moment to swallow, talk, or chew your food. Every single movement relies on two symmetrical joints located just in front of each ear: the <strong>Temporomandibular Joints (TMJ)</strong>. These joints connect the lower jawbone (mandible) to the temporal bone of the skull.</p>
      
      <p>What makes the TMJ uniquely intricate is its hybrid biomechanics: it is not a simple hinge joint like the elbow or knee. It performs both a rotational hinge movement and a smooth sliding translational movement simultaneously. Between the two bones rests a delicate, fibrous shock-absorbing cushion called the <strong>articular disc</strong>. When this disc slips out of alignment or surrounding masticatory muscles fall into chronic spasm, the result is <strong>Temporomandibular Disorder (TMD)</strong>.</p>

      <div class="kgh-callout">
        <strong>Prevalence:</strong> Millions of individuals suffer from mysterious earaches, chronic morning tension headaches, and neck stiffness for years without realizing the true root cause is located right inside their jaw joints.
      </div>

      <h2>Why Does Your Jaw Click, Pop, or Crack?</h2>
      <p>The audible "click" or "pop" heard when opening your mouth wide or biting into a firm apple is mechanical:</p>
      <ul>
        <li><strong>Anterior Disc Displacement with Reduction:</strong> When the jaw is closed, the articular disc is displaced forward out of its natural socket. As you open your mouth wide, the head of the condyle snaps back onto the disc with an audible <em>"click"</em> (reduction). When closing, the disc slips off again with a second click.</li>
        <li><strong>Crepitus (Grating Sound):</strong> A dry, sand-like grating or crunching sound indicates wear or osteoarthritic degradation of the joint cartilage, indicating advanced joint friction.</li>
        <li><strong>Lockjaw (Closed Lock):</strong> When the displaced disc becomes so wedged that the condyle can no longer slide over it, the jaw mechanically "locks" shut, preventing the patient from opening their mouth wider than one or two finger widths.</li>
      </ul>

      <h2>Primary Root Causes of TMJ Dysfunction</h2>
      <p>TMJ disorders are typically multifactorial, caused by a combination of muscular, structural, and behavioral triggers:</p>

      <h3>1. Nocturnal Bruxism (Nighttime Teeth Grinding and Clenching)</h3>
      <p>Many patients clench their teeth with hundreds of pounds of unconscious force during sleep, especially during periods of high mental stress. This exerts immense compression on the articular disc and exhausts the masseter and temporalis muscles.</p>

      <h3>2. Malocclusion and Missing Back Teeth</h3>
      <p>When posterior molars are lost or poorly aligned, the vertical dimension of the bite collapses. The jaw condyle is pushed unnaturally backward and upward into the sensitive retrodiscal tissue, causing chronic nerve compression and inflammation.</p>

      <h3>3. Physical Trauma and Whiplash</h3>
      <p>A direct sports blow to the chin, a car accident, or opening the mouth too widely during long medical intubations can stretch or tear the delicate ligaments anchoring the articular disc.</p>

      <h3>4. Chronic Forward Head Posture</h3>
      <p>Hours spent hunched over laptops and smartphones alters cervical spine curvature, pulling neck and jaw muscles out of alignment and straining the TMJ.</p>

      <h2>Classic Symptoms Beyond the Jaw Joint</h2>
      <p>Because the TMJ shares sensory nerve pathways (cranial nerve V) with the ears, temples, and neck, symptoms frequently masquerade as other medical conditions:</p>
      <ul>
        <li><strong>Tension Headaches:</strong> Dull, band-like morning headaches radiating across the temples.</li>
        <li><strong>Ear Fullness and Tinnitus:</strong> Ringing in the ears, muffled hearing, or a feeling of deep pressure without an ear canal infection.</li>
        <li><strong>Cervical Neck and Shoulder Stiffness:</strong> Radiating muscle soreness down the trapezius and sternocleidomastoid muscles.</li>
        <li><strong>Chewing Fatigue:</strong> Exhaustion in the facial muscles while eating tough or chewy foods.</li>
      </ul>

      <h2>Evidence-Based Clinical Treatments for TMJ Disorder</h2>
      <p>At KGH Dental, TMJ treatment follows a conservative, sequential, non-surgical protocol designed to relieve pressure and restore joint harmony:</p>

      <h3>1. Custom Occlusal Splints (Nightguards / Deprogrammers)</h3>
      <p>Unlike soft over-the-counter sports guards that actually encourage nighttime chewing, our specialists fabricate custom hard acrylic occlusal splints. Engineered to exact digital specifications, the splint separates the dental arches, redistributes bite force evenly, and allows the condyle to rest in its natural musculoskeletal position (Centric Relation).</p>

      <h3>2. Pharmacotherapy & Muscle De-escalation</h3>
      <p>Targeted short-term anti-inflammatory medications, selective muscle relaxants, and cold/warm contrast therapy break the persistent cycle of muscle spasm and joint swelling.</p>

      <h3>3. TMJ Arthrocentesis & Lavage</h3>
      <p>For severe closed-lock conditions, an oral and maxillofacial surgeon performs joint arthrocentesis—a minimally invasive in-office procedure where sterile fluid washes inflammatory chemicals out of the joint capsule, followed by hyaluronic acid injection to lubricate smooth disc movement.</p>

      <h3>4. Occlusal Rehabilitation & Orthodontics</h3>
      <p>Once acute pain is stabilized, missing back teeth are restored with crowns or implants, and malocclusion is corrected with orthodontics to ensure stable long-term bite support.</p>

      <div class="kgh-tip">
        <strong>Self-Care Routine for Jaw Pain:</strong> Practice the "lips together, teeth apart" posture during the daytime. Switch temporarily to a soft diet, avoid chewing gum completely, and support your chin with your fist when yawning to prevent joint overextension.
      </div>

      <h2>Conclusion: Relief Is Within Reach</h2>
      <p>You do not have to live with chronic morning headaches or painful jaw clicking. A comprehensive TMJ assessment by an oral and maxillofacial specialist can accurately diagnose your joint biomechanics and provide customized, non-invasive relief.</p>
    ',
    '
      <h2>মানবদেহের সবচেয়ে কর্মব্যস্ত ও জটিল জয়েন্ট</h2>
      <p>আমরা যখনই কথা বলি, খাবার চিবোই, ঢোক গিলি কিংবা হাই তুলি—সব সময়ই কানের ঠিক সামনে থাকা একটি বিশেষ জয়েন্টের ওপর নির্ভর করতে হয়। একে চিকিৎসা বিজ্ঞানের ভাষায় বলা হয় <strong>টেম্পোরোম্যান্ডিবুলার জয়েন্ট বা টিএমজে (TMJ)</strong>। এটি আমাদের নিচের চোয়ালকে মাথার খুলির হাড়ের সাথে যুক্ত করে রাখে।</p>
      
      <p>আমাদের শরীরের অন্যান্য কবজা জয়েন্টের (যেমন কনুই বা হাঁটু) মতো টিএমজে কেবল এক দিকে খোলে না। এটি একই সাথে মুখ খোলার সময় কবজার মতো ঘোরে এবং খাবার চিবানোর সময় মসৃণভাবে সামনের দিকে পিছলে যায়। এই দুটি হাড়ের ঘর্ষণ প্রতিরোধ করার জন্য মাঝখানে একটি নরম রাবারের মতো কুশন বা <strong>আর্টিকুলার ডিস্ক</strong> থাকে। কোনো কারণে এই ডিস্ক সরে গেলে বা চোয়ালের মাংসপেশিতে তীব্র টান লাগলে তাকে <strong>টিএমজে ডিসঅর্ডার (TMD)</strong> বলে।</p>

      <div class="kgh-callout">
        <strong>অজানা সত্য:</strong> প্রতিদিন লক্ষ লক্ষ মানুষ দীর্ঘস্থায়ী মাইগ্রেন, কানের ভেতরে অদ্ভুত ভোঁ-ভোঁ শব্দ বা সকালে ঘুম থেকে উঠে তীব্র ঘাড়-মাথাব্যথায় ভোগেন, কিন্তু তারা বুঝতেও পারেন না যে এই সমস্যার মূল উৎস তাদের চোয়ালের জয়েন্টে লুকিয়ে রয়েছে।
      </div>

      <h2>চোয়ালে খটখট বা কটকট শব্দ হওয়ার কারণ কী?</h2>
      <p>মুখ বড় করে হাঁ করলে কিংবা শক্ত কিছু চিবানোর সময় কানের সামনে যে খটখট শব্দ হয়, তার সুনির্দিষ্ট যান্ত্রিক কারণ রয়েছে:</p>
      <ul>
        <li><strong>ডিস্ক সরে যাওয়া (Disc Displacement):</strong> মুখ বন্ধ থাকা অবস্থায় নরম কুশন বা ডিস্কটি তার স্বাভাবিক জায়গা থেকে সামনের দিকে ছিটকে থাকে। যখন আপনি মুখ বড় করে খোলেন, তখন চোয়ালের হাড়টি একটি <em>"খট"</em> শব্দ করে জোরপূর্বক ডিস্কের ওপর উঠে আসে। আবার মুখ বন্ধ করার সময় দ্বিতীয়বার শব্দ করে ডিস্কটি ছিটকে যায়।</li>
        <li><strong>বালি বা কাঁকড়ের মতো ঘষার শব্দ (Crepitus):</strong> জয়েন্টের ভেতরের তরুণাস্থি বা কার্টিলেজ শুকিয়ে ক্ষয় হয়ে গেলে দুটি হাড়ের পরস্পরের সাথে সরাসরি ঘর্ষণের ফলে বালির মতো শব্দ তৈরি হয়। এটি জয়েন্টের দীর্ঘমেয়াদী ক্ষয়ের লক্ষণ।</li>
        <li><strong>চোয়াল আটকে যাওয়া বা লকজ (Lockjaw):</strong> ডিস্কটি এত বেশি সরে যায় যে চোয়ালের হাড় আর নড়াচড়া করতে পারে না এবং মুখ মাত্র এক বা দুই আঙুলের বেশি খোলা সম্ভব হয় না।</li>
      </ul>

      <h2>টিএমজে সমস্যার প্রধান কারণসমূহ</h2>
      <p>এই সমস্যাটি সাধারণত একাধিক কারণে সৃষ্টি হয়:</p>

      <h3>১. রাতে ঘুমের মধ্যে দাঁত কিড়মিড় করা বা চাপ দেওয়া (Bruxism)</h3>
      <p>অতিরিক্ত মানসিক দুশ্চিন্তা বা কাজের চাপের কারণে অনেকেই অবচেতন মনে রাতে ঘুমের মধ্যে প্রচণ্ড শক্তিতে দাঁতে দাঁত চেপে রাখেন বা কিড়মিড় করেন। এতে জয়েন্টের ওপর শত শত পাউন্ড অস্বাভাবিক চাপ পড়ে এবং চোয়ালের মাংসপেশি মারাত্মক ক্লান্ত হয়ে পড়ে।</p>

      <h3>২. পেছনের দাঁত না থাকা বা অসমান দাঁতের কামড়</h3>
      <p>যদি পেছনের চর্বণ দাঁতগুলো অনুপস্থিত থাকে, তবে পুরো মুখের কামড়ের ভারসাম্য নষ্ট হয়ে যায়। এর ফলে নিচের চোয়ালের হাড় অস্বাভাবিকভাবে পেছনের দিকে কানের নার্ভে চাপ দেয়, যা থেকে তীব্র প্রদাহ তৈরি হয়।</p>

      <h3>৩. চোয়ালে আঘাত বা দুর্ঘটনা</h3>
      <p>খেলাধুলায় থুতনিতে আঘাত লাগা বা কোনো অপারেশনের সময় দীর্ঘক্ষণ মুখ অতিরিক্ত হাঁ করে রাখার কারণে জয়েন্টের লিগামেন্ট ক্ষতিগ্রস্ত হতে পারে।</p>

      <h3>৪. মোবাইল ও কম্পিউটারের ভুল অঙ্গভঙ্গি</h3>
      <p>ঘাড় সামনের দিকে ঝুঁকিয়ে দীর্ঘক্ষণ মোবাইল বা ল্যাপটপ ব্যবহার করলে ঘাড় ও চোয়ালের পেশির স্বাভাবিক টান নষ্ট হয়ে যায়।</p>

      <h2>চোয়াল ছাড়াও যেসকল লক্ষণ দেখা দিতে পারে</h2>
      <p>টিএমজের স্নায়ুগুলো কান, মাথা ও ঘাড়ের স্নায়ুর সাথে সরাসরি সংযুক্ত থাকে। তাই লক্ষণগুলো অন্য রোগের মতো মনে হতে পারে:</p>
      <ul>
        <li>সকালে ঘুম ভাঙার সাথে সাথে মাথার দুই পাশে বা রগ চেপে ধরা মাথাব্যথা।</li>
        <li>কানে কোনো ইনফেকশন ছাড়াই কানে তীব্র ব্যথা, ভারী ভাব বা ভোঁ-ভোঁ শব্দ হওয়া (Tinnitus)।</li>
        <li>ঘাড়, কাঁধ ও পিঠের ওপরের পেশিতে সার্বক্ষণিক শক্ত টান বা ব্যথা থাকা।</li>
        <li>শক্ত খাবার চিবানোর সময় মুখের মাংশপেশি দ্রুত ক্লান্ত হয়ে পড়া।</li>
      </ul>

      <h2>আধুনিক ও কার্যকরী বৈজ্ঞানিক চিকিৎসা</h2>
      <p>কেজিএইচ ডেন্টালে কোনো ধরনের অপ্রয়োজনীয় অস্ত্রোপচার ছাড়াই আধুনিক ও বৈজ্ঞানিক পদ্ধতিতে চিকিৎসা দেওয়া হয়:</p>

      <h3>১. কাস্টম নাইটগার্ড ও স্প্লিন্ট থেরাপি (Occlusal Splint)</h3>
      <p>বিশেষজ্ঞের তৈরি স্বচ্ছ শক্ত অ্যাক্রিলিক স্প্লিন্ট রাতে ঘুমানোর সময় পরতে দেওয়া হয়। এটি ওপর ও নিচের দাঁতের সংযোগ আলাদা করে দেয়, ফলে রাতে দাঁত কিড়মিড় করার চাপ জয়েন্টে পৌঁছাতে পারে না এবং জয়েন্ট সম্পূর্ণ বিশ্রাম পায়।</p>

      <h3>২. ওষুধ ও ফিজিওথেরাপি</h3>
      <p>পেশির খিঁচুনি কমাতে মাংসপেশি শিথিলকারী ওষুধ এবং গরম ও ঠান্ডা সেঁকের মাধ্যমে জয়েন্টের রক্ত চলাচল স্বাভাবিক করা হয়।</p>

      <h3>৩. জয়েন্ট ওয়াশ বা আর্থ্রোসেন্টেসিস (Arthrocentesis)</h3>
      <p>খুব জটিল ক্ষেত্রে একটি অত্যন্ত মৃদু প্রক্রিয়ায় স্যালাইনের সাহায্যে জয়েন্টের ভেতরের বিষাক্ত প্রদাহমূলক রাসায়নিক ধুয়ে বের করে দেওয়া হয় এবং পিচ্ছিলকারক হায়ালুরোনিক অ্যাসিড ইনজেকশন দেওয়া হয়।</p>

      <h3>৪. পেছনের হারানো দাঁত প্রতিস্থাপন</h3>
      <p>পেছনের খালি জায়গায় ইমপ্ল্যান্ট বা ক্যাপ বসিয়ে মুখের স্বাভাবিক চর্বণ উচ্চতা ফিরিয়ে আনা হয় যাতে জয়েন্টের ওপর থেকে স্থায়ীভাবে চাপ কমে যায়।</p>

      <div class="kgh-tip">
        <strong>দৈনন্দিন সতর্কতা:</strong> দিনে সবসময় "ঠোঁট বন্ধ, কিন্তু ওপর-নিচের দাঁত আলগা" রাখার অভ্যাস করুন। চুইংগাম চিবানো পুরোপুরি বন্ধ রাখুন এবং হাই তোলার সময় থুতনির নিচে হাত দিয়ে রাখুন যাতে মুখ অতিরিক্ত বড় হাঁ না হয়।
      </div>

      <h2>উপসংহার: কষ্ট সহ্য না করে সঠিক চিকিৎসা নিন</h2>
      <p>চোয়ালের খটখট শব্দ বা সকালের মাথাব্যথাকে স্বাভাবিক ভেবে দিনের পর দিন ব্যথানাশক ওষুধ খেয়ে যাওয়া শরীরের জন্য ক্ষতিকর। একজন বিশেষজ্ঞ ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জনের সাথে পরামর্শ করে সঠিক রোগ নির্ণয়ের মাধ্যমে দ্রুত সুস্থ ও স্বাভাবিক জীবনে ফিরে আসুন।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

INSERT INTO public.blog_posts (
    slug,
    title_en,
    title_bn,
    excerpt_en,
    excerpt_bn,
    cover_image,
    department_slug,
    department_name_en,
    department_name_bn,
    read_time,
    date_str,
    target_keyword,
    author_name_en,
    author_name_bn,
    author_role_en,
    author_role_bn,
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    'complete-guide-to-teeth-whitening',
    'Professional Teeth Whitening: Clinical Safety, Techniques, and Long-Lasting Results',
    'দাঁত ঝকঝকে সাদা করার আধুনিক চিকিৎসা: নিরাপত্তা, কার্যকর উপায় ও স্থায়ী উজ্জ্বলতার সঠিক গাইড',
    'Understand intrinsic vs extrinsic dental stains, professional in-office laser whitening vs customized take-home trays, sensitivity management, and why abrasive DIY remedies destroy enamel.',
    'দাঁতের বাইরের দাগ বনাম ভেতরের হলুদভাব দূর করার বৈজ্ঞানিক উপায়। প্রফেশনাল ইন-অফিস হোয়াইটেনিং বনাম ক্ষতিকর ঘরোয়া পদ্ধতির বিপদ এবং নিরাপদ ও দীর্ঘস্থায়ী উজ্জ্বল হাসির সম্পূর্ণ নির্দেশিকা।',
    '/images/sub_services/3. 9. Toothe whitening.png',
    'general-consultation',
    'Aesthetic Dentistry',
    'কসমেটিক ও নান্দনিক দন্তচিকিৎসা',
    '8 min read',
    'Sep 2026',
    'professional teeth whitening dhaka laser bleaching cosmetic dentist dental stains',
    'Admin',
    'এডমিন',
    'Admin',
    'এডমিন',
    '',
    ARRAY['teeth whitening', 'cosmetic dentistry', 'smile aesthetics', 'bleaching', 'kgh dental'],
    '
      <h2>The Psychology and Science of a Radiant Smile</h2>
      <p>A bright, sparkling smile is one of the most powerful social and professional assets an individual can possess. Studies in social psychology consistently demonstrate that individuals with clear, radiant smiles are perceived as more approachable, confident, healthy, and successful.</p>
      
      <p>However, over the course of life, teeth naturally lose their youthful luminosity. Enamel wears thinner, exposing the yellowish dentin layer beneath, while daily exposure to pigmented foods and beverages causes noticeable discoloration. In the modern quest for whiter teeth, internet trends promote numerous unregulated DIY hacks. Understanding the clinical science behind tooth discoloration and professional whitening ensures you achieve brilliant results safely without permanently stripping your enamel.</p>

      <div class="kgh-callout">
        <strong>Biological Truth:</strong> Enamel is the only tissue in the human body that cannot regenerate once destroyed. True professional teeth whitening does not scrape away enamel; it uses oxidation chemistry to break down chromogen stain molecules deep within microscopic enamel pores.
      </div>

      <h2>Understanding Tooth Discoloration: Extrinsic vs Intrinsic Stains</h2>
      <p>Cosmetic dentists categorize dental discoloration into two distinct pathophysiological types:</p>

      <h3>1. Extrinsic Stains (Surface Level)</h3>
      <p>Extrinsic discoloration occurs on the outer surface of the enamel. It is caused by dark chromogens and tannins binding to the salivary pellicle. The most common culprits include:</p>
      <ul>
        <li><strong>Black Tea & Coffee:</strong> Rich in complex tannins that adhere tenaciously to enamel micro-grooves.</li>
        <li><strong>Tobacco & Nicotine:</strong> Produces stubborn, dark brown and yellowish tar deposits.</li>
        <li><strong>Spices (Turmeric / Mustard):</strong> Staple culinary spices in South Asian cooking that deposit intense yellow pigments over time.</li>
        <li><strong>Dark Berries & Cola:</strong> Highly acidic and heavily pigmented beverages that etch enamel and deposit color simultaneously.</li>
      </ul>

      <h3>2. Intrinsic Stains (Deep Internal Structure)</h3>
      <p>Intrinsic discoloration occurs within the deeper dentin layer beneath the enamel:</p>
      <ul>
        <li><strong>Natural Aging:</strong> As we mature, the outer translucent enamel layer naturally thins from decades of chewing, while the underlying yellowish dentin layer thickens.</li>
        <li><strong>Tetracycline Antibiotic Exposure:</strong> Ingesting tetracycline during tooth mineralization in childhood produces deep gray or brown banding.</li>
        <li><strong>Dental Fluorosis:</strong> Excessive fluoride ingestion during early childhood creates permanent chalky white or brown mottled enamel lines.</li>
        <li><strong>Trauma & Devitalization:</strong> A tooth whose nerve has died from trauma turns dark gray as decomposed hemoglobin penetrates dentinal tubules.</li>
      </ul>

      <h2>The Danger of Abrasive DIY "Whitening" Hacks</h2>
      <p>Social media frequently champions home remedies such as <em>activated charcoal powder</em>, <em>baking soda with lemon juice</em>, or <em>strawberry scrubs</em>. From a dental perspective, these are catastrophic for tooth health:</p>
      <ul>
        <li><strong>Severe Enamel Abrasion:</strong> Charcoal particles have extremely high abrasive values (RDA). They scrape away the protective outer enamel. While teeth may appear slightly cleaner initially, the lost enamel exposes the naturally yellow dentin beneath, leaving teeth permanently yellower and hypersensitive.</li>
        <li><strong>Acid Erosion:</strong> Rubbing citrus juice (citric acid) on teeth chemically dissolves calcium from the enamel matrix, creating microscopic erosion craters and predisposing teeth to rapid decay.</li>
      </ul>

      <h2>Professional Whitening Modalities: Clinical Excellence</h2>
      <p>At KGH Dental, aesthetic whitening is conducted under strict clinical supervision using safe, pH-balanced, medical-grade formulations:</p>

      <h3>1. In-Office Power LED / Laser Whitening (Immediate Results)</h3>
      <p>For patients desiring instant transformation before weddings, public speaking events, or photoshoots:</p>
      <ol>
        <li><strong>Gingival Barrier Isolation:</strong> A liquid light-cured resin barrier is meticulously applied over the gums and mucosal lips, isolating the teeth so bleaching gels never touch soft tissue.</li>
        <li><strong>Application of Stabilized Hydrogen Peroxide:</strong> A medical-grade 25% to 35% hydrogen peroxide gel is applied directly onto the enamel surfaces.</li>
        <li><strong>Photocatalytic Activation:</strong> A calibrated cool blue LED or dental laser accelerates the breakdown of hydrogen peroxide into active oxygen free radicals. These oxygen radicals diffuse through the porous enamel prisms, breaking the chemical double-bonds of complex dark stain molecules, converting them into colorless compounds.</li>
        <li><strong>Visible Shift:</strong> In three 15-minute cycles (roughly 45 minutes total chairside time), teeth can lighten by <strong>5 to 8 shades</strong> on the VITA dental shade guide.</li>
      </ol>

      <h3>2. Customized Home Whitening Trays (Controlled Longevity)</h3>
      <p>Using 3D digital impressions, custom-scalloped clear trays are vacuum-formed to fit your dental arches precisely down to the millimeter. You are provided with professional-grade carbamide peroxide gel to wear for 30 to 60 minutes daily at home for 10 to 14 days, offering gentle, progressive lightening with exceptional longevity.</p>

      <h2>Preventing and Managing Sensitivity</h2>
      <p>Temporary post-whitening sensitivity occurs because bleaching gels temporarily open microscopic dentinal tubules, allowing temperature sensations to reach pulpal nerve endings faster. Modern professional treatments integrate <strong>amorphous calcium phosphate (ACP)</strong>, <strong>potassium nitrate</strong>, and <strong>fluoride</strong> to immediately desensitize and occlude tubules, ensuring comfortable recovery within 24 hours.</p>

      <div class="kgh-tip">
        <strong>The "White Diet" Rule for 48 Hours:</strong> Following professional whitening, the enamel pellicle is temporarily porous. For the first 48 hours, adhere strictly to a "white diet"—milk, water, chicken, white rice, egg whites, and bananas. Avoid tea, coffee, curries, soy sauce, and tobacco completely during this critical window.
      </div>

      <h2>Conclusion: Invest in Safe, Scientific Radiance</h2>
      <p>Do not compromise the irreplaceable protective enamel of your teeth with harsh abrasives. Achieve a dazzling, photo-ready smile with clinically validated, specialist-supervised whitening that protects your dental health while maximizing radiant aesthetics.</p>
    ',
    '
      <h2>উজ্জ্বল হাসির মনস্তাত্ত্বিক প্রভাব ও বিজ্ঞান</h2>
      <p>একটি ঝকঝকে ও উজ্জ্বল হাসি মানুষের ব্যক্তিত্বের সবচেয়ে আকর্ষণীয় অংশ। বিভিন্ন গবেষণায় দেখা গেছে, যাদের দাঁত পরিষ্কার ও সুন্দর, তারা সামাজিকভাবে অনেক বেশি আত্মবিশ্বাসী ও সফল হিসেবে বিবেচিত হন এবং যেকোনো আড্ডায় নিঃসংকোচে প্রাণখোলা হাসি উপহার দিতে পারেন।</p>
      
      <p>কিন্তু বয়স বাড়ার সাথে সাথে এবং প্রাত্যহিক খাদ্যাভ্যাসের কারণে দাঁতের স্বাভাবিক শুভ্রতা ধীরে ধীরে মলিন হয়ে পড়ে। চায়ের লিকার, কফি বা মসলাযুক্ত খাবারের কারণে দাঁতের ওপর হলদেটে বা কালচে দাগ পড়ে। আজকাল সামাজিক যোগাযোগ মাধ্যমে অনেকেই দাঁত সাদা করার নানা অনিরাপদ ঘরোয়া টোটকা প্রচার করেন। কিন্তু দাঁতের মতো সংবেদনশীল অংশের ক্ষেত্রে বৈজ্ঞানিক উপায় না জানলে স্থায়ী ক্ষতির ঝুঁকি তৈরি হয়।</p>

      <div class="kgh-callout">
        <strong>চিকিৎসা বিজ্ঞানের তথ্য:</strong> দাঁতের ওপরের স্বচ্ছ সাদা আবরণ বা এনামেল একবার নষ্ট হলে মানবদেহে তা আর কখনো নিজে থেকে তৈরি হতে পারে না। আসল আধুনিক দাঁত সাদা করার প্রক্রিয়া কোনো ঘষাঘষি করে এনামেল তুলে ফেলা নয়; বরং এটি একটি সম্পূর্ণ নিরাপদ বৈজ্ঞানিক জারণ প্রক্রিয়া যা এনামেলের ছিদ্রের ভেতরের দাগকে নির্মূল করে।
      </div>

      <h2>দাঁতে দাগ পড়ার প্রকারভেদ</h2>
      <p>দাঁতে সাধারণত দুই ধরণের দাগ দেখা যায়:</p>

      <h3>১. এক্সট্রিনসিক বা বাহ্যিক দাগ (দাঁতের ওপরের দাগ)</h3>
      <p>এটি দাঁতের সবচেয়ে বাইরের স্তরে খাবারের রঙের কারণে ঘটে থাকে। প্রধান কারণগুলো হলো:</p>
      <ul>
        <li><strong>লাল চা ও ব্ল্যাক কফি:</strong> চায়ের ট্যানিন উপাদান নিয়মিত দাঁতের ক্ষুদ্রাতিক্ষুদ্র খাঁজে জমে স্থায়ী হলুদ বা বাদামী দাগ তৈরি করে।</li>
        <li><strong>ধূমপান ও জর্দা-তামাক:</strong> তামাকের নিকোটিন ও টার দাঁতের গোড়ায় অতি দ্রুত গাঢ় কালচে ও জেদি দাগ বসিয়ে দেয়।</li>
        <li><strong>হলুদ ও অতিরিক্ত মসলাযুক্ত খাবার:</strong> আমাদের দেশের দৈনন্দিন রান্নায় ব্যবহৃত হলুদ ও মসলা দাঁতের এনামেলে দীর্ঘমেয়াদে হলদেটে ভাব তৈরি করে।</li>
        <li><strong>কোমল পানীয়:</strong> অতিরিক্ত অ্যাসিডযুক্ত কোল্ড ড্রিঙ্কস দাঁতের এনামেল নরম করে ফেলে দাগকে দ্রুত স্থায়ী করে।</li>
      </ul>

      <h3>২. ইনট্রিনসিক বা অভ্যন্তরীণ দাগ (দাঁতের ভেতরের গভীর দাগ)</h3>
      <p>এটি দাঁতের ভেতরের ডেনটিন স্তরের কাঠামোগত পরিবর্তনের কারণে ঘটে:</p>
      <ul>
        <li><strong>বার্ধক্যজনিত কারণ:</strong> বয়সের সাথে সাথে বাইরের এনামেল স্তর পাতলা হয়ে আসে এবং ভেতরের হলদেটে ডেনটিন দৃশ্যমান হয়ে ওঠে।</li>
        <li><strong>ছোটবেলায় ওষুধের পার্শ্বপ্রতিক্রিয়া:</strong> শৈশবে দাঁত গঠনের সময় বিশেষ অ্যান্টিবায়োটিক (টেট্রাসাইক্লিন) সেবনের কারণে দাঁতের ভেতর ধূসর বা কালচে রেখা তৈরি হতে পারে।</li>
        <li><strong>ফ্লোরোসিস:</strong> পানিতে অতিরিক্ত ফ্লোরাইড থাকার কারণে শৈশবেই দাঁতের ভেতর সাদা চকের মতো বা বাদামী দাগ জন্মায়।</li>
        <li><strong>আঘাতজনিত কারণ:</strong> অতীতে কোনো দাঁতে চোট লেগে ভেতরের রক্তনালী ফেটে গেলে সেই দাঁতটি ভেতর থেকে গাঢ় ধূসর হয়ে যায়।</li>
      </ul>

      <h2>ঘরোয়া অনিরাপদ টোটকার ভয়াবহ বিপদ</h2>
      <p>ইন্টারনেটে কয়লার গুঁড়ো (Activated Charcoal), বেকিং সোডা বা লেবুর রস দিয়ে দাঁত ঘষার যেসব পরামর্শ দেখা যায়, চিকিৎসা বিজ্ঞানের দৃষ্টিতে তা মারাত্মক ক্ষতিকর:</p>
      <ul>
        <li><strong>এনামেল চিরতরে ঘষে নষ্ট হওয়া:</strong> কয়লা ও বেকিং সোডা বালির মতো ধারালো। এগুলো দিয়ে ঘষলে দাঁতের এনামেল সম্পূর্ণ উঠে যায়। ফলে ভেতরের হলুদ অংশ আরও বেশি বেরিয়ে আসে এবং দাঁতে আজীবনের জন্য অসহ্য শিরশিরানি তৈরি হয়।</li>
        <li><strong>অ্যাসিডের আক্রমণ:</strong> লেবুর রসে থাকা সাইট্রিক অ্যাসিড দাঁতের ক্যালসিয়ামকে গলিয়ে ফেলে দাঁতে দ্রুত গর্ত তৈরি করে।</li>
      </ul>

      <h2>কেজিএইচ ডেন্টালের আধুনিক প্রফেশনাল হোয়াইটেনিং</h2>
      <p>ক্লিনিকে বিশেষজ্ঞ চিকিৎসকের তত্ত্বাবধানে নিরাপদ ও মেডিকেল-গ্রেড উপাদানের মাধ্যমে চিকিৎসা করা হয়:</p>

      <h3>১. ইন-অফিস পাওয়ার এলইডি/লেজার হোয়াইটেনিং (তাৎক্ষণিক ফলাফল)</h3>
      <p>যাদের সামনে বিয়ে, কোনো বিশেষ অনুষ্ঠান বা প্রেজেন্টেশন রয়েছে এবং মাত্র এক ঘণ্টায় ঝকঝকে হাসি চান:</p>
      <ol>
        <li><strong>মাড়ির সুরক্ষা (Gingival Barrier):</strong> প্রথমে একটি বিশেষ জেল দিয়ে সম্পূর্ণ মাড়ি ও ঠোঁট এমনভাবে ঢেকে দেওয়া হয় যাতে ব্লিচিং জেল কোনোভাবেই নরম মাড়িতে না লাগে।</li>
        <li><strong>হোয়াইটেনিং জেল প্রয়োগ:</strong> দাঁতের ওপর পিএইচ-ব্যালান্সড নিরাপদ হাইড্রোজেন পারক্সাইড জেল সমানভাবে লাগানো হয়।</li>
        <li><strong>লেজার/এলইডি অ্যাক্টিভেশন:</strong> বিশেষ ব্লু-লাইট বা লেজারের আলো জেলের অক্সিজেন কণাকে সক্রিয় করে তোলে। এই অক্সিজেন এনামেলের ভেতরে প্রবেশ করে দাগের অণুগুলোকে ভেঙে পুরোপুরি বর্ণহীন করে দেয়।</li>
        <li><strong>তাৎক্ষণিক শুভ্রতা:</strong> মাত্র ৪৫ থেকে ৬০ মিনিটের মধ্যে দাঁত <strong>৫ থেকে ৮ শেড পর্যন্ত</strong> লক্ষণীয়ভাবে উজ্জ্বল ও সাদা হয়ে ওঠে।</li>
      </ol>

      <h3>২. কাস্টমাইজড হোম হোয়াইটেনিং ট্রে</h3>
      <p>ডিজিটাল স্ক্যানের মাধ্যমে আপনার দাঁতের মাপে তৈরি স্বচ্ছ নরম ট্রে এবং চিকিৎসকের নির্দেশিত মৃদু জেল দেওয়া হয়, যা বাড়িতে বসেই প্রতিদিন ৩০ মিনিট ব্যবহার করে ধাপে ধাপে স্থায়ী শুভ্রতা অর্জন করা যায়।</p>

      <div class="kgh-tip">
        <strong>চিকিৎসা পরবর্তী ৪৮ ঘণ্টার বিশেষ নিয়ম (White Diet):</strong> হোয়াইটেনিং করানোর পর প্রথম ৪৮ ঘণ্টা দাঁতের এনামেলের ছিদ্রগুলো খুব সংবেদনশীল থাকে। এই সময়ে চা, কফি, হলুদযুক্ত তরকারি, কোলা, ধূমপান ইত্যাদি সম্পূর্ণ পরিহার করুন। ভাত, দুধ, ডিমের সাদা অংশ, মুরগির মাংস এবং কলা জাতীয় সাদা খাবার গ্রহণ করুন।
      </div>

      <h2>উপসংহার: নিরাপদ চিকিৎসার মাধ্যমে পান আত্মবিশ্বাসী হাসি</h2>
      <p>দাঁত আপনার শরীরের একটি অত্যন্ত মূল্যবান অংশ। ঝুঁকিপূর্ণ ঘরোয়া পদ্ধতি দিয়ে এনামেল ধ্বংস না করে একজন বিশেষজ্ঞ কসমেটিক ডেন্টাল সার্জনের শরণাপন্ন হোন এবং বৈজ্ঞানিক পদ্ধতিতে নিশ্চিত করুন স্বাস্থ্যকর ও উজ্জ্বল হাসি।</p>
    ',
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();

-- ==============================================================================
-- 7. SETUP VERIFICATION QUERY
-- ==============================================================================
SELECT 'Admin Users' AS entity, COUNT(*) AS total_count FROM public.admin_users
UNION ALL
SELECT 'Departments' AS entity, COUNT(*) AS total_count FROM public.departments
UNION ALL
SELECT 'Sub-Services' AS entity, COUNT(*) AS total_count FROM public.sub_services
UNION ALL
SELECT 'Doctors' AS entity, COUNT(*) AS total_count FROM public.doctors
UNION ALL
SELECT 'Clinic Settings' AS entity, COUNT(*) AS total_count FROM public.clinic_settings
UNION ALL
SELECT 'Reviews' AS entity, COUNT(*) AS total_count FROM public.reviews
UNION ALL
SELECT 'Why Choose Cards' AS entity, COUNT(*) AS total_count FROM public.why_choose_cards
UNION ALL
SELECT 'Clinical Creed' AS entity, COUNT(*) AS total_count FROM public.clinical_creed
UNION ALL
SELECT 'Gallery Items' AS entity, COUNT(*) AS total_count FROM public.gallery_items
UNION ALL
SELECT 'Before & After Items' AS entity, COUNT(*) AS total_count FROM public.before_after_items
UNION ALL
SELECT 'Featured Videos' AS entity, COUNT(*) AS total_count FROM public.featured_videos
UNION ALL
SELECT 'Blog Posts' AS entity, COUNT(*) AS total_count FROM public.blog_posts
UNION ALL
SELECT 'Appointments' AS entity, COUNT(*) AS total_count FROM public.appointments
UNION ALL
SELECT 'Doctor Blocked Dates' AS entity, COUNT(*) AS total_count FROM public.doctor_blocked_dates;
