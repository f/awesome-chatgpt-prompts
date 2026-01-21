"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/components/providers/branding-provider";
import { notFound } from "next/navigation";

// Promi logo SVG component for light backgrounds
function PromiLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 16 20" 
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#FFD700" />
      <rect x="6" y="2" width="4" height="2" fill="#C0C0C0" />
      {/* Head */}
      <rect x="2" y="4" width="12" height="8" fill="#4A90D9" />
      {/* Eyes */}
      <rect x="4" y="6" width="3" height="3" fill="white" />
      <rect x="9" y="6" width="3" height="3" fill="white" />
      <rect x="5" y="7" width="2" height="2" fill="#333" />
      <rect x="10" y="7" width="2" height="2" fill="#333" />
      {/* Mouth */}
      <rect x="6" y="10" width="4" height="1" fill="#333" />
      <rect x="5" y="9" width="1" height="1" fill="#333" />
      <rect x="10" y="9" width="1" height="1" fill="#333" />
      {/* Body */}
      <rect x="4" y="12" width="8" height="6" fill="#4A90D9" />
      <rect x="6" y="14" width="4" height="2" fill="#FFD700" />
      {/* Arms */}
      <rect x="0" y="12" width="4" height="2" fill="#4A90D9" />
      <rect x="12" y="12" width="4" height="2" fill="#4A90D9" />
      {/* Feet */}
      <rect x="4" y="18" width="3" height="2" fill="#333" />
      <rect x="9" y="18" width="3" height="2" fill="#333" />
    </svg>
  );
}

// Promi logo SVG component for dark backgrounds
function PromiLogoDark({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 16 20" 
      className={className}
      style={{ imageRendering: "pixelated" }}
    >
      {/* Antenna */}
      <rect x="7" y="0" width="2" height="2" fill="#FFD700" />
      <rect x="6" y="2" width="4" height="2" fill="#E0E0E0" />
      {/* Head */}
      <rect x="2" y="4" width="12" height="8" fill="#5BA0E9" />
      {/* Eyes */}
      <rect x="4" y="6" width="3" height="3" fill="white" />
      <rect x="9" y="6" width="3" height="3" fill="white" />
      <rect x="5" y="7" width="2" height="2" fill="#222" />
      <rect x="10" y="7" width="2" height="2" fill="#222" />
      {/* Mouth */}
      <rect x="6" y="10" width="4" height="1" fill="#222" />
      <rect x="5" y="9" width="1" height="1" fill="#222" />
      <rect x="10" y="9" width="1" height="1" fill="#222" />
      {/* Body */}
      <rect x="4" y="12" width="8" height="6" fill="#5BA0E9" />
      <rect x="6" y="14" width="4" height="2" fill="#FFD700" />
      {/* Arms */}
      <rect x="0" y="12" width="4" height="2" fill="#5BA0E9" />
      <rect x="12" y="12" width="4" height="2" fill="#5BA0E9" />
      {/* Feet */}
      <rect x="4" y="18" width="3" height="2" fill="#888" />
      <rect x="9" y="18" width="3" height="2" fill="#888" />
    </svg>
  );
}

interface AssetCardProps {
  title: string;
  description: string;
  bgClass: string;
  children: React.ReactNode;
  downloadUrl: string;
  filename: string;
}

function AssetCard({ title, description, bgClass, children, downloadUrl, filename }: AssetCardProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`${bgClass} h-40 flex items-center justify-center p-8`}>
        {children}
      </div>
      <div className="p-4 flex items-center justify-between bg-background">
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3 w-3 mr-1" />
          SVG
        </Button>
      </div>
    </div>
  );
}

interface ColorCardProps {
  color: string;
  name: string;
  description: string;
}

function ColorCard({ color, name, description }: ColorCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-between p-3 rounded-md transition-colors hover:opacity-80"
      style={{ backgroundColor: color }}
    >
      <div className="text-left">
        <p className="font-mono text-sm font-medium" style={{ color: isLight(color) ? "#000" : "#fff" }}>
          {color}
        </p>
        <p className="text-xs opacity-80" style={{ color: isLight(color) ? "#000" : "#fff" }}>
          {description}
        </p>
      </div>
      {copied ? (
        <Check className="h-4 w-4" style={{ color: isLight(color) ? "#000" : "#fff" }} />
      ) : (
        <Copy className="h-4 w-4 opacity-60" style={{ color: isLight(color) ? "#000" : "#fff" }} />
      )}
    </button>
  );
}

