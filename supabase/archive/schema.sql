-- ==============================================================================
-- KGH DENTAL CLINIC — SUPABASE DATABASE SCHEMA & INITIAL DATA SEED
-- Run this entire script in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    specialty_en TEXT NOT NULL,
    specialty_bn TEXT NOT NULL,
    degrees_en TEXT NOT NULL,
    degrees_bn TEXT NOT NULL,
    schedule JSONB NOT NULL,
    bio_en TEXT NOT NULL,
    bio_bn TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    bmdc_reg TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    short_desc_en TEXT NOT NULL,
    short_desc_bn TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    lead_doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SUB-SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.sub_services (
    id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    number INT NOT NULL,
    name_en TEXT NOT NULL,
    name_bn TEXT NOT NULL,
    why_en TEXT NOT NULL,
    why_bn TEXT NOT NULL,
    when_en TEXT NOT NULL,
    when_bn TEXT NOT NULL,
    benefit_en TEXT NOT NULL,
    benefit_bn TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code TEXT UNIQUE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_email TEXT,
    doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
    department_id TEXT REFERENCES public.departments(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    symptoms TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. BLOG POSTS TABLE
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    excerpt_en TEXT NOT NULL,
    excerpt_bn TEXT NOT NULL,
    department_slug TEXT NOT NULL,
    department_name_en TEXT NOT NULL,
    department_name_bn TEXT NOT NULL,
    read_time TEXT NOT NULL,
    date TEXT NOT NULL,
    content JSONB NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GALLERY ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('chamber', 'treatments', 'sterilization')),
    desc_en TEXT NOT NULL,
    desc_bn TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MEDIA FILES TABLE (for uploaded assets library)
CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CLINIC SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id INT PRIMARY KEY DEFAULT 1,
    phone_numbers TEXT[] NOT NULL,
    emergency_phone TEXT NOT NULL,
    working_hours JSONB NOT NULL,
    address_en TEXT NOT NULL,
    address_bn TEXT NOT NULL,
    is_address_placeholder BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all catalog data
CREATE POLICY "Public read doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public read sub_services" ON public.sub_services FOR SELECT USING (true);
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);
CREATE POLICY "Public read media_files" ON public.media_files FOR SELECT USING (true);
CREATE POLICY "Public read clinic_settings" ON public.clinic_settings FOR SELECT USING (true);

-- Allow public to create appointments
CREATE POLICY "Public insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);

-- Full management for authenticated users (Admins)
CREATE POLICY "Admin full access doctors" ON public.doctors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access departments" ON public.departments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access sub_services" ON public.sub_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access appointments" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access blog_posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access gallery_items" ON public.gallery_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access media_files" ON public.media_files FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access clinic_settings" ON public.clinic_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET SETUP (kgh-media)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('kgh-media', 'kgh-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read any file in kgh-media
CREATE POLICY "Public media read" ON storage.objects
FOR SELECT USING (bucket_id = 'kgh-media');

-- Authenticated admins can upload, update, and delete in kgh-media
CREATE POLICY "Admin media insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'kgh-media');

CREATE POLICY "Admin media update" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'kgh-media');

CREATE POLICY "Admin media delete" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'kgh-media');
