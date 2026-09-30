# KGH Dental Clinic — Supabase Database Architecture

This directory contains the database schemas, migration history, and security policies for KGH Dental Clinic.

## 📁 Directory Structure

```text
supabase/
├── master_schema.sql             # 🌟 Single canonical master database script (Fresh Installs)
├── security_hardening_rls.sql    # 🛡️ Dedicated RLS security lockdown patch (Existing Databases)
├── README.md                     # Documentation & usage instructions
└── archive/                      # Historical incremental migration and patch files
```

---

## 🚀 How to Use

### 1. For a New / Fresh Supabase Project
Run **`master_schema.sql`**:
- Creates all 15 database tables (`admin_users`, `departments`, `sub_services`, `doctors`, `clinic_settings`, `appointments`, `doctor_blocked_dates`, `reviews`, `why_choose_cards`, `clinical_creed`, `gallery_items`, `before_after_items`, `featured_videos`, `blog_posts`, `media_files`).
- Sets up database extensions (`uuid-ossp`, `pgcrypto`), performance indexes, and storage buckets (`images`, `media`).
- Implements HIPAA-level Row Level Security (RLS) with zero anon credential leaks.
- Seeds 100% of production-verified bilingual clinical data (8 departments, 66 sub-services, 7 specialist doctors including Dr. Rafia Nazneen, clinic settings, 10 rich 1500-word SEO blogs, videos, and before/after gallery cases).

### 2. For an Existing Live Supabase Database
Run **`security_hardening_rls.sql`**:
- Locks down existing tables without overwriting or resetting any patient appointments or CMS content.
- Revokes public/anon access from `admin_users`.
- Restricts `appointments` table so the public can only INSERT (book appointments), preventing patient PII data leaks.

---

## 🗄️ Historical Archive (`supabase/archive/`)
Contains all individual historical migration scripts created during development phases. Kept for version history and auditing.
