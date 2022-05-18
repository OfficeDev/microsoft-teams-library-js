# Change Log - @microsoft/teams-js

This log was last generated on Fri, 13 May 2022 22:32:13 GMT and should not be manually modified.

<!-- Start content -->

## 2.0.0

Fri, 13 May 2022 22:32:13 GMT

The change log comments for v2.0.0 are a consolidated summary of the comments for each beta release to describe the changes made since v1. Detailed change log comments for each beta release follow after 2.0.0.

### Major changes

- Promote 2.0.0 beta changes to stable. TeamsJS can be used to write applications with support in multiple Microsoft 365 hosts, including Teams, Outlook, and Office.
- The Teams JavaScript client SDK repo has been converted to a monorepo

  - Utilized [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to turn our repo into a monorepo.
  - The files specific to the Teams client SDK have been moved to an inner directory with the name `teams-js`
  - A new TeamsJS Test App for validating the Teams client SDK has been added in the <root>/apps/teams-test-app location.

- Reverted `registerEnterSettingsHandler` back to its original name `registerChangeSettingsHandler`
- Removed deprecated `stageView.open` function that took a callback as a parameter
- Modified `enablePrintCapability` to correctly require the library be initialized before using it
- Removed `bot` namespace and APIs
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
  - Converted existing `conversations` namespace into the Conversations capability to represent private chat functionality

    - `getChatMembers` has been moved from `privateAPIs` to `conversations` namespace

  - Added `fullTrust` and `fullTrust.joinedTeams` sub-capabilities to existing `teams` namespace
    - The following API has been moved from `privateAPIs` to a new `teams.fullTrust` namespace:
      - `getConfigSetting`
    - The following API has been moved from `privateAPIs` to a new `teams.fullTrust.joinedTeams` namespace:
      - `getUserJoinedTeams`
  - Added Notifications capability
    - `showNotification` has moved from `privateAPIs` to `notifications` namespace
  - Converted existing namespaces into the following new capabilites
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
    - Added `applyRuntimeConfig`

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

- Updated `app.initialize` to automatically listen for messages that an application is sending to a dialog. Modified `registerOnMessageFromParent` in DialogAPI.tsx for the Teams Test App to account for this new functionality.
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

## 2.0.0-beta.7

Thu, 12 May 2022 21:34:49 GMT

### Major changes

- Moved sub-capabilities and APIs within `legacy` namespace to `teams` namespace
- Reverted `registerEnterSettingsHandler` back to its original name `registerChangeSettingsHandler`
- Removed deprecated `stageView.open` function that took a callback as a parameter

### Patches

- Added missing reference documentation comments to the `pages` capability
- Added a link to information about the updated `Context` in the reference documentation comments
- Updated all `@deprecated` tags to reference version 2.0.0
- Added missing reference documentation comments to interfaces, functions, and enums in app.ts and appInitialization.ts
- Added directory field to repository info in package.json
- Added missing reference documentation comments to the `authentication` capability
- Updated reference documentation comments to rationalize 'Teams' vs 'host' occurrences and other minor edits

## 2.0.0-beta.6

Thu, 28 Apr 2022 18:25:41 GMT

### Major changes

- Updated `files` namespace to work as it did in v1 along with necessary changes to unit tests and teams-test-app
- Updated `media` namespace to work as it did in v1 along with necessary changes to unit tests and teams-test-app
- Updated `meeting` namespace to work as it did in v1 along with necessary changes to unit tests and teams-test-app
- Integrated changes from v1, week of 4/18/2022
  - `IMeetingDetails` has been renamed to `IMeetingDetailsResponse` and `IDetails` has been replaced with `IMeetingOrCallDetailsBase<T>`. As such, `meeting.getMeetingDetails()` now takes in a callback which takes in `IMeetingDetailsResponse` rather than `IMeetingDetails`.
  - `pages.returnFocus()` now works in any `FrameContext` rather than just with `FrameContext.content`.
  - Added `HostClientType.ipados`.
- Added `isSupported` checks to all functions in the following capabilities:
  - `appEntity`
  - `dialog`
  - `legacy`
  - `logs`
  - `menus`
  - `meetingRoom`
  - `monetization`
  - `notifications` (along with additional unit test cases)
  - `pages`
  - `people`
  - `remoteCamera`
  - `sharing` (along with additional unit test case)
  - `teams`
  - `teamsCore`
  - `video`
- Modified `enablePrintCapability` to correctly require the library be initialized before using it

### Minor changes

- Added `dialog.initialize` function.
  - `dialog.initialize` is called during app intialization.
  - Modified `registerOnMessageFromParent` in DialogAPI.tsx for the Teams Test App to account for this new functionality.

### Patches

- Updated `dialog.open` and `dialog.bot.open` to send `DialogInfo` type over to the host instead of `UrlDialogInfo` or `BotUrlDialogInfo` types
- Added `minRuntimeConfig` to `uninitialize` for various capabilities
- Updated README.md to reflect branch rename
- In adaptive card based task modules, if the height is not provided in `taskInfo`, it will not be set to a default small size. Instead the card content will be set to fit on a Task Module.
- Removed `@deprecated` tags from meeting.ts and media.ts
- Removed `@alpha` tags as they are not supported in the SDK reference doc generation system

## 2.0.0-beta.5

Tue, 19 Apr 2022 16:08:56 GMT

### Major changes

- Removed `PostMessageChannel` returned from `dialog.open`, added separate function `sendMessageToDialog` to make up for missing functionality
- Change DeepLinkParameters not to use subEntity* anymore
- Added `isSupported` checks to all functions and unit test cases in the following capabilities:
  - `chat`
  - `conversations`
  - `files`
  - `location`

### Minor changes

- Added `runtime.isLegacy` handler for the following deep link capabilities:
  - `appInstallDialog`
  - `calendar`
  - `call`
- Changed topic parameter name to `topicName` for `executeDeepLink` call in chat.ts

### Patches

- Moved `conversations` sub-capability out of `chat` capability and into its own top level capability in runtime.ts
- Added `isSupported` to `legacy` capability

## 2.0.0-beta.4

Wed, 13 Apr 2022 21:40:51 GMT

### Major changes

- `legacy.fullTrust.getUserJoinedTeams()` has been moved into its own sub-capability called `joinedTeams` and is now `legacy.fullTrust.joinedTeams.getUserJoinedTeams()`.
- The type `PostMessageChannel` and `sendMessageToParentFromDialog` function in `dialog` capability have been updated to no longer take callback parameters.
- Split `chat` capability into a private (`conversation`) and a public (`chat`) partition
- Updated `dialog` capability as follows:
  - The top-level `dialog` capability supports HTML-based dialogs and a `dialog.bot` sub-capability has been added for bot-based dialogs. At this time, `dialog` does not support adaptive card-based dialogs,
  - `dialog.open` takes a `UrlDialogInfo` parameter instead of `DialogInfo` to enforce only HTML based dialogs,
  - `submitHandler` callback takes a single object parameter containing both error and result,
  - `dialog.open` takes one more optional parameter named `messageFromChildHandler` which is triggered if dialog sends a message to the app,
  - `dialog.open` returns a function that can be used to send messages to the dialog instead of returning a `ChildAppWindow`,
  - `dialog.bot.open` has the same function signature except it takes `BotUrlDialogInfo` instead of `UrlDialogInfo`
- Moved `chat.openConversation` and `chat.closeConversation` into `chat.conversation` sub-capability. Added new APIs `chat.openChat` and `chat.openGroupChat` as a replacement to open Teams chats with one or more user
- Moved `dialog.resize()` function to a new `update` sub-capability and is now `dialog.update.resize()`. The parameter has been changed to `DialogSize` type
- Removed `bot` namespace and APIs.

### Minor changes

- Integrated changes from v1, week of 4/7/2022
  - Added `surfaceHub` to `HostClientType` interface
  - Added `ISpeakingState` interface and `registerSpeakingStateChangeHandler` function to meeting.ts and added appropriate unit tests to meeting.spec.ts
- Integrated changes from v1, week of 4/9/2022
  - Removed private tag for `sharing`
  - Moved `menu` APIs from private to public directories
  - Added new `files` APIs
    - `FileDownloadStatus` enum
    - `IFileItem` interface
    - `getFileDownloads` and `openDownloadFolder` functions
- Copied `ParentAppWindow` functionality into `dialog` capability. In `dialog`, `ParentAppWindow.postMessage` was renamed to `dialog.sendMessageToParent(message: any): void`. `ParentAppWindow.addEventListener` was renamed to `dialog.registerOnMessageFromParent`.
- Renamed `conversation` namespace to `conversations` for consistency
- Integrated changes from v1, week of 3/29/2022
  - The following APIs in meeting.ts will now work in the `FrameContext.meetingStage` context:
    - `shareAppContentToStage`
    - `getAppContentStageSharingCapabilities`
    - `stopSharingAppContentToStage`
    - `getAppContentStageSharingState`
- When the application host will not understand standard chat requests, added logic to send them as deep links.
- Integrated changes from v1, week of 2/28/2022
  - Added `stageView` implementation
  - Modified `dialog.resize` and `dialog.submit` to work in the following `FrameContexts` in addition to `FrameContexts.task`:
    - `sidePanel`
    - `content`
    - `meetingStage`

### Patches

- Added office365 Outlook to domain allowlist
- Updated comment for `initializePrivateApis` explaining that this function needs to stay for backwards compatibility purposes
- In appWindow.ts file, converted `ChildAppWindow` and `ParentAppWindow` back to synchronous calls because the promise was never being resolved.
- Deprecated `stageView.open` function signature that takes a callback parameter in favor of `stageView.open` function signature that returns a `Promise`
- Validated `media` architecture
- Fixed `teamsRuntimeConfig` (default backwards compatible host client runtime config) to not contain `location` or `people` capabilities since those are not guaranteed to be supported. Added new function to dynamically generate backwards compatible host client runtime config during initialization.
- Added `ensureInitialized` call to `registerOnMessageFromParent` function in dialog.ts and `addEventListener` function in appWindow.ts
- Removed the duplicate property of `StageLayoutControls` type in `meetingRoom` capability
- Deprecated `files.getFileDownloads` function signature that takes a callback parameter in favor or `files.getFileDownloads` function signature that returns a `Promise`

## 2.0.0-beta.3

Tue, 01 Mar 2022 19:50:49 GMT

### Major changes

- Moved `registerFocusEnterHandler` from `teamsCore` namespace to `pages`
- `core.shareDeepLink` has been moved to `pages.shareDeepLink`
- `core.executeDeepLink` has been renamed and moved to `app.openLink`
- `pages.config.getConfig` has been moved to `pages.getConfig`
- Added `pages.navigateToApp` that navigates to the given application ID and page ID, with optional parameters for a WebURL (if the application cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab), and sub-page ID (for navigating to specific content within the page).

### Minor changes

- Change the `VideoControllerCallback` constructor function to make the `onRecordingStarted` callback mandatory and make `onRecordingStopped` an optional property that can be passed to the constructor. This is because without the `onRecordingStopped`, the `VideoController` doesn't do anything.

### Patches

- Functions will now throw errors instead of throwing strings across the repo.
- `null` runtimeConfig is no longer allowed during initialization. This will now throw a "Received runtime config is invalid" error.

## 2.0.0-beta.2

### Patches

- Update TSDoc `@deprecated comments` to include links to replaced APIs.
- Update webpack-dev-server types to match webpack 5 versions and stop generating module wrappers in MicrosoftTeams.d.ts.
- Fix warnings produced during documentation generation, including exporting additional existing interfaces.
- Update repository URLs to reference `2.0-preview` branch.

## 2.0.0-beta.1

### Patches

- Update integrity hash to valid value in README file.

## 2.0.0-beta.0

### Major changes

- The Teams JavaScript client SDK repo is now a monorepo

  - We utilized [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to turn our repo into a monorepo. <br> The files specific to the Teams client SDK have been moved to an inner directory with the name `teams-js`
  - A new TeamsJS Test App for validating the Teams client SDK has been added in the <root>/apps/teams-test-app location.

- Several API functions have been moved and renamed. <br>
  Organized top-level library functions under a core namespace. For example, `shareDeepLink` has been moved under `core` namespace. <br> Using `import * as ... from ...` will now fail. Importing now follows the following convention: <br>

  ```ts
  import { core } from '@microsoft/teams-js';
  ```

  For more detailed API organization, please refer to the **Capabilities organization introduced** section below.

- Support for `hostName` added to Context interface <br>
  The name of the host the app is running in is now part of the application context in the `hostName` property.

- Several meeting APIs changes <br>
  `meeting.requestStartLiveStreaming` and `meeting.requestStopLiveStreaming` no longer take in the parameter liveStreamState.

- Context interface changes <br>

  - The Context interface has been updated to group similar properties for better scalability in a multi-host environment.
  - Context's `user.tenant.sku` has been renamed to `user.tenant.teamsSku` to reflect that it is used by Teams for a different purpose than from the Graph API's user.tenant.sku's.

- FrameContext changes <br>
  The `FrameContext` interface has been renamed `FrameInfo`.

- appEntity.selectAppEntity now takes in an additional parameter and the callback has reversed parameters with one one of them becoming optional.
  ```
  selectAppEntity(
    threadId: string,
    categories: string[],
    callback: (appEntity: AppEntity, sdkError?: SdkError) => void,
  ): void
  ```
  is now:
  ```
  selectAppEntity(
    threadId: string,
    categories: string[],
    subEntityId: string,
    callback: (sdkError?: SdkError, appEntity?: AppEntity) => void,
  ): void
  ```
- threadId parameter removed from callback passed into teams.refreshSiteUrl()

  ```
  refreshSiteUrl(threadId: string, callback: (threadId: string, error: SdkError) => void): void
  ```

  is now:

  ```
  refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void
  ```

- Capabilities organization introduced

  - Added App capability
    - The following APIs have been moved from `publicAPIs` to new `app` namespace:
      - `initialize`
      - `getContext`
      - `registerOnThemeChangeHandler`
    - The following APIs have been moved from `appInitialization` to `app` namespace:
      - `notifyAppLoaded`
      - `notifySuccess`
      - `notifyFailure`
      - `notifyExpectedFailure`
    - The following APIs have been added to `app` namespace:
      - `isInitialized`
      - `getFrameContext`
  - Added Core capability
    - The following APIs have been moved from `publicAPIs` to new `core` namespace:
      - `shareDeepLink`
      - `executeDeepLink`
  - Several APIs reorganized under new Pages capability:

    - The following APIs have been moved to the new `pages` namespace:
      - `registerFullScreenHandler`
      - `initializeWithFrameContext`
      - `navigateCrossDomain`
      - `returnFocus`
      - `setFrameContext` has been renamed `pages.setCurrentFrame`
    - The following APIs have been been renamed and moved from `publicAPIs` to a new Pages.AppButton sub-capability in the new `pages.appButton` namespace:
      - `registerAppButtonClickHandler` has renamed and moved to `pages.appButton.onClick`
      - `registerAppButtonHoverEnterHandler` has renamed and moved to `pages.appButton.onHoverEnter`
      - `regsiterAppButtonHoverLeaveHandler` has renamed and moved to `pages.appButton.onHoverLeave`
    - The following APIs have been moved to a new Pages.BackStack sub-capability in the new `pages.backStack` namespace:
      - `registerBackButtonHandler`
      - `navigateBack`
    - The following APIs have been renamed and moved into the Pages.Config sub-capability in the `pages.config` namespace (formerly the `settings` namespace):
      - `registerEnterSettingsHandler` has renamed and moved to `pages.config.registerChangeConfigHandler`
      - `getSettings` has been renamed `pages.config.getConfig`
      - `setSettings` has been renamed `pages.config.setConfig`
    - The following APIs have been been moved from `privateAPIs` to a new Pages.FullTrust sub-capability in the new `pages.fullTrust` namespace:
      - `enterFullscreen`
      - `exitFullscreen`
    - The following APIs have been been moved to a new Pages.Tabs sub-capability in the new `pages.tabs` namespace:
      - `getTabInstances`
      - `getMruTabInstances`
      - `navigateToTab`

  - Added Dialog capability, renamed `tasks` namespace to `dialog`, and renamed APIs

    - The following APIs have been renamed:
      - `startTask` has been renamed `dialog.open`
      - `submitTasks` has been renamed `dialog.submit`
      - `updateTask` has been renamed `dialog.resize`
      - `TaskInfo` interface has been renamed `DialogInfo`
      - `TaskModuleDimension` enum has been renamed `DialogDimension`

  - Added TeamsCore capability

    - The following APIs have been moved from `publicAPIs` to new `teamsCore` namespace:
      - `enablePrintCapability`
      - `print`
      - `registerOnLoadHandler`
      - `registerBeforeUnloadHandler`
      - `registerFocusEnterHandler`

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
  - Added Chat capability and renamed `conversations` namespace to `chat`
    - `openConversation` and `closeConversation` have been moved to `chat` namespace
    - `getChatMembers` has been moved to `chat` namespace
  - Added Files capability
    - `openFilePreview` has moved from `privateAPIs` to `files` namespace
  - Added Legacy capability
    - The following APIs have been moved from `privateAPIs` to a new `legacy.fullTrust` namespace:
      - `getUserJoinedTeams`
      - `getConfigSetting`
  - Added Notifications capability
    - `showNotification` has moved from `privateAPIs` to `notifications` namespace
  - Converted existing namespaces into the following new capabilites
    - Location
    - Media
    - Meeting
    - Monetization
    - People
    - Sharing
    - Video
    - Bot
    - Logs
    - MeetingRoom
    - Menus
    - RemoteCamera
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
    - calendar APIs:
      - `calendar.openCalendarItem`
      - `calendar.composeMeeting`
    - chat APIs:
      - `chat.getChatMembers`
      - `chat.openConversation`
    - files APIs:
      - `files.addCloudStorageFolder`
      - `files.deleteCloudStorageFolder`
      - `files.getCloudStorageFolderContents`
      - `files.getCloudStorageFolders`
    - legacy APIs:
      - `legacy.fulltrust.getConfigSetting`
      - `legacy.fulltrust.getUserJoinedTeams`
    - location APIs:
      - `location.getLocation`
      - `location.showLocation`
    - mail APIs:
      - `mail.openMailItem`
      - `mail.composeMail`
    - media APIs:
      - `media.captureImage`
      - `media.selectMedia`
      - `media.viewImages`
      - `media.scanBarCode`
    - meeting APIs:
      - `meeting.getAppContentStageSharingState`
      - `meeting.getAppContentStageSharingCapabilities`
      - `meeting.getAuthenticationTokenForAnonymousUser`
      - `meeting.getIncomingClientAudioState`
      - `meeting.getLiveStreamState`
      - `meeting.getMeetingDetails`
      - `meeting.requestStartLiveStreaming`
      - `meeting.requestStopLiveStreaming`
      - `meeting.shareAppContentToStage`
      - `meeting.stopSharingAppContentToStage`
      - `meeting.toggleIncomingClientAudio`
    - meetingRoom APIs:
      - `meetingRoom.getPairedMeetingRoomInfo`
      - `meetingRoom.sendCommandToPairedMeetingRoom`
    - pages APIs：
      - `pages.navigateCrossDomain`
      - `pages.tabs.navigateToTab`
      - `pages.tabs.getTabInstances`
      - `pages.tabs.getMruTabInstances`
      - `pages.config.getConfig`
      - `pages.config.setConfig`
      - `pages.backStack.navigateBack`
    - people APIs:
      - `people.selectPeople`
    - others:
      - `ChildAppWindow.postMessage`
      - `ParentAppWindow.postMessage`
      - `core.executeDeepLink`
      - `appInstallDialog.openAppInstallDialog`
      - `call.startCall`

- Changed TypeScript to output ES6 modules instead of CommonJS
