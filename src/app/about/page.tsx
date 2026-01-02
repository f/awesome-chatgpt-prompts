import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Heart } from "lucide-react";
import { db } from "@/lib/db";
import { ContributorAvatar } from "./contributor-avatar";
import config from "@/../prompts.config";

// Revalidate the page once per day (86400 seconds)
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getContributors() {
  // Get unclaimed users (original GitHub contributors from CSV import)
  const unclaimedUsers = await db.user.findMany({
    where: {
      email: { endsWith: "@unclaimed.prompts.chat" },
      username: { notIn: excludedFromCommunity },
    },
    select: {
      id: true,
      username: true,
      githubUsername: true,
      _count: {
        select: {
          prompts: true,
          contributions: true,
        },
      },
    },
  });

  // Get GitHub-authenticated users with contributions
  const githubUsers = await db.user.findMany({
    where: {
      githubUsername: { not: null, notIn: excludedFromCommunity },
      email: { not: { endsWith: "@unclaimed.prompts.chat" } },
      OR: [
        { prompts: { some: {} } },
        { contributions: { some: {} } },
      ],
    },
    select: {
      id: true,
      username: true,
      githubUsername: true,
      _count: {
        select: {
          prompts: true,
          contributions: true,
        },
      },
    },
  });

  const allUsers = [...unclaimedUsers, ...githubUsers];
  
  return allUsers.sort((a, b) => {
    const aTotal = a._count.prompts + a._count.contributions;
    const bTotal = b._count.prompts + b._count.contributions;
    return bTotal - aTotal;
  });
}

