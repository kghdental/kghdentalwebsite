-- ==============================================================================
-- KGH DENTAL CLINIC — COMPLETE DATABASE SYNC & MIGRATION SCRIPT
-- Database: Supabase (PostgreSQL)
-- Generated: 2026-09-07T18:51:13.590Z
-- ==============================================================================

-- 1. TABLE SCHEMAS (IF NOT EXISTS)
-- ==============================================================================

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
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Ensure bmdc_reg and other columns exist if table was previously created
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS bmdc_reg TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS designation_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS institution_bn TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_en TEXT;
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS experience_bn TEXT;

-- 2. ALL 8 DEPARTMENTS (UPSERT)
-- ==============================================================================

INSERT INTO public.departments (id, slug, name_en, name_bn, short_desc_en, short_desc_bn, icon_name, lead_doctor_id, image_url, sort_order)
VALUES
('orthodontics', 'orthodontics', 'Orthodontics', 'অর্থোডন্টিক্স', 'Straighter teeth, better bites, and more confident smiles for children and adults.', 'সোজা দাঁত, সঠিক বাইট, আর আত্মবিশ্বাসী হাসি — শিশু ও প্রাপ্তবয়স্ক সবার জন্য।', 'Smile', 'dr-fatema', '/images/services-images-for-7-services/Orthodontics.jpeg', 1),
('oral-surgery', 'oral-surgery', 'Oral & Maxillofacial Surgery', 'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি', 'Advanced surgical care for wisdom teeth extractions, dental implants, and jaw bone reconstructions.', 'উইজডম টুথ তোলা, ডেন্টাল ইমপ্ল্যান্ট এবং জটিল চোয়ালের সার্জারির আধুনিক ও ব্যথামুক্ত সমাধান।', 'ShieldAlert', 'dr-sanwar', '/images/services-images-for-7-services/Oral & Maxillofacial Surgery.png', 2),
('endodontics', 'endodontics', 'Conservative Dentistry & Endodontics', 'কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স', 'Painless root canal treatment and restorative procedures to save and protect your natural teeth.', 'ব্যথামুক্ত আধুনিক রুট ক্যানেল ও ফিলিংয়ের মাধ্যমে আপনার প্রাকৃতিক দাঁতকে দীর্ঘস্থায়ী সুরক্ষা।', 'Sparkles', NULL, '/images/services-images-for-7-services/Conservative Dentistry & Endodontics.jpeg', 3),
('prosthodontics', 'prosthodontics', 'Prosthodontics', 'প্রস্থোডন্টিক্স', 'Precision crowns, bridges, and complete dental rehabilitation to restore chewing and aesthetics.', 'দাঁতের ক্যাপ বা ক্রাউন, ফিক্সড ব্রিজ ও কৃত্রিম দাঁতের মাধ্যমে নিখুঁতভাবে সুন্দর হাসি পুনরুদ্ধার।', 'Layers', 'dr-diean', '/images/services-images-for-7-services/Prosthodontics.jpeg', 4),
('pediatric', 'pediatric', 'Pediatric Dentistry', 'শিশু দন্ত বিভাগ', 'Gentle, friendly, and fear-free dental care designed especially for growing infants and children.', 'শিশুদের জন্য সম্পূর্ণ ভীতিহীন, আনন্দময় ও স্নেহপূর্ণ পরিবেশে উন্নত দন্ত চিকিৎসা সেবা।', 'HeartHandshake', 'dr-fatema', '/images/services-images-for-7-services/Pediatric Dentistry.jpeg', 5),
('periodontics', 'periodontics', 'Periodontics', 'পেরিওডন্টিক্স', 'Expert gum disease management, ultrasonic scaling, and cosmetic gum contouring for stronger teeth.', 'মাড়ির রক্তপাত বন্ধ, স্কেলিং ও মাড়ির জটিল ইনফেকশনের আধুনিক বিশেষজ্ঞ চিকিৎসা।', 'Activity', 'dr-bappy', '/images/services-images-for-7-services/Periodontics.jpeg', 6),
('oral-medicine', 'oral-medicine', 'Oral Medicine & Diagnosis', 'ওরাল মেডিসিন ও ডায়াগনোসিস', 'Specialist diagnosis for oral ulcers, precancerous lesions, OSMF, and complex mucosal conditions.', 'মুখের ঘা, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ ও জটিল মিউকোসাল রোগের বিশেষজ্ঞ চিকিৎসা ও রোগ নির্ণয়।', 'Microscope', 'dr-rifat', '/images/services-images-for-7-services/ORAL Medicine.jpeg', 7),
('general-consultation', 'general-consultation', 'General Consultation & Diagnostics', 'জেনারেল কনসালটেশন ও ডায়াগনস্টিকস', 'Comprehensive dental examinations, low-radiation digital OPG X-rays, and customized treatment plans.', 'সার্বিক মুখ ও দাঁত পরীক্ষা, ডিজিটাল ওপিজি এক্স-রে এবং সঠিক বিশেষজ্ঞের সুনির্দিষ্ট পরামর্শ।', 'Stethoscope', 'dr-bappy', '/images/services-images-for-7-services/Consultation.jpeg', 8)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name_en = EXCLUDED.name_en,
    name_bn = EXCLUDED.name_bn,
    short_desc_en = EXCLUDED.short_desc_en,
    short_desc_bn = EXCLUDED.short_desc_bn,
    icon_name = EXCLUDED.icon_name,
    lead_doctor_id = EXCLUDED.lead_doctor_id,
    image_url = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order;

