"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronDown, Play, ExternalLink, Sparkles, Loader2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SQL_EXAMPLES from "@/data/sql-examples.json";

const DEFAULT_SQL = SQL_EXAMPLES[0].sql;

const HF_DATASET_URL = "https://huggingface.co/datasets/fka/awesome-chatgpt-prompts/viewer";

interface HFDataStudioDropdownProps {
  aiGenerationEnabled?: boolean;
}

export function HFDataStudioDropdown({ aiGenerationEnabled = false }: HFDataStudioDropdownProps) {
  const t = useTranslations("prompts.hfDataStudio");
  const { resolvedTheme } = useTheme();
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOpenDataset = () => {
    window.open(HF_DATASET_URL, "_blank");
  };

  const handleRun = () => {
    const encodedSql = encodeURIComponent(sql);
    const url = `${HF_DATASET_URL}?views[]=train&sql=${encodedSql}`;
    window.open(url, "_blank");
  };

  const handleGenerateSQL = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      
      if (!response.ok) throw new Error("Failed to generate SQL");
      
      const data = await response.json();
      setSql(data.sql);
    } catch (error) {
      console.error("SQL generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex w-full sm:w-auto">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 text-xs rounded-r-none border-r-0 flex-1 sm:flex-initial"
        onClick={handleOpenDataset}
      >
        🤗 {t("button")}
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-8 px-2 rounded-l-none"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[500px] p-0 max-sm:!fixed max-sm:!left-4 max-sm:!right-4 max-sm:!top-auto" sideOffset={8}>
          <Tabs defaultValue={aiGenerationEnabled ? "ai" : "examples"} className="w-full">
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <TabsList className="h-7">
                {aiGenerationEnabled && (
                  <TabsTrigger value="ai" className="text-xs h-6 px-2">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t("aiGenerate")}
                  </TabsTrigger>
                )}
                <TabsTrigger value="examples" className="text-xs h-6 px-2">
                  {t("examples")}
                </TabsTrigger>
              </TabsList>
              <a
                href={HF_DATASET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {t("openDataset")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            {aiGenerationEnabled && (
              <TabsContent value="ai" className="px-3 pb-3 mt-0 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("aiPlaceholder")}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateSQL()}
                    className="h-8 text-xs flex-1"
                  />
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="h-8 px-3"
                    onClick={handleGenerateSQL}
                    disabled={isGenerating || !aiPrompt.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="examples" className="px-3 pb-3 mt-0">
              <Select onValueChange={(value) => setSql(value)}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder={t("selectExample")} />
                </SelectTrigger>
                <SelectContent>
                  {SQL_EXAMPLES.map((example, index) => (
                    <SelectItem key={index} value={example.sql} className="text-xs">
                      {example.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TabsContent>

            <div className="px-3 pb-3 space-y-3">
              <div className="border rounded-md overflow-hidden">
                <Editor
                  height="200px"
                  defaultLanguage="sql"
                  value={sql}
                  onChange={(value) => setSql(value || "")}
                  theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: "on",
                  }}
                />
              </div>
              <Button size="sm" className="w-full" onClick={handleRun}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {t("runQuery")}
              </Button>
            </div>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
