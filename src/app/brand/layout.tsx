import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import { getConfig } from "@/lib/config";

// The page is a client component, so its metadata lives here
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brand");
  const config = await getConfig();
  return buildPageMetadata({
    title: t("title"),
    description: t("description", { name: config.branding.name }),
    path: "/brand",
  });
}

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
