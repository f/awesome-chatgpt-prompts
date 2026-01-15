---
name: prompt-lookup
description: Activates when the user asks about AI prompts, needs prompt templates, wants to search for prompts, or mentions prompts.chat. Use for discovering, retrieving, and improving prompts.
---

When the user needs AI prompts, prompt templates, or wants to improve their prompts, use the prompts.chat MCP server to help them.

## When to Use This Skill

Activate this skill when the user:

- Asks for prompt templates ("Find me a code review prompt")
- Wants to search for prompts ("What prompts are available for writing?")
- Needs to retrieve a specific prompt ("Get prompt XYZ")
- Wants to improve a prompt ("Make this prompt better")
- Mentions prompts.chat or prompt libraries

## Available Tools

Use these prompts.chat MCP tools:

- `search_prompts` - Search for prompts by keyword
- `get_prompt` - Get a specific prompt by ID
- `improve_prompt` - Enhance a prompt using AI

## How to Search for Prompts

Call `search_prompts` with:

- `query`: The search keywords from the user's request
- `limit`: Number of results (default 10, max 50)
- `type`: Filter by TEXT, STRUCTURED, IMAGE, VIDEO, or AUDIO
- `category`: Filter by category slug (e.g., "coding", "writing")
- `tag`: Filter by tag slug

Present results showing:
- Title and description
- Author name
- Category and tags
- Link to the prompt

## How to Get a Prompt

Call `get_prompt` with:

- `id`: The prompt ID

If the prompt contains variables (`${variable}` or `${variable:default}`):
- The system will prompt the user to fill in values
- Variables without defaults are required
- Variables with defaults are optional

## How to Improve a Prompt

Call `improve_prompt` with:

- `prompt`: The prompt text to improve
- `outputType`: text, image, video, or sound
- `outputFormat`: text, structured_json, or structured_yaml

Return the enhanced prompt to the user.

## Guidelines

- Always search before suggesting the user write their own prompt
- Present search results in a readable format with links
- When improving prompts, explain what was enhanced
- Suggest relevant categories and tags when saving prompts