function isLight(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

export default function BrandAssetsPage() {
  const branding = useBranding();
  const t = useTranslations("brand");

  // Redirect if using clone branding
  if (branding.useCloneBranding) {
    notFound();
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-10">
        {t("description", { name: branding.name })}
      </p>

      <div className="space-y-10">
        {/* Logos Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("logos")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Logo for light backgrounds */}
            <AssetCard
              title={t("logo")}
              description={t("forLightBackgrounds")}
              bgClass="bg-gray-100"
              downloadUrl="/logo.svg"
              filename="prompts-chat-logo.svg"
            >
              <Image
                src="/logo.svg"
                alt="prompts.chat logo"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </AssetCard>

            {/* Logo for dark backgrounds */}
            <AssetCard
              title={t("logo")}
              description={t("forDarkBackgrounds")}
              bgClass="bg-gray-900"
              downloadUrl="/logo-dark.svg"
              filename="prompts-chat-logo-dark.svg"
            >
              <Image
                src="/logo-dark.svg"
                alt="prompts.chat logo dark"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </AssetCard>

            {/* Logo with text - light */}
            <AssetCard
              title={t("logoWithName")}
              description={t("forLightBackgrounds")}
              bgClass="bg-gray-100"
              downloadUrl="/logo.svg"
              filename="prompts-chat-logo.svg"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="prompts.chat logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
                <span className="text-2xl font-bold text-gray-900">{branding.name}</span>
              </div>
            </AssetCard>

            {/* Logo with text - dark */}
            <AssetCard
              title={t("logoWithName")}
              description={t("forDarkBackgrounds")}
              bgClass="bg-gray-900"
              downloadUrl="/logo-dark.svg"
              filename="prompts-chat-logo-dark.svg"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-dark.svg"
                  alt="prompts.chat logo dark"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
                <span className="text-2xl font-bold text-white">{branding.name}</span>
              </div>
            </AssetCard>
          </div>
        </section>

        {/* Promi Mascot Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Promi</h2>
          <p className="text-sm text-muted-foreground mb-4">The pixel art mascot for prompts.chat Kids</p>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Promi for light backgrounds */}
            <AssetCard
              title="Promi"
              description={t("forLightBackgrounds")}
              bgClass="bg-gray-100"
              downloadUrl="/promi.svg"
              filename="promi.svg"
            >
              <PromiLogo className="h-20 w-auto" />
            </AssetCard>

            {/* Promi for dark backgrounds */}
            <AssetCard
              title="Promi"
              description={t("forDarkBackgrounds")}
              bgClass="bg-gray-900"
              downloadUrl="/promi-dark.svg"
              filename="promi-dark.svg"
            >
              <PromiLogoDark className="h-20 w-auto" />
            </AssetCard>
          </div>
        </section>

        {/* Animated Logos Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("animatedLogos")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Logo animated */}
            <AssetCard
              title={t("logo")}
              description="Animated"
              bgClass="bg-gray-100"
              downloadUrl="/logo-animated.svg"
              filename="logo-animated.svg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-animated.svg" alt="Logo animated" className="h-20 w-auto" />
            </AssetCard>

            {/* Promi animated */}
            <AssetCard
              title="Promi"
              description="Animated"
              bgClass="bg-gradient-to-br from-gray-100 to-gray-200"
              downloadUrl="/promi-animated.svg"
              filename="promi-animated.svg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/promi-animated.svg" alt="Promi animated" className="h-20 w-auto" />
            </AssetCard>
          </div>
        </section>

        {/* Colors Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("brandColors")}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t("clickToCopy")}</p>
          <div className="grid gap-2">
            <ColorCard
              color="#000000"
              name="Primary"
              description={t("primary")}
            />
            <ColorCard
              color="#ffffff"
              name="Background"
              description={t("background")}
            />
            <ColorCard
              color="#6366f1"
              name="Accent"
              description={t("accent")}
            />
            <ColorCard
              color="#71717a"
              name="Muted"
              description={t("muted")}
            />
          </div>
        </section>

        {/* Usage Guidelines */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("usageGuidelines")}</h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>{t("guideline1")}</li>
              <li>{t("guideline2")}</li>
              <li>{t("guideline3")}</li>
              <li>{t("guideline4")}</li>
              <li>{t("guideline5")}</li>
            </ul>
          </div>
        </section>

        {/* License */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t("license")}</h2>
          <p className="text-muted-foreground">
            {t.rich("licenseText", {
              name: branding.name,
              link: (chunks) => (
                <a
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
