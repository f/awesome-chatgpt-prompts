import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/categories/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    category: {
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

describe("POST /api/admin/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test", slug: "test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test", slug: "test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if name is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ slug: "test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Name and slug are required");
  });

  it("should return 400 if slug is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Name and slug are required");
  });

  it("should create category with required fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.category.create).mockResolvedValue({
      id: "1",
      name: "Test Category",
      slug: "test-category",
      description: null,
      icon: null,
      parentId: null,
      pinned: false,
    } as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test Category", slug: "test-category" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Test Category");
    expect(data.slug).toBe("test-category");
  });

  it("should create category with optional fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.category.create).mockResolvedValue({
      id: "1",
      name: "Test Category",
      slug: "test-category",
      description: "A test category",
      icon: "📚",
      parentId: "parent-1",
      pinned: true,
    } as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Category",
        slug: "test-category",
        description: "A test category",
        icon: "📚",
        parentId: "parent-1",
        pinned: true,
      }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.description).toBe("A test category");
    expect(data.icon).toBe("📚");
    expect(data.pinned).toBe(true);
  });

  it("should call db.category.create with correct data", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.category.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({
        name: "My Category",
        slug: "my-category",
        description: "Description",
        icon: "🎯",
        parentId: "parent-id",
        pinned: true,
      }),
    });
    await POST(request);

    expect(db.category.create).toHaveBeenCalledWith({
      data: {
        name: "My Category",
        slug: "my-category",
        description: "Description",
        icon: "🎯",
        parentId: "parent-id",
        pinned: true,
      },
    });
  });
});
