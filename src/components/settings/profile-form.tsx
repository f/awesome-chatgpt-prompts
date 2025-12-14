"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  username: z
    .string()
    .min(1, "Username is required")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  avatar: z.string().url().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username,
      avatar: user.avatar || "",
    },
  });

  const watchedAvatar = form.watch("avatar");
  const watchedName = form.watch("name");

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      // Trigger NextAuth session refresh - JWT callback will fetch updated data from DB
      await update({});

      toast.success(t("profileUpdated"));
      router.refresh();

      // If username changed, redirect to new profile
      if (data.username !== user.username) {
        router.push(`/@${data.username}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("title")}</CardTitle>
          <CardDescription>
            {t("updateInfo")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={watchedAvatar || undefined} />
              <AvatarFallback className="text-lg">
                {watchedName?.charAt(0)?.toUpperCase() || user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar">{t("avatarUrl")}</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                {...form.register("avatar")}
                className="mt-1"
              />
              {form.formState.errors.avatar && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.avatar.message}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("displayName")}</Label>
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">{t("username")}</Label>
            <div className="flex items-center">
              <span className="text-muted-foreground text-sm mr-1">@</span>
              <Input
                id="username"
                placeholder={t("usernamePlaceholder")}
                {...form.register("username")}
              />
            </div>
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {t("profileUrl")}: /{form.watch("username") || user.username}
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {t("emailCannotChange")}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {t("saveChanges")}
        </Button>
      </div>
    </form>
  );
}
