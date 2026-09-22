import { Doctor } from "@/types";

export const DOCTORS: Doctor[] = [
  {
    id: "dr-diean",
    slug: "dr-ahamed-diean-sammir",
    name: {
      en: "Dr. Ahamed Diean Sammir",
      bn: "ডা. আহমেদ দিয়ান সাম্মির",
    },
    specialty: {
      en: "Prosthodontist & Implantologist",
      bn: "প্রস্থোডন্টিক্স ও ইমপ্ল্যান্ট বিশেষজ্ঞ",
    },
    departmentId: "prosthodontics",
    degrees: {
      en: "BDS (BDC), MS - Prosthodontics (BSMMU)",
      bn: "বিডিএস (বিডিসি), এমএস - প্রস্থোডন্টিক্স (বিএসএমএমইউ)",
    },
    designation: {
      en: "Consultant Prosthodontist & Faculty",
      bn: "কনসালটেন্ট প্রস্থোডন্টিস্ট ও সাবেক শিক্ষক",
    },
    institution: {
      en: "Bangabandhu Sheikh Mujib Medical University (BSMMU)",
      bn: "বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়",
    },
    bmdcReg: "Verified",
    photoUrl: "/images/doctors/dr-diean.jpg",
    bio: {
      en: "Dr. Ahamed Diean Sammir specializes in prosthodontics, with advanced training in dental implants, fixed and removable prostheses, and full mouth rehabilitation. He holds an MS in Prosthodontics from Bangabandhu Sheikh Mujib Medical University and a BDS from Bangladesh Dental College, and has taught as faculty at several dental colleges alongside his clinical practice.",
      bn: "ডা. আহমেদ দিয়ান সাম্মির একজন অভিজ্ঞ প্রস্থোডন্টিস্ট ও ইমপ্ল্যান্টোলজিস্ট। তিনি বাংলাদেশ ডেন্টাল কলেজ থেকে বিডিএস এবং বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (বিএসএমএমইউ) থেকে প্রস্থোডন্টিক্সে এমএস সম্পন্ন করেছেন। তিনি ডেন্টাল ইমপ্ল্যান্ট, ফিক্সড ও রিমুভেবল ক্রাউন-ব্রিজ, ডেনচার এবং ফুল মাউথ রিহ্যাবিলিটেশনে বিশেষ পারদর্শী। ক্লিনিক্যাল প্র্যাকটিসের পাশাপাশি তিনি বিভিন্ন ডেন্টাল কলেজে শিক্ষকতায় যুক্ত ছিলেন।",
    },
    experience: {
      en: "Over 10 years of specialized restorative & implant clinical experience.",
      bn: "১০ বছরেরও বেশি বিশেষায়িত রিস্টোরেটিভ ও ইমপ্ল্যান্ট ক্লিনিক্যাল অভিজ্ঞতা।",
    },
    schedule: {
      availableDaysEn: "Every day except Tuesday",
      availableDaysBn: "মঙ্গলবার ব্যতীত প্রতিদিন",
      daysOfWeek: [0, 1, 3, 4, 5, 6], // Sun, Mon, Wed, Thu, Fri, Sat (Tue=2 excluded)
      startTime: "17:00",
      endTime: "21:30",
      slotDurationMinutes: 30,
      note: {
        en: "5:00 PM – 9:30 PM (30-minute intervals)",
        bn: "বিকাল ৫:০০ – রাত ৯:৩০ (প্রতি ৩০ মিনিট অন্তর)",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-sanwar",
    slug: "dr-md-sanwar-hossain",
    name: {
      en: "Dr. Md. Sanwar Hossain",
      bn: "ডা. মো. সানোয়ার হোসেন",
    },
    specialty: {
      en: "Oral & Maxillofacial Surgeon",
      bn: "ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন",
    },
    departmentId: "oral-surgery",
    degrees: {
      en: "BDS (RMC), FCPS (Oral & Maxillofacial Surgery)",
      bn: "বিডিএস (রামেক), এফসিপিএস (ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জারি)",
    },
    designation: {
      en: "Oral & Maxillofacial Surgeon",
      bn: "ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন",
    },
    institution: {
      en: "Kumudini Women's Medical College & Hospital",
      bn: "কুমুদিনী উইমেন'স মেডিকেল কলেজ",
    },
    photoUrl: "/images/doctors/DR. MD. SANWAR HOSSAIN.png",
    bio: {
      en: "Dr. Md. Sanwar Hossain is a fellowship-trained oral and maxillofacial surgeon (FCPS) with extensive experience in oral cancer surgery, facial trauma management, and complex dental surgeries. He currently serves as Assistant Professor at Kumudini Women's Medical College and has published research in oral and maxillofacial pathology.",
      bn: "ডা. মো. সানোয়ার হোসেন একজন ফেলোশিপপ্রাপ্ত ওরাল অ্যান্ড ম্যাক্সিলোফেসিয়াল সার্জন (এফসিপিএস)। তিনি রাজশাহী মেডিকেল কলেজ থেকে বিডিএস এবং বিসিপিএস থেকে এফসিপিএস সম্পন্ন করেন। মুখমণ্ডলের ট্রমা সার্জারি, ওরাল অনকোলজি এবং জটিল দাঁতের সার্জারিতে তার দীর্ঘ অভিজ্ঞতা রয়েছে। বর্তমানে তিনি কুমুদিনী উইমেন'স মেডিকেল কলেজে সহকারী অধ্যাপক হিসেবে কর্মরত।",
    },
    experience: {
      en: "Fellowship-trained surgeon with high-level trauma & oncological surgery track record.",
      bn: "মুখমণ্ডলের জটিল সার্জারি ও ক্যান্সার চিকিৎসায় ফেলোশিপপ্রাপ্ত বিশেষজ্ঞ।",
    },
    schedule: {
      availableDaysEn: "Saturday only",
      availableDaysBn: "প্রতি শনিবার",
      daysOfWeek: [6], // Saturday
      startTime: "17:30",
      endTime: "21:00",
      slotDurationMinutes: 30,
      note: {
        en: "5:30 PM – 9:00 PM (30-minute intervals)",
        bn: "বিকাল ৫:৩০ – রাত ৯:০০ (প্রতি ৩০ মিনিট অন্তর)",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-fatema",
    slug: "dr-fatema-tasrin-madhubi",
    name: {
      en: "Dr. Fatema Tasrin Madhubi",
      bn: "ডা. ফাতেমা তাসরিন মাধুবী",
    },
    specialty: {
      en: "Orthodontist & Clear Aligner Specialist",
      bn: "অর্থোডন্টিস্ট ও ক্লিয়ার অ্যালাইনার বিশেষজ্ঞ",
    },
    departmentId: "orthodontics",
    degrees: {
      en: "BDS (RMC), MS - Orthodontics (BSMMU)",
      bn: "বিডিএস (রামেক), এমএস - অর্থোডন্টিকস (বিএসএমএমইউ)",
    },
    designation: {
      en: "Dental Surgeon",
      bn: "ডেন্টাল সার্জন",
    },
    institution: {
      en: "Govt. Employee Hospital, Fulbaria, Dhaka",
      bn: "সরকারি কর্মচারী হাসপাতাল, ফুলবাড়িয়া, ঢাকা",
    },
    bmdcReg: "6150",
    photoUrl: "/images/doctors/dr-fatema.jpg",
    bio: {
      en: "Dr. Fatema Tasrin Madhubi is an orthodontist with an MS in Orthodontics from Bangladesh Medical University and a BDS from Rajshahi Medical College. She specializes in clear aligner treatment and correcting dental malocclusions for patients of all ages, with a focus on precise, comfortable, patient-centered care.",
      bn: "ডা. ফাতেমা তাসরিন মাধুবী একজন অভিজ্ঞ অর্থোডন্টিস্ট। তিনি রাজশাহী মেডিকেল কলেজ থেকে বিডিএস এবং বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয় (বিএসএমএমইউ) থেকে অর্থোডন্টিক্সে এমএস ডিগ্রি অর্জন করেছেন। তিনি ক্লিয়ার অ্যালাইনার এবং সকল বয়সী রোগীর আঁকাবাঁকা দাঁত ও চোয়ালের কামড়ের অসঙ্গতি সংশোধনে অত্যন্ত দক্ষ ও আন্তরিক।",
    },
    experience: {
      en: "Certified in clear aligners and specialized in adolescent & adult teeth realignment.",
      bn: "ক্লিয়ার অ্যালাইনার সার্টিফায়েড এবং শিশু ও প্রাপ্তবয়স্কদের দাঁত সোজা করার অভিজ্ঞ চিকিৎসক।",
    },
    schedule: {
      availableDaysEn: "Tuesday only",
      availableDaysBn: "প্রতি মঙ্গলবার",
      daysOfWeek: [2], // Tuesday
      startTime: "17:00",
      endTime: "21:00",
      slotDurationMinutes: 30,
      note: {
        en: "5:00 PM – 9:00 PM (30-minute intervals)",
        bn: "বিকাল ৫:০০ – রাত ৯:০০ (প্রতি ৩০ মিনিট অন্তর)",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-bappy",
    slug: "dr-md-muhtashim-chowdhury-bappy",
    name: {
      en: "Dr. Md. Muhtashim Chowdhury (Bappy)",
      bn: "ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী)",
    },
    specialty: {
      en: "Oral and Dental Surgeon",
      bn: "ওরাল অ্যান্ড ডেন্টাল সার্জন",
    },
    departmentId: "endodontics",
    degrees: {
      en: "BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Maxillofacial Surgery)",
      bn: "বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারি)",
    },
    designation: {
      en: "Oral and Dental Surgeon",
      bn: "ওরাল অ্যান্ড ডেন্টাল সার্জন",
    },
    institution: {
      en: "BSMMU (Ex-PG Hospital)",
      bn: "বিএসএমএমইউ (সাবেক পিজি হাসপাতাল)",
    },
    photoUrl: "/images/doctors/dr-Bappy.png",
    bio: {
      en: "Dr. Md. Muhtashim Chowdhury (Bappy) is an Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). He completed Post Graduate Training (PGT) in Conservative Dentistry & Maxillofacial Surgery at BSMMU (Ex-PG Hospital). Dr. Bappy has attained Advance Implant Training from USC (USA) and Advance Endodontic Training from Japan, specializing in modern painless root canals, dental implants, and maxillofacial procedures.",
      bn: "ডা. মো. মুহতাসিম চৌধুরী (বাপ্পী) একজন দক্ষ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ সম্পন্ন করেছেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও ম্যাক্সিলোফেসিয়াল সার্জারিতে পিজিটি সম্পন্ন করেন। এছাড়া তিনি আমেরিকার ইউএসসি (USC, USA) থেকে অ্যাডভান্সড ইমপ্ল্যান্ট ট্রেনিং এবং জাপান থেকে অ্যাডভান্সড এন্ডোডন্টিক ট্রেনিং প্রাপ্ত। তিনি আধুনিক ব্যথামুক্ত রুট ক্যানেল, ডেন্টাল ইমপ্ল্যান্ট ও ম্যাক্সিলোফেসিয়াল চিকিৎসায় অভিজ্ঞ।",
    },
    experience: {
      en: "Advance Implant Training (USC, USA) • Advance Endodontic Training (Japan) • PGT (BSMMU, Ex-PG Hospital)",
      bn: "অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং (ইউএসসি, আমেরিকা) • অ্যাডভান্স এন্ডোডন্টিক ট্রেনিং (জাপান) • পিজিটি (বিএসএমএমইউ, সাবেক পিজি হাসপাতাল)",
    },
    schedule: {
      availableDaysEn: "Every day except Tuesday",
      availableDaysBn: "মঙ্গলবার ব্যতীত প্রতিদিন",
      daysOfWeek: [0, 1, 3, 4, 5, 6],
      startTime: "11:00",
      endTime: "14:00",
      slotDurationMinutes: 30,
      note: {
        en: "11:00 AM – 2:00 PM",
        bn: "সকাল ১১:০০ – দুপুর ২:০০",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-ratina",
    slug: "dr-jesinta-islam",
    name: {
      en: "Dr. Jesinta Islam",
      bn: "ডা. জেসিন্টা ইসলাম",
    },
    specialty: {
      en: "Oral and Dental Surgeon",
      bn: "ওরাল অ্যান্ড ডেন্টাল সার্জন",
    },
    departmentId: "endodontics",
    degrees: {
      en: "BDS (DU), MPH (NSU), PGT (Conservative Dentistry & Endodontics)",
      bn: "বিডিএস (ঢাবি), এমপিএইচ (এনএসইউ), পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স)",
    },
    designation: {
      en: "Oral and Dental Surgeon",
      bn: "ওরাল অ্যান্ড ডেন্টাল সার্জন",
    },
    institution: {
      en: "BSMMU (Ex-PG Hospital)",
      bn: "বিএসএমএমইউ (সাবেক পিজি হাসপাতাল)",
    },
    photoUrl: "/images/doctors/Dr Jesinta Islam.png",
    bio: {
      en: "Dr. Jesinta Islam is an accomplished Oral and Dental Surgeon holding BDS from Dhaka University (DU) and MPH from North South University (NSU). She completed Post Graduate Training (PGT) in Conservative Dentistry & Endodontics at BSMMU (Ex-PG Hospital) and received Advance Implant Training in Rome, Italy. She specializes in precision root canal therapy, aesthetic dentistry, conservative treatments, and dental implant solutions with patient-centered care.",
      bn: "ডা. জেসিন্টা ইসলাম একজন নিবেদিতপ্রাণ ওরাল অ্যান্ড ডেন্টাল সার্জন। তিনি ঢাকা বিশ্ববিদ্যালয় (ঢাবি) থেকে বিডিএস এবং নর্থ সাউথ বিশ্ববিদ্যালয় (এনএসইউ) থেকে এমপিএইচ ডিগ্রি অর্জন করেছেন। তিনি বিএসএমএমইউ (সাবেক পিজি হাসপাতাল) থেকে কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্সে পিজিটি সম্পন্ন করেছেন এবং ইতালির রোম থেকে অ্যাডভান্সড ইমপ্ল্যান্ট ট্রেনিং সম্পন্ন করেছেন। তিনি আধুনিক রুট ক্যানেল, নান্দনিক ডেন্টিস্ট্রি ও ডেন্টাল ইমপ্ল্যান্ট চিকিৎসায় বিশেষভাবে পারদর্শী।",
    },
    experience: {
      en: "Advance Implant Training (Rome, Italy) • PGT in Conservative Dentistry & Endodontics (BSMMU, Ex-PG Hospital)",
      bn: "অ্যাডভান্স ইমপ্ল্যান্ট ট্রেনিং (রোম, ইতালি) • পিজিটি (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স, বিএসএমএমইউ, সাবেক পিজি হাসপাতাল)",
    },
    schedule: {
      availableDaysEn: "Tuesday only",
      availableDaysBn: "প্রতি মঙ্গলবার",
      daysOfWeek: [2],
      startTime: "11:00",
      endTime: "14:00",
      slotDurationMinutes: 30,
      note: {
        en: "11:00 AM – 2:00 PM",
        bn: "সকাল ১১:০০ – দুপুর ২:০০",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-rifat",
    slug: "dr-rifat-rahman",
    name: {
      en: "Dr. Rifat Rahman",
      bn: "ডা. রিফাত রহমান",
    },
    specialty: {
      en: "Oral Medicine Specialist",
      bn: "ওরাল মেডিসিন বিশেষজ্ঞ",
    },
    departmentId: "oral-medicine",
    degrees: {
      en: "BDS, MPH, MSc Oral Medicine (Thailand), PhD in Oral Oncology (Australia), Trained in Oral Radiology (Japan)",
      bn: "বিডিএস, এমপিএইচ, এমএসসি ওরাল মেডিসিন (থাইল্যান্ড), পিএইচডি ওরাল অনকোলজি (অস্ট্রেলিয়া), ওরাল রেডিওলজি প্রশিক্ষণ (জাপান)",
    },
    designation: {
      en: "Oral Medicine Consultant & Dental Surgeon",
      bn: "ওরাল মেডিসিন কনসালটেন্ট ও ডেন্টাল সার্জন",
    },
    institution: {
      en: "Oral Medicine & Oncology Specialist",
      bn: "ওরাল মেডিসিন ও অনকোলজি বিশেষজ্ঞ",
    },
    bmdcReg: "4564",
    photoUrl: "/images/doctors/Dr Rifat Rahman.png",
    bio: {
      en: "Dr. Rifat Rahman is an accomplished Oral Medicine Consultant and Dental Surgeon holding a BDS, MPH, and MSc in Oral Medicine from Thailand, a PhD in Oral Oncology from Australia, and advanced clinical training in Oral Radiology from Japan. With BMDC Registration No. 4564, he specializes in comprehensive oral mucosal disease diagnosis, precancerous lesion detection, salivary gland disorders, and complex oral medicine care.",
      bn: "ডা. রিফাত রহমান একজন উচ্চশিক্ষিত ও অভিজ্ঞ ওরাল মেডিসিন কনসালটেন্ট ও ডেন্টাল সার্জন (বিএমডিসি রেজি: ৪৫৬৪)। তিনি বিডিএস এবং এমপিএইচ সম্পন্ন করার পর থাইল্যান্ড থেকে ওরাল মেডিসিনে এমএসসি এবং অস্ট্রেলিয়া থেকে ওরাল অনকোলজিতে পিএইচডি ডিগ্রি অর্জন করেছেন। এছাড়া জাপান থেকে ওরাল রেডিওলজিতে বিশেষ প্রশিক্ষণপ্রাপ্ত। তিনি মুখের ক্যান্সার স্ক্রিনিং, প্রিক্যান্সারাস ক্ষত, ওএসএমএফ, মুখের দীর্ঘস্থায়ী ঘা ও লালাগ্রন্থির জটিল রোগের আধুনিক ডায়াগনোসিস ও চিকিৎসায় বিশেষ পারদর্শী।",
    },
    experience: {
      en: "PhD in Oral Oncology (Australia) • MSc Oral Medicine (Thailand) • Trained in Oral Radiology (Japan)",
      bn: "পিএইচডি ওরাল অনকোলজি (অস্ট্রেলিয়া) • এমএসসি ওরাল মেডিসিন (থাইল্যান্ড) • ওরাল রেডিওলজি ট্রেনিং (জাপান)",
    },
    schedule: {
      availableDaysEn: "Friday only",
      availableDaysBn: "প্রতি শুক্রবার",
      daysOfWeek: [5], // Friday
      startTime: "17:00",
      endTime: "20:00",
      slotDurationMinutes: 30,
      note: {
        en: "5:00 PM – 8:00 PM (Friday only)",
        bn: "বিকাল ৫:০০ – রাত ৮:০০ (প্রতি শুক্রবার)",
      },
    },
    isConfirmed: true,
  },
  {
    id: "dr-rafia",
    slug: "dr-rafia-nazneen",
    name: {
      en: "Dr. Rafia Nazneen",
      bn: "ডা. রাফিয়া নাজনীন",
    },
    specialty: {
      en: "Specialist in Conservative Dentistry & Endodontics",
      bn: "কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স বিশেষজ্ঞ",
    },
    departmentId: "endodontics",
    degrees: {
      en: "BDS, FCPS (Conservative Dentistry & Endodontics)",
      bn: "বিডিএস, এফসিপিএস (কনজারভেটিভ ডেন্টিস্ট্রি অ্যান্ড এন্ডোডন্টিক্স)",
    },
    designation: {
      en: "Associate Professor & Head, Department of Dental Surgery",
      bn: "সহযোগী অধ্যাপক ও বিভাগীয় প্রধান, ডেন্টাল সার্জারি বিভাগ",
    },
    institution: {
      en: "BIRDEM General Hospital",
      bn: "বারডেম জেনারেল হাসপাতাল",
    },
    photoUrl: "/images/doctors/dr-rafia-nazneen.png",
    bio: {
      en: "Dr. Rafia Nazneen is an Associate Professor & Head of the Department of Dental Surgery at BIRDEM General Hospital. Holding a BDS and FCPS in Conservative Dentistry & Endodontics, she specializes in modern painless root canals, cosmetic dental restorations, and advanced microscopic endodontic procedures.",
      bn: "ডা. রাফিয়া নাজনীন বারডেম জেনারেল হাসপাতালের ডেন্টাল সার্জারি বিভাগের সহযোগী অধ্যাপক ও বিভাগীয় প্রধান। তিনি বিডিএস এবং কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্সে এফসিপিএস ডিগ্রিধারী। তিনি আধুনিক ব্যথামুক্ত রুট ক্যানেল চিকিৎসা, নান্দনিক ডেন্টাল রেস্টোরেশন এবং উন্নত মাইক্রোস্কোপিক এন্ডোডন্টিক পদ্ধতিতে বিশেষভাবে অভিজ্ঞ।",
    },
    experience: {
      en: "Associate Professor & Head at BIRDEM General Hospital • FCPS (Conservative Dentistry & Endodontics)",
      bn: "সহযোগী অধ্যাপক ও বিভাগীয় প্রধান (বারডেম জেনারেল হাসপাতাল) • এফসিপিএস (কনজারভেটিভ ডেন্টিস্ট্রি ও এন্ডোডন্টিক্স)",
    },
    schedule: {
      availableDaysEn: "Saturday & Monday",
      availableDaysBn: "শনিবার ও সোমবার",
      daysOfWeek: [1, 6], // Monday=1, Saturday=6
      startTime: "15:00",
      endTime: "19:00",
      slotDurationMinutes: 30,
      note: {
        en: "3:00 PM – 7:00 PM (Saturday & Monday)",
        bn: "বিকাল ৩:০০ – সন্ধ্যা ৭:০০ (শনিবার ও সোমবার)",
      },
    },
    isConfirmed: true,
  },
];


