import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  describe("basic transformations", () => {
    it("converts text to lowercase", () => {
      expect(slugify("Hello World")).toBe("hello-world");
      expect(slugify("UPPERCASE")).toBe("uppercase");
    });

    it("trims whitespace", () => {
      expect(slugify("  hello world  ")).toBe("hello-world");
      expect(slugify("\thello\n")).toBe("hello");
    });

    it("replaces spaces with hyphens", () => {
      expect(slugify("hello world")).toBe("hello-world");
      expect(slugify("multiple   spaces")).toBe("multiple-spaces");
    });

    it("replaces underscores with hyphens", () => {
      expect(slugify("hello_world")).toBe("hello-world");
      expect(slugify("multiple__underscores")).toBe("multiple-underscores");
    });
  });

  describe("special character handling", () => {
    it("removes non-word characters", () => {
      expect(slugify("hello@world")).toBe("helloworld");
      expect(slugify("test!@#$%^&*()")).toBe("test");
      expect(slugify("hello.world")).toBe("helloworld");
    });

    it("preserves hyphens in the middle", () => {
      expect(slugify("hello-world")).toBe("hello-world");
      expect(slugify("already-slugified")).toBe("already-slugified");
    });

    it("removes leading and trailing hyphens", () => {
      expect(slugify("-hello-")).toBe("hello");
      expect(slugify("---test---")).toBe("test");
      expect(slugify("-multiple--hyphens-")).toBe("multiple-hyphens");
    });

    it("collapses multiple hyphens into one", () => {
      expect(slugify("hello---world")).toBe("hello-world");
      expect(slugify("test - - test")).toBe("test-test");
    });
  });

  describe("length limiting", () => {
    it("limits output to 100 characters", () => {
      const longText = "a".repeat(150);
      expect(slugify(longText).length).toBe(100);
    });

    it("preserves shorter text fully", () => {
      const shortText = "short title";
      expect(slugify(shortText)).toBe("short-title");
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(slugify("")).toBe("");
    });

    it("handles string with only special characters", () => {
      expect(slugify("@#$%^&*")).toBe("");
    });

    it("handles mixed content", () => {
      expect(slugify("Hello, World! How are you?")).toBe("hello-world-how-are-you");
    });

    it("handles numbers", () => {
      expect(slugify("Test 123")).toBe("test-123");
      expect(slugify("123 Test")).toBe("123-test");
    });

    it("handles mixed case with numbers and special chars", () => {
      expect(slugify("Product #1: The Best!")).toBe("product-1-the-best");
    });
  });

  describe("real-world examples", () => {
    it("handles prompt titles", () => {
      expect(slugify("Act as a JavaScript Console")).toBe("act-as-a-javascript-console");
      expect(slugify("Act as an English Translator")).toBe("act-as-an-english-translator");
    });

    it("handles titles with quotes", () => {
      expect(slugify("Act as a \"Code Reviewer\"")).toBe("act-as-a-code-reviewer");
    });

    it("handles titles with apostrophes", () => {
      expect(slugify("Developer's Guide")).toBe("developers-guide");
    });
  });
});
