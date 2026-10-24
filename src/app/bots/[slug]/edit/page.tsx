import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BotForm } from "@/components/bots/bot-form";
import { extractBotId, getBotById } from "@/lib/bots";
import { NOINDEX_ROBOTS } from "@/lib/seo";
import { getBotUrl } from "@/lib/urls";

export const metadata: Metadata = {
  title: "Edit Bot",
  robots: NOINDEX_ROBOTS,
};

interface EditBotPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditBotPage({ params }: EditBotPageProps) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const bot = await getBotById(extractBotId(slug));
  if (!bot) {
    notFound();
  }

  if (bot.authorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect(getBotUrl(bot.id, bot.slug));
  }

  return (
    <div className="container max-w-3xl py-8">
      <BotForm
        mode="edit"
        botId={bot.id}
        initialData={{
          title: bot.title,
          description: bot.description ?? "",
          botPlatform: bot.platform,
          installUrl: bot.installUrl ?? "",
          content: bot.instructions,
          isPrivate: bot.isPrivate,
          config: bot.config,
        }}
      />
    </div>
  );
}
