import { defineConfig } from 'tsup';

export default defineConfig({
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
});
