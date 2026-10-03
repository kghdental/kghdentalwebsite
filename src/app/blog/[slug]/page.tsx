import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ENRICHED_BLOG_POSTS } from "@/lib/api/db";
import { BlogPostClientView } from "@/components/blog/BlogPostClientView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 1. Statically generate all blog post paths at build time (SSG).
 * Guarantees 0ms server latency, perfect SEO crawler readability, and eliminates HTTP 500 runtime crashes.
 */
export async function generateStaticParams() {
  return ENRICHED_BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * 2. Next.js 15 dynamic SEO metadata generation for each clinical article.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = ENRICHED_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | KGH Dental",
      robots: { index: false, follow: true },
    };
  }

  const title = post.title?.en || "Clinical Dental Guide | KGH Dental";
  const description =
    post.excerpt?.en ||
    "Educational dental health tips, treatment guides, and specialist oral care advice from KGH Dental.";
  const canonicalUrl = `https://kghdental.com/blog/${slug}`;

  return {
    title: `${title} | KGH Dental`,
    description,
    keywords: [
      post.targetKeyword || "",
      "kgh dental",
      "dental clinic banani",
      "dentist dhaka",
      post.departmentSlug || "dental care",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | KGH Dental`,
      description,
      url: canonicalUrl,
      type: "article",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | KGH Dental`,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

/**
 * 3. Next.js 15 Server-Side Component with awaited params Promise.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = ENRICHED_BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = ENRICHED_BLOG_POSTS.filter(
    (p) => p.id !== post.id && p.departmentSlug === post.departmentSlug
  ).slice(0, 2);

  return <BlogPostClientView initialPost={post} relatedPosts={relatedPosts} />;
}
