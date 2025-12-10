"use client";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { OAuthButton } from "./oauth-button";

interface AuthContentProps {
  provider: string;
  mode: "login" | "register";
}

const providerNames: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  azure: "Microsoft",
  credentials: "Email",
};

export function AuthContent({ provider, mode }: AuthContentProps) {
  // For OAuth providers, show the OAuth button
  if (provider !== "credentials") {
    return (
      <OAuthButton 
        provider={provider} 
        providerName={providerNames[provider] || provider} 
      />
    );
  }

  // For credentials, show the appropriate form
  return mode === "login" ? <LoginForm /> : <RegisterForm />;
}
