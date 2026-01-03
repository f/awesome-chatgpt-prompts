export interface EmbedExampleConfig {
  prompt: string;
  context: string;
  model: string;
  mode: string;
  thinking: boolean;
  reasoning: boolean;
  planning: boolean;
  fast: boolean;
  filetree: string;
  showFiletree: boolean;
  showDiff: boolean;
  diffFilename?: string;
  diffOldText?: string;
  diffNewText?: string;
  flashButton?: string;
  lightColor: string;
  darkColor: string;
  themeMode?: "auto" | "light" | "dark";
  mcpTools?: string;
  showMcpTools?: boolean;
}

export interface EmbedExample {
  value: string;
  label: string;
  category: string;
  config: Partial<EmbedExampleConfig>;
}

export const EMBED_EXAMPLES: EmbedExample[] = [
  // Coding Examples
  {
    value: "vibe-coding",
    label: "Vibe Coding",
    category: "Coding",
    config: {
      prompt: `Create a React hook called useDebounce that:\n- Takes a value and delay as parameters\n- Returns the debounced value\n- Properly cleans up the timeout\n- Is fully typed with TypeScript`,
      context: "hooks/useDebounce.ts, @codebase",
      model: "Claude 4.5 Sonnet",
      mode: "code",
      thinking: true,
      filetree: "src/\nsrc/hooks/\nsrc/hooks/useDebounce.ts\nsrc/hooks/useLocalStorage.ts\nsrc/components/\nsrc/components/SearchInput.tsx",
      showFiletree: true,
      showDiff: false,
      lightColor: "#8b5cf6",
      darkColor: "#a78bfa",
    },
  },
  {
    value: "vibe-coding-diff",
    label: "Vibe Coding with Diff",
    category: "Coding",
    config: {
      prompt: `Refactor this component to use the new useDebounce hook for the search input.`,
      context: "SearchInput.tsx, hooks/useDebounce.ts",
      model: "Claude 4.5 Sonnet",
      mode: "code",
      thinking: true,
      filetree: "src/\nsrc/hooks/\nsrc/hooks/useDebounce.ts\nsrc/components/\nsrc/components/SearchInput.tsx",
      showFiletree: true,
      showDiff: true,
      diffFilename: "SearchInput.tsx",
      diffOldText: "const [query, setQuery] = useState('');\n\nuseEffect(() => {\n  fetchResults(query);\n}, [query]);",
      diffNewText: "const [query, setQuery] = useState('');\nconst debouncedQuery = useDebounce(query, 300);\n\nuseEffect(() => {\n  fetchResults(debouncedQuery);\n}, [debouncedQuery]);",
      flashButton: "accept",
      lightColor: "#8b5cf6",
      darkColor: "#a78bfa",
    },
  },
  {
    value: "api-integration",
    label: "API Integration",
    category: "Coding",
    config: {
      prompt: `Create a type-safe API client for a REST endpoint:\n- GET /users - list all users\n- POST /users - create user\n- GET /users/:id - get user by id\n- PUT /users/:id - update user\n- DELETE /users/:id - delete user\n\nUse fetch with proper error handling and TypeScript types.`,
      context: "api/client.ts, @types",
      model: "GPT-5",
      mode: "code",
      thinking: true,
      reasoning: true,
      filetree: "src/\nsrc/api/\nsrc/api/client.ts\nsrc/api/types.ts\nsrc/hooks/\nsrc/hooks/useUsers.ts",
      showFiletree: true,
      showDiff: false,
      lightColor: "#3b82f6",
      darkColor: "#60a5fa",
    },
  },
  {
    value: "debugging",
    label: "Debug Session",
    category: "Coding",
    config: {
      prompt: `This React component causes an infinite re-render loop. Find and fix the bug:\n\nconst UserProfile = ({ userId }) => {\n  const [user, setUser] = useState(null);\n  \n  useEffect(() => {\n    fetchUser(userId).then(setUser);\n  });\n  \n  return <div>{user?.name}</div>;\n};`,
      context: "components/UserProfile.tsx",
      model: "Claude 4.5 Sonnet",
      mode: "code",
      thinking: true,
      showFiletree: false,
      showDiff: true,
      diffFilename: "UserProfile.tsx",
      diffOldText: "useEffect(() => {\n  fetchUser(userId).then(setUser);\n});",
      diffNewText: "useEffect(() => {\n  fetchUser(userId).then(setUser);\n}, [userId]);",
      flashButton: "accept",
      lightColor: "#ef4444",
      darkColor: "#f87171",
    },
  },

  // Chat Examples
  {
    value: "chatgpt",
    label: "ChatGPT Style",
    category: "Chat",
    config: {
      prompt: `Explain the concept of closures in JavaScript with practical examples. Include:\n- What closures are\n- How they work\n- Common use cases\n- Potential pitfalls`,
      context: "",
      model: "GPT-4o",
      mode: "chat",
      thinking: false,
      showFiletree: false,
      showDiff: false,
      lightColor: "#10b981",
      darkColor: "#34d399",
      themeMode: "light" as const,
    },
  },
  {
    value: "claude",
    label: "Claude Style",
    category: "Chat",
    config: {
      prompt: `Help me write a professional email to decline a job offer while keeping the door open for future opportunities.\n\nContext:\n- Received offer from TechCorp as Senior Engineer\n- Great team and compensation, but role doesn't align with my career goals\n- Want to maintain good relationship with the hiring manager Sarah\n- Interested in their upcoming ML team expansion next year\n\nKeep it warm but professional, around 150-200 words.`,
      context: "",
      model: "Claude 4.5 Sonnet",
      mode: "ask",
      reasoning: true,
      showFiletree: false,
      showDiff: false,
      lightColor: "#f97316",
      darkColor: "#fb923c",
    },
  },
  {
    value: "gemini",
    label: "Gemini Style",
    category: "Chat",
    config: {
      prompt: `Compare and contrast microservices vs monolithic architecture. Create a decision matrix for when to use each approach based on:\n- Team size\n- Project complexity\n- Scaling requirements\n- Development speed\n- Maintenance costs`,
      context: "",
      model: "Gemini 2.5 Pro",
      mode: "chat",
      thinking: true,
      reasoning: true,
      showFiletree: false,
      showDiff: false,
      lightColor: "#4285f4",
      darkColor: "#8ab4f8",
    },
  },

  // Planning Examples
  {
    value: "project-planning",
    label: "Project Planning",
    category: "Planning",
    config: {
      prompt: `I want to build a real-time collaborative whiteboard app like Miro. Help me plan the architecture and break it down into phases:\n\nRequirements:\n- Real-time collaboration (multiple users)\n- Drawing tools (pen, shapes, text)\n- Infinite canvas with zoom/pan\n- Export to PNG/PDF\n- User authentication\n\nTech preferences: React, Node.js, WebSockets`,
      context: "@web",
      model: "GPT-5",
      mode: "plan",
      thinking: true,
      planning: true,
      showFiletree: false,
      showDiff: false,
      lightColor: "#8b5cf6",
      darkColor: "#a78bfa",
    },
  },
  {
    value: "code-review",
    label: "Code Review",
    category: "Planning",
    config: {
      prompt: `Review this pull request for a payment processing module. Check for:\n- Security vulnerabilities\n- Error handling\n- Performance issues\n- Code style consistency\n- Test coverage gaps`,
      context: "@pr #142, @codebase",
      model: "Claude 4.5 Sonnet",
      mode: "ask",
      thinking: true,
      reasoning: true,
      showFiletree: true,
      filetree: "src/\nsrc/payments/\nsrc/payments/processor.ts\nsrc/payments/validation.ts\nsrc/payments/__tests__/",
      showDiff: false,
      lightColor: "#f59e0b",
      darkColor: "#fbbf24",
    },
  },

  // Research Examples
  {
    value: "research",
    label: "Research Assistant",
    category: "Research",
    config: {
      prompt: `I'm researching the latest advancements in transformer architectures for my ML thesis. Summarize the key innovations since the original "Attention is All You Need" paper, focusing on:\n- Efficiency improvements (sparse attention, linear attention)\n- Architectural variations (encoder-only, decoder-only)\n- Notable models and their contributions\n- Current state-of-the-art benchmarks`,
      context: "@web",
      model: "GPT-5",
      mode: "ask",
      thinking: true,
      reasoning: true,
      showFiletree: false,
      showDiff: false,
      lightColor: "#06b6d4",
      darkColor: "#22d3ee",
    },
  },
  {
    value: "learning",
    label: "Learning Mode",
    category: "Research",
    config: {
      prompt: `Teach me about database indexing as if I'm a junior developer. Cover:\n1. What indexes are and why they matter\n2. B-tree vs Hash indexes\n3. When to add indexes\n4. Common indexing mistakes\n\nUse simple analogies and include a practical PostgreSQL example.`,
      context: "",
      model: "Claude 4.5 Sonnet",
      mode: "chat",
      thinking: false,
      reasoning: true,
      showFiletree: false,
      showDiff: false,
      lightColor: "#ec4899",
      darkColor: "#f472b6",
      themeMode: "dark" as const,
    },
  },

  // Quick Actions
  {
    value: "quick-refactor",
    label: "Quick Refactor",
    category: "Quick Actions",
    config: {
      prompt: `Convert this callback-based function to use async/await with proper error handling.`,
      context: "utils/api.js",
      model: "GPT-4o",
      mode: "code",
      fast: true,
      showFiletree: false,
      showDiff: true,
      diffFilename: "api.js",
      diffOldText: "function fetchData(url, callback) {\n  fetch(url)\n    .then(res => res.json())\n    .then(data => callback(null, data))\n    .catch(err => callback(err));\n}",
      diffNewText: "async function fetchData(url) {\n  try {\n    const res = await fetch(url);\n    return await res.json();\n  } catch (err) {\n    throw new Error(`Failed to fetch: ${err.message}`);\n  }\n}",
      flashButton: "accept",
      lightColor: "#22c55e",
      darkColor: "#4ade80",
    },
  },
  {
    value: "quick-test",
    label: "Generate Tests",
    category: "Quick Actions",
    config: {
      prompt: `Generate unit tests for this utility function using Jest. Cover edge cases.`,
      context: "utils/formatDate.ts",
      model: "Claude 4.5 Sonnet",
      mode: "code",
      fast: true,
      filetree: "src/\nsrc/utils/\nsrc/utils/formatDate.ts\nsrc/utils/__tests__/\nsrc/utils/__tests__/formatDate.test.ts",
      showFiletree: true,
      showDiff: false,
      lightColor: "#14b8a6",
      darkColor: "#2dd4bf",
    },
  },

  // MCP Tools Examples
  {
    value: "mcp-github",
    label: "GitHub Integration",
    category: "MCP Tools",
    config: {
      prompt: `Create a new GitHub issue for the bug we discussed. Include:\n- Title: "Login redirect fails on mobile Safari"\n- Labels: bug, high-priority\n- Assignee: @frontend-team\n- Description with reproduction steps`,
      context: "@github",
      model: "Claude 4.5 Sonnet",
      mode: "code",
      thinking: true,
      showFiletree: false,
      showDiff: false,
      mcpTools: "github:create_issue\ngithub:add_labels\ngithub:assign_issue",
      showMcpTools: true,
      lightColor: "#8b5cf6",
      darkColor: "#a78bfa",
    },
  },
  {
    value: "mcp-filesystem",
    label: "File Operations",
    category: "MCP Tools",
    config: {
      prompt: `Read the configuration file, update the API endpoint to production, and save it back.`,
      context: "config/settings.json",
      model: "GPT-5",
      mode: "code",
      thinking: true,
      filetree: "config/\nconfig/settings.json\nconfig/settings.dev.json\nconfig/settings.prod.json",
      showFiletree: true,
      showDiff: false,
      mcpTools: "filesystem:read_file\nfilesystem:write_file\nfilesystem:list_directory",
      showMcpTools: true,
      lightColor: "#f59e0b",
      darkColor: "#fbbf24",
    },
  },
  {
    value: "mcp-database",
    label: "Database Query",
    category: "MCP Tools",
    config: {
      prompt: `Find all users who signed up in the last 30 days but haven't completed onboarding. Export their emails for a re-engagement campaign.`,
      context: "@database",
      model: "GPT-5",
      mode: "ask",
      thinking: true,
      reasoning: true,
      showFiletree: false,
      showDiff: false,
      mcpTools: "postgres:query\npostgres:list_tables\ncsv:export",
      showMcpTools: true,
      lightColor: "#06b6d4",
      darkColor: "#22d3ee",
    },
  },
  {
    value: "mcp-multi-tool",
    label: "Multi-Tool Workflow",
    category: "MCP Tools",
    config: {
      prompt: `Search our codebase for deprecated API calls, create a tracking issue on GitHub, and send a Slack notification to the team.`,
      context: "@codebase",
      model: "Claude 4.5 Sonnet",
      mode: "plan",
      thinking: true,
      planning: true,
      showFiletree: false,
      showDiff: false,
      mcpTools: "github:search_code\ngithub:create_issue\nslack:send_message\nfilesystem:read_file",
      showMcpTools: true,
      lightColor: "#ec4899",
      darkColor: "#f472b6",
    },
  },

  // Image Generation Examples
  {
    value: "nano-banana",
    label: "Nano Banana Pro",
    category: "Image & Video",
    config: {
      prompt: `Generate a hyper-realistic image of a tiny banana the size of a grain of rice, sitting on a human fingertip. The banana should have perfect miniature details - tiny brown spots, a small stem, and realistic texture. Soft studio lighting, macro photography style, shallow depth of field.`,
      context: "##image, #style:photorealistic",
      model: "🍌 Nano Banana Pro",
      mode: "chat",
      thinking: false,
      showFiletree: false,
      showDiff: false,
      lightColor: "#fbbf24",
      darkColor: "#fcd34d",
    },
  },
  {
    value: "veo-video",
    label: "Veo 3.1 Video",
    category: "Image & Video",
    config: {
      prompt: `Create a smooth 5-second video transition between these two frames. The camera should slowly pan from left to right while the lighting gradually shifts from warm sunset tones to cool twilight. Add subtle particle effects floating through the air.`,
      context: "##image:First Frame, ##image:Last Frame",
      model: "Veo 3.1",
      mode: "chat",
      thinking: false,
      showFiletree: false,
      showDiff: false,
      lightColor: "#ef4444",
      darkColor: "#f87171",
    },
  },
];
