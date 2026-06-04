import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { computePromptContentHash } from "@/lib/collections/content-hash";

describe("computePromptContentHash", () => {
  it("hashes single-file prompt by content only", () => {
    const expected = createHash("sha256").update("hello world").digest("hex");
    const actual = computePromptContentHash({ content: "hello world", skillFiles: [] });
    expect(actual).toBe(expected);
  });

  it("is order-independent for multi-file skills", () => {
    const input1 = {
      content: "main",
      skillFiles: [
        { filename: "b.ts", content: "const b = 2" },
        { filename: "a.ts", content: "const a = 1" },
      ],
    };
    const input2 = {
      content: "main",
      skillFiles: [
        { filename: "a.ts", content: "const a = 1" },
        { filename: "b.ts", content: "const b = 2" },
      ],
    };
    expect(computePromptContentHash(input1)).toBe(computePromptContentHash(input2));
  });

  it("produces different hash when content changes", () => {
    const h1 = computePromptContentHash({ content: "v1", skillFiles: [] });
    const h2 = computePromptContentHash({ content: "v2", skillFiles: [] });
    expect(h1).not.toBe(h2);
  });

  it("produces different hash when a skill file changes", () => {
    const base = { content: "main", skillFiles: [{ filename: "a.ts", content: "v1" }] };
    const changed = { content: "main", skillFiles: [{ filename: "a.ts", content: "v2" }] };
    expect(computePromptContentHash(base)).not.toBe(computePromptContentHash(changed));
  });
});
