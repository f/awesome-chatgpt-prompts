import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/settings/",
          "/login",
          "/register",
          // Signed-in only pages that redirect anonymous visitors to /login
          "/feed",
          "/collection",
          "/prompts/new",
          "/prompts/*/edit",
          "/prompts/*/changes/new",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
