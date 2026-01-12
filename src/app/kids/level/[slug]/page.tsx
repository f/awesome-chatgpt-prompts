import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getLevelBySlug, getAllLevels } from "@/lib/kids/levels";
import { LevelContentWrapper } from "@/components/kids/layout/level-content-wrapper";
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
  const locale = await getLocale();

  if (!level) {
    notFound();
  }

  // Try to load locale-specific content, fall back to English
  let Content;
  try {
    Content = (await import(`@/content/kids/${locale}/${slug}.mdx`)).default;
  } catch {
    try {
      Content = (await import(`@/content/kids/en/${slug}.mdx`)).default;
    } catch {
      Content = null;
    }
  }

  return (
    <LevelContentWrapper levelSlug={slug} levelNumber={`${level.world}-${level.levelNumber}`}>
      {Content ? <Content /> : null}
    </LevelContentWrapper>
  );
}
