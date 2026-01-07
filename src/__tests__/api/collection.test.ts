import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE } from "@/app/api/collection/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    collection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    prompt: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("GET /api/collection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return empty collections array", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collections).toEqual([]);
  });

  it("should return user collections with prompt details", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findMany).mockResolvedValue([
      {
        id: "col1",
        userId: "user1",
        promptId: "prompt1",
        createdAt: new Date(),
        prompt: {
          id: "prompt1",
          title: "Test Prompt",
          author: {
            id: "author1",
            name: "Author",
            username: "author",
            avatar: null,
            verified: false,
          },
          category: null,
          tags: [],
          _count: { votes: 5, contributors: 0 },
        },
      },
    ] as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.collections).toHaveLength(1);
    expect(data.collections[0].prompt.title).toBe("Test Prompt");
  });

  it("should fetch collections ordered by createdAt desc", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findMany).mockResolvedValue([]);

    await GET();

    expect(db.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });
});

describe("POST /api/collection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid input - missing promptId", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("should return 400 for empty promptId", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid input");
  });

  it("should return 400 if already in collection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findUnique).mockResolvedValue({ id: "existing" } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Already in collection");
  });

  it("should return 404 if prompt not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findUnique).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "nonexistent" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Prompt not found");
  });

  it("should return 403 when adding private prompt not owned by user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findUnique).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: true,
      authorId: "other-user",
    } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Cannot add private prompt");
  });

  it("should allow adding own private prompt to collection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findUnique).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: true,
      authorId: "user1",
    } as never);
    vi.mocked(db.collection.create).mockResolvedValue({
      id: "col1",
      userId: "user1",
      promptId: "123",
    } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.added).toBe(true);
  });

  it("should add public prompt to collection successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.findUnique).mockResolvedValue(null);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "other-user",
    } as never);
    vi.mocked(db.collection.create).mockResolvedValue({
      id: "col1",
      userId: "user1",
      promptId: "123",
    } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "POST",
      body: JSON.stringify({ promptId: "123" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.added).toBe(true);
    expect(data.collection.id).toBe("col1");
    expect(db.collection.create).toHaveBeenCalledWith({
      data: {
        userId: "user1",
        promptId: "123",
      },
    });
  });
});

describe("DELETE /api/collection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/collection?promptId=123", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if promptId missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/collection", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("promptId required");
  });

  it("should remove prompt from collection successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.delete).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/collection?promptId=123", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.removed).toBe(true);
    expect(db.collection.delete).toHaveBeenCalledWith({
      where: {
        userId_promptId: {
          userId: "user1",
          promptId: "123",
        },
      },
    });
  });

  it("should handle delete error gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.collection.delete).mockRejectedValue(new Error("Not found"));

    const request = new Request("http://localhost:3000/api/collection?promptId=123", {
      method: "DELETE",
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to remove from collection");
  });
});
