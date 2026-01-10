import Link from "next/link";
import { parts } from "@/lib/book/chapters";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Art of Prompting | prompts.chat",
  description: "A Guide to Crafting Clear and Effective Prompts",
};

export default function BookHomePage() {
  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          The Art of Prompting
        </h1>
        <p className="text-muted-foreground">
          A Guide to Crafting Clear and Effective Prompts
        </p>
      </div>

      {/* CTA */}
      <div className="mb-8">
        <Button asChild>
          <Link href="/book/00a-preface">
            Start Reading
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Table of Contents */}
      <div className="space-y-6">
        {parts.map((part) => (
          <section key={part.slug}>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              {part.number === 0 ? part.title : `Part ${part.number}: ${part.title}`}
            </h2>
            <div className="space-y-1">
              {part.chapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/book/${chapter.slug}`}
                  className="group flex items-center gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-xs font-mono text-muted-foreground w-6">
                    {String(chapter.chapterNumber).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {chapter.title}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t text-sm text-muted-foreground">
        <p>
          Part of the{" "}
          <a href="https://github.com/f/awesome-chatgpt-prompts" className="text-primary hover:underline">
            Awesome ChatGPT Prompts
          </a>{" "}
          project. Licensed under CC0.
        </p>
      </div>
    </div>
  );
}
