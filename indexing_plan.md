# 🦷 KGH Dental — Google Business Profile (GBP) ও Google Indexing সম্পূর্ণ বাস্তবায়ন গাইড

> **ডকুমেন্ট স্ট্যাটাস:** কর্মপরিকল্পনা (Action Plan)  
> **প্রজেক্ট:** KGH Dental Website (Next.js App Router)  
> **উদ্দেশ্য:** গুগল সার্চ, গুগল ম্যাপস ও লোকাল এসইও (Local SEO)-তে ওয়েবসাইট এবং ক্লিনিককে শীর্ষ তালিকায় নিয়ে আসা।

---

## 📌 সারাংশ (Executive Summary)

আপনার ওয়েবসাইটটিকে গুগলে দৃশ্যমান ও রোগীবান্ধব করার জন্য কাজটি **৩টি মূল ধাপে** ভাগ করা হয়েছে:

1. **অংশ ১: Next.js কোডবেসে প্রয়োজনীয় SEO ও Indexing ফাইল প্রস্তুতকরণ** (কোনো কোড এখনও পরিবর্তন করা হয়নি, করার সময় কী করতে হবে তা নিচে দেওয়া হলো)
2. **অংশ ২: Google Search Console (GSC)-এ ওয়েবসাইট যুক্ত ও ইনডেক্সিং**
3. **অংশ ৩: Google Business Profile (GBP) তৈরি, অপ্টিমাইজেশন ও ম্যাপস ভেরিফিকেশন**

---

## 🛠️ অংশ ১: KGH Dental ওয়েবসাইটে কী কী যোগ করতে হবে (Code-Level Plan)

বর্তমানে ওয়েবসাইটে কন্টেন্ট চমৎকারভাবে সাজানো আছে, তবে গুগলের রোবট যেন সহজে সব পেজ রিড ও ইনডেক্স করতে পারে, তার জন্য নিচের ৩টি টেকনিক্যাল জিনিস যুক্ত করতে হবে:

### ১. স্বয়ংক্রিয় সাইটম্যাপ (`src/app/sitemap.ts`) তৈরি
Next.js 15-এ বিল্ট-ইন ডাইনামিক সাইটম্যাপ সাপোর্ট করে। এটি তৈরি করলে গুগল স্বয়ংক্রিয়ভাবে সব পেজ ও ব্লগের তালিকা পেয়ে যাবে।
- **যে পেজগুলো সাইটম্যাপে থাকবে:**
  - হোমপেজ: `/` (Priority: 1.0)
  - অ্যাপয়েন্টমেন্ট পেজ: `/appointment` (Priority: 0.9)
  - সার্ভিস ও বিভাগসমূহ: `/services` এবং সব ডিপার্টমেন্ট পেজ যেমন `/services/orthodontics-braces`, `/services/oral-maxillofacial-surgery` ইত্যাদি (Priority: 0.8)
  - বিশেষজ্ঞ ডাক্তারদের পেজ: `/doctors` (Priority: 0.8)
  - কন্টাক্ট পেজ: `/contact` (Priority: 0.7)
  - গ্যালারি ও ক্লিনিক ভিউ: `/gallery` (Priority: 0.6)
  - ডেন্টাল ব্লগ ও আর্টিকেলের পেজ: `/blog` এবং প্রতিটি ব্লগ পোস্ট (Priority: 0.7)

### ২. সার্চ ইঞ্জিন রোবট ফাইল (`src/app/robots.ts`) তৈরি
গুগল যেন আপনার পাবলিক পেজগুলো পড়তে পারে কিন্তু অ্যাডমিন প্যানেল ক্রল না করে:
- **Allow:** `/` (সব পাবলিক পেজ)
- **Disallow:** `/admin`, `/api`
- **Sitemap Link:** `https://yourdomain.com/sitemap.xml`

