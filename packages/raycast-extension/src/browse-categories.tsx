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
import {
  getCachedPrompts,
  convertToPrompt,
  downloadAllPrompts,
  type CachedPrompt,
} from "./cache";

interface Category {
  name: string;
  slug: string;
  count: number;
}

export default function BrowseCategories() {
  const [allPrompts, setAllPrompts] = useState<CachedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

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

  const categories = useMemo(() => {
    const categoryMap = new Map<string, Category>();

    for (const prompt of allPrompts) {
      if (prompt.category) {
        const existing = categoryMap.get(prompt.category.slug);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(prompt.category.slug, {
            name: prompt.category.name,
            slug: prompt.category.slug,
            count: 1,
          });
        }
      }
    }

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [allPrompts]);

  const categoryPrompts = useMemo(() => {
    if (!selectedCategory) return [];

    let result = allPrompts.filter(
      (p) => p.category?.slug === selectedCategory,
    );

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.author.username.toLowerCase().includes(query),
      );
    }

    return result.sort((a, b) => b.voteCount - a.voteCount);
  }, [allPrompts, selectedCategory, searchText]);

  if (allPrompts.length === 0 && !isLoading) {
    return (
      <List>
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
      </List>
    );
  }

  if (selectedCategory) {
    const categoryName =
      categories.find((c) => c.slug === selectedCategory)?.name ||
      selectedCategory;

    return (
      <List
        isLoading={isLoading}
        navigationTitle={categoryName}
        searchBarPlaceholder={`Search in ${categoryName}...`}
        onSearchTextChange={setSearchText}
        throttle
      >
        {categoryPrompts.length === 0 ? (
          <List.EmptyView
            icon={Icon.XMarkCircle}
            title="No prompts found"
            description={
              searchText
                ? `No prompts match "${searchText}"`
                : "No prompts in this category"
            }
            actions={
              <ActionPanel>
                <Action
                  title="Back to Categories"
                  icon={Icon.ArrowLeft}
                  onAction={() => setSelectedCategory(null)}
                />
              </ActionPanel>
            }
          />
        ) : (
          categoryPrompts.map((cached) => (
            <PromptListItem
              key={cached.id}
              prompt={convertToPrompt(cached)}
              onBack={() => setSelectedCategory(null)}
            />
          ))
        )}
      </List>
    );
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search categories..."
      onSearchTextChange={setSearchText}
      throttle
    >
      {categories.length === 0 ? (
        <List.EmptyView
          icon={Icon.Folder}
          title="No categories found"
          description="Prompts don't have categories assigned"
        />
      ) : (
        categories
          .filter(
            (c) =>
              !searchText ||
              c.name.toLowerCase().includes(searchText.toLowerCase()),
          )
          .map((category) => (
            <List.Item
              key={category.slug}
              title={category.name}
              subtitle={`${category.count} prompts`}
              icon={Icon.Folder}
              actions={
                <ActionPanel>
                  <Action
                    title="View Prompts"
                    icon={Icon.List}
                    onAction={() => {
                      setSelectedCategory(category.slug);
                      setSearchText("");
                    }}
                  />
                </ActionPanel>
              }
            />
          ))
      )}
    </List>
  );
}

function PromptListItem({
  prompt,
  onBack,
}: {
  prompt: Prompt;
  onBack: () => void;
}) {
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
              title="Back to Categories"
              icon={Icon.ArrowLeft}
              onAction={onBack}
              shortcut={{ modifiers: ["cmd"], key: "b" }}
            />
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
