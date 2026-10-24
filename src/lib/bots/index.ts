import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getBotUrl } from "@/lib/urls";
import { BOT_PLATFORM_INFO, parseBotConfig, type BotConfig, type BotPlatform } from "./schema";

export * from "./schema";

export const botSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  content: true,
  botPlatform: true,
  installUrl: true,
  botConfig: true,
  isPrivate: true,
  isUnlisted: true,
  isFeatured: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { username: true, name: true, avatar: true, verified: true } },
} satisfies Prisma.PromptSelect;

type BotRecord = Prisma.PromptGetPayload<{ select: typeof botSelect }>;

export interface BotView {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  instructions: string;
  platform: BotPlatform;
  installUrl: string | null;
  config: BotConfig;
  isPrivate: boolean;
  isUnlisted: boolean;
  isFeatured: boolean;
  authorId: string;
  author: BotRecord["author"];
  createdAt: Date;
  updatedAt: Date;
}

export function toBotView(record: BotRecord): BotView {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    instructions: record.content,
    platform: record.botPlatform ?? "OPENCLAW",
    installUrl: record.installUrl,
    config: parseBotConfig(record.botConfig),
    isPrivate: record.isPrivate,
    isUnlisted: record.isUnlisted,
    isFeatured: record.isFeatured,
    authorId: record.authorId,
    author: record.author,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

/** Public, listed bots: the same visibility rules as the prompts listing */
export const publicBotWhere = {
  type: "BOT",
  isPrivate: false,
  isUnlisted: false,
  deletedAt: null,
} satisfies Prisma.PromptWhereInput;

export async function listBots({
  platform,
  skip = 0,
  take = 24,
}: { platform?: BotPlatform; skip?: number; take?: number } = {}) {
  const where: Prisma.PromptWhereInput = { ...publicBotWhere, ...(platform && { botPlatform: platform }) };
  const [records, total] = await Promise.all([
    db.prompt.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take,
      select: botSelect,
    }),
    db.prompt.count({ where }),
  ]);
  return { bots: records.map(toBotView), total };
}

/** Finds a non-deleted bot by id. Callers check privacy with canViewPrompt. */
export async function getBotById(id: string): Promise<BotView | null> {
  const record = await db.prompt.findFirst({
    where: { id, type: "BOT", deletedAt: null },
    select: botSelect,
  });
  return record ? toBotView(record) : null;
}

/** Extracts the id from a bot URL segment: "abc123" or "abc123_some-slug" */
export function extractBotId(param: string): string {
  const underscoreIndex = param.indexOf("_");
  return underscoreIndex === -1 ? param : param.substring(0, underscoreIndex);
}

export function getBotUrls(bot: Pick<BotView, "id" | "slug">, baseUrl: string) {
  const page = `${baseUrl}${getBotUrl(bot.id, bot.slug)}`;
  return {
    page,
    markdown: `${page}.md`,
    json: `${page}.json`,
    skill: `${page}/SKILL.md`,
  };
}

