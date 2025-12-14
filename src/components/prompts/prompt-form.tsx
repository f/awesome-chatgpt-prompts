"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
import { VariableToolbar } from "./variable-toolbar";
import { VariableWarning } from "./variable-warning";
import { VariableHint } from "./variable-hint";
import { ContributorSearch } from "./contributor-search";
import { PromptBuilder } from "./prompt-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CodeEditor, type CodeEditorHandle } from "@/components/ui/code-editor";
import { toast } from "sonner";
import { prettifyJson } from "@/lib/format";

interface MediaFieldProps {
  form: ReturnType<typeof useForm<PromptFormValues>>;
  t: (key: string) => string;
}

function MediaField({ form, t }: MediaFieldProps) {
  const [storageMode, setStorageMode] = useState<string>("url");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaUrl = form.watch("mediaUrl");

  useEffect(() => {
    fetch("/api/config/storage")
      .then((res) => res.json())
      .then((data) => setStorageMode(data.mode))
      .catch(() => setStorageMode("url"));
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(t("fileTooLarge"));
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t("invalidFileType"));
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const result = await response.json();
      form.setValue("mediaUrl", result.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearMedia = () => {
    form.setValue("mediaUrl", "");
    setUploadError(null);
  };

  // URL mode: show text input
  if (storageMode === "url") {
    return (
      <FormField
        control={form.control}
        name="mediaUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("mediaUrl")}</FormLabel>
            <FormControl>
              <Input placeholder={t("mediaUrlPlaceholder")} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Upload mode: show file upload
  return (
    <FormField
      control={form.control}
      name="mediaUrl"
      render={() => (
        <FormItem>
          <FormLabel>{t("mediaImage")}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {mediaUrl ? (
                <div className="relative inline-block">
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="max-h-40 rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {isUploading ? t("uploading") : t("clickToUpload")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("maxFileSize")}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const createPromptSchema = (t: (key: string) => string) => z.object({
  title: z.string().min(1, t("titleRequired")).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(1, t("contentRequired")),
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "STRUCTURED"]),
  structuredFormat: z.enum(["JSON", "YAML"]).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()),
  isPrivate: z.boolean(),
  mediaUrl: z.string().url().optional().or(z.literal("")),
  requiresMediaUpload: z.boolean(),
  requiredMediaType: z.enum(["IMAGE", "VIDEO", "DOCUMENT"]).optional(),
  requiredMediaCount: z.coerce.number().int().min(1).max(10).optional(),
});

type PromptFormValues = z.infer<ReturnType<typeof createPromptSchema>>;

interface Contributor {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface PromptFormProps {
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color: string;
  }>;
  initialData?: Partial<PromptFormValues>;
  initialContributors?: Contributor[];
  promptId?: string;
  mode?: "create" | "edit";
  aiGenerationEnabled?: boolean;
  aiModelName?: string;
  initialPromptRequest?: string;
}

export function PromptForm({ categories, tags, initialData, initialContributors = [], promptId, mode = "create", aiGenerationEnabled = false, aiModelName, initialPromptRequest }: PromptFormProps) {
  const router = useRouter();
  const t = useTranslations("prompts");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>(initialContributors);

  const promptSchema = createPromptSchema(t);
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema) as never,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content && initialData?.structuredFormat === "JSON" 
        ? prettifyJson(initialData.content) 
        : (initialData?.content || ""),
      type: initialData?.type || "TEXT",
      structuredFormat: initialData?.structuredFormat || "JSON",
      categoryId: initialData?.categoryId || "",
      tagIds: initialData?.tagIds || [],
      isPrivate: initialData?.isPrivate || false,
      mediaUrl: initialData?.mediaUrl || "",
      requiresMediaUpload: initialData?.requiresMediaUpload || false,
      requiredMediaType: initialData?.requiredMediaType || "IMAGE",
      requiredMediaCount: initialData?.requiredMediaCount || 1,
    },
  });

  const selectedTags = form.watch("tagIds");
  const promptType = form.watch("type");
  const structuredFormat = form.watch("structuredFormat");
  const requiresMediaUpload = form.watch("requiresMediaUpload");
  const promptContent = form.watch("content");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeEditorRef = useRef<CodeEditorHandle>(null);

  // Warn user before leaving page with unsaved changes
  const isDirty = form.formState.isDirty;
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Handler for AI builder state changes
  const handleBuilderStateChange = (newState: {
    title: string;
    description: string;
    content: string;
    type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "STRUCTURED";
    structuredFormat?: "JSON" | "YAML";
    categoryId?: string;
    tagIds: string[];
    isPrivate: boolean;
    requiresMediaUpload: boolean;
    requiredMediaType?: "IMAGE" | "VIDEO" | "DOCUMENT";
    requiredMediaCount?: number;
  }) => {
    const opts = { shouldDirty: true, shouldTouch: true };
    if (newState.title) form.setValue("title", newState.title, opts);
    if (newState.description) form.setValue("description", newState.description, opts);
    if (newState.content) form.setValue("content", newState.content, opts);
    if (newState.type) form.setValue("type", newState.type, opts);
    if (newState.structuredFormat) form.setValue("structuredFormat", newState.structuredFormat, opts);
    if (newState.categoryId) form.setValue("categoryId", newState.categoryId, opts);
    if (newState.tagIds?.length) form.setValue("tagIds", newState.tagIds, opts);
    form.setValue("isPrivate", newState.isPrivate, opts);
    form.setValue("requiresMediaUpload", newState.requiresMediaUpload, opts);
    if (newState.requiredMediaType) form.setValue("requiredMediaType", newState.requiredMediaType, opts);
    if (newState.requiredMediaCount) form.setValue("requiredMediaCount", newState.requiredMediaCount, opts);
  };

  // Current state for AI builder
  const currentBuilderState = {
    title: form.watch("title"),
    description: form.watch("description") || "",
    content: form.watch("content"),
    type: form.watch("type"),
    structuredFormat: form.watch("structuredFormat"),
    categoryId: form.watch("categoryId"),
    tagIds: form.watch("tagIds"),
    isPrivate: form.watch("isPrivate"),
    requiresMediaUpload: form.watch("requiresMediaUpload"),
    requiredMediaType: form.watch("requiredMediaType"),
    requiredMediaCount: form.watch("requiredMediaCount"),
  };

  const getSelectedText = () => {
    // For text prompts using textarea
    const textarea = textareaRef.current;
    if (textarea) {
      return textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    }
    return "";
  };

  const insertVariable = (variable: string) => {
    // For structured prompts using Monaco editor
    if (promptType === "STRUCTURED" && codeEditorRef.current) {
      codeEditorRef.current.insertAtCursor(variable);
      return;
    }
    
    // For text prompts using textarea
    const textarea = textareaRef.current;
    const currentContent = form.getValues("content");
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = currentContent.slice(0, start) + variable + currentContent.slice(end);
      form.setValue("content", newContent);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      // Fallback: append to end
      form.setValue("content", currentContent + variable);
    }
  };

  async function onSubmit(data: PromptFormValues) {
    setIsLoading(true);

    try {
      const isEdit = mode === "edit" && promptId;
      const url = isEdit ? `/api/prompts/${promptId}` : "/api/prompts";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          contributorIds: contributors.map((c) => c.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save prompt");
      }

      const result = await response.json();
      toast.success(isEdit ? t("promptUpdated") : t("promptCreated"));
      router.push(`/prompts/${result.id || promptId}`);
      router.refresh();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  }

  const toggleTag = (tagId: string) => {
    const current = form.getValues("tagIds");
    if (current.includes(tagId)) {
      form.setValue("tagIds", current.filter((id) => id !== tagId));
    } else {
      form.setValue("tagIds", [...current, tagId]);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Header: Page title + Private Switch */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">{mode === "edit" ? t("edit") : t("create")}</h1>
            <div className="flex items-center gap-3">
              {aiGenerationEnabled && (
                <PromptBuilder
                  availableTags={tags}
                  availableCategories={categories}
                  currentState={currentBuilderState}
                  onStateChange={handleBuilderStateChange}
                  modelName={aiModelName}
                  initialPromptRequest={initialPromptRequest}
                />
              )}
              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 text-sm font-normal">{t("promptPrivate")}</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

        {/* Row 1: Title + Category */}
        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>{t("promptTitle")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("titlePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-64">
                <FormLabel>{t("promptCategory")}</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "__none__" ? undefined : value)} 
                  value={field.value || "__none__"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">{t("noCategory")}</SelectItem>
                    {categories
                      .filter((c) => c.id && !c.parentId)
                      .map((parent) => (
                        <div key={parent.id}>
                          <SelectItem value={parent.id} className="font-medium">
                            {parent.name}
                          </SelectItem>
                          {categories
                            .filter((c) => c.parentId === parent.id)
                            .map((child) => (
                              <SelectItem key={child.id} value={child.id} className="pl-6 text-muted-foreground">
                                ↳ {child.name}
                              </SelectItem>
                            ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

        {/* Row 2: Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("promptDescription")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 3: Content with Type/Format controls */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="mb-0">{t("promptContent")}</FormLabel>
                <div className="flex items-center gap-2">
                  {/* Type selector */}
                  <Select value={promptType} onValueChange={(v) => form.setValue("type", v as any)}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TEXT">{t("types.text")}</SelectItem>
                      <SelectItem value="STRUCTURED">{t("types.structured")}</SelectItem>
                      <SelectItem value="IMAGE">{t("types.image")}</SelectItem>
                      <SelectItem value="VIDEO">{t("types.video")}</SelectItem>
                      <SelectItem value="AUDIO">{t("types.audio")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Format selector (only for STRUCTURED) */}
                  {promptType === "STRUCTURED" && (
                    <Select value={structuredFormat || "JSON"} onValueChange={(v) => form.setValue("structuredFormat", v as any)}>
                      <SelectTrigger className="h-8 w-20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JSON">JSON</SelectItem>
                        <SelectItem value="YAML">YAML</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {/* Media upload toggle */}
                  <div className="flex items-center gap-1.5 ml-2 pl-2 border-l">
                    <Switch
                      id="media-upload"
                      checked={requiresMediaUpload}
                      onCheckedChange={(v) => form.setValue("requiresMediaUpload", v)}
                      className="scale-75"
                    />
                    <label htmlFor="media-upload" className="text-xs text-muted-foreground cursor-pointer">
                      {t("requiresMediaUpload")}
                    </label>
                  </div>
                </div>
              </div>
              <FormControl>
                {promptType === "STRUCTURED" ? (
                  <div className="rounded-md border overflow-hidden">
                    <VariableToolbar onInsert={insertVariable} getSelectedText={getSelectedText} />
                    <CodeEditor
                      ref={codeEditorRef}
                      value={field.value}
                      onChange={field.onChange}
                      language={structuredFormat?.toLowerCase() as "json" | "yaml" || "json"}
                      placeholder={
                        structuredFormat === "JSON"
                          ? '{\n  "name": "My Workflow",\n  "steps": []\n}'
                          : 'name: My Workflow\nsteps:\n  - step: first\n    prompt: "..."'
                      }
                      minHeight="300px"
                      className="border-0 rounded-none"
                    />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <VariableToolbar onInsert={insertVariable} getSelectedText={getSelectedText} />
                    <Textarea
                      ref={(el) => {
                        textareaRef.current = el;
                        if (typeof field.ref === 'function') field.ref(el);
                      }}
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder={t("contentPlaceholder")}
                      className="min-h-[180px] font-mono border-0 rounded-none focus-visible:ring-0"
                    />
                  </div>
                )}
              </FormControl>
              <VariableHint content={field.value} onContentChange={(newContent) => form.setValue("content", newContent)} />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variable detection warning */}
        <VariableWarning
          content={promptContent}
          onConvert={(converted) => form.setValue("content", converted)}
        />

        {/* Media upload options (shown when requiresMediaUpload is true) */}
        {requiresMediaUpload && (
          <div className="flex items-center gap-4 p-3 rounded-md border bg-muted/30">
            <span className="text-sm text-muted-foreground">{t("requiredMediaType")}:</span>
            <Select value={form.watch("requiredMediaType")} onValueChange={(v) => form.setValue("requiredMediaType", v as any)}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGE">{t("types.image")}</SelectItem>
                <SelectItem value="VIDEO">{t("types.video")}</SelectItem>
                <SelectItem value="DOCUMENT">{t("types.document")}</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{t("requiredMediaCount")}:</span>
            <Input 
              type="number" 
              min={1} 
              max={10}
              value={form.watch("requiredMediaCount")}
              onChange={(e) => form.setValue("requiredMediaCount", parseInt(e.target.value) || 1)}
              className="h-8 w-16 text-xs"
            />
          </div>
        )}

        {/* Media URL/Upload (for IMAGE/VIDEO/AUDIO/STRUCTURED types) */}
        {(promptType === "IMAGE" || promptType === "VIDEO" || promptType === "AUDIO" || promptType === "STRUCTURED") && (
          <MediaField
            form={form}
            t={t}
          />
        )}

        {/* Tags */}
        <FormField
          control={form.control}
          name="tagIds"
          render={() => (
            <FormItem>
              <FormLabel>{t("promptTags")}</FormLabel>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={
                      selectedTags.includes(tag.id)
                        ? { backgroundColor: tag.color, color: "white" }
                        : {}
                    }
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contributors */}
        <div className="space-y-2">
          <label className="text-sm font-medium block">{t("promptContributors")}</label>
          <p className="text-xs text-muted-foreground">{t("contributorsDescription")}</p>
          <ContributorSearch
            selectedUsers={contributors}
            onSelect={(user) => setContributors((prev) => [...prev, user])}
            onRemove={(userId) => setContributors((prev) => prev.filter((u) => u.id !== userId))}
          />
        </div>

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" ? t("update") : t("createButton")} Prompt
          </Button>
        </div>
        </form>
      </Form>
    </>
  );
}
