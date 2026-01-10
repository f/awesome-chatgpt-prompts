export interface Chapter {
  slug: string;
  title: string;
  part: string;
  partNumber: number;
  chapterNumber: number;
  description?: string;
}

export interface Part {
  number: number;
  title: string;
  slug: string;
  chapters: Chapter[];
}

export const parts: Part[] = [
  {
    number: 0,
    title: "Introduction",
    slug: "introduction",
    chapters: [
      { slug: "00a-preface", title: "Preface", part: "Introduction", partNumber: 0, chapterNumber: 0, description: "A personal note from the author" },
      { slug: "00b-history", title: "History", part: "Introduction", partNumber: 0, chapterNumber: 1, description: "The story of Awesome ChatGPT Prompts" },
      { slug: "00c-introduction", title: "Introduction", part: "Introduction", partNumber: 0, chapterNumber: 2, description: "What is prompt engineering and why it matters" },
    ],
  },
  {
    number: 1,
    title: "Foundations",
    slug: "part-i-foundations",
    chapters: [
      { slug: "01-understanding-ai-models", title: "Understanding AI Models", part: "Foundations", partNumber: 1, chapterNumber: 1, description: "How large language models work" },
      { slug: "02-anatomy-of-effective-prompt", title: "Anatomy of an Effective Prompt", part: "Foundations", partNumber: 1, chapterNumber: 2, description: "Components that make prompts work" },
      { slug: "03-core-prompting-principles", title: "Core Prompting Principles", part: "Foundations", partNumber: 1, chapterNumber: 3, description: "Fundamental principles for better prompts" },
    ],
  },
  {
    number: 2,
    title: "Techniques",
    slug: "part-ii-techniques",
    chapters: [
      { slug: "04-role-based-prompting", title: "Role-Based Prompting", part: "Techniques", partNumber: 2, chapterNumber: 4, description: "Using personas and roles effectively" },
      { slug: "05-structured-output", title: "Structured Output", part: "Techniques", partNumber: 2, chapterNumber: 5, description: "Getting consistent, formatted responses" },
      { slug: "06-chain-of-thought", title: "Chain of Thought", part: "Techniques", partNumber: 2, chapterNumber: 6, description: "Step-by-step reasoning for complex tasks" },
      { slug: "07-few-shot-learning", title: "Few-Shot Learning", part: "Techniques", partNumber: 2, chapterNumber: 7, description: "Teaching by example" },
      { slug: "08-iterative-refinement", title: "Iterative Refinement", part: "Techniques", partNumber: 2, chapterNumber: 8, description: "Improving prompts through iteration" },
      { slug: "09-json-yaml-prompting", title: "JSON & YAML Prompting", part: "Techniques", partNumber: 2, chapterNumber: 9, description: "Structured data formats in prompts" },
    ],
  },
  {
    number: 3,
    title: "Use Cases",
    slug: "part-iii-use-cases",
    chapters: [
      { slug: "10-writing-content", title: "Writing & Content", part: "Use Cases", partNumber: 3, chapterNumber: 10, description: "Content creation and copywriting" },
      { slug: "11-programming-development", title: "Programming & Development", part: "Use Cases", partNumber: 3, chapterNumber: 11, description: "Code generation and debugging" },
      { slug: "12-education-learning", title: "Education & Learning", part: "Use Cases", partNumber: 3, chapterNumber: 12, description: "Teaching and learning applications" },
      { slug: "13-business-productivity", title: "Business & Productivity", part: "Use Cases", partNumber: 3, chapterNumber: 13, description: "Professional and workplace applications" },
      { slug: "14-creative-arts", title: "Creative Arts", part: "Use Cases", partNumber: 3, chapterNumber: 14, description: "Artistic and creative applications" },
      { slug: "15-research-analysis", title: "Research & Analysis", part: "Use Cases", partNumber: 3, chapterNumber: 15, description: "Data analysis and research tasks" },
    ],
  },
  {
    number: 4,
    title: "Advanced Strategies",
    slug: "part-iv-advanced",
    chapters: [
      { slug: "16-system-prompts-personas", title: "System Prompts & Personas", part: "Advanced", partNumber: 4, chapterNumber: 16, description: "Creating consistent AI personalities" },
      { slug: "17-prompt-chaining", title: "Prompt Chaining", part: "Advanced", partNumber: 4, chapterNumber: 17, description: "Connecting multiple prompts" },
      { slug: "18-handling-edge-cases", title: "Handling Edge Cases", part: "Advanced", partNumber: 4, chapterNumber: 18, description: "Dealing with unexpected inputs" },
      { slug: "19-multimodal-prompting", title: "Multimodal Prompting", part: "Advanced", partNumber: 4, chapterNumber: 19, description: "Working with images, audio, and video" },
      { slug: "20-context-engineering", title: "Context Engineering", part: "Advanced", partNumber: 4, chapterNumber: 20, description: "RAG, embeddings, function calling, and MCP" },
    ],
  },
  {
    number: 5,
    title: "Best Practices",
    slug: "part-v-best-practices",
    chapters: [
      { slug: "21-common-pitfalls", title: "Common Pitfalls", part: "Best Practices", partNumber: 5, chapterNumber: 21, description: "Mistakes to avoid" },
      { slug: "22-ethics-responsible-use", title: "Ethics & Responsible Use", part: "Best Practices", partNumber: 5, chapterNumber: 22, description: "Ethical considerations in AI" },
      { slug: "23-prompt-optimization", title: "Prompt Optimization", part: "Best Practices", partNumber: 5, chapterNumber: 23, description: "Testing and improving prompts" },
    ],
  },
  {
    number: 6,
    title: "Using prompts.chat",
    slug: "part-vi-prompts-chat",
    chapters: [
      { slug: "24-getting-started", title: "Getting Started", part: "prompts.chat", partNumber: 6, chapterNumber: 24, description: "Introduction to the platform" },
      { slug: "25-browsing-using-prompts", title: "Browsing & Using Prompts", part: "prompts.chat", partNumber: 6, chapterNumber: 25, description: "Finding and using community prompts" },
      { slug: "26-contributing-prompts", title: "Contributing Prompts", part: "prompts.chat", partNumber: 6, chapterNumber: 26, description: "Sharing your prompts with the community" },
    ],
  },
  {
    number: 7,
    title: "Developer Tools",
    slug: "part-vii-developer-tools",
    chapters: [
      { slug: "27-prompt-builder-dsl", title: "Prompt Builder DSL", part: "Developer Tools", partNumber: 7, chapterNumber: 27, description: "Fluent API for building prompts" },
      { slug: "28-mcp-integration", title: "MCP Integration", part: "Developer Tools", partNumber: 7, chapterNumber: 28, description: "Model Context Protocol server" },
      { slug: "29-ai-prompt-enhancement", title: "AI Prompt Enhancement", part: "Developer Tools", partNumber: 7, chapterNumber: 29, description: "Automatic prompt improvement" },
      { slug: "30-self-hosting", title: "Self-Hosting", part: "Developer Tools", partNumber: 7, chapterNumber: 30, description: "Running your own instance" },
      { slug: "31-api-reference", title: "API Reference", part: "Developer Tools", partNumber: 7, chapterNumber: 31, description: "REST API documentation" },
      { slug: "32-variables-and-templates", title: "Variables & Templates", part: "Developer Tools", partNumber: 7, chapterNumber: 32, description: "Dynamic prompt templates" },
    ],
  },
  {
    number: 8,
    title: "Appendix",
    slug: "appendix",
    chapters: [
      { slug: "a-prompt-templates", title: "Prompt Templates", part: "Appendix", partNumber: 8, chapterNumber: 33, description: "Ready-to-use templates" },
      { slug: "b-troubleshooting", title: "Troubleshooting", part: "Appendix", partNumber: 8, chapterNumber: 34, description: "Common issues and solutions" },
      { slug: "c-glossary", title: "Glossary", part: "Appendix", partNumber: 8, chapterNumber: 35, description: "Terms and definitions" },
      { slug: "d-resources", title: "Resources", part: "Appendix", partNumber: 8, chapterNumber: 36, description: "Further reading and links" },
    ],
  },
];

export function getAllChapters(): Chapter[] {
  return parts.flatMap((part) => part.chapters);
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  return getAllChapters().find((chapter) => chapter.slug === slug);
}

export function getAdjacentChapters(slug: string): { prev?: Chapter; next?: Chapter } {
  const chapters = getAllChapters();
  const index = chapters.findIndex((chapter) => chapter.slug === slug);
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}
