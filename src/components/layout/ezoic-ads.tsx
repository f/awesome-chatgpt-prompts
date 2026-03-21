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
      [key: string]: unknown;
    };
  }
}

/**
 * Ezoic script loader — renders all required <Script> tags.
 * Place inside <head> in layout.tsx per official docs.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function EzoicScripts() {
  return (
    <>
      {/* Ezoic Privacy / Consent Management */}
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

      {/* Ezoic standalone script */}
      <Script
        id="ezoic-sa"
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />

      {/* Ezoic init — cmd queue must exist before any runEzoic() calls */}
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

/**
 * Handles SPA route changes for Ezoic.
 * Destroys stale placeholders and re-scans the DOM on each navigation.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function EzoicRouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    runEzoic(() => {
      window.ezstandalone?.destroyPlaceholders();
      requestAnimationFrame(() => {
        window.ezstandalone?.showAds();
      });
    });
  }, [pathname]);

  return null;
}

