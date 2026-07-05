import type { MetadataRoute } from "next";
import { CATEGORIES, templatesByCategory } from "@/editor/templates";
import { slugifyCategory } from "@/components/marketing/categories";

const BASE = "https://photocard.720p.red";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/editor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/generate`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Only categories that actually have templates, to avoid thin/empty pages.
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter(
    (c) => templatesByCategory(c).length > 0,
  ).map((c) => ({
    url: `${BASE}/templates/${slugifyCategory(c)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
