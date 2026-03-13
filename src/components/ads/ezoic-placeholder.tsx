"use client";

import { useEffect, useRef, useState } from "react";

interface EzoicPlaceholderProps {
  id: number;
}

export function EzoicPlaceholder({ id }: EzoicPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Detect if Ezoic scripts were blocked by an ad blocker
    if (!window.ezstandalone) {
      setBlocked(true);
      return;
    }

    window.ezstandalone.cmd.push(function () {
      window.ezstandalone!.showAds(id);
    });

    // Check after a delay whether the placeholder actually received ad content
    const timer = setTimeout(() => {
      const el = containerRef.current;
      if (el && el.offsetHeight === 0) {
        setBlocked(true);
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (window.ezstandalone) {
        window.ezstandalone.cmd.push(function () {
          window.ezstandalone!.destroyPlaceholders(id);
        });
      }
    };
  }, [id]);

  if (blocked) return null;

  return (
    <div ref={containerRef} className="empty:hidden">
      <div id={`ezoic-pub-ad-placeholder-${id}`} />
    </div>
  );
}
