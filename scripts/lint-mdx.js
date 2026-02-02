#!/usr/bin/env node

/**
 * MDX Linting Script
 * Checks MDX files for common issues:
 * - Unclosed/mismatched JSX tags
 * - Invalid JSX attribute syntax
 * - Unbalanced braces/brackets
 * - Empty files
 * - Trailing whitespace issues
 */

const fs = require("fs");
const path = require("path");
const pc = require("picocolors");

const BOOK_DIR = path.join(__dirname, "../src/content/book");

// Known self-closing components (don't need closing tags)
const SELF_CLOSING_COMPONENTS = new Set([
  "TokenizerDemo",
  "TokenPredictionDemo",
  "ContextWindowDemo",
  "TemperatureDemo",
  "TextToImageDemo",
  "TextToVideoDemo",
  "LLMCapabilitiesDemo",
  "TryIt",
  "Compare",
  "Quiz",
  "br",
  "hr",
  "img",
  "input",
]);

// Known block components that need closing
const BLOCK_COMPONENTS = new Set([
  "Callout",
  "Collapsible",
  "div",
  "span",
  "p",
]);

class MDXLinter {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = "";
    this.lines = [];
    this.errors = [];
    this.warnings = [];
  }

  addError(line, message) {
    this.errors.push({ line, message });
  }

  addWarning(line, message) {
    this.warnings.push({ line, message });
  }

  load() {
    try {
      this.content = fs.readFileSync(this.filePath, "utf-8");
      this.lines = this.content.split("\n");
      return true;
    } catch (err) {
      this.addError(0, `Failed to read file: ${err.message}`);
      return false;
    }
  }

  checkEmptyFile() {
    if (this.content.trim().length === 0) {
      this.addError(1, "File is empty");
    }
  }

  checkUnbalancedBraces() {
    let braceCount = 0;
    let bracketCount = 0;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      // Skip code blocks
      if (line.trim().startsWith("```")) continue;

      for (const char of line) {
        if (char === "{") braceCount++;
        if (char === "}") braceCount--;
        if (char === "[") bracketCount++;
        if (char === "]") bracketCount--;
      }
    }

    if (braceCount !== 0) {
      this.addError(0, `Unbalanced curly braces: ${braceCount > 0 ? "missing" : "extra"} ${Math.abs(braceCount)} closing brace(s)`);
    }
    if (bracketCount !== 0) {
      this.addWarning(0, `Unbalanced square brackets: ${bracketCount > 0 ? "missing" : "extra"} ${Math.abs(bracketCount)} closing bracket(s)`);
    }
  }

  checkJSXTags() {
    // Remove code blocks from content for tag analysis
    let content = "";
    let inCodeBlock = false;
    const lineMapping = []; // Maps position to line number

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        content += "\n";
        continue;
      }
      if (inCodeBlock) {
        content += "\n";
        continue;
      }
      const startPos = content.length;
      content += line + "\n";
      for (let j = 0; j <= line.length; j++) {
        lineMapping[startPos + j] = i + 1;
      }
    }

    const openingTags = [];
    const closingTags = [];

    // Parse tags character by character for accuracy
    let i = 0;
    while (i < content.length) {
      if (content[i] === "<") {
        const startIdx = i;
        const startLine = lineMapping[i] || 0;

        // Check if it's a closing tag
        if (content[i + 1] === "/") {
          // Closing tag: </ComponentName>
          const closeMatch = content.slice(i).match(/^<\/([A-Z][A-Za-z0-9]*)>/);
          if (closeMatch) {
            closingTags.push({ name: closeMatch[1], line: startLine, index: startIdx });
            i += closeMatch[0].length;
            continue;
          }
        } else if (/[A-Z]/.test(content[i + 1])) {
          // Opening or self-closing tag: <ComponentName ...> or <ComponentName ... />
          // Find the tag name
          const nameMatch = content.slice(i).match(/^<([A-Z][A-Za-z0-9]*)/);
          if (nameMatch) {
            const tagName = nameMatch[1];
            // Find the end of this tag (the matching >)
            let depth = 0;
            let inString = false;
            let stringChar = "";
            let inJSX = 0;
            let j = i + nameMatch[0].length;

            while (j < content.length) {
              const char = content[j];

              // Handle string literals
              if (!inString && (char === '"' || char === "'" || char === "`")) {
                inString = true;
                stringChar = char;
                j++;
                continue;
              }
              if (inString) {
                if (char === stringChar && content[j - 1] !== "\\") {
                  inString = false;
                }
                j++;
                continue;
              }

              // Handle nested JSX expressions
              if (char === "{") {
                inJSX++;
                j++;
                continue;
              }
              if (char === "}") {
                inJSX--;
                j++;
                continue;
              }

              // Only look for > when not inside JSX expression
              if (inJSX === 0) {
                if (char === "/" && content[j + 1] === ">") {
                  // Self-closing tag
                  j += 2;
                  break;
                }
                if (char === ">") {
                  // Opening tag - add to stack
                  if (!SELF_CLOSING_COMPONENTS.has(tagName)) {
                    openingTags.push({ name: tagName, line: startLine, index: startIdx });
                  }
                  j++;
                  break;
                }
              }

              j++;
            }
            i = j;
            continue;
          }
        }
      }
      i++;
    }

    // Match opening and closing tags
    const unmatchedOpening = [...openingTags];
    const unmatchedClosing = [];

    for (const closeTag of closingTags) {
      let found = false;
      for (let k = unmatchedOpening.length - 1; k >= 0; k--) {
        if (unmatchedOpening[k].name === closeTag.name && unmatchedOpening[k].index < closeTag.index) {
          unmatchedOpening.splice(k, 1);
          found = true;
          break;
        }
      }
      if (!found) {
        unmatchedClosing.push(closeTag);
      }
    }

    // Report errors
    for (const tag of unmatchedOpening) {
      this.addError(tag.line, `Unclosed tag <${tag.name}>`);
    }
    for (const tag of unmatchedClosing) {
      this.addError(tag.line, `Unexpected closing tag </${tag.name}> with no matching opening tag`);
    }
  }

  checkJSXAttributes() {
    let inCodeBlock = false;

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      const lineNum = i + 1;

      if (line.trim().startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      // Check for common JSX attribute issues
      // Missing quotes around string attributes
      const badAttrRegex = /\s([a-z]+)=([^"{}\s>][^\s>]*)/gi;
      const badMatches = [...line.matchAll(badAttrRegex)];
      for (const match of badMatches) {
        // Skip if it looks like a JSX expression or valid
        if (match[2].startsWith("{") || match[2].startsWith('"') || match[2].startsWith("'")) {
          continue;
        }
        this.addWarning(lineNum, `Attribute "${match[1]}" may need quotes around value "${match[2]}"`);
      }

      // Check for unterminated JSX expressions
      const jsxExprCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      // This is checked at file level, but flag obvious single-line issues
      if (line.includes("<") && line.includes(">") && jsxExprCount !== 0) {
        // Only warn if it's clearly a JSX line
        if (/<[A-Z]/.test(line)) {
          this.addWarning(lineNum, `Possible unterminated JSX expression in component`);
        }
      }
    }
  }

  checkTrailingWhitespace() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      if (line !== line.trimEnd()) {
        this.addWarning(i + 1, "Trailing whitespace");
      }
    }
  }

  checkConsecutiveBlankLines() {
    let blankCount = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines[i].trim() === "") {
        blankCount++;
        if (blankCount > 2) {
          this.addWarning(i + 1, "More than 2 consecutive blank lines");
        }
      } else {
        blankCount = 0;
      }
    }
  }

  lint() {
    if (!this.load()) return this;

    this.checkEmptyFile();
    this.checkUnbalancedBraces();
    this.checkJSXTags();
    this.checkJSXAttributes();
    // Uncomment for stricter checks:
    // this.checkTrailingWhitespace();
    // this.checkConsecutiveBlankLines();

    return this;
  }

  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }

  printResults() {
    if (!this.hasIssues()) return;

    const relativePath = path.relative(process.cwd(), this.filePath);
    console.log(`\n${pc.underline(relativePath)}`);

    for (const err of this.errors) {
      console.log(`  ${pc.red("error")} ${err.line > 0 ? `line ${err.line}: ` : ""}${err.message}`);
    }
    for (const warn of this.warnings) {
      console.log(`  ${pc.yellow("warn")}  ${warn.line > 0 ? `line ${warn.line}: ` : ""}${warn.message}`);
    }
  }
}

function findMDXFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function main() {
  const args = process.argv.slice(2);
  let files = [];

  if (args.length > 0) {
    // Lint specific files
    files = args.map(f => path.resolve(f)).filter(f => f.endsWith(".mdx") && fs.existsSync(f));
    if (files.length === 0) {
      console.error(pc.red("No valid MDX files specified"));
      process.exit(1);
    }
  } else {
    // Lint all MDX files in book directory
    if (!fs.existsSync(BOOK_DIR)) {
      console.error(pc.red(`Book directory not found: ${BOOK_DIR}`));
      process.exit(1);
    }
    files = findMDXFiles(BOOK_DIR);
  }

  console.log(pc.cyan(`Linting ${files.length} MDX file(s)...\n`));

  let totalErrors = 0;
  let totalWarnings = 0;
  let filesWithIssues = 0;

  for (const file of files) {
    const linter = new MDXLinter(file).lint();
    if (linter.hasIssues()) {
      filesWithIssues++;
      linter.printResults();
    }
    totalErrors += linter.errors.length;
    totalWarnings += linter.warnings.length;
  }

  console.log("");

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(pc.green(`✓ All ${files.length} files passed`));
    process.exit(0);
  } else {
    const summary = [];
    if (totalErrors > 0) summary.push(pc.red(`${totalErrors} error(s)`));
    if (totalWarnings > 0) summary.push(pc.yellow(`${totalWarnings} warning(s)`));
    console.log(`Found ${summary.join(" and ")} in ${filesWithIssues} file(s)`);
    process.exit(totalErrors > 0 ? 1 : 0);
  }
}

main();
