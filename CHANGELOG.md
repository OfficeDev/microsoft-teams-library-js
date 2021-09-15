# Breaking Changes

## v0.1.2

### Promises introduced

The following APIs that took in a callback function as a parameter now instead return a Promise.

* Location.getLocation
* Location.showLocation

## v0.1.1

### Moved APIs
The following APIs have been renamed and moved from `pages` to a new `pages.appButton` sub-capability
* `registerAppButtonClickHandler` has moved to `pages.appButton.onClick`
* `registerAppButtonHoverEnterHandler` has moved to `pages.appButton.onHoverEnter`
* `regsiterAppButtonHoverLeaveHandler` has moved to `pages.appButton.onHoverLeave`

## v0.1.0

### Context interface changes
The Context interface has been updated to group similar properties for better scalability in a multi-hub environment.

### FrameContext changes
FrameContext's user.tenant.sku has been renamed to user.tenant.teamsSku to reflect that it is used by Teams for a different purpose than from the Graph API's user.tenant.sku's.

### Promises introduced
The following APIs that took in a callback function as a parameter now instead return a Promise. 
  * ChildAppWindow.postMessage
  * ParentAppWindow.postMessage
  * authentication APIs
  * core.executeDeepLink
  * app.initialize
  * app.getContext
  * pages APIs

### Fixed: FrameContexts.dialog deleted for back compat 
FrameContexts.dialog from public/constants.ts is deleted and all instances where it's used is replaced by FrameContexts.task to fix an internal back compat issue.

### Fixed: app.initialize() in Teams
The App SDK can now assign a default runtime in case the Hub does not provide a runtime. The only case this is currently expected to happen is when the said Hub is Teams. 

### MOS Test App dialog.submit changes
In the MOS test app, dialog.submit() will now take in a JSON string with optional keys result and appIds rather than a string of just result.

### Moved APIs
The following APIs have been moved from `teams.fullTrust` to `legacy.fullTrust`:
* `getUserJoinedTeams`
* `getConfig`
* `isSupported`

The following APIs have been moved from `core` to `app`:
* `initialize`
* `getContext`
* `registerOnThemeChangeHandler`

The following APIs have been moved from `appInitialization` to `app`:
* `notifyAppLoaded`
* `notifySuccess`
* `notifyFailure`
* `notifyExpectedFailure`

### Breaking changes from Teams JS Client SDK repo
meeting.requestStartLiveStreaming and meeting.requestStopLiveStreaming no longer take in the parameter liveStreamState.


## v0.0.11
Corresponding microsoft-teams-library-js version: 1.9.0

### More Capabilities organized
The following capabilities have been used to reorganize several existing APIs in the App SDK:

#### `conversations` namespace has been renamed `chat`
`openConversation` and `closeConversation` have been moved to `chat` capability
`getChatMembers` has been moved to `chat` capability

#### Several APIs reorganized under `pages`, `pages.config` and new `pages.backStack` capability
The following APIs have been moved from `teamsCore` to `pages`:
* `registerFullScreenHandler`
* `registerAppButtonClickHandler`
* `registerAppButtonHoverEnterHandler`
* `regsiterAppButtonHoverLeaveHandler`
* `initializeWithFrameContext`
* `setFrameContext` has been renamed `setCurrentFrame`
* `registerChangeSettingsHandler` has been renamed to `registerChangeConfigHandler` and moved to `pages.config` (in microsoft-teams-library-js v1.10.0, `registerChangeSettingsHandler` was changed to `registerEnterSettingsHandler`)
* `registerBackButtonHandler` has moved to `pages.backStack.registerBackButtonHandler`

The `pages.navigateBack` API has moved to `pages.backStack.navigateBack`

The `FrameContext` interface has been renamed `FrameInfo`

### Support for `hostName` added to context
The name of the hub the app is running in is now part of the application context in the `hostName` property. For details on how to use this property correctly, please view the [Hub Name and Capabilities](https://office.visualstudio.com/ISS/_wiki/wikis/teamsjs%20Docs/31719/Hub-Name-And-Capabilities) page.


## v0.0.10
Corresponding microsoft-teams-library-js version: 1.9.0

### New Capabilities organization introduced

The following capabilities have been used to reorganize several existing APIs in the App SDK:

#### `Tasks` namespace has been renamed `Dialog` and the following APIs have been renamed
* `startTask` has been renamed `open`
* `submitTasks` has been renamed `submit`
* `updateTask` has been renamed `resize`
* `TaskModuleDimension` enum has been renamed `DialogDimension`

#### `Settings` namespace has been renamed `Pages.Config` and the following APIs have been renamed
* `getSettings` has been renamed `getConfig`
* `setSettings` has been renamed `setConfig`

#### Several APIs have been moved from `teamsCore` namespace
* `getTabInstances`, `getMruTabInstances`, `navigateToTab` APIs have moved to `pages.tabs` capability
* `navigateCrossDomain`, `returnFocus`, `navigateBack` APIs have moved to `pages` capability

#### Added Notifications capability
* `showNotification` has moved to `notifications` capability

**We reserve the right to change the grouping based on teamsjs API Reviews, which are still in progress.**

### `teamsCore` namespace now exported
Fixed a bug where the `teamsCore` namespace wasn't exported.

## v0.0.7
Corresponding microsoft-teams-library-js version: 1.9.0

### Several core API functions have been moved to 'teamsCore' namespace

API functions that are not directly implemented by the teamsjs Hub SDK that were previously under the 'core' namespace have been moved to a new namespace called 'teamsCore' for now.
This teamsCore namespace is temporary and APIs will move again when the work to organize them by capability is completed.

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