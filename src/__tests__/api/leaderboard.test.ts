import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/leaderboard/route";
import { db } from "@/lib/db";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    promptVote: {
      groupBy: vi.fn(),
    },
    prompt: {
      findMany: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}));

describe("GET /api/leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return leaderboard with default period (all)", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([
      { promptId: "prompt1", _count: { promptId: 10 } },
      { promptId: "prompt2", _count: { promptId: 5 } },
    ] as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([
      { id: "prompt1", authorId: "user1" },
      { id: "prompt2", authorId: "user2" },
    ] as never);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "user1",
        name: "User One",
        username: "userone",
        avatar: null,
        _count: { prompts: 5 },
      },
      {
        id: "user2",
        name: "User Two",
        username: "usertwo",
        avatar: null,
        _count: { prompts: 3 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.period).toBe("all");
    expect(data.leaderboard).toBeDefined();
  });

  it("should handle week period parameter", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([]);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.user.findMany).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/leaderboard?period=week");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.period).toBe("week");
  });

  it("should handle month period parameter", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([]);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.user.findMany).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/leaderboard?period=month");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.period).toBe("month");
  });

  it("should return leaderboard sorted by total upvotes", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([
      { promptId: "prompt1", _count: { promptId: 5 } },
      { promptId: "prompt2", _count: { promptId: 10 } },
    ] as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([
      { id: "prompt1", authorId: "user1" },
      { id: "prompt2", authorId: "user2" },
    ] as never);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "user1",
        name: "User One",
        username: "userone",
        avatar: null,
        _count: { prompts: 1 },
      },
      {
        id: "user2",
        name: "User Two",
        username: "usertwo",
        avatar: null,
        _count: { prompts: 1 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // User2 should be first with 10 votes
    expect(data.leaderboard[0].totalUpvotes).toBeGreaterThanOrEqual(data.leaderboard[1]?.totalUpvotes || 0);
  });

  it("should aggregate votes for users with multiple prompts", async () => {
    // Same author for both prompts
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([
      { promptId: "prompt1", _count: { promptId: 5 } },
      { promptId: "prompt2", _count: { promptId: 10 } },
    ] as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([
      { id: "prompt1", authorId: "user1" },
      { id: "prompt2", authorId: "user1" },
    ] as never);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "user1",
        name: "User One",
        username: "userone",
        avatar: null,
        _count: { prompts: 2 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // User should have 15 total votes (5 + 10)
    expect(data.leaderboard[0].totalUpvotes).toBe(15);
  });

  it("should return empty leaderboard when no votes", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([]);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.user.findMany).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toEqual([]);
  });

  it("should include user details in leaderboard", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([
      { promptId: "prompt1", _count: { promptId: 10 } },
    ] as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([
      { id: "prompt1", authorId: "user1" },
    ] as never);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "user1",
        name: "Test User",
        username: "testuser",
        avatar: "https://example.com/avatar.png",
        _count: { prompts: 5 },
      },
    ] as never);

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard[0]).toMatchObject({
      id: "user1",
      name: "Test User",
      username: "testuser",
      avatar: "https://example.com/avatar.png",
      promptCount: 5,
      totalUpvotes: 10,
    });
  });

  it("should handle database errors gracefully", async () => {
    vi.mocked(db.promptVote.groupBy).mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("server_error");
  });

  it("should exclude private and deleted prompts from counting", async () => {
    vi.mocked(db.promptVote.groupBy).mockResolvedValue([
      { promptId: "prompt1", _count: { promptId: 10 } },
    ] as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]); // No public prompts returned
    vi.mocked(db.user.findMany).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/leaderboard");

    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPrivate: false,
          deletedAt: null,
        }),
      })
    );
  });

  it("should limit results to top 50 users", async () => {
    // Create 60 users with votes
    const voteData = Array.from({ length: 60 }, (_, i) => ({
      promptId: `prompt${i}`,
      _count: { promptId: 60 - i },
    }));
    const promptData = voteData.map((v, i) => ({
      id: v.promptId,
      authorId: `user${i}`,
    }));

    vi.mocked(db.promptVote.groupBy).mockResolvedValue(voteData as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue(promptData as never);
    vi.mocked(db.user.findMany).mockResolvedValue(
      Array.from({ length: 50 }, (_, i) => ({
        id: `user${i}`,
        name: `User ${i}`,
        username: `user${i}`,
        avatar: null,
        _count: { prompts: 1 },
      })) as never
    );

    const request = new Request("http://localhost:3000/api/leaderboard");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBeLessThanOrEqual(50);
  });
});
