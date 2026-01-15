---
description: Search and discover AI prompts from prompts.chat
argument-hint: <query> [--type TYPE] [--category CATEGORY] [--tag TAG]
---

# /prompts.chat:prompts

Search for AI prompts on prompts.chat to find the perfect prompt for your task.

## Usage

```
/prompts.chat:prompts <query>
/prompts.chat:prompts <query> --type IMAGE
/prompts.chat:prompts <query> --category coding
/prompts.chat:prompts <query> --tag productivity
```

- **query**: Keywords to search for (required)
- **--type**: Filter by type (TEXT, STRUCTURED, IMAGE, VIDEO, AUDIO)
- **--category**: Filter by category slug
- **--tag**: Filter by tag slug

## Examples

```
/prompts.chat:prompts code review
/prompts.chat:prompts writing assistant --category writing
/prompts.chat:prompts midjourney --type IMAGE
/prompts.chat:prompts react developer --tag coding
/prompts.chat:prompts data analysis --category productivity
```

## How It Works

1. Calls `search_prompts` with your query and optional filters
2. Returns matching prompts with title, description, author, and tags
3. Each result includes a link to view/copy the full prompt on prompts.chat

## Getting a Specific Prompt

After finding a prompt you like, use its ID to get the full content:

```
/prompts.chat:prompts get <prompt-id>
```

This will retrieve the prompt and prompt you to fill in any variables.

## Saving Prompts

To save a prompt to your prompts.chat account (requires API key):

```
/prompts.chat:prompts save "My Prompt Title" --content "Your prompt content here..."
```

## Improving Prompts

To enhance a prompt using AI:

```
/prompts.chat:prompts improve "Write a story about..."
```

This transforms basic prompts into well-structured, comprehensive ones.
