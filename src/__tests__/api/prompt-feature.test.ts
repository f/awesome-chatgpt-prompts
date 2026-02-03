import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prompts/[id]/feature/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    prompt: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("POST /api/prompts/[id]/feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "USER" } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Prompt not found");
  });

  it("should toggle featured status from false to true", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ isFeatured: false } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isFeatured: true } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isFeatured).toBe(true);
  });

  it("should toggle featured status from true to false", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ isFeatured: true } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isFeatured: false } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isFeatured).toBe(false);
  });

  it("should set featuredAt when featuring a prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ isFeatured: false } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isFeatured: true } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(db.prompt.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: {
        isFeatured: true,
        featuredAt: expect.any(Date),
      },
    });
  });

  it("should clear featuredAt when unfeaturing a prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ isFeatured: true } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isFeatured: false } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/feature", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(db.prompt.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: {
        isFeatured: false,
        featuredAt: null,
      },
    });
  });
});
