import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/user/profile/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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

describe("GET /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 404 if user not found", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("not_found");
  });

  it("should return user profile successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user1",
      name: "Test User",
      username: "testuser",
      email: "test@example.com",
      avatar: "https://example.com/avatar.png",
      role: "USER",
      createdAt: new Date("2024-01-01"),
    } as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe("user1");
    expect(data.name).toBe("Test User");
    expect(data.username).toBe("testuser");
    expect(data.email).toBe("test@example.com");
    expect(data.role).toBe("USER");
  });

  it("should fetch user with correct fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user1",
      name: "Test",
      username: "test",
      email: "t@t.com",
      avatar: null,
      role: "USER",
      createdAt: new Date(),
    } as never);

    await GET();

    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user1" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });
  });
});

describe("PATCH /api/user/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "New Name", username: "newuser" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("unauthorized");
  });

  it("should return 400 for invalid input - missing name", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ username: "testuser" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 400 for invalid input - missing username", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test User" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 400 for invalid username format", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test", username: "invalid user!" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should return 400 if username is taken", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", username: "olduser" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "other-user" } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test", username: "takenuser" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("username_taken");
  });

  it("should allow keeping the same username", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", username: "sameuser" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user1",
      name: "Updated Name",
      username: "sameuser",
      email: "test@example.com",
      avatar: null,
    } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Name", username: "sameuser" }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("Updated Name");
    // Should NOT check for existing username when keeping the same one
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });

  it("should update profile successfully", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", username: "olduser" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null); // Username not taken
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user1",
      name: "New Name",
      username: "newuser",
      email: "test@example.com",
      avatar: "https://example.com/new-avatar.png",
    } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "New Name",
        username: "newuser",
        avatar: "https://example.com/new-avatar.png",
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.name).toBe("New Name");
    expect(data.username).toBe("newuser");
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "user1" },
      data: {
        name: "New Name",
        username: "newuser",
        avatar: "https://example.com/new-avatar.png",
        bio: null,
        customLinks: expect.anything(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        customLinks: true,
      },
    });
  });

  it("should handle empty avatar string as null", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", username: "testuser" } } as never);
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user1",
      name: "Test",
      username: "testuser",
      email: "test@example.com",
      avatar: null,
    } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Test",
        username: "testuser",
        avatar: "",
      }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          avatar: null,
        }),
      })
    );
  });

  it("should validate username length", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    // Username too long (> 30 chars)
    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Test",
        username: "a".repeat(31),
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should validate name length", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as never);

    // Name too long (> 100 chars)
    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "a".repeat(101),
        username: "testuser",
      }),
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("validation_error");
  });

  it("should accept valid username with underscores", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1", username: "old" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.update).mockResolvedValue({
      id: "user1",
      name: "Test",
      username: "test_user_123",
      email: "test@example.com",
      avatar: null,
    } as never);

    const request = new Request("http://localhost:3000/api/user/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Test",
        username: "test_user_123",
      }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
  });
});
