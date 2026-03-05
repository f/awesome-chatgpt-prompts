import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { parseVariables, getUniqueVariables } from "@/lib/prompt-variables";
import { PlaygroundClient } from "@/components/prompts/playground-client";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

function extractPromptId(idParam: string): string {
  let param = idParam;
  if (param.endsWith(".prompt.md")) {
    param = param.slice(0, -".prompt.md".length);
  }
  const underscoreIndex = param.indexOf("_");
  if (underscoreIndex !== -1) {
    return param.substring(0, underscoreIndex);
  }
  return param;
}

export default async function PlaygroundPage({ params }: PlaygroundPageProps) {
  const { id: idParam } = await params;
  const id = extractPromptId(idParam);
  const session = await auth();
  const config = await getConfig();
  const t = await getTranslations("playground");

  // Check feature flag
  if (!config.features.mcp) {
    notFound();
  }

  const prompt = await db.prompt.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      type: true,
      isPrivate: true,
      authorId: true,
      deletedAt: true,
    },
  });

  if (!prompt || prompt.deletedAt) {
    notFound();
  }

  // Private prompts only accessible by owner
  if (prompt.isPrivate && prompt.authorId !== session?.user?.id) {
    notFound();
  }

  // Only TEXT/STRUCTURED can be run via API
  const isExecutable = prompt.type === "TEXT" || prompt.type === "STRUCTURED";

  const variables = getUniqueVariables(parseVariables(prompt.content));

  // Get user's API key if logged in
  let userApiKey: string | null = null;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true },
    });
    userApiKey = user?.apiKey || null;
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://prompts.chat";

  return (
    <PlaygroundClient
      promptId={prompt.id}
      promptTitle={prompt.title}
      promptDescription={prompt.description}
      promptContent={prompt.content}
      promptType={prompt.type}
      isExecutable={isExecutable}
      variables={variables}
      userApiKey={userApiKey}
      baseUrl={baseUrl}
      isLoggedIn={!!session?.user}
    />
  );
}
