import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  showToast,
  Toast,
  Clipboard,
} from "@raycast/api";
import type { Prompt } from "../types";
import { getPromptUrl } from "../api";
import { RunPromptForm } from "./run-prompt";

interface PromptDetailViewProps {
  prompt: Prompt;
  onRefresh?: () => void;
}

export function PromptDetailView({ prompt, onRefresh }: PromptDetailViewProps) {
  const promptUrl = getPromptUrl(prompt.author.username, prompt.slug);

  const markdown = `# ${prompt.title}

${prompt.description ? `*${prompt.description}*\n\n---\n\n` : ""}

## Prompt

\`\`\`
${prompt.content}
\`\`\`

---

**Author:** ${prompt.author.name || prompt.author.username} (@${prompt.author.username})  
**Type:** ${prompt.type}  
**Votes:** ${prompt.voteCount}  
${prompt.category ? `**Category:** ${prompt.category.name}  \n` : ""}
${prompt.tags.length > 0 ? `**Tags:** ${prompt.tags.map((t) => t.tag.name).join(", ")}` : ""}
`;

  return (
    <Detail
      markdown={markdown}
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
          {onRefresh && (
            <ActionPanel.Section>
              <Action
                title="Refresh"
                icon={Icon.ArrowClockwise}
                onAction={onRefresh}
                shortcut={{ modifiers: ["cmd"], key: "r" }}
              />
            </ActionPanel.Section>
          )}
        </ActionPanel>
      }
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Title" text={prompt.title} />
          <Detail.Metadata.Label
            title="Author"
            text={`@${prompt.author.username}`}
          />
          <Detail.Metadata.TagList title="Type">
            <Detail.Metadata.TagList.Item text={prompt.type} color="#007AFF" />
          </Detail.Metadata.TagList>
          <Detail.Metadata.Label
            title="Votes"
            text={prompt.voteCount.toString()}
            icon={Icon.Heart}
          />
          {prompt.category && (
            <Detail.Metadata.Label
              title="Category"
              text={prompt.category.name}
            />
          )}
          {prompt.tags.length > 0 && (
            <Detail.Metadata.TagList title="Tags">
              {prompt.tags.map((t) => (
                <Detail.Metadata.TagList.Item
                  key={t.tag.id}
                  text={t.tag.name}
                />
              ))}
            </Detail.Metadata.TagList>
          )}
          <Detail.Metadata.Separator />
          <Detail.Metadata.Link
            title="View on prompts.chat"
            text="Open"
            target={promptUrl}
          />
        </Detail.Metadata>
      }
    />
  );
}
