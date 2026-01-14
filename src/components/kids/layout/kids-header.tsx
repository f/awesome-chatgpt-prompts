"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import { getTotalStars, getCompletedLevelsCount } from "@/lib/kids/progress";
import { getTotalLevels, getLevelBySlug } from "@/lib/kids/levels";
import { PixelStar, PixelRobot } from "@/components/kids/elements/pixel-art";
import { MusicButton } from "./background-music";
import { SettingsButton } from "./settings-modal";
import { useLevelSlug } from "@/components/kids/providers/level-context";

export function KidsHeader() {
  const t = useTranslations("kids");
  const [stars, setStars] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const total = getTotalLevels();
  
  // Get current level from context (will be empty if not in a level)
  const levelSlug = useLevelSlug();
  const currentLevel = levelSlug ? getLevelBySlug(levelSlug) : null;
  const levelNumber = currentLevel ? `${currentLevel.world}.${currentLevel.levelNumber}` : null;

  useEffect(() => {
    setStars(getTotalStars());
    setCompleted(getCompletedLevelsCount());
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="shrink-0 z-50 w-full bg-[#2C1810] border-b-4 border-[#8B4513]">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <a href="/kids" className="flex items-center gap-2">
          <PixelRobot className="w-8 h-10" />
          <span className="text-[#FFD700] font-bold text-2xl pixel-text-shadow hidden sm:block">
            {t("header.title")}
          </span>
        </a>

        {/* Stats & Nav */}
        <div className="flex items-center gap-3">
          {/* Current level indicator */}
          {levelNumber && (
            <div className="flex items-center gap-1 px-3 h-8 bg-[#FFD700] border-2 border-[#DAA520] pixel-border-sm">
              <span className="text-[#8B4513] text-sm font-bold">
                {t("level.levelLabel", { number: levelNumber })}
              </span>
            </div>
          )}

          {/* Stars counter */}
          <div className="flex items-center gap-1 px-3 h-8 bg-[#4A3728] border-2 border-[#8B4513] pixel-border-sm">
            <PixelStar filled className="w-4 h-4" />
            <span className="text-white text-sm">{stars}</span>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-1 px-3 h-8 bg-[#4A3728] border-2 border-[#8B4513] pixel-border-sm">
            <span className="text-[#22C55E] text-sm">{completed}/{total}</span>
          </div>

          {/* Nav buttons - desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <MusicButton />
            <SettingsButton />
            <a 
              href="/kids" 
              className="pixel-btn px-3 py-1.5 text-sm h-8 flex items-center"
            >
              <PixelHomeIcon />
            </a>
            <Link 
              href="/kids/map" 
              className="pixel-btn pixel-btn-green px-3 py-1.5 text-sm h-8 flex items-center"
            >
              <PixelMapIcon />
            </Link>
            {/* Back to main site */}
            <a 
              href="/" 
              className="hidden md:flex pixel-btn pixel-btn-amber px-3 py-1.5 text-sm h-8 items-center"
            >
              {t("header.mainSite")}
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="pixel-btn px-3 py-1.5 h-8 flex items-center"
              aria-label="Menu"
            >
              <PixelMenuIcon />
            </button>

            {/* Mobile dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#2C1810] border-4 border-[#8B4513] rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 flex flex-col gap-2">
                  {/* Progress - mobile only */}
                  <div className="flex items-center justify-center gap-1 px-3 py-2 bg-[#4A3728] border-2 border-[#8B4513] pixel-border-sm">
                    <span className="text-[#22C55E] text-sm">{completed}/{total}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <MusicButton />
                    <SettingsButton />
                  </div>
                  
                  <a 
                    href="/kids" 
                    className="pixel-btn px-3 py-2 text-sm flex items-center justify-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <PixelHomeIcon />
                    {t("header.home")}
                  </a>
                  <Link 
                    href="/kids/map" 
                    className="pixel-btn pixel-btn-green px-3 py-2 text-sm flex items-center justify-center gap-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    <PixelMapIcon />
                    {t("level.map")}
                  </Link>
                  <a 
                    href="/" 
                    className="pixel-btn pixel-btn-amber px-3 py-2 text-sm flex items-center justify-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t("header.mainSite")}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Pixel art home icon
function PixelHomeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
      <rect x="7" y="1" width="2" height="2" fill="currentColor" />
      <rect x="5" y="3" width="6" height="2" fill="currentColor" />
      <rect x="3" y="5" width="10" height="2" fill="currentColor" />
      <rect x="2" y="7" width="12" height="2" fill="currentColor" />
      <rect x="3" y="9" width="10" height="6" fill="currentColor" />
      <rect x="6" y="11" width="4" height="4" fill="#2C1810" />
    </svg>
  );
}

// Pixel art pin/location icon
function PixelMapIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
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

// Pixel art hamburger menu icon
function PixelMenuIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="3" width="12" height="2" fill="currentColor" />
      <rect x="2" y="7" width="12" height="2" fill="currentColor" />
      <rect x="2" y="11" width="12" height="2" fill="currentColor" />
    </svg>
  );
}
