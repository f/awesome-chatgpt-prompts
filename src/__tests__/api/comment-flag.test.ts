import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prompts/[id]/comments/[commentId]/flag/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    comment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

describe("POST /api/prompts/[id]/comments/[commentId]/flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("feature_disabled");
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("should return 404 for non-existent comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 404 if comment belongs to different prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "different-prompt",
      flagged: false,
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should flag an unflagged comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      flagged: false,
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({ flagged: true } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.flagged).toBe(true);
  });

  it("should unflag a flagged comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      flagged: true,
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({ flagged: false } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.flagged).toBe(false);
  });

  it("should set flaggedAt and flaggedBy when flagging", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      flagged: false,
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({ flagged: true } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });

    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: {
        flagged: true,
        flaggedAt: expect.any(Date),
        flaggedBy: "admin1",
      },
    });
  });

  it("should clear flaggedAt and flaggedBy when unflagging", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      flagged: true,
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({ flagged: false } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/flag", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });

    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: {
        flagged: false,
        flaggedAt: null,
        flaggedBy: null,
      },
    });
  });
});
