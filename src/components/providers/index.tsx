"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider, AbstractIntlMessages } from "next-intl";
import { ThemeStyles } from "./theme-styles";
import { BrandingProvider } from "./branding-provider";

interface ThemeConfig {
  radius: "none" | "sm" | "md" | "lg";
  variant: "flat" | "default" | "brutal";
  density: "compact" | "default" | "comfortable";
  colors: {
    primary: string;
  };
}

interface BrandingConfig {
  name: string;
  logo: string;
  description: string;
  useCloneBranding?: boolean;
}

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  theme: ThemeConfig;
  branding: BrandingConfig;
}

export function Providers({ children, locale, messages, theme, branding }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeStyles 
            radius={theme.radius} 
            variant={theme.variant}
            density={theme.density}
            primaryColor={theme.colors.primary} 
          />
          <BrandingProvider branding={branding}>
            {children}
          </BrandingProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