### ৩. Google Search Console ভেরিফিকেশন মেটা ট্যাগ (`src/app/layout.tsx`)
Google Search Console থেকে যে HTML Verification Code দেওয়া হবে, তা `src/app/layout.tsx`-এর `metadata`-তে যোগ করতে হবে:
```typescript
// layout.tsx-এ যুক্ত করার নমুনা:
export const metadata: Metadata = {
  // ... বর্তমান টাইটেল ও ডেসক্রিপশন
  verification: {
    google: "আপনার-গুগল-ভেরিফিকেশন-কোড",
  },
};
```

### ৪. লোকাল ডেন্টিস্ট স্কিমা ও রিচ স্নিপেট (JSON-LD Structured Data)
গুগল সার্চকে ক্লিনিকের সঠিক সত্ত্বা বোঝাতে হোমপেজে একটি `Dentist` / `MedicalBusiness` Schema স্ক্রিপ্ট বসানো হবে:
- ক্লিনিকের নাম: **KGH Dental**
- ক্যাটাগরি: **Dentist, Dental Clinic**
- ঠিকানা: **Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213**
- ফোন নম্বর, খোলার সময় (Opening Hours), জিও-কোঅর্ডিনেটস (Latitude & Longitude)

---

## 🌐 অংশ ২: Google Search Console (GSC)-এ ওয়েবসাইট Indexing গাইড

ওয়েবসাইটের ডোমেইন লাইভ হওয়ার পর গুগলে ইনডেক্স করার সঠিক পদ্ধতি:

