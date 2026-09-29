import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const baseUrl =
    rawUrl && !rawUrl.includes("localhost")
      ? rawUrl.replace(/^http:\/\//i, "https://").replace(/\/+$/, "")
      : "https://kghdental.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
