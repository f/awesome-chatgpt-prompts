import { getTranslations } from "next-intl/server";
import { PromptWritingGuideContent } from "@/components/prompts/prompt-writing-guide-content";
import { LanguageSwitcher } from "@/components/prompts/language-switcher";
import { InteractiveBookBanner } from "@/components/prompts/interactive-book-banner";

export async function generateMetadata() {
  const t = await getTranslations("promptWritingGuide");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function HowToWriteEffectivePromptsPage() {
  const t = await getTranslations("promptWritingGuide");

  return (
    <div className="container max-w-4xl py-8">
      <InteractiveBookBanner />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-4">{t("subtitle")}</p>
        <LanguageSwitcher />
      </div>
      <PromptWritingGuideContent />
    </div>
  );
}
