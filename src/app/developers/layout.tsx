import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";

// The page is a client component, so its metadata lives here
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.developers");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/developers",
  });
}

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
