---
name: teams-js-contributor
description: "Guide for contributing to the TeamsJS SDK monorepo. Use when user asks to build, test, lint, add capabilities, create changefiles, fix bugs, or understand the monorepo structure. Mentions: 'teams-js', 'TeamsJS', '@microsoft/teams-js', 'changefile', 'beachball', 'bundle size', 'tree-shaking', 'test app'."
metadata:
  version: '1.0.0'
  tool_type: monorepo
  requires: Node.js 18+, pnpm 9.0.6+
---

# TeamsJS SDK Contributor Guide

Agent skill for navigating, building, testing, and contributing to the `microsoft-teams-library-js` monorepo — the Microsoft Teams JavaScript client library (`@microsoft/teams-js`).

## When to Use This Skill

**Triggers — activate this skill when:**

- User asks to build, test, or lint the TeamsJS SDK
- User asks how to add a new capability or public API
- User asks about monorepo structure (packages, apps, tools)
- User needs to create a beachball changefile for a PR
- User asks about bundle size limits or tree-shaking
- User mentions "teams-js", "TeamsJS", or "@microsoft/teams-js"
- User asks how to contribute or submit a PR
- User asks about running test apps (test app, perf app, SSR app, Blazor app)
- User asks about the SDK's runtime capability checks or `isSupported()` pattern

**Anti-triggers — do NOT use this skill when:**

