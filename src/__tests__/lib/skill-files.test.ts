import { describe, it, expect } from "vitest";
import {
  parseSkillFiles,
  serializeSkillFiles,
  getLanguageFromFilename,
  validateFilename,
  isValidKebabCase,
  parseSkillFrontmatter,
  validateSkillFrontmatter,
  generateSkillContentWithFrontmatter,
  suggestFilename,
  DEFAULT_SKILL_FILE,
  DEFAULT_SKILL_CONTENT,
  type SkillFile,
} from "@/lib/skill-files";

describe("parseSkillFiles", () => {
  it("returns default content for empty string", () => {
    const result = parseSkillFiles("");
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe(DEFAULT_SKILL_FILE);
    expect(result[0].content).toBe(DEFAULT_SKILL_CONTENT);
  });

  it("returns default content for whitespace-only string", () => {
    const result = parseSkillFiles("   \n\t  ");
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe(DEFAULT_SKILL_FILE);
  });

  it("parses single file content without separators", () => {
    const content = "# My Skill\n\nSome content here";
    const result = parseSkillFiles(content);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe(DEFAULT_SKILL_FILE);
    expect(result[0].content).toBe(content);
  });

  it("parses multiple files with separators", () => {
    const content = "# Main Skill\n\x1FFILE:helper.ts\x1E\nconst x = 1;\n\x1FFILE:config.json\x1E\n{}";
    const result = parseSkillFiles(content);

    expect(result).toHaveLength(3);
    expect(result[0].filename).toBe(DEFAULT_SKILL_FILE);
    expect(result[0].content).toBe("# Main Skill");
    expect(result[1].filename).toBe("helper.ts");
    expect(result[1].content).toBe("const x = 1;");
    expect(result[2].filename).toBe("config.json");
    expect(result[2].content).toBe("{}");
  });

  it("ignores SKILL.md in file separators (already handled as first file)", () => {
    const content = "# Main\n\x1FFILE:SKILL.md\x1E\nshould be ignored";
    const result = parseSkillFiles(content);

    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe(DEFAULT_SKILL_FILE);
  });

  it("handles empty file content after separator", () => {
    const content = "# Main\n\x1FFILE:empty.ts\x1E\n";
    const result = parseSkillFiles(content);

    expect(result).toHaveLength(2);
    expect(result[1].filename).toBe("empty.ts");
    expect(result[1].content).toBe("");
  });
});

describe("serializeSkillFiles", () => {
  it("returns default content for empty array", () => {
    expect(serializeSkillFiles([])).toBe(DEFAULT_SKILL_CONTENT);
  });

  it("serializes single SKILL.md file", () => {
    const files: SkillFile[] = [
      { filename: DEFAULT_SKILL_FILE, content: "# My Skill" }
    ];
    expect(serializeSkillFiles(files)).toBe("# My Skill");
  });

  it("serializes multiple files with separators", () => {
    const files: SkillFile[] = [
      { filename: DEFAULT_SKILL_FILE, content: "# Main" },
      { filename: "helper.ts", content: "const x = 1;" },
    ];
    const result = serializeSkillFiles(files);

    expect(result).toContain("# Main");
    expect(result).toContain("\x1FFILE:helper.ts\x1E");
    expect(result).toContain("const x = 1;");
  });

  it("puts SKILL.md content first regardless of array order", () => {
    const files: SkillFile[] = [
      { filename: "other.ts", content: "other" },
      { filename: DEFAULT_SKILL_FILE, content: "# Main" },
    ];
    const result = serializeSkillFiles(files);

    expect(result.startsWith("# Main")).toBe(true);
  });

  it("uses default content if SKILL.md is missing", () => {
    const files: SkillFile[] = [
      { filename: "other.ts", content: "other" }
    ];
    const result = serializeSkillFiles(files);

    expect(result.startsWith(DEFAULT_SKILL_CONTENT)).toBe(true);
  });

  it("is reversible with parseSkillFiles", () => {
    const files: SkillFile[] = [
      { filename: DEFAULT_SKILL_FILE, content: "# Main Skill" },
      { filename: "helper.ts", content: "export const x = 1;" },
      { filename: "config.json", content: '{ "key": "value" }' },
    ];

    const serialized = serializeSkillFiles(files);
    const parsed = parseSkillFiles(serialized);

    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual(files[0]);
    expect(parsed[1]).toEqual(files[1]);
    expect(parsed[2]).toEqual(files[2]);
  });
});

