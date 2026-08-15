import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://jelboostgh.com";
  const now  = new Date();

  return [
    { url: base,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/services`,    lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/pricing`,     lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/blog`,        lastModified: now, changeFrequency: "daily",   priority: 0.7 },
    { url: `${base}/faq`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/auth/login`,  lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${base}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
