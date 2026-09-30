-- ==============================================================================
-- KGH DENTAL CLINIC — ADD DR. RAFIA NAZNEEN TO DATABASE
-- Run in Supabase SQL Editor:
-- 1. Go to your Supabase project (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" on the left menu
-- 3. Click "New query", paste this script, and click "Run"
-- ==============================================================================

-- Ensure table and columns exist
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bmdc_reg TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_bn TEXT;

-- Insert or Update Dr. Rafia Nazneen
INSERT INTO public.doctors (
    id,
    name_en,
    name_bn,
    specialty_en,
    specialty_bn,
    degrees_en,
    degrees_bn,
    designation_en,
    designation_bn,
    institution_en,
    institution_bn,
    bmdc_reg,
    photo_url,
    bio_en,
    bio_bn,
    experience_en,
    experience_bn,
    department_id,
    schedule,
    is_active
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
    NULL,
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
