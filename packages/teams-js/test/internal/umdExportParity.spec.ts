/**
 * Build-time export parity validation: UMD (Universal Module Definition) bundle
 * vs. ESM (ECMAScript Module) source.
 *
 * The SDK is distributed in two formats:
 *   - ESM: consumed via `import` by bundlers (rollup output in dist/esm/)
 *   - UMD: consumed via `<script>` tag as `window.microsoftTeams` (webpack output in dist/umd/)
 *
 * This test verifies that the UMD bundle (MicrosoftTeams.min.js) exposes the
 * exact same public API surface as the ESM entry point. If a webpack config
 * change accidentally drops or renames an export from the UMD build, this test
 * catches it at build time — eliminating the need to re-run the full end-to-end
 * (E2E) test suite via script-tag just to validate the bundle shape.
 *
 * How it works: the test imports the ESM source (via ts-jest) and `require()`s
 * the built UMD bundle, then recursively compares their export trees by key
 * name and value type (not identity, since Terser minification changes references).
 *
 * Prerequisites: `pnpm build-webpack` must have been run before this test.
 */

/* eslint-disable @typescript-eslint/no-require-imports */

import * as path from 'path';

import * as esmSourceExports from '../../src/index';

const UMD_BUNDLE_PATH = path.resolve(__dirname, '../../dist/umd/MicrosoftTeams.min.js');

/**
 * Keys injected by module tooling (e.g. ts-jest's CommonJS interop) that are
 * not part of the real API surface and should be excluded from comparisons.
 */
const SYNTHETIC_MODULE_KEYS = new Set(['__esModule', 'default']);

/**
 * A node in a tree that mirrors the shape of a module's exports.
 * Leaf nodes represent individual values (functions, strings, numbers, etc.).
 * Branch nodes represent namespace objects (e.g. `app`, `dialog.url`) and
 * contain children.
 *
 * We compare *key names and value types* — not the values themselves — because
 * the UMD bundle runs through Terser minification and will have different
 * function references than the unminified ESM source.
 */
interface ExportShapeNode {
  exportName: string;
  valueType: string; // result of `typeof` — 'function' | 'object' | 'string' | 'number' | …
  children?: ExportShapeNode[];
}

/**
 * Determines whether a value is a namespace-like object whose members should
 * be recursed into (as opposed to a leaf value like a function or class instance).
 *
 * This must handle two different representations of the same namespace:
 *   - In the UMD bundle: plain objects with `Object.prototype`
 *   - In ts-jest's CommonJS (CJS) interop: objects with an `__esModule: true` marker
 *     (added when transpiling `export * as foo` to CJS `require()` format)
 */
function isNamespaceObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype === Object.prototype || prototype === null) {
    return true;
  }
  // ts-jest CommonJS module interop wraps namespace re-exports with this marker
  if ((value as Record<string, unknown>).__esModule) {
    return true;
  }
  return false;
}

/**
 * Recursively walks a module's exports and builds a tree of {@link ExportShapeNode}
 * describing every exported name and its type.
 *
 * @param moduleExports - The object whose keys are the module's exports.
 * @param visitedObjects - Tracks already-visited objects to avoid infinite loops from circular references.
 * @param currentDepth - Current recursion depth.
 * @param maxRecursionDepth - Stop recursing beyond this depth to avoid runaway traversal.
 */
function buildExportShapeTree(
  moduleExports: Record<string, unknown>,
  visitedObjects = new Set<unknown>(),
  currentDepth = 0,
  maxRecursionDepth = 3,
): ExportShapeNode[] {
  if (visitedObjects.has(moduleExports) || currentDepth >= maxRecursionDepth) {
    return [];
  }
  visitedObjects.add(moduleExports);

  return Object.keys(moduleExports)
    .filter((key) => !SYNTHETIC_MODULE_KEYS.has(key))
    .sort()
    .map((key) => {
      const value = moduleExports[key];
      const node: ExportShapeNode = { exportName: key, valueType: typeof value };

      if (isNamespaceObject(value)) {
        const children = buildExportShapeTree(
          value as Record<string, unknown>,
          visitedObjects,
          currentDepth + 1,
          maxRecursionDepth,
        );
        if (children.length > 0) {
          node.children = children;
        }
      }

      return node;
    });
}