const techStack = [
  {
    era: "2022",
    title: "The Beginning",
    description: "HTML, CSS, and GitHub Pages. README.md parsed as HTML.",
    tools: [
      { name: "GitHub Pages", icon: "github" },
    ],
  },
  {
    era: "2024",
    title: "UI Renewal",
    description: "Fancier HTML/CSS UI built with Cursor and Claude Sonnet 3.5.",
    tools: [
      { name: "Cursor", icon: "cursor" },
      { name: "Claude Sonnet 3.5", icon: "anthropic" },
    ],
  },
  {
    era: "2025",
    title: "Current Version",
    description: "Built with Windsurf and Claude Opus 4.5. Next.js hosted on Vercel.",
    tools: [
      { name: "Windsurf", icon: "windsurf" },
      { name: "Claude Opus 4.5", icon: "anthropic" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    era: "iOS",
    title: "Native App",
    description: "Native iOS app built with SwiftUI.",
    tools: [
      { name: "SwiftUI", icon: "swift" },
    ],
  },
];

const coreContributors = [
  {
    username: "f",
    role: "Founder, Core Maintainer, iOS & npm Package",
    x: "fkadev",
  },
  {
    username: "fatihsolhan",
    role: "Chrome Extension Maintainer",
    x: "fatihsolhan",
  },
];

const designCredits = [
  {
    username: "iuzn",
    role: "Logo Animation",
    x: "ibrahimuzn",
  },
];

const excludedFromCommunity = ["f", "fatihsolhan", "iuzn"];

function BrandIcon({ name }: { name: string }) {
  switch (name) {
    case "github":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "anthropic":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
        </svg>
      );
    case "nextjs":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" />
        </svg>
      );
    case "vercel":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 1.608 12 20.784H0Z" />
        </svg>
      );
    case "swift":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.508 0c-.287 0-.573 0-.86.002-.241.002-.483.003-.724.01-.132.003-.263.009-.395.015A9.154 9.154 0 0 0 4.348.15 5.492 5.492 0 0 0 2.85.645 5.04 5.04 0 0 0 .645 2.848c-.245.48-.4.972-.495 1.5-.093.52-.122 1.05-.136 1.576a35.2 35.2 0 0 0-.012.724C0 6.935 0 7.221 0 7.508v8.984c0 .287 0 .575.002.862.002.24.005.481.012.722.014.526.043 1.057.136 1.576.095.528.25 1.02.495 1.5a5.03 5.03 0 0 0 2.205 2.203c.48.244.97.4 1.498.495.52.093 1.05.124 1.576.138.241.007.483.009.724.01.287.002.573.002.86.002h8.984c.287 0 .573 0 .86-.002.241-.001.483-.003.724-.01a10.523 10.523 0 0 0 1.578-.138 5.322 5.322 0 0 0 1.498-.495 5.035 5.035 0 0 0 2.203-2.203c.245-.48.4-.972.495-1.5.093-.52.124-1.05.138-1.576.007-.241.009-.481.01-.722.002-.287.002-.575.002-.862V7.508c0-.287 0-.573-.002-.86a33.662 33.662 0 0 0-.01-.724 10.5 10.5 0 0 0-.138-1.576 5.328 5.328 0 0 0-.495-1.5A5.039 5.039 0 0 0 21.152.645 5.32 5.32 0 0 0 19.654.15a10.493 10.493 0 0 0-1.578-.138 34.98 34.98 0 0 0-.722-.01C17.067 0 16.779 0 16.492 0H7.508zm6.035 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668.708-2.588-.09-5.548-1.893-7.992z" />
        </svg>
      );
    case "cursor":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
        </svg>
      );
    case "windsurf":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.55 5.067c-1.2038-.002-2.1806.973-2.1806 2.1765v4.8676c0 .972-.8035 1.7594-1.7597 1.7594-.568 0-1.1352-.286-1.4718-.7659l-4.9713-7.1003c-.4125-.5896-1.0837-.941-1.8103-.941-1.1334 0-2.1533.9635-2.1533 2.153v4.8957c0 .972-.7969 1.7594-1.7596 1.7594-.57 0-1.1363-.286-1.4728-.7658L.4076 5.1598C.2822 4.9798 0 5.0688 0 5.2882v4.2452c0 .2147.0656.4228.1884.599l5.4748 7.8183c.3234.462.8006.8052 1.3509.9298 1.3771.313 2.6446-.747 2.6446-2.0977v-4.893c0-.972.7875-1.7593 1.7596-1.7593h.003a1.798 1.798 0 0 1 1.4718.7658l4.9723 7.0994c.4135.5905 1.05.941 1.8093.941 1.1587 0 2.1515-.9645 2.1515-2.153v-4.8948c0-.972.7875-1.7594 1.7596-1.7594h.194a.22.22 0 0 0 .2204-.2202v-4.622a.22.22 0 0 0-.2203-.2203Z" />
        </svg>
      );
    case "x":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function AboutPage() {
  // Hide about page when clone branding is enabled
  if (config.homepage?.useCloneBranding) {
    notFound();
  }

  const t = await getTranslations("about");
  const contributors = await getContributors();

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">{t("releasedOn")}</p>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Story Section */}
      <section className="mb-10 space-y-3">
        <h2 className="text-lg font-semibold">{t("storyTitle")}</h2>
        <p className="text-muted-foreground">
          {t.rich("story1Rich", {
            repoLink: (chunks) => (
              <Link href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            authorLink: (chunks) => (
              <Link href="https://github.com/f" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground">{t("story2")}</p>
        <p className="text-muted-foreground">
          {t.rich("testimonialsRich", {
            gregLink: (chunks) => (
              <Link href="https://x.com/gdb/status/1602072566671110144" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            wojciechLink: (chunks) => (
              <Link href="https://x.com/wojaborza/status/1601656950281605120" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground font-medium">{t("openSource")}</p>
      </section>

      {/* Our Goal */}
      <section className="mb-10 space-y-3">
        <h2 className="text-lg font-semibold">{t("goalTitle")}</h2>
        <p className="text-muted-foreground">
          {t.rich("goal1Rich", {
            bold: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
        <p className="text-muted-foreground">
          {t.rich("goal2Rich", {
            licenseLink: (chunks) => (
              <Link href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground">{t("goal3")}</p>
      </section>

      {/* Achievements */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("achievementsTitle")}</h2>
        <div className="space-y-6">
          {/* Press & Media */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("pressCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("featuredForbes", {
                  link: (chunks) => (
                    <Link href="https://www.forbes.com/sites/bernardmarr/2023/05/17/the-best-prompts-for-chatgpt-a-complete-guide/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
            </ul>
          </div>

          {/* Academic Recognition */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("academicCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("referencedHarvard", {
                  link: (chunks) => (
                    <Link href="https://www.huit.harvard.edu/news/ai-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("referencedColumbia", {
                  link: (chunks) => (
                    <Link href="https://etc.cuit.columbia.edu/news/columbia-prompt-library-effective-academic-ai-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("referencedOlympic", {
                  link: (chunks) => (
                    <Link href="https://libguides.olympic.edu/UsingAI/Prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("citedArxiv", {
                  link: (chunks) => (
                    <Link href="https://arxiv.org/pdf/2502.04484" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
            </ul>
          </div>

          {/* Community & GitHub */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("communityCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("githubStars", {
                  link: (chunks) => (
                    <Link href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("githubStaffPick", {
                  link: (chunks) => (
                    <Link href="https://spotlights-feed.github.com/spotlights/prompts-chat/index/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("huggingFace", {
                  link: (chunks) => (
                    <Link href="https://huggingface.co/datasets/fka/awesome-chatgpt-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>{t("usedByDevelopers")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("techStackTitle")}</h2>
        <div className="border rounded-lg divide-y">
          {techStack.map((item, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-muted-foreground uppercase w-12 shrink-0 pt-0.5">
                  {item.era}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tools.map((tool) => (
                      <span
                        key={tool.name}
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-muted"
                      >
                        <BrandIcon name={tool.icon} />
                        {tool.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Contributors */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("coreContributorsTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {coreContributors.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <Image
                src={`https://github.com/${contributor.username}.png`}
                alt=""
                width={40}
                height={40}
                className="rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">@{contributor.username}</div>
                <div className="text-xs text-muted-foreground">{contributor.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`https://github.com/${contributor.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="GitHub"
                >
                  <BrandIcon name="github" />
                </Link>
                <Link
                  href={`https://x.com/${contributor.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="X"
                >
                  <BrandIcon name="x" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design Credits */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("designCreditsTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {designCredits.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <Image
                src={`https://github.com/${contributor.username}.png`}
                alt=""
                width={40}
                height={40}
                className="rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">@{contributor.username}</div>
                <div className="text-xs text-muted-foreground">{contributor.role}</div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`https://github.com/${contributor.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="GitHub"
                >
                  <BrandIcon name="github" />
                </Link>
                <Link
                  href={`https://x.com/${contributor.x}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                  title="X"
                >
                  <BrandIcon name="x" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Contributors */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("communityContributorsTitle")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {contributors.map((user) => (
            <ContributorAvatar 
              key={user.id} 
              username={user.githubUsername || user.username} 
            />
          ))}
          <Link
            href="https://github.com/f/awesome-chatgpt-prompts/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed text-muted-foreground hover:text-primary hover:border-primary transition-colors text-xs"
          >
            +
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {t("viewAllContributors")}{" "}
          <Link
            href="https://github.com/f/awesome-chatgpt-prompts/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GitHub
          </Link>
        </p>
      </section>

      {/* Support Us */}
      <section>
        <h2 className="text-lg font-semibold mb-2">{t("supportUsTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t("supportUsIntro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 border rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <BrandIcon name="github" />
              <h3 className="font-medium">{t("githubSponsorsTitle")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">{t("githubSponsorsDescription")}</p>
            <Link
              href="https://github.com/sponsors/f/sponsorships?tier_id=558224"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("becomeSponsor")}
            </Link>
          </div>
          <div className="p-4 border rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" />
              <h3 className="font-medium">{t("supportersTitle")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">{t("supportersDescription")}</p>
            <Link
              href="https://donate.stripe.com/aFa9AS5RJeAR23nej0dMI03"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("supportNow")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
