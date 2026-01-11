"use client";

import { createContext, useContext, type ReactNode } from "react";

interface BrandingContextValue {
  name: string;
  logo: string;
  logoDark?: string;
  description: string;
  appStoreUrl?: string;
  chromeExtensionUrl?: string;
  useCloneBranding?: boolean;
}

const BrandingContext = createContext<BrandingContextValue | null>(null);

interface BrandingProviderProps {
  children: ReactNode;
  branding: BrandingContextValue;
}

export function BrandingProvider({ children, branding }: BrandingProviderProps) {
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingContextValue {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
}
