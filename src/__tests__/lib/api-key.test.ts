import { describe, it, expect } from "vitest";
import { generateApiKey, isValidApiKeyFormat } from "@/lib/api-key";

describe("generateApiKey", () => {
  it("should generate a key with pchat_ prefix", () => {
    const key = generateApiKey();
    expect(key.startsWith("pchat_")).toBe(true);
  });

  it("should generate a key with correct total length", () => {
    const key = generateApiKey();
    // pchat_ (6 chars) + 64 hex chars = 70 total
    expect(key.length).toBe(70);
  });

  it("should generate unique keys", () => {
    const keys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      keys.add(generateApiKey());
    }
    expect(keys.size).toBe(100);
  });

  it("should only contain valid hex characters after prefix", () => {
    const key = generateApiKey();
    const randomPart = key.slice(6); // Remove pchat_ prefix
    expect(randomPart).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should generate keys that pass validation", () => {
    for (let i = 0; i < 10; i++) {
      const key = generateApiKey();
      expect(isValidApiKeyFormat(key)).toBe(true);
    }
  });
});

describe("isValidApiKeyFormat", () => {
  it("should return true for valid API key", () => {
    const validKey = "pchat_" + "a".repeat(64);
    expect(isValidApiKeyFormat(validKey)).toBe(true);
  });

  it("should return true for key with mixed hex characters", () => {
    const validKey = "pchat_0123456789abcdef".padEnd(70, "0");
    expect(isValidApiKeyFormat(validKey)).toBe(true);
  });

  it("should return false for key without pchat_ prefix", () => {
    const invalidKey = "wrong_" + "a".repeat(64);
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });

  it("should return false for key with missing prefix", () => {
    const invalidKey = "a".repeat(64);
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });

  it("should return false for key that is too short", () => {
    const shortKey = "pchat_" + "a".repeat(32);
    expect(isValidApiKeyFormat(shortKey)).toBe(false);
  });

  it("should return false for key that is too long", () => {
    const longKey = "pchat_" + "a".repeat(100);
    expect(isValidApiKeyFormat(longKey)).toBe(false);
  });

  it("should return false for key with invalid characters", () => {
    const invalidKey = "pchat_" + "g".repeat(64); // 'g' is not hex
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });

  it("should return false for key with uppercase hex", () => {
    const invalidKey = "pchat_" + "A".repeat(64);
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidApiKeyFormat("")).toBe(false);
  });

  it("should return false for just the prefix", () => {
    expect(isValidApiKeyFormat("pchat_")).toBe(false);
  });

  it("should return false for key with spaces", () => {
    const invalidKey = "pchat_" + "a".repeat(32) + " " + "a".repeat(31);
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });

  it("should return false for key with special characters", () => {
    const invalidKey = "pchat_" + "a".repeat(63) + "!";
    expect(isValidApiKeyFormat(invalidKey)).toBe(false);
  });
});
