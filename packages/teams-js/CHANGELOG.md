# Change Log - @microsoft/teams-js

This log was last generated on Fri, 13 May 2022 22:32:13 GMT and should not be manually modified.

<!-- Start content -->

## 2.0.0

Fri, 13 May 2022 22:32:13 GMT

### Major changes

- Promote 2.0.0 beta changes to stable. TeamsJS can be used to write applications with support in multiple Microsoft 365 hosts, including Teams, Outlook, and Office.

- Reverted `registerEnterSettingsHandler` back to its original name `registerChangeSettingsHandler`
- Removed deprecated `stageView.open` function that took a callback as a parameter
- Modified `enablePrintCapability` to correctly require the library be initialized before using it
- Removed `bot` namespace and APIs

- The Teams JavaScript client SDK repo has been converted to a monorepo

  - Utilized [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to turn our repo into a monorepo.
  - The files specific to the Teams client SDK have been moved to an inner directory with the name `teams-js`
  - A new TeamsJS Test App for validating the Teams client SDK has been added in the <root>/apps/teams-test-app location.

- Added `hostName` property to `Context` interface which contains the name of the host in which the app is running.

- The `Context` interface has been updated to group similar properties for better scalability in a multi-host environment.

- The `FrameContext` interface has been renamed `FrameInfo`.

- Capabilities organization introduced

  - Each capability has an `isSupported` function that is used to determine if a capability is supported in the host in which the application is running. All APIs call this function and will throw an `SdkError` with `ErrorCode.NOT_SUPPORTED_ON_PLATFORM` if it returns false.
  - Added App capability
    - The following APIs have been moved from `publicAPIs` to new `app` namespace:
      - `initialize`
      - `getContext`
      - `registerOnThemeChangeHandler`
      - `executeDeepLink` has been renamed `openLink`
    - The following APIs have been moved from `appInitialization` to `app` namespace:
      - `notifyAppLoaded`
      - `notifySuccess`
      - `notifyFailure`
      - `notifyExpectedFailure`
    - The following APIs have been added to `app` namespace:
      - `isInitialized`
      - `getFrameContext`
  - Added a Pages capability and reorganized several APIs under it:

    - The following APIs have been moved to the new `pages` namespace:
      - `registerFullScreenHandler` moved from `publicAPIs`
      - `initializeWithFrameContext` moved from `publicAPIs`
      - `navigateCrossDomain` moved from `navigation` namespace
      - `returnFocus` moved from `navigation` namespace
      - `registerFocusEnterHandler` moved from `publicAPIs`
      - `shareDeepLink` moved from `publicAPIs`
      - `DeepLinkParameters` has been renamed to `ShareDeepLinkParameters`
      - `setFrameContext` has been moved from `publicAPIs` and renamed `pages.setCurrentFrame`
      - `settings.getSettings` has been renamed `pages.getConfig`
    - Added `pages.navigateToApp` that navigates to the given application ID and page ID, with optional parameters for a WebURL (if the application cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab), and sub-page ID (for navigating to specific content within the page).
    - The following APIs have been been renamed and moved from `publicAPIs` to a new Pages.AppButton sub-capability in the new `pages.appButton` namespace:
      - `registerAppButtonClickHandler` has renamed and moved to `pages.appButton.onClick`
      - `registerAppButtonHoverEnterHandler` has renamed and moved to `pages.appButton.onHoverEnter`
      - `regsiterAppButtonHoverLeaveHandler` has renamed and moved to `pages.appButton.onHoverLeave`
    - The following APIs have been moved to a new Pages.BackStack sub-capability in the new `pages.backStack` namespace:
      - `registerBackButtonHandler` moved from `publicAPIs`
      - `navigateBack` moved from `navigation` namespace
    - The following APIs have been renamed and moved into the Pages.Config sub-capability in the `pages.config` namespace (formerly the `settings` namespace):
      - `registerEnterSettingsHandler` has renamed and moved to `pages.config.registerChangeConfigHandler`
      - `registerOnSaveHandler`
      - `registerOnRemoveHandler`
      - `setSettings` has been renamed `pages.config.setConfig`
      - `setValidityState`
    - The following APIs have been been moved from `privateAPIs` to a new Pages.FullTrust sub-capability in the new `pages.fullTrust` namespace:
      - `enterFullscreen`
      - `exitFullscreen`
    - The following APIs have been been moved to a new Pages.Tabs sub-capability in the new `pages.tabs` namespace:
      - `getTabInstances` moved from `publicAPIs`
      - `getMruTabInstances` moved from `publicAPIs`
      - `navigateToTab` moved from `navigation` namespace

  - Tasks APIs renamed and reorganized under new Dialog capability:

    - Added `dialog` capability, which has support for HTML-based dialogs, and a `dialog.bot` sub-capability has been added for bot-based dialogs. At this time, `dialog` does not support adaptive card-based dialogs.
      - The following APIs have been renamed:
        - `startTask` has been renamed `dialog.open`. It takes
          - a `UrlDialogInfo` parameter instead of `DialogInfo` to enforce only HTML based dialogs,
          - an optional `DialogSubmitHandler` callback that takes a single object parameter containing both error and result,
          - an optional `PostMessageChannel` parameter which is triggered if dialog sends a message to the app
        - `dialog.bot.open` has the same function signature except it takes `BotUrlDialogInfo` instead of `UrlDialogInfo`
        - `submitTasks` has been renamed `dialog.submit`
        - `TaskInfo` interface has been renamed `DialogInfo`
        - `TaskModuleDimension` enum has been renamed `DialogDimension`
      - Added `sendMessageToDialog` function which can be used to send messages to the dialog.
    - Added `dialog.update` sub-capability and renamed `updateTask` to `dialog.update.resize`, which now takes a `DialogSize` parameter.

  - Added TeamsCore capability

    - The following APIs have been moved from `publicAPIs` to new `teamsCore` namespace:
      - `enablePrintCapability`
      - `print`
      - `registerOnLoadHandler`
      - `registerBeforeUnloadHandler`

  - Added AppInstallDialog capability
    - `openAppInstallDialog` is added to new `appInstallDialog` namespace
  - Added Calendar capability
    - The following APIs have been added to new `calendar` namespace:
      - `openCalendarItem` is added
      - `composeMeeting` is added
  - Added Call capability
    - `startCall` is added to new `call` namespace
  - Added Mail capability
    - The following APIs have been added to the new `mail` namespace:
      - `openMailItem` is added
      - `composeMail` is added
  - Added Chat capability to new `chat` namespace to represent public chat functionality
    - Added `openChat` and `openGroupChat` to open Teams chats with one or more users
  - Added Conversations capability from existing `conversations` namespace to represent private chat functionality

    - `getChatMembers` has been moved from `privateAPIs` to `conversations` namespace

  - Added `fullTrust` and `fullTrust.joinedTeams` sub-capabilities to existing `teams` namespace
    - The following API has been moved from `privateAPIs` to a new `teams.fullTrust` namespace:
      - `getConfigSetting`
    - The following API has been moved from `privateAPIs` to a new `teams.fullTrust.joinedTeams` namespace:
      - `getUserJoinedTeams`
  - Added Notifications capability
    - `showNotification` has moved from `privateAPIs` to `notifications` namespace
  - Added the following new capabilites from existing namespaces
    - Location
    - Menus
    - Monetization
    - People
    - Sharing
    - Video
    - Logs
    - MeetingRoom
    - RemoteCamera
    - Teams
  - Added Runtime capability
    - `applyRuntimeConfig` is added

- Promises introduced

  - The following APIs that took in a callback function as a parameter now instead return a `Promise`.
    - app APIs:
      - `app.initialize`
      - `app.getContext`
    - authentication APIs：
      - `authentication.authenticate`
      - `authentication.getAuthToken`
      - `authentication.getUser`
    - conversations APIs:
      - `conversations.getChatMembers`
      - `conversations.openConversation`
    - location APIs:
      - `location.getLocation`
      - `location.showLocation`
    - meetingRoom APIs:
      - `meetingRoom.getPairedMeetingRoomInfo`
      - `meetingRoom.sendCommandToPairedMeetingRoom`
    - pages APIs：
      - `pages.navigateCrossDomain`
      - `pages.tabs.navigateToTab`
      - `pages.tabs.getTabInstances`
      - `pages.tabs.getMruTabInstances`
      - `pages.getConfig`
      - `pages.config.setConfig`
      - `pages.backStack.navigateBack`
    - people APIs:
      - `people.selectPeople`
    - teams APIs:
      - `teams.fulltrust.getConfigSetting`
      - `teams.fulltrust.getUserJoinedTeams`
    - others:
      - `ChildAppWindow.postMessage`
      - `ParentAppWindow.postMessage`
      - `appInstallDialog.openAppInstallDialog`

- Changed TypeScript to output ES6 modules instead of CommonJS

### Minor changes

- Added `dialog.initialize` function.
  - `dialog.initialize` is called during app intialization.
  - Modified `registerOnMessageFromParent` in DialogAPI.tsx for the Teams Test App to account for this new functionality.
- Copied `ParentAppWindow` functionality into `dialog` capability. In `dialog`, `ParentAppWindow.postMessage` was renamed to `dialog.sendMessageToParent(message: any): void`. `ParentAppWindow.addEventListener` was renamed to `dialog.registerOnMessageFromParent`.
- Added `runtime.isLegacy` handler for the following deep link capabilities:
  - `appInstallDialog`
  - `calendar`
  - `call`
- Changed topic parameter name to `topicName` for `executeDeepLink` call in chat.ts
- When the application host will not understand standard chat requests, added logic to send them as deep links.

### Patches

- Added a link to information about the updated `Context` in the reference documentation comments
- Updated all `@deprecated` tags to reference version 2.0.0
- Added directory field to repository info in package.json
- Added missing reference documentation comments to interfaces, functions, and enums in app.ts and appInitialization.ts
- Added missing reference documentation comments to the `pages` capability
- Added missing reference documentation comments to the `authentication` capability
- Updated reference documentation comments to rationalize 'Teams' vs 'host' occurrences and other minor edits
- Updated `dialog.open` and `dialog.bot.open` to send `DialogInfo` type over to the host instead of `UrlDialogInfo` or `BotUrlDialogInfo` types
- Added `minRuntimeConfig` to `uninitialize` for various capabilities
- Updated README.md to reflect branch rename
- In adaptive card based task modules, if the height is not provided in `taskInfo`, it will not be set to a default small size. Instead the card content will be set to fit on a Task Module.
- Added office365 Outlook to domain allowlist
- Updated comment for `initializePrivateApis` explaining that this function needs to stay for backwards compatibility purposes
- In appWindow.ts file, converted `ChildAppWindow` and `ParentAppWindow` back to synchronous calls because the promise was never being resolved.
- Fixed `teamsRuntimeConfig` (default backwards compatible host client runtime config) to not contain `location` or `people` capabilities since those are not guaranteed to be supported. Added new function to dynamically generate backwards compatible host client runtime config during initialization.
- Added `ensureInitialized` call to `registerOnMessageFromParent` function in dialog.ts and `addEventListener` function in appWindow.ts
- Removed the duplicate property of `StageLayoutControls` type in `meetingRoom` capability
- `null` runtimeConfig is no longer allowed during initialization. This will now throw a "Received runtime config is invalid" error.
- Update TSDoc `@deprecated comments` to include links to replaced APIs.
- Update webpack-dev-server types to match webpack 5 versions and stop generating module wrappers in MicrosoftTeams.d.ts.
- Fix warnings produced during documentation generation, including exporting additional existing interfaces.
- Update integrity hash to valid value in README file.
