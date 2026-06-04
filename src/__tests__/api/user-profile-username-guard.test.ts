import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/user/profile/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    collection: {
      count: vi.fn(),
    },
    bookmark: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    prompt: {
      findUnique: vi.fn(),
    },
  },
}));

const makeRequest = (body: object) =>
  new Request("http://localhost/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

describe("PATCH /api/user/profile — username freeze guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-123", username: "alice" },
    } as never);
  });

  it("returns 400 username_locked when user has PUBLIC collection", async () => {
    vi.mocked(db.collection.count).mockResolvedValue(2);

    const res = await PATCH(makeRequest({ name: "Alice", username: "alicenew" }) as never);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("username_locked");
  });

  it("allows change when user has no PUBLIC or ADMIN_PRIVATE collections", async () => {
    vi.mocked(db.collection.count).mockResolvedValue(0);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.update).mockResolvedValue({ id: "user-123", username: "alicenew" } as never);

    const res = await PATCH(makeRequest({ name: "Alice", username: "alicenew" }) as never);
    expect(res.status).toBe(200);
  });

  it("skips guard when username is unchanged", async () => {
    vi.mocked(db.user.update).mockResolvedValue({ id: "user-123", username: "alice" } as never);

    const res = await PATCH(makeRequest({ name: "Alice", username: "alice" }) as never);

    expect(vi.mocked(db.collection.count)).not.toHaveBeenCalled();
  });
});
