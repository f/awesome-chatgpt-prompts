import { describe, it, expect, vi, beforeEach } from "vitest";
import { canViewPrompt, checkPromptAccess } from "@/lib/prompt-access";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("canViewPrompt", () => {
  it("should return false for null prompt", () => {
    expect(canViewPrompt(null, null)).toBe(false);
  });

  it("should return true for public prompt with no session", () => {
    expect(
      canViewPrompt({ isPrivate: false, authorId: "user1" }, null)
    ).toBe(true);
  });

  it("should return true for public prompt with any session", () => {
    const session = { user: { id: "other" } } as Session;
    expect(
      canViewPrompt({ isPrivate: false, authorId: "user1" }, session)
    ).toBe(true);
  });

  it("should return false for private prompt with no session", () => {
    expect(
      canViewPrompt({ isPrivate: true, authorId: "user1" }, null)
    ).toBe(false);
  });

  it("should return false for private prompt when user is not owner", () => {
    const session = { user: { id: "other", role: "USER" } } as Session;
    expect(
      canViewPrompt({ isPrivate: true, authorId: "user1" }, session)
    ).toBe(false);
  });

  it("should return true for private prompt when user is the owner", () => {
    const session = { user: { id: "user1", role: "USER" } } as Session;
    expect(
      canViewPrompt({ isPrivate: true, authorId: "user1" }, session)
    ).toBe(true);
  });

  it("should return true for private prompt when user is admin", () => {
    const session = { user: { id: "admin1", role: "ADMIN" } } as Session;
    expect(
      canViewPrompt({ isPrivate: true, authorId: "user1" }, session)
    ).toBe(true);
  });

  it("should return false for private prompt with session missing user", () => {
    const session = {} as Session;
    expect(
      canViewPrompt({ isPrivate: true, authorId: "user1" }, session)
    ).toBe(false);
  });
});

describe("checkPromptAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 for null prompt", async () => {
    const result = await checkPromptAccess(null);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(404);
    const data = await result!.json();
    expect(data.error).toBe("not_found");
  });

  it("should return null for public prompt (no auth call)", async () => {
    const result = await checkPromptAccess({ isPrivate: false, authorId: "user1" });
    expect(result).toBeNull();
    expect(auth).not.toHaveBeenCalled();
  });

  it("should return 404 for private prompt with no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const result = await checkPromptAccess({ isPrivate: true, authorId: "user1" });
    expect(result).not.toBeNull();
    expect(result!.status).toBe(404);
    expect(auth).toHaveBeenCalledOnce();
  });

  it("should return 404 for private prompt when user is not owner", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "other", role: "USER" } } as never);
    const result = await checkPromptAccess({ isPrivate: true, authorId: "user1" });
    expect(result).not.toBeNull();
    expect(result!.status).toBe(404);
  });

  it("should return null for private prompt when user is the owner", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    const result = await checkPromptAccess({ isPrivate: true, authorId: "user1" });
    expect(result).toBeNull();
  });

  it("should return null for private prompt when user is admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    const result = await checkPromptAccess({ isPrivate: true, authorId: "user1" });
    expect(result).toBeNull();
  });
});
