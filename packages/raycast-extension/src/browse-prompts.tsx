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
import { useState, useEffect, useMemo } from "react";
import type { Prompt } from "./types";
import { getPromptUrl } from "./api";
import { RunPromptForm } from "./components/run-prompt";
import { PromptDetailView } from "./components/prompt-detail";
import { getCachedPrompts, convertToPrompt, type CachedPrompt } from "./cache";

const TYPE_OPTIONS = [
  { title: "All Types", value: "" },
  { title: "Text", value: "TEXT" },
  { title: "Image", value: "IMAGE" },
  { title: "Video", value: "VIDEO" },
  { title: "Audio", value: "AUDIO" },
  { title: "Skill", value: "SKILL" },
];

const SORT_OPTIONS = [
  { title: "Most Upvoted", value: "upvotes" },
  { title: "Most Recent", value: "recent" },
  { title: "By Author", value: "author" },
];

export default function BrowsePrompts() {
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState("upvotes");
  const [allPrompts, setAllPrompts] = useState<CachedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrompts() {
      const cached = await getCachedPrompts();
      setAllPrompts(cached);
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
  }, []);

  const filteredPrompts = useMemo(() => {
    let result = [...allPrompts];

    if (type) {
      result = result.filter((p) => p.type === type);
    }

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.author.username.toLowerCase().includes(query) ||
          (p.author.name && p.author.name.toLowerCase().includes(query)) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (p.category && p.category.name.toLowerCase().includes(query)),
      );
    }

    // Sort
    if (sort === "upvotes") {
      result.sort((a, b) => b.voteCount - a.voteCount);
    } else if (sort === "recent") {
      // Keep original order (already sorted by newest from API)
    } else if (sort === "author") {
      result.sort((a, b) => a.author.username.localeCompare(b.author.username));
    }

    return result;
  }, [allPrompts, type, searchText, sort]);

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter prompts..."
      onSearchTextChange={setSearchText}
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter & Sort"
          storeValue
          onChange={(value) => {
            if (value.startsWith("sort:")) {
              setSort(value.replace("sort:", ""));
            } else if (value.startsWith("type:")) {
              setType(value.replace("type:", ""));
            }
          }}
        >
          <List.Dropdown.Section title="Sort">
            {SORT_OPTIONS.map((option) => (
              <List.Dropdown.Item
                key={`sort:${option.value}`}
                title={option.title}
                value={`sort:${option.value}`}
              />
            ))}
          </List.Dropdown.Section>
          <List.Dropdown.Section title="Type">
            {TYPE_OPTIONS.map((option) => (
              <List.Dropdown.Item
                key={`type:${option.value}`}
                title={option.title}
                value={`type:${option.value}`}
              />
            ))}
          </List.Dropdown.Section>
        </List.Dropdown>
      }
    >
      {allPrompts.length === 0 ? (
        <List.EmptyView
          icon={Icon.Download}
          title="No prompts cached"
          description="Run 'Download All Prompts' command first"
        />
      ) : filteredPrompts.length === 0 ? (
        <List.EmptyView
          icon={Icon.Document}
          title="No prompts found"
          description="Try changing the filters"
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
