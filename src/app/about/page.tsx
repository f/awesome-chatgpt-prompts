import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Heart } from "lucide-react";
import { db } from "@/lib/db";
import { ContributorAvatar } from "./contributor-avatar";
import config from "@/../prompts.config";

// Revalidate the page once per day (86400 seconds)
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getContributors() {
  // Get unclaimed users (original GitHub contributors from CSV import)
  const unclaimedUsers = await db.user.findMany({
    where: {
      email: { endsWith: "@unclaimed.prompts.chat" },
      username: { notIn: excludedFromCommunity },
    },
    select: {
      id: true,
      username: true,
      githubUsername: true,
      _count: {
        select: {
          prompts: true,
          contributions: true,
        },
      },
    },
  });

  // Get GitHub-authenticated users with contributions
  const githubUsers = await db.user.findMany({
    where: {
      githubUsername: { not: null, notIn: excludedFromCommunity },
      email: { not: { endsWith: "@unclaimed.prompts.chat" } },
      OR: [
        { prompts: { some: {} } },
        { contributions: { some: {} } },
      ],
    },
    select: {
      id: true,
      username: true,
      githubUsername: true,
      _count: {
        select: {
          prompts: true,
          contributions: true,
        },
      },
    },
  });

  const allUsers = [...unclaimedUsers, ...githubUsers];
  
  return allUsers.sort((a, b) => {
    const aTotal = a._count.prompts + a._count.contributions;
    const bTotal = b._count.prompts + b._count.contributions;
    return bTotal - aTotal;
  });
}

