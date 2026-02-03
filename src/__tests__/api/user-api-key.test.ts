import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, DELETE, PATCH } from "@/app/api/user/api-key/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateApiKey } from "@/lib/api-key";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/api-key", () => ({
  generateApiKey: vi.fn(),
}));

describe("GET /api/user/api-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 401 if session has no user id", async () => {
    vi.mocked(auth).mockResolvedValue({ user: {} } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 404 if user not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("should return hasApiKey: false when no key exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      apiKey: null,
      mcpPromptsPublicByDefault: true,
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hasApiKey).toBe(false);
    expect(data.apiKey).toBeNull();
  });

  it("should return hasApiKey: true and key when exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      apiKey: "pchat_abc123def456",
      mcpPromptsPublicByDefault: true,
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.hasApiKey).toBe(true);
    expect(data.apiKey).toBe("pchat_abc123def456");
  });

  it("should return mcpPromptsPublicByDefault setting", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      apiKey: "pchat_abc123",
      mcpPromptsPublicByDefault: false,
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.mcpPromptsPublicByDefault).toBe(false);
  });
});

describe("POST /api/user/api-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should generate and return new API key", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(generateApiKey).mockReturnValue("pchat_newkey123");
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.apiKey).toBe("pchat_newkey123");
  });

  it("should update user with new key", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(generateApiKey).mockReturnValue("pchat_newkey123");
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    await POST();

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { apiKey: "pchat_newkey123" },
    });
  });

  it("should call generateApiKey function", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(generateApiKey).mockReturnValue("pchat_test");
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    await POST();

    expect(generateApiKey).toHaveBeenCalled();
  });
});

describe("DELETE /api/user/api-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should set apiKey to null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    await DELETE();

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { apiKey: null },
    });
  });

  it("should return success: true", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    const response = await DELETE();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe("PATCH /api/user/api-key", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({ mcpPromptsPublicByDefault: true }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 for missing mcpPromptsPublicByDefault", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({}),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  it("should return 400 for non-boolean value", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({ mcpPromptsPublicByDefault: "true" }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  it("should return 400 for number value", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({ mcpPromptsPublicByDefault: 1 }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid request");
  });

  it("should update mcpPromptsPublicByDefault to true", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({ mcpPromptsPublicByDefault: true }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { mcpPromptsPublicByDefault: true },
    });
  });

  it("should update mcpPromptsPublicByDefault to false", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({} as never);

    const request = new Request("http://localhost:3000/api/user/api-key", {
      method: "PATCH",
      body: JSON.stringify({ mcpPromptsPublicByDefault: false }),
    });
    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: { mcpPromptsPublicByDefault: false },
    });
  });
});
