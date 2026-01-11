import { Action, ActionPanel, Detail, showToast, Toast } from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import type { Prompt } from "./types";
import { PromptDetailView } from "./components/prompt-detail";
import { getCachedPrompts, convertToPrompt, type CachedPrompt } from "./cache";

export default function RandomPrompt() {
  const [allPrompts, setAllPrompts] = useState<CachedPrompt[]>([]);
  const [randomPrompt, setRandomPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const pickRandom = useCallback((prompts: CachedPrompt[]) => {
    if (prompts.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return convertToPrompt(prompts[randomIndex]);
  }, []);

  useEffect(() => {
    async function loadPrompts() {
      const cached = await getCachedPrompts();
      setAllPrompts(cached);
      setRandomPrompt(pickRandom(cached));
      setIsLoading(false);

      if (cached.length === 0) {
        showToast({
          style: Toast.Style.Animated,
          title: "No prompts cached",
          message: "Run 'Download All Prompts' first",
        });
      }
    }
    loadPrompts();
  }, [pickRandom]);

  function handleRefresh() {
    setRandomPrompt(pickRandom(allPrompts));
  }

  if (isLoading) {
    return <Detail isLoading={true} markdown="Loading random prompt..." />;
  }

  if (allPrompts.length === 0) {
    return (
      <Detail
        markdown="# No Prompts Cached\n\nRun the **Download All Prompts** command first to cache prompts for offline use."
        actions={
          <ActionPanel>
            <Action.OpenInBrowser
              title="Open prompts.chat"
              url="https://prompts.chat"
            />
          </ActionPanel>
        }
      />
    );
  }

  if (!randomPrompt) {
    return <Detail isLoading={true} markdown="Picking a random prompt..." />;
  }

  return <PromptDetailView prompt={randomPrompt} onRefresh={handleRefresh} />;
}
