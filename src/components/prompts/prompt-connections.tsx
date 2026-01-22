"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { Link2, ArrowUp, ArrowDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddConnectionDialog } from "./add-connection-dialog";
import { getPromptUrl } from "@/lib/urls";

interface PromptNode {
  id: string;
  title: string;
  slug: string | null;
}

interface OutgoingConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  order: number;
  target: PromptNode;
}

interface IncomingConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  order: number;
  source: PromptNode;
}

interface PromptConnectionsProps {
  promptId: string;
  promptTitle: string;
  canEdit: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  buttonOnly?: boolean;  // Only render the collapsed button
  sectionOnly?: boolean; // Only render the expanded section
  expanded?: boolean;    // Controlled expanded state
  onExpandChange?: (expanded: boolean) => void; // Callback when expanded state changes
}

interface GraphNode {
  id: string;
  title: string;
  slug: string | null;
  x: number;
  y: number;
  type: "current" | "incoming" | "outgoing";
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  label: string;
  connectionId: string;
}

interface FlowGraphNode {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string;
  type: string;
  authorId: string;
  authorUsername: string;
  authorAvatar: string | null;
}

interface FlowGraphEdge {
  source: string;
  target: string;
  label: string;
}

interface FlowGraphProps {
  nodes: FlowGraphNode[];
  edges: FlowGraphEdge[];
  currentPromptId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onNodeClick: (node: FlowGraphNode) => void;
  onNodeDelete?: (node: FlowGraphNode) => void;
}

