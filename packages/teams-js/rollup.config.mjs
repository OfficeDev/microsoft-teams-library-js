// rollup.config.mjs

import { createBasicConfig } from '@open-wc/building-rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import merge from 'deepmerge';
import replace from '@rollup/plugin-replace';
import sri from 'rollup-plugin-sri';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { RollupFilemanager } from 'filemanager-plugin';
import version from './package.json' assert { type: 'json' };

const baseConfig = createBasicConfig();

export default [
  {
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
      resolve({
        extension: ['.js', '.ts', '.d.ts', '.json'],
        preferBuiltins: true,
        customResolveOptions: {
          moduleDirectories: ['node_modules'],
        },
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        PACKAGE_VERSION: JSON.stringify(version.version),
      }),
      typescript(),
      json(),
      commonjs(),
      sri(),
      nodePolyfills(),
      RollupFilemanager({
        events: {
          onEnd: {
            copy: [
              {
                source: './dist/packages/teams-js/**/*.js',
                destination: '../../apps/blazor-test-app/wwwroot/js/',
                isFlat: false,
              },
            ],
          },
        },
      }),
      {
        apply: (compiler) => {
          compiler.hooks.done.tap('wsi-test', () => {
            const manifest = JSON.parse(readFileSync(join(__dirname, 'dist/MicrosoftTeams-manifest.json'), 'utf-8'));
            // If for some reason hash was not generated for the assets, this test will fail in build.
            expect(manifest['MicrosoftTeams.min.js'].integrity).toMatch(/sha384-.*/);
          });
        },
      },
    ],
  },
  //{
  //  input: './src/index.ts',
  //  output: {
  //    dir: 'dist/',
  //    name: 'MicrosoftTeams',
  //    format: 'umd',
  //    preserveModules: false,
  //    entryFileNames: 'MicrosoftTeams.umd.min.js',
  //    sourcemap: false,
  //    plugins: [terser()],
  //    globals: {
  //      buffer: 'Buffer',
  //      tty: 'tty',
  //      util: 'util',
  //      os: 'os',
  //    },
  //  },
  //  plugins: [
  //    resolve({
  //      extension: ['.js', '.ts'],
  //      preferBuiltins: true,
  //      customResolveOptions: {
  //        moduleDirectories: ['node_modules'],
  //      },
  //    }),
  //    replace({
  //      preventAssignment: true,
  //      'process.env.NODE_ENV': JSON.stringify('production'),
  //      PACKAGE_VERSION: JSON.stringify(version.version),
  //    }),
  //    typescript(),
  //    json(),
  //    commonjs(),
  //    sri(),
  //    nodePolyfills(),
  //  ],
  //},
];
