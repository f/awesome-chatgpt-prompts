import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const generator = fs.readFileSync(path.join(repoRoot, "scripts/generate-contributors.sh"), "utf8");

assert.ok(generator.includes("EMAIL_RE"), "generator should detect email contributors");
assert.ok(generator.includes("GITHUB_USERNAME_RE"), "generator should validate GitHub usernames");
assert.ok(generator.includes("{0,38}"), "GitHub usernames up to 39 characters should be accepted");
assert.ok(
  generator.includes("links.append('@anonymous')"),
  "email contributors should render as anonymous instead of GitHub profile links",
);
assert.ok(
  generator.includes("normalized = contributor.lstrip('@')"),
  "contributors with a leading @ should be normalized before rendering",
);
assert.ok(
  generator.includes("elif normalized:"),
  "non-email non-GitHub contributor names should still render as plain text",
);

console.log("Passed: 5");
