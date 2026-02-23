import { registerAuthPlugin } from "../registry";
import { credentialsPlugin } from "./credentials";
import { googlePlugin } from "./google";
import { azurePlugin } from "./azure";
import { githubPlugin } from "./github";
import { applePlugin } from "./apple";
import { gitlabPlugin } from "./gitlab";

// Register all built-in auth plugins
export function registerBuiltInAuthPlugins(): void {
  registerAuthPlugin(credentialsPlugin);
  registerAuthPlugin(googlePlugin);
  registerAuthPlugin(azurePlugin);
  registerAuthPlugin(githubPlugin);
  registerAuthPlugin(applePlugin);
  registerAuthPlugin(gitlabPlugin);
}

export { credentialsPlugin, googlePlugin, azurePlugin, githubPlugin, applePlugin, gitlabPlugin };