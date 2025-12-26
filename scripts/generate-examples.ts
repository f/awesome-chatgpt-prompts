import fs from 'fs';
import path from 'path';

const examplesDir = path.join(process.cwd(), 'src/components/ide/examples');
const outputFile = path.join(examplesDir, 'generated.ts');

const examples = [
  { file: 'video.ts', export: 'EXAMPLE_VIDEO' },
  { file: 'audio.ts', export: 'EXAMPLE_AUDIO' },
  { file: 'image.ts', export: 'EXAMPLE_IMAGE' },
  { file: 'chat.ts', export: 'EXAMPLE_CHAT' },
  { file: 'openai-chat.ts', export: 'EXAMPLE_OPENAI_CHAT' },
  { file: 'default.ts', export: 'DEFAULT_CODE' },
];

const lines: string[] = [
  '// Auto-generated from example .ts files - DO NOT EDIT MANUALLY',
  '// Run: npm run generate:examples to regenerate',
  '',
];

for (const { file, export: exportName } of examples) {
  const content = fs.readFileSync(path.join(examplesDir, file), 'utf-8');
  // Escape backticks and ${} in the content
  const escaped = content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  lines.push(`export const ${exportName} = \`${escaped}\`;`);
  lines.push('');
}

fs.writeFileSync(outputFile, lines.join('\n'));
console.log(`✅ Generated examples: ${outputFile}`);
