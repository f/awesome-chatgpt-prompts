import { registerAuthPlugin } from "../registry";
import { credentialsPlugin } from "./credentials";
import { googlePlugin } from "./google";
import { azurePlugin } from "./azure";
import { githubPlugin } from "./github";

// Register all built-in auth plugins
export function registerBuiltInAuthPlugins(): void {
  registerAuthPlugin(credentialsPlugin);
  registerAuthPlugin(googlePlugin);
  registerAuthPlugin(azurePlugin);
  registerAuthPlugin(githubPlugin);
}

export { credentialsPlugin, googlePlugin, azurePlugin, githubPlugin };