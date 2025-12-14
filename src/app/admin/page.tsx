import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderTree, Tags, FileText, Webhook, Flag } from "lucide-react";
import { UsersTable } from "@/components/admin/users-table";
import { CategoriesTable } from "@/components/admin/categories-table";
import { TagsTable } from "@/components/admin/tags-table";
import { WebhooksTable } from "@/components/admin/webhooks-table";
import { PromptsManagement } from "@/components/admin/prompts-management";
import { ReportsTable } from "@/components/admin/reports-table";
import { isAISearchEnabled } from "@/lib/ai/embeddings";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your application",
};

export default async function AdminPage() {
  const session = await auth();
  const t = await getTranslations("admin");

  // Check if user is admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Fetch stats and AI search status
  const [userCount, promptCount, categoryCount, tagCount, aiSearchEnabled] = await Promise.all([
    db.user.count(),
    db.prompt.count(),
    db.category.count(),
    db.tag.count(),
    isAISearchEnabled(),
  ]);
  
  // Count prompts without embeddings and total public prompts
  let promptsWithoutEmbeddings = 0;
  let totalPublicPrompts = 0;
  if (aiSearchEnabled) {
    [promptsWithoutEmbeddings, totalPublicPrompts] = await Promise.all([
      db.prompt.count({
        where: {
          isPrivate: false,
          deletedAt: null,
          embedding: { equals: Prisma.DbNull },
        },
      }),
      db.prompt.count({
        where: {
          isPrivate: false,
          deletedAt: null,
        },
      }),
    ]);
  }

  // Fetch data for tables
  const [users, categories, tags, webhooks, reports] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatar: true,
        role: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: {
        _count: {
          select: {
            prompts: true,
            children: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            prompts: true,
          },
        },
      },
    }),
    db.webhookConfig.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.promptReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.users")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.prompts")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promptCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.categories")}</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.tags")}</CardTitle>
            <Tags className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tagCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {t("tabs.users")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderTree className="h-4 w-4" />
            {t("tabs.categories")}
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tags className="h-4 w-4" />
            {t("tabs.tags")}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            {t("tabs.webhooks")}
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("tabs.prompts")}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="h-4 w-4" />
            {t("tabs.reports")}
            {reports.filter(r => r.status === "PENDING").length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-white rounded-full">
                {reports.filter(r => r.status === "PENDING").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTable users={users} />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesTable categories={categories} />
        </TabsContent>

        <TabsContent value="tags">
          <TagsTable tags={tags} />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksTable webhooks={webhooks} />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsManagement 
            aiSearchEnabled={aiSearchEnabled} 
            promptsWithoutEmbeddings={promptsWithoutEmbeddings}
            totalPublicPrompts={totalPublicPrompts}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsTable reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
