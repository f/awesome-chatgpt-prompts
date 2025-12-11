import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Bell, FolderOpen, Sparkles, Star, Heart, Trophy, Users, HeartHandshake, Code, Lock, Building2, Github } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromptList } from "@/components/prompts/prompt-list";
import { DiscoveryPrompts } from "@/components/prompts/discovery-prompts";

export default async function HomePage() {
  const t = await getTranslations("feed");
  const tHomepage = await getTranslations("homepage");
  const tNav = await getTranslations("nav");
  const session = await auth();
  const config = await getConfig();
  
  const isOAuth = config.auth.provider !== "credentials";
  // Show register button for OAuth (with login text) or credentials with registration enabled
  const showRegisterButton = isOAuth || (config.auth.provider === "credentials" && config.auth.allowRegistration);

  // Fetch GitHub stars dynamically (with caching)
  let githubStars = 139000; // fallback
  if (config.homepage?.achievements?.enabled !== false) {
    try {
      const res = await fetch("https://api.github.com/repos/f/awesome-chatgpt-prompts", {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      if (res.ok) {
        const data = await res.json();
        githubStars = data.stargazers_count;
      }
    } catch {
      // Use fallback
    }
  }

  // For logged-in users, show subscribed categories feed
  if (session?.user) {
    // Get user's subscribed categories
    const subscriptions = await db.categorySubscription.findMany({
      where: { userId: session.user.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const subscribedCategoryIds = subscriptions.map((s) => s.categoryId);

    // Fetch prompts from subscribed categories
    const promptsRaw = subscribedCategoryIds.length > 0
      ? await db.prompt.findMany({
          where: {
            isPrivate: false,
            categoryId: { in: subscribedCategoryIds },
          },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: { votes: true, contributors: true },
            },
          },
        })
      : [];

    const prompts = promptsRaw.map((p) => ({
      ...p,
      voteCount: p._count?.votes ?? 0,
      contributorCount: p._count?.contributors ?? 0,
    }));

    // Get all categories for subscription
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { prompts: true },
        },
      },
    });

    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">{t("yourFeed")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("feedDescription")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/prompts">
                {t("browseAll")}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/discover">
                <Sparkles className="mr-1.5 h-4 w-4" />
                {t("discover")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Subscribed Categories */}
        {subscriptions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {subscriptions.map(({ category }) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Badge variant="secondary" className="gap-1">
                  <Bell className="h-3 w-3" />
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Feed */}
        {prompts.length > 0 ? (
          <PromptList prompts={prompts} currentPage={1} totalPages={1} />
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-medium mb-1">{t("noPromptsInFeed")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("subscribeToCategories")}
            </p>

            {/* Category suggestions */}
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {categories.slice(0, 6).map((category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    {category.name}
                    <span className="ml-1 text-muted-foreground">({category._count.prompts})</span>
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/categories">{t("viewAllCategories")}</Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // For non-logged-in users, show landing page
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 border-b overflow-hidden">
        {/* Background Video - Right Side */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 hidden md:block pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-1/2 -translate-y-1/2 right-0 w-full h-auto opacity-30 dark:opacity-15 dark:invert"
          >
            <source src="/animation.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="container relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl !text-2xl sm:!text-3xl md:!text-4xl lg:!text-5xl">
              {tHomepage("heroTitle")}
              <span className="block text-primary">{tHomepage("heroSubtitle")}</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-xl">
              {tHomepage("heroDescription")}
            </p>
            
            {/* Feature badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Code className="h-5 w-5 text-primary" />
                <span>{tHomepage("heroFeature1")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5 text-primary" />
                <span>{tHomepage("heroFeature2")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-5 w-5 text-primary" />
                <span>{tHomepage("heroFeature3")}</span>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/prompts">
                  {tHomepage("browsePrompts")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://github.com/f/awesome-chatgpt-prompts" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-1.5 h-4 w-4" />
                  {tHomepage("cloneOnGithub")}
                </Link>
              </Button>
              {showRegisterButton && (
                <Button variant="outline" size="lg" asChild>
                  <Link href={isOAuth ? "/login" : "/register"}>
                    {isOAuth ? tNav("login") : tNav("register")}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      {config.homepage?.achievements?.enabled !== false && (
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm">
              <Link 
                href="https://www.forbes.com/sites/tjmccue/2023/01/19/chatgpt-success-completely-depends-on-your-prompt/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>{tHomepage("achievements.featuredIn")} <strong>{tHomepage("achievements.forbes")}</strong></span>
              </Link>
              <Link 
                href="https://huggingface.co/datasets/fka/awesome-chatgpt-prompts" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart className="h-4 w-4 text-red-500" />
                <span>{tHomepage("achievements.mostLikedDataset")}</span>
              </Link>
              <Link 
                href="https://github.com/f/awesome-chatgpt-prompts" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Star className="h-4 w-4 text-yellow-500" />
                <span><strong>{(githubStars / 1000).toFixed(0)}k</strong> {tHomepage("achievements.githubStars")}</span>
              </Link>
              <Link 
                href="https://github.com/f/awesome-chatgpt-prompts" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-4 w-4 text-purple-500" />
                <span>{tHomepage("achievements.mostStarredRepo")}</span>
              </Link>
              <span className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-green-500" />
                <span>{tHomepage("achievements.usedByThousands")}</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Sponsors Section */}
      {config.homepage?.sponsors?.enabled && config.homepage.sponsors.items.length > 0 && (
        <section className="py-8 border-b">
          <div className="container">
            <div className="flex items-center justify-center gap-2 mb-4">
              <p className="text-center text-xs text-muted-foreground">{tHomepage("achievements.sponsoredBy")}</p>
              <Link
                href="https://github.com/sponsors/f/sponsorships?sponsor=f&tier_id=558224&preview=false"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-muted hover:bg-muted/80 rounded-full transition-colors"
              >
                <HeartHandshake className="h-3 w-3" />
                {tHomepage("achievements.becomeSponsor")}
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {config.homepage.sponsors.items.map((sponsor) => (
                <Link
                  key={sponsor.name}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={120}
                    height={40}
                    className={`h-9 w-auto dark:invert ${sponsor.className || ''}`}
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured & Latest Prompts Section */}
      <DiscoveryPrompts isHomepage />

      {/* CTA Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={48}
                className="h-12 w-12 dark:hidden"
              />
              <Image
                src="/logo-dark.svg"
                alt="Logo"
                width={48}
                height={48}
                className="h-12 w-12 hidden dark:block"
              />
              <div>
                <h2 className="font-semibold">{tHomepage("readyToStart")}</h2>
                <p className="text-sm text-muted-foreground">{tHomepage("freeAndOpen")}</p>
              </div>
            </div>
            {showRegisterButton && (
              <Button asChild>
                <Link href={isOAuth ? "/login" : "/register"}>
                  {isOAuth ? tNav("login") : tHomepage("createAccount")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
