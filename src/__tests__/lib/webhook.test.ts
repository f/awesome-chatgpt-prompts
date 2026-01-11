import { describe, it, expect, vi, beforeEach } from "vitest";
import { WEBHOOK_PLACEHOLDERS, SLACK_PRESET_PAYLOAD, triggerWebhooks } from "@/lib/webhook";
import { db } from "@/lib/db";

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    webhookConfig: {
      findMany: vi.fn(),
    },
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("WEBHOOK_PLACEHOLDERS", () => {
  it("should have all required placeholders", () => {
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_ID).toBe("{{PROMPT_ID}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_TITLE).toBe("{{PROMPT_TITLE}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_DESCRIPTION).toBe("{{PROMPT_DESCRIPTION}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_CONTENT).toBe("{{PROMPT_CONTENT}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_TYPE).toBe("{{PROMPT_TYPE}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_URL).toBe("{{PROMPT_URL}}");
    expect(WEBHOOK_PLACEHOLDERS.PROMPT_MEDIA_URL).toBe("{{PROMPT_MEDIA_URL}}");
    expect(WEBHOOK_PLACEHOLDERS.AUTHOR_USERNAME).toBe("{{AUTHOR_USERNAME}}");
    expect(WEBHOOK_PLACEHOLDERS.AUTHOR_NAME).toBe("{{AUTHOR_NAME}}");
    expect(WEBHOOK_PLACEHOLDERS.AUTHOR_AVATAR).toBe("{{AUTHOR_AVATAR}}");
    expect(WEBHOOK_PLACEHOLDERS.CATEGORY_NAME).toBe("{{CATEGORY_NAME}}");
    expect(WEBHOOK_PLACEHOLDERS.TAGS).toBe("{{TAGS}}");
    expect(WEBHOOK_PLACEHOLDERS.TIMESTAMP).toBe("{{TIMESTAMP}}");
    expect(WEBHOOK_PLACEHOLDERS.SITE_URL).toBe("{{SITE_URL}}");
    expect(WEBHOOK_PLACEHOLDERS.CHATGPT_URL).toBe("{{CHATGPT_URL}}");
  });

  it("should have consistent placeholder format", () => {
    Object.values(WEBHOOK_PLACEHOLDERS).forEach((placeholder) => {
      expect(placeholder).toMatch(/^\{\{[A-Z_]+\}\}$/);
    });
  });

  it("should have unique placeholder values", () => {
    const values = Object.values(WEBHOOK_PLACEHOLDERS);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe("SLACK_PRESET_PAYLOAD", () => {
  it("should be valid JSON when placeholders are replaced", () => {
    // Replace all placeholders with test values
    let payload = SLACK_PRESET_PAYLOAD;
    Object.values(WEBHOOK_PLACEHOLDERS).forEach((placeholder) => {
      payload = payload.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), "test");
    });

    expect(() => JSON.parse(payload)).not.toThrow();
  });

  it("should contain expected Slack block types", () => {
    expect(SLACK_PRESET_PAYLOAD).toContain('"type": "header"');
    expect(SLACK_PRESET_PAYLOAD).toContain('"type": "actions"');
    expect(SLACK_PRESET_PAYLOAD).toContain('"type": "section"');
    expect(SLACK_PRESET_PAYLOAD).toContain('"type": "context"');
    expect(SLACK_PRESET_PAYLOAD).toContain('"type": "divider"');
  });

  it("should contain all relevant placeholders", () => {
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.PROMPT_TITLE);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.PROMPT_URL);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.PROMPT_CONTENT);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.PROMPT_DESCRIPTION);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.AUTHOR_USERNAME);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.AUTHOR_NAME);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.CATEGORY_NAME);
    expect(SLACK_PRESET_PAYLOAD).toContain(WEBHOOK_PLACEHOLDERS.TAGS);
  });

  it("should have View Prompt button", () => {
    expect(SLACK_PRESET_PAYLOAD).toContain("View Prompt");
  });

  it("should have Run in ChatGPT button", () => {
    expect(SLACK_PRESET_PAYLOAD).toContain("Run in ChatGPT");
  });
});

describe("triggerWebhooks", () => {
  const mockPromptData = {
    id: "prompt-123",
    title: "Test Prompt",
    description: "A test description",
    content: "Test content here",
    type: "text",
    mediaUrl: null,
    isPrivate: false,
    author: {
      username: "testuser",
      name: "Test User",
      avatar: "https://example.com/avatar.png",
    },
    category: {
      name: "Testing",
      slug: "testing",
    },
    tags: [
      { tag: { name: "test", slug: "test" } },
      { tag: { name: "example", slug: "example" } },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
  });

  it("should not make fetch calls when no webhooks configured", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([]);

    await triggerWebhooks("PROMPT_CREATED", mockPromptData);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should call fetch for each enabled webhook", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([
      {
        id: "wh1",
        name: "Webhook 1",
        url: "https://example.com/hook1",
        method: "POST",
        payload: '{"test": "{{PROMPT_ID}}"}',
        headers: {},
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "wh2",
        name: "Webhook 2",
        url: "https://example.com/hook2",
        method: "POST",
        payload: '{"data": "{{PROMPT_TITLE}}"}',
        headers: {},
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await triggerWebhooks("PROMPT_CREATED", mockPromptData);

    // Give time for the fire-and-forget promises to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should replace placeholders in payload", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([
      {
        id: "wh1",
        name: "Test Webhook",
        url: "https://example.com/hook",
        method: "POST",
        payload: '{"id": "{{PROMPT_ID}}", "title": "{{PROMPT_TITLE}}"}',
        headers: {},
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await triggerWebhooks("PROMPT_CREATED", mockPromptData);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("prompt-123"),
      })
    );
  });

  it("should include custom headers", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([
      {
        id: "wh1",
        name: "Test Webhook",
        url: "https://example.com/hook",
        method: "POST",
        payload: "{}",
        headers: { Authorization: "Bearer token123" },
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await triggerWebhooks("PROMPT_CREATED", mockPromptData);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer token123",
        }),
      })
    );
  });

  it("should handle fetch errors gracefully", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([
      {
        id: "wh1",
        name: "Failing Webhook",
        url: "https://example.com/hook",
        method: "POST",
        payload: "{}",
        headers: {},
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    mockFetch.mockRejectedValue(new Error("Network error"));

    // Should not throw
    await expect(triggerWebhooks("PROMPT_CREATED", mockPromptData)).resolves.not.toThrow();
  });

  it("should handle database errors gracefully", async () => {
    vi.mocked(db.webhookConfig.findMany).mockRejectedValue(new Error("DB Error"));

    // Should not throw
    await expect(triggerWebhooks("PROMPT_CREATED", mockPromptData)).resolves.not.toThrow();
  });

  it("should use correct HTTP method from config", async () => {
    vi.mocked(db.webhookConfig.findMany).mockResolvedValue([
      {
        id: "wh1",
        name: "PUT Webhook",
        url: "https://example.com/hook",
        method: "PUT",
        payload: "{}",
        headers: {},
        events: ["PROMPT_CREATED"],
        isEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await triggerWebhooks("PROMPT_CREATED", mockPromptData);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PUT",
      })
    );
  });
});
