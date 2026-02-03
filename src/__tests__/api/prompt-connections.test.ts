import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/prompts/[id]/connections/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findUnique: vi.fn(),
    },
    promptConnection: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

describe("GET /api/prompts/[id]/connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/connections");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Prompt not found");
  });

  it("should return empty connections for prompt with none", async () => {
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "user1",
    } as never);
    vi.mocked(db.promptConnection.findMany).mockResolvedValue([]);
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/connections");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.outgoing).toEqual([]);
    expect(data.incoming).toEqual([]);
  });

  it("should return outgoing and incoming connections", async () => {
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "user1",
    } as never);
    vi.mocked(db.promptConnection.findMany)
      .mockResolvedValueOnce([
        {
          id: "conn1",
          label: "next",
          order: 0,
          target: { id: "target1", title: "Target Prompt", slug: "target", isPrivate: false, authorId: "user1" },
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: "conn2",
          label: "previous",
          order: 0,
          source: { id: "source1", title: "Source Prompt", slug: "source", isPrivate: false, authorId: "user2" },
        },
      ] as never);
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.outgoing).toHaveLength(1);
    expect(data.incoming).toHaveLength(1);
  });

  it("should filter out private prompts the user cannot see", async () => {
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "user1",
    } as never);
    vi.mocked(db.promptConnection.findMany)
      .mockResolvedValueOnce([
        {
          id: "conn1",
          label: "next",
          target: { id: "target1", title: "Private", slug: "private", isPrivate: true, authorId: "other-user" },
        },
      ] as never)
      .mockResolvedValueOnce([]);
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(data.outgoing).toHaveLength(0);
  });

  it("should show private prompts owned by the user", async () => {
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      isPrivate: false,
      authorId: "user1",
    } as never);
    vi.mocked(db.promptConnection.findMany)
      .mockResolvedValueOnce([
        {
          id: "conn1",
          label: "next",
          target: { id: "target1", title: "My Private", slug: "private", isPrivate: true, authorId: "user1" },
        },
      ] as never)
      .mockResolvedValueOnce([]);
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections");
    const response = await GET(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(data.outgoing).toHaveLength(1);
  });
});

describe("POST /api/prompts/[id]/connections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if source prompt not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Source prompt not found");
  });

  it("should return 403 if user does not own source prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ authorId: "other-user" } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You can only add connections to your own prompts");
  });

  it("should return 404 if target prompt not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never) // Source
      .mockResolvedValueOnce(null); // Target

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Target prompt not found");
  });

  it("should return 403 if user does not own target prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never) // Source
      .mockResolvedValueOnce({ id: "456", authorId: "other-user" } as never); // Target

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("You can only connect to your own prompts");
  });

  it("should return 400 for self-connection", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never)
      .mockResolvedValueOnce({ id: "123", authorId: "user1" } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "123", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Cannot connect a prompt to itself");
  });

  it("should return 400 if connection already exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never)
      .mockResolvedValueOnce({ id: "456", authorId: "user1" } as never);
    vi.mocked(db.promptConnection.findUnique).mockResolvedValue({ id: "existing" } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Connection already exists");
  });

  it("should create connection successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never)
      .mockResolvedValueOnce({ id: "456", authorId: "user1" } as never);
    vi.mocked(db.promptConnection.findUnique).mockResolvedValue(null);
    vi.mocked(db.promptConnection.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptConnection.create).mockResolvedValue({
      id: "conn1",
      sourceId: "123",
      targetId: "456",
      label: "next",
      order: 0,
      target: { id: "456", title: "Target", slug: "target" },
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.label).toBe("next");
  });

  it("should auto-increment order when not provided", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "user1" } as never)
      .mockResolvedValueOnce({ id: "456", authorId: "user1" } as never);
    vi.mocked(db.promptConnection.findUnique).mockResolvedValue(null);
    vi.mocked(db.promptConnection.findFirst).mockResolvedValue({ order: 2 } as never);
    vi.mocked(db.promptConnection.create).mockResolvedValue({
      id: "conn1",
      order: 3,
      target: {},
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "next" }),
    });
    await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(db.promptConnection.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ order: 3 }),
      })
    );
  });

  it("should return 400 for missing required fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456" }), // Missing label
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(400);
  });

  it("should allow admin to create connections for any prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique)
      .mockResolvedValueOnce({ authorId: "other-user" } as never)
      .mockResolvedValueOnce({ id: "456", authorId: "another-user" } as never);
    vi.mocked(db.promptConnection.findUnique).mockResolvedValue(null);
    vi.mocked(db.promptConnection.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptConnection.create).mockResolvedValue({
      id: "conn1",
      target: {},
    } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/connections", {
      method: "POST",
      body: JSON.stringify({ targetId: "456", label: "admin-link" }),
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(response.status).toBe(201);
  });
});
