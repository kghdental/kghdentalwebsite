-- ==============================================================================
-- KGH DENTAL: ADMIN CRUD & CLINIC SETTINGS SUPABASE SCHEMA & RLS FIX
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

-- 1. Ensure blog_posts table exists with all required columns and constraints
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

-- Ensure all optional columns exist on blog_posts if table already existed
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_en TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_bn TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '/images/departments/consultation-cta.jpg';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_slug TEXT DEFAULT 'general-consultation';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_en TEXT DEFAULT 'General Consultation';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_bn TEXT DEFAULT 'সাধারণ পরামর্শ';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS target_keyword TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'];
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS legacy_content JSONB;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indices for fast lookup
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_department ON public.blog_posts(department_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

-- Enable RLS and establish clear, permissive policies for admin CRUD
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin write blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public insert blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public update blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public delete blog_posts" ON public.blog_posts;

CREATE POLICY "Admin write blog_posts" ON public.blog_posts 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 2. Ensure clinic_settings table exists with all required columns
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id INT PRIMARY KEY DEFAULT 1,
    name TEXT DEFAULT 'KGH Dental',
    email TEXT DEFAULT 'care@kghdental.com',
    phone_numbers TEXT[] NOT NULL DEFAULT ARRAY['+880 1700-000000', '+880 1800-000000'],
    emergency_phone TEXT NOT NULL DEFAULT '+880 1700-000000',
    working_hours JSONB NOT NULL DEFAULT '[{"days": {"en": "Saturday – Thursday", "bn": "শনিবার – বৃহস্পতিবার"}, "hours": {"en": "11:00 AM – 2:00 PM & 5:00 PM – 9:30 PM", "bn": "সকাল ১১:০০ – দুপুর ২:০০ ও বিকাল ৫:০০ – রাত ৯:৩০"}}, {"days": {"en": "Friday", "bn": "শুক্রবার"}, "hours": {"en": "5:00 PM – 9:30 PM", "bn": "বিকাল ৫:০০ – রাত ৯:৩০"}}]'::jsonb,
    address_en TEXT NOT NULL DEFAULT 'Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213, Bangladesh',
    address_bn TEXT NOT NULL DEFAULT 'লেভেল ৪, চান্দীওয়ালা ম্যানশন, বাড়ি ৩২, রোড ১১, ব্লক জি, বনানী, ঢাকা ১২১৩, বাংলাদেশ',
    is_address_placeholder BOOLEAN DEFAULT FALSE,
    google_map_url TEXT DEFAULT 'https://maps.app.goo.gl/aztfz8BxL5vug12L7',
    google_review_url TEXT DEFAULT 'https://g.page/r/kgh-dental-review',
    social_links JSONB DEFAULT '{"facebook": "https://facebook.com/kghdental", "whatsapp": "https://wa.me/8801700000000"}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Ensure columns exist if table was previously created with fewer columns
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'KGH Dental';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'care@kghdental.com';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_map_url TEXT DEFAULT 'https://maps.app.goo.gl/aztfz8BxL5vug12L7';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_review_url TEXT DEFAULT 'https://g.page/r/kgh-dental-review';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"facebook": "https://facebook.com/kghdental", "whatsapp": "https://wa.me/8801700000000"}'::jsonb;
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS and setup policies for clinic_settings
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read clinic_settings" ON public.clinic_settings;
CREATE POLICY "Public read clinic_settings" ON public.clinic_settings 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin write clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow update clinic_settings" ON public.clinic_settings;

CREATE POLICY "Admin write clinic_settings" ON public.clinic_settings 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Insert initial default clinic settings if row 1 does not exist yet
INSERT INTO public.clinic_settings (
    id,
    name,
    email,
    phone_numbers,
    emergency_phone,
    working_hours,
    address_en,
    address_bn,
    is_address_placeholder,
    google_map_url,
    google_review_url,
    social_links
) VALUES (
    1,
    'KGH Dental',
    'care@kghdental.com',
    ARRAY['+880 1700-000000', '+880 1800-000000'],
    '+880 1700-000000',
    '[
      {
        "days": { "en": "Saturday – Thursday", "bn": "শনিবার – বৃহস্পতিবার" },
        "hours": { "en": "11:00 AM – 2:00 PM & 5:00 PM – 9:30 PM", "bn": "সকাল ১১:০০ – দুপুর ২:০০ ও বিকাল ৫:০০ – রাত ৯:৩০" }
      },
      {
        "days": { "en": "Friday", "bn": "শুক্রবার" },
        "hours": { "en": "5:00 PM – 9:30 PM", "bn": "বিকাল ৫:০০ – রাত ৯:৩০" }
      }
    ]'::jsonb,
    'Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213, Bangladesh',
    'লেভেল ৪, চান্দীওয়ালা ম্যানশন, বাড়ি ৩২, রোড ১১, ব্লক জি, বনানী, ঢাকা ১২১৩, বাংলাদেশ',
    FALSE,
    'https://maps.app.goo.gl/aztfz8BxL5vug12L7',
    'https://g.page/r/kgh-dental-review',
    '{"facebook": "https://facebook.com/kghdental", "whatsapp": "https://wa.me/8801700000000"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Verification queries to verify both tables
SELECT 'blog_posts' AS entity, COUNT(*) AS count FROM public.blog_posts
UNION ALL
SELECT 'clinic_settings' AS entity, COUNT(*) AS count FROM public.clinic_settings;
