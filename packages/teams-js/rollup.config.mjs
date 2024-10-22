// rollup.config.mjs

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import dts from 'rollup-plugin-dts';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist/esm',
      name: '@microsoft/teams-js',
      format: 'es',
      preserveModules: true,
      entryFileNames: '[name].js',
      sourcemap: false,
      plugins: [terser()],
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
        PACKAGE_VERSION: JSON.stringify(packageJson.version),
      }),
      typescript(),
      json(),
      commonjs(),
      nodePolyfills(),
    ],
    treeshake: {
      moduleSideEffects: [
        'src/internal/communication.ts',
        'src/internal/nestedAppAuthUtils.ts',
        'src/internal/utils.ts',
        'src/internal/videoEffectsUtils.ts',
        'src/private/constants.ts',
        'src/private/interfaces.ts',
        'src/public/constants.ts',
        'src/public/handlers.ts',
        'src/public/interfaces.ts',
      ],
    },
  },
  {
    input: './dist/esm/packages/teams-js/dts/index.d.ts',
    output: {
      file: 'dist/umd/MicrosoftTeams.d.ts',
      format: 'es',
      sourcemap: false,
    },
    plugins: [dts()],
  },
];
