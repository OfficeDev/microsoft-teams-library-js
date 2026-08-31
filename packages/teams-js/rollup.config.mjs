// rollup.config.mjs

import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const require = createRequire(import.meta.url);
const { getTargetCloud, getArtifactPathForCloud, getDistSuffixForCloud, DEFAULT_ARTIFACT } = require('./cloudBuild.cjs');

const targetCloud = getTargetCloud();
const cloudArtifact = getArtifactPathForCloud(targetCloud);
const distSuffix = getDistSuffixForCloud(targetCloud);

/**
 * Redirects the bundled valid-domains artifact to the target cloud's artifact.
 *
 * Implemented inline rather than with @rollup/plugin-alias to avoid adding a build dependency.
 * Because origins only ever enter the bundle through this one import, a sovereign build cannot
 * emit prod origins.
 */
function cloudArtifactAlias() {
  return {
    name: 'teamsjs-cloud-artifact-alias',
    resolveId(source, importer) {
      if (!importer || !source.endsWith('validDomains.json')) {
        return null;
      }
      const resolved = path.resolve(path.dirname(importer), source);
      return resolved === DEFAULT_ARTIFACT ? cloudArtifact : null;
    },
  };
}

export default [
  {
    input: './src/index.ts',
    output: {
      dir: `dist/esm${distSuffix}`,
      name: '@microsoft/teams-js',
      format: 'es',
      preserveModules: true,
      entryFileNames: '[name].js',
      sourcemap: false,
      plugins: [terser()],
    },
    preserveEntrySignatures: 'strict',
    plugins: [
      // Sovereign builds swap the bundled valid-domains artifact. Prod origins are never
      // imported in a sovereign build, so they cannot appear in the emitted bundle.
      cloudArtifactAlias(),
      nodeResolve({
        extensions: ['.js', '.ts', '.d.ts', '.json'],
      }),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production'),
        PACKAGE_VERSION: JSON.stringify(packageJson.version),
      }),
      typescript({
        // tsconfig.json pins outDir/declarationDir to the prod paths. A cloud build writes to its
        // own directory, and @rollup/plugin-typescript requires outDir to sit inside rollup's
        // `dir`, so both are overridden here rather than in tsconfig (which is shared with
        // `tsc --noEmit` and other tooling).
        outDir: `dist/esm${distSuffix}`,
        declarationDir: `dist/esm${distSuffix}/packages/teams-js/dts`,
      }),
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
];
