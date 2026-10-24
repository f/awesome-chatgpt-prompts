import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { BotForm } from "@/components/bots/bot-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NOINDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Create Bot",
  description: "Create a new AI agent bot",
  robots: NOINDEX_ROBOTS,
};

export default async function NewBotPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const t = await getTranslations("prompts");

  return (
    <div className="container max-w-3xl py-8">
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>{t("createInfo")}</AlertDescription>
      </Alert>
      <BotForm mode="create" />
    </div>
  );
}
