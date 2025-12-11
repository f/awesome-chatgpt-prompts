## Description

<!-- Briefly describe the changes in this PR -->

## Type of Change

- [ ] New prompt(s)
- [ ] Bug fix
- [ ] Documentation update
- [ ] Other (please describe):

---

## Adding a New Prompt

If you're adding a new prompt, please ensure:

### 1. README.md Format

Add your prompt to `README.md` following this format:

```markdown
## Act as a [Role Name]

Contributed by: [@yourusername](https://github.com/yourusername)

> Your prompt text here. Use blockquote format (lines starting with >).
> Multi-line prompts should continue with > on each line.
```

### 2. Checklist for New Prompts

- [ ] Prompt title starts with "Act as a" or "Act as an"
- [ ] Contributor line includes your GitHub username with link
- [ ] Prompt content is in blockquote format (using `>`)
- [ ] Prompt is placed in alphabetical order (or at the end before Contributors section)
- [ ] Prompt is original or properly attributed
- [ ] Prompt has been tested and works as expected

### 3. Multiple Contributors

If multiple people contributed to a prompt, list them separated by commas:

```markdown
Contributed by: [@user1](https://github.com/user1), [@user2](https://github.com/user2)
```

### 4. Optional: Update prompts.csv

If you'd like to also add your prompt to `prompts.csv`, use this format:

```csv
Role Name,"Your prompt text here",FALSE,TEXT,yourusername
```

Columns: `act`, `prompt`, `for_devs` (TRUE/FALSE), `type` (TEXT/JSON/YAML), `contributor`

---

## Additional Notes

<!-- Any additional context or screenshots -->
