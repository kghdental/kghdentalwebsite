-- ==============================================================================
-- KGH DENTAL CLINIC — UPDATE VERIFIED DOCTOR CREDENTIALS
-- Dr. Md. Muhtashim Chowdhury (Bappy) & Dr. Jesinta Islam
-- Run in Supabase SQL Editor if resetting/updating database directly
-- ==============================================================================

-- 1. Update Dr. Md. Muhtashim Chowdhury (Bappy)
UPDATE public.doctors
SET
    name_en = 'Dr. Md. Muhtashim Chowdhury (Bappy)',
    name_bn = 'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী)',
    specialty_en = 'Oral and Dental Surgeon',
    specialty_bn = 'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    degrees_en = 'BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Maxillofacial Surgery)',
    degrees_bn = 'বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারি)',
    bio_en = 'Dr. Md. Muhtashim Chowdhury (Bappy) is an Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). He completed Post Graduate Training (PGT) in Conservative Dentistry & Maxillofacial Surgery at BSMMU (Ex-PG Hospital). Dr. Bappy has attained Advance Implant Training from USC (USA) and Advance Endodontic Training from Japan, specializing in modern painless root canals, dental implants, and maxillofacial procedures.',
    bio_bn = 'ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী) একজন দক্ষ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ সম্পন্ন করেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারিতে পিজিটি সম্পন্ন করেছেন। এছাড়া তিনি আমেরিকার ইউএসসি (USC, USA) থেকে অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং এবং জাপান থেকে অ্যাডভান্স এন্ডোডন্টিক ট্রেনিং প্রাপ্ত। তিনি আধুনিক ব্যথামুক্ত রুট ক্যানেল, ডেন্টাল ইমপ্ল্যান্ট ও ম্যাক্সিলোফেসিয়াল চিকিৎসায় অভিজ্ঞ।',
    photo_url = '/images/doctors/dr-diean.jpg',
    bmdc_reg = '8912',
    is_active = true,
    updated_at = NOW()
WHERE id = 'dr-bappy';

-- 2. Update Dr. Jesinta Islam
UPDATE public.doctors
SET
    name_en = 'Dr. Jesinta Islam',
    name_bn = 'ডা. জেসিন্টা ইসলাম',
    specialty_en = 'Oral and Dental Surgeon',
    specialty_bn = 'ওরাল অ্যান্ড ডেন্টাল সার্জন',
    degrees_en = 'BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Endodontics)',
    degrees_bn = 'বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স)',
    bio_en = 'Dr. Jesinta Islam is an accomplished Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). She completed Post Graduate Training (PGT) in Conservative Dentistry & Endodontics at BSMMU (Ex-PG Hospital) and received Advance Implant Training in Rome, Italy. She specializes in precision root canal therapy, aesthetic dentistry, conservative treatments, and dental implant solutions with patient-centered care.',
    bio_bn = 'ডা. জেসিন্টা ইসলাম একজন নিবেদিতপ্রাণ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ ডিগ্রি অর্জন করেছেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্সে পিজিটি সম্পন্ন করেছেন এবং ইতালির রোম থেকে অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং সম্পন্ন করেছেন। তিনি আধুনিক রুট ক্যানেল, নান্দনিক ডেন্টিস্ট্রি ও ডেন্টাল ইমপ্ল্যান্ট চিকিৎসায় বিশেষভাবে পারদর্শী।',
    photo_url = '/images/doctors/Dr Jesinta Islam.png',
    bmdc_reg = '9421',
    is_active = true,
    updated_at = NOW()
WHERE id = 'dr-ratina';

-- 3. Update Dr. Md. Sanwar Hossain
UPDATE public.doctors
SET
    name_en = 'Dr. Md. Sanwar Hossain',
    name_bn = 'ডা. মো. সানোয়ার হোসেন',
    specialty_en = 'Oral & Maxillofacial Surgeon',
    specialty_bn = 'ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন',
    degrees_en = 'BDS (RMC), FCPS (Oral & Maxillofacial Surgery)',
    degrees_bn = 'বিডিএস (রামেক), এফসিপিএস (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি)',
    updated_at = NOW()
WHERE id = 'dr-sanwar';

-- 4. Remove duplicate Dr. Joy record (Joy is Dr. Md. Sanwar Hossain)
DELETE FROM public.doctors
WHERE id = 'dr-joy';

