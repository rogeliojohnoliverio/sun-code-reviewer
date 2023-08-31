import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2';

export default defineConfig([
  {
    input: 'src/bot.ts',
    output: {
      dir: 'dist/lib/',
      format: 'esm',
      inlineDynamicImports: false,
    },
    cache: false,
    plugins: [typescript({ include: 'src/*.ts' })],
  },
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/',
      format: 'esm',
      inlineDynamicImports: false,
    },
    cache: false,
    plugins: [typescript()],
  },
  {
    input: ['api/github/webhooks/index.ts'],
    output: {
      dir: 'dist/api/github/webhooks',
      format: 'esm',
    },
    cache: false,
    plugins: [typescript()],
  },
]);
