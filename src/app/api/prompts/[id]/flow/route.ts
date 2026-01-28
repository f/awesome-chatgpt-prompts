import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface FlowNode {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string;
  type: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
  requiresMediaUpload: boolean;
  requiredMediaType: string | null;
  requiredMediaCount: number | null;
  mediaUrl: string | null;
}

interface FlowEdge {
  source: string;
  target: string;
  label: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get the full flow graph for a prompt.
 * This traverses to find all connected prompts and returns the complete graph.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const prompt = await db.prompt.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, title: true, slug: true, isPrivate: true, authorId: true },
    });

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    // Helper to check if user can see a prompt
    const canSee = (p: { isPrivate: boolean; authorId: string }) => 
      !p.isPrivate || p.authorId === userId;

    const nodes: Map<string, FlowNode> = new Map();
    const edges: FlowEdge[] = [];
    const visited = new Set<string>();

    // BFS to find all connected nodes (both directions)
    const queue: string[] = [id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const p = await db.prompt.findUnique({
        where: { id: currentId, deletedAt: null },
        select: { 
          id: true, 
          title: true, 
          slug: true, 
          description: true,
          content: true,
          type: true,
          isPrivate: true, 
          authorId: true,
          requiresMediaUpload: true,
          requiredMediaType: true,
          requiredMediaCount: true,
          mediaUrl: true,
          author: {
            select: {
              username: true,
              avatar: true,
            },
          },
        },
      });

      if (!p || !canSee(p)) continue;

      nodes.set(p.id, { 
        id: p.id, 
        title: p.title, 
        slug: p.slug,
        description: p.description,
        content: p.content,
        type: p.type,
        authorId: p.authorId,
        authorUsername: p.author.username,
        authorAvatar: p.author.avatar,
        requiresMediaUpload: p.requiresMediaUpload,
        requiredMediaType: p.requiredMediaType,
        requiredMediaCount: p.requiredMediaCount,
        mediaUrl: p.mediaUrl,
      });

      // Get outgoing connections
      const outgoing = await db.promptConnection.findMany({
        where: { 
          sourceId: currentId, 
          label: { not: "related" },
          target: { deletedAt: null }
        },
        orderBy: { order: "asc" },
        include: {
          target: {
            select: { id: true, title: true, slug: true, isPrivate: true, authorId: true },
          },
        },
      });

      for (const conn of outgoing) {
        if (canSee(conn.target)) {
          edges.push({
            source: currentId,
            target: conn.targetId,
            label: conn.label,
          });
          if (!visited.has(conn.targetId)) {
            queue.push(conn.targetId);
          }
        }
      }

      // Get incoming connections
      const incoming = await db.promptConnection.findMany({
        where: { 
          targetId: currentId, 
          label: { not: "related" },
          source: { deletedAt: null }
        },
        orderBy: { order: "asc" },
        include: {
          source: {
            select: { id: true, title: true, slug: true, isPrivate: true, authorId: true },
          },
        },
      });

      for (const conn of incoming) {
        if (canSee(conn.source)) {
          // Only add edge if not already added
          const edgeExists = edges.some(e => e.source === conn.sourceId && e.target === currentId);
          if (!edgeExists) {
            edges.push({
              source: conn.sourceId,
              target: currentId,
              label: conn.label,
            });
          }
          if (!visited.has(conn.sourceId)) {
            queue.push(conn.sourceId);
          }
        }
      }
    }

    return NextResponse.json({
      nodes: Array.from(nodes.values()),
      edges,
      currentPromptId: id,
    });
  } catch (error) {
    console.error("Failed to fetch flow:", error);
    return NextResponse.json(
      { error: "Failed to fetch flow" },
      { status: 500 }
    );
  }
}
