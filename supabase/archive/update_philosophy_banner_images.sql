-- ==============================================================================
-- KGH DENTAL CLINIC — UPDATE CLINICAL PHILOSOPHY BANNER IMAGES
-- Replaces old portrait / stock chamber images with new 16:9 widescreen slides:
-- Slide 1: Panoramic X-Ray & Modern Operatory (/images/philosophy/slide-1-xray-diagnosis.jpg)
-- Slide 2: Shade Guide & Smile Restoration (/images/philosophy/slide-2-shade-guide-smile.jpg)
-- Slide 3: Orthodontic Braces & Confident Smile (/images/philosophy/slide-3-orthodontic-braces.jpg)
-- ==============================================================================

UPDATE public.clinical_creed
SET quotes = '[
    {
        "id": "quote-1",
        "quote": {
            "en": "A genuine smile is the universal language of health, confidence, and human connection. We combine surgical mastery with compassionate gentleness — because modern dentistry isn''t just about fixing teeth, it''s about transforming how you live.",
            "bn": "একটি আত্মবিশ্বাসী ও সুন্দর হাসি মানুষের স্বাস্থ্য, মর্যাদা ও আত্মবিশ্বাসের প্রতীক। কেজিএইচ ডেন্টালে আমরা বিশেষায়িত সার্জিক্যাল দক্ষতা ও আন্তরিক সেবার মেলবন্ধন ঘটাই — কারণ আধুনিক ডেন্টাল কেয়ার শুধু দাঁত সারানো নয়, জীবনকে সহজ ও হাসিময় করে তোলা।"
        },
        "highlight": {"en": "Transforming how you live and smile.", "bn": "আপনার জীবন ও হাসিতে নতুন আত্মবিশ্বাস।"},
        "author": {"en": "Clinical Advisory Council", "bn": "ক্লিনিক্যাল অ্যাডভাইজরি কাউন্সিল"},
        "role": {"en": "KGH Dental Multi-Specialty Chamber", "bn": "কেজিএইচ ডেন্টাল মাল্টি-স্পেশালিটি চেম্বার"},
        "image": "/images/philosophy/slide-1-xray-diagnosis.jpg"
    },
    {
        "id": "quote-2",
        "quote": {
            "en": "Zero guesswork, zero rushed decisions. From digital low-radiation imaging to high-magnification diagnosis, every patient sees what we see before any procedure begins.",
            "bn": "কোনো অনুমান নয়, তাড়াহুড়ো করে নেওয়া সিদ্ধান্ত নয়। ডিজিটাল লো-রেডিয়েশন এক্স-রে এবং স্পষ্ট স্ক্রিনিংয়ের মাধ্যমে রোগীকে আগে তার সমস্যাটি বোঝানো হয়, তারপর চিকিৎসা শুরু হয়।"
        },
        "highlight": {"en": "Complete transparency before any decision.", "bn": "কোনো সিদ্ধান্তের আগেই সম্পূর্ণ স্বচ্ছতা।"},
        "author": {"en": "Board of Department Leads", "bn": "বিভাগীয় প্রধান চিকিৎসক পরিষদ"},
        "role": {"en": "Precision Diagnostics & Clinical Governance", "bn": "প্রেসিশন ডায়াগনস্টিকস ও ক্লিনিক্যাল গভর্ন্যান্স"},
        "image": "/images/philosophy/slide-2-shade-guide-smile.jpg"
    },
    {
        "id": "quote-3",
        "quote": {
            "en": "Every smile has unique anatomy. By bringing eight distinct surgical and clinical sub-disciplines under one unified roof, we ensure you receive the exact specialist your teeth deserve.",
            "bn": "প্রতিটি দাঁত ও হাসির গঠন সম্পূর্ণ আলাদা। আধুনিক ডেন্টিস্ট্রির আটটি ভিন্ন বিশেষায়িত বিভাগকে এক ছাদের নিচে এনে আমরা নিশ্চিত করি যে আপনি কেবল সঠিক বিশেষজ্ঞের হাতেই সেবা পাচ্ছেন।"
        },
        "highlight": {"en": "Eight specialist fields under one unified roof.", "bn": "এক ছাদের নিচে আটটি বিশেষায়িত বিভাগ।"},
        "author": {"en": "Consultant Dental Surgeons", "bn": "কনসালটেন্ট ডেন্টাল সার্জনবৃন্দ"},
        "role": {"en": "Specialist Care Collaborative", "bn": "বিশেষজ্ঞ সমন্বিত চিকিৎসা দল"},
        "image": "/images/philosophy/slide-3-orthodontic-braces.jpg"
    }
]'::jsonb,
updated_at = NOW()
WHERE id = 1;
