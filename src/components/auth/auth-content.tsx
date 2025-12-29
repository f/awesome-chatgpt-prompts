"use client";

import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { OAuthButton } from "./oauth-button";

interface AuthContentProps {
  providers: string[];
  mode: "login" | "register";
}

const providerNames: Record<string, string> = {
  github: "GitHub",
  google: "Google",
  azure: "Microsoft",
  apple: "Apple",
  credentials: "Email",
};

export function AuthContent({ providers, mode }: AuthContentProps) {
  const hasCredentials = providers.includes("credentials");
  const oauthProviders = providers.filter((p) => p !== "credentials");

  return (
    <div className="space-y-3">
      {/* OAuth providers */}
      {oauthProviders.length > 0 && (
        <div className="space-y-2">
          {oauthProviders.map((provider) => (
            <OAuthButton
              key={provider}
              provider={provider}
              providerName={providerNames[provider] || provider}
            />
          ))}
        </div>
      )}

      {/* Separator when both OAuth and credentials are enabled */}
      {oauthProviders.length > 0 && hasCredentials && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
      )}

      {/* Credentials form */}
      {hasCredentials && (mode === "login" ? <LoginForm /> : <RegisterForm />)}
    </div>
  );
}
