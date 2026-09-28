-- ==============================================================================
-- KGH DENTAL: HOMEPAGE FEATURED VIDEOS (YOUTUBE & FACEBOOK REELS) SCHEMA
-- Execute this script in your Supabase SQL Editor if needed:
-- https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

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

-- Enable RLS
ALTER TABLE public.featured_videos ENABLE ROW LEVEL SECURITY;

-- Policies for public reading and admin write
DROP POLICY IF EXISTS "Public read featured_videos" ON public.featured_videos;
CREATE POLICY "Public read featured_videos" ON public.featured_videos 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin write featured_videos" ON public.featured_videos;
CREATE POLICY "Admin write featured_videos" ON public.featured_videos 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Insert starter showcase videos
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
