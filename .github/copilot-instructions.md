# Copilot Instructions for microsoft-teams-library-js

## Code Style

- TypeScript with single quotes, 2-space indentation, semicolons, trailing commas, LF line endings, 120 char print width
- Explicit return types on all functions (`@typescript-eslint/explicit-function-return-type`)
- Sorted imports (`simple-import-sort`)
- Prefix unused variables with `_` (e.g., `_unusedParam`)
- Use `curly` braces for all control flow — no braceless `if`/`else`

## Design Principles

- **One representation of state** — each piece of state should have exactly one canonical representation. Never store the same state in two places or two forms.
- **Strong types over strings** — use enums, interfaces, and union types instead of raw strings. If a value has a known set of options, model it as a type.
- **Zero tolerance for repetition** — one repetition is one too many. Extract shared logic, constants, and patterns immediately.
- **Arrays: empty vs null** — use empty arrays (`[]`) to mean "none", not `null` or `undefined`. Reserve `null` for "not yet loaded" or "not applicable".
- **Units in variable names** — variables holding numbers with units must include the unit in the name (e.g., `timeoutInMs`, `fileSizeInBytes`, `durationInSeconds`).
- **Centralize extensible definitions** — when you have a class of things that people will add to over time, put all the data in one place (a single registry, map, or config). Don't spread definitions across the codebase. Make it impossible to add a new entry without defining all required fields (use TypeScript interfaces to enforce completeness).

## SDK Capability Pattern

Every public capability in `packages/teams-js/src/public/` must:
- Export an `isSupported()` function that checks `ensureInitialized(runtime) && runtime.supports.{capability}`
- Call `ensureInitialized(runtime, ...allowedFrameContexts)` before any operation
- Tag all API calls with telemetry: `getApiVersionTag(versionNumber, ApiName.Capability_Method)`
- Return `Promise<T>` for async operations
- Export parameter/result interfaces from the same module
- Throw `errorNotSupportedOnPlatform` when `isSupported()` is false

## Testing

- Test files mirror `src/` structure under `test/`
- Use the `Utils` helper class for mock window setup
- Every capability test must cover:
  - Calls before initialization throw `errorLibraryNotInitialized`
  - Each `FrameContexts` value (allowed vs disallowed)
  - `isSupported()` returns false when runtime is not initialized
- Use `beforeEach` to initialize with `app._initialize(utils.mockWindow)` and `afterEach` to call `app._uninitialize()`

## Contribution Rules

- Run `pnpm changefile` before submitting a PR — CI will fail without a beachball changefile
- Change types: `minor` (new feature), `patch` (bug fix), `none` (no published impact). Major and prerelease are disallowed.
- Changefile descriptions use past tense and backtick-wrap API names (e.g., "Added `calendar.openCalendarItem`")
- One changefile per PR only
- Bundle size for `{ app, authentication, pages }` import must stay under the limit specified in `package.json` — if your change exceeds this, investigate tree-shaking or justify the increase

## Project Structure

- `packages/teams-js/` — core SDK, the only published package
- `packages/teams-js/src/public/` — public API capabilities
- `packages/teams-js/src/private/` — internal/experimental APIs (copilot, externalAppAuth, etc.)
- `packages/teams-js/src/internal/` — shared utilities (communication, handlers, telemetry)
- `apps/` — test applications (not published)
- `tools/cli/` — utility scripts for bundle analysis and releases

## Build Commands

- `pnpm build` — build everything (from repo root)
- `cd packages/teams-js && pnpm build` — build SDK only
- `cd packages/teams-js && pnpm test` — run SDK tests
- `cd packages/teams-js && pnpm lint` — lint SDK with auto-fix
- `cd packages/teams-js && pnpm size` — check bundle size limits
