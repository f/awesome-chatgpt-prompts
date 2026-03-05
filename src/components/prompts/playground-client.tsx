"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Play, Copy, Check, Code, Terminal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface PlaygroundClientProps {
  promptId: string;
  promptTitle: string;
  promptDescription: string | null;
  promptContent: string;
  promptType: string;
  isExecutable: boolean;
  variables: { name: string; defaultValue: string }[];
  userApiKey: string | null;
  baseUrl: string;
  isLoggedIn: boolean;
}

export function PlaygroundClient({
  promptId,
  promptTitle,
  promptContent,
  promptType,
  isExecutable,
  variables,
  userApiKey,
  baseUrl,
  isLoggedIn,
}: PlaygroundClientProps) {
  const t = useTranslations("playground");
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of variables) {
      initial[v.name] = v.defaultValue;
    }
    return initial;
  });
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const endpoint = `${baseUrl}/api/run/${promptId}`;

  const handleCopy = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success(t("copied"));
  }, [t]);

  const handleRun = useCallback(async () => {
    if (!userApiKey) {
      setError(t("apiKeyRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`/api/run/${promptId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userApiKey}`,
        },
        body: JSON.stringify({
          variables: Object.fromEntries(
            Object.entries(values).filter(([, v]) => v.trim() !== "")
          ),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || t("runError"));
        return;
      }

      setResponse(data.result);
    } catch {
      setError(t("runError"));
    } finally {
      setLoading(false);
    }
  }, [promptId, userApiKey, values, t]);

  const buildCurl = () => {
    const varsJson = JSON.stringify(
      { variables: Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== "")) },
      null,
      2
    );
    return `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${userApiKey || "pchat_YOUR_API_KEY"}" \\
  -d '${varsJson}'`;
  };

  const buildPython = () => {
    const varsObj = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== ""));
    return `import requests

response = requests.post(
    "${endpoint}",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer ${userApiKey || "pchat_YOUR_API_KEY"}",
    },
    json={"variables": ${JSON.stringify(varsObj, null, 4)}},
)

data = response.json()
print(data["result"])`;
  };

  const buildJavascript = () => {
    const varsObj = Object.fromEntries(Object.entries(values).filter(([, v]) => v.trim() !== ""));
    return `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${userApiKey || "pchat_YOUR_API_KEY"}",
  },
  body: JSON.stringify({
    variables: ${JSON.stringify(varsObj, null, 4)},
  }),
});

const data = await response.json();
console.log(data.result);`;
  };

  return (
    <div className="container max-w-3xl py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
          <Link href={`/prompts/${promptId}`}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {promptTitle}
          </Link>
        </Button>

        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <Badge variant="secondary">{promptType}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {!isExecutable && (
        <div className="mb-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              {t("unsupportedType")}
            </p>
          </div>
        </div>
      )}

      {/* Endpoint */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("endpoint")}</Label>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="outline" className="font-mono text-xs shrink-0">POST</Badge>
          <code className="flex-1 text-sm font-mono bg-muted/50 px-3 py-2 rounded-md border truncate">
            {endpoint}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => handleCopy(endpoint, "endpoint")}
          >
            {copiedField === "endpoint" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Variables */}
      {variables.length > 0 && (
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("variables")}</Label>
          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            {variables.map((v) => (
              <div key={v.name} className="space-y-1">
                <Label htmlFor={`var-${v.name}`} className="text-sm font-medium">
                  {v.name}
                  {!v.defaultValue && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={`var-${v.name}`}
                  value={values[v.name] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [v.name]: e.target.value }))}
                  placeholder={v.defaultValue || v.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run Button */}
      {isExecutable && (
        <div className="mb-6">
          {!isLoggedIn && (
            <p className="text-xs text-muted-foreground mb-2">{t("loginRequired")}</p>
          )}
          {isLoggedIn && !userApiKey && (
            <p className="text-xs text-muted-foreground mb-2">{t("apiKeyRequired")}</p>
          )}
          <Button
            onClick={handleRun}
            disabled={loading || !isLoggedIn || !userApiKey}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="h-4 w-4 mr-1.5" />
            {loading ? t("running") : t("run")}
          </Button>
        </div>
      )}

      {/* Response */}
      {error && (
        <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {response && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">{t("response")}</Label>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(response, "response")}>
              {copiedField === "response" ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {t("copy")}
            </Button>
          </div>
          <div className="bg-muted/50 border rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-auto">
            {response}
          </div>
        </div>
      )}

      {/* Code Snippets */}
      <div className="mb-6">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">{t("codeSnippets")}</Label>
        <Tabs defaultValue="curl">
          <TabsList>
            <TabsTrigger value="curl" className="gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              cURL
            </TabsTrigger>
            <TabsTrigger value="python" className="gap-1.5">
              <Code className="h-3.5 w-3.5" />
              Python
            </TabsTrigger>
            <TabsTrigger value="javascript" className="gap-1.5">
              <Code className="h-3.5 w-3.5" />
              JavaScript
            </TabsTrigger>
          </TabsList>

          <TabsContent value="curl" className="mt-2">
            <div className="relative">
              <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto">
                {buildCurl()}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleCopy(buildCurl(), "curl")}
              >
                {copiedField === "curl" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="python" className="mt-2">
            <div className="relative">
              <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto">
                {buildPython()}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleCopy(buildPython(), "python")}
              >
                {copiedField === "python" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="javascript" className="mt-2">
            <div className="relative">
              <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto">
                {buildJavascript()}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={() => handleCopy(buildJavascript(), "javascript")}
              >
                {copiedField === "javascript" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
