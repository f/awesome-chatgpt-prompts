import { notFound } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { getLevelBySlug, getAdjacentLevels, getAllLevels } from "@/lib/kids/levels";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

interface LevelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllLevels().map((level) => ({
    slug: level.slug,
  }));
}

export async function generateMetadata({ params }: LevelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const level = getLevelBySlug(slug);

  if (!level) {
    return { title: "Level Not Found" };
  }

  return {
    title: `${level.title} | Learn Prompting for Kids`,
    description: level.description,
  };
}

export default async function LevelPage({ params }: LevelPageProps) {
  const { slug } = await params;
  const level = getLevelBySlug(slug);
  const t = await getTranslations("kids");
  const locale = await getLocale();

  if (!level) {
    notFound();
  }

  const { prev, next } = getAdjacentLevels(slug);

  // Try to load locale-specific content, fall back to English
  let Content;
  try {
    Content = (await import(`@/content/kids/${locale}/${slug}.mdx`)).default;
  } catch {
    try {
      Content = (await import(`@/content/kids/en/${slug}.mdx`)).default;
    } catch {
      Content = () => (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t("level.comingSoon")}
          </p>
        </div>
      );
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Level Header */}
      <header className="mb-8">
        <Link 
          href="/kids/map" 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
        >
          <Map className="h-4 w-4" />
          {t("level.backToMap")}
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {t("level.levelLabel", { number: `${level.world}-${level.levelNumber}` })}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {level.title}
        </h1>
        <p className="text-muted-foreground">
          {level.description}
        </p>
      </header>

      {/* Level Content */}
      <div className="prose max-w-none kids-prose">
        <Content />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between mt-12 pt-6 border-t">
        {prev ? (
          <Button variant="outline" asChild className="gap-2 rounded-xl">
            <Link href={`/kids/level/${prev.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prev.title}</span>
              <span className="sm:hidden">{t("level.previous")}</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        
        <Button variant="ghost" asChild>
          <Link href="/kids/map">
            <Map className="h-4 w-4 mr-2" />
            {t("level.map")}
          </Link>
        </Button>
        
        {next ? (
          <Button variant="outline" asChild className="gap-2 rounded-xl">
            <Link href={`/kids/level/${next.slug}`}>
              <span className="hidden sm:inline">{next.title}</span>
              <span className="sm:hidden">{t("level.next")}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
