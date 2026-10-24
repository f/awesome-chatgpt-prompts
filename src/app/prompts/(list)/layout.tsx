import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { db } from "@/lib/db";

/**
 * Category filters on /prompts used to be keyed by category ID. Those URLs
 * permanently redirect to their slug-based equivalents here, before the
 * loading.tsx boundary below starts streaming, so they get a real 308.
 */
export default async function PromptListLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const params = new URLSearchParams(headersList.get("x-search") ?? "");
  const categoryParam = params.get("category");

  if (headersList.get("x-pathname") === "/prompts" && categoryParam) {
    const category = await db.category.findUnique({
      where: { id: categoryParam },
      select: { slug: true },
    });

    if (category && category.slug !== categoryParam) {
      const otherParams = [...params.entries()].filter(([key, value]) => value && key !== "category");
      const isCategoryOnly = otherParams.every(([key]) => key === "sort" || key === "page");
      permanentRedirect(
        isCategoryOnly
          ? `/categories/${category.slug}`
          : `/prompts?${new URLSearchParams([["category", category.slug], ...otherParams])}`
      );
    }
  }

  return children;
}
