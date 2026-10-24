import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { KidsHomeContent } from "@/components/kids/layout/kids-home-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.kids");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/kids",
  });
}

export default function KidsHomePage() {
  return <KidsHomeContent />;
}
