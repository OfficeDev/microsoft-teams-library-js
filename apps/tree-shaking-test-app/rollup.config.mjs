import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// rollup.config.mjs
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/bundle.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/bundle.min.js',
      format: 'es',
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({
      extension: ['.js', '.ts', '.d.ts', '.json'],
    }),
    typescript(),
  ],
  treeshake: true,
};
