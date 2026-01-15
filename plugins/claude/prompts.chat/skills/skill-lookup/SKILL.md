---
name: skill-lookup
description: Activates when the user asks about Agent Skills, wants to find reusable AI capabilities, needs to install skills, or mentions skills for Claude. Use for discovering, retrieving, and installing skills.
---

When the user needs Agent Skills, wants to extend Claude's capabilities, or is looking for reusable AI agent components, use the prompts.chat MCP server.

## When to Use This Skill

Activate this skill when the user:

- Asks for Agent Skills ("Find me a code review skill")
- Wants to search for skills ("What skills are available for testing?")
- Needs to retrieve a specific skill ("Get skill XYZ")
- Wants to install a skill ("Install the documentation skill")
- Mentions extending Claude's capabilities with skills

## Available Tools

Use these prompts.chat MCP tools:

- `search_skills` - Search for skills by keyword
- `get_skill` - Get a specific skill by ID with all its files

## How to Search for Skills

Call `search_skills` with:

- `query`: The search keywords from the user's request
- `limit`: Number of results (default 10, max 50)
- `category`: Filter by category slug (e.g., "coding", "automation")
- `tag`: Filter by tag slug

Present results showing:
- Title and description
- Author name
- File list (SKILL.md, reference docs, scripts)
- Category and tags
- Link to the skill

## How to Get a Skill

Call `get_skill` with:

- `id`: The skill ID

Returns the skill metadata and all file contents:
- SKILL.md (main instructions)
- Reference documentation
- Helper scripts
- Configuration files

## How to Install a Skill

When the user asks to install a skill:

1. Call `get_skill` to retrieve all files
2. Create the directory `.claude/skills/{slug}/`
3. Save each file to the appropriate location:
   - `SKILL.md` → `.claude/skills/{slug}/SKILL.md`
   - Other files → `.claude/skills/{slug}/{filename}`

## Skill Structure

Skills contain:
- **SKILL.md** (required) - Main instructions with frontmatter
- **Reference docs** - Additional documentation files
- **Scripts** - Helper scripts (Python, shell, etc.)
- **Config files** - JSON, YAML configurations

## Guidelines

- Always search before suggesting the user create their own skill
- Present search results in a readable format with file counts
- When installing, confirm the skill was saved successfully
- Explain what the skill does and when it activates
