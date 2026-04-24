const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const generator = fs.readFileSync(path.join(repoRoot, 'scripts/generate-contributors.sh'), 'utf8');
const promptsMd = fs.readFileSync(path.join(repoRoot, 'PROMPTS.md'), 'utf8');

assert.ok(generator.includes('EMAIL_RE'), 'generator should detect email contributors');
assert.ok(generator.includes('GITHUB_USERNAME_RE'), 'generator should validate GitHub usernames');
assert.ok(
  generator.includes("links.append('@anonymous')"),
  'email contributors should render as anonymous instead of GitHub profile links'
);
assert.ok(
  !promptsMd.match(/https:\/\/github\.com\/[^)\s]*@[^)\s]*/),
  'PROMPTS.md should not link email-like contributors to GitHub profiles'
);

console.log('Passed: 4');
