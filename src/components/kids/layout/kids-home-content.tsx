"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { analyticsKids } from "@/lib/analytics";
import { PixelRobot, PixelStar, PixelTree, PixelCastle } from "@/components/kids/elements/pixel-art";

export function KidsHomeContent() {
  const t = useTranslations("kids");
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="h-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center p-4">
        <div className="w-full max-w-2xl my-auto">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#ffffff] border-2 border-[#DAA520] pixel-border-sm text-[#8B4513] text-lg mb-4">
                <PixelStar filled className="w-4 h-4" />
                {t("home.badge")}
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-[#2C1810] pixel-text-shadow">
                {t("home.title")}
              </h1>
              
              <p className="text-3xl md:text-4xl text-[#5D4037] mb-8">
                {t("home.subtitle")}
              </p>

              <div className="pixel-panel p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  <div className="shrink-0">
                    <PixelRobot className="w-16 h-20" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-2xl md:text-3xl font-bold text-[#2C1810] mb-2">{t("home.promiIntro.greeting")}</p>
                    <p className="text-xl md:text-2xl text-[#5D4037]">
                      {t("home.promiIntro.message")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Features */}
          {step === 1 && (
            <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#2C1810] pixel-text-shadow">
                {t("home.whatYouLearn")}
              </h2>
              
              <div className="grid gap-4">
                <div className="pixel-panel pixel-panel-green p-4 flex items-center gap-4">
                  <PixelGamepad />
                  <div className="text-left">
                    <h3 className="font-bold text-2xl md:text-3xl text-[#2C1810]">{t("home.features.games.title")}</h3>
                    <p className="text-xl md:text-2xl text-[#5D4037]">{t("home.features.games.description")}</p>
                  </div>
                </div>
                <div className="pixel-panel pixel-panel-blue p-4 flex items-center gap-4">
                  <PixelBook />
                  <div className="text-left">
                    <h3 className="font-bold text-2xl md:text-3xl text-[#2C1810]">{t("home.features.stories.title")}</h3>
                    <p className="text-xl md:text-2xl text-[#5D4037]">{t("home.features.stories.description")}</p>
                  </div>
                </div>
                <div className="pixel-panel p-4 flex items-center gap-4">
                  <div className="flex">
                    <PixelStar filled className="w-8 h-8" />
                    <PixelStar filled className="w-8 h-8" />
                    <PixelStar filled className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-2xl md:text-3xl text-[#2C1810]">{t("home.features.stars.title")}</h3>
                    <p className="text-xl md:text-2xl text-[#5D4037]">{t("home.features.stars.description")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ready to start */}
          {step === 2 && (
            <div className="text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex justify-center items-end gap-4">
                <PixelTree className="w-10 h-14" />
                <PixelRobot className="w-16 h-20 animate-bounce-slow" />
                <PixelCastle className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2C1810] pixel-text-shadow">
                {t("home.readyTitle")}
              </h2>
              
              <p className="text-xl md:text-2xl text-[#5D4037] mb-8">
                {t("home.readyMessage")}
              </p>

              <Link 
                href="/kids/map"
                onClick={() => analyticsKids.startGame()}
                className="inline-block pixel-btn pixel-btn-green text-xl md:text-2xl px-8 py-4"
              >
                <span className="flex items-center gap-2">
                  <PixelPlayIcon />
                  {t("home.startButton")}
                </span>
              </Link>

              <p className="mt-6 text-lg text-[#8B7355]">
                {t("home.ageNote")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation footer - pixel art style */}
      <div className="shrink-0 bg-[#2C1810] border-t-4 border-[#8B4513]">
        <div className="container py-3 flex flex-col gap-3 sm:gap-0">
          {/* Buttons row */}
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={prevStep}
              disabled={step === 0}
              className={cn(
                "pixel-btn px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg",
                step === 0 && "opacity-0 pointer-events-none"
              )}
            >
              <span className="flex items-center gap-1">
                <PixelArrowLeft />
                {t("navigation.back")}
              </span>
            </button>

            {/* Step indicators - desktop only, centered */}
            <div className="hidden sm:flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "w-4 h-4 border-2 transition-all",
                    i === step
                      ? "bg-[#22C55E] border-[#16A34A]"
                      : "bg-[#4A3728] border-[#8B4513] hover:bg-[#5D4037]"
                  )}
                  style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            {step < totalSteps - 1 ? (
              <button
                onClick={nextStep}
                className="pixel-btn pixel-btn-green px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg"
              >
                <span className="flex items-center gap-1">
                  {t("navigation.next")}
                  <PixelArrowRight />
                </span>
              </button>
            ) : (
              <Link
                href="/kids/map"
                className="pixel-btn pixel-btn-green px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg"
              >
                <span className="flex items-center gap-1">
                  <PixelPlayIcon />
                  {t("home.startButton")}
                </span>
              </Link>
            )}
          </div>

          {/* Step indicators - mobile only, below buttons */}
          <div className="flex sm:hidden items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "w-4 h-4 border-2 transition-all",
                  i === step
                    ? "bg-[#22C55E] border-[#16A34A]"
                    : "bg-[#4A3728] border-[#8B4513] hover:bg-[#5D4037]"
                )}
                style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pixel art icons
function PixelPlayIcon() {
  return (
    <svg viewBox="0 0 12 12" className="w-4 h-4" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="1" width="2" height="10" fill="currentColor" />
      <rect x="4" y="3" width="2" height="6" fill="currentColor" />
      <rect x="6" y="4" width="2" height="4" fill="currentColor" />
      <rect x="8" y="5" width="2" height="2" fill="currentColor" />
    </svg>
  );
}

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

function PixelGamepad() {
  return (
    <svg viewBox="0 0 24 16" className="w-10 h-7" style={{ imageRendering: "pixelated" }}>
      <rect x="4" y="2" width="16" height="12" fill="#333" />
      <rect x="2" y="4" width="4" height="8" fill="#333" />
      <rect x="18" y="4" width="4" height="8" fill="#333" />
      <rect x="6" y="6" width="2" height="4" fill="#22C55E" />
      <rect x="4" y="7" width="6" height="2" fill="#22C55E" />
      <rect x="16" y="6" width="2" height="2" fill="#EF4444" />
      <rect x="18" y="8" width="2" height="2" fill="#3B82F6" />
    </svg>
  );
}

function PixelBook() {
  return (
    <svg viewBox="0 0 20 16" className="w-8 h-6" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="1" width="16" height="14" fill="#8B4513" />
      <rect x="4" y="2" width="12" height="12" fill="#FEF3C7" />
      <rect x="9" y="2" width="2" height="12" fill="#D97706" />
      <rect x="5" y="4" width="3" height="1" fill="#333" />
      <rect x="5" y="6" width="3" height="1" fill="#333" />
      <rect x="12" y="4" width="3" height="1" fill="#333" />
      <rect x="12" y="6" width="3" height="1" fill="#333" />
    </svg>
  );
}