- User is building an app _with_ TeamsJS as a consumer (point them to https://learn.microsoft.com/javascript/api/overview/msteams-client)
- User asks about Teams Bot Framework or other Teams SDKs

## Monorepo Structure

```
microsoft-teams-library-js/
├── packages/teams-js/          # Core SDK — @microsoft/teams-js
│   ├── src/
│   │   ├── public/             # Public API capabilities (calendar, clipboard, dialog, etc.)
│   │   ├── private/            # Internal/experimental APIs (copilot, externalAppAuth, etc.)
│   │   ├── internal/           # Shared utilities (communication, handlers, telemetry, utils)
│   │   └── index.ts            # Package entry point
│   ├── test/                   # Jest tests mirroring src/ structure
│   ├── dist/
│   │   ├── esm/                # ES modules (tree-shakable, preserveModules)
│   │   └── umd/                # UMD bundle (MicrosoftTeams.min.js)
│   ├── rollup.config.mjs       # Build config (ESM + UMD outputs)
│   └── package.json
├── apps/
│   ├── teams-test-app/         # Functional test app for SDK APIs
│   ├── teams-perf-test-app/    # Performance/loading time test app
│   ├── ssr-test-app/           # Server-side rendering test app
│   ├── blazor-test-app/        # Blazor integration test app
│   └── tree-shaking-test-app/  # Tree-shaking verification app
├── tools/
│   └── cli/                    # Utility scripts (bundle analysis, pre-release, etc.)
├── change/                     # Beachball change files (auto-generated)
├── beachball.config.js         # Changefile configuration
├── jest.config.common.js       # Shared Jest config
└── tsconfig.common.json        # Shared TypeScript config
```

## Command Reference

### Build

```bash
# Build everything (SDK + all apps)
pnpm build

# Build only the SDK (faster — run from packages/teams-js)
cd packages/teams-js && pnpm build

# Build SDK without lint/docs/size checks (fastest)
cd packages/teams-js && pnpm build-rollup
```

The SDK `build` script runs: `clean → lint → build-rollup → build-webpack → docs:validate → size`

### Test

```bash
# Run all tests across the monorepo
pnpm test

# Run only SDK tests (faster — from packages/teams-js)
cd packages/teams-js && pnpm test

# Run a specific test file
cd packages/teams-js && npx jest test/public/calendar.spec.ts

# Run tests matching a pattern
cd packages/teams-js && npx jest --testPathPattern="clipboard"

# Run with verbose output
cd packages/teams-js && pnpm test:verbose
```

### Lint

```bash
# Lint everything
pnpm lint

# Lint SDK only (with auto-fix)
cd packages/teams-js && pnpm lint
```

### Bundle Size

```bash
# Check bundle size against limits
cd packages/teams-js && pnpm size

# Full bundle analysis
pnpm bundleAnalyze
```

**Size limits** are defined in the root `package.json` under `size-limit`. The key constraint:

- Importing `{ app, authentication, pages }` must stay under the limit specified in `package.json` (uncompressed, no brotli)
- If your change exceeds this, either tree-shaking is broken or you must justify the increase in your PR

### Changefiles (Beachball)

```bash
# Generate a changefile (REQUIRED before PR)
pnpm changefile

# Generate without auto-commit
pnpm changefile --no-commit
```

**Change types:**

- **minor** — new backwards-compatible functionality
- **patch** — backwards-compatible bug fix
- **none** — change doesn't affect the published package

**Major and prerelease are disallowed** per `beachball.config.js`.

Change descriptions should use past tense and backtick-wrap API names:

- ✅ `"Added \`calendar.openCalendarItem\` to support calendar deep links"`
- ❌ `"Add calendar feature"`

### Test Apps

```bash
pnpm start-test-app         # Functional test app (default)
pnpm start-test-app-local   # Test app with local SDK build
pnpm start-perf-app         # Performance test app
pnpm start-ssr-app          # SSR test app
pnpm start-blazor-app       # Blazor test app
```

### Documentation

```bash
# Generate TypeDoc reference docs
pnpm docs

# Validate docs without emitting (runs during build)
pnpm docs:validate
```

## Public API Capability Pattern

Every public capability module in `src/public/` follows this structure:

```typescript
// src/public/myCapability.ts
import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

const myCapabilityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

// 1. Export interfaces for parameters/return types
export interface MyParams {
  itemId: string;
}

// 2. Export async function with runtime + context checks
export function doSomething(params: MyParams): Promise<void> {
  // a. Validate initialization
  ensureInitialized(runtime);
  // b. Check capability support
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  // c. Validate parameters
  if (!params.itemId) {
    throw new Error('itemId is required');
  }
  // d. Send message to host and handle response
  return sendAndHandleSdkError(
    getApiVersionTag(myCapabilityTelemetryVersionNumber, ApiName.MyCapability_DoSomething),
    'myCapability.doSomething',
    params,
  );
}

// 3. Export isSupported() — REQUIRED for every capability
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.myCapability ? true : false;
}
```

**Key rules:**

- Every capability MUST export an `isSupported()` function
- Use `ensureInitialized(runtime)` before any operation
- Use telemetry version tagging on all API calls
- All async operations return `Promise<T>`
- Parameter interfaces are exported from the same module

## Test Pattern

Test files mirror the `src/` structure:

```typescript
// test/public/myCapability.spec.ts
describe('myCapability', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    GlobalVars.frameContext = undefined;
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    app._uninitialize();
  });

  describe('isSupported', () => {
    it('should return false if runtime not initialized', () => {
      utils.uninitializeRuntimeConfig();
      expect(myCapability.isSupported()).toBeFalsy();
    });
  });

  describe('doSomething', () => {
    it('should not allow calls before initialization', async () => {
      await expect(myCapability.doSomething(params)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    // Test each allowed/disallowed FrameContext
    const allowedFrameContexts = [FrameContexts.content];
    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should allow calls from ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          // ... test success path
        });
      } else {
        it(`should not allow calls from ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          expect(() => myCapability.doSomething(params)).toThrowError(/* ... */);
        });
      }
    });
  });
});
```

## Common Workflows

### Adding a New Capability

1. Create `src/public/myCapability.ts` following the capability pattern above. New capabilities should _never_ specify allowed frame contexts in `ensureInitialized()`.
2. Export from `src/public/index.ts`
3. Add `runtime.supports.myCapability` to the runtime interface in `src/public/runtime.ts`
4. Create `test/public/myCapability.spec.ts` following the test pattern
5. Run `pnpm build && pnpm test` from `packages/teams-js`
6. Check bundle size with `pnpm size`
7. Generate changefile: `pnpm changefile` (type: minor)

### Fixing a Bug in an Existing Capability

1. Locate the capability in `src/public/{capability}.ts`
2. Make the fix
3. Add/update test in `test/public/{capability}.spec.ts`
4. Run `cd packages/teams-js && pnpm test -- --testPathPattern="{capability}"`
5. Run full build: `cd packages/teams-js && pnpm build`
6. Generate changefile: `pnpm changefile` (type: patch)

### Submitting a PR

1. Create a branch from `main`: `git checkout -b issue-123`
2. Make changes and commit
3. Run `pnpm changefile` — **pipeline will fail without this**
4. Push and open PR against `main`
5. CI runs: install → build → test → lint (on Node 18.x and 20.x)

## Key Files Reference

| File                                              | Purpose                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| `packages/teams-js/src/public/runtime.ts`         | Runtime capability detection and `supports` interface                 |
| `packages/teams-js/src/public/constants.ts`       | `FrameContexts` enum and other shared constants                       |
| `packages/teams-js/src/internal/communication.ts` | Host-app message passing (core IPC)                                   |
| `packages/teams-js/src/internal/telemetry.ts`     | API telemetry tagging with version numbers                            |
| `packages/teams-js/src/internal/internalAPIs.ts`  | `ensureInitialized()` and internal state management                   |
| `packages/teams-js/src/public/app/app.ts`         | `app.initialize()` — SDK entry point                                  |
| `beachball.config.js`                             | Changefile config (scoped to `packages/teams-js`, ignores tests/docs) |
| `packages/teams-js/rollup.config.mjs`             | Build config producing ESM + UMD outputs                              |

## Limitations

**This skill CAN:**

- ✅ Guide through building, testing, and linting the SDK
- ✅ Explain monorepo structure and module patterns
- ✅ Help add new capabilities following established patterns
- ✅ Guide changefile creation and PR submission

**This skill CANNOT:**

- ❌ Help build apps that _consume_ TeamsJS (use official docs instead)
- ❌ Debug Teams host-side issues (SDK sends messages; host interprets them)
- ❌ Manage Azure DevOps pipeline configuration (`azure-pipelines.yml` is separate infra)
