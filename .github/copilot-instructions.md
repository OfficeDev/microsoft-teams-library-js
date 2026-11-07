# Copilot Instructions for microsoft-teams-library-js

## Code Style

- TypeScript with single quotes, 2-space indentation, semicolons, trailing commas, LF line endings, 120 char print width
- Explicit return types on all functions (`@typescript-eslint/explicit-function-return-type`)
- Sorted imports (`simple-import-sort`)
- Prefix unused variables with `_` (e.g., `_unusedParam`)
- Use `curly` braces for all control flow — no braceless `if`/`else`

## Design Principles

- **Descriptive variable names** — use clear and descriptive names for variables, functions, and classes to improve readability and maintainability. Always prefer clarity over brevity.
- **One representation of state** — each piece of state should have exactly one canonical representation. Never store the same state in two places or two forms.
- **Strong types over strings** — use enums, interfaces, and union types instead of raw strings. If a value has a known set of options, model it as a type.
- **Zero tolerance for repetition** — one repetition is one too many. Extract shared logic, constants, and patterns immediately.
- **Arrays: empty vs null** — use empty arrays (`[]`) to mean "none", not `null` or `undefined`. Reserve `null` for "not yet loaded" or "not applicable".
- **Units in variable names** — variables holding numbers with units must include the unit in the name (e.g., `timeoutInMs`, `fileSizeInBytes`, `durationInSeconds`).
- **Centralize extensible definitions** — when you have a class of things that people will add to over time, put all the data in one place (a single registry, map, or config). Don't spread definitions across the codebase. Make it impossible to add a new entry without defining all required fields (use TypeScript interfaces to enforce completeness).

## SDK Capability Pattern

Every public capability in `packages/teams-js/src/public/` must:
- Export an `isSupported()` function that checks `ensureInitialized(runtime) && runtime.supports.{capability}`
- Call `ensureInitialized(runtime, ...allowedFrameContexts)` before any operation. Newly added capabilities should never specify allowed frame contexts so as to use the runtime as the source of truth for supported capabilities.
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

## Change Organization

- **One logical change per PR** — each pull request should represent a single coherent idea: one new capability, one refactor, one bug fix. If a task requires both a refactor and a new feature, split them into separate PRs with the refactor landing first.
- **Reviewable size** — aim for PRs that a reviewer can hold in their head at once. If a PR touches more than ~10 files or ~400 lines of diff, look for natural seams to split it. Common split points: infrastructure/types first, then implementation, then tests for new behavior, then documentation.
- **Commits tell a story** — within a PR, each commit should compile and pass tests. Order commits so reviewers can follow the progression: types/interfaces → implementation → tests → wiring/integration.
- **Separate mechanical from meaningful** — keep automated or mechanical changes (renames, import reordering, lint fixes, file moves) in their own commits or PRs so reviewers can skip them quickly and focus on behavioral changes.

## PR Review Guidelines

- **Propose splitting large PRs** — when reviewing a PR that is large (roughly >400 lines of meaningful diff) or crosses multiple unrelated concerns, suggest a concrete split plan. Name the proposed child PRs, what files/changes go in each, and the order they should land. Frame the suggestion constructively: explain how splitting will speed up review and reduce merge risk.
- **Evaluate cohesion** — a good PR changes things that change for the same reason. Flag changes that bundle unrelated work (e.g., a bug fix mixed with a feature, or a refactor mixed with new API surface). Each separable concern should be its own PR.
- **Identify safe landing order** — when proposing a split, suggest the dependency-safe merge order (e.g., "Land the type definitions first, then the implementation PR can build on them"). Ensure each proposed sub-PR is independently shippable and leaves the codebase in a working state.

## Build Commands

- `pnpm build` — build everything (from repo root)
- `cd packages/teams-js && pnpm build` — build SDK only
- `cd packages/teams-js && pnpm test` — run SDK tests
- `cd packages/teams-js && pnpm lint` — lint SDK with auto-fix
- `cd packages/teams-js && pnpm size` — check bundle size limits
