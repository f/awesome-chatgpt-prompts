"use client";

import { useEffect, useState } from "react";
import { EzoicPlaceholder } from "./ezoic-placeholder";

interface EzoicAdProps {
  id: number;
}

/**
 * Client-only wrapper that defers EzoicPlaceholder mounting until after
 * hydration. This matches the feed widget pattern where InfinitePromptList
 * gates widget rendering behind an isMounted state, ensuring EzoicPlaceholder
 * mounts in a separate render pass — after EzoicAds route handler has
 * completed its initial destroyPlaceholders/showAds cycle.
 */
export function EzoicAd({ id }: EzoicAdProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <EzoicPlaceholder id={id} />;
}
