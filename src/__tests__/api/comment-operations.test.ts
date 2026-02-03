import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/prompts/[id]/comments/[commentId]/route";
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

describe("DELETE /api/prompts/[id]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("feature_disabled");
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 404 for non-existent comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 404 if comment belongs to different prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "different-prompt", // Different from params
      authorId: "user1",
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 403 if user is not author or admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      authorId: "other-user", // Different author
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("should allow author to delete own comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      authorId: "user1", // Same as session user
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(true);
    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("should allow admin to delete any comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      authorId: "other-user", // Different user, but admin can delete
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.deleted).toBe(true);
  });

  it("should soft delete by setting deletedAt timestamp", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
      authorId: "user1",
    } as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456", {
      method: "DELETE",
    });
    await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });

    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
