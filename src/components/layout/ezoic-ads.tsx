"use client";

import { useEffect } from "react";
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

  // Per Ezoic Next.js docs: on every route change (including initial mount),
  // destroy existing placeholders then re-scan for all placeholders.
  // This global showAds() acts as a safety net for individual showAds(id) calls.
  useEffect(() => {
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
