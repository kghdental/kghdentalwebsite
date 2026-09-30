-- ==============================================================================
-- KGH DENTAL: BLOG POSTS SCHEMA & RICH CONTENT MIGRATION
-- Run this script in Supabase SQL Editor: https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CREATE OR UPDATE blog_posts TABLE
-- ------------------------------------------------------------------------------
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
    read_time TEXT DEFAULT '5 min read',
    date_str TEXT DEFAULT 'Sep 2026',
    target_keyword TEXT DEFAULT '',
    author_name_en TEXT DEFAULT 'Dr. Diean Dental Specialists',
    author_name_bn TEXT DEFAULT 'ডাঃ দিয়েন ডেন্টাল বিশেষজ্ঞ টিম',
    author_role_en TEXT DEFAULT 'Consultant Dental Surgeon',
    author_role_bn TEXT DEFAULT 'কনসালটেন্ট ডেন্টাল সার্জন',
    author_photo_url TEXT DEFAULT '/images/doctors/dr-diean.jpg',
    tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'],
    content_html_en TEXT DEFAULT '',
    content_html_bn TEXT DEFAULT '',
    legacy_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist even if table was created in an earlier version
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT '/images/departments/consultation-cta.jpg';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_en TEXT DEFAULT 'General Consultation';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS department_name_bn TEXT DEFAULT 'সাধারণ পরামর্শ';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name_en TEXT DEFAULT 'Dr. Diean Dental Specialists';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_name_bn TEXT DEFAULT 'ডাঃ দিয়েন ডেন্টাল বিশেষজ্ঞ টিম';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role_en TEXT DEFAULT 'Consultant Dental Surgeon';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_role_bn TEXT DEFAULT 'কনসালটেন্ট ডেন্টাল সার্জন';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS author_photo_url TEXT DEFAULT '/images/doctors/dr-diean.jpg';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'];
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_en TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_bn TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS legacy_content JSONB;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ------------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_department ON public.blog_posts(department_slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts 
    FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admin write blog_posts" ON public.blog_posts;
CREATE POLICY "Admin write blog_posts" ON public.blog_posts 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. SEED INITIAL FEATURED DENTAL GUIDES (If not already present)
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
    tags,
    content_html_en,
    content_html_bn
) VALUES
(
    'root-canal-treatment-myths-vs-facts',
    'Root Canal Treatment: What to Really Expect (Myths vs Facts)',
    'রুট ক্যানেল ট্রিটমেন্ট: প্রচলিত ভুল ধারণা বনাম আসল সত্য',
    'Is root canal treatment really painful? Discover the modern clinical truth, why it saves your natural tooth, and what actually happens during the procedure.',
    'রুট ক্যানেল কি আসলেই মারাত্মক যন্ত্রণাদায়ক? আধুনিক চিকিৎসার সত্যতা, দাঁত বাঁচানোর গুরুত্ব এবং এর সহজ প্রক্রিয়া সম্পর্কে জানুন।',
    '/images/sub_services/3. 1. Root Canal Treatment.png',
    'endodontics',
    'Endodontics',
    'এন্ডোডন্টিক্স',
    '6 min read',
    'Sep 2026',
    'root canal treatment pain myths Dhaka',
    'Dr. Diean Dental Specialists',
    'ডাঃ দিয়েন ডেন্টাল বিশেষজ্ঞ টিম',
    'Consultant Dental Surgeon',
    'কনসালটেন্ট ডেন্টাল সার্জন',
    ARRAY['root canal', 'endodontics', 'tooth pain', 'kgh dental'],
    '<h2>Understanding Root Canal Treatment</h2><p>Mention the words <strong>root canal</strong>, and most people immediately shudder with anxiety. But modern dentistry has revolutionized this procedure completely.</p><blockquote>With modern computerized rotary endodontics and effective local anesthesia, a root canal causes no more discomfort than a routine filling. Its primary purpose is to stop pain, not cause it.</blockquote><h3>Common Myths vs Medical Facts</h3><ul><li><strong>Myth 1: Root canal treatment is intensely painful.</strong><br><em>Fact:</em> High-precision local anesthesia ensures you remain completely comfortable and pain-free throughout the entire procedure.</li><li><strong>Myth 2: It is better to just pull the tooth out.</strong><br><em>Fact:</em> Preserving your natural tooth root preserves your jawbone density and natural bite alignment. No artificial implant or bridge fully replicates your real tooth biology.</li><li><strong>Myth 3: The relief is only temporary.</strong><br><em>Fact:</em> When sealed with biocompatible gutta-percha and restored with a custom crown, a treated tooth can comfortably last a lifetime.</li></ul><h3>Step-by-Step Clinical Procedure</h3><ol><li><strong>Diagnostic X-Ray:</strong> Digital imaging pinpoints the exact depth of infected pulp.</li><li><strong>Disinfection:</strong> Rotary micro-files gently clean and sterilize the internal root canal system.</li><li><strong>Biocompatible Sealing:</strong> Sterile gutta-percha tightly seals the canal against future bacteria.</li><li><strong>Protective Crown:</strong> A porcelain or zirconia crown protects the tooth against fractures.</li></ol>',
    '<h2>রুট ক্যানেল ট্রিটমেন্টের সঠিক তথ্য</h2><p>রুট ক্যানেল শুনলেই সাধারণ মানুষের মনে এক ধরণের ভীতি কাজ করে। তবে আধুনিক ডেন্টাল সায়েন্সে এই চিকিৎসা সম্পূর্ণ ব্যথাহীন ও আরামদায়ক।</p><blockquote>আধুনিক রোটারি এন্ডোডন্টিক্স এবং উন্নত এনেস্থেশিয়ার কারণে রুট ক্যানেল করা এখন সাধারণ একটি ফিলিং করার মতোই সহজ। এটি মূলত দাঁতের ভেতরের তীব্র সংক্রমণ ও ব্যথা স্থায়ীভাবে দূর করতে করা হয়।</blockquote><h3>সাধারণ ভুল ধারণা ও আসল সত্য</h3><ul><li><strong>ভুল ধারণা ১: রুট ক্যানেল অত্যন্ত বেদনাদায়ক।</strong><br><em>আসল সত্য:</em> আধুনিক লোকাল অ্যানেস্থেশিয়ার কারণে চিকিৎসার পুরো সময় রোগী সম্পূর্ণ ব্যথাহীন থাকেন।</li><li><strong>ভুল ধারণা ২: দাঁত বাঁচানোর চেয়ে তুলে ফেলা ভালো।</strong><br><em>আসল সত্য:</em> প্রাকৃতিক দাঁতের সমকক্ষ কোনো কৃত্রিম দাঁত হতে পারে না। নিজের দাঁত রক্ষা করাই চিকিৎসার প্রধান লক্ষ্য।</li><li><strong>ভুল ধারণা ৩: চিকিৎসা সাময়িক উপশম দেয়।</strong><br><em>আসল সত্য:</em> সঠিক নিয়মে রুট ক্যানেল ও স্থায়ী ক্রাউন (ক্যাপ) লাগানোর পর সেই দাঁতটি আজীবন সেবা দেয়।</li></ul>'
),
(
    'braces-vs-clear-aligners',
    'Braces vs Clear Aligners: Which One Is Right for You?',
    'ব্রেসেস নাকি ক্লিয়ার অ্যালাইনার: আপনার জন্য কোনটি উপযুক্ত?',
    'A comprehensive orthodontic comparison between traditional metal braces, ceramic braces, and transparent aligners to help you make an informed decision.',
    'বাঁকা দাঁত সোজা করতে মেটাল ব্রেসেস নাকি আধুনিক স্বচ্ছ ক্লিয়ার অ্যালাইনার—কোনটি আপনার জীবনযাত্রা ও বাজেটের সাথে মানানসই জেনে নিন।',
    '/images/sub_services/1. B. Clear Aligners.png',
    'orthodontics',
    'Orthodontics',
    'অর্থোডন্টিক্স',
    '7 min read',
    'Sep 2026',
    'braces vs aligners Dhaka orthodontic specialist',
    'Dr. Diean Dental Specialists',
    'ডাঃ দিয়েন ডেন্টাল বিশেষজ্ঞ টিম',
    'Orthodontic Consultant',
    'অর্থোডন্টিক কনসালটেন্ট',
    ARRAY['braces', 'clear aligners', 'orthodontics', 'smile design'],
    '<h2>Orthodontic Options for a Straighter Smile</h2><p>Crooked, crowded, or spaced teeth not only affect aesthetic confidence but can also impair chewing efficiency and lead to uneven enamel wear.</p><h3>Comparing Your Choices</h3><ul><li><strong>Traditional Braces:</strong> Reliable, cost-effective, and capable of correcting complex skeletal misalignments.</li><li><strong>Clear Aligners:</strong> Virtually invisible, removable for eating and brushing, and engineered using 3D digital simulation.</li></ul>',
    '<h2>সোজা ও সুন্দর হাসির জন্য সঠিক চিকিৎসা</h2><p>দাঁতের ফাঁক বা অসমান বাঁকা দাঁত শুধু চেহারার সৌন্দর্য নয়, বরং সঠিক খাদ্য চর্বণ এবং মুখের সার্বিক স্বাস্থ্যের ওপরও প্রভাব ফেলে।</p><h3>ব্রেসেস ও ক্লিয়ার অ্যালাইনারের তুলনা</h3><ul><li><strong>ট্রেডিশনাল ব্রেসেস:</strong> জটিল বাঁকা দাঁতের ক্ষেত্রে অত্যন্ত কার্যকর ও সাশ্রয়ী।</li><li><strong>ক্লিয়ার অ্যালাইনার:</strong> দেখতে প্রায় অদৃশ্য, খাওয়ার সময় খুলে রাখা যায় এবং কোনো অস্বস্তি ছাড়াই দাঁত সোজা করে।</li></ul>'
),
(
    '5-signs-you-need-a-root-canal',
    '5 Warning Signs You Might Need an Urgent Dental Consultation',
    'দাঁতের জরুরি চিকিৎসার ৫টি প্রধান লক্ষণ যা অবহেলা করা উচিত নয়',
    'Are you ignoring persistent tooth sensitivity or swelling? Here are the critical signs that indicate deep dental nerve infection.',
    'দাঁতের শিরশিরানি বা মাড়ি ফোলা কি সাধারণ সমস্যা? জেনে নিন কখন দ্রুত ডেন্টাল ডাক্তারের পরামর্শ নেওয়া জরুরি।',
    '/images/sub_services/2.2. Impacted Wisdom Tooth.png',
    'oral-surgery',
    'Oral & Maxillofacial Surgery',
    'ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারি',
    '4 min read',
    'Sep 2026',
    'tooth infection warning signs emergency dentist Dhaka',
    'Dr. Diean Dental Specialists',
    'ডাঃ দিয়েন ডেন্টাল বিশেষজ্ঞ টিম',
    'Oral & Maxillofacial Surgeon',
    'ওরাল সার্জন',
    ARRAY['dental emergency', 'toothache', 'oral health'],
    '<h2>Never Ignore Persistent Dental Discomfort</h2><p>Tooth pain is your body’s alarm bell indicating that bacterial decay has breached the protective enamel and dentin layers.</p><h3>5 Critical Warning Signs</h3><ol><li><strong>Spontaneous Throbbing Pain:</strong> Pain that awakens you at night or flares without eating.</li><li><strong>Prolonged Sensitivity:</strong> Sharp lingering pain seconds after hot coffee or iced water.</li><li><strong>Gum Swelling or Pimple (Fistula):</strong> Indicates an active infection accumulating at the root tip.</li><li><strong>Darkening of a Single Tooth:</strong> A sign of internal pulp necrosis following trauma.</li><li><strong>Pain on Chewing:</strong> Discomfort when biting indicates inflammation of surrounding periodontal ligaments.</li></ol>',
    '<h2>দাঁতের সমস্যায় অবহেলা নয়</h2><p>দাঁতের কোনো ব্যথা বা সমস্যা নিজে নিজে সারে না। সঠিক সময়ে ব্যবস্থা না নিলে ইনফেকশন হাড় ও রক্তে ছড়িয়ে পড়তে পারে।</p><h3>যে ৫টি লক্ষণ দেখা দিলে দ্রুত ডাক্তার দেখাবেন</h3><ol><li>রাতে নিজে থেকেই দাঁতে তীব্র দপদপানি ব্যথা হওয়া।</li><li>গরম বা ঠান্ডা খাবার খাওয়ার পর দীর্ঘক্ষণ তীব্র শিরশিরানি থাকা।</li><li>মাড়ি ফুলে যাওয়া বা পুঁজ জমা হওয়া।</li><li>একটি নির্দিষ্ট দাঁত কালচে বা ধূসর হয়ে যাওয়া।</li><li>চিবানোর সময় দাঁতে অসহ্য চাপ বা ব্যথা লাগা।</li></ol>'
)
ON CONFLICT (slug) DO NOTHING;
