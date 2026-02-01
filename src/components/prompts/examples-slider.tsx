"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExamplesSliderProps {
  examples: Array<{
    id: string;
    mediaUrl: string;
    user: {
      username: string;
      name: string | null;
      avatar: string | null;
    };
  }>;
  mainMediaUrl: string;
  title: string;
  isVideo?: boolean;
  className?: string;
}

export function ExamplesSlider({
  examples,
  mainMediaUrl,
  title,
  isVideo = false,
  className,
}: ExamplesSliderProps) {
  const allMedia = [
    { id: "main", mediaUrl: mainMediaUrl, user: null },
    ...examples.map((e) => ({ id: e.id, mediaUrl: e.mediaUrl, user: e.user })),
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  useEffect(() => {
    if (!isHovering || allMedia.length <= 1) return;

    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isHovering, allMedia.length, nextSlide]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ height: "400px" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => { setIsHovering(false); setCurrentIndex(0); }}
    >
      <div 
        className="flex flex-col transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateY(-${currentIndex * 100}%)` }}
      >
        {allMedia.map((media) => (
          <div key={media.id} className="w-full h-full flex-shrink-0">
            {isVideo ? (
              <video
                src={media.mediaUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              <img
                src={media.mediaUrl}
                alt={title}
                className="w-full h-full object-cover object-top"
              />
            )}
          </div>
        ))}
      </div>

      {/* User tag - positioned at bottom, just above title */}
      {allMedia[currentIndex]?.user && (
        <div className="absolute bottom-1 left-3 z-20 flex items-center gap-1">
          <Avatar className="h-3.5 w-3.5 border border-white/30">
            <AvatarImage src={allMedia[currentIndex].user?.avatar || undefined} />
            <AvatarFallback className="text-[7px] bg-muted">
              {allMedia[currentIndex].user?.name?.charAt(0) || allMedia[currentIndex].user?.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[10px] font-medium text-foreground">@{allMedia[currentIndex].user?.username}</span>
        </div>
      )}
      
      {/* Slide indicators */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {allMedia.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-3"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
