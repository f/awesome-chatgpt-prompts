import { registerAuthPlugin } from "../registry";
import { credentialsPlugin } from "./credentials";
import { googlePlugin } from "./google";
import { azurePlugin } from "./azure";
import { githubPlugin } from "./github";
import { applePlugin } from "./apple";
import { oidcPlugin } from "./oidc";
import { oauthPlugin } from "./oauth";

// Register all built-in auth plugins
export function registerBuiltInAuthPlugins(): void {
  registerAuthPlugin(credentialsPlugin);
  registerAuthPlugin(googlePlugin);
  registerAuthPlugin(azurePlugin);
  registerAuthPlugin(githubPlugin);
  registerAuthPlugin(applePlugin);
  registerAuthPlugin(oidcPlugin);
  registerAuthPlugin(oauthPlugin);
}

export { credentialsPlugin, googlePlugin, azurePlugin, githubPlugin, applePlugin, oidcPlugin, oauthPlugin };