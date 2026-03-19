"use client";

import { EzoicPlaceholder } from "./ezoic-placeholder";

interface EzoicAdProps {
  id: number;
}

/**
 * Client-only wrapper for EzoicPlaceholder.
 * The placeholder div is always rendered so it's in the DOM when
 * Ezoic's showAds() runs — no deferred mounting needed.
 */
export function EzoicAd({ id }: EzoicAdProps) {
  return <EzoicPlaceholder id={id} />;
}
