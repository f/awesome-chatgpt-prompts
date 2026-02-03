import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/admin/users/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("GET /api/admin/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/admin/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);

    const request = new Request("http://localhost:3000/api/admin/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("should return users with pagination for admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: "1",
        email: "test@example.com",
        username: "testuser",
        name: "Test User",
        avatar: null,
        role: "USER",
        verified: true,
        flagged: false,
        flaggedAt: null,
        flaggedReason: null,
        dailyGenerationLimit: 10,
        generationCreditsRemaining: 5,
        createdAt: new Date(),
        _count: { prompts: 3 },
      },
    ] as never);
    vi.mocked(db.user.count).mockResolvedValue(1);

    const request = new Request("http://localhost:3000/api/admin/users");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("should apply search filter", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?search=john");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ email: expect.any(Object) }),
            expect.objectContaining({ username: expect.any(Object) }),
            expect.objectContaining({ name: expect.any(Object) }),
          ]),
        }),
      })
    );
  });

  it("should filter by admin role", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?filter=admin");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ role: "ADMIN" }),
      })
    );
  });

  it("should filter by verified status", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?filter=verified");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ verified: true }),
      })
    );
  });

  it("should filter by unverified status", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?filter=unverified");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ verified: false }),
      })
    );
  });

  it("should filter by flagged status", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?filter=flagged");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ flagged: true }),
      })
    );
  });

  it("should handle pagination", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(100);

    const request = new Request("http://localhost:3000/api/admin/users?page=3&limit=25");
    const response = await GET(request);
    const data = await response.json();

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50,
        take: 25,
      })
    );
    expect(data.pagination.page).toBe(3);
    expect(data.pagination.totalPages).toBe(4);
  });

  it("should sort by username ascending", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const request = new Request("http://localhost:3000/api/admin/users?sortBy=username&sortOrder=asc");
    await GET(request);

    expect(db.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { username: "asc" },
      })
    );
  });
});
