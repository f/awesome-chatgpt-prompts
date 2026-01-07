import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, DELETE } from "@/app/api/prompts/[id]/vote/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findUnique: vi.fn(),
    },
    promptVote: {
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("POST /api/prompts/[id]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return 400 if already voted", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123" } as never);
    vi.mocked(db.promptVote.findUnique).mockResolvedValue({ id: "vote1" } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("already_voted");
  });

  it("should create vote successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123" } as never);
    vi.mocked(db.promptVote.findUnique).mockResolvedValue(null);
    vi.mocked(db.promptVote.create).mockResolvedValue({} as never);
    vi.mocked(db.promptVote.count).mockResolvedValue(5);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "POST",
    });

    const response = await POST(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.voted).toBe(true);
    expect(data.voteCount).toBe(5);
    expect(db.promptVote.create).toHaveBeenCalledWith({
      data: {
        userId: "user1",
        promptId: "123",
      },
    });
  });

  it("should lookup vote with correct composite key", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123" } as never);
    vi.mocked(db.promptVote.findUnique).mockResolvedValue(null);
    vi.mocked(db.promptVote.create).mockResolvedValue({} as never);
    vi.mocked(db.promptVote.count).mockResolvedValue(1);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "POST",
    });

    await POST(request, { params: Promise.resolve({ id: "123" }) });

    expect(db.promptVote.findUnique).toHaveBeenCalledWith({
      where: {
        userId_promptId: {
          userId: "user1",
          promptId: "123",
        },
      },
    });
  });
});

describe("DELETE /api/prompts/[id]/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should remove vote successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.promptVote.deleteMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(db.promptVote.count).mockResolvedValue(4);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.voted).toBe(false);
    expect(data.voteCount).toBe(4);
    expect(db.promptVote.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "user1",
        promptId: "123",
      },
    });
  });

  it("should handle deleting non-existent vote gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.promptVote.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(db.promptVote.count).mockResolvedValue(10);

    const request = new Request("http://localhost:3000/api/prompts/123/vote", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: Promise.resolve({ id: "123" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.voted).toBe(false);
    expect(data.voteCount).toBe(10);
  });
});
