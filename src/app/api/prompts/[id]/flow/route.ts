import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
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

// Cached function to fetch flow data (revalidates on prompt-flow tag)
const getFlowData = unstable_cache(
  async (promptId: string) => {
    // Step 1: Collect all connected prompt IDs using BFS on connections only
    const allPromptIds = new Set<string>([promptId]);
    const allEdges: Array<{ source: string; target: string; label: string; targetPrivate: boolean; targetAuthorId: string; sourcePrivate?: boolean; sourceAuthorId?: string }> = [];
    const visitedForEdges = new Set<string>();
    const queue: string[] = [promptId];

    // Fetch all connections in batches - much faster than one-by-one
    while (queue.length > 0) {
      const currentBatch = queue.splice(0, queue.length);
      const unvisited = currentBatch.filter(pid => !visitedForEdges.has(pid));
      if (unvisited.length === 0) break;
      
      unvisited.forEach(pid => visitedForEdges.add(pid));

      // Batch fetch connections for all current nodes
      const [outgoing, incoming] = await Promise.all([
        db.promptConnection.findMany({
          where: { 
            sourceId: { in: unvisited },
            label: { not: "related" },
            target: { deletedAt: null }
          },
          select: {
            sourceId: true,
            targetId: true,
            label: true,
            target: { select: { isPrivate: true, authorId: true } },
          },
        }),
        db.promptConnection.findMany({
          where: { 
            targetId: { in: unvisited },
            label: { not: "related" },
            source: { deletedAt: null }
          },
          select: {
            sourceId: true,
            targetId: true,
            label: true,
            source: { select: { isPrivate: true, authorId: true } },
          },
        }),
      ]);

      // Process outgoing
      for (const conn of outgoing) {
        allPromptIds.add(conn.targetId);
        allEdges.push({
          source: conn.sourceId,
          target: conn.targetId,
          label: conn.label,
          targetPrivate: conn.target.isPrivate,
          targetAuthorId: conn.target.authorId,
        });
        if (!visitedForEdges.has(conn.targetId)) {
          queue.push(conn.targetId);
        }
      }

      // Process incoming
      for (const conn of incoming) {
        allPromptIds.add(conn.sourceId);
        // Only add edge if not already added
        const edgeExists = allEdges.some(
          e => e.source === conn.sourceId && e.target === conn.targetId
        );
        if (!edgeExists) {
          allEdges.push({
            source: conn.sourceId,
            target: conn.targetId,
            label: conn.label,
            sourcePrivate: conn.source.isPrivate,
            sourceAuthorId: conn.source.authorId,
            targetPrivate: false,
            targetAuthorId: "",
          });
        }
        if (!visitedForEdges.has(conn.sourceId)) {
          queue.push(conn.sourceId);
        }
      }
    }

    // Step 2: Batch fetch all prompt details in ONE query
    const prompts = await db.prompt.findMany({
      where: { 
        id: { in: Array.from(allPromptIds) },
        deletedAt: null,
      },
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

    return { prompts, allEdges };
  },
  ["prompt-flow"],
  { tags: ["prompt-flow"], revalidate: 60 } // Cache for 60 seconds, revalidate on prompt-flow tag
);

/**
 * Get the full flow graph for a prompt.
 * Optimized: Fetches all connections first, then batch-loads prompts.
 * Cached with "prompt-flow" tag - revalidate when prompts/connections change.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get session and prompt check in parallel
    const [prompt, session] = await Promise.all([
      db.prompt.findUnique({
        where: { id, deletedAt: null },
        select: { id: true, isPrivate: true, authorId: true },
      }),
      auth(),
    ]);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    const userId = session?.user?.id;

    // Helper to check if user can see a prompt
    const canSee = (p: { isPrivate: boolean; authorId: string }) => 
      !p.isPrivate || p.authorId === userId;

    if (!canSee(prompt)) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Get cached flow data
    const { prompts, allEdges } = await getFlowData(id);

    // Build nodes map - filter by visibility
    const nodes: FlowNode[] = prompts
      .filter(p => canSee(p))
      .map(p => ({
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
      }));

    // Filter edges to only include visible nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: FlowEdge[] = allEdges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(e => ({ source: e.source, target: e.target, label: e.label }));

    return NextResponse.json({
      nodes,
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