-- 3. ALL 6 DOCTORS (UPSERT)
-- ==============================================================================

INSERT INTO public.doctors (
    id, name_en, name_bn, specialty_en, specialty_bn, degrees_en, degrees_bn,
    designation_en, designation_bn, institution_en, institution_bn, bmdc_reg,
    photo_url, bio_en, bio_bn, experience_en, experience_bn, department_id,
    schedule, is_active
)
VALUES
(
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
    '6150',
    '/images/doctors/dr-diean.jpg',
    'Dr. Ahamed Diean Sammir specializes in prosthodontics, with advanced training in dental implants, fixed and removable prostheses, and full mouth rehabilitation.',
    'ডা. আহমেদ দিয়ান সাম্মির প্রস্থোডন্টিক্সে বিশেষজ্ঞ, ডেন্টাল ইমপ্ল্যান্ট, ফিক্সড ও রিমুভেবল প্রস্থেসিস এবং ফুল মাউথ রিহ্যাবিলিটেশনে উন্নত প্রশিক্ষণপ্রাপ্ত।',
    'Over 10 years of specialized restorative & implant clinical experience.',
    '১০ বছরেরও বেশি বিশেষায়িত রিস্টোরেটিভ ও ইমপ্ল্যান্ট ক্লিনিক্যাল অভিজ্ঞতা।',
    'prosthodontics',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}'::jsonb,
    TRUE
),
(
    'dr-sanwar',
    'Dr. Md. Sanwar Hossain',
    'ডা. মো. সানোয়ার হোসেন',
    'Oral & Maxillofacial Surgeon',
    'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন',
    'BDS, FCPS (Oral & Maxillofacial Surgery)',
    'বিডিএস, এফসিপিএস (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি)',
    'Consultant Oral & Maxillofacial Surgeon',
    'কনসালটেন্ট ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন',
    'Dhaka Dental College & Hospital (Ex-Resident)',
    'ঢাকা ডেন্টাল কলেজ ও হাসপাতাল',
    '5420',
    '/images/doctors/DR. MD. SANWAR HOSSAIN.png',
    'Dr. Md. Sanwar Hossain is a certified oral and maxillofacial surgeon holding an FCPS. He specializes in surgical tooth extractions, dental implants, jaw trauma, and reconstructive facial surgeries.',
    'ডা. মো. সানোয়ার হোসেন এফসিপিএস ডিগ্রিধারী একজন অভিজ্ঞ ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন। তিনি ইমপ্যাক্টেড দাঁত তোলা, ডেন্টাল ইমপ্ল্যান্ট, চোয়ালের ফ্র্যাকচার ও জটিল সার্জারিতে পারদর্শী।',
    'Fellow of College of Physicians and Surgeons (FCPS)',
    'ফেলো, কলেজ অব ফিজিশিয়ান্স অ্যান্ড সার্জনস (এফসিপিএস)',
    'oral-surgery',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}'::jsonb,
    TRUE
),
(
    'dr-fatema',
    'Dr. Fatema Tasrin Madhubi',
    'ডা. ফাতেমা তাসরিন মধুবী',
    'Orthodontist & Clear Aligner Specialist',
    'অর্থোডন্টিক্স ও ক্লিয়ার অ্যালাইনার বিশেষজ্ঞ',
    'BDS, FCPS (Orthodontics & Dentofacial Orthopedics)',
    'বিডিএস, এফসিপিএস (অর্থোডন্টিক্স অ্যান্ড ডেন্টোফেসিয়াল অর্থোপেডিকস)',
    'Specialist Orthodontist',
    'বিশেষজ্ঞ অর্থোডন্টিস্ট',
    'FCPS Certified Orthodontic Specialist',
    'এফসিপিএস সার্টিফাইড অর্থোডন্টিক স্পেশালিস্ট',
    '7831',
    '/images/doctors/dr-fatema.jpg',
    'Dr. Fatema Tasrin Madhubi is an orthodontist who completed her FCPS in Orthodontics. She is experienced in treating malocclusions, bite corrections, self-ligating braces, and digital clear aligners.',
    'ডা. ফাতেমা তাসরিন মধুবী অর্থোডন্টিক্সে এফসিপিএস সম্পন্নকারী একজন অভিজ্ঞ অর্থোডন্টিস্ট। তিনি আঁকাবাঁকা দাঁত সোজা করা, মেটাল ও সিরামিক ব্রেসেস এবং আধুনিক ক্লিয়ার অ্যালাইনার চিকিৎসায় বিশেষজ্ঞ।',
    'Specialist in Clear Aligners & Comprehensive Orthodontic Smile Architecture',
    'ক্লিয়ার অ্যালাইনার ও অর্থোডন্টিক স্মাইল ডিজাইনে বিশেষ পারদর্শী',
    'orthodontics',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}'::jsonb,
    TRUE
),
(
    'dr-bappy',
    'Dr. Md. Muhtashim Chowdhury (Bappy)',
    'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী)',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BDS, PGT (Oral & Maxillofacial Surgery), Advanced Training in Endodontics & Aesthetic Dentistry',
    'বিডিএস, পিজিটি (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি), উন্নত এন্ডোডন্টিক্স ও এস্থেটিক ডেন্টিস্ট্রি প্রশিক্ষণ',
    'Lead Dental Surgeon & Clinical Director',
    'চিফ ডেন্টাল সার্জন ও ক্লিনিক্যাল ডিরেক্টর',
    'KGH Dental Clinic',
    'কেজিএইচ ডেন্টাল ক্লিনিক',
    '8912',
    '/images/doctors/dr-Bappy.png',
    'Dr. Md. Muhtashim Chowdhury (Bappy) is a compassionate dental surgeon with postgraduate training in oral and maxillofacial surgery. He focuses on comprehensive dental diagnosis, painless endodontic therapy, and patient comfort.',
    'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী) ওরাল ও ম্যাক্সিলোফেসিয়াল সার্জারিতে পোস্ট-গ্র্যাজুয়েট প্রশিক্ষণপ্রাপ্ত একজন দক্ষ ও অভিজ্ঞ ডেন্টাল সার্জন। তিনি রুট ক্যানেল, নান্দনিক ফিলিং এবং ব্যথাহীন চিকিৎসায় বিশেষ অভিজ্ঞ।',
    'Lead Dental Surgeon with hundreds of successful root canal and cosmetic restorations.',
    'শত শত সফল রুট ক্যানেল ও কসমেটিক ডেন্টাল চিকিৎসার অভিজ্ঞতা।',
    'general-consultation',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}'::jsonb,
    TRUE
),
(
    'dr-ratina',
    'Dr. Jesinta Islam',
    'ডা. জেসিন্টা ইসলাম',
    'Oral and Dental Surgeon',
    'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    'BDS, PGT (Oral & Maxillofacial Surgery, BSMMU), Training in Aesthetic Dentistry',
    'বিডিএস, পিজিটি (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি, বিএসএমএমইউ), এস্থেটিক ডেন্টিস্ট্রি প্রশিক্ষণ',
    'Associate Dental Surgeon',
    'সহযোগী ডেন্টাল সার্জন',
    'Bangabandhu Sheikh Mujib Medical University (BSMMU Ex-Trainee)',
    'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়',
    '9421',
    '/images/doctors/Dr Jesinta Islam.png',
    'Dr. Jesinta Islam is a dental surgeon with postgraduate training in oral and maxillofacial surgery at BSMMU. She provides comprehensive general dental consultations, painless restorative procedures, and pediatric oral care.',
    'ডা. জেসিন্টা ইসলাম বিএসএমএমইউ থেকে ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারিতে পিজিটি প্রশিক্ষণপ্রাপ্ত একজন প্রতিশ্রুতিশীল ডেন্টাল সার্জন। তিনি ব্যথামুক্ত চিকিৎসা, ফিলিং, স্কেলিং ও শিশু দন্ত সেবায় বিশেষ মনোযোগী।',
    'Specialist Training in BSMMU with focus on patient comfort and gentle dental procedures.',
    'বিএসএমএমইউ-তে বিশেষ প্রশিক্ষণ ও কোমল যত্নে ব্যথাহীন চিকিৎসা।',
    'pediatric',
    '{"availableDaysEn":"Every day except Tuesday","availableDaysBn":"মঙ্গলবার ব্যতীত প্রতিদিন","daysOfWeek":[0,1,3,4,5,6],"startTime":"17:00","endTime":"21:30","slotDurationMinutes":30,"note":{"en":"5:00 PM – 9:30 PM","bn":"বিকাল ৫:০০ – রাত ৯:৩০"}}'::jsonb,
    TRUE
),
(
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
    'Dr. Rifat Rahman is an accomplished Oral Medicine Consultant and Dental Surgeon holding an MSc in Oral Medicine from Thailand and a PhD in Oral Oncology from Australia. With BMDC Registration No. 4564, he specializes in mucosal diseases, precancerous lesion detection, and complex oral medicine care.',
    'ডা. রিফাত রহমান একজন উচ্চশিক্ষিত ও অভিজ্ঞ ওরাল মেডিসিন কনসালটেন্ট ও ডেন্টাল সার্জন (বিএমডিসি রেজি: ৪৫৬৪)। তিনি থাইল্যান্ড থেকে ওরাল মেডিসিনে এমএসসি এবং অস্ট্রেলিয়া থেকে ওরাল অনকোলজিতে পিএইচডি ডিগ্রি অর্জন করেছেন। এছাড়া জাপান থেকে ওরাল রেডিওলজিতে বিশেষ প্রশিক্ষণপ্রাপ্ত। তিনি মুখের ক্যান্সার স্ক্রিনিং, প্রিক্যান্সারাস ক্ষত ও লালাগ্রন্থির জটিল রোগের আধুনিক চিকিৎসায় পারদর্শী।',
    'PhD in Oral Oncology (Australia) • MSc Oral Medicine (Thailand) • Trained in Oral Radiology (Japan)',
    'পিএইচডি ওরাল অনকোলজি (অস্ট্রেলিয়া) • এমএসসি ওরাল মেডিসিন (থাইল্যান্ড) • ওরাল রেডিওলজি ট্রেনিং (জাপান)',
    'oral-medicine',
    '{"availableDaysEn":"Friday only","availableDaysBn":"শুধুমাত্র শুক্রবার","daysOfWeek":[5],"startTime":"17:00","endTime":"20:00","slotDurationMinutes":30,"note":{"en":"5:00 PM – 8:00 PM (Friday only)","bn":"বিকাল ৫:০০ – রাত ৮:০০ (শুধুমাত্র শুক্রবার)"}}'::jsonb,
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
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

-- 4. VERIFICATION QUERIES
-- ==============================================================================
-- Run these after executing the above to confirm:
-- SELECT id, name_en, image_url FROM public.departments ORDER BY sort_order;
-- SELECT id, name_en, specialty_en, bmdc_reg, photo_url FROM public.doctors;
-- SELECT department_id, COUNT(*) AS total_subservices FROM public.sub_services GROUP BY department_id;
