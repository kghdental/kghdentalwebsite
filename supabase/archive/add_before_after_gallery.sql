-- ==============================================================================
-- KGH DENTAL: SUPABASE DATABASE UPDATE SCRIPT
-- Features: Chamber & Team Gallery + Interactive Before & After Cases
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CHAMBER & TEAM GALLERY TABLE (gallery_items)
-- ------------------------------------------------------------------------------
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

-- Ensure sort_order column exists on gallery_items if table already existed
ALTER TABLE public.gallery_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Remove old category check constraint if it exists (so 'clinic' and 'team' are allowed)
ALTER TABLE public.gallery_items DROP CONSTRAINT IF EXISTS gallery_items_category_check;

-- Ensure RLS is active
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Policies for gallery_items
DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
CREATE POLICY "Public read gallery_items" ON public.gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write gallery_items" ON public.gallery_items;
CREATE POLICY "Admin write gallery_items" ON public.gallery_items FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. BEFORE & AFTER SHOWCASE TABLE (before_after_items)
-- ------------------------------------------------------------------------------
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

-- Enable RLS
ALTER TABLE public.before_after_items ENABLE ROW LEVEL SECURITY;

-- Policies for before_after_items
DROP POLICY IF EXISTS "Public read before_after_items" ON public.before_after_items;
CREATE POLICY "Public read before_after_items" ON public.before_after_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write before_after_items" ON public.before_after_items;
CREATE POLICY "Admin write before_after_items" ON public.before_after_items FOR ALL USING (true) WITH CHECK (true);

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
