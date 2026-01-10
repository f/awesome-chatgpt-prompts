"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { parts } from "@/lib/book/chapters";
import { Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BookSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-20">
        {/* Header */}
        <div className="mb-4 pb-4 border-b">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Book className="h-4 w-4" />
            <span>The Art of Prompting</span>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <nav className="space-y-4 pr-4">
            {parts.map((part) => (
              <div key={part.slug}>
                <h4 className="mb-1 text-sm font-medium text-foreground">
                  {part.number === 0 ? part.title : `${part.number}. ${part.title}`}
                </h4>
                <div className="space-y-0.5">
                  {part.chapters.map((chapter) => {
                    const href = `/book/${chapter.slug}`;
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={chapter.slug}
                        href={href}
                        className={cn(
                          "block py-1 px-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        {chapter.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
