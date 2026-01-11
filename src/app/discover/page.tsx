import { DiscoveryPrompts } from "@/components/prompts/discovery-prompts";
import { StructuredData } from "@/components/seo/structured-data";
import { db } from "@/lib/db";

export default async function DiscoverPage() {
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
      description: true,
      slug: true,
    },
  });

  const itemListData = topPrompts.map((prompt) => ({
    name: prompt.title,
    url: `/prompts/${prompt.id}${prompt.slug ? `_${prompt.slug}` : ""}`,
    description: prompt.description || undefined,
  }));

  return (
    <>
      <StructuredData
        type="itemList"
        data={{ items: itemListData }}
      />
      <StructuredData
        type="breadcrumb"
        data={{
          breadcrumbs: [
            { name: "Home", url: "/" },
            { name: "Discover", url: "/discover" },
          ],
        }}
      />
      <div className="flex flex-col">
        <DiscoveryPrompts />
      </div>
    </>
  );
}
