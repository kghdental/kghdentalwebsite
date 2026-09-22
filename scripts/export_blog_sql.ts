import * as fs from 'fs';
import * as path from 'path';
import { BLOG_POSTS } from '../src/data/blog';

function sqlEscape(str: string | undefined): string {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

let sql = `-- ==============================================================================
-- KGH DENTAL: 1200-1500 WORDS COMPREHENSIVE CLINICAL DENTAL GUIDES (BILINGUAL)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/blrlcaqijyhwhqxqprwr/sql
-- ==============================================================================

-- 1. Ensure Table and Required Columns Exist
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
    read_time TEXT DEFAULT '8 min read',
    date_str TEXT DEFAULT 'Sep 2026',
    target_keyword TEXT DEFAULT '',
    author_name_en TEXT DEFAULT 'Admin',
    author_name_bn TEXT DEFAULT 'এডমিন',
    author_role_en TEXT DEFAULT 'Admin',
    author_role_bn TEXT DEFAULT 'এডমিন',
    author_photo_url TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY['dental care', 'kgh dental'],
    content_html_en TEXT DEFAULT '',
    content_html_bn TEXT DEFAULT '',
    legacy_content JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_en TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_html_bn TEXT DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Upsert All 10 Researched High-Quality Blog Articles
`;

for (const post of BLOG_POSTS) {
  const tagsArray = (post.tags && post.tags.length > 0)
    ? `ARRAY[${post.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]`
    : `ARRAY['dental care', 'kgh dental']`;

  sql += `
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
    author_photo_url,
    tags,
    content_html_en,
    content_html_bn,
    updated_at
) VALUES (
    ${sqlEscape(post.slug)},
    ${sqlEscape(post.title.en)},
    ${sqlEscape(post.title.bn)},
    ${sqlEscape(post.excerpt.en)},
    ${sqlEscape(post.excerpt.bn)},
    ${sqlEscape(post.coverImage)},
    ${sqlEscape(post.departmentSlug)},
    ${sqlEscape(post.departmentName.en)},
    ${sqlEscape(post.departmentName.bn)},
    ${sqlEscape(post.readTime)},
    ${sqlEscape(post.date)},
    ${sqlEscape(post.targetKeyword)},
    ${sqlEscape(post.authorName?.en)},
    ${sqlEscape(post.authorName?.bn)},
    ${sqlEscape(post.authorRole?.en)},
    ${sqlEscape(post.authorRole?.bn)},
    ${sqlEscape(post.authorPhotoUrl)},
    ${tagsArray},
    ${sqlEscape(post.contentHtml?.en)},
    ${sqlEscape(post.contentHtml?.bn)},
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title_en = EXCLUDED.title_en,
    title_bn = EXCLUDED.title_bn,
    excerpt_en = EXCLUDED.excerpt_en,
    excerpt_bn = EXCLUDED.excerpt_bn,
    cover_image = EXCLUDED.cover_image,
    department_slug = EXCLUDED.department_slug,
    department_name_en = EXCLUDED.department_name_en,
    department_name_bn = EXCLUDED.department_name_bn,
    read_time = EXCLUDED.read_time,
    date_str = EXCLUDED.date_str,
    target_keyword = EXCLUDED.target_keyword,
    author_name_en = EXCLUDED.author_name_en,
    author_name_bn = EXCLUDED.author_name_bn,
    author_role_en = EXCLUDED.author_role_en,
    author_role_bn = EXCLUDED.author_role_bn,
    author_photo_url = EXCLUDED.author_photo_url,
    tags = EXCLUDED.tags,
    content_html_en = EXCLUDED.content_html_en,
    content_html_bn = EXCLUDED.content_html_bn,
    updated_at = NOW();
`;
}

const outputPath = path.resolve(__dirname, '../supabase/update_comprehensive_1500w_blogs.sql');
fs.writeFileSync(outputPath, sql, 'utf-8');
console.log('Successfully generated SQL script at:', outputPath);
