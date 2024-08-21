// rollup.config.mjs

import { createBasicConfig } from '@open-wc/building-rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import merge from 'deepmerge';
import sri from 'rollup-plugin-sri';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const baseConfig = createBasicConfig();

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    name: 'MicrosoftTeams.min.js',
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
    resolve({
      extension: ['.js', '.ts'],
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectories: ['node_modules'],
      },
    }),
    typescript(),
    json(),
    commonjs(),
    sri(),
    nodePolyfills(),
  ],
};
//{
//  input: './dist/rollup/dts/index.d.ts',
//  output: {
//    format: 'es',
//    dir: 'dist/rollup/MicrosoftTeams.d.ts',
//    name: 'MicrosoftTeams.d.ts',
//    entryFileNames: '[name].d.ts',
//  },
//  plugins: [dts()],
//},
//
