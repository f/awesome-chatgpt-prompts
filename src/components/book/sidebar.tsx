"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { parts } from "@/lib/book/chapters";
import { Book, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
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
                  onClick={onNavigate}
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
  );
}

export function MobileTOCButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <List className="h-4 w-4" />
            <span className="sr-only">Table of Contents</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 px-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              The Interactive Book of Prompting
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function BookSidebar() {
  return (
    <>
      {/* Desktop: Static sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-20">
          {/* Header */}
          <div className="mb-4 pb-4 border-b">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              <Book className="h-4 w-4" />
              <span>The Interactive Book of Prompting</span>
            </Link>
          </div>

          {/* Navigation */}
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <SidebarContent />
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
