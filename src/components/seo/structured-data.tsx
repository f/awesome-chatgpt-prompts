import { getConfig } from "@/lib/config";

interface StructuredDataProps {
  type: "website" | "organization" | "breadcrumb" | "prompt";
  data?: {
    breadcrumbs?: Array<{ name: string; url: string }>;
    prompt?: {
      id: string;
      name: string;
      description: string;
      author?: string;
      datePublished?: string;
      dateModified?: string;
    };
  };
}

export async function StructuredData({ type, data }: StructuredDataProps) {
  const config = await getConfig();
  const baseUrl = process.env.NEXTAUTH_URL || "https://prompts.chat";

  const schemas: Record<string, object | null> = {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: config.branding.name,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}${config.branding.logo}`,
        width: 512,
        height: 512,
      },
      description: config.branding.description,
      sameAs: [
        "https://github.com/f/awesome-chatgpt-prompts",
        "https://x.com/promptschat",
      ],
    },
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.branding.name,
      url: baseUrl,
      description: config.branding.description,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/prompts?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      publisher: {
        "@type": "Organization",
        name: config.branding.name,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}${config.branding.logo}`,
        },
      },
    },
    breadcrumb:
      data?.breadcrumbs && data.breadcrumbs.length > 0
        ? {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: data.breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
            })),
          }
        : null,
    prompt: data?.prompt
      ? {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "@id": `${baseUrl}/prompts/${encodeURIComponent(data.prompt.id)}`,
          name: data.prompt.name,
          description: data.prompt.description,
          author: data.prompt.author
            ? {
                "@type": "Person",
                name: data.prompt.author,
              }
            : undefined,
          datePublished: data.prompt.datePublished,
          dateModified: data.prompt.dateModified,
          publisher: {
            "@type": "Organization",
            name: config.branding.name,
          },
        }
      : null,
  };

  const schema = schemas[type];
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export async function WebsiteStructuredData() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
    </>
  );
}
