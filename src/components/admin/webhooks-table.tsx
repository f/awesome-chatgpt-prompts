"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Slack, X, Play } from "lucide-react";
import { SLACK_PRESET_PAYLOAD, WEBHOOK_PLACEHOLDERS } from "@/lib/webhook";
import { CodeEditor } from "@/components/ui/code-editor";

import type { JsonValue } from "@prisma/client/runtime/library";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: JsonValue;
  payload: string;
  events: string[];
  isEnabled: boolean;
  createdAt: Date;
}

interface WebhooksTableProps {
  webhooks: WebhookConfig[];
}

interface HeaderEntry {
  key: string;
  value: string;
}

const EVENTS = [
  { value: "PROMPT_CREATED", label: "Prompt Created" },
  { value: "PROMPT_UPDATED", label: "Prompt Updated" },
  { value: "PROMPT_DELETED", label: "Prompt Deleted" },
];

const PLACEHOLDER_LIST = Object.values(WEBHOOK_PLACEHOLDERS);

// Headers Editor Component
function HeadersEditor({
  headers,
  onChange,
}: {
  headers: HeaderEntry[];
  onChange: (headers: HeaderEntry[]) => void;
}) {
  const addHeader = () => {
    onChange([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const updated = [...headers];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {headers.map((header, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder="Header name"
            value={header.key}
            onChange={(e) => updateHeader(index, "key", e.target.value)}
            className="flex-1 font-mono text-sm"
          />
          <Input
            placeholder="Header value"
            value={header.value}
            onChange={(e) => updateHeader(index, "value", e.target.value)}
            className="flex-1 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeHeader(index)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addHeader}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Header
      </Button>
    </div>
  );
}

export function WebhooksTable({ webhooks: initialWebhooks }: WebhooksTableProps) {
  const t = useTranslations("admin.webhooks");
  const router = useRouter();
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "POST",
    headers: [] as HeaderEntry[],
    payload: "",
    events: ["PROMPT_CREATED"] as string[],
    isEnabled: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      method: "POST",
      headers: [],
      payload: "",
      events: ["PROMPT_CREATED"],
      isEnabled: true,
    });
  };

  const applySlackPreset = () => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || "Slack Notifications",
      method: "POST",
      headers: [{ key: "Content-Type", value: "application/json" }],
      payload: SLACK_PRESET_PAYLOAD,
    }));
  };

  const headersToObject = (headers: HeaderEntry[]): Record<string, string> | null => {
    const filtered = headers.filter((h) => h.key.trim() !== "");
    if (filtered.length === 0) return null;
    return Object.fromEntries(filtered.map((h) => [h.key, h.value]));
  };

  const objectToHeaders = (obj: JsonValue): HeaderEntry[] => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
  };

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          headers: headersToObject(formData.headers),
        }),
      });

      if (response.ok) {
        const newWebhook = await response.json();
        setWebhooks((prev) => [newWebhook, ...prev]);
        setIsCreateOpen(false);
        resetForm();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingWebhook) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/webhooks/${editingWebhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          headers: headersToObject(formData.headers),
        }),
      });

      if (response.ok) {
        const updatedWebhook = await response.json();
        setWebhooks((prev) =>
          prev.map((w) => (w.id === updatedWebhook.id ? updatedWebhook : w))
        );
        setIsEditOpen(false);
        setEditingWebhook(null);
        resetForm();
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update webhook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const response = await fetch(`/api/admin/webhooks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  };

  const handleToggleEnabled = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !webhook.isEnabled }),
      });

      if (response.ok) {
        setWebhooks((prev) =>
          prev.map((w) =>
            w.id === webhook.id ? { ...w, isEnabled: !w.isEnabled } : w
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle webhook:", error);
    }
  };

  const handleTest = async (webhook: WebhookConfig) => {
    try {
      const response = await fetch(`/api/admin/webhooks/${webhook.id}/test`, {
        method: "POST",
      });

      if (response.ok) {
        alert(t("testSuccess"));
      } else {
        const data = await response.json();
        alert(t("testFailed") + ": " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Failed to test webhook:", error);
      alert(t("testFailed"));
    }
  };

  const openEditDialog = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      headers: objectToHeaders(webhook.headers),
      payload: webhook.payload,
      events: webhook.events,
      isEnabled: webhook.isEnabled,
    });
    setIsEditOpen(true);
  };

  const WebhookForm = () => (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={applySlackPreset}
          className="gap-2"
        >
          <Slack className="h-4 w-4" />
          {t("useSlackPreset")}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Slack Notifications"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="method">{t("method")}</Label>
          <Select
            value={formData.method}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="url">{t("url")}</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
          placeholder="https://hooks.slack.com/services/..."
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("events")}</Label>
        <div className="flex flex-wrap gap-3">
          {EVENTS.map((event) => (
            <label
              key={event.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.events.includes(event.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData((prev) => ({
                      ...prev,
                      events: [...prev.events, event.value],
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      events: prev.events.filter((ev) => ev !== event.value),
                    }));
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{event.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <Label>{t("headers")}</Label>
        <HeadersEditor
          headers={formData.headers}
          onChange={(headers) => setFormData((prev) => ({ ...prev, headers }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("payload")}</Label>
        <CodeEditor
          value={formData.payload}
          onChange={(payload: string) => setFormData((prev) => ({ ...prev, payload }))}
          language="json"
          minHeight="280px"
          debounceMs={300}
        />
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{t("placeholders")}:</p>
          <div className="flex flex-wrap gap-1">
            {PLACEHOLDER_LIST.map((placeholder) => (
              <Badge
                key={placeholder}
                variant="secondary"
                className="text-xs font-mono cursor-pointer hover:bg-accent"
                onClick={() => {
                  const newPayload = formData.payload + placeholder;
                  setFormData((prev) => ({ ...prev, payload: newPayload }));
                }}
              >
                {placeholder}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="isEnabled"
          checked={formData.isEnabled}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isEnabled: checked }))
          }
        />
        <Label htmlFor="isEnabled">{t("enabled")}</Label>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t("add")}
            </Button>
          </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("addTitle")}</DialogTitle>
                <DialogDescription>{t("addDescription")}</DialogDescription>
              </DialogHeader>
              <WebhookForm />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleCreate} disabled={isLoading}>
                  {t("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      </div>

      <div className="rounded-md border">
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("url")}</TableHead>
                <TableHead>{t("events")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">{webhook.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs font-mono">
                    {webhook.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event.replace("PROMPT_", "")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={webhook.isEnabled}
                      onCheckedChange={() => handleToggleEnabled(webhook)}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleTest(webhook)}>
                          <Play className="h-4 w-4 mr-2" />
                          {t("test")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(webhook)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(webhook.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("editTitle")}</DialogTitle>
            <DialogDescription>{t("editDescription")}</DialogDescription>
          </DialogHeader>
          <WebhookForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