const techStack = [
  {
    era: "2022",
    title: "The Beginning",
    description: "HTML, CSS, and GitHub Pages. README.md parsed as HTML.",
    tools: [
      { name: "GitHub Pages", icon: "github" },
    ],
  },
  {
    era: "2024",
    title: "UI Renewal",
    description: "Fancier HTML/CSS UI built with Cursor and Claude Sonnet 3.5.",
    tools: [
      { name: "Cursor", icon: "cursor" },
      { name: "Claude Sonnet 3.5", icon: "anthropic" },
    ],
  },
  {
    era: "2025",
    title: "Current Version",
    description: "Built with Windsurf and Claude Opus 4.5. Next.js hosted on Vercel.",
    tools: [
      { name: "Windsurf", icon: "windsurf" },
      { name: "Claude Opus 4.5", icon: "anthropic" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Vercel", icon: "vercel" },
    ],
  },
  {
    era: "iOS",
    title: "Native App",
    description: "Native iOS app built with Windsurf, Claude Opus 4.5 and SwiftUI.",
    tools: [
      { name: "Windsurf", icon: "windsurf" },
      { name: "Claude Opus 4.5", icon: "anthropic" },
      { name: "SwiftUI", icon: "swift" },
    ],
  },
];

const coreContributors = [
  {
    username: "f",
    role: "Founder, Core Maintainer, iOS & npm Package",
    x: "fkadev",
    hf: "fka",
  },
  {
    username: "fatihsolhan",
    role: "Chrome Extension Maintainer",
    x: "fatihsolhann",
  },
  {
    username: "claude-opus-4.5",
    displayName: "Claude Opus 4.5",
    role: "Core Coder, DevOps, Frontend, Backend, DB",
    isAI: true,
    icon: "anthropic",
  },
  {
    username: "devin-ai",
    displayName: "Devin AI",
    role: "Feature Development",
    isAI: true,
    icon: "cognition",
  },
  {
    username: "github-copilot",
    displayName: "GitHub Copilot",
    role: "PR checks, Feature Development",
    isAI: true,
    icon: "github-copilot",
  },
];

const designCredits = [
  {
    username: "iuzn",
    role: "Logo Animation",
    x: "ibrahimuzn",
  },
  {
    username: "gemini-nano-banana",
    displayName: "Gemini Nano Banana",
    role: "Logo Design",
    isAI: true,
    icon: "gemini",
  },
  {
    username: "claude-opus-4.5-design",
    displayName: "Claude Opus 4.5",
    role: "App Design and Layout, Colors",
    isAI: true,
    icon: "anthropic",
  },
];

const ideationCredits = [
  {
    username: "semihkislar",
    role: "Product Ideas, Feedbacks",
    x: "semihdev",
  },
  {
    username: "merveenoyan",
    displayName: "Merve Noyan",
    role: "Hugging Face Dataset Support",
    x: "mervenoyann",
    hf: "merve",
  },
  {
    username: "chatgpt",
    displayName: "ChatGPT",
    role: "The core idea of the app",
    isAI: true,
    icon: "openai",
  },
];


const excludedFromCommunity = ["f", "fatihsolhan", "iuzn", "semihkislar"];

function BrandIcon({ name }: { name: string }) {
  switch (name) {
    case "github":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "anthropic":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
        </svg>
      );
    case "nextjs":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z" />
        </svg>
      );
    case "vercel":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="m12 1.608 12 20.784H0Z" />
        </svg>
      );
    case "swift":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.508 0c-.287 0-.573 0-.86.002-.241.002-.483.003-.724.01-.132.003-.263.009-.395.015A9.154 9.154 0 0 0 4.348.15 5.492 5.492 0 0 0 2.85.645 5.04 5.04 0 0 0 .645 2.848c-.245.48-.4.972-.495 1.5-.093.52-.122 1.05-.136 1.576a35.2 35.2 0 0 0-.012.724C0 6.935 0 7.221 0 7.508v8.984c0 .287 0 .575.002.862.002.24.005.481.012.722.014.526.043 1.057.136 1.576.095.528.25 1.02.495 1.5a5.03 5.03 0 0 0 2.205 2.203c.48.244.97.4 1.498.495.52.093 1.05.124 1.576.138.241.007.483.009.724.01.287.002.573.002.86.002h8.984c.287 0 .573 0 .86-.002.241-.001.483-.003.724-.01a10.523 10.523 0 0 0 1.578-.138 5.322 5.322 0 0 0 1.498-.495 5.035 5.035 0 0 0 2.203-2.203c.245-.48.4-.972.495-1.5.093-.52.124-1.05.138-1.576.007-.241.009-.481.01-.722.002-.287.002-.575.002-.862V7.508c0-.287 0-.573-.002-.86a33.662 33.662 0 0 0-.01-.724 10.5 10.5 0 0 0-.138-1.576 5.328 5.328 0 0 0-.495-1.5A5.039 5.039 0 0 0 21.152.645 5.32 5.32 0 0 0 19.654.15a10.493 10.493 0 0 0-1.578-.138 34.98 34.98 0 0 0-.722-.01C17.067 0 16.779 0 16.492 0H7.508zm6.035 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668.708-2.588-.09-5.548-1.893-7.992z" />
        </svg>
      );
    case "cursor":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
        </svg>
      );
    case "windsurf":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.55 5.067c-1.2038-.002-2.1806.973-2.1806 2.1765v4.8676c0 .972-.8035 1.7594-1.7597 1.7594-.568 0-1.1352-.286-1.4718-.7659l-4.9713-7.1003c-.4125-.5896-1.0837-.941-1.8103-.941-1.1334 0-2.1533.9635-2.1533 2.153v4.8957c0 .972-.7969 1.7594-1.7596 1.7594-.57 0-1.1363-.286-1.4728-.7658L.4076 5.1598C.2822 4.9798 0 5.0688 0 5.2882v4.2452c0 .2147.0656.4228.1884.599l5.4748 7.8183c.3234.462.8006.8052 1.3509.9298 1.3771.313 2.6446-.747 2.6446-2.0977v-4.893c0-.972.7875-1.7593 1.7596-1.7593h.003a1.798 1.798 0 0 1 1.4718.7658l4.9723 7.0994c.4135.5905 1.05.941 1.8093.941 1.1587 0 2.1515-.9645 2.1515-2.153v-4.8948c0-.972.7875-1.7594 1.7596-1.7594h.194a.22.22 0 0 0 .2204-.2202v-4.622a.22.22 0 0 0-.2203-.2203Z" />
        </svg>
      );
    case "x":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
        </svg>
      );
    case "openai":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      );
    case "gemini":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93-2.19-.96-3.81-2.58T12.96 4.68Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81T4.68 10.98Q2.49 12 0 12q2.49 0 4.68.93 2.19.96 3.81 2.61t2.61 3.78Z" />
        </svg>
      );
    case "cognition":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      );
    case "github-copilot":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "huggingface":
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.781 3.277c2.997 1.704 4.844 4.851 4.844 8.258 0 .995-.155 1.955-.443 2.857a1.332 1.332 0 011.125.4 1.41 1.41 0 01.2 1.723c.204.165.352.385.428.632l.017.062c.06.222.12.69-.2 1.166.244.37.279.836.093 1.236-.255.57-.893 1.018-2.128 1.5l-.202.078-.131.048c-.478.173-.89.295-1.061.345l-.086.024c-.89.243-1.808.375-2.732.394-1.32 0-2.3-.36-2.923-1.067a9.852 9.852 0 01-3.18.018C9.778 21.647 8.802 22 7.494 22a11.249 11.249 0 01-2.541-.343l-.221-.06-.273-.08a16.574 16.574 0 01-1.175-.405c-1.237-.483-1.875-.93-2.13-1.501-.186-.4-.151-.867.093-1.236a1.42 1.42 0 01-.2-1.166c.069-.273.226-.516.447-.694a1.41 1.41 0 01.2-1.722c.233-.248.557-.391.917-.407l.078-.001a9.385 9.385 0 01-.44-2.85c0-3.407 1.847-6.554 4.844-8.258a9.822 9.822 0 019.687 0zM4.188 14.758c.125.687 2.357 2.35 2.14 2.707-.19.315-.796-.239-.948-.386l-.041-.04-.168-.147c-.561-.479-2.304-1.9-2.74-1.432-.43.46.119.859 1.055 1.42l.784.467.136.083c1.045.643 1.12.84.95 1.113-.188.295-3.07-2.1-3.34-1.083-.27 1.011 2.942 1.304 2.744 2.006-.2.7-2.265-1.324-2.685-.537-.425.79 2.913 1.718 2.94 1.725l.16.04.175.042c1.227.284 3.565.65 4.435-.604.673-.973.64-1.709-.248-2.61l-.057-.057c-.945-.928-1.495-2.288-1.495-2.288l-.017-.058-.025-.072c-.082-.22-.284-.639-.63-.584-.46.073-.798 1.21.12 1.933l.05.038c.977.721-.195 1.21-.573.534l-.058-.104-.143-.25c-.463-.799-1.282-2.111-1.739-2.397-.532-.332-.907-.148-.782.541zm14.842-.541c-.533.335-1.563 2.074-1.94 2.751a.613.613 0 01-.687.302.436.436 0 01-.176-.098.303.303 0 01-.049-.06l-.014-.028-.008-.02-.007-.019-.003-.013-.003-.017a.289.289 0 01-.004-.048c0-.12.071-.266.25-.427.026-.024.054-.047.084-.07l.047-.036c.022-.016.043-.032.063-.049.883-.71.573-1.81.131-1.917l-.031-.006-.056-.004a.368.368 0 00-.062.006l-.028.005-.042.014-.039.017-.028.015-.028.019-.036.027-.023.02c-.173.158-.273.428-.31.542l-.016.054s-.53 1.309-1.439 2.234l-.054.054c-.365.358-.596.69-.702 1.018-.143.437-.066.868.21 1.353.055.097.117.195.187.296.882 1.275 3.282.876 4.494.59l.286-.07.25-.074c.276-.084.736-.233 1.2-.42l.188-.077.065-.028.064-.028.124-.056.081-.038c.529-.252.964-.543.994-.827l.001-.036a.299.299 0 00-.037-.139c-.094-.176-.271-.212-.491-.168l-.045.01c-.044.01-.09.024-.136.04l-.097.035-.054.022c-.559.23-1.238.705-1.607.745h.006a.452.452 0 01-.05.003h-.024l-.024-.003-.023-.005c-.068-.016-.116-.06-.14-.142a.22.22 0 01-.005-.1c.062-.345.958-.595 1.713-.91l.066-.028c.528-.224.97-.483.985-.832v-.04a.47.47 0 00-.016-.098c-.048-.18-.175-.251-.36-.251-.785 0-2.55 1.36-2.92 1.36-.025 0-.048-.007-.058-.024a.6.6 0 01-.046-.088c-.1-.238.068-.462 1.06-1.066l.209-.126c.538-.32 1.01-.588 1.341-.831.29-.212.475-.406.503-.6l.003-.028c.008-.113-.038-.227-.147-.344a.266.266 0 00-.07-.054l-.034-.015-.013-.005a.403.403 0 00-.13-.02c-.162 0-.369.07-.595.18-.637.313-1.431.952-1.826 1.285l-.249.215-.033.033c-.08.078-.288.27-.493.386l-.071.037-.041.019a.535.535 0 01-.122.036h.005a.346.346 0 01-.031.003l.01-.001-.013.001c-.079.005-.145-.021-.19-.095a.113.113 0 01-.014-.065c.027-.465 2.034-1.991 2.152-2.642l.009-.048c.1-.65-.271-.817-.791-.493zM11.938 2.984c-4.798 0-8.688 3.829-8.688 8.55 0 .692.083 1.364.24 2.008l.008-.009c.252-.298.612-.46 1.017-.46.355.008.699.117.993.312.22.14.465.384.715.694.261-.372.69-.598 1.15-.605.852 0 1.367.728 1.562 1.383l.047.105.06.127c.192.396.595 1.139 1.143 1.68 1.06 1.04 1.324 2.115.8 3.266a8.865 8.865 0 002.024-.014c-.505-1.12-.26-2.17.74-3.186l.066-.066c.695-.684 1.157-1.69 1.252-1.912.195-.655.708-1.383 1.56-1.383.46.007.889.233 1.15.605.25-.31.495-.553.718-.694a1.87 1.87 0 01.99-.312c.357 0 .682.126.925.36.14-.61.215-1.245.215-1.898 0-4.722-3.89-8.55-8.687-8.55zm1.857 8.926l.439-.212c.553-.264.89-.383.89.152 0 1.093-.771 3.208-3.155 3.262h-.184c-2.325-.052-3.116-2.06-3.156-3.175l-.001-.087c0-1.107 1.452.586 3.25.586.716 0 1.379-.272 1.917-.526zm4.017-3.143c.45 0 .813.358.813.8 0 .441-.364.8-.813.8a.806.806 0 01-.812-.8c0-.442.364-.8.812-.8zm-11.624 0c.448 0 .812.358.812.8 0 .441-.364.8-.812.8a.806.806 0 01-.813-.8c0-.442.364-.8.813-.8zm7.79-.841c.32-.384.846-.54 1.33-.394.483.146.83.564.878 1.06.048.495-.212.97-.659 1.203-.322.168-.447-.477-.767-.585l.002-.003c-.287-.098-.772.362-.925.079a1.215 1.215 0 01.14-1.36zm-4.323 0c.322.384.377.92.14 1.36-.152.283-.64-.177-.925-.079l.003.003c-.108.036-.194.134-.273.24l-.118.165c-.11.15-.22.262-.377.18a1.226 1.226 0 01-.658-1.204c.048-.495.395-.913.878-1.059a1.262 1.262 0 011.33.394z"></path>
        </svg>
      );
    default:
      return null;
  }
}

