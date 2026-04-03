import { describe, expect, it } from "vitest";
import { parsePublicPromptPagination } from "../route";

describe("parsePublicPromptPagination", () => {
  it("defaults invalid values", () => {
    const params = new URLSearchParams({ page: "0", perPage: "NaN" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 1, perPage: 24 });
  });

  it("rejects malformed numeric strings by falling back to defaults", () => {
    const params = new URLSearchParams({ page: "2.5", perPage: "10abc" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 1, perPage: 24 });
  });

  it("clamps oversized values via schema maxima", () => {
    const params = new URLSearchParams({ page: "1000000", perPage: "1000000" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 1, perPage: 24 });
  });

  it("preserves valid positive integers", () => {
    const params = new URLSearchParams({ page: "3", perPage: "50" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 3, perPage: 50 });
  });
});