### ধাপ ১: Google Search Console-এ লগইন ও প্রোপার্টি অ্যাড
১. ব্রাউজার থেকে যান: [search.google.com/search-console](https://search.google.com/search-console)  
২. ক্লিনিকের অফিসিয়াল জিমেইল দিয়ে লগইন করুন।  
৩. প্রোপার্টি টাইপ সিলেক্ট করার দুটি অপশন পাবেন:
   - **Domain (প্রস্তাবিত):** আপনার মূল ডোমেইন লিখুন (যেমন: `kghdental.com`)। এটি সাবডোমেইন ও https সহ সব ভ্যারিয়েন্ট একসাথে কভার করে। এর জন্য DNS TXT রেকর্ড ডোমেইন প্রোভাইডারে বসাতে হয়।
   - **URL prefix:** অথবা সরাসরি পুরো লিংক দিন (যেমন: `https://kghdental.com`)।

### ধাপ ২: ওনারশিপ ভেরিফাই (Site Ownership Verification)
গুগল কনসোলে ভেরিফিকেশনের জন্য সবচেয়ে সহজ দুটি পদ্ধতি:
- **পদ্ধতি ক (HTML Tag):** Google আপনাকে একটি মেটা ট্যাগ দিবে (যেমন: `<meta name="google-site-verification" content="XYZ123..." />`)। এই কোডটি আমাদের জানালে আমরা `src/app/layout.tsx`-এ বসিয়ে ডিপ্লয় করে দেব। এরপর "Verify" বাটনে চাপ দিলেই সাথে সাথে ভেরিফাই হয়ে যাবে।
- **পদ্ধতি খ (DNS TXT Record):** আপনার ডোমেইন যেখান থেকে কেনা (যেমন: Namecheap, GoDaddy, বা Cloudflare) সেখানে DNS ম্যানেজমেন্টে গিয়ে গুগলের দেওয়া TXT রেকর্ড অ্যাড করা।

### ধাপ ৩: Sitemap সাবমিট করা
১. ভেরিফিকেশন শেষে Search Console ড্যাশবোর্ডের বাম পাশের মেনু থেকে **"Sitemaps"** অপশনে ক্লিক করুন।  
২. **"Add a new sitemap"** বক্সে লিখুন: `sitemap.xml`  
৩. **"Submit"** বাটনে ক্লিক করুন।  
৪. স্ট্যাটাস দেখাবে **"Success"** এবং গুগল সাথে সাথে সাইটের সবগুলো URL ক্রল করা শুরু করবে।

### ধাপ ৪: ফাস্ট ইনডেক্সিং রিকোয়েস্ট (Instant URL Inspection)
১. সার্চ কনসোলের শীর্ষে থাকা সার্চ বারে (URL Inspection) হোমপেজের লিংক পেস্ট করে এন্টার দিন।  
২. যদি দেখায় **"URL is not on Google"**, তখন ডানপাশে **"Request Indexing"** বাটনে ক্লিক করুন।  
৩. একইভাবে আপনার গুরুত্বপূর্ণ প্রধান পেজগুলোর জন্য রিকোয়েস্ট পাঠাবেন:
   - `https://yourdomain.com/` (Home)
   - `https://yourdomain.com/appointment` (Booking)
   - `https://yourdomain.com/doctors` (Specialists)
   - `https://yourdomain.com/services` (All Treatments)
   - `https://yourdomain.com/contact` (Chamber Location)
*(সাধারণত ২৪ থেকে ৭২ ঘণ্টার মধ্যে গুগল সার্চে পেজগুলো দৃশ্যমান হতে শুরু করে)*

---

## 📍 অংশ ৩: Google Business Profile (GBP) সেটআপ ও অপ্টিমাইজেশন

গুগল ম্যাপস ও "Dentist near me", "Dental clinic in Banani" সার্চ রেজাল্টে আসার জন্য এই অংশটি সবচেয়ে বেশি কার্যকরী।

### ধাপ ১: বিজনেস প্রোফাইল খোলা
১. যান: [google.com/business](https://www.google.com/business/)  
২. **"Manage now"**-এ ক্লিক করে আপনার জিমেইল দিয়ে সাইন ইন করুন।

### ধাপ ২: ব্যবসার নাম ও ক্যাটাগরি
- **Business Name:** `KGH Dental` (অথবা সাইনবোর্ডের নামানুসারে `KGH Dental Care / KGH Dental Clinic`)  
  *(সতর্কতা: নামের সাথে অপ্রয়োজনীয় কিওয়ার্ড জোর করে জুড়বেন না, এতে গুগল অ্যাকাউন্ট সাসপেন্ড হতে পারে)*
- **Primary Category:** `Dental Clinic`
- **Secondary Categories:** `Dentist`, `Cosmetic Dentist`, `Orthodontist`, `Pediatric Dentist`, `Dental Implants Periodontist`

### ধাপ ৩: লোকেশন ও ঠিকানা (NAP Consistency)
ওয়েবসাইটের ফুটারে এবং ডাটাবেজে যে ঠিকানা দেওয়া আছে, গুগল বিজনেস প্রোফাইলেও **হুবহু একই** ঠিকানা দিতে হবে:
- **Street Address:** Level 4, Chandiwala Mansion, House 32, Road 11, Block G
- **City:** Banani, Dhaka
- **Postal Code:** 1213
- **Map Pin:** লাল পিনটি টেনে আপনার ভবনের প্রধান প্রবেশদ্বারের ঠিক ওপরে ড্রপ করুন।

### ধাপ ৪: যোগাযোগ ও ওয়েবসাইট লিংক
- **Phone Number:** ক্লিনিকের নিয়মিত ব্যবহৃত হটলাইন নম্বর (যেটি ওয়েবসাইটে দেওয়া আছে)।
- **Website URL:** আপনার লাইভ ওয়েবসাইটের লিংক (যেমন: `https://kghdental.com`)
- **Appointment Link:** সরাসরি অ্যাপয়েন্টমেন্ট পেজের লিংক দিন: `https://kghdental.com/appointment` (এর ফলে গুগল ম্যাপস থেকে রোগী সরাসরি বুকিং করতে পারবে)।

### ধাপ ৫: চেম্বার সময়সূচি (Working Hours)
ওয়েবসাইটের সেটিংস অনুযায়ী সময় সেট করুন:
- **শনিবার – বৃহস্পতিবার:** 11:00 AM – 2:00 PM এবং 5:00 PM – 9:30 PM
- **শুক্রবার:** 5:00 PM – 9:30 PM

### ধাপ ৬: গুগল ভিডিও ভেরিফিকেশন (Google Verification)
বর্তমানে নতুন হেলথকেয়ার বিজনেসের জন্য গুগল সাধারণত **Video Verification** চায়:
- ফোনের ক্যামেরা চালু করে একটি ১-২ মিনিটের একনাগাড়ে লাইভ ভিডিও রেকর্ড করতে বলবে:
  ১. বাইরে থেকে ভবনের নাম বা রাস্তার সাইনবোর্ড ও প্রবেশদ্বার।
  ২. লিফট/সিঁড়ি দিয়ে ৪ তলায় ওঠা এবং দরজার সাইনবোর্ড "KGH Dental"।
  ৩. ক্লিনিকের ভেতর ডেন্টাল চেয়ার, যন্ত্রপাতি, রিসেপশন ডেস্ক এবং ডাক্তার/স্টাফের উপস্থিতি।
  ৪. আপনার ভিজিটিং কার্ড বা ড্রয়ারের চাবি দিয়ে প্রমাণ করা যে আপনিই ব্যবস্থাপক।
- ভিডিও সাবমিট করার ২৪-৪৮ ঘণ্টার মধ্যে গুগল প্রোফাইল অ্যাপ্রুভ ও ভেরিফাইড করে দেয়।

### ধাপ ৭: রিভিউ সংগ্রহ ও QR কোডের ব্যবহার
- আপনার ওয়েবসাইটে ইতিমধ্যে চমৎকার একটি **"Google Review QR Modal"** ফিচার তৈরি করা আছে (`src/components/shared/ReviewQrModal.tsx`)।
- আপনার GBP প্রোফাইল ভেরিফাই হলে গুগল একটি শর্ট লিংক দেবে (যেমন: `https://g.page/r/.../review`)।
- সেই লিংকটি অ্যাডমিন প্যানেল (`/admin`) থেকে অথবা `src/data/settings.ts`-এ `googleReviewUrl` হিসেবে বসিয়ে দিলে রোগীরা ক্লিনিকে এসে বা ওয়েবসাইট থেকে সহজে কিউআর কোড স্ক্যান করে ৫-স্টার রিভিউ দিতে পারবে।

---

## 📋 চেকলিস্ট ও বর্তমান অগ্রগতি (Progress Status)

| কাজ | স্ট্যাটাস | ফাইল / প্ল্যাটফর্ম |
| :--- | :---: | :--- |
| ১. ডোমেইন লাইভ ও হোস্টিং কানেকশন (`kghdental.com`) | ✅ সম্পন্ন | Vercel & Domain Registrar |
| ২. ডাইনামিক সাইটম্যাপ জেনারেশন | ✅ সম্পন্ন | `src/app/sitemap.ts` |
| ৩. সার্চ রোবট কন্ট্রোল ফাইল | ✅ সম্পন্ন | `src/app/robots.ts` |
| ৪. Google লোকাল এসইও ও ডেন্টিস্ট স্কিমা | ✅ সম্পন্ন | `src/components/seo/JsonLd.tsx` |
| ৫. গ্লোবাল মেটাডাটা, OpenGraph ও Twitter কার্ড | ✅ সম্পন্ন | `src/app/layout.tsx` |
| ৬. পেজ-নির্দিষ্ট এসইও লেআউট | ✅ সম্পন্ন | `appointment`, `doctors`, `services`, `contact`, `blog`, `gallery` |
| ৭. প্রজেক্ট বিল্ড ও টাইপ ভ্যালিডেশন | ✅ সম্পন্ন | `npm run build` (0 Errors) |
| ৮. গিট পুশ ও ভার্সেল অটো-ডিপ্লয়মেন্ট | ✅ সম্পন্ন | GitHub / Vercel |
| ৯. Search Console-এ Sitemap সাবমিট | ✅ সম্পন্ন | Google Search Console |
| ১০. হোমপেজ ও সার্ভিস পেজের তাৎক্ষণিক ইনডেক্স রিকোয়েস্ট | ✅ সম্পন্ন | GSC URL Inspection |
| ১১. Google Business Profile তৈরি ও ভিডিও ভেরিফিকেশন | ⏳ পরবর্তী ধাপ | Google Maps / GBP |
| ১২. অ্যাডমিন সেটিংস-এ লাইভ Google Review URL বসানো | ⏳ পরবর্তী ধাপ | KGH Dental Admin (`/admin/settings`) |

---

## ✅ কী কী কাজ ইতিমধ্যে সম্পন্ন করা হয়েছে (Completed Work)

### ১. ডাইনামিক সাইটম্যাপ সিস্টেম তৈরি (`src/app/sitemap.ts`)
* **কার্যকারিতা:** নেক্সট.জেএস স্বয়ংক্রিয়ভাবে `https://kghdental.com/sitemap.xml` ইউআরএলে একটি এক্সএমএল সাইটম্যাপ জেনারেট করে গুগলের কাছে উপস্থাপন করবে।
* **যেসব পেজ অন্তর্ভুক্ত:**
  - হোমপেজ (`/`) — Priority: 1.0 (Daily)
  - সিরিয়াল বুকিং (`/appointment`) — Priority: 0.95 (Daily)
  - বিশেষজ্ঞ ডাক্তারদের তালিকা (`/doctors`) — Priority: 0.9 (Weekly)
  - সকল বিভাগ ও ট্রিটমেন্ট (`/services`) — Priority: 0.9 (Weekly)
  - প্রতিটি বিশেষায়িত সার্ভিস (`/services/[slug]`) — স্বয়ংক্রিয় ডাইনামিক লিংক
  - চেম্বার লোকেশন ও যোগাযোগ (`/contact`) — Priority: 0.85 (Monthly)
  - ডেন্টাল ব্লগ তালিকা (`/blog`) ও সকল আর্টিকেল (`/blog/[slug]`) — স্বয়ংক্রিয় ডাইনামিক লিংক
  - ক্লিনিক্যাল গ্যালারি ও স্মাইল ট্রান্সফরমেশন (`/gallery`) — Priority: 0.75 (Monthly)

### ২. ক্রলার রোবট ফাইল তৈরি (`src/app/robots.ts`)
* **কার্যকারিতা:** গুগলের রোবটের জন্য `https://kghdental.com/robots.txt` রুট সক্রিয় করা হয়েছে।
* **নিরাপত্তা ও প্রাইভেসি:** ওয়েবসাইটের সব পাবলিক পেজ গুগলকে ক্রল ও ইনডেক্স করতে অনুমতি দেওয়া হয়েছে (`Allow: /`), তবে অ্যাডমিন প্যানেল (`/admin`, `/admin/*`) এবং ইন্টারনাল এপিআই (`/api`, `/api/*`) গুগলের সার্চ রেজাল্ট থেকে সুরক্ষিত ও ব্লক রাখা হয়েছে।
* সাইটম্যাপ লিংক সরাসরি রোবট ফাইলে যুক্ত করা আছে।

### ৩. Google Dentist & LocalBusiness JSON-LD স্কিমা তৈরি (`src/components/seo/JsonLd.tsx`)
* গুগল সার্চে "Dentist in Banani", "Dental clinic Dhaka" লিখে সার্চ করলে ক্লিনিকের ইনফরমেশন প্যানেল (Knowledge Graph) পাওয়ার জন্য আন্তর্জাতিক মানের স্ট্রাকচার্ড ডাটা কোডে যুক্ত করা হয়েছে।
* **স্কিমায় যা যা অন্তর্ভুক্ত:**
  - ক্লিনিকের অফিসিয়াল নাম ও ব্র্যান্ডিং: `KGH Dental` (কেজিএইচ ডেন্টাল)
  - বনানীর সঠিক চেম্বার ঠিকানা (লেভেল ৪, চান্দীওয়ালা ম্যানশন, রোড ১১, বনানী)
  - জিও কো-অর্ডিনেটস (Latitude & Longitude) ও গুগল ম্যাপ লিংক
  - শনিবার থেকে শুক্রবারের সঠিক ও পূর্ণাঙ্গ সময়সূচি (Opening Hours)
  - ডেন্টাল স্পেশালিটিজ (অর্থোডন্টিক্স, ইমপ্ল্যান্টস, রুট ক্যানেল, ম্যাক্সিলোফেসিয়াল সার্জারি ইত্যাদি)
  - সরাসরি ওয়েবসাইটে অ্যাপয়েন্টমেন্ট বুকিং করার গুগল অ্যাকশন (`ReserveAction`)

### ৪. গ্লোবাল মেটাডাটা ও সোশ্যাল মিডিয়া প্রিভিউ (`src/app/layout.tsx`)
* `metadataBase` কে `https://kghdental.com`-এ সেট করা হয়েছে।
* ক্যানোনিক্যাল URL (`canonical: https://kghdental.com`) যুক্ত করা হয়েছে যেন ডুপ্লিকেট কন্টেন্ট সমস্যা না হয়।
* বাংলা ও ইংরেজি মিশ্রিত হাই-ভলিউম এসইও কিওয়ার্ড যুক্ত করা হয়েছে।
* ফেসবুক, হোয়াটসঅ্যাপ ও টুইটারে লিংক পাঠালে যেন প্রিমিয়াম ব্যানার ও ডেসক্রিপশন সহ কার্ড শো করে, তার জন্য `OpenGraph` ও `Twitter Card` মেটাডাটা কনফিগার করা হয়েছে।

### ৫. প্রতিটি সেকশনের জন্য ডেডিকেটেড এসইও লেআউট
* `src/app/appointment/layout.tsx` — বুকিং পেজের জন্য নির্দিষ্ট মেটাডাটা
* `src/app/doctors/layout.tsx` — ডাক্তারদের পেজের জন্য নির্দিষ্ট মেটাডাটা
* `src/app/services/layout.tsx` — সকল সার্ভিসের পেজের জন্য নির্দিষ্ট মেটাডাটা
* `src/app/contact/layout.tsx` — কন্টাক্ট ও বনানী লোকেশন পেজের জন্য নির্দিষ্ট মেটাডাটা
* `src/app/blog/layout.tsx` — ডেন্টাল ব্লগ ও আর্টিকেলের জন্য নির্দিষ্ট মেটাডাটা
* `src/app/gallery/layout.tsx` — ক্লিনিক্যাল স্মাইল ট্রান্সফরমেশন গ্যালারির মেটাডাটা

### ৬. বিল্ড ও পারফরম্যান্স ভ্যালিডেশন
* সম্পূর্ণ প্রজেক্টে `npm run build` চালিয়ে সফলভাবে টেস্ট করা হয়েছে (Exit Code: 0)।
* টাইপস্ক্রিপ্ট বা নেক্সট.জেএস কম্পাইলেশনে কোনো ধরনের ভুল বা এরর নেই।

---

## ⏳ কী কী কাজ এখন করা বাকি আছে (Remaining Tasks To Do)

কোডবেসের কাজ শতভাগ শেষ। এখন বাকি কাজগুলো মূলত গুগল প্ল্যাটফর্ম (Search Console ও Google Business Profile)-এ আপনার অ্যাকাউন্ট দিয়ে সম্পন্ন করতে হবে:

### ১. গিট পুশ করা (Deploy Code to Vercel)
* আপনার প্রজেক্টের কোড GitHub-এ পুশ (`git add .`, `git commit -m "Add SEO sitemap, robots, and JsonLd"`, `git push`) করুন।
* Vercel স্বয়ংক্রিয়ভাবে ১-২ মিনিটের মধ্যে লাইভ সাইটে নতুন সাইটম্যাপ ও মেটাডাটা চালু করে দেবে।
* লাইভ সাইটে গিয়ে ব্রাউজারে চেক করতে পারেন:
  - `https://kghdental.com/sitemap.xml`
  - `https://kghdental.com/robots.txt`

### ২. Google Search Console-এ সাইট যুক্ত করা ও Sitemap সাবমিট
* [search.google.com/search-console](https://search.google.com/search-console)-এ যান।
* আপনার অফিসিয়াল জিমেইল দিয়ে সাইন ইন করে **"Domain"** বা **"URL prefix"** অপশনে `https://kghdental.com` যোগ করুন।
* ওনারশিপ ভেরিফাই হলে বাম পাশের মেনু থেকে **"Sitemaps"** ট্যাবে যান।
* **"Add a new sitemap"** বক্সে শুধু `sitemap.xml` লিখে **Submit** বাটনে ক্লিক করুন (স্ট্যাটাস সাথে সাথে "Success" দেখাবে)।

### ৩. গুরুত্বপূর্ণ পেজগুলোর তাৎক্ষণিক ইনডেক্সিং রিকোয়েস্ট (Fast URL Inspection)
* সার্চ কনসোলের উপরে সার্চ বারে (URL Inspection) নিচের ইউআরএলগুলো দিয়ে এক এক করে **"Request Indexing"** দিন:
  - `https://kghdental.com`
  - `https://kghdental.com/appointment`
  - `https://kghdental.com/doctors`
  - `https://kghdental.com/services`
  - `https://kghdental.com/contact`
*(এতে গুগল রোবট সর্বোচ্চ ২৪-৭২ ঘণ্টার মধ্যে সাইটটিকে সার্চ রেজাল্টে প্রদর্শন শুরু করবে)*

### ৪. Google Business Profile (GBP) তৈরি ও ভিডিও ভেরিফিকেশন
* [google.com/business](https://www.google.com/business)-এ যান।
* ক্লিনিকের নাম: `KGH Dental` এবং ক্যাটাগরি: `Dental Clinic` দিন।
* ঠিকানা দিন: `Level 4, Chandiwala Mansion, House 32, Road 11, Block G, Banani, Dhaka-1213`
* ওয়েবসাইট লিংক দিন: `https://kghdental.com`
* অ্যাপয়েন্টমেন্ট লিংক দিন: `https://kghdental.com/appointment`
* গুগল যে ২ মিনিটের ভিডিও ভেরিফিকেশন (সাইনবোর্ড, ডেন্টাল চেয়ার, চেম্বার) চাইবে, তা ফোন দিয়ে লাইভ রেকর্ড করে সাবমিট করুন।

### ৫. Google Review লিংক অ্যাডমিন প্যানেলে বসানো
* GBP ভেরিফাই হয়ে গেলে গুগল থেকে একটি শর্ট রিভিউ লিংক পাবেন (যেমন: `https://g.page/r/.../review`)।
* আপনার ওয়েবসাইটের অ্যাডমিন প্যানেলে (`https://kghdental.com/admin/settings`) গিয়ে **Google Review URL** ফিল্ডে লিংকটি সেভ করে দিন।
* এর ফলে ওয়েবসাইটের ফুটারের **"গুগলে রিভিউ দিন (QR Code)"** বাটনে স্বয়ংক্রিয়ভাবে আপনার আসল রিভিউ QR কোড প্রদর্শিত হবে।