/** Agent Skills names must match ^[a-z][a-z0-9_-]*$ */
export function getBotSkillName(bot: Pick<BotView, "id" | "slug">): string {
  const name = (bot.slug || "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return /^[a-z]/.test(name) ? name : `bot-${bot.id.toLowerCase()}`;
}

/** Prompt the user pastes into an agent that cannot import bots from a URL */
export function getInstallPrompt(bot: BotView, baseUrl: string): string {
  const platform = BOT_PLATFORM_INFO[bot.platform].name;
  return `Go to ${getBotUrls(bot, baseUrl).markdown} and create the "${bot.title}" bot on ${platform} exactly as described there: adopt its instructions as your standing instructions, install its skills, ask me to connect the required connectors, and set up each routine with the given schedule or trigger. Confirm each step when done.`;
}

/** Hermes installs SKILL.md files straight from a URL */
export function getHermesInstallCommand(bot: BotView, baseUrl: string): string {
  return `hermes skills install ${getBotUrls(bot, baseUrl).skill}`;
}

function setupCommands(bot: BotView): string[] {
  const lines: string[] = [];
  const quote = (s: string) => JSON.stringify(s);
  const { routines, skills } = bot.config;

  if (bot.platform === "OPENCLAW") {
    for (const skill of skills) {
      if (skill.source) lines.push(`openclaw skills install ${skill.source}`);
    }
    for (const routine of routines) {
      if (routine.type === "schedule") {
        lines.push(`openclaw automations create ${quote(routine.trigger)} ${quote(routine.prompt)} --name ${quote(routine.name)}`);
      }
    }
  } else if (bot.platform === "HERMES") {
    for (const skill of skills) {
      if (skill.source) lines.push(`hermes skills install ${skill.source}`);
    }
    const skillFlags = skills.map((skill) => ` --skill ${skill.name}`).join("");
    for (const routine of routines) {
      if (routine.type === "schedule") {
        lines.push(`hermes cron create ${quote(routine.trigger)} ${quote(routine.prompt)} --name ${quote(routine.name)}${skillFlags}`);
      }
    }
  }
  return lines;
}

function botBody(bot: BotView, baseUrl: string): string {
  const { routines, skills, connectors } = bot.config;
  const sections: string[] = [];

  if (bot.description) sections.push(bot.description);
  sections.push(`## Instructions\n\n${bot.instructions}`);

  if (routines.length > 0) {
    const items = routines.map((routine) =>
      [
        `### ${routine.name}`,
        "",
        `- Type: ${routine.type}`,
        `- ${routine.type === "schedule" ? "Schedule (cron)" : "Trigger"}: ${routine.trigger}`,
        ...(routine.triggerLabel ? [`- When: ${routine.triggerLabel}`] : []),
        `- Task: ${routine.prompt}`,
      ].join("\n")
    );
    sections.push(`## Routines\n\n${items.join("\n\n")}`);
  }

  if (skills.length > 0) {
    const items = skills.map(
      (skill) =>
        `- **${skill.name}**${skill.description ? `: ${skill.description}` : ""}${skill.source ? ` (install: \`${skill.source}\`)` : ""}`
    );
    sections.push(`## Skills\n\n${items.join("\n")}`);
  }

  if (connectors.length > 0) {
    sections.push(`## Required connectors\n\n${connectors.map((c) => `- ${c}`).join("\n")}`);
  }

  const commands = setupCommands(bot);
  const setup = [
    "1. Adopt the instructions above as your standing instructions for this bot.",
    "2. Install the listed skills.",
    "3. Ask the user to connect each required connector.",
    "4. Create every routine with its schedule or trigger and task.",
  ];
  if (commands.length > 0) {
    setup.push("", "Equivalent CLI commands for scheduled routines and skills:", "", "```bash", ...commands, "```");
  }
  sections.push(`## Setup\n\n${setup.join("\n")}`);
  sections.push(`Source: ${getBotUrls(bot, baseUrl).page}`);

  return sections.join("\n\n");
}

export function botToMarkdown(bot: BotView, baseUrl: string): string {
  const frontmatter = [
    "---",
    `name: ${JSON.stringify(bot.title)}`,
    `platform: ${bot.platform}`,
    ...(bot.description ? [`description: ${JSON.stringify(bot.description)}`] : []),
    `author: ${bot.author.username}`,
    "---",
  ].join("\n");
  return `${frontmatter}\n\n# ${bot.title}\n\n${botBody(bot, baseUrl)}\n`;
}

/** Agent Skills formatted file, installable with `hermes skills install <url>` */
export function botToSkill(bot: BotView, baseUrl: string): string {
  const summary = bot.description ? `${bot.description} ` : "";
  const frontmatter = [
    "---",
    `name: ${getBotSkillName(bot)}`,
    `description: ${JSON.stringify(`${summary}Use this skill to set up or run the "${bot.title}" bot.`)}`,
    "---",
  ].join("\n");
  return `${frontmatter}\n\n# ${bot.title}\n\n${botBody(bot, baseUrl)}\n`;
}

export function botToJson(bot: BotView, baseUrl: string) {
  return {
    id: bot.id,
    slug: bot.slug,
    name: bot.title,
    description: bot.description,
    platform: bot.platform,
    platformName: BOT_PLATFORM_INFO[bot.platform].name,
    instructions: bot.instructions,
    routines: bot.config.routines,
    skills: bot.config.skills,
    connectors: bot.config.connectors,
    installUrl: bot.installUrl,
    author: { username: bot.author.username, name: bot.author.name },
    createdAt: bot.createdAt,
    updatedAt: bot.updatedAt,
    urls: getBotUrls(bot, baseUrl),
    installPrompt: getInstallPrompt(bot, baseUrl),
  };
}
