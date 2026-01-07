import { describe, it, expect } from "vitest";
import { prettifyJson, isValidJson } from "@/lib/format";

describe("prettifyJson", () => {
  it("should prettify valid JSON with proper indentation", () => {
    const input = '{"name":"John","age":30}';
    const expected = `{
  "name": "John",
  "age": 30
}`;
    expect(prettifyJson(input)).toBe(expected);
  });

  it("should prettify nested JSON objects", () => {
    const input = '{"user":{"name":"John","address":{"city":"NYC"}}}';
    const result = prettifyJson(input);
    expect(result).toContain('"user"');
    expect(result).toContain('"address"');
    expect(result).toContain('"city"');
    expect(result.split("\n").length).toBeGreaterThan(1);
  });

  it("should prettify JSON arrays", () => {
    const input = '[1,2,3,4,5]';
    const expected = `[
  1,
  2,
  3,
  4,
  5
]`;
    expect(prettifyJson(input)).toBe(expected);
  });

  it("should prettify mixed arrays and objects", () => {
    const input = '{"items":[{"id":1},{"id":2}]}';
    const result = prettifyJson(input);
    expect(result).toContain('"items"');
    expect(result).toContain('"id"');
    expect(result.split("\n").length).toBeGreaterThan(3);
  });

  it("should return original content for invalid JSON", () => {
    const invalidJson = "not valid json";
    expect(prettifyJson(invalidJson)).toBe(invalidJson);
  });

  it("should return original content for malformed JSON", () => {
    const malformed = '{"name": "John",}';
    expect(prettifyJson(malformed)).toBe(malformed);
  });

  it("should handle empty object", () => {
    expect(prettifyJson("{}")).toBe("{}");
  });

  it("should handle empty array", () => {
    expect(prettifyJson("[]")).toBe("[]");
  });

  it("should handle JSON with special characters", () => {
    const input = '{"message":"Hello\\nWorld"}';
    const result = prettifyJson(input);
    expect(result).toContain('"message"');
    expect(result).toContain("Hello\\nWorld");
  });

  it("should handle JSON with unicode characters", () => {
    const input = '{"emoji":"\\u2764","text":"Hello"}';
    const result = prettifyJson(input);
    expect(result).toContain('"emoji"');
  });

  it("should handle boolean and null values", () => {
    const input = '{"active":true,"deleted":false,"data":null}';
    const result = prettifyJson(input);
    expect(result).toContain("true");
    expect(result).toContain("false");
    expect(result).toContain("null");
  });

  it("should handle numeric values", () => {
    const input = '{"int":42,"float":3.14,"negative":-10}';
    const result = prettifyJson(input);
    expect(result).toContain("42");
    expect(result).toContain("3.14");
    expect(result).toContain("-10");
  });
});

describe("isValidJson", () => {
  it("should return true for valid JSON object", () => {
    expect(isValidJson('{"name":"John"}')).toBe(true);
  });

  it("should return true for valid JSON array", () => {
    expect(isValidJson("[1,2,3]")).toBe(true);
  });

  it("should return true for empty object", () => {
    expect(isValidJson("{}")).toBe(true);
  });

  it("should return true for empty array", () => {
    expect(isValidJson("[]")).toBe(true);
  });

  it("should return true for JSON string primitive", () => {
    expect(isValidJson('"hello"')).toBe(true);
  });

  it("should return true for JSON number primitive", () => {
    expect(isValidJson("42")).toBe(true);
    expect(isValidJson("3.14")).toBe(true);
  });

  it("should return true for JSON boolean", () => {
    expect(isValidJson("true")).toBe(true);
    expect(isValidJson("false")).toBe(true);
  });

  it("should return true for JSON null", () => {
    expect(isValidJson("null")).toBe(true);
  });

  it("should return false for invalid JSON", () => {
    expect(isValidJson("not json")).toBe(false);
  });

  it("should return false for malformed JSON with trailing comma", () => {
    expect(isValidJson('{"name": "John",}')).toBe(false);
  });

  it("should return false for single quotes (non-standard)", () => {
    expect(isValidJson("{'name': 'John'}")).toBe(false);
  });

  it("should return false for unquoted keys", () => {
    expect(isValidJson("{name: 'John'}")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isValidJson("")).toBe(false);
  });

  it("should return false for undefined-like string", () => {
    expect(isValidJson("undefined")).toBe(false);
  });

  it("should return true for nested valid JSON", () => {
    const nested = '{"level1":{"level2":{"level3":"value"}}}';
    expect(isValidJson(nested)).toBe(true);
  });

  it("should return true for JSON with whitespace", () => {
    const withWhitespace = `{
      "name": "John",
      "age": 30
    }`;
    expect(isValidJson(withWhitespace)).toBe(true);
  });
});
