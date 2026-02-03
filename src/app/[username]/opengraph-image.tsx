import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

export const alt = "User Profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const radiusMap: Record<string, number> = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
};

export default async function OGImage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const config = await getConfig();
  const radius = radiusMap[config.theme?.radius || "sm"] || 8;

  // Only support /@username format
  const decodedUsername = decodeURIComponent(rawUsername);
  if (!decodedUsername.startsWith("@")) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#fff",
            fontSize: 48,
            fontWeight: 600,
          }}
        >
          User Not Found
        </div>
      ),
      { ...size }
    );
  }
  const username = decodedUsername.slice(1);

  const user = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          prompts: true,
        },
      },
    },
  });

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            color: "#fff",
            fontSize: 48,
            fontWeight: 600,
          }}
        >
          User Not Found
        </div>
      ),
      { ...size }
    );
  }

  // Get total upvotes received
  const totalUpvotes = await db.promptVote.count({
    where: {
      prompt: {
        authorId: user.id,
      },
    },
  });

  // Format join date
  const joinDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(user.createdAt);

  const primaryColor = config.theme?.colors?.primary || "#6366f1";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          padding: "48px 56px",
        }}
      >
        {/* Top Bar - Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 600, color: primaryColor }}>
            {config.branding.name}
          </span>
          {user.role === "ADMIN" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: primaryColor + "20",
                color: primaryColor,
                padding: "8px 16px",
                borderRadius: radius * 2,
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              Admin
            </div>
          )}
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              width={180}
              height={180}
              style={{
                borderRadius: 90,
                border: `4px solid ${primaryColor}30`,
              }}
            />
          ) : (
            <div
              style={{
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: "#f4f4f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#71717a",
                fontSize: 72,
                fontWeight: 600,
                border: `4px solid ${primaryColor}30`,
              }}
            >
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          )}

          {/* User Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            {/* Name */}
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 700,
                color: "#18181b",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: 8,
              }}
            >
              {user.name || user.username}
            </div>

            {/* Username */}
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#71717a",
                marginBottom: 32,
              }}
            >
              @{user.username}
            </div>

            {/* Stats */}
            <div
              style={{
                display: "flex",
                gap: 40,
              }}
            >
              {/* Prompts */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#f4f4f5",
                  padding: "14px 24px",
                  borderRadius: radius * 2,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                </svg>
                <span style={{ fontSize: 26, fontWeight: 600, color: "#18181b" }}>
                  {user._count.prompts}
                </span>
                <span style={{ fontSize: 22, color: "#71717a" }}>
                  prompts
                </span>
              </div>

              {/* Upvotes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: primaryColor + "15",
                  padding: "14px 24px",
                  borderRadius: radius * 2,
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m18 15-6-6-6 6" />
                </svg>
                <span style={{ fontSize: 26, fontWeight: 600, color: primaryColor }}>
                  {totalUpvotes}
                </span>
                <span style={{ fontSize: 22, color: "#71717a" }}>
                  upvotes
                </span>
              </div>

              {/* Joined */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: "#f4f4f5",
                  padding: "14px 24px",
                  borderRadius: radius * 2,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span style={{ fontSize: 22, color: "#71717a" }}>
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
