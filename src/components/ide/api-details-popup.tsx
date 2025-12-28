"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ApiItem } from "@/data/api-docs";
import { METHOD_OPTIONS } from "@/data/method-options";

interface ApiDetailsPopupProps {
  item: ApiItem;
  onClose: () => void;
}

export function ApiDetailsPopup({ item, onClose }: ApiDetailsPopupProps) {
  const getTypeColor = (type: ApiItem["type"]) => {
    switch (type) {
      case "function": return "text-blue-500 dark:text-blue-400";
      case "method": return "text-blue-500 dark:text-blue-400";
      case "class": return "text-yellow-500 dark:text-yellow-400";
      case "interface": return "text-green-500 dark:text-green-400";
      case "type": return "text-purple-500 dark:text-purple-400";
      case "const": return "text-orange-500 dark:text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  // Get method name from item name (strip leading dot and parentheses)
  const methodName = item.name.replace(/^\./, '').replace(/\(\)$/, '');
  const availableOptions = METHOD_OPTIONS[methodName];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      {/* Popup */}
      <div className="fixed left-72 top-1/4 z-50 w-96 max-h-[60vh] overflow-auto bg-popover border rounded-lg shadow-xl">
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-xs font-mono px-1.5 py-0.5 rounded bg-muted", getTypeColor(item.type))}>{item.type}</span>
                <code className="text-sm font-semibold break-all">{item.name}</code>
              </div>
              {item.signature && (
                <code className="text-xs text-muted-foreground block mt-2 p-2 bg-muted rounded font-mono break-all">{item.signature}</code>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
          )}
          {item.params && item.params.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-2 text-foreground">Parameters</p>
              <div className="space-y-1.5 pl-2 border-l-2 border-muted">
                {item.params.map((p) => (
                  <div key={p.name} className="text-xs">
                    <code className="text-blue-500 font-medium">{p.name}</code>
                    <span className="text-purple-500">: {p.type}</span>
                    {p.description && <span className="text-muted-foreground block pl-2 mt-0.5">{p.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {availableOptions && availableOptions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-2 text-foreground">Available Values</p>
              <div className="flex flex-wrap gap-1">
                {availableOptions.slice(0, 20).map((opt) => (
                  <code key={opt} className="text-xs bg-muted px-1.5 py-0.5 rounded text-green-600 dark:text-green-400">
                    &quot;{opt}&quot;
                  </code>
                ))}
                {availableOptions.length > 20 && (
                  <span className="text-xs text-muted-foreground">+{availableOptions.length - 20} more</span>
                )}
              </div>
            </div>
          )}
          {item.returns && (
            <div className="mb-3">
              <p className="text-xs font-semibold mb-1 text-foreground">Returns</p>
              <code className="text-xs text-green-500 bg-muted px-1.5 py-0.5 rounded">{item.returns}</code>
            </div>
          )}
          {item.example && (
            <div className="mt-3">
              <p className="text-xs font-semibold mb-2 text-foreground">Example</p>
              <pre className="text-xs bg-muted p-3 rounded font-mono overflow-x-auto">{item.example}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
