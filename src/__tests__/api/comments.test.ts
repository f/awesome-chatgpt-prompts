import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/prompts/[id]/comments/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getConfig } from "@/lib/config";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findUnique: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

describe("GET /api/prompts/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("feature_disabled");
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 404 for private prompt not owned by user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: true,
      authorId: "other-user",
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return comments for public prompt", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.findMany).mockResolvedValue([
      {
        id: "comment1",
        content: "Test comment",
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        flagged: false,
        authorId: "user1",
        score: 5,
        author: {
          id: "user1",
          name: "User One",
          username: "userone",
          avatar: null,
          role: "USER",
        },
        votes: [],
        _count: { replies: 0 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].content).toBe("Test comment");
  });

  it("should hide flagged comments from non-admins (shadow-ban)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user2", role: "USER" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.findMany).mockResolvedValue([
      {
        id: "comment1",
        content: "Flagged comment",
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        flagged: true,
        authorId: "user1", // Different user
        score: 0,
        author: { id: "user1", name: "User", username: "user", avatar: null, role: "USER" },
        votes: [],
        _count: { replies: 0 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(0); // Flagged comment hidden
  });

  it("should show flagged comments to admins", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.findMany).mockResolvedValue([
      {
        id: "comment1",
        content: "Flagged comment",
        flagged: true,
        authorId: "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        score: 0,
        author: { id: "user1", name: "User", username: "user", avatar: null, role: "USER" },
        votes: [],
        _count: { replies: 0 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    expect(data.comments[0].flagged).toBe(true);
  });

  it("should show own flagged comments to author", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.findMany).mockResolvedValue([
      {
        id: "comment1",
        content: "My flagged comment",
        flagged: true,
        authorId: "user1", // Same user
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        score: 0,
        author: { id: "user1", name: "User", username: "user", avatar: null, role: "USER" },
        votes: [],
        _count: { replies: 0 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments");
    const response = await GET(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toHaveLength(1);
    // Flagged status hidden from non-admins
    expect(data.comments[0].flagged).toBe(false);
  });
});

describe("POST /api/prompts/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: true } } as never);
  });

  it("should return 403 if comments feature is disabled", async () => {
    vi.mocked(getConfig).mockResolvedValue({ features: { comments: false } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test comment" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("feature_disabled");
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test comment" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 400 for empty content", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test comment" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should create comment successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.create).mockResolvedValue({
      id: "comment1",
      content: "Test comment",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
      author: {
        id: "user1",
        name: "Test User",
        username: "testuser",
        avatar: null,
        role: "USER",
      },
    } as never);
    vi.mocked(db.notification.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test comment" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comment.content).toBe("Test comment");
    expect(data.comment.score).toBe(0);
    expect(data.comment.userVote).toBe(0);
  });

  it("should create notification for prompt owner", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1", // Different from commenter
    } as never);
    vi.mocked(db.comment.create).mockResolvedValue({
      id: "comment1",
      content: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
      author: { id: "user1", name: "User", username: "user", avatar: null, role: "USER" },
    } as never);
    vi.mocked(db.notification.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test" }),
    });
    await POST(request, { params: Promise.resolve({ id: "123" }) });

    expect(db.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "COMMENT",
        userId: "author1",
        actorId: "user1",
      }),
    });
  });

  it("should not create notification when commenting on own prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "author1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1", // Same as commenter
    } as never);
    vi.mocked(db.comment.create).mockResolvedValue({
      id: "comment1",
      content: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: null,
      author: { id: "author1", name: "Author", username: "author", avatar: null, role: "USER" },
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Test" }),
    });
    await POST(request, { params: Promise.resolve({ id: "123" }) });

    expect(db.notification.create).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid parent comment", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "author1",
    } as never);
    vi.mocked(db.comment.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Reply", parentId: "nonexistent" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("invalid_parent");
  });
});
