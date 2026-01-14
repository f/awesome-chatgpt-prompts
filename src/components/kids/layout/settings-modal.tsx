"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { clearAllProgress, getTotalStars, getCompletedLevelsCount } from "@/lib/kids/progress";
import { setLocale } from "@/lib/i18n/client";
import { analyticsKids } from "@/lib/analytics";
import { Settings, X, Globe, Trash2, Check, Volume2 } from "lucide-react";
import { MusicVolumeSlider } from "./background-music";

const SUPPORTED_LOCALES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "nl", label: "Dutch", flag: "🇳🇱" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fa", label: "فارسی", flag: "🇮🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "el", label: "Ελληνικά", flag: "🇬🇷" },
];

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          analyticsKids.openSettings();
        }}
        className="pixel-btn pixel-btn-purple px-3 py-1.5 text-sm h-8 flex items-center"
        aria-label="Settings"
      >
        <PixelSettingsIcon />
      </button>

      {isOpen && <SettingsModal onClose={() => setIsOpen(false)} />}
    </>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("kids.settings");
  const currentLocale = useLocale();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const stars = getTotalStars();
  const completed = getCompletedLevelsCount();

  const handleLanguageChange = (locale: string) => {
    if (locale === currentLocale) return;
    
    analyticsKids.changeLanguage(locale);
    clearAllProgress();
    setLocale(locale);
  };

  const handleResetProgress = () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      return;
    }
    
    clearAllProgress();
    analyticsKids.resetProgress();
    setResetComplete(true);
    setShowResetConfirm(false);
    
    // Reload to reflect changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#FEF3C7] border-4 border-[#8B4513] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 text-[#8B4513] hover:bg-[#8B4513]/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#8B4513] mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          {t("title")}
        </h2>

        {/* Music Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#5D4037] mb-3 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {t("music")}
          </h3>
          <MusicVolumeSlider />
          <p className="mt-3 text-xs text-[#8B7355]">
            Music by{" "}
            <a 
              href="https://pixabay.com/users/djartmusic-46653586/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=301272"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#8B4513]"
            >
              Krzysztof Szymanski
            </a>{" "}
            from{" "}
            <a 
              href="https://pixabay.com/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=301272"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#8B4513]"
            >
              Pixabay
            </a>
          </p>
        </div>

        {/* Language Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#5D4037] mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {t("language")}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SUPPORTED_LOCALES.map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={cn(
                  "p-2 rounded-lg border-2 text-sm font-medium transition-all",
                  currentLocale === locale.code
                    ? "bg-[#8B4513] border-[#5D4037] text-white"
                    : "bg-white border-[#D4A574] text-[#5D4037] hover:border-[#8B4513]"
                )}
              >
                <span className="text-lg">{locale.flag}</span>
                <div className="text-xs mt-1">{locale.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Info */}
        <div className="mb-6 p-4 bg-white/50 rounded-lg border-2 border-[#D4A574]">
          <h3 className="text-lg font-bold text-[#5D4037] mb-2">
            {t("progress")}
          </h3>
          <div className="flex gap-4 text-[#5D4037]">
            <div>
              <span className="text-2xl font-bold text-[#FFD700]">⭐ {stars}</span>
              <div className="text-xs">{t("stars")}</div>
            </div>
            <div>
              <span className="text-2xl font-bold text-[#22C55E]">✓ {completed}</span>
              <div className="text-xs">{t("completed")}</div>
            </div>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="border-t-2 border-[#D4A574] pt-4">
          <h3 className="text-lg font-bold text-[#5D4037] mb-3 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            {t("resetTitle")}
          </h3>
          
          {resetComplete ? (
            <div className="p-3 bg-green-100 border-2 border-green-500 rounded-lg text-green-700 font-medium flex items-center gap-2">
              <Check className="w-5 h-5" />
              {t("resetComplete")}
            </div>
          ) : showResetConfirm ? (
            <div className="space-y-2">
              <p className="text-red-600 font-medium text-sm">
                {t("resetWarning")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
                >
                  {t("resetConfirm")}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleResetProgress}
              className="w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg border-2 border-red-300"
            >
              {t("resetButton")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Pixel art settings/gear icon
function PixelSettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5" style={{ imageRendering: "pixelated" }}>
      <rect x="6" y="0" width="4" height="2" fill="currentColor" />
      <rect x="6" y="14" width="4" height="2" fill="currentColor" />
      <rect x="0" y="6" width="2" height="4" fill="currentColor" />
      <rect x="14" y="6" width="2" height="4" fill="currentColor" />
      <rect x="2" y="2" width="2" height="2" fill="currentColor" />
      <rect x="12" y="2" width="2" height="2" fill="currentColor" />
      <rect x="2" y="12" width="2" height="2" fill="currentColor" />
      <rect x="12" y="12" width="2" height="2" fill="currentColor" />
      <rect x="4" y="4" width="8" height="8" fill="currentColor" />
      <rect x="6" y="6" width="4" height="4" fill="#2C1810" />
    </svg>
  );
}
