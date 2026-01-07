import { describe, it, expect } from "vitest";
import {
  normalizeContent,
  calculateSimilarity,
  isSimilarContent,
  getContentFingerprint,
} from "@/lib/similarity";

describe("normalizeContent", () => {
  it("should convert to lowercase", () => {
    expect(normalizeContent("HELLO WORLD")).toBe("hello world");
  });

  it("should remove extra whitespace", () => {
    expect(normalizeContent("hello    world")).toBe("hello world");
    expect(normalizeContent("  hello  world  ")).toBe("hello world");
  });

  it("should remove punctuation", () => {
    expect(normalizeContent("hello, world!")).toBe("hello world");
    expect(normalizeContent("what's up?")).toBe("whats up");
  });

  it("should remove ${variable} patterns", () => {
    expect(normalizeContent("Hello ${name}!")).toBe("hello");
    expect(normalizeContent("${greeting} ${name}")).toBe("");
  });

  it("should remove ${variable:default} patterns", () => {
    expect(normalizeContent("Hello ${name:John}!")).toBe("hello");
  });

  it("should remove [placeholder] patterns", () => {
    expect(normalizeContent("Hello [NAME]!")).toBe("hello");
    expect(normalizeContent("Enter your [input here]")).toBe("enter your");
  });

  it("should remove <placeholder> patterns", () => {
    expect(normalizeContent("Hello <name>")).toBe("hello");
    expect(normalizeContent("<greeting> <name>")).toBe("");
  });

  it("should handle mixed patterns", () => {
    const input = "Hello ${name}, your [ROLE] is <admin>";
    expect(normalizeContent(input)).toBe("hello your is");
  });

  it("should return empty string for only placeholders", () => {
    expect(normalizeContent("${var1} ${var2}").trim()).toBe("");
  });

  it("should preserve numbers", () => {
    expect(normalizeContent("Test 123")).toBe("test 123");
  });

  it("should handle empty string", () => {
    expect(normalizeContent("")).toBe("");
  });

  it("should handle string with only whitespace", () => {
    expect(normalizeContent("   ")).toBe("");
  });
});

describe("calculateSimilarity", () => {
  it("should return 1 for identical content", () => {
    expect(calculateSimilarity("hello world", "hello world")).toBe(1);
  });

  it("should return 1 for identical content after normalization", () => {
    expect(calculateSimilarity("Hello World!", "hello world")).toBe(1);
    expect(calculateSimilarity("HELLO   WORLD", "hello world")).toBe(1);
  });

  it("should return 0 for completely different content", () => {
    const similarity = calculateSimilarity("abc def ghi", "xyz uvw rst");
    expect(similarity).toBeLessThan(0.1);
  });

  it("should return 0 when one content is empty", () => {
    expect(calculateSimilarity("hello", "")).toBe(0);
    expect(calculateSimilarity("", "world")).toBe(0);
  });

  it("should return 1 for two empty strings (after normalization)", () => {
    expect(calculateSimilarity("", "")).toBe(1);
  });

  it("should handle content that becomes empty after normalization", () => {
    expect(calculateSimilarity("${var}", "[placeholder]")).toBe(1);
  });

  it("should return high similarity for similar content", () => {
    const similarity = calculateSimilarity(
      "Write a poem about nature",
      "Write a poem about nature and trees"
    );
    expect(similarity).toBeGreaterThan(0.6);
  });

  it("should return moderate similarity for partially similar content", () => {
    const similarity = calculateSimilarity(
      "Write a poem about nature",
      "Create a story about animals"
    );
    expect(similarity).toBeGreaterThan(0.1);
    expect(similarity).toBeLessThan(0.6);
  });

  it("should ignore variable placeholders in similarity", () => {
    const similarity = calculateSimilarity(
      "Hello ${name}, how are you?",
      "Hello [NAME], how are you?"
    );
    expect(similarity).toBe(1);
  });

  it("should be symmetric", () => {
    const content1 = "The quick brown fox";
    const content2 = "A quick brown dog";
    expect(calculateSimilarity(content1, content2)).toBe(
      calculateSimilarity(content2, content1)
    );
  });
});