function FlowGraph({ nodes, edges, currentPromptId, currentUserId, isAdmin, onNodeClick, onNodeDelete }: FlowGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<FlowGraphNode | null>(null);
  const [nodePos, setNodePos] = useState({ x: 0, y: 0, width: 0 });
  const isOverTooltipRef = useRef(false);
  const isOverNodeRef = useRef(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const scheduleHide = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if not over node or tooltip
      if (!isOverNodeRef.current && !isOverTooltipRef.current) {
        setHoveredNode(null);
      }
    }, 50);
  }, []);

  const handleNodeEnter = useCallback((node: FlowGraphNode, pos: { x: number; y: number }, nodeWidth: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    isOverNodeRef.current = true;
    setHoveredNode(node);
    setNodePos({ x: pos.x, y: pos.y, width: nodeWidth });
  }, []);

  const handleNodeLeave = useCallback(() => {
    isOverNodeRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  const handleTooltipEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    isOverTooltipRef.current = true;
  }, []);

  const handleTooltipLeave = useCallback(() => {
    isOverTooltipRef.current = false;
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 600;
    
    // Build adjacency for topological sort
    const inDegree: Record<string, number> = {};
    const outEdges: Record<string, string[]> = {};
    const nodeMap: Record<string, FlowGraphNode> = {};
    
    nodes.forEach(n => {
      inDegree[n.id] = 0;
      outEdges[n.id] = [];
      nodeMap[n.id] = n;
    });
    
    edges.forEach(e => {
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
      outEdges[e.source] = outEdges[e.source] || [];
      outEdges[e.source].push(e.target);
    });

    // Topological sort to assign levels (y positions)
    const levels: Record<string, number> = {};
    const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
    
    queue.forEach(id => { levels[id] = 0; });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels[current];
      
      for (const next of outEdges[current] || []) {
        levels[next] = Math.max(levels[next] || 0, currentLevel + 1);
        inDegree[next]--;
        if (inDegree[next] === 0) {
          queue.push(next);
        }
      }
    }

    // Group nodes by level
    const levelGroups: Record<number, string[]> = {};
    Object.entries(levels).forEach(([id, level]) => {
      levelGroups[level] = levelGroups[level] || [];
      levelGroups[level].push(id);
    });

    const maxLevel = Math.max(...Object.values(levels), 0);
    const nodeWidth = Math.min(180, width * 0.4);
    const nodeHeight = 44;
    const levelHeight = 100;
    const height = (maxLevel + 1) * levelHeight + 80;

    svg.attr("width", width).attr("height", height);

    // Calculate x positions for each node
    const positions: Record<string, { x: number; y: number }> = {};
    
    Object.entries(levelGroups).forEach(([levelStr, ids]) => {
      const level = parseInt(levelStr);
      const count = ids.length;
      const totalWidth = count * nodeWidth + (count - 1) * 40;
      const startX = (width - totalWidth) / 2 + nodeWidth / 2;
      
      ids.forEach((id, i) => {
        positions[id] = {
          x: startX + i * (nodeWidth + 40),
          y: level * levelHeight + 50,
        };
      });
    });

    // Theme colors
    const isDark = document.documentElement.classList.contains("dark");
    const colors = {
      primary: isDark ? "#f4f4f5" : "#18181b",
      primaryFg: isDark ? "#18181b" : "#fafafa",
      card: isDark ? "#27272a" : "#ffffff",
      cardFg: isDark ? "#fafafa" : "#09090b",
      border: isDark ? "#3f3f46" : "#e4e4e7",
      muted: isDark ? "#27272a" : "#f4f4f5",
      mutedFg: isDark ? "#a1a1aa" : "#71717a",
    };

    // Defs for arrow marker
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "flow-arrow")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", colors.mutedFg);

    // Draw edges
    const edgeGroup = svg.append("g").attr("class", "edges");
    
    edges.forEach(edge => {
      const source = positions[edge.source];
      const target = positions[edge.target];
      if (!source || !target) return;

      const sourceY = source.y + nodeHeight / 2;
      const targetY = target.y - nodeHeight / 2;
      const midY = (sourceY + targetY) / 2;

      edgeGroup.append("path")
        .attr("d", `M ${source.x} ${sourceY} C ${source.x} ${midY}, ${target.x} ${midY}, ${target.x} ${targetY}`)
        .attr("fill", "none")
        .attr("stroke", `${colors.mutedFg}60`)
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#flow-arrow)");

      // Edge label
      if (edge.label) {
        const labelX = (source.x + target.x) / 2;
        const labelY = midY;
        const labelWidth = edge.label.length * 5 + 16;
        
        edgeGroup.append("rect")
          .attr("x", labelX - labelWidth / 2)
          .attr("y", labelY - 8)
          .attr("width", labelWidth)
          .attr("height", 16)
          .attr("rx", 8)
          .attr("fill", colors.muted)
          .attr("stroke", colors.border);

        edgeGroup.append("text")
          .attr("x", labelX)
          .attr("y", labelY)
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", colors.mutedFg)
          .attr("font-size", "9px")
          .text(edge.label);
      }
    });

    // Draw nodes
    const nodeGroup = svg.append("g").attr("class", "nodes");

    nodes.forEach(node => {
      const pos = positions[node.id];
      if (!pos) return;

      const isCurrent = node.id === currentPromptId;
      const g = nodeGroup.append("g")
        .attr("transform", `translate(${pos.x}, ${pos.y})`)
        .attr("cursor", "pointer")
        .on("click", () => onNodeClick(node))
        .on("mouseenter", () => {
          if (!isCurrent) {
            handleNodeEnter(node, pos, nodeWidth);
          }
        })
        .on("mouseleave", () => {
          if (!isCurrent) {
            handleNodeLeave();
          }
        });

      g.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -nodeHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", 10)
        .attr("fill", isCurrent ? colors.primary : colors.card)
        .attr("stroke", isCurrent ? colors.primary : colors.border)
        .attr("stroke-width", isCurrent ? 0 : 1.5);

      // Truncate title if too long
      let displayTitle = node.title;
      if (displayTitle.length > 22) {
        displayTitle = displayTitle.slice(0, 20) + "...";
      }

      g.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", isCurrent ? colors.primaryFg : colors.cardFg)
        .attr("font-size", "11px")
        .attr("font-weight", isCurrent ? "700" : "500")
        .text(displayTitle);
    });

  }, [nodes, edges, currentPromptId, onNodeClick, handleNodeEnter, handleNodeLeave]);

  return (
    <div ref={containerRef} className="relative">
      <svg ref={svgRef} className="w-full" />
      {hoveredNode && (() => {
          // Calculate position with viewport awareness
          const tooltipWidth = 320;
          const tooltipHeight = 280;
          const containerRect = containerRef.current?.getBoundingClientRect();
          const containerWidth = containerRef.current?.clientWidth || 600;
          
          // Calculate left position - overlap slightly with node for easier hover transition
          let leftPos = nodePos.x + nodePos.width / 2 - 5;
          // Check if it overflows right edge of container
          if (leftPos + tooltipWidth > containerWidth) {
            leftPos = nodePos.x - nodePos.width / 2 - tooltipWidth + 5;
          }
          // Ensure not negative
          if (leftPos < 0) leftPos = 10;
          
          // Calculate top position - check against viewport
          let topPos = nodePos.y - tooltipHeight / 2;
          
          if (containerRect) {
            const viewportHeight = window.innerHeight;
            const absoluteTop = containerRect.top + topPos;
            const margin = 60; // Keep tooltip well inside viewport
            
            // If tooltip would go below viewport, push it up
            if (absoluteTop + tooltipHeight > viewportHeight - margin) {
              topPos = viewportHeight - containerRect.top - tooltipHeight - margin;
            }
            // If tooltip would go above viewport, push it down
            if (absoluteTop < margin) {
              topPos = margin - containerRect.top;
            }
          }
          
          // Also clamp to container bounds
          if (topPos < 10) topPos = 10;
          // Ensure left is valid
          if (leftPos < 10) leftPos = 10;
          
          return (
            <div 
              ref={tooltipRef}
              className="absolute z-[100] w-80 p-3 rounded-lg border bg-card shadow-xl"
              style={{ 
                left: leftPos, 
                top: topPos,
                pointerEvents: 'auto',
              }}
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {hoveredNode.authorAvatar ? (
                    <img 
                      src={hoveredNode.authorAvatar} 
                      alt={hoveredNode.authorUsername}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                      {hoveredNode.authorUsername.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">@{hoveredNode.authorUsername}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {hoveredNode.type}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{hoveredNode.title}</h4>
                {hoveredNode.description && (
                  <p className="text-xs text-muted-foreground">{hoveredNode.description}</p>
                )}
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {hoveredNode.content}
                </div>
                {/* Delete button for owner or admin */}
                {onNodeDelete && (currentUserId === hoveredNode.authorId || isAdmin) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeDelete(hoveredNode);
                    }}
                    className="w-full mt-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded border border-destructive/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove from flow
                  </button>
                )}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export function PromptConnections({
  promptId,
  promptTitle,
  canEdit,
  currentUserId,
  isAdmin,
  buttonOnly = false,
  sectionOnly = false,
  expanded: controlledExpanded,
  onExpandChange,
}: PromptConnectionsProps) {
  const t = useTranslations("connectedPrompts");
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const [outgoing, setOutgoing] = useState<OutgoingConnection[]>([]);
  const [incoming, setIncoming] = useState<IncomingConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connectionType, setConnectionType] = useState<"previous" | "next">("next");
  const [isExpanded, setIsExpanded] = useState(false);

  // Full flow graph state
  const [flowNodes, setFlowNodes] = useState<FlowGraphNode[]>([]);
  const [flowEdges, setFlowEdges] = useState<FlowGraphEdge[]>([]);

  const fetchConnections = useCallback(async () => {
    try {
      // Fetch both regular connections and full flow
      const [connRes, flowRes] = await Promise.all([
        fetch(`/api/prompts/${promptId}/connections`, { cache: "no-store" }),
        fetch(`/api/prompts/${promptId}/flow`, { cache: "no-store" }),
      ]);
      
      if (connRes.ok) {
        const data = await connRes.json();
        setOutgoing(data.outgoing || []);
        setIncoming(data.incoming || []);
      }
      
      if (flowRes.ok) {
        const flowData = await flowRes.json();
        setFlowNodes(flowData.nodes || []);
        setFlowEdges(flowData.edges || []);
      }
    } catch (err) {
      console.error("Failed to fetch connections:", err);
    } finally {
      setIsLoading(false);
    }
  }, [promptId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Handle removing a node from the flow (deletes all its connections)
  const handleRemoveFromFlow = useCallback(async (node: FlowGraphNode) => {
    if (!confirm(`Remove "${node.title}" from this flow? This will delete all connections to/from this prompt.`)) {
      return;
    }
    
    try {
      // Find all edges connected to this node
      const edgesToDelete = flowEdges.filter(
        e => e.source === node.id || e.target === node.id
      );
      
      // Delete each connection via API
      for (const edge of edgesToDelete) {
        // We need to find the connection ID - fetch connections for the source prompt
        const res = await fetch(`/api/prompts/${edge.source}/connections`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const conn = data.outgoing?.find((c: OutgoingConnection) => c.targetId === edge.target);
          if (conn) {
            await fetch(`/api/prompts/${edge.source}/connections/${conn.id}`, {
              method: "DELETE",
              cache: "no-store",
            });
          }
        }
      }
      
      toast.success("Removed from flow");
      fetchConnections();
    } catch (err) {
      console.error("Failed to remove from flow:", err);
      toast.error("Failed to remove from flow");
    }
  }, [flowEdges, fetchConnections]);

  const handleDeleteConnection = useCallback(async (connectionId: string) => {
    try {
      const res = await fetch(
        `/api/prompts/${promptId}/connections/${connectionId}`,
        { method: "DELETE", cache: "no-store" }
      );

      if (res.ok) {
        // Update local state immediately for responsive UI
        setOutgoing((prev) => prev.filter((c) => c.id !== connectionId));
        setIncoming((prev) => prev.filter((c) => c.id !== connectionId));
        toast.success(t("connectionDeleted"));
        // Also refetch to ensure sync with server
        fetchConnections();
      } else {
        const data = await res.json();
        toast.error(data.error || t("deleteFailed"));
      }
    } catch {
      toast.error(t("deleteFailed"));
    }
  }, [promptId, t, fetchConnections]);

  const handleConnectionAdded = () => {
    toast.success(t("connectionAdded"));
    fetchConnections();
  };

  const getPromptLink = (prompt: { slug: string | null; id: string }) => {
    return getPromptUrl(prompt.id, prompt.slug);
  };

  // D3 Spider Visualization
  useEffect(() => {
    if (isLoading || !svgRef.current) return;
    if (outgoing.length === 0 && incoming.length === 0) return;

    const renderGraph = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Get container dimensions
      const container = svgRef.current?.parentElement;
      const width = container?.clientWidth || 600;
      
      // Responsive sizing based on container width
      const isMobile = width < 500;
      const isTablet = width < 700;
      
      const nodeWidth = isMobile ? width - 40 : isTablet ? Math.min(160, width * 0.35) : Math.min(200, width * 0.3);
      const baseNodeHeight = isMobile ? 36 : 40;
      const lineHeight = 14;
      const verticalGap = isMobile ? 50 : 100;
      const horizontalGap = isMobile ? 20 : isTablet ? 40 : 60;
      const fontSize = isMobile ? "10px" : "11px";
      const labelFontSize = isMobile ? "8px" : "9px";
      
      // Helper to wrap text and get line count
      const getWrappedLines = (text: string, maxWidth: number): string[] => {
        if (isMobile) return [text]; // No wrapping on mobile (full width)
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let currentLine = "";
        const charWidth = 6; // Approximate char width for 11px font
        
        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (testLine.length * charWidth > maxWidth - 20) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [text];
      };
      
      // Calculate node height based on text
      const getNodeHeight = (title: string): number => {
        const lines = getWrappedLines(title, nodeWidth);
        return Math.max(baseNodeHeight, lines.length * lineHeight + 20);
      };
      
      // Use base height for layout calculations
      const nodeHeight = baseNodeHeight;
      
      // Calculate layout dimensions
      const incomingCount = incoming.length;
      const outgoingCount = outgoing.length;
      
      // On mobile, stack nodes vertically if more than 1
      const stackIncoming = isMobile && incomingCount > 1;
      const stackOutgoing = isMobile && outgoingCount > 1;
      
      // Calculate total height (add extra space for badges on mobile)
      const badgeSpace = isMobile ? 24 : 0;
      const incomingRows = stackIncoming ? incomingCount : 1;
      const outgoingRows = stackOutgoing ? outgoingCount : 1;
      const topRowHeight = incomingCount > 0 ? (nodeHeight + badgeSpace + 20) * incomingRows : 0;
      const bottomRowHeight = outgoingCount > 0 ? (nodeHeight + badgeSpace + 20) * outgoingRows : 0;
      const height = topRowHeight + nodeHeight + bottomRowHeight + verticalGap * 2 + 60;
      
      // Update SVG dimensions
      svg.attr("width", width).attr("height", height);
      
      const centerX = width / 2;
      const centerY = topRowHeight + verticalGap + nodeHeight / 2 + 20;

      // Create nodes
      const nodes: GraphNode[] = [];
      const links: GraphLink[] = [];

      // Current prompt (center)
      const currentNode: GraphNode = {
        id: promptId,
        title: promptTitle,
        slug: null,
        x: centerX,
        y: centerY,
        type: "current",
      };
      nodes.push(currentNode);

      // Incoming nodes (top) - stack on mobile, horizontal otherwise
      if (stackIncoming) {
        incoming.forEach((conn, i) => {
          const node: GraphNode = {
            id: conn.source.id,
            title: conn.source.title,
            slug: conn.source.slug,
            x: centerX,
            y: 20 + nodeHeight / 2 + i * (nodeHeight + 20),
            type: "incoming",
          };
          nodes.push(node);
          links.push({
            source: node,
            target: currentNode,
            label: conn.label,
            connectionId: conn.id,
          });
        });
      } else {
        const incomingRowWidth = incomingCount * nodeWidth + (incomingCount - 1) * horizontalGap;
        const incomingStartX = centerX - incomingRowWidth / 2 + nodeWidth / 2;
        const incomingY = 20 + nodeHeight / 2;
        incoming.forEach((conn, i) => {
          const node: GraphNode = {
            id: conn.source.id,
            title: conn.source.title,
            slug: conn.source.slug,
            x: incomingStartX + i * (nodeWidth + horizontalGap),
            y: incomingY,
            type: "incoming",
          };
          nodes.push(node);
          links.push({
            source: node,
            target: currentNode,
            label: conn.label,
            connectionId: conn.id,
          });
        });
      }

      // Outgoing nodes (bottom) - stack on mobile, horizontal otherwise
      if (stackOutgoing) {
        outgoing.forEach((conn, i) => {
          const node: GraphNode = {
            id: conn.target.id,
            title: conn.target.title,
            slug: conn.target.slug,
            x: centerX,
            y: centerY + verticalGap + nodeHeight / 2 + i * (nodeHeight + 20),
            type: "outgoing",
          };
          nodes.push(node);
          links.push({
            source: currentNode,
            target: node,
            label: conn.label,
            connectionId: conn.id,
          });
        });
      } else {
        const outgoingRowWidth = outgoingCount * nodeWidth + (outgoingCount - 1) * horizontalGap;
        const outgoingStartX = centerX - outgoingRowWidth / 2 + nodeWidth / 2;
        const outgoingY = centerY + verticalGap + nodeHeight / 2;
        outgoing.forEach((conn, i) => {
          const node: GraphNode = {
            id: conn.target.id,
            title: conn.target.title,
            slug: conn.target.slug,
            x: outgoingStartX + i * (nodeWidth + horizontalGap),
            y: outgoingY,
            type: "outgoing",
          };
          nodes.push(node);
          links.push({
            source: currentNode,
            target: node,
            label: conn.label,
            connectionId: conn.id,
          });
        });
      }

      // Check if dark mode
      const isDark = document.documentElement.classList.contains("dark");
      
      // Theme colors (light/dark)
      const colors = {
        primary: isDark ? "#f4f4f5" : "#18181b",
        primaryFg: isDark ? "#18181b" : "#fafafa",
        card: isDark ? "#27272a" : "#ffffff",
        cardFg: isDark ? "#fafafa" : "#09090b",
        border: isDark ? "#3f3f46" : "#e4e4e7",
        muted: isDark ? "#27272a" : "#f4f4f5",
        mutedFg: isDark ? "#a1a1aa" : "#71717a",
        destructive: "#ef4444",
      };

      // Create gradient definitions
      const defs = svg.append("defs");
    
    // Arrow marker
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M 0,-4 L 8,0 L 0,4")
      .attr("fill", colors.mutedFg);

    // Drop shadow filter
    const filter = defs
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    filter
      .append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 2)
      .attr("stdDeviation", 3)
      .attr("flood-opacity", 0.15);

    // Draw links (curved paths - vertical)
    const linkGroup = svg.append("g").attr("class", "links");
    
    linkGroup
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", (d) => {
        // For vertical layout: curves go from top to bottom
        const sourceY = d.source.y + (d.source.type === "current" ? -nodeHeight / 2 : nodeHeight / 2);
        const targetY = d.target.y + (d.target.type === "current" ? -nodeHeight / 2 : nodeHeight / 2);
        const midY = (sourceY + targetY) / 2;
        return `M ${d.source.x} ${sourceY} C ${d.source.x} ${midY}, ${d.target.x} ${midY}, ${d.target.x} ${targetY}`;
      })
      .attr("fill", "none")
      .attr("stroke", `${colors.mutedFg}50`)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)");

    // Draw link labels with background (only on desktop)
    if (!isMobile) {
      const labelGroup = svg.append("g").attr("class", "labels");
      
      const labelElements = labelGroup
        .selectAll("g")
        .data(links)
        .join("g")
        .attr("transform", (d) => {
          const x = (d.source.x + d.target.x) / 2;
          const y = (d.source.y + d.target.y) / 2;
          return `translate(${x}, ${y})`;
        });

      labelElements
        .append("rect")
        .attr("x", (d) => -(d.label.length * 2.5 + 8))
        .attr("y", -8)
        .attr("width", (d) => d.label.length * 5 + 16)
        .attr("height", 16)
        .attr("rx", 8)
        .attr("fill", colors.muted)
        .attr("stroke", colors.border)
        .attr("stroke-width", 1);

      labelElements
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", colors.mutedFg)
        .attr("font-size", labelFontSize)
        .attr("font-weight", "500")
        .text((d) => d.label);
    }

    // Draw nodes
    const nodeGroup = svg.append("g").attr("class", "nodes");

    const nodeElements = nodeGroup
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
      .attr("cursor", (d) => (d.type !== "current" ? "pointer" : "default"))
      .on("click", (event, d) => {
        if (d.type !== "current") {
          router.push(getPromptLink(d));
        }
      })
      .on("mouseover", function (event, d) {
        if (d.type !== "current") {
          d3.select(this).select("rect").attr("filter", "url(#shadow)");
        }
      })
      .on("mouseout", function (event, d) {
        if (d.type !== "current") {
          d3.select(this).select("rect").attr("filter", null);
        }
      });

    // Node backgrounds (rounded rectangles with dynamic height)
    nodeElements
      .append("rect")
      .attr("x", -nodeWidth / 2)
      .attr("y", (d) => -getNodeHeight(d.title) / 2)
      .attr("width", nodeWidth)
      .attr("height", (d) => getNodeHeight(d.title))
      .attr("rx", 10)
      .attr("fill", (d) =>
        d.type === "current" ? colors.primary : colors.card
      )
      .attr("stroke", (d) =>
        d.type === "current" ? colors.primary : colors.border
      )
      .attr("stroke-width", (d) => (d.type === "current" ? 0 : 1.5))
      .attr("filter", (d) => (d.type === "current" ? "url(#shadow)" : null));

    // Node labels with text wrapping
    nodeElements.each(function(d) {
      const g = d3.select(this);
      const lines = getWrappedLines(d.title, nodeWidth);
      const totalHeight = lines.length * lineHeight;
      const startY = -totalHeight / 2 + lineHeight / 2;
      
      lines.forEach((line, i) => {
        g.append("text")
          .attr("text-anchor", "middle")
          .attr("y", startY + i * lineHeight)
          .attr("dy", "0.35em")
          .attr("fill", d.type === "current" ? colors.primaryFg : colors.cardFg)
          .attr("font-size", fontSize)
          .attr("font-weight", d.type === "current" ? "700" : "500")
          .text(line);
      });
    });

    // On mobile, add badge labels below each non-current node
    if (isMobile) {
      nodeElements
        .filter((d) => d.type !== "current")
        .each(function(d) {
          const link = links.find(l => 
            (d.type === "incoming" && l.source.id === d.id) ||
            (d.type === "outgoing" && l.target.id === d.id)
          );
          if (link) {
            const badgeLabel = link.label;
            const badgeWidth = badgeLabel.length * 5 + 12;
            const g = d3.select(this);
            const h = getNodeHeight(d.title);
            
            // Badge background (above the node)
            g.append("rect")
              .attr("x", -badgeWidth / 2)
              .attr("y", -h / 2 - 20)
              .attr("width", badgeWidth)
              .attr("height", 16)
              .attr("rx", 8)
              .attr("fill", colors.muted)
              .attr("stroke", colors.border)
              .attr("stroke-width", 1);
            
            // Badge text (above the node)
            g.append("text")
              .attr("text-anchor", "middle")
              .attr("y", -h / 2 - 12)
              .attr("dy", "0.35em")
              .attr("fill", colors.mutedFg)
              .attr("font-size", "8px")
              .attr("font-weight", "500")
              .text(badgeLabel);
          }
        });
    } else {
      // Add type indicator for non-current nodes (desktop only)
      nodeElements
        .filter((d) => d.type !== "current")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => d.type === "incoming" ? getNodeHeight(d.title) / 2 + 14 : -getNodeHeight(d.title) / 2 - 6)
        .attr("fill", colors.mutedFg)
        .attr("font-size", "10px")
        .text((d) => (d.type === "incoming" ? "↓" : "↓"));
    }

    // Add delete buttons for outgoing connections (owner only)
    if (canEdit) {
      const outgoingNodes = nodeElements.filter((d) => d.type === "outgoing");
      
      outgoingNodes
        .append("circle")
        .attr("cx", nodeWidth / 2 - 8)
        .attr("cy", (d) => -getNodeHeight(d.title) / 2 + 8)
        .attr("r", 10)
        .attr("fill", colors.destructive)
        .attr("cursor", "pointer")
        .attr("opacity", 0)
        .attr("class", "delete-btn")
        .on("click", (event, d) => {
          event.stopPropagation();
          const link = links.find(
            (l) => l.target.id === d.id && l.source.id === promptId
          );
          if (link) {
            handleDeleteConnection(link.connectionId);
          }
        });

      outgoingNodes
        .append("text")
        .attr("x", nodeWidth / 2 - 8)
        .attr("y", (d) => -getNodeHeight(d.title) / 2 + 12)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .attr("opacity", 0)
        .attr("class", "delete-icon")
        .text("×");

      // Show delete button on hover
      outgoingNodes
        .on("mouseover", function () {
          d3.select(this).select(".delete-btn").attr("opacity", 1);
          d3.select(this).select(".delete-icon").attr("opacity", 1);
          d3.select(this).select("rect").attr("filter", "url(#shadow)");
        })
        .on("mouseout", function () {
          d3.select(this).select(".delete-btn").attr("opacity", 0);
          d3.select(this).select(".delete-icon").attr("opacity", 0);
          d3.select(this).select("rect").attr("filter", null);
        });
      }
    };

    // Initial render
    renderGraph();

    // Add resize listener for responsiveness
    const handleResize = () => {
      renderGraph();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isLoading, incoming, outgoing, promptId, promptTitle, canEdit, router, handleDeleteConnection]);

  if (isLoading) {
    return null;
  }

  const hasConnections = outgoing.length > 0 || incoming.length > 0;
  const hasFullFlow = flowNodes.length > 1 && flowEdges.length > 0;

  // Show to everyone if there are connections, otherwise only show to owners/admins
  if (!canEdit && !hasConnections) {
    return null;
  }
  // Use controlled state if provided, otherwise use internal state
  const isCurrentlyExpanded = controlledExpanded !== undefined ? controlledExpanded : isExpanded;
  const showExpanded = hasConnections || isCurrentlyExpanded;
  
  const handleExpand = () => {
    if (onExpandChange) {
      onExpandChange(true);
    } else {
      setIsExpanded(true);
    }
  };

  // buttonOnly mode: only show the collapsed button (for button row)
  // Only owners/admins can add new connections
  if (buttonOnly) {
    if (showExpanded || !canEdit) return null; // Don't show button if expanded or not owner
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExpand}
      >
        <Link2 className="h-4 w-4 mr-2" />
        {t("addPromptFlow")}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  // sectionOnly mode: only show the expanded section (for below buttons)
  if (sectionOnly) {
    // For non-owners: only show if there are connections
    // For owners: show if expanded or has connections
    if (!canEdit && !hasConnections) return null;
    if (canEdit && !showExpanded) return null;
    
    return (
      <div className="w-full mt-4 space-y-4 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("title")}</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("description")}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConnectionType("previous");
                  setDialogOpen(true);
                }}
              >
                <ArrowUp className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("addPrevious")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConnectionType("next");
                  setDialogOpen(true);
                }}
              >
                <ArrowDown className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("addNext")}</span>
              </Button>
            </div>
          )}
        </div>

        {!hasConnections ? (
          <p className="text-sm text-muted-foreground">{t("noConnections")}</p>
        ) : hasFullFlow ? (
          /* Full Flow Graph Display with D3 */
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground text-center mb-3">{t("fullFlow")}</p>
            <FlowGraph
              nodes={flowNodes}
              edges={flowEdges}
              currentPromptId={promptId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onNodeClick={(node) => router.push(getPromptLink(node))}
              onNodeDelete={canEdit ? handleRemoveFromFlow : undefined}
            />
          </div>
        ) : (
          /* Original D3 Spider Diagram for simple connections */
          <div className="w-full">
            {incoming.length > 0 && (
              <p className="text-xs text-muted-foreground mb-2 text-center">{t("previousSteps")}</p>
            )}
            <div className="w-full">
              <svg ref={svgRef} className="w-full" />
            </div>
            {outgoing.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">{t("nextSteps")}</p>
            )}
          </div>
        )}

        {canEdit && (
          <AddConnectionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            promptId={promptId}
            connectionType={connectionType}
            onConnectionAdded={handleConnectionAdded}
          />
        )}
      </div>
    );
  }

  // Default: render both (for backwards compatibility)
  // For non-owners: only show visualization if connections exist
  const showVisualization = hasConnections || (canEdit && showExpanded);
  
  return (
    <>
      {canEdit && !showExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
        >
          <Link2 className="h-4 w-4 mr-2" />
          {t("addPromptFlow")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      )}

      {showVisualization && (
        <div className="w-full mt-4 space-y-4 rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{t("title")}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("description")}</p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConnectionType("previous");
                    setDialogOpen(true);
                  }}
                >
                  <ArrowUp className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">{t("addPrevious")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConnectionType("next");
                    setDialogOpen(true);
                  }}
                >
                  <ArrowDown className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">{t("addNext")}</span>
                </Button>
              </div>
            )}
          </div>

          {!hasConnections ? (
            <p className="text-sm text-muted-foreground">{t("noConnections")}</p>
          ) : hasFullFlow ? (
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-3">{t("fullFlow")}</p>
              <FlowGraph
                nodes={flowNodes}
                edges={flowEdges}
                currentPromptId={promptId}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onNodeClick={(node) => router.push(getPromptLink(node))}
                onNodeDelete={canEdit ? handleRemoveFromFlow : undefined}
              />
            </div>
          ) : (
            <div className="w-full">
              {incoming.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2 text-center">{t("previousSteps")}</p>
              )}
              <div className="w-full">
                <svg ref={svgRef} className="w-full" />
              </div>
              {outgoing.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">{t("nextSteps")}</p>
              )}
            </div>
          )}

          {canEdit && (
            <AddConnectionDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              promptId={promptId}
              connectionType={connectionType}
              onConnectionAdded={handleConnectionAdded}
            />
          )}
        </div>
      )}
    </>
  );
}
