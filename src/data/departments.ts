import { Department } from "@/types";

export const DEPARTMENTS: Department[] = [
  {
    id: "orthodontics",
    slug: "orthodontics",
    name: {
      en: "Orthodontics",
      bn: "অর্থোডন্টিক্স",
    },
    shortDesc: {
      en: "Straighter teeth, better bites, and more confident smiles for children and adults.",
      bn: "সোজা দাঁত, সঠিক বাইট, আর আত্মবিশ্বাসী হাসি — শিশু ও প্রাপ্তবয়স্ক সবার জন্য।",
    },
    iconName: "Smile",
    leadDoctorId: "dr-fatema",
    imageUrl: "/images/services-images-for-7-services/Orthodontics.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/01. Orthodontics Cover Banner.png",
    subServices: [
      {
        id: "metal-braces",
        number: 1,
        imageUrl: "/images/SubServices-images/1. A. Metal Traditional Braces.png",
        name: {
          en: "Metal (Traditional) Braces",
          bn: "মেটাল (ট্রেডিশনাল) ব্রেসেস",
        },
        why: {
          en: "Corrects crowded, gapped, or misaligned teeth effectively.",
          bn: "গাদাগাদি, ফাঁকা বা আঁকাবাঁকা দাঁত সঠিকভাবে সোজা ও সারিবদ্ধ করতে।",
        },
        when: {
          en: "Visible crowding, spacing, or bite alignment issues noticed by dentist or patient.",
          bn: "দাঁত অতিরিক্ত গাদাগাদি, অনাকাঙ্ক্ষিত ফাঁকা বা কামড়ের অসঙ্গতি (বাইট সমস্যা) দেখা দিলে।",
        },
        benefit: {
          en: "Most affordable, durable, and highly effective for complex alignment corrections.",
          bn: "সবচেয়ে সাশ্রয়ী, অত্যন্ত টেকসই এবং জটিল ক্ষেত্রেও ভীষণ কার্যকর।",
        },
      },
      {
        id: "clear-aligners",
        number: 2,
        imageUrl: "/images/SubServices-images/1. B. Clear Aligners.png",
        name: {
          en: "Clear Aligners / Invisible Braces",
          bn: "ক্লিয়ার অ্যালাইনার / অদৃশ্য ব্রেসেস",
        },
        why: {
          en: "Straightens teeth discreetly without visible metal wires.",
          bn: "চোখে না পড়ার মতো করে কোনো তার ছাড়াই দাঁত সোজা করতে।",
        },
        when: {
          en: "Mild-to-moderate misalignment, adult patients preferring a subtle, wire-free option.",
          bn: "মাঝারি ধরনের আঁকাবাঁকা দাঁত, বিশেষত প্রাপ্তবয়স্কদের জন্য যারা দৃশ্যমান ব্রেসেস চান না।",
        },
        benefit: {
          en: "Nearly invisible, completely removable for meals and brushing, smooth and comfortable.",
          bn: "প্রায় অদৃশ্য, খাওয়ার সময় বা ব্রাশ করার সময় খুলে ফেলা যায় এবং খুবই আরামদায়ক।",
        },
      },
      {
        id: "smile-design",
        number: 3,
        imageUrl: "/images/SubServices-images/1. c. Smile Design.png",
        name: {
          en: "Smile Design / Smile Makeover",
          bn: "স্মাইল ডিজাইন / স্মাইল মেকওভার",
        },
        why: {
          en: "Improves overall facial smile aesthetics beyond just dental alignment.",
          bn: "শুধু সোজা দাঁত নয়, মুখমণ্ডলের সাথে মানানসই করে পুরো হাসিটাকেই সুন্দর করতে।",
        },
        when: {
          en: "When you want a comprehensive, harmonized enhancement of your teeth shape and smile line.",
          bn: "যখন আপনি নিজের ব্যক্তিত্বের সাথে মানানসই সম্পূর্ণ হাসির স্থায়ী উন্নতি চান।",
        },
        benefit: {
          en: "Customized digital planning, natural-looking aesthetics, dramatic boost in personal confidence.",
          bn: "একদম নিজের মতো করে আধুনিক ডিজিটাল পরিকল্পনা, স্বাভাবিক দেখতে ও আত্মবিশ্বাস বহুগুণ বাড়ায়।",
        },
      },
      {
        id: "retainers",
        number: 4,
        imageUrl: "/images/SubServices-images/1. d. Retainers.png",
        name: {
          en: "Retainers (Post-Treatment)",
          bn: "রিটেইনার (চিকিৎসা পরবর্তী যত্ন)",
        },
        why: {
          en: "Holds teeth securely in their newly aligned position after braces or aligners.",
          bn: "ব্রেসেস বা অ্যালাইনার খোলার পর দাঁতকে নতুন জায়গায় মজবুতভাবে ধরে রাখতে।",
        },
        when: {
          en: "Immediately after completing active orthodontic alignment treatment.",
          bn: "অর্থোডন্টিক চিকিৎসা সম্পন্ন হওয়ার সাথে সাথেই এটি ব্যবহার শুরু করতে হয়।",
        },
        benefit: {
          en: "Prevents teeth from naturally shifting back, protecting your investment and lifetime smile.",
          bn: "দাঁত আবার আগের আঁকাবাঁকা জায়গায় ফিরে যাওয়া পুরোপুরি রোধ করে।",
        },
      },
      {
        id: "space-maintainers",
        number: 5,
        imageUrl: "/images/SubServices-images/1. e. Space Maintainers.png",
        name: {
          en: "Space Maintainers",
          bn: "স্পেস মেইনটেইনার",
        },
        why: {
          en: "Holds essential arch space open when a baby tooth is lost prematurely.",
          bn: "কোনো দুধ দাঁত আগেভাগে পড়ে গেলে সেই ফাঁকা জায়গাটা ধরে রাখতে।",
        },
        when: {
          en: "Premature loss of a primary tooth before the permanent successor tooth is ready to erupt.",
          bn: "স্থায়ী দাঁত আসার স্বাভাবিক সময়ের আগেই কোনো দুধ দাঁত পড়ে গেলে বা ফেলে দিলে।",
        },
        benefit: {
          en: "Prevents neighboring teeth from collapsing inward and eliminates future severe crowding.",
          bn: "ভবিষ্যতে স্থায়ী দাঁত গাদাগাদি বা আঁকাবাঁকা হয়ে ওঠার ঝুঁকি দূর করে এবং দীর্ঘমেয়াদী ব্রেসেসের প্রয়োজনীয়তা অনেকাংশে কমিয়ে দেয়।",
        },
      },
      {
        id: "myofunctional-appliances",
        number: 6,
        imageUrl: "/images/SubServices-images/1. f. Habit Correction Appliances.png",
        name: {
          en: "Myofunctional / Habit-Correction Appliances",
          bn: "মায়োফাংশনাল ও অভ্যাস সংশোধনকারী অ্যাপ্লায়েন্স",
        },
        why: {
          en: "Corrects harmful oral habits that negatively impact developing jaws and tooth positioning.",
          bn: "মুখ ও চোয়ালের স্বাভাবিক বৃদ্ধিতে বাধা দেওয়া ক্ষতিকর মৌখিক অভ্যাস দূর করতে।",
        },
        when: {
          en: "Habits such as tongue-thrusting, mouth-breathing, or incorrect swallowing identified in children.",
          bn: "শিশুদের মধ্যে জিভ দিয়ে দাঁত ঠেলার অভ্যাস বা মুখ দিয়ে শ্বাস নেওয়ার লক্ষণ ধরা পড়লে।",
        },
        benefit: {
          en: "Promotes healthy, balanced facial jaw growth and prevents structural dental misalignment.",
          bn: "চোয়ালের স্বাভাবিক বৃদ্ধি নিশ্চিত করে এবং মুখের আকৃতি ও দাঁতের সৌন্দর্য রক্ষা করে।",
        },
      },
      {
        id: "interceptive-orthodontics",
        number: 7,
        imageUrl: "/images/SubServices-images/1. g. KIDS orthodontics.png",
        name: {
          en: "Interceptive / Early Orthodontic Treatment (Kids)",
          bn: "ইন্টারসেপ্টিভ / শিশুদের প্রাথমিক অর্থোডন্টিক চিকিৎসা",
        },
        why: {
          en: "Addresses developing bite and jaw alignment issues while bones are still actively growing.",
          bn: "চোয়াল ও হাড় বাড়ন্ত থাকার সময়েই দাঁতের প্রাথমিক সমস্যাগুলো শুধরে নিতে।",
        },
        when: {
          en: "Around ages 7 to 10, during the mixed dentition phase when growth anomalies are detected.",
          bn: "সাধারণত ৭ থেকে ১০ বছর বয়সে, দুধ ও স্থায়ী দাঁতের পরিবর্তনের সময়ে।",
        },
        benefit: {
          en: "Guides proper skeletal jaw growth, often avoiding complex tooth extractions or surgery later.",
          bn: "ভবিষ্যতে জটিল সার্জারি বা দাঁত ফেলার ঝুঁকি এড়ায় এবং পরবর্তী চিকিৎসাকে সহজ করে তোলে।",
        },
      },
    ],
  },
  {
    id: "oral-surgery",
    slug: "oral-surgery",
    name: {
      en: "Oral & Maxillofacial Surgery",
      bn: "ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি",
    },
    shortDesc: {
      en: "Surgical expertise for wisdom teeth, dental implants, facial trauma, and jaw conditions.",
      bn: "উইজডম টুথ, ডেন্টাল ইমপ্ল্যান্ট, মুখের ট্রমা এবং চোয়ালের জটিল সার্জিক্যাল সেবা।",
    },
    iconName: "Stethoscope",
    leadDoctorId: "dr-sanwar",
    imageUrl: "/images/services-images-for-7-services/Oral & Maxillofacial Surgery.png",
    coverBannerUrl: "/images/Service-page-banner-cover/02. Oral & Maxillo Cover Bannaer.png",
    subServices: [
      {
        id: "simple-extraction",
        number: 1,
        imageUrl: "/images/SubServices-images/2.1. Simple Tooth Extraction.png",
        name: {
          en: "Simple Tooth Extraction",
          bn: "সিম্পল টুথ এক্সট্রাকশন (দাঁত তোলা)",
        },
        why: {
          en: "Safely removes a severely decayed or irreparably damaged tooth.",
          bn: "মারাত্মক ক্ষতিগ্রস্ত বা মেরামতের অযোগ্য দাঁত ব্যথাহীনভাবে অপসারণ করতে।",
        },
        when: {
          en: "Irreversible structural decay, chronic infection, or advised prior to orthodontic therapy.",
          bn: "যখন ফিলিং বা রুট ক্যানেল দিয়েও দাঁত বাঁচানো সম্ভব হয় না।",
        },
        benefit: {
          en: "Immediate relief from persistent dental pain and stops the spread of infection to bone.",
          bn: "তীব্র যন্ত্রণা থেকে তাৎক্ষণিক মুক্তি দেয় এবং আশপাশের হাড়ে ইনফেকশন ছড়ানো ঠেকায়।",
        },
      },
      {
        id: "wisdom-tooth-surgery",
        number: 2,
        imageUrl: "/images/SubServices-images/2.2. Impacted Wisdom Tooth.png",
        name: {
          en: "Surgical / Impacted Wisdom Tooth Extraction",
          bn: "সার্জিক্যাল ও ইমপ্যাক্টেড উইজডম টুথ অপসারণ",
        },
        why: {
          en: "Removes third molars trapped under the gumline or jawbone with surgical precision.",
          bn: "মাড়ি বা হাড়ের নিচে আংশিক বা সম্পূর্ণ আটকে থাকা আক্কেল দাঁত নিরাপদে অপসারণ করতে।",
        },
        when: {
          en: "Impacted teeth causing acute swelling, recurrent pericoronitis, or damaging adjacent molars.",
          bn: "আক্কেল দাঁতের কারণে চোয়ালে তীব্র ব্যথা, মাড়ি ফোলা বা পাশের সুস্থ দাঁতের ক্ষতি হলে।",
        },
        benefit: {
          en: "Prevents recurrent deep infections, jaw cysts, and protects adjacent healthy molars.",
          bn: "বারবার মাড়ি ফোলা ও ইনফেকশন হওয়া বন্ধ করে এবং পাশের ভালো দাঁতকে নিরাপদ রাখে।",
        },
      },
      {
        id: "dental-implant-surgery",
        number: 3,
        imageUrl: "/images/SubServices-images/2.3. Dental Implant Surgery.png",
        name: {
          en: "Dental Implant Surgery",
          bn: "ডেন্টাল ইমপ্ল্যান্ট সার্জারি",
        },
        why: {
          en: "Replaces missing tooth roots with bio-compatible titanium posts for permanent teeth.",
          bn: "হারানো দাঁতের শিকড়ের জায়গায় টাইটানিয়াম পোস্ট বসিয়ে স্থায়ী কৃত্রিম দাঁতের ভিত্তি গড়তে।",
        },
        when: {
          en: "After tooth loss, once the jawbone structure and oral health conditions are evaluated.",
          bn: "দাঁত পড়ে যাওয়া বা তোলার পর স্থায়ী ও প্রাকৃতিক সমাধান চাইলে।",
        },
        benefit: {
          en: "Looks, feels, and chews exactly like a natural tooth while permanently preventing bone resorption.",
          bn: "আজীবন স্থায়ী, আসল দাঁতের মতোই শক্তি ও সৌন্দর্য দেয় এবং চোয়ালের হাড়ের ক্ষয় রোধ করে।",
        },
      },
      {
        id: "facial-trauma",
        number: 4,
        imageUrl: "/images/SubServices-images/2.4. Facial Trauma & Fracture Treatment.png",
        name: {
          en: "Facial Trauma & Fracture Treatment",
          bn: "ফেসিয়াল ট্রমা ও ফ্র্যাকচার চিকিৎসা",
        },
        why: {
          en: "Repairs and reconstructs fractured jawbones and facial skeletal injuries.",
          bn: "চোয়াল ও মুখের হাড়ের আঘাত বা ফ্র্যাকচার নিখুঁতভাবে পুনর্বিন্যাস ও চিকিৎসা করতে।",
        },
        when: {
          en: "Following physical trauma, sports injuries, or vehicular accidents affecting the jaw.",
          bn: "দুর্ঘটনা বা কোনো গুরুতর আঘাতে মুখমণ্ডল ও চোয়ালের হাড় ক্ষতিগ্রস্ত হলে।",
        },
        benefit: {
          en: "Restores normal jaw function, bite alignment, and preserves facial symmetry and aesthetics.",
          bn: "চোয়ালের স্বাভাবিক চিবানোর ক্ষমতা ফিরিয়ে আনে এবং চেহারার স্বাভাবিক সৌন্দর্য রক্ষা করে।",
        },
      },
      {
        id: "tmj-disorder",
        number: 5,
        imageUrl: "/images/SubServices-images/2.5.  TMJ Jaw Joint Disorder Treatment.png",
        name: {
          en: "TMJ (Jaw Joint) Disorder Treatment",
          bn: "টিএমজে (চোয়ালের জয়েন্ট) ডিসঅর্ডার চিকিৎসা",
        },
        why: {
          en: "Alleviates pain, inflammation, and dysfunction in the temporomandibular joint.",
          bn: "চোয়ালের জয়েন্টে ব্যথা, অস্বস্তি এবং নড়াচড়ার সমস্যা দূর করতে।",
        },
        when: {
          en: "Clicking noises upon chewing, chronic jaw pain, locking, or difficulty opening the mouth.",
          bn: "মুখ খুলতে গেলে খটখট শব্দ হওয়া, চোয়াল আটকে যাওয়া বা খাবার চিবানোর সময় তীব্র ব্যথা হলে।",
        },
        benefit: {
          en: "Relieves chronic facial tension and headaches, restoring full, comfortable jaw mobility.",
          bn: "দীর্ঘস্থায়ী মাথাব্যথা ও মুখের যন্ত্রণা দূর করে আরামদায়কভাবে মুখ খোলার স্বাভাবিকতা ফেরায়।",
        },
      },
      {
        id: "cyst-tumor-removal",
        number: 6,
        imageUrl: "/images/SubServices-images/2.6. Oral Cyst & Tumor Removal.png",
        name: {
          en: "Oral Cyst & Tumor Removal",
          bn: "ওরাল সিস্ট ও টিউমার অপসারণ",
        },
        why: {
          en: "Excises abnormal pathological growths from jawbone and soft oral tissues.",
          bn: "মুখগহ্বর বা চোয়ালের হাড়ের অস্বাভাবিক টিউমার বা সিস্ট অস্ত্রোপচারের মাধ্যমে অপসারণ করতে।",
        },
        when: {
          en: "Diagnosed via clinical oral exam, digital X-rays, or specialized CT imaging.",
          bn: "পরীক্ষা বা ডিজিটাল এক্স-রেতে কোনো সিস্ট বা অস্বাভাবিক বৃদ্ধি ধরা পড়লে।",
        },
        benefit: {
          en: "Halts tissue expansion, preserves bone integrity, and prevents irreversible damage.",
          bn: "রোগের বিস্তার বন্ধ করে চোয়ালের হাড় ও আশেপাশের টিস্যুকে দীর্ঘমেয়াদে নিরাপদ রাখে।",
        },
      },
      {
        id: "oral-biopsy",
        number: 7,
        imageUrl: "/images/SubServices-images/2.7. Oral Biopsy.png",
        name: {
          en: "Biopsy (Oral Lesion)",
          bn: "ওরাল বায়োপসি (মুখের ক্ষত পরীক্ষা)",
        },
        why: {
          en: "Samples microscopic tissue to diagnose the precise nature of persistent oral lesions.",
          bn: "মুখের সন্দেহজনক ক্ষত বা দাগের সঠিক রোগ নির্ণয়ে মাইক্রোস্কোপিক পরীক্ষা করতে।",
        },
        when: {
          en: "Any non-healing mouth ulcer, red/white patch, or unusual lump lasting over two weeks.",
          bn: "মুখের কোনো ঘা, সাদা বা লালচে দাগ যদি দুই সপ্তাহের বেশি স্থায়ী হয়।",
        },
        benefit: {
          en: "Provides conclusive pathology diagnosis ensuring accurate, timely, and targeted treatment.",
          bn: "যেকোনো জটিল রোগের প্রাথমিক লক্ষণ নিশ্চিত করে দ্রুত উপযুক্ত চিকিৎসার পথ দেখায়।",
        },
      },
      {
        id: "abscess-management",
        number: 8,
        imageUrl: "/images/SubServices-images/2.8. Space Infection Abscess Management.png",
        name: {
          en: "Space Infection / Abscess Management",
          bn: "স্পেস ইনফেকশন ও পুঁজ অপসারণ (অ্যাবসেস ম্যানেজমেন্ট)",
        },
        why: {
          en: "Drains and treats deep dental bacterial infections that have spread into facial fascial spaces.",
          bn: "মুখ ও গলার গভীরে ছড়িয়ে পড়া মারাত্মক দাঁতের পুঁজ ও ব্যাকটেরিয়াল ইনফেকশন সারাতে।",
        },
        when: {
          en: "Facial swelling, high fever, difficulty swallowing, or severe throbbing dental pain.",
          bn: "মুখ বা গাল ফুলে যাওয়া, জ্বর আসা, বা গিলতে কষ্ট হওয়ার মতো তীব্র সংক্রমণের সময়।",
        },
        benefit: {
          en: "Controls critical infections immediately and eliminates life-threatening airway complications.",
          bn: "ঝুঁকিপূর্ণ ইনফেকশন দ্রুত নিয়ন্ত্রণে এনে তীব্র যন্ত্রণা থেকে তাৎক্ষণিক নিস্তার দেয়।",
        },
      },
      {
        id: "oral-ulcer",
        number: 9,
        imageUrl: "/images/SubServices-images/2.9. Oral Ulcer Management.png",
        name: {
          en: "Oral Ulcer Management",
          bn: "মুখের আলসার ও ক্ষতের চিকিৎসা",
        },
        why: {
          en: "Diagnoses underlying systemic or local causes of painful, recurring mouth ulcers.",
          bn: "বারবার হওয়া কষ্টদায়ক মুখের ঘায়ের আসল কারণ শনাক্ত করে তার প্রতিকার করতে।",
        },
        when: {
          en: "Mouth sores that recur frequently or fail to resolve within typical healing timeframes.",
          bn: "যখন ঘা নিয়মিত ফিরে আসে বা স্বাভাবিক নিয়মে নিজে থেকে ভালো হয় না।",
        },
        benefit: {
          en: "Rapid relief from eating discomfort and eliminates serious mucosal disorders.",
          bn: "খাওয়াদাওয়ার তীব্র যন্ত্রণা কমায় এবং গুরুতর রোগ থাকার আশঙ্কা দূর করে।",
        },
      },
    ],
  },
  {
    id: "endodontics",
    slug: "endodontics",
    name: {
      en: "Conservative Dentistry & Endodontics",
      bn: "কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স",
    },
    shortDesc: {
      en: "Saving natural teeth is our top priority — root canal treatment, fillings, and tooth whitening.",
      bn: "আপনার প্রাকৃতিক দাঁত রক্ষা করাই আমাদের প্রধান লক্ষ্য — রুট ক্যানেল, নান্দনিক ফিলিং ও হোয়াইটেনিং।",
    },
    iconName: "ShieldCheck",
    leadDoctorId: "dr-bappy",
    imageUrl: "/images/services-images-for-7-services/Conservative Dentistry & Endodontics.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/03. Endodontics Cover banner.png",
    subServices: [
      {
        id: "root-canal",
        number: 1,
        imageUrl: "/images/SubServices-images/3. 1. Root Canal Treatment.png",
        name: {
          en: "Root Canal Treatment (RCT)",
          bn: "রুট ক্যানেল ট্রিটমেন্ট (আরসিটি)",
        },
        why: {
          en: "Saves a tooth whose internal nerve/pulp is severely infected or inflamed.",
          bn: "সংক্রমিত বা ক্ষতিগ্রস্ত দাঁতের ভেতরের স্নায়ু পরিষ্কার করে দাঁতটিকে বাঁচিয়ে রাখতে।",
        },
        when: {
          en: "Deep tooth decay, intense throbbing pain, nocturnal toothache, or sensitivity to hot foods.",
          bn: "গভীর ক্যাভিটি বা দাঁতের তীব্র ব্যথা, বিশেষ করে রাতে বা গরম কিছু খেলে ব্যথা বেড়ে গেলে।",
        },
        benefit: {
          en: "Eliminates toothache permanently while preserving your original natural tooth in the arch.",
          bn: "দাঁত ফেলে না দিয়ে ব্যথাহীনভাবে আজীবনের জন্য নিজের প্রাকৃতিক দাঁত বাঁচানো সম্ভব হয়।",
        },
      },
      {
        id: "re-root-canal",
        number: 2,
        imageUrl: "/images/SubServices-images/3. 2. Re-Root Canal Treatment.png",
        name: {
          en: "Re-Root Canal Treatment (Retreatment)",
          bn: "রি-রুট ক্যানেল ট্রিটমেন্ট",
        },
        why: {
          en: "Treats previously root-treated teeth where persistent bacteria or incomplete seal caused reinfection.",
          bn: "আগে করা রুট ক্যানেলে যদি পুনরায় ইনফেকশন বা ব্যথা দেখা দেয় তা সম্পূর্ণ নিরাময় করতে।",
        },
        when: {
          en: "Recurrent pain, tenderness to biting, or apical shadow visible on X-ray after an earlier RCT.",
          bn: "পূর্বে রুট ক্যানেল করার বেশ কিছুদিন পর আবার খাবার চিবানোর সময় ব্যথা, অস্বস্তি বা মাড়ি ফুলে উঠলে।",
        },
        benefit: {
          en: "Gives a compromised tooth a second chance at survival, avoiding costly extraction and implants.",
          bn: "দাঁত ফেলে দেওয়ার মতো চূড়ান্ত সিদ্ধান্ত না নিয়ে দাঁতটিকে সুস্থ করে তোলার দ্বিতীয় সুযোগ দেয়।",
        },
      },
      {
        id: "composite-filling",
        number: 3,
        imageUrl: "/images/SubServices-images/3. 3. Composite (Tooth-Colored) Filling.png",
        name: {
          en: "Composite (Tooth-Colored) Filling",
          bn: "কম্পোজিট (দাঁতের রঙের) ফিলিং",
        },
        why: {
          en: "Restores tooth structure after cavity removal using aesthetic, enamel-matching resin.",
          bn: "ক্যাভিটি পরিষ্কারের পর দাঁতের হুবহু স্বাভাবিক রঙের সাথে মিলিয়ে ফিলিং করতে।",
        },
        when: {
          en: "Mild-to-moderate dental cavities, small chips, or replacing dark amalgam silver fillings.",
          bn: "দাঁতে কালো গর্ত, ক্ষয় বা ভাঙা অংশ চোখে পড়লে।",
        },
        benefit: {
          en: "Blends invisibly with your natural enamel and bonds directly to strengthen remaining tooth structure.",
          bn: "কোনোভাবেই বোঝার উপায় থাকে না যে ফিলিং করা হয়েছে এবং দাঁতের নিজস্ব শক্তি অক্ষুণ্ণ থাকে।",
        },
      },
      {
        id: "gic-filling",
        number: 4,
        imageUrl: "/images/SubServices-images/3. 4. GIC (Glass Ionomer) Filling.png",
        name: {
          en: "GIC (Glass Ionomer) Filling",
          bn: "জিআইসি (গ্লাস আয়োনোমার) ফিলিং",
        },
        why: {
          en: "Biocompatible restorative material that naturally releases fluoride to stop further decay.",
          bn: "বিশেষ উপাদান যা স্বাভাবিকভাবেই ফ্লোরাইড নির্গত করে পুনরায় ক্যাভিটি হওয়া প্রতিরোধ করে।",
        },
        when: {
          en: "Root surface cavities, pediatric teeth, or non-stress-bearing zones near the gum margin.",
          bn: "দাঁতের গোড়ার ক্ষয় বা শিশুদের দুধ দাঁতের ক্ষয় পূরণে।",
        },
        benefit: {
          en: "Chemical adhesion to enamel and dentin, thermal compatibility, and continuous fluoride protection.",
          bn: "দাঁতের সাথে চমৎকারভাবে লেগে থাকে এবং দীর্ঘমেয়াদে পুনরায় ক্ষয় হওয়া থেকে সুরক্ষা দেয়।",
        },
      },
      {
        id: "inlay-onlay",
        number: 5,
        imageUrl: "/images/SubServices-images/3. 5. Inlay_Onlay Restoration.png",
        name: {
          en: "Inlay / Onlay Restoration",
          bn: "ইনলে / অনলে রিস্টোরেশন",
        },
        why: {
          en: "Lab-crafted ceramic pieces designed for teeth with damage too large for fillings but too healthy for crowns.",
          bn: "মাঝারি ধরনের ক্ষয়ের জন্য যেখানে সাধারণ ফিলিং টেকে না আবার পুরো ক্রাউনেরও প্রয়োজন হয় না।",
        },
        when: {
          en: "Substantial tooth cusp fracture or extensive decay where enamel preservation is paramount.",
          bn: "দাঁতের ওপরের চিবানোর অংশ বেশি ভেঙে গেলে কিন্তু বাকি দাঁত মজবুত থাকলে।",
        },
        benefit: {
          en: "Superior structural strength, perfect anatomical contacts, and exceptional long-term wear resistance.",
          bn: "সাধারণ ফিলিংয়ের চেয়ে কয়েকগুণ বেশি টেকসই এবং প্রাকৃতিক দাঁতের গঠন অক্ষুণ্ণ রাখে।",
        },
      },
      {
        id: "cracked-tooth",
        number: 6,
        imageUrl: "/images/SubServices-images/3. 6. Cracked Tooth Treatment.png",
        name: {
          en: "Cracked Tooth Treatment",
          bn: "ক্র্যাকড টুথ (ফাটা দাঁত) চিকিৎসা",
        },
        why: {
          en: "Diagnoses microscopic structural fissures before catastrophic tooth split occurs.",
          bn: "দাঁতের সূক্ষ্ম ফাটল শনাক্ত করে দাঁতটি দ্বিখণ্ডিত বা নষ্ট হয়ে যাওয়া থেকে বাঁচাতে।",
        },
        when: {
          en: "Sharp, intermittent pain when chewing tough foods or sudden sensitivity to cold fluids.",
          bn: "চিবানোর সময় হঠাৎ তীব্র খচখচে ব্যথা বা ঠান্ডা পানি খেলে বিদ্যুৎ চমকানোর মতো অনুভূতি হলে।",
        },
        benefit: {
          en: "Stabilizes the tooth structure early, preventing pulp death and saving the natural tooth.",
          bn: "ফাটলটি গভীরে ছড়ানোর আগেই দাঁতকে রক্ষা করে এবং রুট ক্যানেল বা দাঁত তোলার ঝামেলা এড়ায়।",
        },
      },
      {
        id: "apicoectomy",
        number: 7,
        imageUrl: "/images/SubServices-images/3. 7. Post & Core Build-Up.png",
        name: {
          en: "Apicoectomy (Root-End Surgery)",
          bn: "এপিসেক্টমি (শিকড়ের অগ্রভাগের মাইক্রো-সার্জারি)",
        },
        why: {
          en: "Surgically accesses and removes persistent infection located precisely at the tooth's root apex.",
          bn: "দাঁতের শিকড়ের শেষ প্রান্তে (এপেক্স) জমে থাকা দীর্ঘস্থায়ী ইনফেকশন বা সিস্ট মাইক্রো-সার্জারির মাধ্যমে দূর করতে।",
        },
        when: {
          en: "Infection persists after conventional root canal therapy and retreatment is not feasible.",
          bn: "রুট ক্যানেল করার পরও দাঁতের গোড়ায় সিস্ট বা পুঁজ থেকে গেলে।",
        },
        benefit: {
          en: "Direct surgical cure of apical infection, saving a valuable tooth that would otherwise need extraction.",
          bn: "দাঁতটি ফেলে না দিয়ে এর শিকড়ের রোগ সারিয়ে দীর্ঘকাল টিকিয়ে রাখার সুবর্ণ সুযোগ দেয়।",
        },
      },
      {
        id: "post-core",
        number: 8,
        imageUrl: "/images/SubServices-images/3. 8. Post & Core Build-Up.png",
        name: {
          en: "Post & Core Build-Up (After RCT)",
          bn: "পোস্ট অ্যান্ড কোর বিল্ড-আপ (আরসিটির পর)",
        },
        why: {
          en: "Reconstructs the internal core foundation of a heavily broken-down root-treated tooth.",
          bn: "রুট ক্যানেলের পর ভেঙে যাওয়া দাঁতে ক্রাউন বসানোর মতো মজবুত অভ্যন্তরীণ খুঁটি তৈরি করতে।",
        },
        when: {
          en: "When more than 50% of the natural crown structure is missing prior to crowning.",
          bn: "যখন দাঁতের ওপরের কাঠামোর বেশিরভাগ অংশ ক্ষয় বা ভেঙে নষ্ট হয়ে যায়।",
        },
        benefit: {
          en: "Anchors the upcoming crown securely, preventing crown dislodgement and root fractures.",
          bn: "ভবিষ্যতের ডেন্টাল ক্যাপ বা ক্রাউনকে আজীবনের জন্য মজবুত ভিত্তি প্রদান করে।",
        },
      },
      {
        id: "teeth-whitening",
        number: 9,
        imageUrl: "/images/SubServices-images/3. 9. Toothe whitening.png",
        name: {
          en: "Teeth Whitening / Bleaching",
          bn: "টিথ হোয়াইটেনিং / ব্লিচিং",
        },
        why: {
          en: "Brightens and safely eliminates intrinsic and extrinsic stains from tooth enamel.",
          bn: "দাঁতের উপরিভাগের জেদি হলদেটে ভাব ও দাগ দূর করে স্বাভাবিক উজ্জ্বলতা ফিরিয়ে আনতে।",
        },
        when: {
          en: "Yellowed or discolored teeth from coffee, tea, smoking, or natural aging before special events.",
          bn: "চা, কফি বা বয়সের কারণে দাঁত বিবর্ণ হলে অথবা হাসিকে ঝকঝকে করে তুলতে চাইলে।",
        },
        benefit: {
          en: "Noticeably brighter shade in a single safe clinical session, dramatically elevating smile aesthetics.",
          bn: "নিরাপদ ও আধুনিক পদ্ধতিতে এক সেশনেই কয়েক শেড উজ্জ্বল, আকর্ষণীয় ও উজ্জ্বল হাসি পাওয়া যায়।",
        },
      },
    ],
  },
  {
    id: "prosthodontics",
    slug: "prosthodontics",
    name: {
      en: "Prosthodontics",
      bn: "প্রস্থোডন্টিক্স",
    },
    shortDesc: {
      en: "Precision crowns, bridges, dentures, and dental implants to rebuild lost teeth.",
      bn: "হারানো দাঁতের নিখুঁত প্রতিস্থাপন — আধুনিক ক্রাউন, ব্রিজ, ডেনচার ও ইমপ্ল্যান্ট প্রস্থেসিস।",
    },
    iconName: "Sparkles",
    leadDoctorId: "dr-diean",
    imageUrl: "/images/services-images-for-7-services/Prosthodontics.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/04. Prosthodontics Cover banner.png",
    subServices: [
      {
        id: "dental-crowns",
        number: 1,
        imageUrl: "/images/SubServices-images/4. 1. Dental Crowns.png",
        name: {
          en: "Dental Crowns (Zirconia / Porcelain / PFM)",
          bn: "ডেন্টাল ক্রাউন (জিরকোনিয়া / পোরসেলিন / পিএফএম ক্যাপ)",
        },
        why: {
          en: "Encloses and protects a structurally compromised or root-treated tooth with a durable aesthetic cap.",
          bn: "দুর্বল বা রুট ক্যানেল করা দাঁতকে পুরোপুরি ঢেকে শক্তিশালী ও সুন্দর রূপ দিতে।",
        },
        when: {
          en: "Following RCT, large fractures, or severe tooth wear where full coverage protection is mandatory.",
          bn: "রুট ক্যানেলের পরে দাঁত যাতে ভেঙে না যায় অথবা দাঁতের অনেক অংশ ভেঙে গেলে।",
        },
        benefit: {
          en: "Restores chewing strength, matches original tooth anatomy, and ensures long-term longevity.",
          bn: "আসল দাঁতের সমান শক্তি নিয়ে স্বাভাবিক খাবার চিবানো যায় এবং দেখতে সম্পূর্ণ প্রাকৃতিক লাগে।",
        },
      },
      {
        id: "dental-bridges",
        number: 2,
        imageUrl: "/images/SubServices-images/4. 2. Dental Bridges.png",
        name: {
          en: "Dental Bridges",
          bn: "ডেন্টাল ব্রিজ",
        },
        why: {
          en: "Bridges the gap left by one or more missing teeth by anchoring to sound adjacent teeth.",
          bn: "পাশের সুস্থ দাঁতের সাপোর্ট নিয়ে মাঝে পড়ে যাওয়া এক বা একাধিক দাঁত স্থায়ীভাবে বসাতে।",
        },
        when: {
          en: "Missing teeth with strong, healthy adjacent natural teeth ready to act as abutments.",
          bn: "দাঁত পড়ে যাওয়ার পর পাশের দাঁত মজবুত থাকলে স্থায়ী কৃত্রিম দাঁত লাগানোর জন্য।",
        },
        benefit: {
          en: "Fixed non-removable solution, restores natural chewing balance, and stops teeth from tilting.",
          bn: "স্থায়ী ও না-খোলার সমাধান, সঠিকভাবে কথা বলা ও চিবানো নিশ্চিত করে এবং পাশের দাঁত হেলে যাওয়া ঠেকায়।",
        },
      },
      {
        id: "complete-dentures",
        number: 3,
        imageUrl: "/images/SubServices-images/4. 3. Complete Dentures.png",
        name: {
          en: "Complete Dentures (Full)",
          bn: "কমপ্লিট ডেনচার (সম্পূর্ণ বাঁধাই দাঁত)",
        },
        why: {
          en: "Replaces all missing teeth in the entire upper or lower dental arch.",
          bn: "উপরের বা নিচের সম্পূর্ণ চোয়ালের সবকটি হারানো দাঁত একসাথে প্রতিস্থাপন করতে।",
        },
        when: {
          en: "Complete tooth loss (edentulism) in one or both jaws.",
          bn: "চোয়ালের সব দাঁত পড়ে গেলে অথবা সবকটি দাঁত তুলে ফেলতে হলে।",
        },
        benefit: {
          en: "Restores facial structure support, speech clarity, and comfortable daily chewing capability.",
          bn: "মুখের স্বাভাবিক ফোলাভাব ও বলিরেখা দূর করে তারুণ্য ফিরিয়ে আনে এবং খাবার খাওয়া সহজ করে।",
        },
      },
      {
        id: "partial-dentures",
        number: 4,
        imageUrl: "/images/SubServices-images/4. 4.  Partial Dentures.png",
        name: {
          en: "Partial Dentures (Removable)",
          bn: "পার্শিয়াল ডেনচার (খোলার সুবিধাযুক্ত দাঁত)",
        },
        why: {
          en: "Replaces multiple missing teeth while securely resting around remaining natural teeth.",
          bn: "কিছু দাঁত পড়ে গেলে বাকি সুস্থ দাঁতগুলোর সাথে মানানসই করে খুলে পরার দাঁত তৈরি করতে।",
        },
        when: {
          en: "Several missing teeth where implants or fixed bridges are not immediately suitable.",
          bn: "একাধিক দাঁত না থাকলে কিন্তু কিছু ভালো দাঁত অবশিষ্ট থাকলে সাশ্রয়ী সমাধানে।",
        },
        benefit: {
          en: "Economical, easy to clean, comfortable, and quickly fabricated to restore your smile.",
          bn: "সবচেয়ে সাশ্রয়ী, সহজে পরিষ্কার করা যায় এবং দ্রুত আপনার হাসিকে পরিপূর্ণ করে তোলে।",
        },
      },
      {
        id: "implant-supported-crown",
        number: 5,
        imageUrl: "/images/SubServices-images/4. 5. Implant-Supported Crown.png",
        name: {
          en: "Implant-Supported Crown / Bridge",
          bn: "ইমপ্ল্যান্ট-সাপোর্টেড ক্রাউন ও ব্রিজ",
        },
        why: {
          en: "Fixes custom crowns directly onto healed titanium implants without trimming adjacent healthy teeth.",
          bn: "পাশের কোনো ভালো দাঁত না কেটে সরাসরি টাইটানিয়াম ইমপ্ল্যান্টের ওপর স্থায়ী ক্রাউন বসাতে।",
        },
        when: {
          en: "Single or multiple missing teeth with sufficient healed implant integration.",
          bn: "ইমপ্ল্যান্ট সার্জারির পর স্থায়ী ও সবচেয়ে শক্ত দাঁত সংযোজন করতে।",
        },
        benefit: {
          en: "Preserves adjacent natural teeth untouched and delivers the most lifelike dental restoration possible.",
          bn: "পাশের সুস্থ দাঁতের কোনো ক্ষতি হয় না এবং পুরোপুরি আসল দাঁতের মতোই অনুভূতি পাওয়া যায়।",
        },
      },
      {
        id: "implant-supported-denture",
        number: 6,
        imageUrl: "/images/SubServices-images/4.6. Implant-Supported Denture.png",
        name: {
          en: "Implant-Supported Denture (Overdenture)",
          bn: "ইমপ্ল্যান্ট-সাপোর্টেড ওভারডেনচার",
        },
        why: {
          en: "Locks a full denture firmly onto 2-4 dental implants using precision snap-on attachments.",
          bn: "কয়েকটি ইমপ্ল্যান্টের মাথায় স্ন্যাপ-লকের সাহায্যে সম্পূর্ণ ডেনচারকে চোয়ালে লক করে রাখতে।",
        },
        when: {
          en: "Loose, slipping full dentures causing irritation or difficulty speaking and chewing.",
          bn: "সাধারণ বাঁধানো দাঁত যদি নড়বড়ে হয়, খাবার খেতে গেলে খুলে আসে বা কথা বলতে সমস্যা হয়।",
        },
        benefit: {
          en: "Zero slipping or embarrassing dislodgement; restores up to 80% of original chewing power.",
          bn: "কথা বলা বা হাসার সময় খুলে পড়ার কোনো ভয় থাকে না এবং অত্যন্ত নিশ্চিন্তে সব খাবার চিবানো যায়।",
        },
      },
      {
        id: "veneers",
        number: 7,
        imageUrl: "/images/SubServices-images/4.7. Dental venners.png",
        name: {
          en: "Veneers (Porcelain / Composite)",
          bn: "ভিনিয়ার্স (পোরসেলিন / কম্পোজিট ভিনিয়ার)",
        },
        why: {
          en: "Ultra-thin, custom ceramic shells bonded to the front surface of anterior teeth.",
          bn: "সামনের দাঁতের উপরিভাগে পাতলা সুন্দর সিরামিক আস্তরণ লাগিয়ে মনকাড়া হাসি তৈরি করতে।",
        },
        when: {
          en: "Front teeth with persistent stains, micro-chips, irregular shapes, or small unsightly gaps.",
          bn: "সামনের দাঁতে হালকা ফাঁকা, সামান্য ভাঙা, দাগ বা অসম আকৃতি থাকলে।",
        },
        benefit: {
          en: "Hollywood-grade cosmetic transformation with minimal enamel modification.",
          bn: "খুব সামান্য এনামেল স্পর্শ করেই এক অনন্য, ঝকঝকে ও অত্যন্ত আকর্ষণীয় হাসি উপহার দেয়।",
        },
      },
      {
        id: "maxillofacial-prosthesis",
        number: 8,
        imageUrl: "/images/SubServices-images/4.8. Maxillofacial Prosthesis.png",
        name: {
          en: "Maxillofacial Prosthesis",
          bn: "ম্যাক্সিলোফেসিয়াল প্রস্থেসিস",
        },
        why: {
          en: "Reconstructs facial and oral anatomical defects resulting from cancer surgery or trauma.",
          bn: "ক্যান্সার সার্জারি বা বড় কোনো দুর্ঘটনায় মুখের কোনো অংশ নষ্ট হয়ে গেলে তা কৃত্রিমভাবে পুনর্গঠন করতে।",
        },
        when: {
          en: "Palatal defects, post-oncological resection, or congenital facial deformities.",
          bn: "তালুর ছিদ্র বা চোয়ালের বড় অংশ অপসারিত হওয়ার পর কথা ও খাওয়া স্বাভাবিক করতে।",
        },
        benefit: {
          en: "Restores basic functions like swallowing, speaking, and restores facial dignity and confidence.",
          bn: "কথা বলা ও খাবার গেলার মতো মৌলিক ক্ষমতা ফিরিয়ে রোগীর স্বাভাবিক জীবনযাত্রার মান বাড়ায়।",
        },
      },
    ],
  },
  {
    id: "pediatric",
    slug: "pediatric",
    name: {
      en: "Pediatric Dentistry",
      bn: "শিশু দন্ত চিকিৎসা (পেডিয়াট্রিক ডেন্টিস্ট্রি)",
    },
    shortDesc: {
      en: "Gentle, kid-friendly dental care building a lifetime of positive oral health habits.",
      bn: "শিশুদের জন্য কোমল ও ভয়হীন চিকিৎসা — ছোটবেলা থেকেই সুস্থ দাঁতের মজবুত ভিত্তি।",
    },
    iconName: "Baby",
    leadDoctorId: "dr-diean",
    imageUrl: "/images/services-images-for-7-services/Pediatric Dentistry.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/05. Pediatric Dentistry COver banner.png",
    subServices: [
      {
        id: "pulpotomy",
        number: 1,
        imageUrl: "/images/SubServices-images/5. 1. Pulpotomy.png",
        name: {
          en: "Pulpotomy",
          bn: "পাল্পোটমি (শিশুর প্রাথমিক আরসিটি)",
        },
        why: {
          en: "Removes coronal infected pulp while leaving healthy root pulp intact in baby teeth.",
          bn: "দুধ দাঁতের উপরিভাগের সংক্রমিত অংশ ফেলে দিয়ে সুস্থ শিকড়টিকে বাঁচিয়ে রাখতে।",
        },
        when: {
          en: "Deep decay reaches pulp chamber of a primary molar without affecting the root canal roots.",
          bn: "শিশুর দুধ দাঁতের গভীরে ক্ষয় পৌঁছে ব্যথা শুরু হলে কিন্তু শিকড় এখনো অক্ষত থাকলে।",
        },
        benefit: {
          en: "Relieves child's dental pain instantly and keeps the primary tooth safely until natural exfoliation.",
          bn: "শিশুকে দ্রুত ব্যথামুক্ত করে এবং প্রাকৃতিকভাবে নতুন দাঁত ওঠার সময় পর্যন্ত দুধ দাঁতটিকে ধরে রাখে।",
        },
      },
      {
        id: "pulpectomy",
        number: 2,
        imageUrl: "/images/SubServices-images/5. 2. Pulpectomy.png",
        name: {
          en: "Pulpectomy",
          bn: "পাল্পেক্টমি (শিশুর সম্পূর্ণ রুট ক্যানেল)",
        },
        why: {
          en: "Completely removes infected nerve tissue from crown and roots of primary teeth.",
          bn: "দুধ দাঁতের সম্পূর্ণ স্নায়ু ও শিকড় জীবাণুমুক্ত করে বিশেষ ওষুধ দিয়ে ভর্তি করতে।",
        },
        when: {
          en: "Chronic infection has spread into the baby tooth root canals, causing swelling or abscess.",
          bn: "যখন সংক্রমণ দুধ দাঁতের শিকড় পর্যন্ত ছড়িয়ে মাড়িতে পুঁজ বা তীব্র ফোলা সৃষ্টি করে।",
        },
        benefit: {
          en: "Prevents infection from damaging the developing permanent tooth bud resting right beneath it.",
          bn: "দুধ দাঁতের নিচে বেড়ে ওঠা স্থায়ী নতুন দাঁতের কুঁড়িকে ইনফেকশনের ক্ষতি থেকে পূর্ণ সুরক্ষা দেয়।",
        },
      },
      {
        id: "pediatric-extraction",
        number: 3,
        imageUrl: "/images/SubServices-images/5. 3. Pediatric Tooth Extraction.png",
        name: {
          en: "Pediatric Tooth Extraction",
          bn: "শিশুর দাঁত তোলা (পেডিয়াট্রিক এক্সট্রাকশন)",
        },
        why: {
          en: "Gently removes non-restorable, severely abscessed, or over-retained primary teeth.",
          bn: "বাঁচানো অসম্ভব এমন অতিরিক্ত ক্ষয়প্রাপ্ত বা নতুন দাঁত ওঠায় বাধা দেওয়া দুধ দাঁত তুলতে।",
        },
        when: {
          en: "Extensive destruction beyond repair or when permanent tooth is erupting behind baby tooth.",
          bn: "যখন নতুন দাঁত এসে গেলেও দুধ দাঁত পড়ছে না বা দাঁত মারাত্মকভাবে ইনফেক্টেড হয়ে গেছে।",
        },
        benefit: {
          en: "Pain-free gentle procedure clearing the pathway for healthy, unhindered permanent tooth eruption.",
          bn: "ভয়হীন ও ব্যথাহীন পরিবেশে দুধ দাঁত সরিয়ে স্থায়ী দাঁতের সঠিক অবস্থানে ওঠার পথ সুগম করে।",
        },
      },
      {
        id: "pit-fissure-sealants",
        number: 4,
        imageUrl: "/images/SubServices-images/5.4. Pit & Fissure Sealants.png",
        name: {
          en: "Pit & Fissure Sealants",
          bn: "পিট অ্যান্ড ফিশার সিল্যান্টস",
        },
        why: {
          en: "Applies a protective resin coating into the deep microscopic grooves of children's molars.",
          bn: "শিশুদের নতুন ওঠা মাড়ির দাঁতের গভীর খাঁজগুলোতে পাতলা প্রতিরক্ষামূলক প্রলেপ দিতে।",
        },
        when: {
          en: "Immediately after permanent molars erupt (ages 6 and 12) before cavities have a chance to form.",
          bn: "৬ থেকে ১২ বছর বয়সে নতুন স্থায়ী মাড়ির দাঁত ওঠার পর পরই ক্যাভিটি শুরুর আগে।",
        },
        benefit: {
          en: "Reduces cavity risk by over 80% in the most decay-prone biting surfaces of growing teeth.",
          bn: "খাবারের কণা আটকে থাকা বন্ধ করে দাঁতের ৮০ শতাংশেরও বেশি ক্যাভিটির ঝুঁকি চিরতরে কমিয়ে দেয়।",
        },
      },
      {
        id: "kids-space-maintainer",
        number: 5,
        imageUrl: "/images/SubServices-images/5. 5. Space Maintainers.png",
        name: {
          en: "Space Maintainers (Kids)",
          bn: "স্পেস মেইনটেইনার (শিশুদের)",
        },
        why: {
          en: "Custom appliance preserving the empty gap left when a baby molar is lost prematurely.",
          bn: "অকালে কোনো দুধ দাঁত পড়ে গেলে স্থায়ী দাঁতের জন্য নির্ধারিত ফাঁকা জায়গাটি ধরে রাখতে।",
        },
        when: {
          en: "Early extraction of primary teeth years before the permanent molar is scheduled to appear.",
          bn: "স্থায়ী দাঁত ওঠার বয়সের আগেই কোনো কারণে দুধ দাঁত ফেলে দিতে হলে।",
        },
        benefit: {
          en: "Prevents adjacent teeth from drifting into the space, preventing complex orthodontic problems.",
          bn: "পাশের দাঁত হেলে এসে জায়গা বন্ধ করে দেওয়া ঠেকায় এবং ভবিষ্যতের আঁকাবাঁকা দাঁত হওয়া রোধ করে।",
        },
      },
      {
        id: "habit-breaking",
        number: 6,
        imageUrl: "/images/SubServices-images/5.6. Habit-Breaking Appliances'.png",
        name: {
          en: "Habit-Breaking Appliances",
          bn: "অভ্যাস নিরোধক অ্যাপ্লায়েন্স (আঙুল চোষা বন্ধের ডিভাইস)",
        },
        why: {
          en: "Comfortable orthodontic appliance that gently helps children discontinue thumb-sucking or tongue-thrusting.",
          bn: "শিশুদের আঙুল চোষা বা অস্বাভাবিকভাবে জিভ ঠেলার ক্ষতিকর অভ্যাসটি সহজে ছাড়াতে।",
        },
        when: {
          en: "Prolonged habits persisting beyond ages 4-5 that are starting to deform the upper front teeth.",
          bn: "৪-৫ বছর বয়সের পরও যদি শিশু আঙুল চোষা চালিয়ে যায় এবং সামনের দাঁত উঁচু হতে থাকে।",
        },
        benefit: {
          en: "Prevents open bites, flared protruding teeth, and ensures normal palate bone development.",
          bn: "সামনের দাঁত উঁচু হয়ে যাওয়া ও তালুর হাড়ের অস্বাভাবিক পরিবর্তন স্থায়ীভাবে রোধ করে।",
        },
      },
      {
        id: "early-caries",
        number: 7,
        imageUrl: "/images/SubServices-images/5.7. Early Caries Management.png",
        name: {
          en: "Early Cavity / Caries Management",
          bn: "প্রাথমিক ক্যাভিটি ও ক্যারিজ চিকিৎসা",
        },
        why: {
          en: "Detects and arrests microscopic enamel demineralization before it develops into deep cavities.",
          bn: "দাঁতের ক্ষয় গভীরে পৌঁছানোর আগেই একদম প্রাথমিক পর্যায়ে শনাক্ত করে থামিয়ে দিতে।",
        },
        when: {
          en: "White spot lesions or microscopic surface enamel roughness spotted during routine dental exam.",
          bn: "নিয়মিত চেকআপের সময় দাঁতের ওপর সাদাটে ছোপ বা সূক্ষ্ম ক্ষয়ের চিহ্ন দেখা দিলে।",
        },
        benefit: {
          en: "Non-invasive remineralization avoiding dental drill, pain, and extensive future fillings.",
          bn: "কোনো ড্রিল বা ব্যথা ছাড়াই দাঁতকে আবার খনিজসমৃদ্ধ ও সুস্থ করে তোলা যায়।",
        },
      },
      {
        id: "child-checkup",
        number: 8,
        imageUrl: "/images/SubServices-images/5.8. Child Dental Check-up & Preventive Counselling.png",
        name: {
          en: "Child Dental Check-up & Preventive Counselling",
          bn: "শিশু দন্ত চেকআপ ও প্রতিরোধমূলক কাউন্সেলিং",
        },
        why: {
          en: "Routine comprehensive assessment fostering a warm, friendly relationship between child and dentist.",
          bn: "শিশুর মুখের গঠন ও দাঁতের বৃদ্ধি পর্যবেক্ষণ এবং ডাক্তারের সাথে একটি বন্ধুত্বপূর্ণ সম্পর্ক গড়তে।",
        },
        when: {
          en: "Every 6 months beginning with the eruption of the very first primary tooth.",
          bn: "প্রথম দাঁত ওঠার পর থেকেই প্রতি ৬ মাসে একবার রুটিন চেকআপের জন্য।",
        },
        benefit: {
          en: "Builds a lifetime without dental fear, early detection of issues, and bespoke dietary guidance.",
          bn: "শিশুর মনের ভেতর থেকে ডাক্তারের ভয় চিরতরে দূর হয় এবং সঠিক ব্রাশ করার অভ্যাস গড়ে ওঠে।",
        },
      },
      {
        id: "pediatric-trauma",
        number: 9,
        imageUrl: "/images/SubServices-images/5.9. Dental Trauma Management.png",
        name: {
          en: "Dental Trauma Management (Kids)",
          bn: "শিশুর দাঁতে আঘাতজনিত জরুরি চিকিৎসা",
        },
        why: {
          en: "Immediate emergency care for chipped, loosened, intruded, or knocked-out primary or permanent teeth.",
          bn: "খেলাধুলা বা পড়ে গিয়ে শিশুর দাঁত ভেঙে গেলে, নড়ে গেলে বা পড়ে গেলে জরুরি চিকিৎসায়।",
        },
        when: {
          en: "Immediately following any playground fall, sports impact, or accidental facial injury.",
          bn: "দুর্ঘটনার পর যত দ্রুত সম্ভব, বিশেষ করে প্রথম ১-২ ঘণ্টার মধ্যে নিয়ে আসা জরুরি।",
        },
        benefit: {
          en: "Gives maximum likelihood of saving the tooth and prevents nerve necrosis or permanent tooth damage.",
          bn: "দ্রুত চিকিৎসার মাধ্যমে দাঁতটি নষ্ট হওয়া থেকে বাঁচানোর সর্বোচ্চ সুযোগ তৈরি হয়।",
        },
      },
    ],
  },
  {
    id: "periodontics",
    slug: "periodontics",
    name: {
      en: "Periodontics",
      bn: "পেরিওডন্টিক্স (মাড়ির চিকিৎসা)",
    },
    shortDesc: {
      en: "Protecting the foundation of your smile — advanced gum care, scaling, and mobile tooth splinting.",
      bn: "আপনার হাসির মজবুত ভিত্তি — মাড়ির আধুনিক চিকিৎসা, স্কেলিং ও নড়বড়ে দাঁতের স্প্লিন্টিং।",
    },
    iconName: "Activity",
    leadDoctorId: "dr-sanwar",
    imageUrl: "/images/services-images-for-7-services/Periodontics.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/06. Periodontics Cover banner.png",
    subServices: [
      {
        id: "scaling-polishing",
        number: 1,
        imageUrl: "/images/SubServices-images/6. 1. Scaling & Polishing (Cleaning).jpeg",
        name: {
          en: "Scaling & Polishing (Cleaning)",
          bn: "স্কেলিং ও পলিশিং (দাঁতের পেশাদার ক্লিনিং)",
        },
        why: {
          en: "Ultrasonically removes hardened calculus and bacterial plaque deposits unreachable by toothbrush.",
          bn: "ব্রাশ দিয়ে পরিষ্কার হয় না এমন পাথুরে প্লাক ও জেদি টারটার আল্ট্রাসনিক পদ্ধতিতে দূর করতে।",
        },
        when: {
          en: "Recommended every 6 months for all adults or whenever yellowish tartar buildup and bleeding occurs.",
          bn: "প্রতি ৬ মাসে একবার অথবা দাঁতের গোড়ায় পাথর ও মাড়ি থেকে রক্ত পড়ার মতো লক্ষণ দেখা দিলে।",
        },
        benefit: {
          en: "Stops gingivitis immediately, eliminates bad breath, and leaves teeth smooth and refreshed.",
          bn: "মাড়ি ফোলা ও রক্ত পড়া বন্ধ করে, মুখের দুর্গন্ধ দূর করে এবং দাঁতকে সতেজ ও চকচকে করে।",
        },
      },
      {
        id: "deep-cleaning",
        number: 2,
        imageUrl: "/images/SubServices-images/6.2. Deep Cleaning _ Root Planing.png",
        name: {
          en: "Deep Cleaning / Root Planing",
          bn: "ডিপ ক্লিনিং / রুট প্ল্যানিং",
        },
        why: {
          en: "Cleans and smoothens root surfaces below the gumline to eradicate deep bacterial colonies.",
          bn: "মাড়ির ভেতরের গভীর অংশ ও দাঁতের শিকড় মসৃণ করে ক্ষতিকর ব্যাকটেরিয়া চিরতরে দূর করতে।",
        },
        when: {
          en: "Pocket depths over 4mm, chronic bleeding, gum recession, or moderate periodontitis.",
          bn: "মাড়ি থেকে নিয়মিত রক্ত পড়লে, মাড়ি নিচে নেমে গেলে বা পকেট তৈরি হলে।",
        },
        benefit: {
          en: "Halts progressive bone loss, allows inflamed gums to reattach snugly to the tooth root.",
          bn: "চোয়ালের হাড়ের ক্ষয় বন্ধ করে এবং মাড়ি আবার শক্তভাবে দাঁতের শিকড়কে জড়িয়ে ধরে।",
        },
      },
      {
        id: "periodontitis-treatment",
        number: 3,
        imageUrl: "/images/SubServices-images/6. 3. Gum Disease.png",
        name: {
          en: "Gum Disease (Periodontitis) Treatment",
          bn: "উন্নত মাড়ির রোগ (পেরিওডন্টাইটিস) চিকিৎসা",
        },
        why: {
          en: "Comprehensive therapy targeting destructive microbial infection destroying supportive alveolar bone.",
          bn: "দাঁতের ভিত্তি নষ্ট করে দেওয়া জটিল মাড়ির ইনফেকশন নির্মূল করতে।",
        },
        when: {
          en: "Teeth beginning to loosen, shifting positions, foul taste, or recurring gum abscesses.",
          bn: "দাঁত আলগা হয়ে নড়তে শুরু করলে, মুখে তিক্ত স্বাদ থাকলে বা দাঁতের ফাঁক বেড়ে গেলে।",
        },
        benefit: {
          en: "Saves teeth from irreversible loosening and extraction, stabilizing your oral foundation.",
          bn: "দাঁত পড়ে যাওয়া রোধ করে এবং মাড়ি ও চোয়ালের হাড়কে আরও ক্ষয় হওয়া থেকে রক্ষা করে।",
        },
      },
      {
        id: "gum-contouring",
        number: 4,
        imageUrl: "/images/SubServices-images/6. 4. Gummy Smile Correction.png",
        name: {
          en: "Gum Contouring / Gummy Smile Correction",
          bn: "গাম কনট্যুরিং / গামি স্মাইল সংশোধন",
        },
        why: {
          en: "Sculpts excessive or asymmetrical gum tissue using precise dental lasers/surgical techniques.",
          bn: "হাসার সময় অতিরিক্ত মাড়ি দেখা গেলে তা সমান ও নিখুঁতভাবে রিশেপ করতে।",
        },
        when: {
          en: "Excessive gingival display making teeth appear unusually short or an uneven gumline.",
          bn: "হাসলে দাঁতের চেয়ে মাড়ি বেশি দেখা গেলে এবং দাঁতগুলো খাটো মনে হলে।",
        },
        benefit: {
          en: "Unveils ideal tooth proportions and symmetry, transforming the balance of your entire smile.",
          bn: "দাঁতগুলোকে সুন্দর অনুপাতে প্রকাশ করে এক আকর্ষণীয়, সুষম ও আত্মবিশ্বাসী হাসি এনে দেয়।",
        },
      },
      {
        id: "flap-surgery",
        number: 5,
        imageUrl: "/images/SubServices-images/6. 5. Flap Surgery.png",
        name: {
          en: "Flap Surgery",
          bn: "ফ্ল্যাপ সার্জারি",
        },
        why: {
          en: "Gently reflects gum tissue back to clean deep bone defects and recontour diseased bone.",
          bn: "মাড়ির টিস্যু সামান্য সরিয়ে হাড়ের গভীরে জমে থাকা সংক্রমণ পরিষ্কার ও হাড়ের গঠন ঠিক করতে।",
        },
        when: {
          en: "Severe periodontitis with deep periodontal pockets unresponsive to regular root planing.",
          bn: "গভীর মাড়ির পকেট যখন সাধারণ ক্লিনিংয়ে ভালো হয় না এবং হাড়ের ক্ষয় বাড়তে থাকে।",
        },
        benefit: {
          en: "Significantly reduces pocket depths, enabling easy lifelong home oral hygiene maintenance.",
          bn: "পকেটের গভীরতা কমিয়ে দেয় ফলে দাঁত পরিষ্কার রাখা সহজ হয় এবং দাঁতের আয়ু বাড়ে।",
        },
      },
      {
        id: "gum-grafting",
        number: 6,
        imageUrl: "/images/SubServices-images/6. 6. Gum Grafting.png",
        name: {
          en: "Gum Grafting",
          bn: "গাম গ্রাফটিং (মাড়ি প্রতিস্থাপন)",
        },
        why: {
          en: "Replaces lost gum tissue to cover exposed roots and rebuild protective keratinized gingiva.",
          bn: "মাড়ি সরে গিয়ে বেরিয়ে আসা দাঁতের শিকড়কে নতুন টিস্যু দিয়ে ঢেকে সুরক্ষা দিতে।",
        },
        when: {
          en: "Severe gum recession causing acute thermal sensitivity or unpleasantly elongated tooth appearance.",
          bn: "মাড়ি শুকিয়ে দাঁতের গোড়া বের হয়ে গেলে এবং ঠান্ডা বা বাতাসে তীব্র শিরশির করলে।",
        },
        benefit: {
          en: "Permanently halts root decay and sensitivity while restoring a youthful, healthy gumline.",
          bn: "দাঁতের শিকড়ের ক্ষয় ও শিরশিরানি চিরতরে দূর করে এবং মাড়ির প্রাকৃতিক সৌন্দর্য ফেরায়।",
        },
      },
      {
        id: "crown-lengthening",
        number: 7,
        imageUrl: "/images/SubServices-images/6. 7. Crown Lengthening.png",
        name: {
          en: "Crown Lengthening",
          bn: "ক্রাউন লেংথেনিং (দাঁতের দৃশ্যমান অংশ বাড়ানো)",
        },
        why: {
          en: "Reshapes gum and bone margins to expose greater sound natural tooth structure.",
          bn: "মাড়ির লেভেল সামান্য নামিয়ে দাঁতের প্রয়োজনীয় অংশ প্রকাশ করতে।",
        },
        when: {
          en: "When a tooth is broken below the gumline and needs adequate room for crown placement.",
          bn: "দাঁত মাড়ির নিচে ভেঙে গেলে যাতে ক্যাপ বা ক্রাউন ঠিকমতো বসানো সম্ভব হয়।",
        },
        benefit: {
          en: "Provides the biological width necessary to secure long-lasting crowns without chronic gum irritation.",
          bn: "পরবর্তী ক্রাউনকে যথাযথ ফিটিং দেয় এবং মাড়িতে ইনফেকশন হওয়া থেকে সুরক্ষা জোগায়।",
        },
      },
      {
        id: "halitosis-management",
        number: 8,
        imageUrl: "/images/SubServices-images/6. 8. Bad Breath (Halitosis) Management.png",
        name: {
          en: "Bad Breath (Halitosis) Management",
          bn: "মুখের দুর্গন্ধ (হ্যালিটোসিস) চিকিৎসা",
        },
        why: {
          en: "Identifies and eradicates volatile sulfur compounds produced by deep intraoral anaerobic bacteria.",
          bn: "মুখের গভীর খাঁজ ও মাড়ির মধ্যে থাকা ক্ষতিকর দুর্গন্ধ সৃষ্টিকারী ব্যাকটেরিয়া ধ্বংস করতে।",
        },
        when: {
          en: "Chronic bad breath that persists despite regular home brushing, mouthwash, and flossing.",
          bn: "নিয়মিত ব্রাশ করা সত্ত্বেও যদি মুখে অস্বস্তিকর গন্ধ থেকেই যায়।",
        },
        benefit: {
          en: "Targets the true biological root cause rather than masking symptoms, restoring fresh social confidence.",
          bn: "শুধু মুখ ধোয়ার ওষুধ দিয়ে সাময়িক ঢেকে না রেখে মূল কারণ দূর করে দীর্ঘমেয়াদী সতেজতা দেয়।",
        },
      },
      {
        id: "mobile-teeth-splinting",
        number: 9,
        imageUrl: "/images/SubServices-images/6. 9. Management of Mobile Teeth by Splinting.png",
        name: {
          en: "Management of Mobile Teeth by Splinting",
          bn: "স্প্লিন্টিং দ্বারা নড়বড়ে দাঁতের চিকিৎসা",
        },
        why: {
          en: "Bonds adjacent loose teeth together using specialized aesthetic fibers or composite splints.",
          bn: "মাড়ির দুর্বলতায় নড়বড়ে হয়ে যাওয়া দাঁতগুলোকে পাশের সুস্থ দাঁতের সাথে ফাইবার দিয়ে বেঁধে মজবুত করতে।",
        },
        when: {
          en: "Teeth become noticeably loose due to periodontal bone loss or secondary trauma.",
          bn: "পেরিওডন্টাল কারণে বা কোনো আঘাতে দাঁত অস্বাভাবিকভাবে নড়তে শুরু করলে।",
        },
        benefit: {
          en: "Provides immediate mechanical stability, relieves chewing discomfort, and prevents premature tooth loss.",
          bn: "দাঁতের নড়াচড়া বন্ধ করে আরামদায়কভাবে খাবার খাওয়ার শক্তি ফেরায় এবং দাঁত অকালে পড়ে যাওয়া ঠেকায়।",
        },
      },
    ],
  },
  {
    id: "oral-medicine",
    slug: "oral-medicine",
    name: {
      en: "Oral Medicine & Diagnosis",
      bn: "ওরাল মেডিসিন ও ডায়াগনোসিস",
    },
    shortDesc: {
      en: "Specialist diagnosis for oral ulcers, precancerous lesions, OSMF, and complex mucosal conditions.",
      bn: "মুখের ঘা, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ ও জটিল মিউকোসাল রোগের বিশেষজ্ঞ চিকিৎসা ও রোগ নির্ণয়।",
    },
    iconName: "Microscope",
    leadDoctorId: "dr-rifat",
    imageUrl: "/images/services-images-for-7-services/ORAL Medicine.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/07. Oral Medicine & Diagnosis Cover Banner.png",
    subServices: [
      {
        id: "oral-cancer-screening-diagnosis",
        number: 1,
        imageUrl: "/images/SubServices-images/7. 1. Oral Cancer Screening & Diagnosis.png",
        name: {
          en: "Oral Cancer Screening & Diagnosis",
          bn: "ওরাল ক্যান্সার স্ক্রিনিং ও ডায়াগনোসিস",
        },
        why: {
          en: "Identifies potentially malignant oral lesions and early cellular changes before they spread.",
          bn: "ক্যান্সার হওয়ার মতো অস্বাভাবিক কোষ ও মুখের ক্ষতের লক্ষণ শুরুতেই নিশ্চিতভাবে শনাক্ত করতে।",
        },
        when: {
          en: "Persistent non-healing ulcers, persistent red or white patches, or regular screening for tobacco/betel nut users.",
          bn: "দুই সপ্তাহের বেশি না-সারা ঘা, তামাক বা জর্দা খাওয়ার অভ্যাস থাকলে কিংবা মুখে লাল-সাদা দাগ দেখা দিলে।",
        },
        benefit: {
          en: "Life-saving early detection with high curability and non-invasive initial screening protocols.",
          bn: "প্রাথমিক পর্যায়ে শনাক্ত হলে প্রায় শতভাগ সফল নিরাময় সম্ভব এবং জীবন রক্ষা পায়।",
        },
      },
      {
        id: "precancerous-lesion-management",
        number: 2,
        imageUrl: "/images/SubServices-images/7. 2. Precancerous Lesion Management (Leukoplakia, Erythroplakia).png",
        name: {
          en: "Precancerous Lesion Management (Leukoplakia, Erythroplakia)",
          bn: "প্রিক্যান্সারাস ক্ষত চিকিৎসা (লিউকোপ্লাকিয়া ও এরিথ্রোপ্লাকিয়া)",
        },
        why: {
          en: "Treats and closely monitors mucosal white and red patches that carry a risk of turning into oral cancer.",
          bn: "মুখে দেখা দেওয়া সাদা বা লালচে দাগ যা ভবিষ্যতে ক্যান্সারে রূপ নেওয়ার ঝুঁকি রাখে, তার সঠিক চিকিৎসা ও পর্যবেক্ষণ করতে।",
        },
        when: {
          en: "Rough or raised white patches (leukoplakia) or velvety red lesions (erythroplakia) in the oral cavity.",
          bn: "জিহ্বা, গালের ভেতর বা তালুতে খসখসে সাদাটে ছোপ বা লালচে দাগ দীর্ঘ সময় ধরে বিদ্যমান থাকলে।",
        },
        benefit: {
          en: "Halts malignant transformation through tailored medical therapies, risk cessation, and expert surveillance.",
          bn: "সময়মতো চিকিৎসার মাধ্যমে ক্যান্সার হওয়ার ঝুঁকি পুরোপুরি বন্ধ করা যায় এবং জটিল অপারেশন এড়ানো যায়।",
        },
      },
      {
        id: "osmf-management",
        number: 3,
        imageUrl: "/images/SubServices-images/7. 3. Oral Submucous Fibrosis (OSMF) Management.png",
        name: {
          en: "Oral Submucous Fibrosis (OSMF) Management",
          bn: "ওরাল সাবমিউকাস ফাইব্রোসিস (ওএসএমএফ) চিকিৎসা",
        },
        why: {
          en: "Reverses progressive stiffening and burning sensation in mouth lining typically caused by areca nut/betel quid chewing.",
          bn: "সুপারি বা জর্দা খাওয়ার কারণে মুখের ভেতরের চামড়া শক্ত হয়ে যাওয়া এবং মুখ খুলতে না পারার সমস্যা দূর করতে।",
        },
        when: {
          en: "Difficulty opening the mouth fully, severe burning sensation when eating spicy foods, or blanching of inner cheeks.",
          bn: "ঝাল খেলে অতিরিক্ত জ্বালাপোড়া হওয়া এবং আস্তে আস্তে স্বাভাবিকভাবে মুখ খোলার ক্ষমতা কমে গেলে।",
        },
        benefit: {
          en: "Improves mouth opening span, alleviates burning discomfort, and drastically lowers oral malignancy risk.",
          bn: "মুখের স্বাভাবিক খোলার পরিধি বাড়ায়, জ্বালাপোড়া কমায় এবং দীর্ঘমেয়াদী ক্যান্সারের ঝুঁকি কমিয়ে দেয়।",
        },
      },
      {
        id: "recurrent-oral-ulcers",
        number: 4,
        imageUrl: "/images/SubServices-images/7. 4. Recurrent Oral Ulcer _ Aphthous Ulcer Management.png",
        name: {
          en: "Recurrent Oral Ulcer / Aphthous Ulcer Management",
          bn: "বারবার হওয়া মুখের ঘা বা অ্যাপথাস আলসার চিকিৎসা",
        },
        why: {
          en: "Addresses the underlying systemic, immune, or nutritional root causes of painful, recurring mouth sores.",
          bn: "বারবার মুখের ঘা হওয়ার আসল কারণ (ইমিউন, পুষ্টির ঘাটতি বা মানসিক চাপ) শনাক্ত করে দীর্ঘস্থায়ী মুক্তি দিতে।",
        },
        when: {
          en: "Frequent episodes of painful blisters or ulcers on tongue, lips, or cheeks interfering with eating and talking.",
          bn: "নিয়মিত ঠোঁটের ভেতরের অংশ, জিহ্বা বা মাড়িতে তীব্র যন্ত্রণাদায়ক ঘা হয়ে খাওয়া-দাওয়া কষ্টকর হলে।",
        },
        benefit: {
          en: "Rapid pain reduction, accelerated mucosal healing, and significant reduction in recurrence frequency.",
          bn: "দ্রুত ব্যথাহীন আরাম এনে দেয়, দ্রুত ঘা শুকায় এবং বারবার ঘা ফিরে আসার প্রবণতা বন্ধ করে।",
        },
      },
      {
        id: "oral-lichen-planus",
        number: 5,
        imageUrl: "/images/SubServices-images/7. 5. Oral Lichen Planus & Mucosal Lesion Management.png",
        name: {
          en: "Oral Lichen Planus & Mucosal Lesion Management",
          bn: "ওরাল লাইকেন প্ল্যানাস ও মিউকোসাল ক্ষত চিকিৎসা",
        },
        why: {
          en: "Manages chronic inflammatory autoimmune conditions causing painful lacy white streaks and erosions in oral mucosa.",
          bn: "শরীরের রোগ প্রতিরোধ ক্ষমতার ভারসাম্যহীনতায় মুখে হওয়া দীর্ঘমেয়াদী জ্বালাপোড়া ও জালিকার মতো দাগ নিরাময় করতে।",
        },
        when: {
          en: "Lacy white patterns, redness, soreness, or burning in inner cheeks or gums while brushing or eating.",
          bn: "গালের ভেতরে সাদা সূক্ষ্ম রেখা, তীব্র সংবেদনশীলতা কিংবা কোনো কিছু খাওয়ার সময় মাড়ি বা গাল জ্বলে উঠলে।",
        },
        benefit: {
          en: "Sustained remission of painful symptoms, prevention of erosive ulcers, and expert long-term mucosal care.",
          bn: "জ্বালা-যন্ত্রণা দূর করে দীর্ঘস্থায়ী আরাম দেয় এবং মাড়ি ও মুখের ভেতরের চামড়ার গভীর ক্ষয় রোধ করে।",
        },
      },
      {
        id: "burning-mouth-syndrome",
        number: 6,
        imageUrl: "/images/SubServices-images/7. 6. Burning Mouth Syndrome Management.png",
        name: {
          en: "Burning Mouth Syndrome Management",
          bn: "বার্নিং মাউথ সিন্ড্রোম (মুখে তীব্র জ্বালাপোড়া) চিকিৎসা",
        },
        why: {
          en: "Comprehensive neurological and mucosal workup to resolve mysterious, persistent oral scalding sensations.",
          bn: "কোনো দৃশ্যমান ঘা ছাড়াই জিহ্বা বা পুরো মুখে দীর্ঘস্থায়ী গরম বা পোড়ার মতো অনুভূতি দূর করার চিকিৎসায়।",
        },
        when: {
          en: "Constant burning sensation on tongue, lips, or roof of mouth without visible wounds, often with altered taste.",
          bn: "জিহ্বা বা তালুতে সারাক্ষণ গরম ছ্যাঁকা লাগার মতো জ্বালা, স্বাদ পরিবর্তন বা মুখে শুষ্কতা অনুভূত হলে।",
        },
        benefit: {
          en: "Targeted multi-modal relief restoring normal sensory comfort and dietary enjoyment.",
          bn: "যথাযথ চিকিৎসার মাধ্যমে অস্বস্তিকর জ্বালাপোড়া থেকে মুক্তি মেলে এবং স্বাচ্ছন্দ্যে স্বাভাবিক খাবারে ফেরা যায়।",
        },
      },
      {
        id: "oral-biopsy-consultation",
        number: 7,
        imageUrl: "/images/SubServices-images/7.7. Oral Biopsy & Diagnostic Consultation.png",
        name: {
          en: "Oral Biopsy & Diagnostic Consultation",
          bn: "ওরাল বায়োপসি ও ডায়াগনস্টিক কনসালটেশন",
        },
        why: {
          en: "Microscopic histopathological analysis to establish a definitive diagnosis for unresolved oral lesions.",
          bn: "মুখের সন্দেহজনক বা দীর্ঘস্থায়ী কোনো ক্ষতের আসল কারণ মাইক্রোস্কোপিক পরীক্ষার মাধ্যমে নিশ্চিত করতে।",
        },
        when: {
          en: "Unexplained oral swellings, lumps, non-healing ulcers, or mucosal color changes unresponsive to routine medications.",
          bn: "ওষুধ খাওয়ার পরও ঘা ভালো না হলে, মুখে ফোলাভাব বা অস্বাভাবিক মাংসপিণ্ড দেখা দিলে।",
        },
        benefit: {
          en: "Gold-standard diagnosis with total clinical clarity, guiding the most precise medical or surgical roadmap.",
          bn: "রোগের সঠিক ধরন শতভাগ নিশ্চিত করে এবং অপ্রয়োজনীয় বিভ্রান্তি দূর করে নির্ভুল চিকিৎসার পথ দেখায়।",
        },
      },
      {
        id: "oral-manifestations-systemic",
        number: 8,
        imageUrl: "/images/SubServices-images/7.8. Oral Manifestations of Systemic Disease Management.png",
        name: {
          en: "Oral Manifestations of Systemic Disease Management",
          bn: "শারীরিক জটিল রোগজনিত মুখের সমস্যার সমন্বিত চিকিৎসা",
        },
        why: {
          en: "Diagnoses and co-manages oral complications arising from diabetes, anemia, autoimmune conditions, or medications.",
          bn: "ডায়াবেটিস, রক্তশূন্যতা, লিভার বা কিডনির রোগ এবং দীর্ঘমেয়াদী ওষুধের পার্শ্বপ্রতিক্রিয়ায় মুখে হওয়া সমস্যার চিকিৎসায়।",
        },
        when: {
          en: "Unusual oral symptoms occurring in tandem with general medical health conditions or drug therapies.",
          bn: "সাধারণ শারীরিক অসুস্থতার সাথে মিলিয়ে মুখে বারবার ইনফেকশন, মাড়ির ঘা বা অপ্রত্যাশিত পরিবর্তন ঘটলে।",
        },
        benefit: {
          en: "Holistic care coordinating with your physicians to ensure both mouth and body heal together.",
          bn: "মূল শারীরিক রোগের সাথে সমন্বয় করে চিকিৎসা দেওয়ায় মুখের কষ্ট দ্রুত দূর হয় এবং সার্বিক স্বাস্থ্য উন্নত হয়।",
        },
      },
      {
        id: "salivary-gland-disorders",
        number: 9,
        imageUrl: "/images/SubServices-images/7.9. Salivary Gland Disorder.png",
        name: {
          en: "Salivary Gland Disorder Consultation (Dry Mouth / Xerostomia)",
          bn: "লালাগ্রন্থির সমস্যা ও মুখ শুকিয়ে যাওয়া (জেরোস্টোমিয়া) চিকিৎসা",
        },
        why: {
          en: "Investigates salivary gland dysfunction, stones, infections, and debilitating chronic dry mouth conditions.",
          bn: "লালাগ্রন্থিতে পাথর, ইনফেকশন বা লালা তৈরি কমে গিয়ে মুখ শুকিয়ে যাওয়ার সমস্যা প্রতিকার করতে।",
        },
        when: {
          en: "Severe mouth dryness, difficulty swallowing dry foods, salivary gland swelling while eating, or recurrent pain.",
          bn: "মুখ অতিরিক্ত শুকিয়ে কাঠ হয়ে থাকা, গিলতে কষ্ট হওয়া বা খাবার খাওয়ার সময় চোয়ালের নিচে ফুলে উঠলে।",
        },
        benefit: {
          en: "Restores comfortable saliva flow, prevents rapid rampant tooth decay, and eliminates swallowing distress.",
          bn: "মুখে স্বাভাবিক লালা প্রবাহ ফিরিয়ে আনে, দাঁতের দ্রুত ক্ষয় রোধ করে এবং আরামে খাওয়া ও কথা বলার সুযোগ দেয়।",
        },
      },
      {
        id: "complex-oral-diagnosis",
        number: 10,
        imageUrl: "/images/SubServices-images/7.10. Second Opinion _ Complex Oral Diagnosis Consultation.png",
        name: {
          en: "Second Opinion / Complex Oral Diagnosis Consultation",
          bn: "জটিল ওরাল রোগের দ্বিতীয় মতামত (সেকেন্ড ওপিনিয়ন) ও পরামর্শ",
        },
        why: {
          en: "Offers advanced specialist evaluation for rare, perplexing, or longstanding oral mucosal conditions.",
          bn: "দীর্ঘদিন চিকিৎসা নিয়েও না সারা বা শনাক্ত না হওয়া মুখের জটিল ও দুর্লভ সমস্যায় অভিজ্ঞ বিশেষজ্ঞের মতামত নিতে।",
        },
        when: {
          en: "Conflicting diagnoses from multiple clinics, unresolved oral symptoms, or before undergoing extensive oral surgery.",
          bn: "রোগ নির্ণয়ে সংশয় থাকলে, আগে নেওয়া চিকিৎসায় ফল না পেলে কিংবা বড় কোনো সার্জারির সিদ্ধান্ত নেওয়ার আগে।",
        },
        benefit: {
          en: "Unbiased, highly qualified specialist assessment providing peace of mind and the correct treatment direction.",
          bn: "আন্তর্জাতিক প্রশিক্ষণপ্রাপ্ত বিশেষজ্ঞের সুচিন্তিত পরামর্শ যা রোগীকে সঠিক চিকিৎসাপদ্ধতি বেছে নেওয়ার পূর্ণ আস্থা দেয়।",
        },
      },
    ],
  },
  {
    id: "general-consultation",
    slug: "general-consultation",
    name: {
      en: "General & Consultation",
      bn: "জেনারেল ও কনসালটেশন",
    },
    shortDesc: {
      en: "Your first step — comprehensive check-ups, digital X-rays, 3D scanning, and emergency care.",
      bn: "চিকিৎসার প্রথম ধাপ — পূর্ণাঙ্গ ওরাল চেকআপ, ডিজিটাল এক্স-রে, থ্রিডি স্ক্যান ও জরুরি সেবা।",
    },
    iconName: "FileCheck",
    leadDoctorId: "dr-diean",
    imageUrl: "/images/services-images-for-7-services/Consultation.jpeg",
    coverBannerUrl: "/images/Service-page-banner-cover/08. General Consultation & Diagnostics Cover banner.png",
    subServices: [
      {
        id: "general-checkup",
        number: 1,
        imageUrl: "/images/SubServices-images/8.1 General Dental Check-up & Consultation.jpeg",
        name: {
          en: "General Dental Check-up & Consultation",
          bn: "জেনারেল ডেন্টাল চেকআপ ও কনসালটেশন",
        },
        why: {
          en: "Comprehensive assessment of entire oral health, mucosal screening, and personalized care plan.",
          bn: "মুখের সামগ্রিক স্বাস্থ্য, দাঁত ও মাড়ি নিখুঁতভাবে পরীক্ষা করে সঠিক চিকিৎসার দিকনির্দেশনা পেতে।",
        },
        when: {
          en: "Every 6 months for preventative wellness, or as your first introductory visit to KGH Dental.",
          bn: "প্রতি ৬ মাসে একবার রুটিন পরীক্ষার জন্য বা নতুন রোগী হিসেবে প্রথমবার আসার সময়।",
        },
        benefit: {
          en: "Discovers hidden issues in early painless stages, saving you from complex, costly procedures later.",
          bn: "কোনো সমস্যা বড় হওয়ার আগেই শনাক্ত করা যায়, ফলে ভবিষ্যতের বড় ঝামেলা ও খরচ বাঁচে।",
        },
      },
      {
        id: "digital-xray-opg",
        number: 2,
        imageUrl: "/images/SubServices-images/8. 2, Digital X-Ray.png",
        name: {
          en: "Digital X-Ray / OPG (Panoramic Radiography)",
          bn: "ডিজিটাল এক্স-রে ও ওপিজি (প্যানোরামিক এক্স-রে)",
        },
        why: {
          en: "Ultra-low-dose digital radiography revealing bone levels, roots, and hidden interproximal decay.",
          bn: "খালি চোখে যা দেখা যায় না — দাঁতের শিকড়, ভেতরের ক্যাভিটি ও চোয়ালের হাড়ের নিখুঁত চিত্র পেতে।",
        },
        when: {
          en: "Essential diagnostic prerequisite for root canal, implant planning, extractions, or braces.",
          bn: "রুট ক্যানেল, দাঁত তোলা, ব্রেসেস বা ইমপ্ল্যান্টের চিকিৎসা পরিকল্পনার শুরুতে।",
        },
        benefit: {
          en: "Immediate high-resolution image with 90% less radiation exposure than traditional film X-rays.",
          bn: "ফিল্ম এক্স-রে থেকে ৯০% কম রেডিয়েশন এবং তাৎক্ষণিকভাবে কম্পিউটারে নিখুঁত ছবি পাওয়া যায়।",
        },
      },
      {
        id: "intraoral-scanning",
        number: 3,
        imageUrl: "/images/SubServices-images/8. 3. Intraoral Scanning (Digital Impression).png",
        name: {
          en: "Intraoral Scanning (Digital Impression)",
          bn: "ইন্ট্রাওরাল স্ক্যানিং (ডিজিটাল ইমপ্রেশন)",
        },
        why: {
          en: "Captures precision 3D digital color impression of your teeth without messy, gag-inducing impression putty.",
          bn: "কোনো আঠালো বা অস্বস্তিকর পেস্ট মুখে না ঢুকিয়েই দাঁতের নিখুঁত থ্রিডি ডিজিটাল মডেল নিতে।",
        },
        when: {
          en: "Required for crowns, aligners, bridges, nightguards, and aesthetic smile planning.",
          bn: "ক্যাপ, ক্লিয়ার অ্যালাইনার বা কৃত্রিম দাঁত তৈরির সময় নিখুঁত মাপ নেওয়ার জন্য।",
        },
        benefit: {
          en: "Completely comfortable, eliminates gag reflexes, and delivers micron-level fit accuracy.",
          bn: "কোনো ওয়াক আসার ভয় থাকে না, অসম্ভব দ্রুত এবং মাইক্রন-লেভেলের নিখুঁত ফিটিং নিশ্চিত করে।",
        },
      },
      {
        id: "oral-cancer-screening",
        number: 4,
        imageUrl: "/images/SubServices-images/8. 4. Oral Cancer Screening.png",
        name: {
          en: "Oral Cancer Screening",
          bn: "ওরাল ক্যান্সার স্ক্রিনিং (প্রাথমিক পরীক্ষা)",
        },
        why: {
          en: "Specialist clinical examination of tongue, floor of mouth, and buccal mucosa for precancerous changes.",
          bn: "জিহ্বা, গাল ও মাড়ির ভেতরের অংশে কোনো অস্বাভাবিক কোষ বা প্রাথমিক ক্যান্সার লক্ষণ আছে কিনা তা যাচাই করতে।",
        },
        when: {
          en: "During annual routine check-ups, especially for patients with history of tobacco or betel nut use.",
          bn: "বার্ষিক চেকআপের সময়, বিশেষত যাদের তামাক বা জর্দা খাওয়ার অভ্যাস রয়েছে।",
        },
        benefit: {
          en: "Early identification of dysplasia provides life-saving interventions with near 100% cure rates.",
          bn: "প্রাথমিক পর্যায়ে ধরা পড়লে যেকোনো মারাত্মক রোগ সম্পূর্ণ নিরাময় করা সহজ হয়।",
        },
      },
      {
        id: "emergency-care",
        number: 5,
        imageUrl: "/images/SubServices-images/8. 5. Emergency Dental Care.png",
        name: {
          en: "Emergency Dental Care",
          bn: "জরুরি ডেন্টাল কেয়ার (ইমার্জেন্সি সেবা)",
        },
        why: {
          en: "Rapid urgent attention for severe toothaches, avulsed teeth, bleeding, or acute trauma.",
          bn: "হঠাৎ অসহনীয় দাঁতে ব্যথা, রক্তপাত বা আঘাত লাগার মতো জরুরি মুহূর্তে তাৎক্ষণিক চিকিৎসা পেতে।",
        },
        when: {
          en: "Unbearable pain keeping you awake, broken teeth from accidents, or uncontrolled oral bleeding.",
          bn: "তীব্র যন্ত্রণায় যখন সহ্য করা অসম্ভব হয়ে পড়ে অথবা দুর্ঘটনায় দাঁত ভেঙে রক্ত বের হয়।",
        },
        benefit: {
          en: "Prompt relief from distressing pain and expert emergency intervention to save compromised teeth.",
          bn: "তীব্র যন্ত্রণা থেকে তাৎক্ষণিক নিস্তার দেয় এবং দাঁতটি চিরতরে নষ্ট হওয়া থেকে রক্ষা করে।",
        },
      },
    ],
  },
];
