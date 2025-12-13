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

const DEFAULT_SQL = `-- All Software related prompts
SELECT 
    act,
    prompt,
    type
FROM 
    train
WHERE 
    lower(prompt) LIKE '%software%'
LIMIT 100;`;

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
    <div className="flex">
      <Button 
        size="sm" 
        variant="outline" 
        className="h-8 text-xs rounded-r-none border-r-0"
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
        <PopoverContent align="end" className="w-[500px] p-0">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("sqlQuery")}</span>
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
