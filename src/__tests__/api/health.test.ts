import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { db } from "@/lib/db";

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return healthy status when database is connected", async () => {
    // Mock successful database query
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.database).toBe("connected");
    expect(data.timestamp).toBeDefined();
  });

  it("should return unhealthy status when database is disconnected", async () => {
    // Mock database error
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error("Connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.database).toBe("disconnected");
    expect(data.error).toBe("Connection failed");
    expect(data.timestamp).toBeDefined();
  });

  it("should handle unknown error type", async () => {
    // Mock non-Error rejection
    vi.mocked(db.$queryRaw).mockRejectedValueOnce("Unknown error");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.error).toBe("Unknown error");
  });

  it("should include ISO timestamp in response", async () => {
    vi.mocked(db.$queryRaw).mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const data = await response.json();

    // Verify timestamp is valid ISO format
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });
});
