import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PromptForm } from "@/components/prompts/prompt-form";
import { isAIGenerationEnabled, getAIModelName } from "@/lib/ai/generation";

interface EditPromptPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Extracts the prompt ID from a URL parameter that may contain a slug
 */
function extractPromptId(idParam: string): string {
  const underscoreIndex = idParam.indexOf("_");
  if (underscoreIndex !== -1) {
    return idParam.substring(0, underscoreIndex);
  }
  return idParam;
}

export const metadata: Metadata = {
  title: "Edit Prompt",
  description: "Edit your prompt",
};

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { id: idParam } = await params;
  const id = extractPromptId(idParam);
  const session = await auth();
  const t = await getTranslations("prompts");

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch the prompt
  const prompt = await db.prompt.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      contributors: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  if (!prompt) {
    notFound();
  }

  // Check if user is the author or admin
  const isAuthor = prompt.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  
  if (!isAuthor && !isAdmin) {
    redirect(`/prompts/${id}`);
  }

  // Fetch categories and tags for the form
  const [categories, tags] = await Promise.all([
    db.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Transform prompt data for the form
  const initialData = {
    title: prompt.title,
    description: prompt.description || "",
    content: prompt.content,
    type: ((prompt.type === "IMAGE" || prompt.type === "VIDEO" || prompt.type === "AUDIO" || prompt.type === "SKILL") ? prompt.type : "TEXT") as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "SKILL",
    structuredFormat: prompt.structuredFormat ? (prompt.structuredFormat as "JSON" | "YAML") : undefined,
    categoryId: prompt.categoryId || undefined,
    tagIds: prompt.tags.map((t) => t.tagId),
    isPrivate: prompt.isPrivate,
    mediaUrl: prompt.mediaUrl || "",
    requiresMediaUpload: prompt.requiresMediaUpload,
    requiredMediaType: (prompt.requiredMediaType as "IMAGE" | "VIDEO" | "DOCUMENT") || "IMAGE",
    requiredMediaCount: prompt.requiredMediaCount || 1,
    bestWithModels: (prompt as unknown as { bestWithModels?: string[] }).bestWithModels || [],
    bestWithMCP: (prompt as unknown as { bestWithMCP?: { command: string; tools?: string[] }[] }).bestWithMCP || [],
    workflowLink: (prompt as unknown as { workflowLink?: string }).workflowLink || "",
  };

  // Check if AI generation is enabled
  const aiGenerationEnabled = await isAIGenerationEnabled();
  const aiModelName = getAIModelName();

  return (
    <div className="container max-w-3xl py-8">
      <PromptForm
        categories={categories}
        tags={tags}
        initialData={initialData}
        initialContributors={prompt.contributors}
        promptId={id}
        mode="edit"
        aiGenerationEnabled={aiGenerationEnabled}
        aiModelName={aiModelName}
      />
    </div>
  );
}
