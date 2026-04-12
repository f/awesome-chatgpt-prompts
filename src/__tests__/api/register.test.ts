import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { POST } from "@/app/api/auth/register/route";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

// Mock dependencies
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/config", () => ({
  getConfig: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

function createRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: registration is enabled
    vi.mocked(getConfig).mockResolvedValue({
      auth: { allowRegistration: true, providers: [] },
      features: { privatePrompts: true, changeRequests: true, categories: true, tags: true },
    } as never);
    // Default: no existing users
    vi.mocked(db.user.findUnique).mockResolvedValue(null);
    vi.mocked(db.user.findFirst).mockResolvedValue(null);
  });

  describe("validation", () => {
    it("should return 400 for missing name", async () => {
      const request = createRequest({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 400 for name too short", async () => {
      const request = createRequest({
        name: "A",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 400 for missing username", async () => {
      const request = createRequest({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 400 for invalid username format", async () => {
      const request = createRequest({
        name: "Test User",
        username: "invalid-username!",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 400 for invalid email", async () => {
      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "invalid-email",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 400 for password too short", async () => {
      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "12345",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });
  });

  describe("registration disabled", () => {
    it("should return 403 when registration is disabled", async () => {
      vi.mocked(getConfig).mockResolvedValue({
        auth: { allowRegistration: false, providers: [] },
        features: { privatePrompts: true, changeRequests: true, categories: true, tags: true },
      } as never);

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("registration_disabled");
    });
  });

  describe("duplicate checks", () => {
    it("should return 409 when email already exists", async () => {
      // Mock: create throws P2002 unique violation on email
      vi.mocked(db.user.create).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          meta: { target: ["email"] },
          clientVersion: "5.0.0",
        })
      );

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("email_taken");
    });

    it("should return 409 for case-insensitive email collision", async () => {
      // Mock: create throws P2002 unique violation on CI email index
      vi.mocked(db.user.create).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          meta: { target: ["users_email_ci_unique"] },
          clientVersion: "5.0.0",
        })
      );

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "Test@Example.COM",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("email_taken");
    });

    it("should return 409 when username already exists", async () => {
      // Mock: create throws P2002 unique violation on username
      vi.mocked(db.user.create).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          meta: { target: ["username"] },
          clientVersion: "5.0.0",
        })
      );

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("username_taken");
    });

    it("should return 400 for uppercase username", async () => {
      const request = createRequest({
        name: "Test User",
        username: "TestUser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("validation_error");
    });

    it("should return 409 for case-insensitive username collision", async () => {
      // Mock: create throws P2002 unique violation on CI username index
      vi.mocked(db.user.create).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
          meta: { target: ["users_username_ci_unique"] },
          clientVersion: "5.0.0",
        })
      );

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("username_taken");
    });
  });

  describe("successful registration", () => {
    it("should create user and return user data", async () => {
      vi.mocked(db.user.create).mockResolvedValue({
        id: "user-123",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        emailVerified: null,
        avatar: null,
        role: "USER",
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe("user-123");
      expect(data.name).toBe("Test User");
      expect(data.username).toBe("testuser");
      expect(data.email).toBe("test@example.com");
      expect(data.password).toBeUndefined(); // Password should not be returned
    });

    it("should lowercase and trim email and username before saving", async () => {
      vi.mocked(db.user.create).mockResolvedValue({
        id: "user-123",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "hashed_password",
        emailVerified: null,
        avatar: null,
        role: "USER",
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest({
        name: "  Test User  ",
        username: "  testuser  ",
        email: "  Test@Example.COM  ",
        password: "password123",
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Test User",
            username: "testuser",
            email: "test@example.com",
          }),
        })
      );
    });

    it("should accept valid username with underscores", async () => {
      vi.mocked(db.user.create).mockResolvedValue({
        id: "user-123",
        name: "Test User",
        username: "test_user_123",
        email: "test@example.com",
        password: "hashed_password",
        emailVerified: null,
        avatar: null,
        role: "USER",
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest({
        name: "Test User",
        username: "test_user_123",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      // Verify that db.user.create was called with the correct username
      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: "test_user_123",
          }),
        })
      );
    });
  });

  describe("error handling", () => {
    it("should return 500 on database error", async () => {
      vi.mocked(db.user.findUnique).mockRejectedValue(new Error("DB Error"));

      const request = createRequest({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("server_error");
    });

    it("should return 500 on invalid JSON body", async () => {
      const request = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("server_error");
    });
  });
});
