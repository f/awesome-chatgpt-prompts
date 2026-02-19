"use client";

import { useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { ChevronLeft, ChevronRight, X, Maximize, Minimize, StickyNote, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SlideDeckProps {
  children: ReactNode[];
  notes?: string[];
}

function updateNotesPopup(popup: Window | null, slideIndex: number, totalSlides: number, note?: string) {
  if (!popup || popup.closed) return;
  try {
    popup.document.getElementById("slide-num")!.textContent = `Slide ${slideIndex + 1} / ${totalSlides}`;
    popup.document.getElementById("note-text")!.textContent = note || "(no notes for this slide)";
    const bar = popup.document.getElementById("progress-bar") as HTMLDivElement;
    if (bar) bar.style.width = `${((slideIndex + 1) / totalSlides) * 100}%`;
  } catch { /* popup may be cross-origin or closed */ }
}

function openNotesPopup(slideIndex: number, totalSlides: number, note?: string): Window | null {
  const popup = window.open("", "speaker-notes", "width=500,height=320,top=100,left=100");
  if (!popup) return null;
  popup.document.write(`<!DOCTYPE html>
<html><head><title>Speaker Notes</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; background: #111; color: #eee; }
  #header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  #slide-num { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  #elapsed { font-size: 13px; color: #888; font-variant-numeric: tabular-nums; }
  #note-text { font-size: 20px; line-height: 1.6; }
  #progress-bar { height: 4px; background: #3b82f6; transition: width 0.4s ease; border-radius: 2px; }
  #progress-bg { height: 4px; background: #333; border-radius: 2px; position: fixed; bottom: 0; left: 0; right: 0; }
  #hint { position: fixed; bottom: 8px; right: 12px; font-size: 11px; color: #555; }
</style></head><body>
  <div id="header">
    <div id="slide-num">Slide ${slideIndex + 1} / ${totalSlides}</div>
    <div id="elapsed">00:00</div>
  </div>
  <div id="note-text">${note || "(no notes for this slide)"}</div>
  <div id="progress-bg"><div id="progress-bar" style="width:${((slideIndex + 1) / totalSlides) * 100}%"></div></div>
  <div id="hint">\u2190 \u2192 navigate \u00b7 F fullscreen</div>
  <script>
    var start = Date.now();
    setInterval(function() {
      var s = Math.floor((Date.now() - start) / 1000);
      var m = Math.floor(s / 60);
      s = s % 60;
      var el = document.getElementById('elapsed');
      if (el) el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
    document.addEventListener('keydown', function(e) {
      if (!window.opener || !window.opener.__slideDeck) return;
      var sd = window.opener.__slideDeck;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); sd.next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); sd.prev(); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); sd.fullscreen(); }
    });
  </script>
</body></html>`);
  popup.document.close();
  return popup;
}

export function SlideDeck({ children, notes }: SlideDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const notesPopupRef = useRef<Window | null>(null);
  const totalSlides = children.length;
  const currentNote = notes?.[currentSlide];

  // Expose navigation methods for popup window
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__slideDeck = {
      next: () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1)),
      prev: () => setCurrentSlide((prev) => Math.max(prev - 1, 0)),
      fullscreen: () => {
        if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
        else document.exitFullscreen();
      },
    };
    return () => { delete (window as unknown as Record<string, unknown>).__slideDeck; };
  }, [totalSlides]);

  const openPopup = useCallback(() => {
    if (notesPopupRef.current && !notesPopupRef.current.closed) {
      notesPopupRef.current.focus();
      return;
    }
    notesPopupRef.current = openNotesPopup(currentSlide, totalSlides, notes?.[currentSlide]);
  }, [currentSlide, totalSlides, notes]);

  useEffect(() => {
    updateNotesPopup(notesPopupRef.current, currentSlide, totalSlides, notes?.[currentSlide]);
  }, [currentSlide, totalSlides, notes]);

  useEffect(() => {
    return () => {
      if (notesPopupRef.current && !notesPopupRef.current.closed) {
        notesPopupRef.current.close();
      }
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setShowNotes((v) => !v);
      } else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        openPopup();
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        // Escape when not in fullscreen — do nothing, browser handles fullscreen exit
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, toggleFullscreen, openPopup]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <div className="text-sm font-medium text-muted-foreground bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full">
          {currentSlide + 1} / {totalSlides}
        </div>
        {notes && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={openPopup}
              className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
              title="Open notes in popup (P)"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="sr-only">Open notes popup</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotes((v) => !v)}
              className={cn("rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80", showNotes && "text-primary")}
              title="Toggle inline notes (N)"
            >
              <StickyNote className="w-5 h-5" />
              <span className="sr-only">{showNotes ? "Hide notes" : "Show notes"}</span>
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          <span className="sr-only">{isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}</span>
        </Button>
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

      {/* Speaker Notes */}
      {showNotes && currentNote && (
        <div className="absolute bottom-16 left-4 right-4 z-50 max-w-2xl mx-auto">
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-lg">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Speaker Notes</div>
            <p className="text-sm text-foreground leading-relaxed">{currentNote}</p>
          </div>
        </div>
      )}

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
    <h1 className={cn("text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 md:mb-12 leading-normal text-foreground", className)}>
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
