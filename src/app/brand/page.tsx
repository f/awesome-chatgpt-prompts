"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/components/providers/branding-provider";
import { notFound } from "next/navigation";

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
