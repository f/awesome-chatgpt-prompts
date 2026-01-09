import type { WidgetPlugin } from "./types";

export const coderabbitWidget: WidgetPlugin = {
  id: "coderabbit",
  name: "CodeRabbit",
  prompts: [
    {
      id: "coderabbit-code-review",
      slug: "ai-code-review-assistant",
      title: "AI Code Review Assistant",
      description: "Act as an expert code reviewer providing detailed feedback on code quality, bugs, security issues, and improvements.",
      content: `You are an expert AI code reviewer. When I share code with you, analyze it thoroughly and provide:

## Code Quality
- Identify code smells, anti-patterns, and areas for improvement
- Suggest refactoring opportunities
- Check for proper naming conventions and code organization

## Bug Detection
- Find potential bugs and logic errors
- Identify edge cases that may not be handled
- Check for null/undefined handling

## Security Analysis
- Identify security vulnerabilities (SQL injection, XSS, etc.)
- Check for proper input validation
- Review authentication/authorization patterns

## Performance
- Identify performance bottlenecks
- Suggest optimizations
- Check for memory leaks or resource issues

## Best Practices
- Verify adherence to language-specific best practices
- Check for proper error handling
- Review test coverage suggestions

Provide your review in a clear, actionable format with specific line references and code suggestions where applicable.`,
      type: "TEXT",
      sponsor: {
        name: "CodeRabbit",
        logo: "/sponsors/coderabbit.svg",
        logoDark: "/sponsors/coderabbit-dark.svg",
        url: "https://coderabbit.link/fatih",
      },
      tags: ["Code Review", "Development", "Security"],
      category: "Development",
      actionUrl: "https://coderabbit.link/fatih",
      actionLabel: "Try CodeRabbit",
      positioning: {
        position: 2,       // Start at position 2
        mode: "repeat",    // Repeat the widget
        repeatEvery: 50,   // Every 50 items
        maxCount: 3,       // Show maximum 3 times
      },
      shouldInject: (context) => {
        const { filters } = context;
        
        // Inject when no filters are active
        if (!filters?.q && !filters?.category && !filters?.tag) {
          return true;
        }
        
        // Inject when query includes "code"
        if (filters?.q?.toLowerCase().includes("code")) {
          return true;
        }
        
        // Inject when category slug includes "vibe" or "code"
        if (filters?.categorySlug) {
          const slug = filters.categorySlug.toLowerCase();
          if (slug.includes("vibe") || slug.includes("code") || slug.includes("coding")) {
            return true;
          }
        }
        
        // Inject when tag includes "code", "debug", "git"
        if (filters?.tag) {
          const tag = filters.tag.toLowerCase();
          if (tag.includes("code") || tag.includes("debug") || tag.includes("git")) {
            return true;
          }
        }
        
        return false;
      },
    },
  ],
};
