import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pagecraft.me";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy-policy", "/terms", "/cookie-policy"],
      disallow: ["/api/", "/auth", "/editor"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
