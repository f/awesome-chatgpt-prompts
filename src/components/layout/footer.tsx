"use client";

import Link from "next/link";
import { useBranding } from "@/components/providers/branding-provider";

export function Footer() {
  const branding = useBranding();

  return (
    <footer className="border-t">
      <div className="container flex items-center justify-between h-10 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} {branding.name}</span>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">GitHub</Link>
        </nav>
      </div>
    </footer>
  );
}
