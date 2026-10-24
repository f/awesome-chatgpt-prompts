"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BOT_PLATFORMS,
  BOT_PLATFORM_INFO,
  botRoutineSchema,
  botSkillSchema,
  type BotConfig,
  type BotPlatform,
} from "@/lib/bots/schema";
import { getBotUrl } from "@/lib/urls";

const botFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(500),
  botPlatform: z.enum(BOT_PLATFORMS),
  installUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || /^https:\/\/\S+$/.test(value), { message: "https://…" }),
  content: z.string().trim().min(1),
  isPrivate: z.boolean(),
  routines: z.array(botRoutineSchema).max(20),
  skills: z.array(botSkillSchema).max(20),
  connectors: z.string().max(1000),
});

type BotFormValues = z.infer<typeof botFormSchema>;

export interface BotFormInitialData {
  title: string;
  description: string;
  botPlatform: BotPlatform;
  installUrl: string;
  content: string;
  isPrivate: boolean;
  config: BotConfig;
}

interface BotFormProps {
  mode: "create" | "edit";
  botId?: string;
  initialData?: BotFormInitialData;
}

function parseConnectors(value: string): string[] {
  return Array.from(new Set(value.split(",").map((c) => c.trim()).filter(Boolean))).slice(0, 20);
}

export function BotForm({ mode, botId, initialData }: BotFormProps) {
  const t = useTranslations("bots");
  const tPrompts = useTranslations("prompts");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      botPlatform: initialData?.botPlatform ?? "OPENCLAW",
      installUrl: initialData?.installUrl ?? "",
      content: initialData?.content ?? "",
      isPrivate: initialData?.isPrivate ?? false,
      routines: initialData?.config.routines ?? [],
      skills: initialData?.config.skills ?? [],
      connectors: initialData?.config.connectors.join(", ") ?? "",
    },
  });

  const routines = useFieldArray({ control: form.control, name: "routines" });
  const skills = useFieldArray({ control: form.control, name: "skills" });

  async function onSubmit(data: BotFormValues) {
    setIsLoading(true);
    try {
      const isEdit = mode === "edit" && botId;
      const payload = {
        title: data.title,
        description: data.description,
        content: data.content,
        isPrivate: data.isPrivate,
        botPlatform: data.botPlatform,
        installUrl: data.installUrl,
        botConfig: {
          routines: data.routines,
          skills: data.skills,
          connectors: parseConnectors(data.connectors),
        },
      };

      const response = await fetch(isEdit ? `/api/prompts/${botId}` : "/api/prompts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? payload : { ...payload, type: "BOT", tagIds: [] }),
      });
      const result = await response.json();

      if (!response.ok) {
        if (result.error === "rate_limit") return void toast.error(tPrompts("rateLimitError"));
        if (result.error === "daily_limit") return void toast.error(tPrompts("dailyLimitError"));
        if (result.error === "duplicate_prompt") return void toast.error(tPrompts("duplicatePromptError"));
        if (result.error === "content_exists") {
          return void toast.error(
            tPrompts("contentExistsError", { title: result.existingPromptTitle, author: result.existingPromptAuthor })
          );
        }
        throw new Error("Failed to save bot");
      }

      toast.success(isEdit ? t("form.updated") : t("form.created"));
      router.push(getBotUrl(result.id || botId, result.slug));
      router.refresh();
    } catch {
      toast.error(tCommon("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">{mode === "edit" ? t("form.editTitle") : t("form.createTitle")}</h1>
          <FormField
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 text-sm font-normal">{t("private")}</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pb-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("form.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("form.namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="botPlatform"
              render={({ field }) => (
                <FormItem className="w-full sm:w-48">
                  <FormLabel>{t("form.platform")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BOT_PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {BOT_PLATFORM_INFO[platform].name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.description")}</FormLabel>
                <FormControl>
                  <Textarea rows={2} placeholder={t("form.descriptionPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="installUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.installUrl")}</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://" {...field} />
                </FormControl>
                <FormDescription>{t("form.installUrlHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("instructions")}</FormLabel>
              <FormDescription>{t("form.instructionsHint")}</FormDescription>
              <FormControl>
                <Textarea rows={10} className="font-mono text-sm" placeholder={t("form.instructionsPlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium">{t("routines")}</h2>
            <p className="text-xs text-muted-foreground">{t("form.routinesHint")}</p>
          </div>
          {routines.fields.map((routine, index) => {
            const type = form.watch(`routines.${index}.type`);
            return (
              <div key={routine.id} className="rounded-md border p-3 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <FormField
                    control={form.control}
                    name={`routines.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t("form.routineName")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`routines.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-44">
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="schedule">{t("scheduled")}</SelectItem>
                            <SelectItem value="event">{t("eventTriggered")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => routines.remove(index)}
                    aria-label={t("form.remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <FormField
                    control={form.control}
                    name={`routines.${index}.trigger`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            className={type === "schedule" ? "font-mono" : undefined}
                            placeholder={type === "schedule" ? t("form.cronPlaceholder") : t("form.eventPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`routines.${index}.triggerLabel`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t("form.triggerLabelPlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`routines.${index}.prompt`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea rows={2} placeholder={t("form.routinePromptPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            );
          })}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={routines.fields.length >= 20}
            onClick={() => routines.append({ name: "", type: "schedule", trigger: "", triggerLabel: "", prompt: "" })}
          >
            <Plus className="h-4 w-4" />
            {t("form.addRoutine")}
          </Button>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium">{t("skills")}</h2>
            <p className="text-xs text-muted-foreground">{t("form.skillsHint")}</p>
          </div>
          {skills.fields.map((skill, index) => (
            <div key={skill.id} className="flex flex-col sm:flex-row gap-3 rounded-md border p-3">
              <FormField
                control={form.control}
                name={`skills.${index}.name`}
                render={({ field }) => (
                  <FormItem className="sm:w-40">
                    <FormControl>
                      <Input placeholder={t("form.skillName")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`skills.${index}.description`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={t("form.skillDescription")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`skills.${index}.source`}
                render={({ field }) => (
                  <FormItem className="sm:w-56">
                    <FormControl>
                      <Input className="font-mono text-xs" placeholder={t("form.skillSourcePlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => skills.remove(index)}
                aria-label={t("form.remove")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={skills.fields.length >= 20}
            onClick={() => skills.append({ name: "", description: "", source: "" })}
          >
            <Plus className="h-4 w-4" />
            {t("form.addSkill")}
          </Button>
        </section>

        <FormField
          control={form.control}
          name="connectors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("connectors")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.connectorsPlaceholder")} {...field} />
              </FormControl>
              <FormDescription>{t("form.connectorsHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "edit" ? t("form.save") : t("form.submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
