import type { WidgetPlugin } from "./types";

export const commandcodeWidget: WidgetPlugin = {
  id: "commandcode",
  name: "CommandCode",
  prompts: [
    {
      id: "commandcode-coding-agent",
      slug: "commandcode-coding-agent-with-taste",
      title: "CommandCode — Coding Agent with Taste",
      description: "The first frontier coding agent that both builds software and continuously learns your coding taste. Ships full-stack projects, features, fixes bugs, writes tests, and refactors, all while learning how you write code.",
      content: `## Install
npm i -g command-code

## get started
cd my-project
cmd

## Manage Taste with \`npx taste\`
Share and manage taste profiles like Git.

## Push project taste to remote
npx taste push --all

## Pull taste from remote
npx taste pull username/project-name`,
      type: "TEXT",
      sponsor: {
        name: "CommandCode",
        logo: "/sponsors/commandcode.svg",
        logoDark: "/sponsors/commandcode-dark.svg",
        url: "https://commandcode.ai",
      },
      tags: ["Coding Agents", "Developer Tools", "AI Agents"],
      category: "Development",
      actionUrl: "https://commandcode.ai",
      actionLabel: "Try CommandCode",
      positioning: {
        position: 2,
        mode: "repeat",
        repeatEvery: 50,
        maxCount: 3,
      },
      shouldInject: (context) => {
        const { filters } = context;
        
        // Only inject on the skills and tastes pages
        if (filters?.type === "SKILL" || filters?.type === "TASTE") {
          return true;
        }
        
        return false;
      },
    },
  ],
};