/**
 * Flattens an export shape tree into a list of dot-separated paths for readable
 * diff output. Each entry includes the full path and its type, e.g.:
 *   - "app.initialize (function)"
 *   - "dialog.url.open (function)"
 *   - "HostClientType (object)"
 */
function flattenShapeTreeToPaths(nodes: ExportShapeNode[], parentPath = ''): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    const fullPath = parentPath ? `${parentPath}.${node.exportName}` : node.exportName;
    paths.push(`${fullPath} (${node.valueType})`);
    if (node.children) {
      paths.push(...flattenShapeTreeToPaths(node.children, fullPath));
    }
  }
  return paths;
}

/**
 * Returns the sorted public export keys from a module object, excluding
 * synthetic keys injected by module tooling (see {@link SYNTHETIC_MODULE_KEYS}).
 */
function getPublicExportKeys(moduleExports: Record<string, unknown>): string[] {
  return Object.keys(moduleExports)
    .filter((key) => !SYNTHETIC_MODULE_KEYS.has(key))
    .sort();
}

describe('UMD (Universal Module Definition) bundle export parity with ESM (ECMAScript Module) source', () => {
  let umdBundleExports: Record<string, unknown>;

  beforeAll(() => {
    // When the UMD bundle is loaded via require() in Node.js / jsdom, the UMD
    // wrapper detects that `module.exports` exists and takes the CommonJS path
    // (module.exports = factory()). The exports come back as the return value
    // of require() rather than being assigned to a browser global.
    try {
      umdBundleExports = require(UMD_BUNDLE_PATH);
    } catch (error) {
      throw new Error(
        `Could not load UMD bundle at ${UMD_BUNDLE_PATH}. ` +
          'Make sure you have run "pnpm build-webpack" before running this test.\n' +
          `Original error: ${error}`,
      );
    }

    if (!umdBundleExports || typeof umdBundleExports !== 'object') {
      throw new Error('UMD bundle did not return a valid exports object');
    }
  });

  it('should load the UMD bundle and return a valid exports object', () => {
    expect(umdBundleExports).toBeDefined();
    expect(typeof umdBundleExports).toBe('object');
  });

  it('should have the same top-level export keys in the UMD bundle as in the ESM source', () => {
    const esmExportKeys = getPublicExportKeys(esmSourceExports as unknown as Record<string, unknown>);
    const umdExportKeys = getPublicExportKeys(umdBundleExports);

    const missingFromUmdBundle = esmExportKeys.filter((key) => !umdExportKeys.includes(key));
    const extraInUmdBundle = umdExportKeys.filter((key) => !esmExportKeys.includes(key));

    expect(missingFromUmdBundle).toEqual([]);
    expect(extraInUmdBundle).toEqual([]);
  });

  it('should have matching value types for all top-level exports', () => {
    const typeMismatches: string[] = [];
    const esmExportsRecord = esmSourceExports as unknown as Record<string, unknown>;

    for (const key of getPublicExportKeys(esmExportsRecord)) {
      const esmValueType = typeof esmExportsRecord[key];
      const umdValueType = typeof umdBundleExports[key];
      if (esmValueType !== umdValueType) {
        typeMismatches.push(`"${key}": ESM type=${esmValueType}, UMD type=${umdValueType}`);
      }
    }

    expect(typeMismatches).toEqual([]);
  });

  it('should have matching namespace members at all nesting levels', () => {
    const esmShapeTree = buildExportShapeTree(esmSourceExports as unknown as Record<string, unknown>);
    const umdShapeTree = buildExportShapeTree(umdBundleExports);

    const esmExportPaths = flattenShapeTreeToPaths(esmShapeTree);
    const umdExportPaths = flattenShapeTreeToPaths(umdShapeTree);

    const missingFromUmdBundle = esmExportPaths.filter((exportPath) => !umdExportPaths.includes(exportPath));
    const extraInUmdBundle = umdExportPaths.filter((exportPath) => !esmExportPaths.includes(exportPath));

    if (missingFromUmdBundle.length > 0 || extraInUmdBundle.length > 0) {
      const errorDetails = [
        missingFromUmdBundle.length > 0
          ? `Exports missing from UMD bundle:\n  ${missingFromUmdBundle.join('\n  ')}`
          : '',
        extraInUmdBundle.length > 0
          ? `Exports in UMD bundle but not in ESM source:\n  ${extraInUmdBundle.join('\n  ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');
      throw new Error(`UMD bundle export shape does not match ESM source:\n${errorDetails}`);
    }
  });
});
