"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { runEzoic } from "@/lib/ezoic";

interface EzoicPlaceholderProps {
  id: number;
}

/**
 * Manages the lifecycle of a single Ezoic ad slot.
 * Renders the placeholder only after mount so the DOM element exists
 * when showAds() is called. Destroys the placeholder on unmount.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
  const t = useTranslations("common");
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);

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
    <div className="ezoic-ad-container my-2">
      <div className="flex items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 select-none">
          {t("ad")}
        </span>
      </div>
      {isRendered && <div id={`ezoic-pub-ad-placeholder-${id}`} />}
    </div>
  );
}
