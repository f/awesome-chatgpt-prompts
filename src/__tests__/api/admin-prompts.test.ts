import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/prompts/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("GET /api/admin/prompts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/admin/prompts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);

    const request = new Request("http://localhost:3000/api/admin/prompts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("should return prompts with pagination for admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([
      {
        id: "1",
        title: "Test Prompt",
        slug: "test-prompt",
        type: "TEXT",
        isPrivate: false,
        isUnlisted: false,
        isFeatured: false,
        viewCount: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: { id: "user1", username: "user", name: "User", avatar: null },
        category: null,
        _count: { votes: 5, reports: 0 },
      },
    ] as never);
    vi.mocked(db.prompt.count).mockResolvedValue(1);

    const request = new Request("http://localhost:3000/api/admin/prompts");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.prompts).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("should apply search filter", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?search=test");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(Object) }),
            expect.objectContaining({ content: expect.any(Object) }),
          ]),
        }),
      })
    );
  });

  it("should apply filter for unlisted prompts", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?filter=unlisted");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isUnlisted: true }),
      })
    );
  });

  it("should apply filter for private prompts", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?filter=private");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isPrivate: true }),
      })
    );
  });

  it("should apply filter for featured prompts", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?filter=featured");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFeatured: true }),
      })
    );
  });

  it("should handle pagination parameters", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(50);

    const request = new Request("http://localhost:3000/api/admin/prompts?page=2&limit=10");
    const response = await GET(request);
    const data = await response.json();

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(10);
    expect(data.pagination.totalPages).toBe(5);
  });

  it("should limit max items per page to 100", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?limit=500");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 100,
      })
    );
  });

  it("should handle sorting parameters", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?sortBy=title&sortOrder=asc");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { title: "asc" },
      })
    );
  });

  it("should default to createdAt desc for invalid sort field", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findMany).mockResolvedValue([]);
    vi.mocked(db.prompt.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/prompts?sortBy=invalid");
    await GET(request);

    expect(db.prompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });
});