export default async function AboutPage() {
  // Hide about page when clone branding is enabled
  if (config.homepage?.useCloneBranding) {
    notFound();
  }

  const t = await getTranslations("about");
  const contributors = await getContributors();

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">{t("releasedOn")}</p>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Story Section */}
      <section className="mb-10 space-y-3">
        <h2 className="text-lg font-semibold">{t("storyTitle")}</h2>
        <p className="text-muted-foreground">
          {t.rich("story1Rich", {
            repoLink: (chunks) => (
              <Link href="https://github.com/f/prompts.chat" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            authorLink: (chunks) => (
              <Link href="https://github.com/f" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground">{t("story2")}</p>
        <p className="text-muted-foreground">
          {t.rich("testimonialsRich", {
            gregLink: (chunks) => (
              <Link href="https://x.com/gdb/status/1602072566671110144" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
            wojciechLink: (chunks) => (
              <Link href="https://x.com/wojaborza/status/1601656950281605120" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground font-medium">{t("openSource")}</p>
      </section>

      {/* Our Goal */}
      <section className="mb-10 space-y-3">
        <h2 className="text-lg font-semibold">{t("goalTitle")}</h2>
        <p className="text-muted-foreground">
          {t.rich("goal1Rich", {
            bold: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
        <p className="text-muted-foreground">
          {t.rich("goal2Rich", {
            licenseLink: (chunks) => (
              <Link href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="text-muted-foreground">{t("goal3")}</p>
      </section>

      {/* Achievements */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("achievementsTitle")}</h2>
        <div className="space-y-6">
          {/* Press & Media */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("pressCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("featuredForbes", {
                  link: (chunks) => (
                    <Link href="https://www.forbes.com/sites/bernardmarr/2023/05/17/the-best-prompts-for-chatgpt-a-complete-guide/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("featuredTagesspiegel", {
                  link: (chunks) => (
                    <Link href="https://www.linkedin.com/posts/fatihkadirakin_i-was-on-german-der-tagesspiegel-newspaper-activity-7061622588774432769-o6Bc/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
            </ul>
          </div>

          {/* Academic Recognition */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("academicCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("referencedHarvard", {
                  link: (chunks) => (
                    <Link href="https://www.huit.harvard.edu/news/ai-prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("referencedColumbia", {
                  link: (chunks) => (
                    <Link href="https://etc.cuit.columbia.edu/news/columbia-prompt-library-effective-academic-ai-use" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("referencedOlympic", {
                  link: (chunks) => (
                    <Link href="https://libguides.olympic.edu/UsingAI/Prompts" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("googleScholarCitations", {
                  link: (chunks) => (
                    <Link href="https://scholar.google.com/citations?user=AZ0Dg8YAAAAJ&hl=en" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
            </ul>
          </div>

          {/* Community & GitHub */}
          <div>
            <h3 className="text-sm font-medium mb-2">{t("communityCategoryTitle")}</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                {t.rich("githubStars", {
                  link: (chunks) => (
                    <Link href="https://github.com/f/prompts.chat" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("githubStaffPick", {
                  link: (chunks) => (
                    <Link href="https://spotlights-feed.github.com/spotlights/prompts-chat/index/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("referencedGithubBlog", {
                  link: (chunks) => (
                    <Link href="https://github.blog/changelog/2025-02-14-personal-custom-instructions-bing-web-search-and-more-in-copilot-on-github-com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>
                {t.rich("huggingFace", {
                  link: (chunks) => (
                    <Link href="https://huggingface.co/datasets/fka/prompts.chat" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </li>
              <li>{t("usedByDevelopers")}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("techStackTitle")}</h2>
        <div className="border rounded-lg divide-y">
          {techStack.map((item, index) => (
            <div key={index} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-xs font-medium text-muted-foreground uppercase w-12 shrink-0 pt-0.5">
                  {item.era}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tools.map((tool) => (
                      <span
                        key={tool.name}
                        className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-muted"
                      >
                        <BrandIcon name={tool.icon} />
                        {tool.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Contributors */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("coreContributorsTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {coreContributors.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              {contributor.isAI ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                  <BrandIcon name={contributor.icon} />
                </div>
              ) : (
                <Image
                  src={`https://github.com/${contributor.username}.png`}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {contributor.isAI ? contributor.displayName : `@${contributor.username}`}
                </div>
                <div className="text-xs text-muted-foreground">{contributor.role}</div>
              </div>
              {!contributor.isAI && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`https://github.com/${contributor.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="GitHub"
                  >
                    <BrandIcon name="github" />
                  </Link>
                  <Link
                    href={`https://x.com/${contributor.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="X"
                  >
                    <BrandIcon name="x" />
                  </Link>
                  {contributor.hf && (
                    <Link
                      href={`https://hf.co/${contributor.hf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="Hugging Face"
                    >
                      <BrandIcon name="huggingface" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Ideation */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("ideationTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {ideationCredits.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              {contributor.isAI ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                  <BrandIcon name={contributor.icon} />
                </div>
              ) : (
                <Image
                  src={`https://github.com/${contributor.username}.png`}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {contributor.isAI ? contributor.displayName : `@${contributor.username}`}
                </div>
                <div className="text-xs text-muted-foreground">{contributor.role}</div>
              </div>
              {!contributor.isAI && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`https://github.com/${contributor.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="GitHub"
                  >
                    <BrandIcon name="github" />
                  </Link>
                  <Link
                    href={`https://x.com/${contributor.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="X"
                  >
                    <BrandIcon name="x" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Design Credits */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("designCreditsTitle")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {designCredits.map((contributor) => (
            <div
              key={contributor.username}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              {contributor.isAI ? (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                  <BrandIcon name={contributor.icon} />
                </div>
              ) : (
                <Image
                  src={`https://github.com/${contributor.username}.png`}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {contributor.isAI ? contributor.displayName : `@${contributor.username}`}
                </div>
                <div className="text-xs text-muted-foreground">{contributor.role}</div>
              </div>
              {!contributor.isAI && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`https://github.com/${contributor.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="GitHub"
                  >
                    <BrandIcon name="github" />
                  </Link>
                  <Link
                    href={`https://x.com/${contributor.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-muted transition-colors"
                    title="X"
                  >
                    <BrandIcon name="x" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Community Contributors */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">{t("communityContributorsTitle")}</h2>
        <div className="flex flex-wrap gap-1.5">
          {contributors.map((user) => (
            <ContributorAvatar 
              key={user.id} 
              username={user.githubUsername || user.username} 
            />
          ))}
          <Link
            href="https://github.com/f/prompts.chat/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-dashed text-muted-foreground hover:text-primary hover:border-primary transition-colors text-xs"
          >
            +
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {t("viewAllContributors")}{" "}
          <Link
            href="https://github.com/f/prompts.chat/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            GitHub
          </Link>
        </p>
      </section>

      {/* Support Us */}
      <section>
        <h2 className="text-lg font-semibold mb-2">{t("supportUsTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t("supportUsIntro")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 border rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <BrandIcon name="github" />
              <h3 className="font-medium">{t("githubSponsorsTitle")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">{t("githubSponsorsDescription")}</p>
            <Link
              href="https://github.com/sponsors/f/sponsorships?tier_id=558224"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("becomeSponsor")}
            </Link>
          </div>
          <div className="p-4 border rounded-lg flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4" />
              <h3 className="font-medium">{t("supportersTitle")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3 flex-1">{t("supportersDescription")}</p>
            <Link
              href="https://donate.stripe.com/aFa9AS5RJeAR23nej0dMI03"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("supportNow")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
