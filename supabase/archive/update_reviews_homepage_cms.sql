-- ==============================================================================
-- KGH DENTAL CLINIC — REVIEWS, HOMEPAGE CMS & SETTINGS MIGRATION SCRIPT
-- Database: Supabase (PostgreSQL)
-- Run this script in: Supabase Dashboard > SQL Editor > New query
-- ==============================================================================

-- 1. REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    author_name TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    date TEXT NOT NULL DEFAULT 'Recent',
    comment_en TEXT NOT NULL,
    comment_bn TEXT NOT NULL,
    treatment_en TEXT,
    treatment_bn TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Public read reviews') THEN
        CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow insert reviews') THEN
        CREATE POLICY "Allow insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow update reviews') THEN
        CREATE POLICY "Allow update reviews" ON public.reviews FOR UPDATE USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Allow delete reviews') THEN
        CREATE POLICY "Allow delete reviews" ON public.reviews FOR DELETE USING (true);
    END IF;
END $$;

-- Seed Initial Reviews
INSERT INTO public.reviews (id, author_name, rating, date, comment_en, comment_bn, treatment_en, treatment_bn)
VALUES
(
    'rev-1',
    'Rafiqul Islam',
    5,
    '2 weeks ago',
    'Dr. Diean explained the entire crown procedure with crystal clarity. The clinic environment is spotless, peaceful, and truly world-class. Painless experience!',
    'ডা. দিয়ান অত্যন্ত নিখুঁতভাবে পুরো ক্রাউনের প্রক্রিয়াটি বুঝিয়ে দিয়েছেন। চেম্বারের পরিবেশ অসম্ভব পরিচ্ছন্ন, শান্ত এবং আন্তর্জাতিক মানের। কোনো ব্যথাই পাইনি!',
    'Zirconia Crown',
    'জিরকোনিয়া ক্রাউন'
),
(
    'rev-2',
    'Sabrina Rahman',
    5,
    '1 month ago',
    'I was terrified of wisdom tooth extraction, but Dr. Sanwar made it so quick and smooth. Healing was fast with zero complications. Highly recommended oral surgeon!',
    'আক্কেল দাঁত তোলার কথা শুনে খুব ভয়ে ছিলাম, কিন্তু ডা. সানোয়ার এত সহজে আর দ্রুত করলেন যে টেরই পাইনি! খুব দ্রুত সেরে উঠেছে। দারুণ অভিজ্ঞতা!',
    'Impacted Wisdom Tooth Extraction',
    'উইজডম টুথ সার্জারি'
),
(
    'rev-3',
    'Tanvir Ahmed',
    5,
    '1 month ago',
    'Started my clear aligners journey with Dr. Fatema. She is extremely patient, friendly, and meticulous about smile aesthetics. Love the progress so far!',
    'ডা. ফাতেমার কাছে ক্লিয়ার অ্যালাইনার শুরু করেছি। উনি ভীষণ ধৈর্যশীল এবং যত্নবান। কোনো তার ছাড়া এত সুন্দর সমাধান ভাবাই যায় না!',
    'Clear Aligners',
    'ক্লিয়ার অ্যালাইনার'
),
(
    'rev-4',
    'Nasreen Akhter',
    5,
    '2 months ago',
    'Took my 7-year-old son for a cavity checkup. The doctors handled him with so much care and warmth. He didn''t cry at all and even smiled on the way out!',
    'আমার ৭ বছরের ছেলেকে দাঁতের চেকআপের জন্য নিয়ে গিয়েছিলাম। চিকিৎসকরা এত আন্তরিকভাবে বুঝিয়ে করলেন যে ছেলে একটুও ভয় পায়নি বা কাঁদেনি!',
    'Pediatric Dental Care',
    'শিশু দন্ত সেবা'
),
(
    'rev-5',
    'Mahmud Hasan',
    5,
    '3 months ago',
    'Had professional ultrasonic scaling and polishing. No sensitivity afterward, breath feels fresh and stains from tea are completely gone. 5 stars!',
    'স্কেলিং ও পলিশিং করিয়েছি। পরে কোনো শিরশির করেনি, চায়ের জেদি দাগ একদম চলে গেছে। অত্যন্ত পরিচ্ছন্ন ও বিশ্বস্ত সেবা!',
    'Scaling & Polishing',
    'স্কেলিং ও পলিশিং'
),
(
    'rev-6',
    'Farhana Yeasmin',
    5,
    '3 months ago',
    'Had a single-sitting root canal done by Dr. Bappy. Absolutely painless and completed with modern rotary equipment. Truly world-class dental care!',
    'ডা. বাপ্পীর কাছে ওয়ান-সিটিং রুট ক্যানেল করিয়েছি। আধুনিক যন্ত্রপাতির কারণে কোনো ব্যথা ছাড়াই সম্পন্ন হয়েছে। সত্যিই আন্তর্জাতিক মানের সেবা!',
    'Single-Visit Root Canal',
    'ওয়ান-সিটিং রুট ক্যানেল'
),
(
    'rev-7',
    'Anisur Rahman',
    5,
    '3 weeks ago',
    'Consulted Dr. Rifat for a persistent mouth ulcer. His thorough diagnosis, oral cancer screening, and medications gave me complete relief within days. Highly expert oral medicine care.',
    'মুখে দীর্ঘদিনের একটি ঘা নিয়ে ডা. রিফাতের শরণাপন্ন হয়েছিলাম। ওনার নিখুঁত ডায়াগনোসিস, স্ক্রিনিং ও ওষুধের পর কয়েক দিনেই সম্পূর্ণ সুস্থ হয়ে যাই। ওরাল মেডিসিনে অনন্য বিশেষজ্ঞ।',
    'Oral Medicine & Lesion Care',
    'ওরাল মেডিসিন ও ক্ষত চিকিৎসা'
),
(
    'rev-8',
    'Shamima Nasrin',
    5,
    '2 months ago',
    'Dr. Jesinta designed my aesthetic smile makeover with flawless precision. My smile looks completely natural and radiant now. The entire team is wonderful!',
    'ডা. জেসিন্টার কাছে এস্থেটিক স্মাইল মেকওভার করিয়েছি। আমার হাসি এখন একদম প্রাকৃতিক ও উজ্জ্বল দেখায়। ওনাদের আন্তরিকতা ও আধুনিক চিকিৎসা সত্যিই অতুলনীয়!',
    'Aesthetic Smile Makeover',
    'এস্থেটিক স্মাইল মেকওভার'
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


-- 2. WHY CHOOSE US (4 STACKING CARDS) TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.why_choose_cards (
    id TEXT PRIMARY KEY,
    step_number TEXT NOT NULL,
    badge_en TEXT NOT NULL,
    badge_bn TEXT NOT NULL,
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    subtitle_en TEXT NOT NULL,
    subtitle_bn TEXT NOT NULL,
    bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    image TEXT NOT NULL,
    accent TEXT DEFAULT '#474B4E',
    protocol_title_en TEXT NOT NULL,
    protocol_title_bn TEXT NOT NULL,
    protocol_subtitle_en TEXT NOT NULL,
    protocol_subtitle_bn TEXT NOT NULL,
    protocol_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    protocol_guarantees JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies for why_choose_cards
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

-- Seed Initial 4 Stacking Cards
INSERT INTO public.why_choose_cards (
    id, step_number, badge_en, badge_bn, title_en, title_bn, subtitle_en, subtitle_bn,
    bullets, tags, image, accent, protocol_title_en, protocol_title_bn,
    protocol_subtitle_en, protocol_subtitle_bn, protocol_steps, protocol_guarantees
)
VALUES
(
    'specialists',
    '01',
    'Specialist Board',
    'বিশেষজ্ঞ প্যানেল',
    'Specialist-Led Care',
    'বিশেষজ্ঞদের হাতে চিকিৎসা',
    'Every department is led by a doctor trained specifically in that field — not a single general dentist trying to do everything.',
    'প্রতিটা বিভাগ পরিচালনা করেন সেই নির্দিষ্ট বিষয়ে প্রশিক্ষিত ডাক্তার — একজন জেনারেল ডেন্টিস্ট দিয়ে সবকিছু করানো নয়।',
    '[
        {"en": "FCPS & Masters Certified Surgeons", "bn": "এফসিপিএস ও স্নাতকোত্তর ডিগ্রিধারী সার্জন"},
        {"en": "Dedicated Department Heads", "bn": "নির্দিষ্ট বিভাগের স্বতন্ত্র প্রধান"},
        {"en": "Zero Generalist Guesswork", "bn": "অনুমাননির্ভর চিকিৎসার সুযোগ নেই"}
    ]'::jsonb,
    '[
        {"en": "Orthodontics", "bn": "অর্থোডন্টিক্স"},
        {"en": "Oral Surgery", "bn": "ওরাল সার্জারি"},
        {"en": "Endodontics", "bn": "এন্ডোডন্টিক্স"},
        {"en": "Prosthodontics", "bn": "প্রস্থোডন্টিক্স"}
    ]'::jsonb,
    '/images/why-choose-us/specialist-care.jpg',
    '#474B4E',
    'Specialist-Led Clinical Protocol',
    'বিশেষজ্ঞ পরিচালিত চিকিৎসা প্রোটোকল',
    'Every dental department at KGH is led exclusively by qualified specialist surgeons (FCPS, MS, PhD) who focus 100% on their specialized discipline.',
    'কেজিএইচ ডেন্টালের প্রতিটি বিভাগ শুধুমাত্র উচ্চশিক্ষিত ও সার্টিফায়েড বিশেষজ্ঞ ডাক্তারদের (FCPS, MS, PhD) তত্ত্বাবধানে পরিচালিত হয়।',
    '[
        {
            "number": "01",
            "title": {"en": "Primary Specialty Assessment", "bn": "প্রাথমিক বিভাগীয় মূল্যায়ন"},
            "detail": {"en": "Diagnostic imaging and focused examination by a certified department consultant.", "bn": "বিভাগীয় বিশেষজ্ঞ কনসালটেন্ট কর্তৃক ডিজিটাল প্রতিচ্ছবি ও গভীর পরীক্ষা।"}
        },
        {
            "number": "02",
            "title": {"en": "Inter-Disciplinary Board Review", "bn": "সম্মিলিত মেডিকেল বোর্ড রিভিউ"},
            "detail": {"en": "Multi-specialist consensus on complex aligner, surgical, or implant therapies.", "bn": "জটিল সার্জারি বা অ্যালাইনার চিকিৎসায় যৌথ মেডিকেল বোর্ডের সমন্বিত মতামত।"}
        },
        {
            "number": "03",
            "title": {"en": "Precision Surgical Execution", "bn": "নির্ভুল বিশেষজ্ঞ চিকিৎসা সম্পাদন"},
            "detail": {"en": "Implementation following global clinical guidelines and microscopic accuracy.", "bn": "আন্তর্জাতিক মানদণ্ড এবং আধুনিক মাইক্রোস্কোপিক নির্ভুলতায় চিকিৎসা।"}
        }
    ]'::jsonb,
    '[
        {"en": "100% Specialist-Led Diagnosis — No Generalist Guesswork", "bn": "১০০% বিশেষজ্ঞ চিকিৎসকের পরামর্শ — কোনো অনুমাননির্ভর চিকিৎসা নয়"}
    ]'::jsonb
),
(
    'chamber',
    '02',
    'Hospital Grade',
    'হাসপাতাল মান',
    'Modern, Comfortable Chamber',
    'আধুনিক ও আরামদায়ক চেম্বার',
    'A clean, calm space designed around patient comfort, from your first visit to your last follow-up.',
    'প্রথম ভিজিট থেকে শেষ ফলো-আপ পর্যন্ত, রোগীর স্বাচ্ছন্দ্যের কথা মাথায় রেখে সাজানো একটা পরিচ্ছন্ন, শান্ত পরিবেশ।',
    '[
        {"en": "Ergonomic Memory-Foam Dental Chairs", "bn": "আরামদায়ক মেমোরি-ফোম চেয়ার"},
        {"en": "Class-B European Autoclave Sterilization", "bn": "ক্লাস-বি অটোক্লেভ স্টেরিলাইজেশন"},
        {"en": "Soothing Acoustic & Ambient Lighting", "bn": "শান্ত ও আরামদায়ক পরিবেশ"}
    ]'::jsonb,
    '[
        {"en": "Class-B 134°C", "bn": "ক্লাস-বি ১৩৪° সে."},
        {"en": "Zero Cross-Infection", "bn": "জীবাণুমুক্ত নিশ্চয়তা"},
        {"en": "Calm Atmosphere", "bn": "শান্ত পরিবেশ"}
    ]'::jsonb,
    '/images/why-choose-us/modern-chamber.jpg',
    '#474B4E',
    'European Sterilization & Chamber Protocol',
    'ইউরোপীয় স্টেরিলাইজেশন ও চেম্বার প্রোটোকল',
    'We designed our clinic from the ground up to replace medical anxiety with absolute calm, hygiene, and hospital-grade sterilization.',
    'রোগীর ভয় ও অস্বস্তি দূর করে একটি শান্ত, মনোরম ও আন্তর্জাতিক মানের স্বাস্থ্যকর পরিবেশ নিশ্চিত করতে আমাদের চেম্বারটি সাজানো।',
    '[
        {
            "number": "01",
            "title": {"en": "Class-B Vacuum Decontamination", "bn": "ক্লাস-বি ভ্যাকুয়াম জীবাণুমুক্তকরণ"},
            "detail": {"en": "134°C steam under pressure guarantees 100% viral and bacterial eradication.", "bn": "১৩৪° সেলসিয়াস তাপমাত্রায় উচ্চ চাপে প্রতিটি যন্ত্রের শতভাগ জীবাণুমুক্তকরণ।"}
        },
        {
            "number": "02",
            "title": {"en": "Sealed Barrier Pouches", "bn": "সিল করা জীবাণুমুক্ত প্যাকেট"},
            "detail": {"en": "Instruments are opened exclusively in front of each individual patient.", "bn": "প্রতিটি রোগীর চোখের সামনেই সিল করা নতুন জীবাণুমুক্ত প্যাকেট খোলা হয়।"}
        },
        {
            "number": "03",
            "title": {"en": "Operatory Surface Disinfection", "bn": "চেয়ার ও মেঝের বায়ো-ডিসইনফেকশন"},
            "detail": {"en": "Medical-grade hospital wipes applied after every single appointment.", "bn": "প্রতিটি রোগীর পরপরই সম্পূর্ণ চেয়ার ও যন্ত্রপাতি স্প্রে দ্বারা ডিসইনফেক্ট করা হয়।"}
        }
    ]'::jsonb,
    '[
        {"en": "Strict European Class-B Sterilization Protocol for Every Patient", "bn": "প্রতিটি রোগীর জন্য কঠোর ইউরোপীয় ক্লাস-বি স্টেরিলাইজেশন প্রোটোকল"}
    ]'::jsonb
),
(
    'plans',
    '03',
    'Clear & Honest',
    'স্বচ্ছ ও নির্ভরযোগ্য',
    'Transparent Treatment Plans',
    'স্পষ্ট চিকিৎসা পরিকল্পনা',
    'We explain why a treatment is needed, when it''s needed, and what to expect — before any decision is made.',
    'কোনো সিদ্ধান্ত নেওয়ার আগেই আমরা বুঝিয়ে বলি কেন এই চিকিৎসা দরকার, কখন দরকার, আর তাতে কী উপকার পাবেন।',
    '[
        {"en": "HD Intraoral Digital Camera Screening", "bn": "এইচডি ইন্ট্রাওরাল স্ক্রিনিং"},
        {"en": "Itemized Cost Breakdown — Zero Hidden Bills", "bn": "অগ্রিম খরচের স্বচ্ছ বিবরণ"},
        {"en": "Clear Step-by-Step Clinical Roadmap", "bn": "ধাপভিত্তিক স্পষ্ট পরিকল্পনা"}
    ]'::jsonb,
    '[
        {"en": "Written Estimate", "bn": "লিখিত খরচের বিবরণ"},
        {"en": "HD Live Screen", "bn": "লাইভ এইচডি স্ক্রিন"},
        {"en": "No Hidden Costs", "bn": "কোনো গোপন খরচ নেই"}
    ]'::jsonb,
    '/images/why-choose-us/transparent-plans-hd.jpeg',
    '#474B4E',
    'Clinical Transparency & Cost Protocol',
    'চিকিৎসা ও খরচের স্বচ্ছতা প্রোটোকল',
    'We believe healthcare should have complete clarity. We show you the exact clinical condition and transparent costs before touching a tooth.',
    'আমরা বিশ্বাস করি চিকিৎসার প্রতিটি ধাপে স্বচ্ছতা জরুরি। চিকিৎসা শুরুর আগেই দাঁতের প্রকৃত অবস্থা ও খরচের স্পষ্ট ধারণা দেওয়া হয়।',
    '[
        {
            "number": "01",
            "title": {"en": "Live Intraoral Camera Display", "bn": "লাইভ ইন্ট্রাওরাল ক্যামেরা ডিসপ্লে"},
            "detail": {"en": "High-definition visuals on the chairside monitor so you see what the doctor sees.", "bn": "চেয়ারের সামনে এইচডি মনিটরে সরাসরি দাঁতের প্রকৃত সমস্যা রোগীকে দেখানো।"}
        },
        {
            "number": "02",
            "title": {"en": "Comprehensive Treatment Roadmap", "bn": "ধাপভিত্তিক পূর্ণাঙ্গ পরিকল্পনা"},
            "detail": {"en": "Clear explanation of stages, expected recovery duration, and milestone visits.", "bn": "চিকিৎসার প্রয়োজনীয় ধাপ, সময়কাল ও পরবর্তী চেকআপের স্পষ্ট ধারণা।"}
        },
        {
            "number": "03",
            "title": {"en": "Fixed Itemized Cost Estimate", "bn": "নির্ধারিত খরচের লিখিত তালিকা"},
            "detail": {"en": "Transparent billing with zero surprise add-ons or sudden charges.", "bn": "চিকিৎসা শুরুর পূর্বেই লিখিত খরচের বিবরণ — কোনো বাড়তি গোপন চার্জ নেই।"}
        }
    ]'::jsonb,
    '[
        {"en": "Full Cost & Clinical Transparency — Zero Hidden Charges", "bn": "চিকিৎসা ও খরচে ১০০% স্বচ্ছতা — কোনো গোপন চার্জ নেই"}
    ]'::jsonb
),
(
    'booking',
    '04',
    'Instant & Smooth',
    'সহজ ও দ্রুত',
    'Easy Appointment Booking',
    'সহজ অ্যাপয়েন্টমেন্ট বুকিং',
    'Pick your doctor, pick your time — book online in a few taps, no phone tag or long waiting lines.',
    'নিজের পছন্দের ডাক্তার আর সময় বেছে নিন — কয়েকটা ক্লিকেই বুকিং, বারবার ফোন করার ঝামেলা নেই।',
    '[
        {"en": "Select Specialist & Preferred Day in < 2 Mins", "bn": "ডাক্তার ও সুবিধাজনক দিন পছন্দ"},
        {"en": "Instant WhatsApp & SMS Confirmation", "bn": "তাৎক্ষণিক হোয়াটসঅ্যাপ নিশ্চিতকরণ"},
        {"en": "Dedicated Clinic Care Coordinator Support", "bn": "ডেডিকেটেড কেয়ার কোঅর্ডিনেটর"}
    ]'::jsonb,
    '[
        {"en": "2-Min Booking", "bn": "২ মিনিটে বুকিং"},
        {"en": "WhatsApp Updates", "bn": "হোয়াটসঅ্যাপ আপডেট"},
        {"en": "Min Waiting", "bn": "অপেক্ষাহীন সেবা"}
    ]'::jsonb,
    '/images/why-choose-us/easy-booking.jpg',
    '#474B4E',
    'Smart Scheduling & Waiting Protocol',
    'স্মার্ট শিডিউলিং ও সিরিয়াল প্রোটোকল',
    'No endless phone calls or crowded waiting rooms. Our digital booking system respects your busy schedule with precision time slots.',
    'বারবার ফোন করার ঝামেলা কিংবা চেম্বারে বসে ঘণ্টার পর ঘণ্টা অপেক্ষা করার দিন শেষ। ডিজিটাল পদ্ধতিতে দ্রুততম সময়ে সিরিয়াল নিন।',
    '[
        {
            "number": "01",
            "title": {"en": "Online Booking in 3 Easy Steps", "bn": "৩টি সহজ ধাপে অনলাইন বুকিং"},
            "detail": {"en": "Choose department, preferred doctor, and available time slot in under 2 minutes.", "bn": "বিভাগ, কাঙ্ক্ষিত ডাক্তার ও সুবিধাজনক সময় বেছে নিয়ে দ্রুত সিরিয়াল নিশ্চিতকরণ।"}
        },
        {
            "number": "02",
            "title": {"en": "Instant WhatsApp Confirmation", "bn": "তাৎক্ষণিক হোয়াটসঅ্যাপ নোটিফিকেশন"},
            "detail": {"en": "Receive reference code, appointment time, and direct Google Maps location pin.", "bn": "সিরিয়াল রেফারেন্স কোড, সময় ও গুগল ম্যাপ লোকেশন সরাসরি মেসেজে প্রাপ্তি।"}
        },
        {
            "number": "03",
            "title": {"en": "Zero-Wait Queue Management", "bn": "যথাসময়ে সিরিয়াল প্রদান"},
            "detail": {"en": "Our front desk prepares all sterile setup in advance to minimize waiting time.", "bn": "রোগীর পৌঁছানোর পূর্বেই চেম্বার প্রস্তুতি সম্পন্ন করে অপেক্ষার সময় কমিয়ে আনা।"}
        }
    ]'::jsonb,
    '[
        {"en": "Guaranteed Dedicated Time Slot — Minimized Waiting Time", "bn": "নির্দিষ্ট সময়ে সিরিয়াল কনফার্মেশন — দীর্ঘ অপেক্ষার অবসান"}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    step_number = EXCLUDED.step_number,
    badge_en = EXCLUDED.badge_en,
    badge_bn = EXCLUDED.badge_bn,
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    subtitle_en = EXCLUDED.subtitle_en,
    subtitle_bn = EXCLUDED.subtitle_bn,
    bullets = EXCLUDED.bullets,
    tags = EXCLUDED.tags,
    image = EXCLUDED.image,
    accent = EXCLUDED.accent,
    protocol_title_en = EXCLUDED.protocol_title_en,
    protocol_title_bn = EXCLUDED.protocol_title_bn,
    protocol_subtitle_en = EXCLUDED.protocol_subtitle_en,
    protocol_subtitle_bn = EXCLUDED.protocol_subtitle_bn,
    protocol_steps = EXCLUDED.protocol_steps,
    protocol_guarantees = EXCLUDED.protocol_guarantees,
    updated_at = NOW();


