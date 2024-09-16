// rollup.config.mjs

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

import version from './package.json' assert { type: 'json' };

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
      PACKAGE_VERSION: JSON.stringify(version),
    }),
    typescript(),
    json(),
    commonjs(),
    nodePolyfills(),
  ],
};
