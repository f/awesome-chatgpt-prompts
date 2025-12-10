import { registerAuthPlugin } from "../registry";
import { credentialsPlugin } from "./credentials";
import { googlePlugin } from "./google";
import { azurePlugin } from "./azure";

// Register all built-in auth plugins
export function registerBuiltInAuthPlugins(): void {
  registerAuthPlugin(credentialsPlugin);
  registerAuthPlugin(googlePlugin);
  registerAuthPlugin(azurePlugin);
}

export { credentialsPlugin, googlePlugin, azurePlugin };
