/**
 * Utilities for parsing and serializing multi-file skill content.
 * Files are stored in a single text field with a special separator format
 * using ASCII control characters:
 * 
 * file 1 content
 * \x1FFILE:filename.ext\x1E
 * file 2 content
 * \x1FFILE:another-file.md\x1E
 * file 3 content
 * 
 * \x1F (ASCII 31, Unit Separator) and \x1E (ASCII 30, Record Separator)
 * are control characters designed for data delimiting that cannot appear
 * in normal text content, making them injection-proof.
 */

export interface SkillFile {
  filename: string;
  content: string;
}

// Separator uses ASCII control characters:
// \x1F (Unit Separator, ASCII 31) marks start
// \x1E (Record Separator, ASCII 30) marks end
// These cannot appear in normal text content, making injection impossible
const FILE_SEPARATOR_REGEX = /\x1FFILE:(.+?)\x1E/g;
const FILE_SEPARATOR_TEMPLATE = (filename: string) => `\x1FFILE:${filename}\x1E`;

// Default file that cannot be deleted
export const DEFAULT_SKILL_FILE = "SKILL.md";

// Default content for a new skill
export const DEFAULT_SKILL_CONTENT = `---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---

# My Skill

Describe what this skill does and how the agent should use it.

## Instructions

- Step 1: ...
- Step 2: ...
`;

/**
 * Parse a serialized multi-file content string into an array of SkillFile objects.
 * The first chunk is always SKILL.md if no explicit filename is found.
 */
export function parseSkillFiles(content: string): SkillFile[] {
  if (!content || content.trim() === "") {
    return [{ filename: DEFAULT_SKILL_FILE, content: DEFAULT_SKILL_CONTENT }];
  }

  const files: SkillFile[] = [];
  const parts = content.split(FILE_SEPARATOR_REGEX);

  // First part is always content (before any separator)
  // Then alternating: filename, content, filename, content...
  
  if (parts.length === 1) {
    // No separators found - single file (SKILL.md)
    return [{ filename: DEFAULT_SKILL_FILE, content: parts[0].trim() }];
  }

  // First content chunk belongs to SKILL.md
  files.push({ filename: DEFAULT_SKILL_FILE, content: parts[0].trim() });

  // Process remaining parts (filename, content pairs)
  for (let i = 1; i < parts.length; i += 2) {
    const filename = parts[i];
    const fileContent = (parts[i + 1] || "").trim();
    
    if (filename && filename !== DEFAULT_SKILL_FILE) {
      files.push({ filename, content: fileContent });
    }
  }

  return files;
}

/**
 * Serialize an array of SkillFile objects into a single content string.
 * SKILL.md content comes first, followed by other files with separators.
 */
export function serializeSkillFiles(files: SkillFile[]): string {
  if (files.length === 0) {
    return DEFAULT_SKILL_CONTENT;
  }

  // Find SKILL.md - it should always be first
  const skillFile = files.find(f => f.filename === DEFAULT_SKILL_FILE);
  const otherFiles = files.filter(f => f.filename !== DEFAULT_SKILL_FILE);

  let result = skillFile?.content || DEFAULT_SKILL_CONTENT;

  // Append other files with separators
  for (const file of otherFiles) {
    result += `\n${FILE_SEPARATOR_TEMPLATE(file.filename)}\n${file.content}`;
  }

  return result;
}

/**
 * Get the language for Monaco editor based on file extension
 */
export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  
  const languageMap: Record<string, string> = {
    // Markdown
    md: "markdown",
    mdx: "markdown",
    // JavaScript/TypeScript
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",
    // Web
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    less: "less",
    // Data
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    toml: "toml",
    // Shell/Config
    sh: "shell",
    bash: "shell",
    zsh: "shell",
    fish: "shell",
    env: "shell",
    // Python
    py: "python",
    pyw: "python",
    // Ruby
    rb: "ruby",
    // Go
    go: "go",
    // Rust
    rs: "rust",
    // C/C++
    c: "c",
    h: "c",
    cpp: "cpp",
    hpp: "cpp",
    cc: "cpp",
    // Java/Kotlin
    java: "java",
    kt: "kotlin",
    kts: "kotlin",
    // C#
    cs: "csharp",
    // PHP
    php: "php",
    // Swift
    swift: "swift",
    // SQL
    sql: "sql",
    // GraphQL
    graphql: "graphql",
    gql: "graphql",
    // Docker
    dockerfile: "dockerfile",
    // Misc
    txt: "plaintext",
    log: "plaintext",
    gitignore: "plaintext",
    editorconfig: "ini",
    ini: "ini",
    cfg: "ini",
    conf: "ini",
  };

  // Handle special filenames
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename === "dockerfile" || lowerFilename.startsWith("dockerfile.")) {
    return "dockerfile";
  }
  if (lowerFilename === "makefile" || lowerFilename === "gnumakefile") {
    return "makefile";
  }

  return languageMap[ext] || "plaintext";
}

// Validation error codes for translation
export type FilenameValidationError = 
  | "filenameEmpty"
  | "filenameInvalidChars"
  | "pathStartEndSlash"
  | "pathConsecutiveSlashes"
  | "pathContainsDotDot"
  | "filenameReserved"
  | "filenameDuplicate"
  | "pathTooLong";

/**
 * Validate a filename/path for the skill file system.
 * Allows directory paths like `src/utils/helper.ts`
 * Returns an error code for translation, or null if valid.
 */
export function validateFilename(filename: string, existingFiles: string[]): FilenameValidationError | null {
  if (!filename || filename.trim() === "") {
    return "filenameEmpty";
  }

  const trimmed = filename.trim();

  // Check for invalid characters (allow forward slashes for directories)
  if (/[<>:"|?*\\]/.test(trimmed)) {
    return "filenameInvalidChars";
  }

  // Check for problematic path patterns
  if (trimmed.startsWith("/") || trimmed.endsWith("/")) {
    return "pathStartEndSlash";
  }
  if (trimmed.includes("//")) {
    return "pathConsecutiveSlashes";
  }
  if (trimmed.includes("..")) {
    return "pathContainsDotDot";
  }

  // Check for reserved name
  if (trimmed === DEFAULT_SKILL_FILE) {
    return "filenameReserved";
  }

  // Check for duplicates
  if (existingFiles.some(f => f.toLowerCase() === trimmed.toLowerCase())) {
    return "filenameDuplicate";
  }

  // Check length
  if (trimmed.length > 200) {
    return "pathTooLong";
  }

  return null;
}

/**
 * Get a suggested filename based on common patterns
 */
export function suggestFilename(existingFiles: string[]): string {
  const suggestions = [
    "README.md",
    "config.json",
    "schema.json",
    "template.md",
    "example.ts",
    "utils.ts",
    "types.ts",
    "constants.ts",
  ];

  for (const suggestion of suggestions) {
    if (!existingFiles.some(f => f.toLowerCase() === suggestion.toLowerCase())) {
      return suggestion;
    }
  }

  // Generate a unique name
  let counter = 1;
  while (existingFiles.some(f => f.toLowerCase() === `file${counter}.md`)) {
    counter++;
  }
  return `file${counter}.md`;
}
