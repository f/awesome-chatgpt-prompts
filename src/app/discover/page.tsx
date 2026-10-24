import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DiscoveryPrompts } from "@/components/prompts/discovery-prompts";
import { JsonLd, breadcrumbSchema, collectionPageSchema } from "@/components/seo/structured-data";
import { db } from "@/lib/db";
import { buildPageMetadata } from "@/lib/seo";
import { getPromptUrl } from "@/lib/urls";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.discover");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/discover",
  });
}

export default async function DiscoverPage() {
  const t = await getTranslations("seo.discover");

  // Fetch top prompts for structured data
  const topPrompts = await db.prompt.findMany({
    where: {
      isPrivate: false,
      isUnlisted: false,
      deletedAt: null,
    },
    orderBy: {
      votes: { _count: "desc" },
    },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            name: t("heading"),
            description: t("description"),
            path: "/discover",
            items: topPrompts.map((prompt) => ({ name: prompt.title, path: getPromptUrl(prompt.id, prompt.slug) })),
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Discover", path: "/discover" },
          ]),
        ]}
      />
      <div className="flex flex-col">
        <h1 className="sr-only">{t("heading")}</h1>
        <DiscoveryPrompts />
      </div>
    </>
  );
}
