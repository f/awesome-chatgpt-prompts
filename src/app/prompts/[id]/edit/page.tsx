import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PromptForm } from "@/components/prompts/prompt-form";

interface EditPromptPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Prompt",
  description: "Edit your prompt",
};

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { id } = await params;
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
    },
  });

  if (!prompt) {
    notFound();
  }

  // Check if user is the author
  if (prompt.authorId !== session.user.id) {
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
    type: prompt.type as "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "STRUCTURED",
    structuredFormat: (prompt.structuredFormat as "JSON" | "YAML") || "JSON",
    categoryId: prompt.categoryId || undefined,
    tagIds: prompt.tags.map((t) => t.tagId),
    isPrivate: prompt.isPrivate,
    mediaUrl: prompt.mediaUrl || "",
    requiresMediaUpload: prompt.requiresMediaUpload,
    requiredMediaType: (prompt.requiredMediaType as "IMAGE" | "VIDEO" | "DOCUMENT") || "IMAGE",
    requiredMediaCount: prompt.requiredMediaCount || 1,
  };

  return (
    <div className="container max-w-3xl py-8">
      <PromptForm
        categories={categories}
        tags={tags}
        initialData={initialData}
        promptId={id}
        mode="edit"
      />
    </div>
  );
}
