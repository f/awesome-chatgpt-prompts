import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  showToast,
  Toast,
} from "@raycast/api";
import { useState, useEffect } from "react";
import {
  downloadAllPrompts,
  getCacheTimestamp,
  getCachedPrompts,
  clearCache,
} from "./cache";

export default function DownloadPrompts() {
  const [isLoading, setIsLoading] = useState(false);
  const [promptCount, setPromptCount] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCacheInfo();
  }, []);

  async function loadCacheInfo() {
    const prompts = await getCachedPrompts();
    setPromptCount(prompts.length);

    const timestamp = await getCacheTimestamp();
    if (timestamp) {
      setLastUpdated(new Date(timestamp));
    }
  }

  async function handleDownload() {
    setIsLoading(true);
    setError(null);

    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Downloading prompts...",
      });

      const prompts = await downloadAllPrompts();

      await showToast({
        style: Toast.Style.Success,
        title: "Download complete!",
        message: `${prompts.length} prompts cached`,
      });

      setPromptCount(prompts.length);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      await showToast({
        style: Toast.Style.Failure,
        title: "Download failed",
        message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClear() {
    await clearCache();
    setPromptCount(0);
    setLastUpdated(null);
    await showToast({
      style: Toast.Style.Success,
      title: "Cache cleared",
    });
  }

  const markdown = `# Download Prompts

Download all prompts from prompts.chat for offline access and faster searching.

## Cache Status

${promptCount !== null ? `**Cached Prompts:** ${promptCount}` : "**Cached Prompts:** Not loaded yet"}

${lastUpdated ? `**Last Updated:** ${lastUpdated.toLocaleString()}` : "**Last Updated:** Never"}

${error ? `\n\n## Error\n\n\`${error}\`` : ""}

---

Press **Enter** to download all prompts. This will fetch the latest prompts from prompts.chat and cache them locally for offline use.
`;

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action
            title="Download All Prompts"
            icon={Icon.Download}
            onAction={handleDownload}
          />
          {promptCount && promptCount > 0 && (
            <Action
              title="Clear Cache"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={handleClear}
            />
          )}
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label
            title="Cached Prompts"
            text={promptCount !== null ? promptCount.toString() : "—"}
            icon={Icon.Document}
          />
          <Detail.Metadata.Label
            title="Last Updated"
            text={lastUpdated ? lastUpdated.toLocaleString() : "Never"}
            icon={Icon.Clock}
          />
          <Detail.Metadata.Separator />
          <Detail.Metadata.Label
            title="Source"
            text="prompts.chat/prompts.json"
          />
        </Detail.Metadata>
      }
    />
  );
}
