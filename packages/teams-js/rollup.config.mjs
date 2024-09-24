// rollup.config.mjs

//import { createBasicConfig } from '@open-wc/building-rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import merge from 'deepmerge';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import version from './package.json' assert { type: 'json' };

//const config = createBasicConfig();

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist/',
    name: '@microsoft/teams-js',
    format: 'es',
    preserveModules: true,
    entryFileNames: '[name].js',
    sourcemap: false,
    //plugins: [terser()],
    globals: {
      buffer: 'Buffer',
      tty: 'tty',
      util: 'util',
      os: 'os',
    },
  },
  preserveEntrySignatures: 'strict',
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.d.ts', '.json'],
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
      PACKAGE_VERSION: JSON.stringify(version.version),
    }),
    typescript(),
    json(),
    commonjs(),
    nodePolyfills(),
  ],
  treeshake: {
    moduleSideEffects: [
      'src/public/constants.ts',
      'src/public/handlers.ts',
      'src/internal/communication.ts',
      'src/private/constants.ts',
      'src/private/interfaces.ts',
      'src/public/interfaces.ts',
      'src/internal/utils.ts',
      'src/internal/nestedAppAuthUtils.ts',
      'src/internal/videoEffectsUtils.ts',
    ],
  },
};