import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FolderOpen, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { SubscribeButton } from "@/components/categories/subscribe-button";
import { CategoryItem } from "@/components/categories/category-item";

export default async function CategoriesPage() {
  const t = await getTranslations("categories");
  const session = await auth();

  // Fetch root categories (no parent) with their children
  const rootCategories = await db.category.findMany({
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
        <div className="space-y-8">
          {rootCategories.map((category) => (
            <section key={category.id}>
              {/* Main Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <span className="text-2xl">{category.icon}</span>
                  )}
                  <div>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="text-lg font-semibold hover:underline flex items-center gap-1"
                    >
                      {category.name}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {category._count.prompts} {t("prompts")}
                  </Badge>
                  {session?.user && (
                    <SubscribeButton
                      categoryId={category.id}
                      categoryName={category.name}
                      initialSubscribed={subscribedIds.has(category.id)}
                      iconOnly
                    />
                  )}
                </div>
              </div>

              {/* Subcategories Grid */}
              {category.children.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.children.map((child) => (
                    <CategoryItem
                      key={child.id}
                      category={{
                        id: child.id,
                        name: child.name,
                        slug: child.slug,
                        icon: child.icon,
                        promptCount: child._count.prompts,
                      }}
                      isSubscribed={subscribedIds.has(child.id)}
                      showSubscribe={!!session?.user}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20">
                  {t("noSubcategories")}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
