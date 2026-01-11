import { getTranslations } from "next-intl/server";
import { PromptmastersContent } from "@/components/promptmasters/promptmasters-content";

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
