"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MoreHorizontal, Plus, Pencil, Trash2, ChevronRight, Pin, PinOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  order: number;
  pinned: boolean;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  children?: Category[];
  _count: {
    prompts: number;
    children: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const t = useTranslations("admin.categories");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", icon: "", parentId: "", pinned: false });

  // Get only root categories (no parent) for parent selection
  const rootCategories = useMemo(() => 
    categories.filter(c => !c.parentId), 
    [categories]
  );

  // Build hierarchical list for display (parents first, then children indented)
  const hierarchicalCategories = useMemo(() => {
    const result: (Category & { level: number })[] = [];
    
    // Add root categories and their children
    rootCategories.forEach(parent => {
      result.push({ ...parent, level: 0 });
      const children = categories.filter(c => c.parentId === parent.id);
      children.forEach(child => {
        result.push({ ...child, level: 1 });
      });
    });
    
    return result;
  }, [categories, rootCategories]);

  const openCreateDialog = () => {
    setFormData({ name: "", slug: "", description: "", icon: "", parentId: "", pinned: false });
    setIsCreating(true);
  };

  const openEditDialog = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      icon: category.icon || "",
      parentId: category.parentId || "",
      pinned: category.pinned,
    });
    setEditCategory(category);
  };

  const handleTogglePin = async (category: Category) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !category.pinned }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(category.pinned ? t("unpinned") : t("pinned"));
      router.refresh();
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  // Filter out invalid parent options (can't be own parent or child of self)
  const getValidParentOptions = () => {
    if (!editCategory) return rootCategories;
    // When editing, exclude self and any category that has this as parent
    return rootCategories.filter(c => 
      c.id !== editCategory.id && c.parentId !== editCategory.id
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = editCategory
        ? `/api/admin/categories/${editCategory.id}`
        : "/api/admin/categories";
      const method = editCategory ? "PATCH" : "POST";

      const payload = {
        ...formData,
        parentId: formData.parentId || null, // Convert empty string to null
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success(editCategory ? t("updated") : t("created"));
      router.refresh();
      setEditCategory(null);
      setIsCreating(false);
    } catch {
      toast.error(t("saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success(t("deleted"));
      router.refresh();
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button size="sm" onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          {t("add")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("slug")}</TableHead>
              <TableHead>{t("parent")}</TableHead>
              <TableHead className="text-center">{t("prompts")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hierarchicalCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {t("noCategories")}
                </TableCell>
              </TableRow>
            ) : (
              hierarchicalCategories.map((category) => (
                <TableRow key={category.id} className={category.level > 0 ? "bg-muted/30" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2" style={{ paddingLeft: category.level * 24 }}>
                      {category.level > 0 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                      {category.icon && <span>{category.icon}</span>}
                      <span className={category.level === 0 ? "font-medium" : ""}>{category.name}</span>
                      {category._count.children > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {category._count.children} {t("subcategories")}
                        </Badge>
                      )}
                      {category.pinned && (
                        <Badge variant="default" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          {t("pinnedBadge")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>
                    {category.parent ? (
                      <Badge variant="outline">{category.parent.name}</Badge>
                    ) : (
                      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {t("rootCategory")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{category._count.prompts}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePin(category)} disabled={loading}>
                          {category.pinned ? (
                            <><PinOff className="h-4 w-4 mr-2" />{t("unpin")}</>
                          ) : (
                            <><Pin className="h-4 w-4 mr-2" />{t("pin")}</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editCategory} onOpenChange={() => { setIsCreating(false); setEditCategory(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? t("editTitle") : t("createTitle")}</DialogTitle>
            <DialogDescription>{editCategory ? t("editDescription") : t("createDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">{t("slug")}</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parentId">{t("parentCategory")}</Label>
              <Select
                value={formData.parentId}
                onValueChange={(value) => setFormData({ ...formData, parentId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectParent")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("noParent")}</SelectItem>
                  {getValidParentOptions().map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon && <span className="mr-2">{cat.icon}</span>}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("parentHelp")}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t("descriptionLabel")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">{t("icon")}</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📁"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="pinned" className="text-sm font-normal cursor-pointer">
                {t("pinnedLabel")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreating(false); setEditCategory(null); }}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !formData.name || !formData.slug}>
              {editCategory ? t("save") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
