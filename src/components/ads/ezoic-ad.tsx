"use client";

import { EzoicPlaceholder } from "./ezoic-placeholder";

interface EzoicAdProps {
  id: number;
}

/**
 * Client-only wrapper for EzoicPlaceholder.
 * Renders the placeholder div after mount so it's in the DOM
 * when Ezoic's showAds() runs.
 *
 * @see https://docs.ezoic.com/docs/ezoicadsadvanced/nextjs/
 */
export function EzoicAd({ id }: EzoicAdProps) {
  return <EzoicPlaceholder id={id} />;
}
