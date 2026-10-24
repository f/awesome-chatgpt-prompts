import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo";

// Embeddable widget rendered inside iframes on other sites
export const metadata: Metadata = {
  title: "Embedded Prompt",
  robots: NOINDEX_ROBOTS,
};

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
