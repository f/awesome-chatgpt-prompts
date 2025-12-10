import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";

export const alt = "Prompt Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await getConfig();
  
  const prompt = await db.prompt.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          avatar: true,
        },
      },
      category: {
        select: {
          name: true,
          icon: true,
        },
      },
    },
  });

  if (!prompt) {
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
          Prompt Not Found
        </div>
      ),
      { ...size }
    );
  }

  const truncatedContent = prompt.content.length > 280 
    ? prompt.content.slice(0, 280) + "..." 
    : prompt.content;

  const isImagePrompt = prompt.type === "IMAGE" && prompt.mediaUrl;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          backgroundColor: "#09090b",
          padding: 56,
        }}
      >
        {/* Left Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            marginRight: isImagePrompt ? 48 : 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 500, color: "#52525b" }}>
              {config.branding.name}
            </span>

            {prompt.category && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#71717a",
                  fontSize: 18,
                }}
              >
                {prompt.category.icon && <span>{prompt.category.icon}</span>}
                <span>{prompt.category.name}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 600,
              color: "#fafafa",
              lineHeight: 1.25,
              marginBottom: 16,
            }}
          >
            {prompt.title}
          </div>

          {/* Content Preview */}
          <div
            style={{
              fontSize: 20,
              color: "#a1a1aa",
              lineHeight: 1.5,
              flex: 1,
              backgroundColor: "#18181b",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #27272a",
              fontFamily: "monospace",
            }}
          >
            {truncatedContent}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 24,
            }}
          >
            {/* Avatar */}
            {prompt.author.avatar ? (
              <img
                src={prompt.author.avatar}
                width={40}
                height={40}
                style={{ borderRadius: 20 }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "#27272a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#a1a1aa",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {(prompt.author.name || prompt.author.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#fafafa", fontSize: 18, fontWeight: 500 }}>
                {prompt.author.name || prompt.author.username}
              </span>
              <span style={{ color: "#71717a", fontSize: 14 }}>
                @{prompt.author.username}
              </span>
            </div>
          </div>
        </div>

        {/* Image Preview (for image prompts) */}
        {isImagePrompt && (
          <img
            src={prompt.mediaUrl!}
            width={340}
            height={518}
            style={{
              borderRadius: 16,
              objectFit: "cover",
              objectPosition: "center",
              border: "1px solid #27272a",
            }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}
