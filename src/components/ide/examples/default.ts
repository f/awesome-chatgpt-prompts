import { builder, templates } from 'prompts.chat';

// Create a prompt using the fluent builder API
const prompt = builder()
  .role("Senior TypeScript Developer")
  .context("You are helping review code for a startup")
  .task("Analyze the following code for bugs and improvements")
  .constraints([
    "Be concise and actionable",
    "Focus on critical issues first",
    "Suggest modern TypeScript best practices"
  ])
  .output("JSON with { bugs: [], suggestions: [], rating: number }")
  .variable("code", { required: true, description: "The code to review" })
  .build();

// Or use pre-built templates
const translatePrompt = templates.translation("English", "Spanish").build();

export default {
  json: prompt,
  yaml: prompt,
  markdown: prompt.content,
};
