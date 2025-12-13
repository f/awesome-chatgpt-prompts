"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Variable, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VariableToolbarProps {
  onInsert: (variable: string) => void;
  getSelectedText?: () => string;
}

export function VariableToolbar({ onInsert, getSelectedText }: VariableToolbarProps) {
  const t = useTranslations("prompts");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [defaultValue, setDefaultValue] = useState("");

  // Pre-fill name with selected text when popover opens
  useEffect(() => {
    if (open && getSelectedText) {
      const selected = getSelectedText();
      if (selected) {
        // Sanitize: lowercase, replace spaces with underscores, remove invalid chars
        const sanitized = selected.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        if (sanitized) {
          setName(sanitized);
        }
      }
    }
  }, [open, getSelectedText]);

  const handleInsert = () => {
    if (!name.trim()) return;
    
    const variable = defaultValue.trim()
      ? `\${${name.trim()}:${defaultValue.trim()}}`
      : `\${${name.trim()}}`;
    
    onInsert(variable);
    setName("");
    setDefaultValue("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      e.preventDefault();
      handleInsert();
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 border-b bg-muted/30">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
            <Variable className="h-3.5 w-3.5" />
            {t("insertVariable")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="var-name" className="text-xs">{t("variableName")}</Label>
              <Input
                id="var-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="topic"
                className="h-8 text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="var-default" className="text-xs">{t("variableDefault")}</Label>
              <Input
                id="var-default"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("variableDefaultPlaceholder")}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {name ? (defaultValue ? `\${${name}:${defaultValue}}` : `\${${name}}`) : "${variable}"}
              </code>
              <Button size="sm" onClick={handleInsert} disabled={!name.trim()} className="h-7">
                <Plus className="h-3.5 w-3.5 mr-1" />
                {t("insert")}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <span className="text-xs text-muted-foreground ml-1">
        {t("variableHint")}
      </span>
    </div>
  );
}
