import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Play, Sparkles, Star, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromiCharacter } from "@/components/kids/elements/character-guide";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Prompting for Kids | prompts.chat",
  description: "A fun, game-based way for kids to learn how to talk to AI. Join Promi the robot on an adventure through Prompt Land!",
};

export default async function KidsHomePage() {
  const t = await getTranslations("kids");

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
          <Sparkles className="h-4 w-4" />
          {t("home.badge")}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {t("home.title")}
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Promi Introduction */}
      <div className="mb-10 p-6 bg-white dark:bg-card rounded-2xl shadow-lg border-2 border-primary/20">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <PromiCharacter mood="happy" size="lg" />
          </div>
          <div className="text-left">
            <p className="text-lg font-medium mb-2">{t("home.promiIntro.greeting")}</p>
            <p className="text-muted-foreground">
              {t("home.promiIntro.message")}
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="text-3xl mb-2">🎮</div>
          <h3 className="font-semibold mb-1">{t("home.features.games.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("home.features.games.description")}</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="text-3xl mb-2">📖</div>
          <h3 className="font-semibold mb-1">{t("home.features.stories.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("home.features.stories.description")}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="font-semibold mb-1">{t("home.features.stars.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("home.features.stars.description")}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/kids/map">
            <Play className="h-5 w-5 mr-2" />
            {t("home.startButton")}
          </Link>
        </Button>
      </div>

      {/* Age note */}
      <p className="mt-8 text-sm text-muted-foreground">
        {t("home.ageNote")}
      </p>
    </div>
  );
}
