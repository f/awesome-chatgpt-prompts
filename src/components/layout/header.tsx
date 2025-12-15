"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  Menu,
  Plus,
  User,
  Settings,
  LogOut,
  Shield,
  Globe,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/layout/notification-bell";
import { setLocale } from "@/lib/i18n/client";
import { useBranding } from "@/components/providers/branding-provider";

const languages = [
  { code: "en", name: "English" },
  { code: "zh", name: "中文" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "tr", name: "Türkçe" },
  { code: "ko", name: "한국어" },
  { code: "ar", name: "العربية" },
  { code: "ru", name: "Русский" },
];

interface HeaderProps {
  authProvider?: string;
  allowRegistration?: boolean;
}

export function Header({ authProvider = "credentials", allowRegistration = true }: HeaderProps) {
  const isOAuth = authProvider !== "credentials";
  // Show register button for OAuth (with login text) or credentials with registration enabled
  const showRegisterButton = isOAuth || (authProvider === "credentials" && allowRegistration);
  const { data: session } = useSession();
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  const branding = useBranding();

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center gap-4">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 p-6 border-b">
                {branding.logo && (
                  <>
                    <Image
                      src={branding.logo}
                      alt={branding.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 dark:hidden"
                    />
                    <Image
                      src={branding.logoDark || branding.logo}
                      alt={branding.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 hidden dark:block"
                    />
                  </>
                )}
                <span className="text-lg font-semibold">{branding.name}</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <div className="space-y-1">
                  {user && (
                    <Link 
                      href="/feed" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {t("nav.feed")}
                    </Link>
                  )}
                  <Link 
                    href="/prompts" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {t("nav.prompts")}
                  </Link>
                  <Link 
                    href="/categories" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {t("nav.categories")}
                  </Link>
                  <Link 
                    href="/tags" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {t("nav.tags")}
                  </Link>
                  <Link 
                    href="/discover" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {t("feed.discover")}
                  </Link>
                  <Link 
                    href="/promptmasters" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {t("nav.promptmasters")}
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  {branding.name}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex gap-2">
          {branding.logo && (
            <>
              <Image
                src={branding.logo}
                alt={branding.name}
                width={20}
                height={20}
                className="h-5 w-5 dark:hidden"
              />
              <Image
                src={branding.logoDark || branding.logo}
                alt={branding.name}
                width={20}
                height={20}
                className="h-5 w-5 hidden dark:block"
              />
            </>
          )}
          <span className="font-semibold leading-none">{branding.name}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {user && (
            <Link
              href="/feed"
              className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              {t("nav.feed")}
            </Link>
          )}
          <Link
            href="/prompts"
            className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            {t("nav.prompts")}
          </Link>
          <Link
            href="/categories"
            className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            {t("nav.categories")}
          </Link>
          <Link
            href="/tags"
            className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            {t("nav.tags")}
          </Link>
          <Link
            href="/promptmasters"
            className="px-3 py-1.5 rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          >
            {t("nav.promptmasters")}
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Create prompt button */}
          {user && (
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/prompts/new">
                <Plus className="h-4 w-4" />
                <span className="sr-only">{t("prompts.create")}</span>
              </Link>
            </Button>
          )}

          {/* Notifications */}
          {user && <NotificationBell />}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User menu or login */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 gap-2 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                    <AvatarFallback className="text-xs">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">
                    @{user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/@${user.username}`}>
                    <User className="mr-2 h-4 w-4" />
                    {t("nav.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    {t("settings.language")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                      >
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1">
              {/* Language selector for non-logged in users */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLocale(lang.code)}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              {authProvider === "credentials" && allowRegistration && (
                <Button size="sm" className="h-8 text-xs" asChild>
                  <Link href="/register">
                    {t("nav.register")}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
