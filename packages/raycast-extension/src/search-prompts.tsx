import {
  Action,
  ActionPanel,
  Icon,
  List,
  showToast,
  Toast,
  Clipboard,
  openExtensionPreferences,
} from "@raycast/api";
import { useState, useEffect } from "react";
import type { Prompt } from "./types";
import { getPromptUrl } from "./api";
import { RunPromptForm } from "./components/run-prompt";
import { PromptDetailView } from "./components/prompt-detail";
import {
  getCachedPrompts,
  searchPrompts,
  convertToPrompt,
  downloadAllPrompts,
  type CachedPrompt,
} from "./cache";

export default function SearchPrompts() {
  const [searchText, setSearchText] = useState("");
  const [allPrompts, setAllPrompts] = useState<CachedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function handleDownload() {
    setIsLoading(true);
    try {
      await showToast({
        style: Toast.Style.Animated,
        title: "Downloading prompts...",
      });
      const prompts = await downloadAllPrompts();
      setAllPrompts(prompts);
      await showToast({
        style: Toast.Style.Success,
        title: `Downloaded ${prompts.length} prompts`,
      });
    } catch (err) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Download failed",
        message: String(err),
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadPrompts() {
      const cached = await getCachedPrompts();
      setAllPrompts(cached);
      setIsLoading(false);
    }
    loadPrompts();
  }, []);

  const filteredPrompts = searchPrompts(allPrompts, searchText);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search prompts..."
      onSearchTextChange={setSearchText}
      throttle
    >
      {allPrompts.length === 0 ? (
        <List.EmptyView
          icon={Icon.Download}
          title="No prompts cached"
          description="Press Enter to download all prompts"
          actions={
            <ActionPanel>
              <Action
                title="Download All Prompts"
                icon={Icon.Download}
                onAction={handleDownload}
              />
            </ActionPanel>
          }
        />
      ) : searchText.length < 2 ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title="Start typing to search"
          description={`${allPrompts.length} prompts available. Enter at least 2 characters to search.`}
        />
      ) : filteredPrompts.length === 0 ? (
        <List.EmptyView
          icon={Icon.XMarkCircle}
          title="No prompts found"
          description={`No prompts match "${searchText}"`}
        />
      ) : (
        filteredPrompts.map((cached) => (
          <PromptListItem key={cached.id} prompt={convertToPrompt(cached)} />
        ))
      )}
    </List>
  );
}

function PromptListItem({ prompt }: { prompt: Prompt }) {
  const promptUrl = getPromptUrl(prompt.author.username, prompt.slug);

  return (
    <List.Item
      title={prompt.title}
      subtitle={`@${prompt.author.username} • ${prompt.voteCount} upvotes`}
      accessories={[{ tag: prompt.type }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Run">
            <Action.Push
              title="Run Prompt"
              icon={Icon.Play}
              target={<RunPromptForm prompt={prompt} />}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard
              title="Copy Prompt"
              content={prompt.content}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            <Action.OpenInBrowser
              title="Open in Browser"
              url={promptUrl}
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
            <Action
              title="Copy URL"
              icon={Icon.Link}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
              onAction={async () => {
                await Clipboard.copy(promptUrl);
                await showToast({
                  style: Toast.Style.Success,
                  title: "URL copied to clipboard",
                });
              }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.Push
              title="View Details"
              icon={Icon.Eye}
              target={<PromptDetailView prompt={prompt} />}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action
              title="Open Extension Preferences"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
