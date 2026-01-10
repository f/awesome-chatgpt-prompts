"use client";

import { Lock, User, ClipboardList, Settings, CheckCircle, X, Star, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconLock({ className }: { className?: string }) {
  return <Lock className={cn("inline-block h-4 w-4", className)} />;
}

export function IconUser({ className }: { className?: string }) {
  return <User className={cn("inline-block h-4 w-4", className)} />;
}

export function IconClipboard({ className }: { className?: string }) {
  return <ClipboardList className={cn("inline-block h-4 w-4", className)} />;
}

export function IconSettings({ className }: { className?: string }) {
  return <Settings className={cn("inline-block h-4 w-4", className)} />;
}

export function IconCheck({ className }: { className?: string }) {
  return <CheckCircle className={cn("inline-block h-4 w-4", className)} />;
}

export function IconX({ className }: { className?: string }) {
  return <X className={cn("inline-block h-4 w-4", className)} />;
}

export function IconStar({ className }: { className?: string }) {
  return <Star className={cn("inline-block h-4 w-4", className)} />;
}

export function IconLightbulb({ className }: { className?: string }) {
  return <Lightbulb className={cn("inline-block h-4 w-4", className)} />;
}

export function IconTarget({ className }: { className?: string }) {
  return <Target className={cn("inline-block h-4 w-4", className)} />;
}
