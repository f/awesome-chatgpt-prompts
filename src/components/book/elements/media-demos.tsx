"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField } from "./locales";

const imagePartColors: Record<string, { bg: string; border: string; text: string }> = {
  subject: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  style: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  lighting: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  composition: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
  mood: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-300 dark:border-rose-700", text: "text-rose-700 dark:text-rose-300" },
};

export function TextToImageDemo() {
  const [selections, setSelections] = useState<Record<string, number>>({
    subject: 0, style: 0, lighting: 0, composition: 0, mood: 0,
  });
  const [step, setStep] = useState(0);
  const t = useTranslations("book.interactive");
  const locale = useLocale();

  const imagePromptOptions = getLocaleField(locale, "imagePromptOptions");
  const categoryLabels = getLocaleField(locale, "imageCategoryLabels");
  const categories = Object.keys(imagePromptOptions);
  
  const buildPrompt = () => {
    return categories.map(cat => imagePromptOptions[cat][selections[cat]]).join(", ");
  };

  const handleSelect = (category: string, index: number) => {
    setSelections(prev => ({ ...prev, [category]: index }));
  };

  const simulateDiffusion = () => {
    setStep(0);
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 5) { clearInterval(interval); return 5; }
        return prev + 1;
      });
    }, 600);
  };

  const noiseLevel = Math.max(0, 100 - step * 20);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2!">{t("textToImageBuildPrompt")}</h4>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          {t("selectOptionsToBuiltImagePrompt")}
        </p>

        <div className="space-y-3 mb-4">
          {categories.map(category => {
            const colors = imagePartColors[category];
            return (
              <div key={category} className="flex flex-wrap items-center gap-2">
                <span className={cn("text-xs font-medium w-24 capitalize", colors.text)}>{categoryLabels[category]}:</span>
                <div className="flex flex-wrap gap-1">
                  {imagePromptOptions[category].map((option: string, index: number) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(category, index)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-all",
                        selections[category] === index
                          ? cn(colors.bg, colors.border, colors.text)
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-muted/30 rounded-lg mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1 mt-0!">{t("generatedPrompt")}</p>
          <p className="text-sm font-mono m-0!">{buildPrompt()}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <button
              onClick={simulateDiffusion}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mb-3"
            >
              {t("simulateDiffusionProcess")}
            </button>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    step >= s ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {s}
                  </div>
                  <span className={cn("text-xs", step >= s ? "text-foreground" : "text-muted-foreground")}>
                    {s === 1 && t("diffusionStep1")}
                    {s === 2 && t("diffusionStep2")}
                    {s === 3 && t("diffusionStep3")}
                    {s === 4 && t("diffusionStep4")}
                    {s === 5 && t("diffusionStep5")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div 
              className="w-40 h-40 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-500"
              style={{
                background: step === 0 
                  ? "repeating-conic-gradient(#666 0% 25%, #999 25% 50%) 50% / 8px 8px"
                  : step < 5
                    ? `linear-gradient(135deg, hsl(${200 + selections.mood * 30}, ${40 + step * 10}%, ${50 + step * 5}%), hsl(${250 + selections.style * 20}, ${30 + step * 12}%, ${40 + step * 8}%))` 
                    : `linear-gradient(135deg, hsl(${200 + selections.mood * 30}, 70%, 60%), hsl(${250 + selections.style * 20}, 60%, 50%))`,
                filter: `blur(${noiseLevel / 10}px)`,
              }}
            >
              {step === 5 && (
                <span className="text-white text-xs font-medium drop-shadow-lg text-center px-2">
                  {imagePromptOptions.subject[selections.subject]}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 m-0!">
          {t("diffusionExplanation")}
        </p>
      </div>
    </div>
  );
}


export function TextToVideoDemo() {
  const [selections, setSelections] = useState({ subject: 0, action: 0, camera: 1, duration: 1 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 12;
  const t = useTranslations("book.interactive");
  const locale = useLocale();

  const videoPromptOptions = getLocaleField(locale, "videoPromptOptions");
  const videoCategoryLabels = getLocaleField(locale, "videoCategoryLabels");

  const buildPrompt = () => {
    return `${videoPromptOptions.subject[selections.subject]} ${videoPromptOptions.action[selections.action]}, ${videoPromptOptions.camera[selections.camera]}, ${videoPromptOptions.duration[selections.duration]}`;
  };

  const handleSelect = (category: keyof typeof selections, index: number) => {
    setSelections(prev => ({ ...prev, [category]: index }));
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const playVideo = () => {
    if (isPlaying) { setIsPlaying(false); return; }
    setIsPlaying(true);
    setCurrentFrame(0);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= totalFrames - 1) { setIsPlaying(false); return 0; }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const categories = [
    { key: "subject" as const, label: videoCategoryLabels.subject, color: "blue" },
    { key: "action" as const, label: videoCategoryLabels.action, color: "green" },
    { key: "camera" as const, label: videoCategoryLabels.camera, color: "purple" },
    { key: "duration" as const, label: videoCategoryLabels.duration, color: "amber" },
  ];

  const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
    green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
    amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2!">{t("textToVideoBuildPrompt")}</h4>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          {t("videoPromptsNeed")}
        </p>

        <div className="space-y-3 mb-4">
          {categories.map(({ key, label, color }) => {
            const colors = categoryColors[color];
            const options = videoPromptOptions[key];
            return (
              <div key={key} className="flex flex-wrap items-center gap-2">
                <span className={cn("text-xs font-medium w-20", colors.text)}>{label}:</span>
                <div className="flex flex-wrap gap-1">
                  {options.map((option: string, index: number) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(key, index)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border transition-all",
                        selections[key] === index
                          ? cn(colors.bg, colors.border, colors.text)
                          : "bg-muted/30 border-transparent hover:bg-muted/50"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-muted/30 rounded-lg mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1 mt-0!">{t("generatedPrompt")}</p>
          <p className="text-sm font-mono m-0!">{buildPrompt()}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <button
              onClick={playVideo}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mb-3"
            >
              {isPlaying ? t("stop") : t("playAnimation")}
            </button>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">{t("frame")}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${(currentFrame / (totalFrames - 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono w-12">{currentFrame + 1}/{totalFrames}</span>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1 mt-3">
                <p><strong>{t("consistency")}</strong> {t("consistencyDesc")}</p>
                <p><strong>{t("motion")}</strong> {t("motionDesc")}</p>
                <p><strong>{t("physics")}</strong> {t("physicsDesc")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div 
              className="w-48 h-32 rounded-lg border-2 flex items-center justify-center overflow-hidden relative"
              style={{
                background: `linear-gradient(${135 + currentFrame * 3}deg, hsl(${200 + selections.subject * 30}, 50%, 70%), hsl(${240 + selections.action * 20}, 40%, 50%))`,
              }}
            >
              <div 
                className="absolute transition-all duration-200 text-2xl"
                style={{
                  transform: `translateX(${(currentFrame - 6) * (selections.camera === 1 ? 8 : selections.camera === 3 ? 5 : 0)}px) translateY(${selections.action === 0 ? -currentFrame * 3 : 0}px)`,
                  opacity: 0.9,
                }}
              >
                {selections.subject === 0 && "🐦"}
                {selections.subject === 1 && "🚗"}
                {selections.subject === 2 && "🚶"}
                {selections.subject === 3 && "🌊"}
                {selections.subject === 4 && "🌸"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground m-0!">{t("simplifiedAnimationPreview")}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 m-0!">
          {t("videoModelExplanation")}
        </p>
      </div>
    </div>
  );
}
