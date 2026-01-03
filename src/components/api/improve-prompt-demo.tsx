"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const OUTPUT_TYPES = [
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "sound", label: "Sound" },
] as const;

const OUTPUT_FORMATS = [
  { value: "text", label: "Text" },
  { value: "structured_json", label: "JSON" },
  { value: "structured_yaml", label: "YAML" },
] as const;

type OutputType = (typeof OUTPUT_TYPES)[number]["value"];
type OutputFormat = (typeof OUTPUT_FORMATS)[number]["value"];

interface ImproveResponse {
  original: string;
  improved: string;
  outputType: OutputType;
  outputFormat: OutputFormat;
  inspirations: Array<{ title: string; similarity: number }>;
  model: string;
}

export function ImprovePromptDemo() {
  const [prompt, setPrompt] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("text");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImproveResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to improve");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), outputType, outputFormat }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to improve prompt");
      }

      setResult(data);
      toast.success("Prompt improved successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to improve prompt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.improved) {
      await navigator.clipboard.writeText(result.improved);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Your Prompt</label>
            <Textarea
              placeholder="Enter a prompt to improve... e.g., 'write a blog post about AI'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium">Output Type</label>
            <Select value={outputType} onValueChange={(v) => setOutputType(v as OutputType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Output Format</label>
            <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OUTPUT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleImprove}
            disabled={isLoading || !prompt.trim()}
            className="gap-2 sm:mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Improving...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Improve Prompt
              </>
            )}
          </Button>
        </div>
      </div>

      {result && (
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Improved Prompt</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Model: {result.model}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-background p-4">
            <pre className="whitespace-pre-wrap text-sm">{result.improved}</pre>
          </div>

          {result.inspirations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Inspired by similar prompts:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.inspirations.map((ins, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs"
                  >
                    {ins.title}
                    <span className="text-muted-foreground">
                      ({ins.similarity}%)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
        <p className="text-muted-foreground mb-2"># API Request</p>
        <pre>{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/improve-prompt \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${prompt.slice(0, 50).replace(/"/g, '\\"')}${prompt.length > 50 ? "..." : ""}",
    "outputType": "${outputType}",
    "outputFormat": "${outputFormat}"
  }'`}</pre>
      </div>
    </div>
  );
}
