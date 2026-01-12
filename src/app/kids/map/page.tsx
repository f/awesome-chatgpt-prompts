import { getTranslations } from "next-intl/server";
import { ProgressMap } from "@/components/kids/elements/progress-map";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Map | Learn Prompting for Kids",
  description: "Choose your adventure! Pick a level and start learning how to talk to AI.",
};

export default async function KidsMapPage() {
  const t = await getTranslations("kids");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("map.title")}</h1>
        <p className="text-muted-foreground">{t("map.subtitle")}</p>
      </div>
      
      <ProgressMap />
    </div>
  );
}
