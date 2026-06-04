import { createHash } from "crypto";

interface SkillFile {
  filename: string;
  content: string;
}

interface PromptContentInput {
  content: string;
  skillFiles: SkillFile[];
}

export function computePromptContentHash(input: PromptContentInput): string {
  const hash = createHash("sha256");
  hash.update(input.content);
  const sorted = [...input.skillFiles].sort((a, b) => a.filename.localeCompare(b.filename));
  for (const file of sorted) {
    hash.update("\0" + file.filename + "\0" + file.content);
  }
  return hash.digest("hex");
}
