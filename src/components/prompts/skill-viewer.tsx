"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Editor from "@monaco-editor/react";
import {
  File,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Copy,
  Check,
  Download,
  Package,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  parseSkillFiles,
  getLanguageFromFilename,
  DEFAULT_SKILL_FILE,
  type SkillFile,
} from "@/lib/skill-files";

interface SkillViewerProps {
  content: string;
  className?: string;
  promptId?: string;
  promptSlug?: string;
}

// Tree node type for folder structure
interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

// Build a tree structure from flat file paths
function buildFileTree(files: SkillFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.filename.split("/");
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLastPart = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      let existing = currentLevel.find((n) => n.name === part);

      if (!existing) {
        existing = {
          name: part,
          path: currentPath,
          isFolder: !isLastPart,
          children: [],
        };
        currentLevel.push(existing);
      }

      if (!isLastPart) {
        currentLevel = existing.children;
      }
    }
  }

  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .map((n) => ({ ...n, children: sortNodes(n.children) }))
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
  };

  return sortNodes(root);
}

// Recursive tree node component
interface TreeNodeItemProps {
  node: TreeNode;
  depth: number;
  activeFile: string;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onOpenFile: (path: string) => void;
}

function TreeNodeItem({
  node,
  depth,
  activeFile,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
}: TreeNodeItemProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeFile === node.path;
  const paddingLeft = depth * 12;

  if (node.isFolder) {
    return (
      <div>
        <div
          className={cn(
            "group flex items-center gap-1 py-1 rounded-md cursor-pointer text-sm transition-colors hover:bg-muted"
          )}
          style={{ paddingLeft: `${paddingLeft + 4}px` }}
          onClick={() => onToggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className="flex-1 truncate font-mono text-xs">{node.name}</span>
        </div>
        {isExpanded && (
          <div>
            {node.children.map((child) => (
              <TreeNodeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onOpenFile={onOpenFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  return (
    <div
      className={cn(
        "group flex items-center gap-1 py-1 rounded-md cursor-pointer text-sm transition-colors",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
      )}
      style={{ paddingLeft: `${paddingLeft + 4}px` }}
      onClick={() => onOpenFile(node.path)}
    >
      <span className="w-3 shrink-0" />
      <File className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate font-mono text-xs">{node.name}</span>
    </div>
  );
}

export function SkillViewer({ content, className, promptId, promptSlug }: SkillViewerProps) {
  const t = useTranslations("prompts");
  const { resolvedTheme } = useTheme();

  // Parse files from the serialized content
  const files = useMemo(() => parseSkillFiles(content), [content]);
  const [activeFile, setActiveFile] = useState<string>(DEFAULT_SKILL_FILE);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Build tree structure from files
  const fileTree = useMemo(() => buildFileTree(files), [files]);

  // Get the active file's content and language
  const activeFileData = useMemo(
    () => files.find((f) => f.filename === activeFile),
    [files, activeFile]
  );
  const activeLanguage = useMemo(
    () => getLanguageFromFilename(activeFile),
    [activeFile]
  );

  // Handle file opening (close sidebar on mobile)
  const handleOpenFile = useCallback((path: string) => {
    setActiveFile(path);
    setSidebarOpen(false);
  }, []);

  // Handle Escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [sidebarOpen]);

  // Toggle folder expansion
  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  }, []);

  // Copy current file content
  const handleCopy = useCallback(async () => {
    if (activeFileData) {
      await navigator.clipboard.writeText(activeFileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeFileData]);

  // Download current file
  const handleDownload = useCallback(() => {
    if (activeFileData) {
      const blob = new Blob([activeFileData.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = activeFile.split("/").pop() || activeFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [activeFileData, activeFile]);

  // Download entire skill as .skill zip
  const handleDownloadSkill = useCallback(async () => {
    if (!promptId) return;
    const base = promptSlug ? `${promptId}_${promptSlug}` : promptId;
    const url = `/api/prompts/${base}/skill`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch");
      const blob = await response.blob();
      
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      // Use slug for filename, fallback to promptId
      a.download = `${promptSlug || promptId}.skill`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(t("downloadStarted"));
    } catch {
      toast.error(t("downloadFailed"));
    }
  }, [promptId, promptSlug, t]);

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row border rounded-lg overflow-hidden bg-background relative",
        className
      )}
      style={{ height: "500px" }}
    >
      {/* Sidebar - File Tree */}
      <div 
        className={cn(
          "w-full md:w-56 border-r bg-background flex flex-col shrink-0 md:relative",
          // Mobile: absolute positioning with slide-in animation and full height
          "absolute md:static z-40 transition-transform duration-300 ease-in-out",
          "h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-hidden={!sidebarOpen ? "true" : "false"}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-2 px-3 h-10 border-b bg-muted">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t("skillFiles")}</span>
          {/* Close button for mobile */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-auto md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-2">
          {fileTree.map((node) => (
            <TreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onOpenFile={handleOpenFile}
            />
          ))}
        </div>

        {/* Sidebar Footer - File Count */}
        <div className="px-3 py-2 border-t bg-muted text-xs text-muted-foreground flex items-center justify-between">
          <span>{files.length} {files.length === 1 ? t("file") : t("files")}</span>
          {promptId && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs gap-1"
              onClick={handleDownloadSkill}
            >
              <Package className="h-3 w-3" />
              {t("downloadSkill")}
            </Button>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab/File Header */}
        <div className="flex items-center justify-between border-b bg-muted px-3 h-10">
          <div className="flex items-center gap-2 min-w-0">
            {/* Menu button for mobile */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 md:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono truncate">{activeFile}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopy}
              title={t("copy")}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleDownload}
              title={t("download")}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Monaco Editor (read-only) */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={activeLanguage}
            value={activeFileData?.content || ""}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              wrappingIndent: "indent",
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 8, bottom: 8 },
              renderLineHighlight: "none",
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              domReadOnly: true,
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
