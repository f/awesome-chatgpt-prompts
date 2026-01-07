import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/reports/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    prompt: {
      findUnique: vi.fn(),
    },
    promptReport: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

describe("POST /api/reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for invalid reason", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "INVALID_REASON" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request data");
  });

  it("should return 400 for missing promptId", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request data");
  });

  it("should return 404 if prompt not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "nonexistent", reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Prompt not found");
  });

  it("should return 400 when reporting own prompt (non-relist)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "user1", // Same as reporter
    } as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("You cannot report your own prompt");
  });

  it("should allow relist request on own prompt", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "user1", // Same as reporter
    } as never);
    vi.mocked(db.promptReport.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptReport.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "RELIST_REQUEST" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("should return 400 if already reported", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "other-user",
    } as never);
    vi.mocked(db.promptReport.findFirst).mockResolvedValue({
      id: "existing-report",
    } as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("You have already reported this prompt");
  });

  it("should create report successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "other-user",
    } as never);
    vi.mocked(db.promptReport.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptReport.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({
        promptId: "123",
        reason: "SPAM",
        details: "This is spam content",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.promptReport.create).toHaveBeenCalledWith({
      data: {
        promptId: "123",
        reporterId: "user1",
        reason: "SPAM",
        details: "This is spam content",
      },
    });
  });

  it("should accept all valid reason types", async () => {
    const reasons = ["SPAM", "INAPPROPRIATE", "COPYRIGHT", "MISLEADING", "RELIST_REQUEST", "OTHER"];

    for (const reason of reasons) {
      vi.clearAllMocks();
      vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
      vi.mocked(db.prompt.findUnique).mockResolvedValue({
        id: "123",
        authorId: reason === "RELIST_REQUEST" ? "user1" : "other-user",
      } as never);
      vi.mocked(db.promptReport.findFirst).mockResolvedValue(null);
      vi.mocked(db.promptReport.create).mockResolvedValue({} as never);

      const request = new Request("http://localhost:3000/api/reports", {
        method: "POST",
        body: JSON.stringify({ promptId: "123", reason }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });

  it("should handle null details", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "other-user",
    } as never);
    vi.mocked(db.promptReport.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptReport.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    await POST(request);

    expect(db.promptReport.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        details: null,
      }),
    });
  });

  it("should check for pending reports only", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockResolvedValue({
      id: "123",
      authorId: "other-user",
    } as never);
    vi.mocked(db.promptReport.findFirst).mockResolvedValue(null);
    vi.mocked(db.promptReport.create).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    await POST(request);

    expect(db.promptReport.findFirst).toHaveBeenCalledWith({
      where: {
        promptId: "123",
        reporterId: "user1",
        status: "PENDING",
      },
    });
  });

  it("should handle database errors gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.prompt.findUnique).mockRejectedValue(new Error("Database error"));

    const request = new Request("http://localhost:3000/api/reports", {
      method: "POST",
      body: JSON.stringify({ promptId: "123", reason: "SPAM" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");
  });
});
