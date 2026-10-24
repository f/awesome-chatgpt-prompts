import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PromptmastersContent } from "@/components/promptmasters/promptmasters-content";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("seo.promptmasters");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/promptmasters",
  });
}

export default async function PromptmastersPage() {
  const t = await getTranslations("promptmasters");

  const translations = {
    title: t("title"),
    description: t("description"),
    allTime: t("allTime"),
    thisMonth: t("thisMonth"),
    thisWeek: t("thisWeek"),
    noData: t("noData"),
    prompts: t("prompts"),
    upvotes: t("upvotes"),
    perPrompt: t("perPrompt"),
    sortByTotal: t("sortByTotal"),
    sortByRatio: t("sortByRatio"),
  };

  return <PromptmastersContent translations={translations} />;
}
