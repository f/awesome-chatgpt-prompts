"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { worlds, type Level, getAllLevels } from "@/lib/kids/levels";
import { getProgress, isLevelUnlocked, type KidsProgress } from "@/lib/kids/progress";
import { analyticsKids } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { 
  PixelTree, 
  PixelBush, 
  PixelCastle, 
  PixelMountain, 
  PixelFlower, 
  PixelStar,
  PixelRobot,
  PixelLevelNode 
} from "./pixel-art";

export function ProgressMap() {
  const t = useTranslations("kids");
  const [progress, setProgress] = useState<KidsProgress | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const allLevels = getAllLevels();

  useEffect(() => {
    setProgress(getProgress());
    analyticsKids.viewMap();
  }, []);

  // Calculate positions for all levels in a continuous horizontal path
  const levelPositions = allLevels.map((_, index) => {
    const spacing = 200; // pixels between levels
    const x = 120 + index * spacing;
    // Create a gentle wave pattern - centered around 55%
    const y = 55 + Math.sin(index * 0.8) * 15;
    return { x, y };
  });

  // Calculate map width - ensure it fits content but also works on large screens
  const calculatedWidth = (allLevels.length * 200) + 240;
  const mapWidth = Math.max(calculatedWidth, 800);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Scroll controls for desktop */}
      <div className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20">
        <Button variant="secondary" size="icon" onClick={scrollLeft} className="rounded-full shadow-lg">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20">
        <Button variant="secondary" size="icon" onClick={scrollRight} className="rounded-full shadow-lg">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Horizontal scrolling map container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide flex justify-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div 
          className="relative h-full min-h-[400px] min-w-full"
          style={{ width: `${mapWidth}px`, imageRendering: "pixelated" }}
        >
          {/* Sky is handled by kids layout - no additional background needed */}
          
          {/* Pixel art ground layers - use full width (max of mapWidth or 100%) */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#8B5A2B]" style={{ minWidth: `${mapWidth}px` }} />
          <div className="absolute bottom-12 left-0 right-0 h-4 bg-[#228B22]" style={{ minWidth: `${mapWidth}px` }} />
          <div className="absolute bottom-16 left-0 right-0 h-2 bg-[#32CD32]" style={{ minWidth: `${mapWidth}px` }} />
          
          {/* Pixel art path connecting all levels */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-0" 
            style={{ width: `${mapWidth}px` }}
            preserveAspectRatio="none"
          >
            {/* Draw dotted path between levels - pixel style */}
            <path
              d={generatePathD(levelPositions)}
              fill="none"
              stroke="#D4A574"
              strokeWidth="12"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeDasharray="16 8"
            />
            {/* Path border for depth */}
            <path
              d={generatePathD(levelPositions)}
              fill="none"
              stroke="#8B5A2B"
              strokeWidth="16"
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeDasharray="16 8"
              className="opacity-30"
            />
          </svg>

          {/* Decorative elements - rendered after path so clouds appear on top */}
          <MapDecorations mapWidth={mapWidth} />

          {/* World labels - pixel art style */}
          {worlds.map((world) => {
            const firstLevelIndex = allLevels.findIndex(l => l.world === world.number);
            if (firstLevelIndex === -1) return null;
            const pos = levelPositions[firstLevelIndex];
            return (
              <div
                key={world.number}
                className="absolute z-10 pointer-events-none"
                style={{ left: `${pos.x - 50}px`, top: "12px" }}
              >
                <div 
                  className="px-4 py-2 bg-[#FFD700] border-3 border-[#DAA520] text-base font-bold text-[#8B4513] whitespace-nowrap"
                  style={{ 
                    clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)",
                  }}
                >
                  {t(`worlds.${world.number}.title`)}
                </div>
              </div>
            );
          })}

          {/* Level nodes */}
          {allLevels.map((level, index) => (
            <LevelNode
              key={level.slug}
              level={level}
              position={levelPositions[index]}
              progress={progress}
              index={index}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Progress bar at bottom - pixel art style */}
      <div className="shrink-0 px-4 py-3 bg-[#2C1810] border-t-4 border-[#8B4513]">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xl mb-2">
            <span className="font-bold text-2xl text-[#FFD700]">{t("map.title")}</span>
            <div className="flex items-center gap-2">
              <PixelStar filled className="w-6 h-6" />
              <span className="text-[#FFD700] font-bold text-xl">
                {getCompletedCount(progress, allLevels)} / {allLevels.length}
              </span>
            </div>
          </div>
          {/* Pixel art progress bar */}
          <div className="h-6 bg-[#4A3728] border-2 border-[#8B4513] relative overflow-hidden">
            <div 
              className="h-full bg-[#22C55E] transition-all duration-500"
              style={{ 
                width: `${(getCompletedCount(progress, allLevels) / allLevels.length) * 100}%`,
              }}
            />
            {/* Pixel segments overlay */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: allLevels.length }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-r border-[#2C1810] last:border-r-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePathD(positions: { x: number; y: number }[]): string {
  if (positions.length === 0) return "";
  
  let d = `M ${positions[0].x} ${positions[0].y}`;
  
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const midX = (prev.x + curr.x) / 2;
    // Create smooth curves
    d += ` Q ${midX} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2}`;
    d += ` Q ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  
  return d;
}

function MapDecorations({ mapWidth }: { mapWidth: number }) {
  // Generate decorations along the map - using seeded positions for consistency
  const decorations = [];
  const spacing = 100;
  
  for (let i = 0; i < Math.floor(mapWidth / spacing); i++) {
    const x = 50 + i * spacing;
    const type = i % 5;
    const yOffset = Math.sin(i * 0.8) * 10;
    
    decorations.push(
      <div 
        key={`deco-${i}`}
        className="absolute pointer-events-none"
        style={{ 
          left: `${x + (i % 3) * 15}px`, 
          bottom: `${55 + yOffset + (i % 4) * 5}px` 
        }}
      >
        {type === 0 && <PixelTree />}
        {type === 1 && <PixelBush />}
        {type === 2 && <PixelFlower color={i % 2 === 0 ? "#FF69B4" : "#FF6347"} />}
        {type === 3 && <PixelTree className="w-10 h-14" />}
        {type === 4 && <PixelMountain />}
      </div>
    );
  }

// Add castle at the end
  decorations.push(
    <div 
      key="castle"
      className="absolute pointer-events-none"
      style={{ left: `${mapWidth - 80}px`, bottom: "50px" }}
    >
      <PixelCastle />
    </div>
  );

  return <>{decorations}</>;
}

function getCompletedCount(progress: KidsProgress | null, levels: Level[]): number {
  if (!progress) return 0;
  return levels.filter(l => progress.levels[l.slug]?.completed).length;
}

interface LevelNodeProps {
  level: Level;
  position: { x: number; y: number };
  progress: KidsProgress | null;
  index: number;
  t: ReturnType<typeof useTranslations>;
}

function LevelNode({ level, position, progress, index, t }: LevelNodeProps) {
  const [unlocked, setUnlocked] = useState(false);
  const levelProgress = progress?.levels[level.slug];
  const isCompleted = levelProgress?.completed;
  const stars = levelProgress?.stars || 0;

  useEffect(() => {
    setUnlocked(isLevelUnlocked(level.slug));
  }, [level.slug, progress]);

  const state = !unlocked ? "locked" : isCompleted ? "completed" : "available";

  const nodeContent = (
    <div 
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
        "animate-in fade-in zoom-in",
        unlocked && !isCompleted && "hover:scale-110",
        isCompleted && "hover:scale-110",
      )}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}%`,
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Pixel art level node */}
      <PixelLevelNode 
        state={state}
        levelNumber={`${level.world}.${level.levelNumber}`}
      />
      
      {/* Stars for completed levels */}
      {isCompleted && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0">
          {[1, 2, 3].map((star) => (
            <PixelStar key={star} filled={star <= stars} />
          ))}
        </div>
      )}
      
      {/* Level title label - pixel style */}
      <div 
        className="absolute top-full mt-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-2 text-base font-bold bg-amber-100 dark:bg-amber-900 border-2 border-amber-400"
        style={{ 
          clipPath: "polygon(4px 0%, calc(100% - 4px) 0%, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0% calc(100% - 4px), 0% 4px)",
        }}
      >
        {t(`levels.${level.slug.replace(/-/g, "_")}.title`)}
      </div>
    </div>
  );

  if (!unlocked) {
    return <div className="group cursor-not-allowed">{nodeContent}</div>;
  }

  return (
    <Link href={`/kids/level/${level.slug}`} className="group cursor-pointer">
      {nodeContent}
    </Link>
  );
}
