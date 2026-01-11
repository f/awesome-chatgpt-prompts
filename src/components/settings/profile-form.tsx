"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, BadgeCheck, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { analyticsProfile } from "@/lib/analytics";

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
    verified: boolean;
  };
  showVerifiedSection?: boolean;
}

export function ProfileForm({ user, showVerifiedSection = false }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tSettings = useTranslations("settings");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifiedSectionDismissed, setIsVerifiedSectionDismissed] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("verifiedSectionDismissed");
    setIsVerifiedSectionDismissed(stored === "true");
    setHasMounted(true);
  }, []);

  const handleDismissVerifiedSection = (dismissed: boolean) => {
    setIsVerifiedSectionDismissed(dismissed);
    localStorage.setItem("verifiedSectionDismissed", String(dismissed));
  };

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

      analyticsProfile.updateProfile();
      if (data.avatar !== user.avatar) {
        analyticsProfile.updateAvatar();
      }
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
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t("profileUrl")}: /{form.watch("username") || user.username}
              </p>
              {showVerifiedSection && !user.verified && hasMounted && isVerifiedSectionDismissed && (
                <button
                  type="button"
                  onClick={() => handleDismissVerifiedSection(false)}
                  className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <BadgeCheck className="h-3 w-3" />
                  {tSettings("getVerifiedTitle")}
                </button>
              )}
            </div>
          </div>

          {/* Verified Status */}
          {showVerifiedSection && (
            user.verified ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <BadgeCheck className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{tSettings("verifiedTitle")}</p>
                  <p className="text-xs text-muted-foreground">{tSettings("verifiedThankYou")}</p>
                </div>
              </div>
            ) : hasMounted && !isVerifiedSectionDismissed && (
              <div className="relative p-4 rounded-lg border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/10">
                <button
                  type="button"
                  onClick={() => handleDismissVerifiedSection(true)}
                  className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <BadgeCheck className="h-5 w-5 text-blue-500" />
                  <p className="text-sm font-semibold">{tSettings("getVerifiedTitle")}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-3 pr-6">{tSettings("getVerifiedDescription")}</p>
                <a
                  href="https://donate.stripe.com/aFa9AS5RJeAR23nej0dMI03"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <BadgeCheck className="h-4 w-4" />
                  {tSettings("getVerifiedButton")}
                  <span className="text-blue-100">({tSettings("verifiedBadgePrice")})</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )
          )}

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
