import { z } from "zod";

export const BOT_PLATFORMS = ["GROK_BOT", "OPENCLAW", "HERMES"] as const;
export type BotPlatform = (typeof BOT_PLATFORMS)[number];

export const BOT_PLATFORM_INFO: Record<BotPlatform, { name: string; param: string }> = {
  GROK_BOT: { name: "Grok Bot", param: "grok" },
  OPENCLAW: { name: "OpenClaw", param: "openclaw" },
  HERMES: { name: "Hermes Agent", param: "hermes" },
};

export function platformFromParam(param: string | undefined): BotPlatform | undefined {
  return BOT_PLATFORMS.find((platform) => BOT_PLATFORM_INFO[platform].param === param);
}

export const botRoutineSchema = z.object({
  name: z.string().trim().min(1).max(100),
  /** "schedule" runs on a timer, "event" runs when something happens */
  type: z.enum(["schedule", "event"]),
  /** Cron expression for schedules, or a plain description of the event */
  trigger: z.string().trim().min(1).max(200),
  /** Human-readable form of the trigger, e.g. "Every day at 08:00" */
  triggerLabel: z.string().trim().max(200),
  /** Task prompt the agent runs. Routines run in fresh sessions, so it should be self-contained. */
  prompt: z.string().trim().min(1).max(4000),
});

export const botSkillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500),
  /** Platform-specific install source, e.g. a ClawHub ref, a Hermes hub id, or a SKILL.md URL */
  source: z.string().trim().max(300),
});

/** Stored in Prompt.botConfig for prompts of type BOT */
export const botConfigSchema = z.object({
  routines: z.array(botRoutineSchema).max(20),
  skills: z.array(botSkillSchema).max(20),
  connectors: z.array(z.string().trim().min(1).max(50)).max(20),
});

export type BotRoutine = z.infer<typeof botRoutineSchema>;
export type BotSkill = z.infer<typeof botSkillSchema>;
export type BotConfig = z.infer<typeof botConfigSchema>;

export const EMPTY_BOT_CONFIG: BotConfig = { routines: [], skills: [], connectors: [] };

export function parseBotConfig(value: unknown): BotConfig {
  const parsed = botConfigSchema.safeParse(value);
  return parsed.success ? parsed.data : EMPTY_BOT_CONFIG;
}

export const installUrlSchema = z.string().trim().url().refine((url) => url.startsWith("https://"), {
  message: "Install URL must use https",
});
