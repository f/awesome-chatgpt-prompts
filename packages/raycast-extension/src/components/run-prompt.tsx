import {
  Action,
  ActionPanel,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  Clipboard,
  open,
  popToRoot,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import type { Prompt } from "../types";
import {
  extractVariables,
  compilePrompt,
  chatPlatforms,
  codePlatforms,
  imagePlatforms,
  videoPlatforms,
  buildUrl,
  type Platform,
} from "../utils";
import { getPromptUrl } from "../api";

interface RunPromptProps {
  prompt: Prompt;
}

export function RunPromptForm({ prompt }: RunPromptProps) {
  const variables = extractVariables(prompt.content);
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variables) {
      initial[v.name] = v.defaultValue;
    }
    return initial;
  });
  const { push } = useNavigation();

  const compiledContent = compilePrompt(prompt.content, values);

  function handleSubmit() {
    push(<PlatformList prompt={prompt} content={compiledContent} />);
  }

  if (variables.length === 0) {
    return <PlatformList prompt={prompt} content={compiledContent} />;
  }

  return (
    <Form
      navigationTitle={`Fill Variables: ${prompt.title}`}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Run Prompt"
            icon={Icon.Play}
            onSubmit={handleSubmit}
          />
          <Action.CopyToClipboard
            title="Copy Compiled Prompt"
            content={compiledContent}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    >
      <Form.Description title="Prompt" text={prompt.title} />
      {prompt.description && (
        <Form.Description title="" text={prompt.description} />
      )}
      <Form.Separator />
      {variables.map((variable) => (
        <Form.TextField
          key={variable.name}
          id={variable.name}
          title={variable.name}
          placeholder={variable.defaultValue || `Enter ${variable.name}`}
          value={values[variable.name] || ""}
          onChange={(value) =>
            setValues((prev) => ({ ...prev, [variable.name]: value }))
          }
        />
      ))}
      <Form.Separator />
      <Form.Description title="Preview" text={compiledContent} />
    </Form>
  );
}

interface PlatformListProps {
  prompt: Prompt;
  content: string;
}

function PlatformList({ prompt, content }: PlatformListProps) {
  const promptUrl = getPromptUrl(prompt.author.username, prompt.slug);

  async function handleRun(platform: Platform) {
    if (platform.supportsQuerystring) {
      const url = buildUrl(
        platform.id,
        platform.baseUrl,
        content,
        prompt.title,
        prompt.description || undefined,
      );
      await open(url);
      await showToast({
        style: Toast.Style.Success,
        title: `Opening in ${platform.name}`,
      });
    } else {
      await Clipboard.copy(content);
      await open(platform.baseUrl);
      await showToast({
        style: Toast.Style.Success,
        title: "Prompt copied!",
        message: `Opening ${platform.name}... Paste with ⌘V`,
      });
    }
    await popToRoot();
  }

  const isImagePrompt = prompt.type === "IMAGE";
  const isVideoPrompt = prompt.type === "VIDEO";
  const mediaPlatforms = isImagePrompt
    ? imagePlatforms
    : isVideoPrompt
      ? videoPlatforms
      : [];

  return (
    <List navigationTitle={`Run: ${prompt.title}`}>
      <List.Section title="Chat Platforms">
        {chatPlatforms.map((platform) => (
          <List.Item
            key={platform.id}
            title={platform.name}
            icon={Icon.Message}
            accessories={[
              platform.supportsQuerystring
                ? { icon: Icon.Play, tooltip: "Auto-fill supported" }
                : { icon: Icon.Clipboard, tooltip: "Will copy to clipboard" },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={`Run with ${platform.name}`}
                  icon={Icon.Play}
                  onAction={() => handleRun(platform)}
                />
                <Action.CopyToClipboard
                  title="Copy Prompt"
                  content={content}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.OpenInBrowser
                  title="View on prompts.chat"
                  url={promptUrl}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      <List.Section title="Code Platforms">
        {codePlatforms.map((platform) => (
          <List.Item
            key={platform.id}
            title={platform.name}
            icon={Icon.Terminal}
            accessories={[
              platform.supportsQuerystring
                ? { icon: Icon.Play, tooltip: "Auto-fill supported" }
                : { icon: Icon.Clipboard, tooltip: "Will copy to clipboard" },
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={`Run with ${platform.name}`}
                  icon={Icon.Play}
                  onAction={() => handleRun(platform)}
                />
                <Action.CopyToClipboard
                  title="Copy Prompt"
                  content={content}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                <Action.OpenInBrowser
                  title="View on prompts.chat"
                  url={promptUrl}
                  shortcut={{ modifiers: ["cmd"], key: "o" }}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
      {mediaPlatforms.length > 0 && (
        <List.Section title="Media Generation">
          {mediaPlatforms.map((platform) => (
            <List.Item
              key={platform.id}
              title={platform.name}
              icon={Icon.Image}
              accessories={[
                platform.supportsQuerystring
                  ? { icon: Icon.Play, tooltip: "Auto-fill supported" }
                  : { icon: Icon.Clipboard, tooltip: "Will copy to clipboard" },
              ]}
              actions={
                <ActionPanel>
                  <Action
                    title={`Run with ${platform.name}`}
                    icon={Icon.Play}
                    onAction={() => handleRun(platform)}
                  />
                  <Action.CopyToClipboard
                    title="Copy Prompt"
                    content={content}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action.OpenInBrowser
                    title="View on prompts.chat"
                    url={promptUrl}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}