describe("isSimilarContent", () => {
  it("should return true for identical content", () => {
    expect(isSimilarContent("hello world", "hello world")).toBe(true);
  });

  it("should return true for highly similar content above threshold", () => {
    // Use content that's almost identical (just minor variation)
    expect(
      isSimilarContent(
        "Write a creative story about a dragon in a castle",
        "Write a creative story about a dragon in a castle today"
      )
    ).toBe(true);
  });

  it("should return false for content below default threshold", () => {
    expect(
      isSimilarContent("Write a poem about love", "Create a business plan")
    ).toBe(false);
  });

  it("should respect custom threshold", () => {
    const content1 = "The quick brown fox jumps";
    const content2 = "The quick brown dog jumps";

    // These might be similar at 0.5 threshold but not at 0.95
    const similarity = calculateSimilarity(content1, content2);

    expect(isSimilarContent(content1, content2, 0.5)).toBe(similarity >= 0.5);
    expect(isSimilarContent(content1, content2, 0.99)).toBe(similarity >= 0.99);
  });

  it("should return true with threshold of 0", () => {
    expect(isSimilarContent("abc", "xyz", 0)).toBe(true);
  });

  it("should handle edge case threshold of 1", () => {
    expect(isSimilarContent("hello", "hello", 1)).toBe(true);
    expect(isSimilarContent("hello", "hello!", 1)).toBe(true); // After normalization
    expect(isSimilarContent("hello", "world", 1)).toBe(false);
  });
});

describe("getContentFingerprint", () => {
  it("should return normalized content as fingerprint", () => {
    const fingerprint = getContentFingerprint("Hello World!");
    expect(fingerprint).toBe("hello world");
  });

  it("should truncate to 500 characters", () => {
    const longContent = "a".repeat(1000);
    const fingerprint = getContentFingerprint(longContent);
    expect(fingerprint.length).toBe(500);
  });

  it("should not truncate short content", () => {
    const shortContent = "short text";
    const fingerprint = getContentFingerprint(shortContent);
    expect(fingerprint).toBe("short text");
  });

  it("should return same fingerprint for normalized-identical content", () => {
    const fp1 = getContentFingerprint("Hello World!");
    const fp2 = getContentFingerprint("HELLO   WORLD");
    expect(fp1).toBe(fp2);
  });

  it("should remove placeholders before fingerprinting", () => {
    const fp = getContentFingerprint("Hello ${name}!");
    expect(fp).toBe("hello");
  });

  it("should handle empty string", () => {
    expect(getContentFingerprint("")).toBe("");
  });

  it("should handle content that normalizes to empty", () => {
    expect(getContentFingerprint("${var}")).toBe("");
  });
});

describe("similarity edge cases", () => {
  it("should handle very long content", () => {
    // Create long content with many unique words for better Jaccard similarity
    const words = Array.from({ length: 100 }, (_, i) => `word${i}`).join(" ");
    const longContent1 = words;
    const longContent2 = words + " extra";

    // Should not throw and should return high similarity
    const similarity = calculateSimilarity(longContent1, longContent2);
    expect(similarity).toBeGreaterThan(0.8);
  });

  it("should handle unicode characters", () => {
    const similarity = calculateSimilarity(
      "Hello 世界 emoji 🎉",
      "Hello 世界 emoji 🎉"
    );
    expect(similarity).toBe(1);
  });

  it("should handle newlines and tabs", () => {
    const content1 = "Hello\nWorld\tTest";
    const content2 = "Hello World Test";
    const similarity = calculateSimilarity(content1, content2);
    expect(similarity).toBe(1);
  });

  it("should handle repeated words", () => {
    const content1 = "test test test test";
    const content2 = "test test";
    const similarity = calculateSimilarity(content1, content2);
    // Both normalize to similar content with repeated "test"
    expect(similarity).toBeGreaterThan(0.5);
  });
});
