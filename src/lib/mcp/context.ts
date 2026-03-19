import { AsyncLocalStorage } from 'node:async_hooks';

export interface AuthenticatedUser {
  id: string;
  username: string;
  mcpPromptsPublicByDefault: boolean;
}

export interface McpRequestContext {
  authenticatedUser: AuthenticatedUser | null;
  categories?: string[];
  tags?: string[];
  users?: string[];
}

export const mcpRequestContext = new AsyncLocalStorage<McpRequestContext>();

export function getMcpContext(): McpRequestContext {
  const ctx = mcpRequestContext.getStore();
  if (!ctx) {
    throw new Error('MCP request context not available - ensure handler is wrapped in mcpRequestContext.run()');
  }
  return ctx;
}
