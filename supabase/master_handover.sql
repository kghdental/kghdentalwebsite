-- ==============================================================================
-- KGH DENTAL CLINIC — CLIENT HANDOVER MASTER DATABASE SETUP SCRIPT
-- ==============================================================================
-- Target Database: Supabase (PostgreSQL)
-- File: master_handover.sql
-- Description:
--   Single-execution unified setup script for client's Supabase project.
--   Creates all tables, schemas, relations, RLS security policies,
--   indexes, storage buckets, admin credentials, and seeds complete verified
--   production data (all 7 doctors, 8 departments, 36+ sub-services,
--   clinic settings, patient reviews, CMS cards, and appointment booking engine).
--
-- INSTRUCTIONS FOR CLIENT / DEVELOPER:
-- 1. Open Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Select your new KGH Dental project
-- 3. Click "SQL Editor" in the left sidebar (icon: >_)
-- 4. Click "+ New query" at the top
-- 5. Paste the ENTIRE contents of this file into the editor
-- 6. Click "Run" (or press Ctrl + Enter)
-- 7. Confirm all tables are created and populated via the summary table at the bottom.
-- ==============================================================================

-- Enable Necessary Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLE DEFINITIONS (SAFE & IDEMPOTENT)
-- ==============================================================================

-- 1.1 ADMIN USERS (Database-Driven Authentication)
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

-- 1.2 CLINICAL DEPARTMENTS
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

-- 1.3 SUB-SERVICES (TREATMENTS UNDER DEPARTMENTS)
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

-- 1.4 DOCTORS (SURGEONS & SPECIALISTS)
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

-- 1.5 CLINIC SETTINGS
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

-- 1.6 APPOINTMENTS (DYNAMIC 2-STATUS BOOKING ENGINE)
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

-- 1.7 DOCTOR BLOCKED DATES (Leaves & Off-Days)
CREATE TABLE IF NOT EXISTS public.doctor_blocked_dates (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    blocked_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.8 VERIFIED REVIEWS
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

-- 1.9 WHY CHOOSE US CARDS
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

-- 1.10 CLINICAL CREED / PHILOSOPHY
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

-- 1.11 GALLERY ITEMS & MEDIA FILES
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('chamber', 'treatments', 'sterilization')),
    desc_en TEXT NOT NULL,
    desc_bn TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_slot_lookup ON public.appointments(doctor_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_ref_search ON public.appointments(reference_code);
CREATE INDEX IF NOT EXISTS idx_appointments_phone_search ON public.appointments(patient_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_read_status ON public.appointments(is_read);
CREATE INDEX IF NOT EXISTS idx_doctor_blocked_dates_lookup ON public.doctor_blocked_dates(doctor_id, blocked_date);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
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
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    -- Admin Users
    DROP POLICY IF EXISTS "Public select active admin_users" ON public.admin_users;
    CREATE POLICY "Public select active admin_users" ON public.admin_users FOR SELECT USING (is_active = true);
    DROP POLICY IF EXISTS "Admin manage admin_users" ON public.admin_users;
    CREATE POLICY "Admin manage admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

    -- Public Read Policies
    DROP POLICY IF EXISTS "Public read departments" ON public.departments;
    CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write departments" ON public.departments;
    CREATE POLICY "Admin write departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read sub_services" ON public.sub_services;
    CREATE POLICY "Public read sub_services" ON public.sub_services FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write sub_services" ON public.sub_services;
    CREATE POLICY "Admin write sub_services" ON public.sub_services FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;
    CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write doctors" ON public.doctors;
    CREATE POLICY "Admin write doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read clinic_settings" ON public.clinic_settings;
    CREATE POLICY "Public read clinic_settings" ON public.clinic_settings FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write clinic_settings" ON public.clinic_settings;
    CREATE POLICY "Admin write clinic_settings" ON public.clinic_settings FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
    CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write reviews" ON public.reviews;
    CREATE POLICY "Admin write reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read why_choose_cards" ON public.why_choose_cards;
    CREATE POLICY "Public read why_choose_cards" ON public.why_choose_cards FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write why_choose_cards" ON public.why_choose_cards;
    CREATE POLICY "Admin write why_choose_cards" ON public.why_choose_cards FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read clinical_creed" ON public.clinical_creed;
    CREATE POLICY "Public read clinical_creed" ON public.clinical_creed FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write clinical_creed" ON public.clinical_creed;
    CREATE POLICY "Admin write clinical_creed" ON public.clinical_creed FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
    CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write gallery_items" ON public.gallery_items;
    CREATE POLICY "Admin write gallery_items" ON public.gallery_items FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public read media_files" ON public.media_files;
    CREATE POLICY "Public read media_files" ON public.media_files FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin write media_files" ON public.media_files;
    CREATE POLICY "Admin write media_files" ON public.media_files FOR ALL USING (true) WITH CHECK (true);

    -- Appointments Policies
    DROP POLICY IF EXISTS "Public insert appointments" ON public.appointments;
    CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Public read appointments" ON public.appointments;
    CREATE POLICY "Public read appointments" ON public.appointments FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin update appointments" ON public.appointments;
    CREATE POLICY "Admin update appointments" ON public.appointments FOR UPDATE USING (true) WITH CHECK (true);
    DROP POLICY IF EXISTS "Admin delete appointments" ON public.appointments;
    CREATE POLICY "Admin delete appointments" ON public.appointments FOR DELETE USING (true);
    DROP POLICY IF EXISTS "Admin manage appointments" ON public.appointments;
    CREATE POLICY "Admin manage appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

    -- Doctor Blocked Dates Policies
    DROP POLICY IF EXISTS "Public read doctor_blocked_dates" ON public.doctor_blocked_dates;
    CREATE POLICY "Public read doctor_blocked_dates" ON public.doctor_blocked_dates FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates;
    CREATE POLICY "Admin manage doctor_blocked_dates" ON public.doctor_blocked_dates FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- 4. STORAGE BUCKET CONFIGURATION (kgh-media)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('kgh-media', 'kgh-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public media read" ON storage.objects;
    CREATE POLICY "Public media read" ON storage.objects FOR SELECT USING (bucket_id = 'kgh-media');

    DROP POLICY IF EXISTS "Public media insert" ON storage.objects;
    CREATE POLICY "Public media insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kgh-media');

    DROP POLICY IF EXISTS "Public media update" ON storage.objects;
    CREATE POLICY "Public media update" ON storage.objects FOR UPDATE USING (bucket_id = 'kgh-media');

    DROP POLICY IF EXISTS "Public media delete" ON storage.objects;
    CREATE POLICY "Public media delete" ON storage.objects FOR DELETE USING (bucket_id = 'kgh-media');
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

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
-- 9. SETUP VERIFICATION QUERY
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
SELECT 'Appointments' AS entity, COUNT(*) AS total_count FROM public.appointments
UNION ALL
SELECT 'Doctor Blocked Dates' AS entity, COUNT(*) AS total_count FROM public.doctor_blocked_dates;
