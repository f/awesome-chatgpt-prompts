"use client";

import { useEffect, useState } from "react";
import { runEzoic } from "@/lib/ezoic";

interface EzoicPlaceholderProps {
  id: number;
}

export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
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
    <div className="ezoic-ad-container max-w-full overflow-hidden">
      {isRendered && <div id={`ezoic-pub-ad-placeholder-${id}`} />}
    </div>
  );
}
