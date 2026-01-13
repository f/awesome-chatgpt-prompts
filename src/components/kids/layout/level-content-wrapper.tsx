"use client";

import { useState, Children, isValidElement, ReactNode, ReactElement, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Section } from "@/components/kids/elements";
import { useSetLevelSlug } from "@/components/kids/providers/level-context";
import { getLevelBySlug } from "@/lib/kids/levels";
import { analyticsKids } from "@/lib/analytics";

interface LevelContentWrapperProps {
  children: ReactNode;
  levelSlug: string;
  levelNumber: string;
}

export function LevelContentWrapper({ children, levelSlug, levelNumber }: LevelContentWrapperProps) {
  const t = useTranslations("kids");
  const [currentSection, setCurrentSection] = useState(0);
  const setLevelSlug = useSetLevelSlug();
  
  // Set the level slug in context when component mounts
  useEffect(() => {
    setLevelSlug(levelSlug);
    
    // Track level view
    const level = getLevelBySlug(levelSlug);
    if (level) {
      analyticsKids.viewLevel(levelSlug, level.world);
    }
    
    return () => setLevelSlug(""); // Clear when unmounting
  }, [levelSlug, setLevelSlug]);

  // Extract Section components from children
  const sections: ReactElement[] = [];
  let hasExplicitSections = false;
  
  // First pass: check if there are explicit Section components
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === Section) {
      hasExplicitSections = true;
    }
  });

  // Second pass: collect sections
  if (hasExplicitSections) {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === Section) {
        sections.push(child);
      }
    });
  } else {
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        sections.push(<Section key={sections.length}>{child}</Section>);
      }
    });
  }

  // If no sections found, show coming soon
  if (sections.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center pixel-panel p-6">
          <p className="text-[#5D4037] mb-4">{t("level.comingSoon")}</p>
          <Link href="/kids/map" className="pixel-btn pixel-btn-green px-4 py-2 inline-flex items-center gap-2">
            <PixelMapIcon />
            {t("level.backToMap")}
          </Link>
        </div>
      </div>
    );
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

  // Reset to first section when level changes
  useEffect(() => {
    setCurrentSection(0);
  }, [levelSlug]);

  return (
    <div className="h-full flex flex-col">
      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4">
        <div className="w-full max-w-2xl my-auto">
          <div 
            key={currentSection}
            className="animate-in fade-in slide-in-from-right-4 duration-300 prose max-w-none kids-prose-pixel"
          >
            {sections[currentSection]}
          </div>
        </div>
      </div>

      {/* Navigation footer - pixel art style */}
      <div className="shrink-0 bg-[#2C1810] border-t-4 border-[#8B4513]">
        <div className="max-w-2xl mx-auto py-3 px-4 flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={goToPrev}
            disabled={isFirstSection}
            className={cn(
              "pixel-btn px-6 py-3 text-xl",
              isFirstSection && "opacity-0 pointer-events-none"
            )}
          >
            <span className="flex items-center gap-1">
              <PixelArrowLeft />
              {t("navigation.back")}
            </span>
          </button>

          {/* Progress indicators - pixel style */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSections }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSection(i)}
                className={cn(
                  "w-4 h-4 border-2 transition-all",
                  i === currentSection
                    ? "bg-[#22C55E] border-[#16A34A]"
                    : i < currentSection
                    ? "bg-[#3B82F6] border-[#2563EB]"
                    : "bg-[#4A3728] border-[#8B4513] hover:bg-[#5D4037]"
                )}
                style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
                aria-label={`Go to section ${i + 1}`}
              />
            ))}
          </div>

          {/* Next button or Map link */}
          {!isLastSection ? (
            <button
              onClick={goToNext}
              className="pixel-btn pixel-btn-green px-6 py-3 text-xl"
            >
              <span className="flex items-center gap-1">
                {t("navigation.next")}
                <PixelArrowRight />
              </span>
            </button>
          ) : (
            <Link
              href="/kids/map"
              className="pixel-btn pixel-btn-amber px-6 py-3 text-xl"
            >
              <span className="flex items-center gap-1">
                <PixelMapIcon />
                {t("level.map")}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Pixel art icons
function PixelArrowLeft() {
  return (
    <svg viewBox="0 0 12 12" className="w-4 h-4" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="5" width="6" height="2" fill="currentColor" />
      <rect x="2" y="5" width="2" height="2" fill="currentColor" />
      <rect x="4" y="3" width="2" height="2" fill="currentColor" />
      <rect x="4" y="7" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

function PixelArrowRight() {
  return (
    <svg viewBox="0 0 12 12" className="w-4 h-4" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="5" width="6" height="2" fill="currentColor" />
      <rect x="8" y="5" width="2" height="2" fill="currentColor" />
      <rect x="6" y="3" width="2" height="2" fill="currentColor" />
      <rect x="6" y="7" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

function PixelMapIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" style={{ imageRendering: "pixelated" }}>
      {/* Pin head - circle */}
      <rect x="5" y="1" width="6" height="2" fill="currentColor" />
      <rect x="4" y="2" width="8" height="2" fill="currentColor" />
      <rect x="3" y="3" width="10" height="4" fill="currentColor" />
      <rect x="4" y="7" width="8" height="2" fill="currentColor" />
      <rect x="5" y="9" width="6" height="2" fill="currentColor" />
      {/* Pin point */}
      <rect x="6" y="11" width="4" height="2" fill="currentColor" />
      <rect x="7" y="13" width="2" height="2" fill="currentColor" />
      {/* Inner highlight */}
      <rect x="5" y="4" width="2" height="2" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}
