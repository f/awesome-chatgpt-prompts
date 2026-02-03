import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/prompts/[id]/unlist/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

describe("POST /api/prompts/[id]/unlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 403 if user is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", role: "USER" } } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("should return 404 for non-existent prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should toggle unlisted status from false to true", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123", isUnlisted: false } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isUnlisted: true } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isUnlisted).toBe(true);
    expect(data.message).toBe("Prompt unlisted");
  });

  it("should toggle unlisted status from true to false (relist)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123", isUnlisted: true } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({ isUnlisted: false } as never);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    const response = await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isUnlisted).toBe(false);
    expect(data.message).toBe("Prompt relisted");
  });

  it("should set unlistedAt when unlisting", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123", isUnlisted: false } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(db.prompt.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: {
        isUnlisted: true,
        unlistedAt: expect.any(Date),
      },
    });
  });

  it("should clear unlistedAt when relisting", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin1", role: "ADMIN" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({ id: "123", isUnlisted: true } as never);
    vi.mocked(db.prompt.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/prompts/123/unlist", {
      method: "POST",
    });
    await POST(request, {
      params: Promise.resolve({ id: "123" }),
    });

    expect(db.prompt.update).toHaveBeenCalledWith({
      where: { id: "123" },
      data: {
        isUnlisted: false,
        unlistedAt: null,
      },
    });
  });
});
