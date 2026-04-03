import { describe, expect, it } from "vitest";
import { parsePublicPromptPagination } from "../route";

describe("parsePublicPromptPagination", () => {
  it("defaults invalid values", () => {
    const params = new URLSearchParams({ page: "0", perPage: "NaN" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 1, perPage: 24 });
  });

  it("clamps oversized perPage values", () => {
    const params = new URLSearchParams({ page: "2", perPage: "1000000" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 2, perPage: 100 });
  });

  it("preserves valid positive integers", () => {
    const params = new URLSearchParams({ page: "3", perPage: "50" });
    expect(parsePublicPromptPagination(params)).toEqual({ page: 3, perPage: 50 });
  });
});
