import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://documind.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
        disallow: ["/dashboard", "/documents", "/settings", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
