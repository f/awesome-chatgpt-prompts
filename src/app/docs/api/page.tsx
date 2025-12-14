import Link from "next/link";
import { headers } from "next/headers";
import { Code, Zap, Terminal, Search, Box } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "API Documentation - prompts.chat",
  description: "MCP-first API for searching and discovering AI prompts programmatically",
};

export default async function ApiDocsPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "prompts.chat";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-2xl font-bold mb-2">API Documentation</h1>
      <p className="text-muted-foreground mb-8">
        prompts.chat provides an MCP-first API for searching and discovering AI prompts programmatically.
        Use the MCP endpoint directly with any MCP-compatible client, or make standard HTTP requests.
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10">
        {/* MCP Overview */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            MCP-First API
          </h2>
          <p className="text-muted-foreground">
            Our API is built on the{" "}
            <Link
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Model Context Protocol (MCP)
            </Link>
            , enabling seamless integration with AI assistants, IDEs, and automation tools.
            The same endpoint works for both MCP clients and traditional REST-style requests.
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground"># MCP Endpoint</p>
            <p>POST {baseUrl}/api/mcp</p>
          </div>
        </section>

        {/* Using with MCP Clients */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Using with MCP Clients
          </h2>
          <p className="text-muted-foreground">
            Add prompts.chat to your MCP client configuration:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`{
  "mcpServers": {
    "prompts-chat": {
      "url": "${baseUrl}/api/mcp"
    }
  }
}`}</pre>
          </div>
          <p className="text-muted-foreground">
            Compatible with Claude Desktop, Cursor, Windsurf, and other MCP-enabled tools.
          </p>
        </section>

        {/* MCP Prompts */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            MCP Prompts
          </h2>
          <p className="text-muted-foreground">
            All public prompts are exposed as native MCP prompts. This allows MCP clients to list 
            and use prompts directly via slash commands or prompt pickers. You can filter prompts 
            by category or tag using URL query parameters.
          </p>
          
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`# Filter by users (one or more usernames)
"prompts-chat": {
  "url": "${baseUrl}/api/mcp?users=f,torvalds"
}

# Filter by categories
"prompts-chat": {
  "url": "${baseUrl}/api/mcp?categories=coding,marketing"
}

# Filter by tags
"prompts-chat": {
  "url": "${baseUrl}/api/mcp?tags=chatgpt,writing"
}

# Combine filters
"prompts-chat": {
  "url": "${baseUrl}/api/mcp?users=f&categories=coding&tags=js"
}`}</pre>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-3">
            <div>
              <p className="font-medium">prompts/list</p>
              <p className="text-muted-foreground">Browse all available prompts with pagination support.</p>
            </div>
            <div>
              <p className="font-medium">prompts/get</p>
              <p className="text-muted-foreground">
                Retrieve a prompt by ID. Variables ({"${name}"} or {"${name:default}"}) are automatically 
                substituted with provided arguments.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`# List prompts
curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{"jsonrpc": "2.0", "id": 1, "method": "prompts/list"}'

# Get a specific prompt with arguments
curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "prompts/get",
    "params": {
      "name": "code-review-assistant",
      "arguments": { "topic": "AI safety" }
    }
  }'`}</pre>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Box className="h-5 w-5" />
            Available Tools
          </h2>

          {/* search_prompts Tool */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              search_prompts
            </h3>
            <p className="text-muted-foreground">
              Search for AI prompts by keyword. Returns matching prompts with title, description, 
              content, author, category, and tags.
            </p>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Parameter</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[80px]">Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">query</TableCell>
                    <TableCell className="text-muted-foreground text-xs">string</TableCell>
                    <TableCell className="text-xs">Yes</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Search query to find relevant prompts</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">limit</TableCell>
                    <TableCell className="text-muted-foreground text-xs">number</TableCell>
                    <TableCell className="text-xs">No</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Maximum results (default: 10, max: 50)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">type</TableCell>
                    <TableCell className="text-muted-foreground text-xs">string</TableCell>
                    <TableCell className="text-xs">No</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      Filter by type: <code className="text-xs">TEXT</code>, <code className="text-xs">STRUCTURED</code>, <code className="text-xs">IMAGE</code>, <code className="text-xs">VIDEO</code>, <code className="text-xs">AUDIO</code>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">category</TableCell>
                    <TableCell className="text-muted-foreground text-xs">string</TableCell>
                    <TableCell className="text-xs">No</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Filter by category slug</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">tag</TableCell>
                    <TableCell className="text-muted-foreground text-xs">string</TableCell>
                    <TableCell className="text-xs">No</TableCell>
                    <TableCell className="text-muted-foreground text-sm">Filter by tag slug</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* get_prompt Tool */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Box className="h-4 w-4" />
              get_prompt
            </h3>
            <p className="text-muted-foreground">
              Get a prompt by ID. If the prompt contains template variables (like {"${variable}"} or {"${variable:default}"}), 
              the MCP client will be asked to provide values through elicitation.
            </p>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Parameter</TableHead>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead className="w-[80px]">Required</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-mono text-xs">id</TableCell>
                    <TableCell className="text-muted-foreground text-xs">string</TableCell>
                    <TableCell className="text-xs">Yes</TableCell>
                    <TableCell className="text-muted-foreground text-sm">The ID of the prompt to retrieve</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Variable Elicitation</p>
              <p className="text-muted-foreground">
                When a prompt contains variables like {"${name}"} or {"${topic:default value}"}, MCP clients 
                that support elicitation will prompt the user to fill in these values. Variables with 
                default values (after the colon) are optional. The prompt content will be returned with 
                variables replaced.
              </p>
            </div>
          </div>
        </section>

        {/* MCP Protocol Example */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5" />
            MCP Protocol Examples
          </h2>

          <div className="space-y-3">
            <h3 className="font-medium">Initialize Connection</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": { "name": "my-app", "version": "1.0.0" }
    }
  }'`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">List Available Tools</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Search Prompts</h3>
            <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`curl -X POST ${baseUrl}/api/mcp \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json, text/event-stream" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_prompts",
      "arguments": {
        "query": "code review",
        "limit": 5
      }
    }
  }'`}</pre>
            </div>
          </div>
        </section>

        {/* Response Format */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Response Format</h2>
          <p className="text-muted-foreground">
            The <code className="bg-muted px-1.5 py-0.5 rounded text-sm">search_prompts</code> tool returns results in the following format:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`{
  "query": "code review",
  "count": 2,
  "prompts": [
    {
      "id": "abc123",
      "title": "Code Review Assistant",
      "description": "A prompt for conducting thorough code reviews",
      "content": "You are an expert code reviewer...",
      "type": "TEXT",
      "author": "username",
      "category": "Development",
      "tags": ["coding", "review", "development"],
      "votes": 42,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}`}</pre>
          </div>
        </section>

        {/* REST API Alternative */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">REST API Alternative</h2>
          <p className="text-muted-foreground">
            For simpler integrations, you can also use the standard REST endpoint:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`# Search prompts via REST
curl "${baseUrl}/api/prompts?q=code+review&perPage=10"

# Get prompt by ID
curl "${baseUrl}/api/prompts/{id}"`}</pre>
          </div>
        </section>

        {/* Server Info */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Server Information</h2>
          <p className="text-muted-foreground">
            Get MCP server information and available tools:
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm">
            <p>GET {baseUrl}/api/mcp</p>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Rate Limits</h2>
          <p className="text-muted-foreground">
            The API is public and free to use. Please be respectful with request frequency.
            For high-volume usage, consider{" "}
            <Link
              href="/docs/self-hosting"
              className="underline hover:text-foreground"
            >
              self-hosting your own instance
            </Link>
            .
          </p>
        </section>

        {/* Support */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-muted-foreground">
            For issues and feature requests, please open a{" "}
            <Link
              href="https://github.com/f/awesome-chatgpt-prompts/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              GitHub Issue
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
