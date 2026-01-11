import { describe, it, expect } from "vitest";
import { getPromptUrl, getPromptEditUrl, getPromptChangesUrl } from "@/lib/urls";

describe("getPromptUrl", () => {
  it("should return URL with just ID when no slug provided", () => {
    expect(getPromptUrl("abc123")).toBe("/prompts/abc123");
  });

  it("should return URL with ID and slug when slug provided", () => {
    expect(getPromptUrl("abc123", "my-prompt")).toBe("/prompts/abc123_my-prompt");
  });

  it("should return URL with just ID when slug is null", () => {
    expect(getPromptUrl("abc123", null)).toBe("/prompts/abc123");
  });

  it("should return URL with just ID when slug is undefined", () => {
    expect(getPromptUrl("abc123", undefined)).toBe("/prompts/abc123");
  });

  it("should return URL with just ID when slug is empty string", () => {
    expect(getPromptUrl("abc123", "")).toBe("/prompts/abc123");
  });

  it("should handle slug with special characters", () => {
    expect(getPromptUrl("abc123", "my-cool-prompt")).toBe("/prompts/abc123_my-cool-prompt");
  });

  it("should handle numeric ID", () => {
    expect(getPromptUrl("12345", "test")).toBe("/prompts/12345_test");
  });

  it("should handle UUID-style ID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(getPromptUrl(uuid, "slug")).toBe(`/prompts/${uuid}_slug`);
  });

  it("should handle slug with numbers", () => {
    expect(getPromptUrl("id1", "prompt-2024")).toBe("/prompts/id1_prompt-2024");
  });
});

describe("getPromptEditUrl", () => {
  it("should return edit URL with just ID when no slug", () => {
    expect(getPromptEditUrl("abc123")).toBe("/prompts/abc123/edit");
  });

  it("should return edit URL with ID and slug", () => {
    expect(getPromptEditUrl("abc123", "my-prompt")).toBe("/prompts/abc123_my-prompt/edit");
  });

  it("should return edit URL with just ID when slug is null", () => {
    expect(getPromptEditUrl("abc123", null)).toBe("/prompts/abc123/edit");
  });

  it("should return edit URL with just ID when slug is undefined", () => {
    expect(getPromptEditUrl("abc123", undefined)).toBe("/prompts/abc123/edit");
  });

  it("should append /edit to the base prompt URL", () => {
    const baseUrl = getPromptUrl("test", "slug");
    const editUrl = getPromptEditUrl("test", "slug");
    expect(editUrl).toBe(`${baseUrl}/edit`);
  });
});

describe("getPromptChangesUrl", () => {
  it("should return changes URL with just ID when no slug", () => {
    expect(getPromptChangesUrl("abc123")).toBe("/prompts/abc123/changes/new");
  });

  it("should return changes URL with ID and slug", () => {
    expect(getPromptChangesUrl("abc123", "my-prompt")).toBe("/prompts/abc123_my-prompt/changes/new");
  });

  it("should return changes URL with just ID when slug is null", () => {
    expect(getPromptChangesUrl("abc123", null)).toBe("/prompts/abc123/changes/new");
  });

  it("should return changes URL with just ID when slug is undefined", () => {
    expect(getPromptChangesUrl("abc123", undefined)).toBe("/prompts/abc123/changes/new");
  });

  it("should append /changes/new to the base prompt URL", () => {
    const baseUrl = getPromptUrl("test", "slug");
    const changesUrl = getPromptChangesUrl("test", "slug");
    expect(changesUrl).toBe(`${baseUrl}/changes/new`);
  });
});

describe("URL generation consistency", () => {
  it("should maintain consistent format across all URL functions", () => {
    const id = "test-id";
    const slug = "test-slug";

    const baseUrl = getPromptUrl(id, slug);
    const editUrl = getPromptEditUrl(id, slug);
    const changesUrl = getPromptChangesUrl(id, slug);

    expect(editUrl.startsWith(baseUrl)).toBe(true);
    expect(changesUrl.startsWith(baseUrl)).toBe(true);
  });

  it("should handle same ID with different slugs", () => {
    const id = "same-id";

    const url1 = getPromptUrl(id, "slug-one");
    const url2 = getPromptUrl(id, "slug-two");
    const url3 = getPromptUrl(id, null);

    expect(url1).not.toBe(url2);
    expect(url1).not.toBe(url3);
    expect(url2).not.toBe(url3);
  });
});
