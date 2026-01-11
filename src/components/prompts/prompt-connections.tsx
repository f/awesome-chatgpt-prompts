"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { Link2, ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
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

export function PromptConnections({
  promptId,
  promptTitle,
  canEdit,
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

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/connections`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setOutgoing(data.outgoing || []);
        setIncoming(data.incoming || []);
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
