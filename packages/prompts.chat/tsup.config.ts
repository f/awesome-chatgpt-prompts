import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      'variables/index': 'src/variables/index.ts',
      'similarity/index': 'src/similarity/index.ts',
      'quality/index': 'src/quality/index.ts',
      'builder/index': 'src/builder/index.ts',
      'parser/index': 'src/parser/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
  },
  {
    entry: {
      'cli/index': 'src/cli/index.tsx',
    },
    format: ['esm'],
    dts: false,
    clean: false,
    splitting: false,
    sourcemap: true,
    external: ['ink', 'react', 'ink-text-input', 'ink-spinner', 'ink-select-input'],
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
