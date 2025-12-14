import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { PromptForm } from "@/components/prompts/prompt-form";
import { db } from "@/lib/db";
import { isAIGenerationEnabled, getAIModelName } from "@/lib/ai/generation";

export const metadata: Metadata = {
  title: "Create Prompt",
  description: "Create a new prompt",
};

interface PageProps {
  searchParams: Promise<{ prompt?: string }>;
}

export default async function NewPromptPage({ searchParams }: PageProps) {
  const session = await auth();
  const t = await getTranslations("prompts");
  const { prompt: initialPromptRequest } = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch categories for the form (with parent info for nesting)
  const categories = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
    },
  });

  // Fetch tags for the form
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
  });

  // Check if AI generation is enabled
  const aiGenerationEnabled = await isAIGenerationEnabled();
  const aiModelName = getAIModelName();

  return (
    <div className="container max-w-3xl py-8">
      <PromptForm 
        categories={categories} 
        tags={tags} 
        aiGenerationEnabled={aiGenerationEnabled}
        aiModelName={aiModelName}
        initialPromptRequest={initialPromptRequest}
      />
    </div>
  );
}
