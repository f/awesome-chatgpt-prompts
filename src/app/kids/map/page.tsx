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
    <div className="h-full flex flex-col overflow-hidden">
      <ProgressMap />
    </div>
  );
}
