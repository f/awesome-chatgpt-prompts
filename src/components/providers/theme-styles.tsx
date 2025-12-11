"use client";

// ThemeStyles is now a no-op since styles are applied server-side in layout.tsx
// This component is kept for potential future dynamic theme switching

interface ThemeStylesProps {
  radius: "none" | "sm" | "md" | "lg";
  variant: "flat" | "default" | "brutal";
  density: "compact" | "default" | "comfortable";
  primaryColor: string;
}

export function ThemeStyles(_props: ThemeStylesProps) {
  // Styles are now applied server-side to prevent flash
  // This component can be extended for dynamic theme switching if needed
  return null;
}
