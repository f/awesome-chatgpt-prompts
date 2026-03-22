"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { runEzoic } from "@/lib/ezoic";

interface EzoicPlaceholderProps {
  id: number;
}

/**
 * Manages the lifecycle of a single Ezoic ad slot.
 * The placeholder div is always in the DOM so Ezoic can find it
 * when showAds() runs. Destroys the placeholder on unmount.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
  const t = useTranslations("common");

  useEffect(() => {
    runEzoic(() => {
      window.ezstandalone?.showAds(id);
    });

    return () => {
      runEzoic(() => {
        window.ezstandalone?.destroyPlaceholders(id);
      });
    };
  }, [id]);

  return (
    <div className="ezoic-ad-container my-2 overflow-hidden">
      <div className="flex items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 select-none">
          {t("ad")}
        </span>
      </div>
      <div id={`ezoic-pub-ad-placeholder-${id}`} className="overflow-hidden" />
    </div>
  );
}
