import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "@/app/api/prompts/[id]/comments/[commentId]/vote/route";
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
    commentVote: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

describe("POST /api/prompts/[id]/comments/[commentId]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
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

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 400 for invalid vote value", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 5 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 400 for missing vote value", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 400 for value of 0", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 0 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 404 for non-existent comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 404 if comment belongs to different prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "different-prompt",
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should create new upvote when no existing vote", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
    } as never);
    vi.mocked(db.commentVote.findUnique)
      .mockResolvedValueOnce(null) // No existing vote
      .mockResolvedValueOnce({ value: 1 } as never); // After create
    vi.mocked(db.commentVote.create).mockResolvedValue({} as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([{ value: 1 }] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(1);
    expect(data.userVote).toBe(1);
    expect(db.commentVote.create).toHaveBeenCalledWith({
      data: {
        userId: "user1",
        commentId: "456",
        value: 1,
      },
    });
  });

  it("should create new downvote when no existing vote", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
    } as never);
    vi.mocked(db.commentVote.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ value: -1 } as never);
    vi.mocked(db.commentVote.create).mockResolvedValue({} as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([{ value: -1 }] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: -1 }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(-1);
    expect(data.userVote).toBe(-1);
  });

  it("should toggle off when voting same value twice", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
    } as never);
    vi.mocked(db.commentVote.findUnique)
      .mockResolvedValueOnce({ value: 1 } as never) // Existing upvote
      .mockResolvedValueOnce(null); // After deletion
    vi.mocked(db.commentVote.delete).mockResolvedValue({} as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }), // Same as existing
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(0);
    expect(data.userVote).toBe(0);
    expect(db.commentVote.delete).toHaveBeenCalled();
  });

  it("should switch vote when voting opposite value", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
    } as never);
    vi.mocked(db.commentVote.findUnique)
      .mockResolvedValueOnce({ value: 1 } as never) // Existing upvote
      .mockResolvedValueOnce({ value: -1 } as never); // After update
    vi.mocked(db.commentVote.update).mockResolvedValue({} as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([{ value: -1 }] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: -1 }), // Opposite of existing
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(-1);
    expect(data.userVote).toBe(-1);
    expect(db.commentVote.update).toHaveBeenCalled();
  });

  it("should update cached score on comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue({
      id: "456",
      promptId: "123",
    } as never);
    vi.mocked(db.commentVote.findUnique)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ value: 1 } as never);
    vi.mocked(db.commentVote.create).mockResolvedValue({} as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([
      { value: 1 },
      { value: 1 },
      { value: -1 },
    ] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "POST",
      body: JSON.stringify({ value: 1 }),
    });
    await POST(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });

    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: { score: 1 }, // 1 + 1 - 1 = 1
    });
  });
});

describe("DELETE /api/prompts/[id]/comments/[commentId]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
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

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should remove vote and return updated score", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.commentVote.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([{ value: 1 }] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(1);
    expect(data.userVote).toBe(0);
  });

  it("should handle removing non-existent vote gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.commentVote.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "DELETE",
    });
    const response = await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score).toBe(0);
    expect(data.userVote).toBe(0);
  });

  it("should update cached score on comment after removing vote", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.commentVote.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(db.commentVote.findMany).mockResolvedValue([
      { value: 1 },
      { value: -1 },
    ] as never);
    vi.mocked(db.comment.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments/456/vote", {
      method: "DELETE",
    });
    await DELETE(request, {
      params: Promise.resolve({ id: "123", commentId: "456" }),
    });

    expect(db.comment.update).toHaveBeenCalledWith({
      where: { id: "456" },
      data: { score: 0 }, // 1 - 1 = 0
    });
  });
});
