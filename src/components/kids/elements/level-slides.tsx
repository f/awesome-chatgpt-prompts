"use client";

import { useState, Children, isValidElement, ReactNode, ReactElement } from "react";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SectionProps {
  children: ReactNode;
}

export function Section({ children }: SectionProps) {
  return <>{children}</>;
}

interface LevelSlidesProps {
  children: ReactNode;
  levelSlug: string;
}

export function LevelSlides({ children, levelSlug }: LevelSlidesProps) {
  const t = useTranslations("kids");
  const [currentSection, setCurrentSection] = useState(0);

  // Extract Section components from children
  const sections: ReactElement[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Section) {
      sections.push(child);
    }
  });

  // If no sections found, wrap all content in one section
  if (sections.length === 0) {
    sections.push(<Section key="default">{children}</Section>);
  }

  const totalSections = sections.length;
  const isFirstSection = currentSection === 0;
  const isLastSection = currentSection === totalSections - 1;

  const goToNext = () => {
    if (!isLastSection) {
      setCurrentSection((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (!isFirstSection) {
      setCurrentSection((prev) => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Content area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        <div className="w-full max-w-2xl h-full flex flex-col justify-center">
          <div 
            key={currentSection}
            className="animate-in fade-in slide-in-from-right-4 duration-300 prose max-w-none kids-prose"
          >
            {sections[currentSection]}
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="shrink-0 border-t bg-white/50 dark:bg-background/50 backdrop-blur">
        <div className="container py-4 flex items-center justify-between">
          {/* Back button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrev}
            disabled={isFirstSection}
            className={cn(
              "rounded-full px-6 transition-opacity",
              isFirstSection && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            {t("navigation.back")}
          </Button>

          {/* Progress indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSections }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSection(i)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all",
                  i === currentSection
                    ? "bg-primary w-8"
                    : i < currentSection
                    ? "bg-primary/50"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to section ${i + 1}`}
              />
            ))}
          </div>

          {/* Next button or Map link */}
          {!isLastSection ? (
            <Button
              size="lg"
              onClick={goToNext}
              className="rounded-full px-6"
            >
              {t("navigation.next")}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-6"
            >
              <Link href="/kids/map">
                <Map className="h-5 w-5 mr-1" />
                {t("level.map")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
