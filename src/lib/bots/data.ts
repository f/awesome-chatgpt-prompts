export type BotPlatform = "openclaw" | "hermes" | "grok";

export interface BotRoutine {
  name: string;
  /** "schedule" runs on a timer, "event" runs when something happens */
  type: "schedule" | "event";
  /** Cron expression for schedules, or a plain description of the event */
  trigger: string;
  /** Human-readable form of the trigger, e.g. "Every day at 08:00" */
  triggerLabel: string;
  /** Task prompt the agent runs. Routines run in fresh sessions, so keep it self-contained. */
  prompt: string;
}

export interface BotSkill {
  name: string;
  description: string;
  /** Platform-specific install source, e.g. a ClawHub ref, a Hermes hub id, or a SKILL.md URL */
  source?: string;
}

export interface Bot {
  slug: string;
  name: string;
  platform: BotPlatform;
  /** One-line summary for listing cards */
  summary: string;
  description: string;
  /** System prompt / standing instructions for the agent */
  instructions: string;
  routines: BotRoutine[];
  skills: BotSkill[];
  connectors: string[];
  /**
   * One-click install link. Grok Bot templates are created on x.ai and linked
   * here; leave null until the template exists.
   */
  installUrl: string | null;
  isExample: boolean;
}

export const BOT_PLATFORMS: Record<BotPlatform, { name: string; website: string }> = {
  openclaw: { name: "OpenClaw", website: "https://openclaw.ai" },
  hermes: { name: "Hermes Agent", website: "https://hermes-agent.nousresearch.com" },
  grok: { name: "Grok Bot", website: "https://x.ai" },
};

export const bots: Bot[] = [
  {
    slug: "x-morning-briefing",
    name: "X Morning Briefing (Example)",
    platform: "grok",
    summary: "Sends a short digest of what your X timeline and lists talked about overnight.",
    description:
      "Example bot. Every morning it reads your home timeline and the X Lists you follow, groups the posts into topics, and sends you a five-bullet briefing with links to the most discussed posts. It also answers follow-up questions about any topic in the briefing.",
    instructions: `You are a concise news editor for the user's X account.

- Read the user's home timeline and followed Lists for the requested time window.
- Group posts into at most five topics. For each topic write one sentence and link the two most engaged posts.
- Prefer primary sources (official accounts, authors, researchers) over reposts.
- Never post, like, repost or reply on the user's behalf.
- Keep the whole briefing under 200 words.`,
    routines: [
      {
        name: "Morning briefing",
        type: "schedule",
        trigger: "0 8 * * *",
        triggerLabel: "Every day at 08:00",
        prompt:
          "Read my home timeline and followed Lists from the last 12 hours and send me the morning briefing.",
      },
      {
        name: "Breaking topic alert",
        type: "event",
        trigger: "A topic in my Lists gets more than 50 posts within an hour",
        triggerLabel: "When a topic spikes in your Lists",
        prompt: "Send me a two-sentence summary of the spiking topic with the three best source posts.",
      },
    ],
    skills: [],
    connectors: ["X"],
    // Placeholder: replace with the Grok Bot template share URL once it is created on x.ai.
    installUrl: null,
    isExample: true,
  },
  {
    slug: "github-issue-triager",
    name: "GitHub Issue Triager (Example)",
    platform: "openclaw",
    summary: "Labels new GitHub issues, asks for missing details and sweeps stale issues weekly.",
    description:
      "Example bot. When a new issue is opened in your repository it reads the issue, applies labels, and comments to ask for reproduction steps when they are missing. Every Monday it posts a summary of stale issues to your chat.",
    instructions: `You are a friendly open source maintainer assistant.

- Classify each new issue as bug, feature, question or docs and apply the matching label.
- If a bug report has no reproduction steps or version info, comment once and politely ask for them.
- Never close issues and never assign people.
- Keep comments under 80 words and sign them as "triage bot".`,
    routines: [
      {
        name: "Triage new issues",
        type: "event",
        trigger: "GitHub webhook: issues.opened",
        triggerLabel: "When a new issue is opened",
        prompt: "Triage the issue from the webhook payload following your instructions.",
      },
      {
        name: "Weekly stale sweep",
        type: "schedule",
        trigger: "0 9 * * 1",
        triggerLabel: "Every Monday at 09:00",
        prompt:
          "List open issues with no activity in the last 30 days and send me a short summary grouped by label.",
      },
    ],
    skills: [
      {
        name: "github",
        description: "Read and label issues and post comments through the GitHub CLI.",
      },
    ],
    connectors: ["GitHub"],
    installUrl: null,
    isExample: true,
  },
  {
    slug: "arxiv-research-digest",
    name: "arXiv Research Digest (Example)",
    platform: "hermes",
    summary: "Finds new arXiv papers on your topics and delivers a daily digest to Telegram.",
    description:
      "Example bot. Each weekday it searches arXiv for new papers on the topics you care about, picks the most relevant ones, and sends a digest with a one-line takeaway per paper to your Telegram chat.",
    instructions: `You are a research assistant who follows the user's topics on arXiv.

- Topics: large language models, AI agents, retrieval-augmented generation (edit this list to taste).
- Pick at most eight papers per digest, ranked by relevance to the topics.
- For each paper give the title, authors, link and one plain-language takeaway.
- Skip papers you have already sent in previous digests.`,
    routines: [
      {
        name: "Daily digest",
        type: "schedule",
        trigger: "0 7 * * 1-5",
        triggerLabel: "Weekdays at 07:00",
        prompt: "Search arXiv for papers from the last 24 hours on my topics and send me the digest.",
      },
    ],
    skills: [
      {
        name: "arxiv",
        description: "Search and read arXiv papers.",
        source: "official/research/arxiv",
      },
    ],
    connectors: ["Telegram"],
    installUrl: null,
    isExample: true,
  },
];