-- 3. CLINICAL CREED TABLE (PHILOSOPHY BANNER)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clinical_creed (
    id INT PRIMARY KEY DEFAULT 1,
    tag_en TEXT NOT NULL,
    tag_bn TEXT NOT NULL,
    quote_en TEXT NOT NULL,
    quote_bn TEXT NOT NULL,
    sub_quote_en TEXT NOT NULL,
    sub_quote_bn TEXT NOT NULL,
    authority_en TEXT NOT NULL,
    authority_bn TEXT NOT NULL,
    designation_en TEXT NOT NULL,
    designation_bn TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_creed_row CHECK (id = 1)
);

-- Enable RLS & Policies for clinical_creed
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
END $$;

-- Seed Initial Clinical Creed
INSERT INTO public.clinical_creed (
    id, tag_en, tag_bn, quote_en, quote_bn, sub_quote_en, sub_quote_bn,
    authority_en, authority_bn, designation_en, designation_bn, stats
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
    '[
        {
            "value": {"en": "100%", "bn": "১০০%"},
            "label": {"en": "Sterilization Standard", "bn": "জীবাণুমুক্তকরণ মানদণ্ড"}
        },
        {
            "value": {"en": "15+", "bn": "১৫+"},
            "label": {"en": "Years Combined Board Mastery", "bn": "সম্মিলিত বোর্ড অভিজ্ঞতা"}
        },
        {
            "value": {"en": "Zero", "bn": "জিরো"},
            "label": {"en": "Unscheduled Waiting Delay", "bn": "অতিরিক্ত অপেক্ষাহীন সেবা"}
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
    updated_at = NOW();


-- 4. CLINIC SETTINGS TABLE (ADD REVIEW URL & SOCIAL LINKS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_map_url TEXT DEFAULT 'https://maps.app.goo.gl/aztfz8BxL5vug12L7';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS google_review_url TEXT DEFAULT 'https://g.page/r/kgh-dental-review';
ALTER TABLE public.clinic_settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{"facebook": "https://facebook.com/kghdental", "whatsapp": "https://wa.me/8801700000000"}'::jsonb;

-- Ensure row 1 exists or update it
INSERT INTO public.clinic_settings (
    id, phone_numbers, emergency_phone, working_hours, address_en, address_bn,
    is_address_placeholder, google_map_url, google_review_url, social_links
)
VALUES (
    1,
    ARRAY['+880 1700-000000', '+880 1800-000000'],
    '+880 1700-000000',
    '[
        {
            "days": {"en": "Saturday – Thursday", "bn": "শনিবার – বৃহস্পতিবার"},
            "hours": {"en": "11:00 AM – 2:00 PM & 5:00 PM – 9:30 PM", "bn": "সকাল ১১:০০ – দুপুর ২:০০ ও বিকাল ৫:০০ – রাত ৯:৩০"}
        },
        {
            "days": {"en": "Friday", "bn": "শুক্রবার"},
            "hours": {"en": "5:00 PM – 9:30 PM", "bn": "বিকাল ৫:০০ – রাত ৯:৩০"}
        }
    ]'::jsonb,
    'Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213, Bangladesh',
    'লেভেল ৪, চান্দীওয়ালা ম্যানশন, বাড়ি ৩২, রোড ১১, ব্লক জি, বনানী, ঢাকা ১২১৩, বাংলাদেশ',
    false,
    'https://maps.app.goo.gl/aztfz8BxL5vug12L7',
    'https://g.page/r/kgh-dental-review',
    '{"facebook": "https://facebook.com/kghdental", "whatsapp": "https://wa.me/8801700000000"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    address_en = EXCLUDED.address_en,
    address_bn = EXCLUDED.address_bn,
    is_address_placeholder = EXCLUDED.is_address_placeholder,
    google_map_url = COALESCE(public.clinic_settings.google_map_url, EXCLUDED.google_map_url),
    google_review_url = COALESCE(public.clinic_settings.google_review_url, EXCLUDED.google_review_url),
    social_links = COALESCE(public.clinic_settings.social_links, EXCLUDED.social_links);

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinic_settings' AND policyname = 'Allow update clinic_settings') THEN
        CREATE POLICY "Allow update clinic_settings" ON public.clinic_settings FOR UPDATE USING (true);
    END IF;
END $$;
