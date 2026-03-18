"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { runEzoic } from "@/lib/ezoic";

interface EzoicPlaceholderProps {
  id: number;
}

export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
  const t = useTranslations("common");
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Render the placeholder div first, then tell Ezoic to fill it.
    // This ensures the DOM element exists before showAds is called.
    setIsRendered(true);

    // Use requestAnimationFrame to guarantee the placeholder div
    // is in the DOM before Ezoic tries to find it.
    const rafId = requestAnimationFrame(() => {
      runEzoic(() => {
        window.ezstandalone?.showAds(id);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      runEzoic(() => {
        window.ezstandalone?.destroyPlaceholders(id);
      });
    };
  }, [id]);

  return (
    <div className="ezoic-ad-container border rounded-[var(--radius)] overflow-hidden flex flex-col">
      <div className="px-3 py-1.5 border-b bg-muted/50">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("ad")}
        </span>
      </div>
      <div className="ezoic-ad-content overflow-hidden flex items-center justify-center">
        {isRendered && <div id={`ezoic-pub-ad-placeholder-${id}`} />}
      </div>
    </div>
  );
}
