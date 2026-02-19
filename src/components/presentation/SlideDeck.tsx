"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SlideDeckProps {
  children: ReactNode[];
}

export function SlideDeck({ children }: SlideDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = children.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <div className="text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
          {currentSlide + 1} / {totalSlides}
        </div>
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80">
            <X className="w-5 h-5" />
            <span className="sr-only">Close</span>
          </Button>
        </Link>
      </div>

      {/* Slides Container */}
      <div className="flex-1 relative">
        {children.map((child, index) => {
          // Calculate the relative position (-1 is left, 0 is active, 1 is right)
          const offset = index - currentSlide;
          
          let translateX = "translate-x-full";
          if (offset === 0) translateX = "translate-x-0";
          else if (offset < 0) translateX = "-translate-x-full";

          return (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center p-8 md:p-16 lg:p-24",
                translateX,
                offset === 0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}
            >
              <div className="w-full max-w-5xl mx-auto">
                {child}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center items-center gap-8">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-full w-12 h-12 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="sr-only">Previous</span>
        </Button>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                i === currentSlide 
                  ? "bg-primary w-8" 
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={currentSlide === totalSlides - 1}
          className="rounded-full w-12 h-12 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          <ChevronRight className="w-6 h-6" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Helper components for slide content
export function SlideTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 md:mb-12 text-balance leading-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70", className)}>
      {children}
    </h1>
  );
}

export function SlideContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-xl md:text-3xl lg:text-4xl leading-relaxed text-muted-foreground font-medium", className)}>
      {children}
    </div>
  );
}

export function SlideHighlight({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-primary font-semibold", className)}>
      {children}
    </span>
  );
}
