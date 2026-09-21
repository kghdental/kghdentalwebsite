const fs = require('fs');
const path = require('path');

const supabaseDir = path.join(__dirname, '..', 'supabase');

// Read the complete base SQL file
const baseSql = fs.readFileSync(path.join(supabaseDir, 'kgh_complete_supabase_update.sql'), 'utf8');

// Read dr rafia sql
const drRafiaSql = fs.readFileSync(path.join(supabaseDir, 'add_dr_rafia_nazneen.sql'), 'utf8');

// Read two sections update sql (why choose us & clinical philosophy)
const twoSectionsSql = fs.readFileSync(path.join(supabaseDir, 'update_homepage_two_sections.sql'), 'utf8');

// Extract departments data from baseSql
// In baseSql, find lines between "-- 4. DEPARTMENTS DATA" and "-- 5. SUB-SERVICES DATA"
const deptStart = baseSql.indexOf('-- 4. DEPARTMENTS DATA');
const subServicesStart = baseSql.indexOf('-- 5. SUB-SERVICES DATA');
const clinicSettingsStart = baseSql.indexOf('-- 6. CLINIC SETTINGS');

if (deptStart === -1 || subServicesStart === -1 || clinicSettingsStart === -1) {
  console.error('Could not find section markers in baseSql!');
  process.exit(1);
}

const departmentsData = baseSql.substring(deptStart, subServicesStart).trim();
const subServicesData = baseSql.substring(subServicesStart, clinicSettingsStart).trim();

// 7 Doctors with verified credentials, BMDC registration, schedules and descriptions
const doctorsData = `
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
`;

// Clinic Settings
const clinicSettingsData = `
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
`;

// Reviews
const reviewsData = `
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
`;

// Why Choose Us cards & Clinical Creed (from twoSectionsSql)
const twoSectionsClean = twoSectionsSql.replace(/-- SECTION 1: WHY PATIENTS CHOOSE KGH DENTAL[\s\S]*?(CREATE TABLE IF NOT EXISTS public\.why_choose_cards[\s\S]*?updated_at TIMESTAMPTZ DEFAULT NOW\(\)\s*\);)/, '').trim();

// Construct the complete master handover SQL
const masterHandover = `-- ==============================================================================
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

${doctorsData}

${departmentsData}

${subServicesData}

${clinicSettingsData}

${reviewsData}

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
`;

const outputPath = path.join(supabaseDir, 'master_handover.sql');
fs.writeFileSync(outputPath, masterHandover, 'utf8');
console.log('Successfully created master_handover.sql at:', outputPath);
console.log('File size:', (fs.statSync(outputPath).size / 1024).toFixed(2), 'KB');
