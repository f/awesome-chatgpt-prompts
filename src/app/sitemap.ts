import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { getAllChapters } from "@/lib/book/chapters";

// Revalidate sitemap every hour (3600 seconds)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://prompts.chat";

  // Static pages - always included
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Book chapter pages
  const chapters = getAllChapters();
  const bookPages: MetadataRoute.Sitemap = chapters.map((chapter) => ({
    url: `${baseUrl}/book/${chapter.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Dynamic pages - skip if database is unavailable (e.g., during build)
  try {
    const [categories, prompts, tags] = await Promise.all([
      db.category.findMany({ select: { slug: true } }),
      db.prompt.findMany({
        where: { isPrivate: false, deletedAt: null, isUnlisted: false },
        select: { id: true, slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 1000,
      }),
      db.tag.findMany({ select: { slug: true } }),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const promptPages: MetadataRoute.Sitemap = prompts.map((prompt) => ({
      url: `${baseUrl}/prompts/${prompt.id}_${prompt.slug}`,
      lastModified: prompt.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return [...staticPages, ...bookPages, ...categoryPages, ...promptPages, ...tagPages];
  } catch {
    // Database unavailable (build time) - return static and book pages only
    return [...staticPages, ...bookPages];
  }
}
