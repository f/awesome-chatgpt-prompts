import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { FolderOpen, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubscribeButton } from "@/components/categories/subscribe-button";

// Cached categories query
const getCategories = unstable_cache(
  async () => {
    return db.category.findMany({
      where: { parentId: null },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { prompts: true },
        },
        children: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { prompts: true },
            },
          },
        },
      },
    });
  },
  ["categories-page"],
  { tags: ["categories"] }
);

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const session = await auth();

  // Fetch root categories (no parent) with their children (cached)
  const rootCategories = await getCategories();

  // Get user's subscriptions if logged in
  const subscriptions = session?.user
    ? await db.categorySubscription.findMany({
        where: { userId: session.user.id },
        select: { categoryId: true },
      })
    : [];

  const subscribedIds = new Set(subscriptions.map((s) => s.categoryId));

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {rootCategories.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{t("noCategories")}</p>
        </div>
      ) : (
        <div className="divide-y">
          {rootCategories.map((category) => (
            <section key={category.id} className="py-6 first:pt-0">
              {/* Main Category Header */}
              <div className="flex items-start gap-3 mb-3">
                {category.icon && (
                  <span className="text-xl mt-0.5">{category.icon}</span>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      {category.name}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    {session?.user && (
                      <SubscribeButton
                        categoryId={category.id}
                        categoryName={category.name}
                        initialSubscribed={subscribedIds.has(category.id)}
                        iconOnly
                      />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {category._count.prompts} {t("prompts")}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Subcategories List */}
              {category.children.length > 0 && (
                <div className="ml-8 space-y-1">
                  {category.children.map((child) => (
                    <div
                      key={child.id}
                      className="group py-2 px-3 -mx-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {child.icon && (
                          <span className="text-sm">{child.icon}</span>
                        )}
                        <Link
                          href={`/categories/${child.slug}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {child.name}
                        </Link>
                        {session?.user && (
                          <SubscribeButton
                            categoryId={child.id}
                            categoryName={child.name}
                            initialSubscribed={subscribedIds.has(child.id)}
                            iconOnly
                          />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {child._count.prompts}
                        </span>
                      </div>
                      {child.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">
                          {child.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
