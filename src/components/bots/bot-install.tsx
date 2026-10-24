"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ExternalLink, FileCode2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BotPlatform } from "@/lib/bots";

interface BotInstallProps {
  platform: BotPlatform;
  platformName: string;
  installUrl: string | null;
  installPrompt: string;
  hermesCommand: string | null;
  urls: { markdown: string; json: string; skill: string };
}

function CopyBlock({ text, label }: { text: string; label: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("failedToCopy"));
    }
  };

  return (
    <div className="space-y-2">
      <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-3 text-xs font-mono leading-relaxed">
        {text}
      </pre>
      <Button size="sm" variant="outline" className="w-full" onClick={copy}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        {label}
      </Button>
    </div>
  );
}

export function BotInstall({ platform, platformName, installUrl, installPrompt, hermesCommand, urls }: BotInstallProps) {
  const t = useTranslations("bots");

  return (
    <div className="space-y-4">
      {platform === "grok" && (
        installUrl ? (
          <Button asChild className="w-full">
            <a href={installUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t("installOn", { platform: platformName })}
            </a>
          </Button>
        ) : (
          <div className="space-y-1">
            <Button className="w-full" disabled>
              <ExternalLink className="h-4 w-4" />
              {t("installOn", { platform: platformName })}
            </Button>
            <p className="text-xs text-muted-foreground text-center">{t("installLinkComingSoon")}</p>
          </div>
        )
      )}

      {hermesCommand && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t("hermesCommandHint")}</p>
          <CopyBlock text={hermesCommand} label={t("copyCommand")} />
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {platform === "grok" ? t("installPromptFallbackHint") : t("installPromptHint")}
        </p>
        <CopyBlock text={installPrompt} label={t("copyInstallPrompt")} />
      </div>

      <div className="space-y-1 border-t pt-3">
        <p className="text-xs font-medium text-muted-foreground">{t("machineReadable")}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {[
            { href: urls.markdown, label: ".md" },
            { href: urls.json, label: ".json" },
            { href: urls.skill, label: "SKILL.md" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
            >
              <FileCode2 className="h-3 w-3" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
