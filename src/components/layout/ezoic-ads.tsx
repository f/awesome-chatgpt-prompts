"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

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
  const prevPathname = useRef(pathname);

  // Re-trigger ads on SPA route changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (window.ezstandalone) {
        window.ezstandalone.cmd.push(function () {
          window.ezstandalone!.destroyAll();
        });
        window.ezstandalone.cmd.push(function () {
          window.ezstandalone!.showAds();
        });
      }
    }
  }, [pathname]);

  return (
    <>
      {/* Ezoic Privacy / Consent Management - must load first */}
      <Script
        src="https://cmp.gatekeeperconsent.com/min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
      <Script
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />

      {/* Ezoic Header Script */}
      <Script
        src="//www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />
      <Script id="ezoic-init" strategy="afterInteractive">
        {`
          window.ezstandalone = window.ezstandalone || {};
          ezstandalone.cmd = ezstandalone.cmd || [];
        `}
      </Script>

      {/* Ezoic Analytics */}
      <Script
        src="//ezoicanalytics.com/analytics.js"
        strategy="afterInteractive"
      />
    </>
  );
}
