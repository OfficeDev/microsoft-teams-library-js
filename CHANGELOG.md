# Breaking Changes

## v0.0.7
Corresponding microsoft-teams-library-js version: 1.9.0

### Several core API functions have been moved to 'teamsCore' namespace

API functions that are not directly implemented by the teamsjs Hub SDK that were previously under the 'core' namespace have been moved to a new namespace called 'teamsCore' for now.

Kept in 'core':
* Initialize
* getContext
* registerOnThemeChangeHandler
* shareDeepLink
* executeDeepLink

Moved to 'teamsCore':
* enablePrintCapability
* print
* registerFullScreenHandler
* registerAppButtonClickHandler
* registerAppButtonHoverEnterHandler
* registerAppButtonHoverLeaveHandler
* registerBackButtonHandler
* registerOnLoadHandler
* registerBeforeUnloadHandler
* registerChangeSettingsHandler
* getTabInstances
* getMruTabInstances
* setFrameContext
* initializeWithFrameContext

### The teamsjs Test App is moved into the monorepo

The teamsjs Test App contents are now moved into \<root\>/examples/teamsjs-test-app.


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
with the same name teamsjs-app-sdk. This prepares the repo for the addition of the teamsjs Test App which will be located under \<root\>/examples/teamsjs-test-app/.