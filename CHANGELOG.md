# Breaking Changes

## v0.0.6

### The JavaScript library "teams-js" has been renamed to "teamsjs-app-sdk"

Renamed "teams-js" to temporary code name "teamsjs-app-sdk".

### All the public API functions have been moved under 'core' namespace

Using `import * as ... from ...` will now fail. Organized top-level library functions under a core namespace. Importing now follows the following convention:

```typescript
import { core } from "@microsoft/teamsjs-app-sdk";
```

### The teamsjs App SDK repo is now a monorepo

We utilized [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to turn our repo into a monorepo. The files specific to the App SDK has been moved to an inner directory
with the same name teamsjs-app-sdk. The monorepo also now contains the teamsjs Test App! You can find our test app under our monorepo root/examples/teamsjs-test-app/.