describe("getLanguageFromFilename", () => {
  describe("markdown files", () => {
    it("detects .md files", () => {
      expect(getLanguageFromFilename("README.md")).toBe("markdown");
      expect(getLanguageFromFilename("SKILL.md")).toBe("markdown");
    });

    it("detects .mdx files", () => {
      expect(getLanguageFromFilename("page.mdx")).toBe("markdown");
    });
  });

  describe("JavaScript/TypeScript", () => {
    it("detects JavaScript files", () => {
      expect(getLanguageFromFilename("index.js")).toBe("javascript");
      expect(getLanguageFromFilename("component.jsx")).toBe("javascript");
      expect(getLanguageFromFilename("module.mjs")).toBe("javascript");
      expect(getLanguageFromFilename("common.cjs")).toBe("javascript");
    });

    it("detects TypeScript files", () => {
      expect(getLanguageFromFilename("index.ts")).toBe("typescript");
      expect(getLanguageFromFilename("component.tsx")).toBe("typescript");
    });
  });

  describe("web languages", () => {
    it("detects HTML files", () => {
      expect(getLanguageFromFilename("index.html")).toBe("html");
      expect(getLanguageFromFilename("page.htm")).toBe("html");
    });

    it("detects CSS files", () => {
      expect(getLanguageFromFilename("styles.css")).toBe("css");
      expect(getLanguageFromFilename("styles.scss")).toBe("scss");
      expect(getLanguageFromFilename("styles.less")).toBe("less");
    });
  });

  describe("data formats", () => {
    it("detects JSON files", () => {
      expect(getLanguageFromFilename("config.json")).toBe("json");
    });

    it("detects YAML files", () => {
      expect(getLanguageFromFilename("config.yaml")).toBe("yaml");
      expect(getLanguageFromFilename("config.yml")).toBe("yaml");
    });

    it("detects XML files", () => {
      expect(getLanguageFromFilename("data.xml")).toBe("xml");
    });

    it("detects TOML files", () => {
      expect(getLanguageFromFilename("config.toml")).toBe("toml");
    });
  });

  describe("programming languages", () => {
    it("detects Python files", () => {
      expect(getLanguageFromFilename("script.py")).toBe("python");
    });

    it("detects Go files", () => {
      expect(getLanguageFromFilename("main.go")).toBe("go");
    });

    it("detects Rust files", () => {
      expect(getLanguageFromFilename("lib.rs")).toBe("rust");
    });

    it("detects Java files", () => {
      expect(getLanguageFromFilename("Main.java")).toBe("java");
    });

    it("detects C/C++ files", () => {
      expect(getLanguageFromFilename("main.c")).toBe("c");
      expect(getLanguageFromFilename("main.cpp")).toBe("cpp");
      expect(getLanguageFromFilename("header.h")).toBe("c");
    });
  });

  describe("shell and config files", () => {
    it("detects shell files", () => {
      expect(getLanguageFromFilename("script.sh")).toBe("shell");
      expect(getLanguageFromFilename("script.bash")).toBe("shell");
      expect(getLanguageFromFilename(".env")).toBe("shell");
    });

    it("detects config files", () => {
      expect(getLanguageFromFilename("settings.ini")).toBe("ini");
      expect(getLanguageFromFilename(".editorconfig")).toBe("ini");
    });
  });

  describe("special filenames", () => {
    it("detects Dockerfile", () => {
      expect(getLanguageFromFilename("Dockerfile")).toBe("dockerfile");
      expect(getLanguageFromFilename("dockerfile")).toBe("dockerfile");
      expect(getLanguageFromFilename("Dockerfile.dev")).toBe("dockerfile");
    });

    it("detects Makefile", () => {
      expect(getLanguageFromFilename("Makefile")).toBe("makefile");
      expect(getLanguageFromFilename("makefile")).toBe("makefile");
      expect(getLanguageFromFilename("GNUmakefile")).toBe("makefile");
    });
  });

  describe("unknown extensions", () => {
    it("returns plaintext for unknown extensions", () => {
      expect(getLanguageFromFilename("file.unknown")).toBe("plaintext");
      expect(getLanguageFromFilename("noextension")).toBe("plaintext");
    });

    it("returns plaintext for .txt files", () => {
      expect(getLanguageFromFilename("notes.txt")).toBe("plaintext");
    });
  });
});

