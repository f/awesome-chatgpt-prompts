import type { Metadata } from "next";
import config from "@/../prompts.config";

export const SITE_NAME = config.branding.name;

const DEFAULT_OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} - AI Prompts Community`,
};

/**
 * Robots directives for pages that should stay out of search results
 * while still letting crawlers follow their links.
 */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
};

/**
 * Returns the absolute site origin without a trailing slash
 */
export function getBaseUrl(): string {
  return (process.env.NEXTAUTH_URL || "https://prompts.chat").replace(/\/+$/, "");
}

/**
 * Builds an absolute URL for a site path. Absolute URLs are returned as-is.
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Returns the canonical path of a paginated listing.
 * The first page never carries a `page` parameter.
 */
export function paginatedPath(path: string, page: number): string {
  return page > 1 ? `${path}?page=${page}` : path;
}

/**
 * Turns free text (markdown, prompt variables, line breaks) into a plain
 * meta description of at most `maxLength` characters, cut on a word boundary.
 */
export function toMetaDescription(text: string, maxLength = 160): string {
  const plain = text
    // ${variable} and ${variable:default} -> variable
    .replace(/\$\{([^}:]+)(?::[^}]*)?\}/g, "$1")
    // Markdown images and links
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Markdown syntax characters
    .replace(/[`*#>|~]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;

  const cut = plain.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

interface PageMetadataOptions {
  /** Page title. The "| prompts.chat" suffix is added by the root title template. */
  title: string;
  description: string;
  /** Canonical path relative to the site root, e.g. "/categories/coding" */
  path: string;
  /** Use the title as-is instead of applying the root title template */
  absoluteTitle?: boolean;
  /** Keep the page out of search results. No canonical link is emitted then. */
  noindex?: boolean;
  openGraphType?: "website" | "article" | "profile";
  /**
   * Social preview image URL, or "route" when the route has its own
   * opengraph-image file that must not be overridden
   */
  image?: string;
}

/**
 * Builds consistent page metadata: title, description, self-referencing
 * canonical URL, Open Graph and Twitter cards.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  noindex = false,
  openGraphType = "website",
  image,
}: PageMetadataOptions): Metadata {
  const socialTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = image === "route" ? undefined : image ? [{ url: image }] : [DEFAULT_OG_IMAGE];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // A canonical pointing elsewhere would contradict noindex
    ...(!noindex && { alternates: { canonical: path } }),
    openGraph: {
      type: openGraphType,
      siteName: SITE_NAME,
      locale: "en_US",
      url: path,
      title: socialTitle,
      description,
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@promptschat",
      title: socialTitle,
      description,
      ...(images && { images: images.map((img) => img.url) }),
    },
    ...(noindex && { robots: NOINDEX_ROBOTS }),
  };
}
