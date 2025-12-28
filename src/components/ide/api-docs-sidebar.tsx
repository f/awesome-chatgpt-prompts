"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Book, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { API_DOCS, type ApiItem } from "@/data/api-docs";

interface ApiDocsSidebarProps {
  selectedItem: ApiItem | null;
  onSelectItem: (item: ApiItem | null) => void;
}

export function ApiDocsSidebar({ selectedItem, onSelectItem }: ApiDocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["Builder", "PromptBuilder Methods"]));
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (name: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const getTypeColor = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "text-blue-500 dark:text-blue-400";
      case "class": return "text-yellow-500 dark:text-yellow-400";
      case "interface": return "text-green-500 dark:text-green-400";
      case "type": return "text-purple-500 dark:text-purple-400";
      case "const": return "text-orange-500 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  const getTypeLabel = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "fn";
      case "class": return "class";
      case "interface": return "interface";
      case "type": return "type";
      case "const": return "const";
      default: return type;
    }
  };

  // Filter sections and items based on search query
  const filteredDocs = searchQuery.trim()
    ? API_DOCS.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.signature?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : API_DOCS;

  // When searching, expand all sections with matches
  const effectiveExpandedSections = searchQuery.trim()
    ? new Set(filteredDocs.map(s => s.name))
    : expandedSections;

  return (
    <div className="w-64 border-r flex flex-col bg-muted/20 overflow-hidden">
      <div className="px-2 py-2 border-b bg-muted/30 shrink-0 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Book className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">API Docs</span>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-sm"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 h-0">
        <div className="p-2">
          {filteredDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
          ) : (
            filteredDocs.map((section) => (
              <div key={section.name} className="mb-1">
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                >
                  {effectiveExpandedSections.has(section.name) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {section.name}
                  {searchQuery && (
                    <span className="ml-auto text-xs text-muted-foreground">{section.items.length}</span>
                  )}
                </button>
                {effectiveExpandedSections.has(section.name) && (
                  <div className="ml-3 border-l pl-2 space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => onSelectItem(selectedItem?.name === item.name ? null : item)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 text-sm rounded transition-colors group",
                          selectedItem?.name === item.name ? "bg-accent" : "hover:bg-accent/50"
                        )}
                        title={item.signature || item.description}
                      >
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono text-xs", getTypeColor(item.type))}>
                            {getTypeLabel(item.type)}
                          </span>
                          <span className="font-mono truncate">{item.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
