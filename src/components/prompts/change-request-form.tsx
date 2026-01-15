"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Edit3, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiffView } from "@/components/ui/diff-view";
import { CodeEditor } from "@/components/ui/code-editor";
import { VariableToolbar } from "@/components/prompts/variable-toolbar";
import { SkillEditor } from "@/components/prompts/skill-editor";
import { SkillDiffViewer } from "@/components/prompts/skill-diff-viewer";
import { toast } from "sonner";
import { analyticsPrompt } from "@/lib/analytics";

interface ChangeRequestFormProps {
  promptId: string;
  currentContent: string;
  currentTitle: string;
  promptType?: string;
  structuredFormat?: string | null;
}

export function ChangeRequestForm({ promptId, currentContent, currentTitle, promptType, structuredFormat }: ChangeRequestFormProps) {
  const isStructured = promptType === "STRUCTURED";
  const isSkill = promptType === "SKILL";
  const router = useRouter();
  const t = useTranslations("changeRequests");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [proposedContent, setProposedContent] = useState(currentContent);
  const [proposedTitle, setProposedTitle] = useState(currentTitle);
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertVariable = (variable: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = proposedContent.slice(0, start) + variable + proposedContent.slice(end);
      setProposedContent(newContent);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setProposedContent(proposedContent + variable);
    }
  };

  const hasContentChanges = proposedContent !== currentContent;
  const hasTitleChanges = proposedTitle !== currentTitle;
  const hasChanges = hasContentChanges || hasTitleChanges;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      toast.error(t("mustMakeChanges"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedContent,
          proposedTitle: hasTitleChanges ? proposedTitle : undefined,
          reason: reason || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create change request");
      }

      const result = await response.json();
      analyticsPrompt.changeRequest(promptId, "create");
      toast.success(t("created"));
      router.push(`/prompts/${promptId}/changes/${result.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title input */}
      <div className="space-y-2">
        <Label htmlFor="proposedTitle">{t("proposedTitle")}</Label>
        <Input
          id="proposedTitle"
          value={proposedTitle}
          onChange={(e) => setProposedTitle(e.target.value)}
          placeholder={currentTitle}
        />
        {hasTitleChanges && (
          <p className="text-xs text-muted-foreground">
            <span className="text-red-600 dark:text-red-400 line-through">{currentTitle}</span>
            {" → "}
            <span className="text-green-600 dark:text-green-400">{proposedTitle}</span>
          </p>
        )}
      </div>

      {/* Content with tabs */}
      <div className="space-y-2">
        <Label>{t("proposedContent")}</Label>
        <Tabs defaultValue="edit">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="edit" className="gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              {t("edit")}
            </TabsTrigger>
            <TabsTrigger value="diff" className="gap-1.5">
              <GitCompare className="h-3.5 w-3.5" />
              {t("preview")}
              {hasContentChanges && (
                <span className="ml-1 h-4 min-w-4 px-1 rounded-full bg-green-500 text-white text-[10px] flex items-center justify-center">✓</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-0">
            {isSkill ? (
              <SkillEditor
                value={proposedContent}
                onChange={setProposedContent}
              />
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <VariableToolbar onInsert={handleInsertVariable} />
                {isStructured ? (
                  <CodeEditor
                    value={proposedContent}
                    onChange={setProposedContent}
                    language={(structuredFormat?.toLowerCase() as "json" | "yaml") || "json"}
                    minHeight="300px"
                    className="border-0"
                  />
                ) : (
                  <Textarea
                    ref={textareaRef}
                    id="proposedContent"
                    value={proposedContent}
                    onChange={(e) => setProposedContent(e.target.value)}
                    placeholder={t("proposedContentPlaceholder")}
                    className="min-h-[300px] font-mono text-sm border-0 rounded-none focus-visible:ring-0"
                    required
                  />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="diff" className="mt-0">
            {isSkill ? (
              <SkillDiffViewer original={currentContent} modified={proposedContent} />
            ) : hasContentChanges ? (
              <DiffView
                original={currentContent}
                modified={proposedContent}
                className="min-h-[300px]"
                language={isStructured ? (structuredFormat?.toLowerCase() as "json" | "yaml") || "json" : undefined}
              />
            ) : (
              <div className="min-h-[300px] flex items-center justify-center border rounded-lg bg-muted/30">
                <div className="text-center">
                  <GitCompare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t("noChangesYet")}</p>
                  <p className="text-xs text-muted-foreground mt-1">Edit the content to see changes</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">{t("reason")}</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("reasonPlaceholder")}
          className="min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          {hasChanges ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {t("changesDetected")}
            </span>
          ) : (
            <span>{t("noChangesYet")}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || !hasChanges}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </div>
    </form>
  );
}
