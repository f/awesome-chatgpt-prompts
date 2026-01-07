import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cn, isChromeBrowser } from "@/lib/utils";

describe("cn (className utility)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle arrays of class names", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("should handle undefined and null values", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("should handle empty strings", () => {
    expect(cn("foo", "", "bar")).toBe("foo bar");
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should handle complex tailwind class conflicts", () => {
    // Background color conflict
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    // Margin conflict
    expect(cn("m-2", "m-4")).toBe("m-4");
    // Padding with direction conflict
    expect(cn("p-2", "px-4")).toBe("p-2 px-4");
  });
});

describe("isChromeBrowser", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window and navigator before each test
    vi.stubGlobal("window", { ...originalWindow });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return false when window is undefined (SSR)", () => {
    vi.stubGlobal("window", undefined);
    expect(isChromeBrowser()).toBe(false);
  });

  it("should return true for Chrome browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    expect(isChromeBrowser()).toBe(true);
  });

  it("should return true for Edge browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
    });
    expect(isChromeBrowser()).toBe(true);
  });

  it("should return true for Opera browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0",
    });
    expect(isChromeBrowser()).toBe(true);
  });

  it("should return true for Brave browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      brave: { isBrave: () => Promise.resolve(true) },
    });
    expect(isChromeBrowser()).toBe(true);
  });

  it("should return false for Firefox browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    });
    expect(isChromeBrowser()).toBe(false);
  });

  it("should return false for Safari browser", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    });
    expect(isChromeBrowser()).toBe(false);
  });
});
