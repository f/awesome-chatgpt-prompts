"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import { Link2, ArrowUp, ArrowDown, ChevronRight, Trash2, FastForward, ExternalLink, ImageIcon, Video, FileText, Loader2 } from "lucide-react";
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
  workflowLink?: string | null; // URL to test the workflow
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
  requiresMediaUpload: boolean;
  requiredMediaType: string | null;
  requiredMediaCount: number | null;
  mediaUrl: string | null;
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
  translations: {
    outputText: string;
    outputImage: string;
    outputVideo: string;
    outputAudio: string;
    outputStructured: string;
    outputSkill: string;
    inputImage: string;
    inputVideo: string;
    inputDocument: string;
    inputImages: string;
    inputVideos: string;
    inputDocuments: string;
  };
}

// SVG icon paths (from Lucide icons)
const ICON_PATHS = {
  image: "M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.5 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM21 19H3l4.5-6 3 4 4.5-6 6 8z",
  video: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
  fileText: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  text: "M4 7V4h16v3M9 20h6M12 4v16",
  audio: "M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z",
  structured: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 14h6M9 18h6",
  skill: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

function FlowGraph({ nodes, edges, currentPromptId, currentUserId, isAdmin, onNodeClick, onNodeDelete, translations }: FlowGraphProps) {
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

    // Find leaf nodes (no outgoing edges) to show output type
    const leafNodes = nodes.filter(n => (outEdges[n.id] || []).length === 0);
    
    // Create virtual output nodes for leaf nodes
    interface OutputNode {
      id: string;
      sourceId: string;
      type: string;
      level: number;
    }
    const outputNodes: OutputNode[] = leafNodes.map(leaf => ({
      id: `output-${leaf.id}`,
      sourceId: leaf.id,
      type: leaf.type,
      level: levels[leaf.id] + 1,
    }));

    // Find root nodes (no incoming edges) that require media to show input nodes
    const rootNodes = nodes.filter(n => {
      const hasIncoming = edges.some(e => e.target === n.id);
      return !hasIncoming && n.requiresMediaUpload && n.requiredMediaType && n.requiredMediaCount;
    });
    
    // Create virtual input nodes for root nodes that require media
    interface InputNode {
      id: string;
      targetId: string;
      mediaType: string;
      count: number;
      index: number; // For positioning multiple input nodes
    }
    const inputNodes: InputNode[] = [];
    rootNodes.forEach(root => {
      const count = root.requiredMediaCount || 1;
      const mediaType = root.requiredMediaType || "IMAGE";
      
      if (count <= 3) {
        // Show individual nodes (up to 3)
        for (let i = 0; i < count; i++) {
          inputNodes.push({
            id: `input-${root.id}-${i}`,
            targetId: root.id,
            mediaType,
            count: 1,
            index: i,
          });
        }
      } else {
        // Show single aggregated node for more than 3
        inputNodes.push({
          id: `input-${root.id}-aggregated`,
          targetId: root.id,
          mediaType,
          count,
          index: 0,
        });
      }
    });

    const maxLevel = Math.max(...Object.values(levels), 0);
    const hasOutputNodes = outputNodes.length > 0;
    const hasInputNodes = inputNodes.length > 0;
    const nodeWidth = Math.min(180, width * 0.4);
    const nodeHeight = 44;
    const nodeWithPreviewHeight = 90; // Taller nodes for image previews
    const ioNodeHeight = 32;
    const levelHeight = 140; // Increased to accommodate previews
    const inputOffset = hasInputNodes ? 80 : 0;
    const height = inputOffset + (maxLevel + 1) * levelHeight + (hasOutputNodes ? 80 : 0) + 80;
    
    // Check if any node has a preview (mediaUrl for IMAGE/VIDEO types)
    const hasPreview = (node: FlowGraphNode) => 
      node.mediaUrl && (node.type === "IMAGE" || node.type === "VIDEO");

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
          y: inputOffset + level * levelHeight + 50,
        };
      });
    });

    // Calculate positions for output nodes (below their source nodes)
    const outputPositions: Record<string, { x: number; y: number }> = {};
    outputNodes.forEach(outNode => {
      const sourcePos = positions[outNode.sourceId];
      if (sourcePos) {
        outputPositions[outNode.id] = {
          x: sourcePos.x,
          y: inputOffset + outNode.level * levelHeight + 50,
        };
      }
    });

    // Calculate positions for input nodes (above their target nodes)
    const inputPositions: Record<string, { x: number; y: number }> = {};
    const inputNodeWidth = 100;
    // Group input nodes by target
    const inputsByTarget: Record<string, InputNode[]> = {};
    inputNodes.forEach(inp => {
      inputsByTarget[inp.targetId] = inputsByTarget[inp.targetId] || [];
      inputsByTarget[inp.targetId].push(inp);
    });
    
    Object.entries(inputsByTarget).forEach(([targetId, inputs]) => {
      const targetPos = positions[targetId];
      if (!targetPos) return;
      
      const count = inputs.length;
      const gap = 20;
      const totalWidth = count * inputNodeWidth + (count - 1) * gap;
      const startX = targetPos.x - totalWidth / 2 + inputNodeWidth / 2;
      
      inputs.forEach((inp, i) => {
        inputPositions[inp.id] = {
          x: startX + i * (inputNodeWidth + gap),
          y: 30,
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
    
    // Helper to get node height based on whether it has preview
    const getNodeHeight = (nodeId: string) => {
      const node = nodeMap[nodeId];
      return node && hasPreview(node) ? nodeWithPreviewHeight : nodeHeight;
    };
    
    edges.forEach(edge => {
      const source = positions[edge.source];
      const target = positions[edge.target];
      if (!source || !target) return;

      const sourceHeight = getNodeHeight(edge.source);
      const targetHeight = getNodeHeight(edge.target);
      const sourceY = source.y + sourceHeight / 2;
      const targetY = target.y - targetHeight / 2;
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
      const showPreview = hasPreview(node);
      const currentNodeHeight = showPreview ? nodeWithPreviewHeight : nodeHeight;
      
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

      // Clip path for rounded corners on the entire node
      const clipId = `clip-${node.id.replace(/[^a-zA-Z0-9]/g, '')}`;
      const defs = svg.select("defs").node() ? svg.select("defs") : svg.append("defs");
      defs.append("clipPath")
        .attr("id", clipId)
        .append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -currentNodeHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", currentNodeHeight)
        .attr("rx", 10);

      // Main node rectangle (background)
      g.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -currentNodeHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", currentNodeHeight)
        .attr("rx", 10)
        .attr("fill", isCurrent ? colors.primary : colors.card)
        .attr("stroke", isCurrent ? colors.primary : colors.border)
        .attr("stroke-width", isCurrent ? 0 : 1.5);

      // Add cover image/video preview if available
      if (showPreview && node.mediaUrl) {
        if (node.type === "VIDEO") {
          // For videos, use foreignObject with ABSOLUTE positioning (not relative to group)
          // This fixes iOS Safari which doesn't respect parent group transforms
          const videoClipId = `vclip-${node.id.replace(/[^a-zA-Z0-9]/g, '')}`;
          defs.append("clipPath")
            .attr("id", videoClipId)
            .append("rect")
            .attr("x", pos.x - nodeWidth / 2)
            .attr("y", pos.y - currentNodeHeight / 2)
            .attr("width", nodeWidth)
            .attr("height", currentNodeHeight)
            .attr("rx", 10);

          const videoEl = svg.append("foreignObject")
            .attr("x", pos.x - nodeWidth / 2)
            .attr("y", pos.y - currentNodeHeight / 2)
            .attr("width", nodeWidth)
            .attr("height", currentNodeHeight)
            .attr("clip-path", `url(#${videoClipId})`)
            .attr("pointer-events", "none")
            .append("xhtml:video")
            .attr("src", node.mediaUrl)
            .attr("autoplay", "")
            .attr("loop", "")
            .attr("muted", "")
            .attr("playsinline", "")
            .style("width", "100%")
            .style("height", "100%")
            .style("object-fit", "cover")
            .style("border-radius", "10px");
          
          // Ensure video is muted (some browsers need this set via property)
          const videoNode = videoEl.node() as HTMLVideoElement | null;
          if (videoNode) {
            videoNode.muted = true;
            videoNode.volume = 0;
          }
        } else {
          // For images, use SVG image element (works everywhere)
          g.append("image")
            .attr("x", -nodeWidth / 2)
            .attr("y", -currentNodeHeight / 2)
            .attr("width", nodeWidth)
            .attr("height", currentNodeHeight)
            .attr("href", node.mediaUrl)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .attr("clip-path", `url(#${clipId})`);
        }
        
        // Gradient overlay for text readability (bottom gradient)
        const gradientId = `grad-${node.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        const gradient = defs.append("linearGradient")
          .attr("id", gradientId)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", "transparent");
        gradient.append("stop")
          .attr("offset", "50%")
          .attr("stop-color", "transparent");
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", isDark ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.7)");
        
        g.append("rect")
          .attr("x", -nodeWidth / 2)
          .attr("y", -currentNodeHeight / 2)
          .attr("width", nodeWidth)
          .attr("height", currentNodeHeight)
          .attr("rx", 10)
          .attr("fill", `url(#${gradientId})`)
          .attr("clip-path", `url(#${clipId})`);
      }

      // Truncate title if too long
      let displayTitle = node.title;
      const maxTitleLen = showPreview ? 20 : 22;
      if (displayTitle.length > maxTitleLen) {
        displayTitle = displayTitle.slice(0, maxTitleLen - 2) + "...";
      }

      // Title position depends on whether we have a preview
      const titleY = showPreview ? currentNodeHeight / 2 - 14 : 0;
      
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", titleY)
        .attr("dy", "0.35em")
        .attr("fill", showPreview ? "#ffffff" : (isCurrent ? colors.primaryFg : colors.cardFg))
        .attr("font-size", "11px")
        .attr("font-weight", isCurrent ? "700" : "500")
        .text(displayTitle);

      // Add media indicator icon if node requires media upload
      if (node.requiresMediaUpload && node.requiredMediaType) {
        const badgeX = nodeWidth / 2 - 8;
        const badgeY = -currentNodeHeight / 2 - 4;
        
        // Badge background circle
        g.append("circle")
          .attr("cx", badgeX)
          .attr("cy", badgeY)
          .attr("r", 9)
          .attr("fill", "#f59e0b")
          .attr("stroke", colors.card)
          .attr("stroke-width", 2);

        // Icon path based on media type
        const iconPath = node.requiredMediaType === "IMAGE" ? ICON_PATHS.image 
          : node.requiredMediaType === "VIDEO" ? ICON_PATHS.video 
          : ICON_PATHS.fileText;
        g.append("path")
          .attr("d", iconPath)
          .attr("transform", `translate(${badgeX - 5}, ${badgeY - 5}) scale(0.42)`)
          .attr("fill", "#fff");
      }
      
      // Add output type badge in bottom-right corner
      if (!showPreview) {
        const typeBadgeX = nodeWidth / 2 - 14;
        const typeBadgeY = currentNodeHeight / 2 - 10;
        const typeColors: Record<string, string> = {
          TEXT: "#3b82f6",
          IMAGE: "#8b5cf6",
          VIDEO: "#ec4899",
          AUDIO: "#f97316",
          STRUCTURED: "#10b981",
          SKILL: "#6366f1",
        };
        const typeColor = typeColors[node.type] || colors.mutedFg;
        const typeIcon = node.type === "IMAGE" ? ICON_PATHS.image
          : node.type === "VIDEO" ? ICON_PATHS.video
          : node.type === "AUDIO" ? ICON_PATHS.audio
          : node.type === "STRUCTURED" ? ICON_PATHS.structured
          : node.type === "SKILL" ? ICON_PATHS.skill
          : ICON_PATHS.text;
        
        g.append("path")
          .attr("d", typeIcon)
          .attr("transform", `translate(${typeBadgeX - 5}, ${typeBadgeY - 5}) scale(0.42)`)
          .attr("fill", typeColor)
          .attr("opacity", 0.7);
      }
    });

    // Draw output type nodes for leaf nodes
    const outputNodeWidth = 100;
    outputNodes.forEach(outNode => {
      const pos = outputPositions[outNode.id];
      const sourcePos = positions[outNode.sourceId];
      if (!pos || !sourcePos) return;

      // Draw edge from leaf node to output node
      const sourceHeight = getNodeHeight(outNode.sourceId);
      const sourceY = sourcePos.y + sourceHeight / 2;
      const targetY = pos.y - ioNodeHeight / 2;
      const midY = (sourceY + targetY) / 2;

      edgeGroup.append("path")
        .attr("d", `M ${sourcePos.x} ${sourceY} C ${sourcePos.x} ${midY}, ${pos.x} ${midY}, ${pos.x} ${targetY}`)
        .attr("fill", "none")
        .attr("stroke", `${colors.mutedFg}40`)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("marker-end", "url(#flow-arrow)");

      // Draw output node
      const g = nodeGroup.append("g")
        .attr("transform", `translate(${pos.x}, ${pos.y})`);

      // Output type colors
      const outputColors: Record<string, { bg: string; fg: string }> = {
        TEXT: { bg: isDark ? "#3b82f620" : "#3b82f615", fg: "#3b82f6" },
        IMAGE: { bg: isDark ? "#8b5cf620" : "#8b5cf615", fg: "#8b5cf6" },
        VIDEO: { bg: isDark ? "#ec489920" : "#ec489915", fg: "#ec4899" },
        AUDIO: { bg: isDark ? "#f9731620" : "#f9731615", fg: "#f97316" },
        STRUCTURED: { bg: isDark ? "#10b98120" : "#10b98115", fg: "#10b981" },
        SKILL: { bg: isDark ? "#6366f120" : "#6366f115", fg: "#6366f1" },
      };
      const typeColor = outputColors[outNode.type] || { bg: colors.muted, fg: colors.mutedFg };

      g.append("rect")
        .attr("x", -outputNodeWidth / 2)
        .attr("y", -ioNodeHeight / 2)
        .attr("width", outputNodeWidth)
        .attr("height", ioNodeHeight)
        .attr("rx", 16)
        .attr("fill", typeColor.bg)
        .attr("stroke", typeColor.fg)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,2");

      // Output icon path
      const iconPath = outNode.type === "IMAGE" ? ICON_PATHS.image 
        : outNode.type === "VIDEO" ? ICON_PATHS.video
        : outNode.type === "AUDIO" ? ICON_PATHS.audio
        : outNode.type === "STRUCTURED" ? ICON_PATHS.structured
        : outNode.type === "SKILL" ? ICON_PATHS.skill
        : ICON_PATHS.text;
      
      // Output label from translations
      const outputLabel = outNode.type === "IMAGE" ? translations.outputImage
        : outNode.type === "VIDEO" ? translations.outputVideo
        : outNode.type === "AUDIO" ? translations.outputAudio
        : outNode.type === "STRUCTURED" ? translations.outputStructured
        : outNode.type === "SKILL" ? translations.outputSkill
        : translations.outputText;

      // Draw icon
      g.append("path")
        .attr("d", iconPath)
        .attr("transform", `translate(${-outputNodeWidth / 2 + 14}, -6) scale(0.5)`)
        .attr("fill", typeColor.fg);
      
      // Draw label
      g.append("text")
        .attr("x", 6)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", typeColor.fg)
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .text(outputLabel);
    });

    // Draw input type nodes for root nodes that require media
    inputNodes.forEach(inNode => {
      const pos = inputPositions[inNode.id];
      const targetPos = positions[inNode.targetId];
      if (!pos || !targetPos) return;

      // Draw edge from input node to target node
      const sourceY = pos.y + ioNodeHeight / 2;
      const targetHeight = getNodeHeight(inNode.targetId);
      const targetY = targetPos.y - targetHeight / 2;
      const midY = (sourceY + targetY) / 2;

      edgeGroup.append("path")
        .attr("d", `M ${pos.x} ${sourceY} C ${pos.x} ${midY}, ${targetPos.x} ${midY}, ${targetPos.x} ${targetY}`)
        .attr("fill", "none")
        .attr("stroke", `${colors.mutedFg}40`)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4,4")
        .attr("marker-end", "url(#flow-arrow)");

      // Draw input node
      const g = nodeGroup.append("g")
        .attr("transform", `translate(${pos.x}, ${pos.y})`);

      // Input type colors (amber theme for inputs)
      const inputColor = { bg: isDark ? "#f59e0b20" : "#f59e0b15", fg: "#f59e0b" };

      g.append("rect")
        .attr("x", -inputNodeWidth / 2)
        .attr("y", -ioNodeHeight / 2)
        .attr("width", inputNodeWidth)
        .attr("height", ioNodeHeight)
        .attr("rx", 16)
        .attr("fill", inputColor.bg)
        .attr("stroke", inputColor.fg)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,2");

      // Input icon path
      const iconPath = inNode.mediaType === "IMAGE" ? ICON_PATHS.image 
        : inNode.mediaType === "VIDEO" ? ICON_PATHS.video
        : ICON_PATHS.fileText;
      
      // Input label from translations
      let inputLabel: string;
      if (inNode.count === 1) {
        inputLabel = inNode.mediaType === "IMAGE" ? translations.inputImage
          : inNode.mediaType === "VIDEO" ? translations.inputVideo
          : translations.inputDocument;
      } else {
        inputLabel = inNode.mediaType === "IMAGE" ? translations.inputImages.replace("{count}", String(inNode.count))
          : inNode.mediaType === "VIDEO" ? translations.inputVideos.replace("{count}", String(inNode.count))
          : translations.inputDocuments.replace("{count}", String(inNode.count));
      }

      // Draw icon
      g.append("path")
        .attr("d", iconPath)
        .attr("transform", `translate(${-inputNodeWidth / 2 + 14}, -6) scale(0.5)`)
        .attr("fill", inputColor.fg);
      
      // Draw label
      g.append("text")
        .attr("x", 6)
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", inputColor.fg)
        .attr("font-size", "10px")
        .attr("font-weight", "500")
        .text(inputLabel);
    });

  }, [nodes, edges, currentPromptId, onNodeClick, handleNodeEnter, handleNodeLeave, translations]);

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
                {hoveredNode.requiresMediaUpload && hoveredNode.requiredMediaType && hoveredNode.requiredMediaCount && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                    {hoveredNode.requiredMediaType === "IMAGE" && <ImageIcon className="h-3 w-3" />}
                    {hoveredNode.requiredMediaType === "VIDEO" && <Video className="h-3 w-3" />}
                    {hoveredNode.requiredMediaType === "DOCUMENT" && <FileText className="h-3 w-3" />}
                    <span className="text-[10px] font-medium">
                      {hoveredNode.requiredMediaCount === 1 
                        ? (hoveredNode.requiredMediaType === "IMAGE" ? translations.inputImage
                          : hoveredNode.requiredMediaType === "VIDEO" ? translations.inputVideo
                          : translations.inputDocument)
                        : (hoveredNode.requiredMediaType === "IMAGE" 
                          ? translations.inputImages.replace("{count}", String(hoveredNode.requiredMediaCount))
                          : hoveredNode.requiredMediaType === "VIDEO"
                          ? translations.inputVideos.replace("{count}", String(hoveredNode.requiredMediaCount))
                          : translations.inputDocuments.replace("{count}", String(hoveredNode.requiredMediaCount)))}
                    </span>
                  </div>
                )}
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
  workflowLink,
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

  // Only show loader for sectionOnly mode, not buttonOnly
  if (isLoading) {
    if (buttonOnly) return null;
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
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
      <div className="w-full mt-4 space-y-3">
        {/* Header row - above the container */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">{t("title")}</h3>
            </div>
            <div className="flex gap-2">
            {canEdit && (
              <>
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
              </>
            )}
            {hasConnections && workflowLink && (() => {
              // Extract domain from URL without www
              let domain = "";
              try {
                const url = new URL(workflowLink);
                domain = url.hostname.replace(/^www\./, "");
              } catch {
                domain = "";
              }
              return (
                <Button
                  size="sm"
                  className="bg-emerald-700/80 hover:bg-emerald-700 text-white gap-1.5"
                  onClick={() => window.open(workflowLink, '_blank', 'noopener,noreferrer')}
                >
                  <FastForward className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t("testWorkflow")}</span>
                  {domain && (
                    <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-medium">
                      {domain}
                    </span>
                  )}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              );
            })()}
            </div>
          </div>
        </div>

        {/* Content container */}
        <div className="rounded-lg border bg-card p-4">
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
              translations={{
                outputText: t("outputText"),
                outputImage: t("outputImage"),
                outputVideo: t("outputVideo"),
                outputAudio: t("outputAudio"),
                outputStructured: t("outputStructured"),
                outputSkill: t("outputSkill"),
                inputImage: t("inputImage"),
                inputVideo: t("inputVideo"),
                inputDocument: t("inputDocument"),
                inputImages: t("inputImages", { count: "{count}" }),
                inputVideos: t("inputVideos", { count: "{count}" }),
                inputDocuments: t("inputDocuments", { count: "{count}" }),
              }}
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
        </div>

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
                translations={{
                  outputText: t("outputText"),
                  outputImage: t("outputImage"),
                  outputVideo: t("outputVideo"),
                  outputAudio: t("outputAudio"),
                  outputStructured: t("outputStructured"),
                  outputSkill: t("outputSkill"),
                  inputImage: t("inputImage"),
                  inputVideo: t("inputVideo"),
                  inputDocument: t("inputDocument"),
                  inputImages: t("inputImages", { count: "{count}" }),
                  inputVideos: t("inputVideos", { count: "{count}" }),
                  inputDocuments: t("inputDocuments", { count: "{count}" }),
                }}
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
