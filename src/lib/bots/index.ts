import { BOT_PLATFORMS, bots, type Bot, type BotPlatform } from "./data";

export { BOT_PLATFORMS, type Bot, type BotPlatform, type BotRoutine, type BotSkill } from "./data";

export function getAllBots(platform?: BotPlatform): Bot[] {
  return platform ? bots.filter((bot) => bot.platform === platform) : bots;
}

export function getBotBySlug(slug: string): Bot | undefined {
  return bots.find((bot) => bot.slug === slug);
}

export function isBotPlatform(value: string | undefined): value is BotPlatform {
  return !!value && value in BOT_PLATFORMS;
}

export function getBotUrls(bot: Bot, baseUrl: string) {
  const page = `${baseUrl}/bots/${bot.slug}`;
  return {
    page,
    markdown: `${page}.md`,
    json: `${page}.json`,
    skill: `${page}/SKILL.md`,
  };
}

/** Prompt the user pastes into an agent that cannot import bots from a URL */
export function getInstallPrompt(bot: Bot, baseUrl: string): string {
  const platform = BOT_PLATFORMS[bot.platform].name;
  return `Go to ${getBotUrls(bot, baseUrl).markdown} and create the "${bot.name}" bot on ${platform} exactly as described there: adopt its instructions as your standing instructions, install its skills, ask me to connect the required connectors, and set up each routine with the given schedule or trigger. Confirm each step when done.`;
}

/** Hermes installs SKILL.md files straight from a URL */
export function getHermesInstallCommand(bot: Bot, baseUrl: string): string {
  return `hermes skills install ${getBotUrls(bot, baseUrl).skill}`;
}

function setupCommands(bot: Bot): string[] {
  const lines: string[] = [];
  const quote = (s: string) => JSON.stringify(s);

  if (bot.platform === "openclaw") {
    for (const skill of bot.skills) {
      if (skill.source) lines.push(`openclaw skills install ${skill.source}`);
    }
    for (const routine of bot.routines) {
      if (routine.type === "schedule") {
        lines.push(`openclaw automations create ${quote(routine.trigger)} ${quote(routine.prompt)} --name ${quote(routine.name)}`);
      }
    }
  } else if (bot.platform === "hermes") {
    for (const skill of bot.skills) {
      if (skill.source) lines.push(`hermes skills install ${skill.source}`);
    }
    const skillFlags = bot.skills.map((skill) => ` --skill ${skill.name}`).join("");
    for (const routine of bot.routines) {
      if (routine.type === "schedule") {
        lines.push(`hermes cron create ${quote(routine.trigger)} ${quote(routine.prompt)} --name ${quote(routine.name)}${skillFlags}`);
      }
    }
  }
  return lines;
}

function botBody(bot: Bot, baseUrl: string): string {
  const sections: string[] = [];

  sections.push(`${bot.description}`);
  sections.push(`## Instructions\n\n${bot.instructions}`);

  if (bot.routines.length > 0) {
    const routines = bot.routines.map((routine) =>
      [
        `### ${routine.name}`,
        "",
        `- Type: ${routine.type}`,
        `- ${routine.type === "schedule" ? "Schedule (cron)" : "Trigger"}: ${routine.trigger}`,
        `- When: ${routine.triggerLabel}`,
        `- Task: ${routine.prompt}`,
      ].join("\n")
    );
    sections.push(`## Routines\n\n${routines.join("\n\n")}`);
  }

  if (bot.skills.length > 0) {
    const skills = bot.skills.map(
      (skill) => `- **${skill.name}**: ${skill.description}${skill.source ? ` (install: \`${skill.source}\`)` : ""}`
    );
    sections.push(`## Skills\n\n${skills.join("\n")}`);
  }

  if (bot.connectors.length > 0) {
    sections.push(`## Required connectors\n\n${bot.connectors.map((c) => `- ${c}`).join("\n")}`);
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

export function botToMarkdown(bot: Bot, baseUrl: string): string {
  const frontmatter = [
    "---",
    `name: ${JSON.stringify(bot.name)}`,
    `platform: ${bot.platform}`,
    `description: ${JSON.stringify(bot.summary)}`,
    `example: ${bot.isExample}`,
    "---",
  ].join("\n");
  return `${frontmatter}\n\n# ${bot.name}\n\n${botBody(bot, baseUrl)}\n`;
}

/** Agent Skills formatted file, installable with `hermes skills install <url>` */
export function botToSkill(bot: Bot, baseUrl: string): string {
  const frontmatter = [
    "---",
    `name: ${bot.slug}`,
    `description: ${JSON.stringify(`${bot.summary} Use this skill to set up or run the "${bot.name}" bot.`)}`,
    "---",
  ].join("\n");
  return `${frontmatter}\n\n# ${bot.name}\n\n${botBody(bot, baseUrl)}\n`;
}

export function botToJson(bot: Bot, baseUrl: string) {
  return {
    ...bot,
    platformName: BOT_PLATFORMS[bot.platform].name,
    urls: getBotUrls(bot, baseUrl),
    installPrompt: getInstallPrompt(bot, baseUrl),
  };
}
