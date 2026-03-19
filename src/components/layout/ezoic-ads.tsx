"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { runEzoic } from "@/lib/ezoic";

declare global {
  interface Window {
    ezstandalone?: {
      cmd: Array<() => void>;
      showAds: (...ids: number[]) => void;
      destroyAll: () => void;
      destroyPlaceholders: (...ids: number[]) => void;
    };
  }
}

export function EzoicAds() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Re-trigger ads on route changes.
  // First render: call global showAds() as a safety net (placeholder divs are in SSR HTML).
  // Subsequent renders (SPA navigation): destroyPlaceholders first, then showAds.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // On initial page load, give placeholders time to mount, then trigger global showAds
      const timeoutId = setTimeout(() => {
        runEzoic(() => {
          window.ezstandalone?.showAds();
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
    runEzoic(() => {
      window.ezstandalone?.destroyPlaceholders();
      requestAnimationFrame(() => {
        window.ezstandalone?.showAds();
      });
    });
  }, [pathname]);

  return (
    <>
      {/* Ezoic Privacy / Consent Management - must load first */}
      <Script
        id="ezoic-cmp"
        src="https://cmp.gatekeeperconsent.com/min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
      <Script
        id="ezoic-cmp-2"
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />

      {/* Ezoic Header Script */}
      <Script
        id="ezoic-sa"
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />
      <Script id="ezoic-init" strategy="afterInteractive">
        {`
          window.ezstandalone = window.ezstandalone || {};
          window.ezstandalone.cmd = window.ezstandalone.cmd || [];
        `}
      </Script>

      {/* Ezoic Analytics */}
      <Script
        id="ezoic-analytics"
        src="//ezoicanalytics.com/analytics.js"
        strategy="afterInteractive"
      />
    </>
  );
}
