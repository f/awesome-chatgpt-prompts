import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Redirects
  async redirects() {
    return [
      {
        source: "/vibe",
        destination: "/categories/vibe",
        permanent: true,
      },
      {
        source: "/sponsors",
        destination: "/categories/sponsors",
        permanent: true,
      },
      {
        source: "/embed-preview",
        destination: "/embed",
        permanent: true,
      },
      // Redirect book PDF downloads to GitHub raw to save bandwidth
      {
        source: "/book-pdf/:filename",
        destination:
          "https://raw.githubusercontent.com/f/prompts.chat/refs/heads/main/public/book-pdf/:filename",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
