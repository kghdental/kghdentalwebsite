export type Language = 'en' | 'bn';

export interface BilingualText {
  en: string;
  bn: string;
}

export interface SubService {
  id: string;
  number: number;
  name: BilingualText;
  why: BilingualText;
  when: BilingualText;
  benefit: BilingualText;
  imagePlaceholder?: string;
  imageUrl?: string;
}

export interface Department {
  id: string;
  slug: string;
  name: BilingualText;
  shortDesc: BilingualText;
  iconName: string;
  leadDoctorId?: string;
  imageUrl: string;
  coverBannerUrl?: string;
  subServices: SubService[];
}

export interface DoctorSchedule {
  availableDaysEn: string;
  availableDaysBn: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string; // e.g., "17:00"
  endTime: string; // e.g., "21:30"
  slotDurationMinutes: number;
  note?: BilingualText;
}

export interface Doctor {
  id: string;
  name: BilingualText;
  slug: string;
  specialty: BilingualText;
  departmentId?: string;
  degrees: BilingualText;
  designation?: BilingualText;
  institution?: BilingualText;
  bmdcReg?: string;
  email?: string;
  bio: BilingualText;
  photoUrl: string;
  experience?: BilingualText;
  schedule: DoctorSchedule;
  isConfirmed: boolean;
  isActive?: boolean;
}

export interface GoogleReview {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: BilingualText;
  treatment?: BilingualText;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: BilingualText;
  excerpt: BilingualText;
  departmentSlug: string;
  departmentName: BilingualText;
  readTime: string;
  date: string;
  targetKeyword: string;
  coverImage?: string;
  authorName?: BilingualText;
  authorRole?: BilingualText;
  authorPhotoUrl?: string;
  tags?: string[];
  contentHtml?: BilingualText;
  content?: {
    hook: BilingualText;
    overview: BilingualText;
    symptomsOrOptions: BilingualText[];
    procedureOrExpectations: BilingualText;
    preventionOrAftercare: BilingualText;
  };
}

export interface AppointmentRecord {
  id: string;
  reference_code: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  patient_age?: string;
  patient_gender?: string;
  doctor_id?: string;
  doctor_name: string;
  department_id?: string;
  department_name: string;
  appointment_date: string;
  time_slot: string;
  symptoms?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface DoctorBlockedDate {
  id: string;
  doctor_id: string;
  blocked_date: string;
  reason?: string;
  created_at?: string;
}

export interface AppointmentBooking {
  id?: string;
  doctorId: string;
  departmentId?: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  patientAge?: string;
  patientGender?: string;
  notes?: string;
  createdAt?: string;
}

export interface ClinicSettings {
  name: string;
  tagline: BilingualText;
  phoneNumbers: string[];
  emergencyPhone: string;
  email: string;
  address: BilingualText;
  isAddressPlaceholder: boolean;
  googleMapUrl?: string;
  workingHours: {
    days: BilingualText;
    hours: BilingualText;
  }[];
  googleReviewUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

export interface GalleryItem {
  id: string;
  title: BilingualText;
  category: "clinic" | "team" | "chamber" | "treatments" | "sterilization" | string;
  desc: BilingualText;
  imageUrl: string;
  sortOrder?: number;
}

export interface BeforeAfterItem {
  id: string;
  title: BilingualText;
  category: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  desc?: BilingualText;
  sortOrder?: number;
  tags?: string[];
}


export interface ProtocolStep {
  number: string;
  title: BilingualText;
  detail: BilingualText;
}

export interface WhyChooseCard {
  id: string;
  stepNumber: string;
  badge: BilingualText;
  title: BilingualText;
  subtitle: BilingualText;
  bullets: BilingualText[];
  tags: BilingualText[];
  image: string;
  accent: string;
  protocolTitle: BilingualText;
  protocolSubtitle: BilingualText;
  protocolSteps: ProtocolStep[];
  protocolGuarantees: BilingualText[];
}

export interface ClinicalCreedStat {
  value: BilingualText;
  label: BilingualText;
}

export interface CreedQuoteItem {
  id: string;
  quote: BilingualText;
  highlight: BilingualText;
  author: BilingualText;
  role: BilingualText;
  image: string;
}

export interface ClinicalCreedData {
  tag: BilingualText;
  quote: BilingualText;
  subQuote: BilingualText;
  authority: BilingualText;
  designation: BilingualText;
  stats: ClinicalCreedStat[];
  quotes?: CreedQuoteItem[];
}


