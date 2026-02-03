"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { DiffEditor } from "@monaco-editor/react";
import {
  File,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Minus,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  parseSkillFiles,
  getLanguageFromFilename,
  DEFAULT_SKILL_FILE,
  type SkillFile,
} from "@/lib/skill-files";

interface SkillDiffViewerProps {
  original: string;
  modified: string;
  className?: string;
}

// Tree node type for folder structure
interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
  status?: "added" | "removed" | "modified" | "unchanged";
}

// Build a tree structure from flat file paths with diff status
function buildDiffFileTree(
  originalFiles: SkillFile[],
  modifiedFiles: SkillFile[]
): TreeNode[] {
  const originalMap = new Map(originalFiles.map((f) => [f.filename, f.content]));
  const modifiedMap = new Map(modifiedFiles.map((f) => [f.filename, f.content]));

  // Get all unique filenames
  const allFilenames = new Set([
    ...originalFiles.map((f) => f.filename),
    ...modifiedFiles.map((f) => f.filename),
  ]);

  const root: TreeNode[] = [];

  for (const filename of allFilenames) {
    const parts = filename.split("/");
    let currentLevel = root;

    // Determine file status
    let status: TreeNode["status"] = "unchanged";
    const origContent = originalMap.get(filename);
    const modContent = modifiedMap.get(filename);

    if (origContent === undefined) {
      status = "added";
    } else if (modContent === undefined) {
      status = "removed";
    } else if (origContent !== modContent) {
      status = "modified";
    }

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
          status: isLastPart ? status : undefined,
        };
        currentLevel.push(existing);
      } else if (isLastPart) {
        existing.status = status;
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

  const statusColors = {
    added: "text-green-600 dark:text-green-400",
    removed: "text-red-600 dark:text-red-400",
    modified: "text-amber-600 dark:text-amber-400",
    unchanged: "text-muted-foreground",
  };

  const StatusIcon = node.status === "added" 
    ? Plus 
    : node.status === "removed" 
    ? Minus 
    : node.status === "modified" 
    ? Edit2 
    : null;

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
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted",
        node.status && statusColors[node.status]
      )}
      style={{ paddingLeft: `${paddingLeft + 4}px` }}
      onClick={() => onOpenFile(node.path)}
    >
      <span className="w-3 shrink-0" />
      <File className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate font-mono text-xs">{node.name}</span>
      {StatusIcon && (
        <StatusIcon className="h-3 w-3 mr-1 shrink-0" />
      )}
    </div>
  );
}

export function SkillDiffViewer({ original, modified, className }: SkillDiffViewerProps) {
  const t = useTranslations("prompts");
  const { resolvedTheme } = useTheme();

  // Parse files from both versions
  const originalFiles = useMemo(() => parseSkillFiles(original), [original]);
  const modifiedFiles = useMemo(() => parseSkillFiles(modified), [modified]);

  const [activeFile, setActiveFile] = useState<string>(DEFAULT_SKILL_FILE);
  const [editorKey, setEditorKey] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Handle file change with editor remount
  const handleFileChange = useCallback((filename: string) => {
    if (filename !== activeFile) {
      setEditorKey((k) => k + 1); // Force new editor instance
      setActiveFile(filename);
    }
  }, [activeFile]);

  // Build tree structure with diff status
  const fileTree = useMemo(
    () => buildDiffFileTree(originalFiles, modifiedFiles),
    [originalFiles, modifiedFiles]
  );

  // Get original and modified content for active file
  const originalContent = useMemo(
    () => originalFiles.find((f) => f.filename === activeFile)?.content || "",
    [originalFiles, activeFile]
  );
  const modifiedContent = useMemo(
    () => modifiedFiles.find((f) => f.filename === activeFile)?.content || "",
    [modifiedFiles, activeFile]
  );

  const activeLanguage = useMemo(
    () => getLanguageFromFilename(activeFile),
    [activeFile]
  );

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

  // Count changes
  const changeCount = useMemo(() => {
    let added = 0, removed = 0, modified = 0;
    const origMap = new Map(originalFiles.map((f) => [f.filename, f.content]));
    const modMap = new Map(modifiedFiles.map((f) => [f.filename, f.content]));

    for (const f of modifiedFiles) {
      if (!origMap.has(f.filename)) added++;
      else if (origMap.get(f.filename) !== f.content) modified++;
    }
    for (const f of originalFiles) {
      if (!modMap.has(f.filename)) removed++;
    }
    return { added, removed, modified };
  }, [originalFiles, modifiedFiles]);

  return (
    <div
      className={cn(
        "flex border rounded-lg overflow-hidden bg-background",
        className
      )}
      style={{ height: "500px" }}
    >
      {/* Sidebar - File Tree */}
      <div className="w-56 border-r bg-muted/30 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/50">
          <FolderOpen className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t("skillFiles")}</span>
        </div>

        {/* Change Summary */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30 text-xs">
          {changeCount.added > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-500/10 text-[10px] px-1.5 py-0">
              +{changeCount.added}
            </Badge>
          )}
          {changeCount.removed > 0 && (
            <Badge variant="outline" className="text-red-600 border-red-600/30 bg-red-500/10 text-[10px] px-1.5 py-0">
              -{changeCount.removed}
            </Badge>
          )}
          {changeCount.modified > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-600/30 bg-amber-500/10 text-[10px] px-1.5 py-0">
              ~{changeCount.modified}
            </Badge>
          )}
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
              onOpenFile={handleFileChange}
            />
          ))}
        </div>
      </div>

      {/* Main Diff Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tab/File Header */}
        <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono truncate">{activeFile}</span>
          </div>
        </div>

        {/* Monaco Diff Editor */}
        <div className="flex-1 min-h-0">
          <DiffEditor
            key={`${editorKey}-${activeFile}`}
            height="100%"
            language={activeLanguage}
            original={originalContent}
            modified={modifiedContent}
            theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              renderSideBySide: true,
              originalEditable: false,
              renderOverviewRuler: false,
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
