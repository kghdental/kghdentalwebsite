-- ==============================================================================
-- KGH DENTAL - HOMEPAGE SECTIONS SUPABASE UPDATE
-- 1. Why Patients Choose KGH Dental (why_choose_cards)
-- 2. Clinical Philosophy / Creed (clinical_creed)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SECTION 1: WHY PATIENTS CHOOSE KGH DENTAL (why_choose_cards)
-- ------------------------------------------------------------------------------

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

ALTER TABLE public.why_choose_cards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'why_choose_cards' AND policyname = 'Public read why_choose_cards') THEN
        CREATE POLICY "Public read why_choose_cards" ON public.why_choose_cards FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'why_choose_cards' AND policyname = 'Allow insert why_choose_cards') THEN
        CREATE POLICY "Allow insert why_choose_cards" ON public.why_choose_cards FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'why_choose_cards' AND policyname = 'Allow update why_choose_cards') THEN
        CREATE POLICY "Allow update why_choose_cards" ON public.why_choose_cards FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'why_choose_cards' AND policyname = 'Allow delete why_choose_cards') THEN
        CREATE POLICY "Allow delete why_choose_cards" ON public.why_choose_cards FOR DELETE USING (true);
    END IF;
END $$;

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
    'Specialist Protocols',
    'বিশেষজ্ঞ প্রোটোকল',
    'Every dental department at KGH is led exclusively by qualified specialist surgeons (FCPS, MS, PhD) who focus 100% on their specialized discipline.',
    'কেজিএইচ ডেন্টালের প্রতিটি বিভাগ শুধুমাত্র উচ্চশিক্ষিত ও সার্টিফায়েড বিশেষজ্ঞ ডাক্তারদের (FCPS, MS, PhD) তত্ত্বাবধানে পরিচালিত হয়।',
    '[
        {"title": {"en": "FCPS & Postgrad Specialists", "bn": "এফসিপিএস ও স্নাতকোত্তর বিশেষজ্ঞ"}, "detail": {"en": "Certified postgraduate specialists for all procedures.", "bn": "প্রতিটি বিভাগে স্বতন্ত্র ডিগ্রিধারী কনসালটেন্ট।"}},
        {"title": {"en": "Collaborative Review", "bn": "সমন্বিত বোর্ড রিভিউ"}, "detail": {"en": "Clinical board for complex multi-step cases.", "bn": "জটিল কেসগুলোতে বিশেষজ্ঞ চিকিৎসকদের বোর্ড পর্যালোচনা।"}}
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
    'রোগীর সর্বোচ্চ মানসিক ও শারীরিক প্রশান্তির কথা মাথায় রেখে আন্তর্জাতিক মানের পরিচ্ছন্ন পরিবেশ।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/modern-chamber.jpg',
    '#474B4E',
    'Sterilization Protocols',
    'স্টেরিলাইজেশন প্রোটোকল',
    'We designed our clinic from the ground up to replace medical anxiety with absolute calm, hygiene, and hospital-grade sterilization.',
    'রোগীর ভয় ও অস্বস্তি দূর করে একটি শান্ত, মনোরম ও আন্তর্জাতিক মানের স্বাস্থ্যকর পরিবেশ নিশ্চিত করতে আমাদের চেম্বারটি সাজানো।',
    '[
        {"title": {"en": "Class-B Autoclave", "bn": "ক্লাস-বি অটোক্লেভ"}, "detail": {"en": "134°C vacuum sterilization for every sealed instrument.", "bn": "১৩৪° সেলসিয়াস তাপমাত্রায় ভ্যাকুয়াম অটোক্লেভ দ্বারা জীবাণুমুক্ত।"}},
        {"title": {"en": "Memory Foam Chairs", "bn": "মেমোরি ফোম চেয়ার"}, "detail": {"en": "Zero strain ergonomic chairs for maximum patient comfort.", "bn": "দীর্ঘ চিকিৎসায়ও সর্বোচ্চ আরামের নিশ্চয়তা।"}}
    ]'::jsonb,
    '[{"en": "Strict European Class-B Sterilization Protocol for Every Patient", "bn": "প্রতিটি রোগীর জন্য কঠোর ইউরোপীয় ক্লাস-বি স্টেরিলাইজেশন প্রোটোকল"}]'::jsonb
),
(
    'plans',
    '03',
    '',
    '',
    'Transparent Treatment Plans',
    'স্বচ্ছ ও স্পষ্ট চিকিৎসা পরিকল্পনা',
    'We explain why a treatment is needed, when it is needed, and what to expect — before any decision is made.',
    'যেকোনো চিকিৎসা শুরুর আগে কেন প্রয়োজন, কীভাবে হবে এবং কত খরচ হবে সবকিছু সুস্পষ্টভাবে জানিয়ে দেওয়া হয়।',
    '[]'::jsonb,
    '[]'::jsonb,
    '/images/why-choose-us/transparent-plans.jpg',
    '#474B4E',
    'Transparency Standards',
    'স্বচ্ছতার মানদণ্ড',
    'We believe healthcare should have complete clarity. We show you the exact clinical condition and transparent costs before touching a tooth.',
    'আমরা বিশ্বাস করি চিকিৎসার প্রতিটি ধাপে স্বচ্ছতা জরুরি। চিকিৎসা শুরুর আগেই দাঁতের প্রকৃত অবস্থা ও খরচের স্পষ্ট ধারণা দেওয়া হয়।',
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
    protocol_title_en = EXCLUDED.protocol_title_en,
    protocol_title_bn = EXCLUDED.protocol_title_bn,
    protocol_subtitle_en = EXCLUDED.protocol_subtitle_en,
    protocol_subtitle_bn = EXCLUDED.protocol_subtitle_bn,
    protocol_steps = EXCLUDED.protocol_steps,
    protocol_guarantees = EXCLUDED.protocol_guarantees,
    updated_at = NOW();

-- ------------------------------------------------------------------------------
-- SECTION 2: CLINICAL PHILOSOPHY / CREED (clinical_creed)
-- ------------------------------------------------------------------------------

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

ALTER TABLE public.clinical_creed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_creed ADD COLUMN IF NOT EXISTS quotes JSONB DEFAULT '[]'::jsonb;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinical_creed' AND policyname = 'Public read clinical_creed') THEN
        CREATE POLICY "Public read clinical_creed" ON public.clinical_creed FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinical_creed' AND policyname = 'Allow insert clinical_creed') THEN
        CREATE POLICY "Allow insert clinical_creed" ON public.clinical_creed FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinical_creed' AND policyname = 'Allow update clinical_creed') THEN
        CREATE POLICY "Allow update clinical_creed" ON public.clinical_creed FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinical_creed' AND policyname = 'Allow delete clinical_creed') THEN
        CREATE POLICY "Allow delete clinical_creed" ON public.clinical_creed FOR DELETE USING (true);
    END IF;
END $$;

INSERT INTO public.clinical_creed (
    id, tag_en, tag_bn, quote_en, quote_bn, sub_quote_en, sub_quote_bn,
    authority_en, authority_bn, designation_en, designation_bn, stats, quotes
)
VALUES
(
    1,
    '',
    '',
    'A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn''t just about fixing teeth, it''s about transforming how you live.',
    'একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।',
    '',
    '',
    '',
    '',
    '',
    '',
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
