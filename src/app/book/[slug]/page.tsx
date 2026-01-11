import { notFound } from "next/navigation";
import Link from "next/link";
import { getChapterBySlug, getAdjacentChapters, getAllChapters } from "@/lib/book/chapters";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileTOCButton } from "@/components/book/sidebar";
import type { Metadata } from "next";

interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllChapters().map((chapter) => ({
    slug: chapter.slug,
  }));
}

export async function generateMetadata({ params }: ChapterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return { title: "Chapter Not Found" };
  }

  return {
    title: `${chapter.title} | The Interactive Book of Prompting`,
    description: chapter.description || `Learn about ${chapter.title.toLowerCase()} in prompt engineering.`,
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const { prev, next } = getAdjacentChapters(slug);

  let Content;
  try {
    Content = (await import(`@/content/book/${slug}.mdx`)).default;
  } catch {
    Content = () => (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          This chapter is coming soon.
        </p>
      </div>
    );
  }

  return (
    <article>
      {/* Chapter Header */}
      <header className="mb-8">
        <div className="text-sm text-primary font-medium mb-1">
          {chapter.part}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{chapter.title}</h1>
          <MobileTOCButton />
        </div>
        {chapter.description && (
          <p className="text-muted-foreground">
            {chapter.description}
          </p>
        )}
      </header>

      {/* Chapter Content */}
      <div className="prose max-w-none">
        <Content />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between mt-12 pt-6 border-t">
        {prev ? (
          <Button variant="ghost" asChild className="gap-2">
            <Link href={`/book/${prev.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{prev.title}</span>
              <span className="sm:hidden">Previous</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {next ? (
          <Button variant="ghost" asChild className="gap-2">
            <Link href={`/book/${next.slug}`}>
              <span className="hidden sm:inline">{next.title}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </nav>
    </article>
  );
}
