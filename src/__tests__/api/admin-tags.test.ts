import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/admin/tags/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    tag: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("POST /api/admin/tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/admin/tags", {
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

    const request = new Request("http://localhost:3000/api/admin/tags", {
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

    const request = new Request("http://localhost:3000/api/admin/tags", {
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

    const request = new Request("http://localhost:3000/api/admin/tags", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Name and slug are required");
  });

  it("should create tag with required fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.tag.create).mockResolvedValue({
      id: "1",
      name: "JavaScript",
      slug: "javascript",
      color: "#6366f1",
    } as never);

    const request = new Request("http://localhost:3000/api/admin/tags", {
      method: "POST",
      body: JSON.stringify({ name: "JavaScript", slug: "javascript" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("JavaScript");
    expect(data.slug).toBe("javascript");
    expect(data.color).toBe("#6366f1");
  });

  it("should create tag with custom color", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.tag.create).mockResolvedValue({
      id: "1",
      name: "Python",
      slug: "python",
      color: "#3776ab",
    } as never);

    const request = new Request("http://localhost:3000/api/admin/tags", {
      method: "POST",
      body: JSON.stringify({ name: "Python", slug: "python", color: "#3776ab" }),
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.color).toBe("#3776ab");
  });

  it("should use default color when not provided", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.tag.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/admin/tags", {
      method: "POST",
      body: JSON.stringify({ name: "Test", slug: "test" }),
    });
    await POST(request);

    expect(db.tag.create).toHaveBeenCalledWith({
      data: {
        name: "Test",
        slug: "test",
        color: "#6366f1",
      },
    });
  });
});