describe("validateFilename", () => {
  const existingFiles = ["existing.ts", "config.json"];

  describe("empty and invalid input", () => {
    it("rejects empty filename", () => {
      expect(validateFilename("", existingFiles)).toBe("filenameEmpty");
      expect(validateFilename("   ", existingFiles)).toBe("filenameEmpty");
    });

    it("rejects invalid characters", () => {
      expect(validateFilename("file<name>.ts", existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename("file:name.ts", existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename('file"name.ts', existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename("file|name.ts", existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename("file?name.ts", existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename("file*name.ts", existingFiles)).toBe("filenameInvalidChars");
      expect(validateFilename("file\\name.ts", existingFiles)).toBe("filenameInvalidChars");
    });
  });

  describe("path validation", () => {
    it("rejects paths starting with slash", () => {
      expect(validateFilename("/src/file.ts", existingFiles)).toBe("pathStartEndSlash");
    });

    it("rejects paths ending with slash", () => {
      expect(validateFilename("src/file/", existingFiles)).toBe("pathStartEndSlash");
    });

    it("rejects consecutive slashes", () => {
      expect(validateFilename("src//file.ts", existingFiles)).toBe("pathConsecutiveSlashes");
    });

    it("rejects parent directory references", () => {
      expect(validateFilename("../file.ts", existingFiles)).toBe("pathContainsDotDot");
      expect(validateFilename("src/../file.ts", existingFiles)).toBe("pathContainsDotDot");
    });

    it("allows valid directory paths", () => {
      expect(validateFilename("src/utils/helper.ts", existingFiles)).toBeNull();
    });
  });

  describe("reserved names", () => {
    it("rejects SKILL.md as filename", () => {
      expect(validateFilename(DEFAULT_SKILL_FILE, existingFiles)).toBe("filenameReserved");
    });
  });

  describe("duplicates", () => {
    it("rejects duplicate filenames (case-insensitive)", () => {
      expect(validateFilename("existing.ts", existingFiles)).toBe("filenameDuplicate");
      expect(validateFilename("EXISTING.TS", existingFiles)).toBe("filenameDuplicate");
      expect(validateFilename("Existing.Ts", existingFiles)).toBe("filenameDuplicate");
    });
  });

  describe("length limits", () => {
    it("rejects paths over 200 characters", () => {
      const longPath = "a".repeat(201);
      expect(validateFilename(longPath, existingFiles)).toBe("pathTooLong");
    });

    it("allows paths up to 200 characters", () => {
      const maxPath = "a".repeat(200);
      expect(validateFilename(maxPath, existingFiles)).toBeNull();
    });
  });

  describe("valid filenames", () => {
    it("accepts valid simple filenames", () => {
      expect(validateFilename("newfile.ts", existingFiles)).toBeNull();
      expect(validateFilename("readme.md", existingFiles)).toBeNull();
    });

    it("accepts valid paths with directories", () => {
      expect(validateFilename("src/components/button.tsx", existingFiles)).toBeNull();
    });
  });
});

describe("isValidKebabCase", () => {
  it("accepts valid kebab-case names", () => {
    expect(isValidKebabCase("my-skill")).toBe(true);
    expect(isValidKebabCase("another-great-skill")).toBe(true);
    expect(isValidKebabCase("skill123")).toBe(true);
    expect(isValidKebabCase("my-skill-v2")).toBe(true);
  });

  it("requires starting with a letter", () => {
    expect(isValidKebabCase("123-skill")).toBe(false);
    expect(isValidKebabCase("-my-skill")).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(isValidKebabCase("My-Skill")).toBe(false);
    expect(isValidKebabCase("mySkill")).toBe(false);
  });

  it("rejects underscores and spaces", () => {
    expect(isValidKebabCase("my_skill")).toBe(false);
    expect(isValidKebabCase("my skill")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidKebabCase("")).toBe(false);
  });
});

describe("parseSkillFrontmatter", () => {
  it("parses valid frontmatter", () => {
    const content = `---
name: my-skill
description: A test skill
---

# My Skill`;

    const result = parseSkillFrontmatter(content);
    expect(result).toEqual({
      name: "my-skill",
      description: "A test skill",
    });
  });

  it("returns null for missing frontmatter", () => {
    const content = "# My Skill\n\nNo frontmatter here";
    expect(parseSkillFrontmatter(content)).toBeNull();
  });

  it("handles partial frontmatter", () => {
    const content = `---
name: my-skill
---

# My Skill`;

    const result = parseSkillFrontmatter(content);
    expect(result).toEqual({ name: "my-skill" });
  });

  it("handles multi-file content", () => {
    const content = `---
name: multi-file-skill
description: Has multiple files
---

# Main\n\x1FFILE:helper.ts\x1E\nconst x = 1;`;

    const result = parseSkillFrontmatter(content);
    expect(result?.name).toBe("multi-file-skill");
    expect(result?.description).toBe("Has multiple files");
  });
});

describe("validateSkillFrontmatter", () => {
  it("returns null for valid frontmatter", () => {
    const content = `---
name: valid-skill
description: A valid description
---

# Content`;

    expect(validateSkillFrontmatter(content)).toBeNull();
  });

  it("returns error for missing frontmatter", () => {
    const content = "# No frontmatter";
    expect(validateSkillFrontmatter(content)).toBe("frontmatterMissing");
  });

  it("returns error for missing name", () => {
    const content = `---
description: Has description but no name
---`;

    expect(validateSkillFrontmatter(content)).toBe("frontmatterNameRequired");
  });

  it("returns error for default placeholder name", () => {
    const content = `---
name: my-skill-name
description: Real description
---`;

    expect(validateSkillFrontmatter(content)).toBe("frontmatterNameRequired");
  });

  it("returns error for invalid name format", () => {
    const content = `---
name: Invalid Name
description: Real description
---`;

    expect(validateSkillFrontmatter(content)).toBe("frontmatterNameInvalidFormat");
  });

  it("returns error for missing description", () => {
    const content = `---
name: valid-name
---`;

    expect(validateSkillFrontmatter(content)).toBe("frontmatterDescriptionRequired");
  });

  it("returns error for default placeholder description", () => {
    const content = `---
name: valid-name
description: A clear description of what this skill does and when to use it
---`;

    expect(validateSkillFrontmatter(content)).toBe("frontmatterDescriptionRequired");
  });
});

describe("generateSkillContentWithFrontmatter", () => {
  it("generates content with frontmatter from title and description", () => {
    const result = generateSkillContentWithFrontmatter("My Test Skill", "A description");

    expect(result).toContain("---");
    expect(result).toContain("name: my-test-skill");
    expect(result).toContain("description: A description");
    expect(result).toContain("# My Test Skill");
  });

  it("converts title to kebab-case", () => {
    const result = generateSkillContentWithFrontmatter("Complex Title With Numbers 123", "desc");
    expect(result).toContain("name: complex-title-with-numbers-123");
  });

  it("handles special characters in title", () => {
    const result = generateSkillContentWithFrontmatter("Café Helper", "desc");
    expect(result).toContain("name: cafe-helper");
  });

  it("uses default description when empty", () => {
    const result = generateSkillContentWithFrontmatter("Test", "");
    expect(result).toContain("description: A clear description of what this skill does");
  });

  it("uses default title when empty", () => {
    const result = generateSkillContentWithFrontmatter("", "desc");
    expect(result).toContain("# My Skill");
  });
});

describe("suggestFilename", () => {
  it("suggests README.md first for empty list", () => {
    expect(suggestFilename([])).toBe("README.md");
  });

  it("skips already existing files", () => {
    expect(suggestFilename(["README.md"])).toBe("config.json");
    expect(suggestFilename(["README.md", "config.json"])).toBe("schema.json");
  });

  it("is case-insensitive when checking existing files", () => {
    expect(suggestFilename(["readme.md"])).toBe("config.json");
    expect(suggestFilename(["README.MD"])).toBe("config.json");
  });

  it("falls back to numbered files when all suggestions taken", () => {
    const allTaken = [
      "README.md", "config.json", "schema.json", "template.md",
      "example.ts", "utils.ts", "types.ts", "constants.ts"
    ];
    expect(suggestFilename(allTaken)).toBe("file1.md");
  });

  it("increments number for fallback files", () => {
    const withFile1 = [
      "README.md", "config.json", "schema.json", "template.md",
      "example.ts", "utils.ts", "types.ts", "constants.ts", "file1.md"
    ];
    expect(suggestFilename(withFile1)).toBe("file2.md");
  });
});
