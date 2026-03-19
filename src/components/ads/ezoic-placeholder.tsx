"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { runEzoic } from "@/lib/ezoic";

interface EzoicPlaceholderProps {
  id: number;
}

export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
  const t = useTranslations("common");
  const [hasAdContent, setHasAdContent] = useState(true);
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The placeholder div is always rendered (no conditional gating),
    // so it's in the DOM when this effect runs. Call showAds(id) to
    // tell Ezoic to fill it. The global EzoicAds route handler's
    // showAds() call acts as an additional safety net.
    const el = placeholderRef.current;

    runEzoic(() => {
      window.ezstandalone?.showAds(id);
    });

    // Observe the placeholder for ad content injection by Ezoic.
    // If nothing is injected after a timeout, hide the container
    // to avoid showing an empty white card.
    let observer: MutationObserver | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (el) {
      let filled = false;

      observer = new MutationObserver(() => {
        if (el.childNodes.length > 0 || el.innerHTML.trim().length > 0) {
          filled = true;
          setHasAdContent(true);
        }
      });

      observer.observe(el, { childList: true, subtree: true });

      // If Ezoic doesn't fill the placeholder within 5s, hide it
      timeoutId = setTimeout(() => {
        if (!filled && el.childNodes.length === 0) {
          setHasAdContent(false);
        }
      }, 5000);
    }

    return () => {
      observer?.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
      runEzoic(() => {
        window.ezstandalone?.destroyPlaceholders(id);
      });
    };
  }, [id]);

  if (!hasAdContent) return null;

  return (
    <div className="ezoic-ad-container group border rounded-[var(--radius)] overflow-hidden hover:border-foreground/20 transition-colors flex flex-col">
      <div className="px-3 py-1.5 border-b bg-muted/50">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("ad")}
        </span>
      </div>
      <div className="ezoic-ad-content overflow-hidden flex items-center justify-center">
        <div id={`ezoic-pub-ad-placeholder-${id}`} ref={placeholderRef} />
      </div>
    </div>
  );
}
