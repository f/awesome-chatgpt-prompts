"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { VariableToolbar } from "./variable-toolbar";
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
  promptId?: string;
  mode?: "create" | "edit";
}

export function PromptForm({ categories, tags, initialData, promptId, mode = "create" }: PromptFormProps) {
  const router = useRouter();
  const t = useTranslations("prompts");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const promptSchema = createPromptSchema(t);
  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeEditorRef = useRef<CodeEditorHandle>(null);

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
        body: JSON.stringify(data),
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
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

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {promptType === "STRUCTURED" 
                  ? `${t("promptContent")} (${structuredFormat})` 
                  : t("promptContent")}
              </FormLabel>
              <FormControl>
                {promptType === "STRUCTURED" ? (
                  <div className="rounded-md border overflow-hidden">
                    <VariableToolbar onInsert={insertVariable} />
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
                      minHeight="350px"
                      className="border-0 rounded-none"
                    />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <VariableToolbar onInsert={insertVariable} />
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
                      className="min-h-[200px] font-mono border-0 rounded-none focus-visible:ring-0"
                    />
                  </div>
                )}
              </FormControl>
              {promptType === "STRUCTURED" && (
                <FormDescription>
                  {t("structuredContentDescription")}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={`grid gap-4 ${promptType === "STRUCTURED" ? "grid-cols-3" : "grid-cols-2"}`}>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("promptType")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TEXT">{t("types.text")}</SelectItem>
                    <SelectItem value="STRUCTURED">{t("types.structured")}</SelectItem>
                    <SelectItem value="IMAGE">{t("types.image")}</SelectItem>
                    <SelectItem value="VIDEO">{t("types.video")}</SelectItem>
                    <SelectItem value="AUDIO">{t("types.audio")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {promptType === "STRUCTURED" && (
            <FormField
              control={form.control}
              name="structuredFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("structuredFormat")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="JSON">JSON</SelectItem>
                      <SelectItem value="YAML">YAML</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("promptCategory")}</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "__none__" ? undefined : value)} 
                  defaultValue={field.value || "__none__"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">{t("noCategory")}</SelectItem>
                    {/* Parent categories */}
                    {categories
                      .filter((c) => c.id && !c.parentId)
                      .map((parent) => (
                        <div key={parent.id}>
                          <SelectItem value={parent.id} className="font-medium">
                            {parent.name}
                          </SelectItem>
                          {/* Child categories */}
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

        {(promptType === "IMAGE" || promptType === "VIDEO" || promptType === "AUDIO" || promptType === "STRUCTURED") && (
          <FormField
            control={form.control}
            name="mediaUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("mediaUrl")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("mediaUrlPlaceholder")} {...field} />
                </FormControl>
                <FormDescription>
                  {t("mediaUrlDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("promptPrivate")}</FormLabel>
                <FormDescription>
                  {t("privateDescription")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requiresMediaUpload"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">{t("requiresMediaUpload")}</FormLabel>
                <FormDescription>
                  {t("requiresMediaUploadDescription")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {requiresMediaUpload && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="requiredMediaType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("requiredMediaType")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IMAGE">{t("types.image")}</SelectItem>
                      <SelectItem value="VIDEO">{t("types.video")}</SelectItem>
                      <SelectItem value="DOCUMENT">{t("types.document")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requiredMediaCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("requiredMediaCount")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={10} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
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
  );
}
