"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronDown, Play, ExternalLink } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
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

export function HFDataStudioDropdown() {
  const t = useTranslations("prompts.hfDataStudio");
  const { resolvedTheme } = useTheme();
  const [sql, setSql] = useState(DEFAULT_SQL);

  const handleOpenDataset = () => {
    window.open(HF_DATASET_URL, "_blank");
  };

  const handleRun = () => {
    const encodedSql = encodeURIComponent(sql);
    const url = `${HF_DATASET_URL}?views[]=train&sql=${encodedSql}`;
    window.open(url, "_blank");
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
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Select onValueChange={(value) => setSql(value)}>
                <SelectTrigger className="w-[200px] h-7 text-xs">
                  <SelectValue placeholder={t("examples")} />
                </SelectTrigger>
                <SelectContent>
                  {SQL_EXAMPLES.map((example, index) => (
                    <SelectItem key={index} value={example.sql} className="text-xs">
                      {example.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a
                href={HF_DATASET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {t("openDataset")} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
