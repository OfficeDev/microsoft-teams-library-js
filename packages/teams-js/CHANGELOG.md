# Change Log - @microsoft/teams-js

This log was last generated on Thu, 03 Oct 2024 22:51:48 GMT and should not be manually modified.

<!-- Start content -->

## 2.29.0

Thu, 03 Oct 2024 22:51:48 GMT

### Minor changes

- Added support for `externalAppAuthenticationForCEA` capability
- Added support for `externalAppCardActionsForCEA` capability
- Added logging for current teamsjs instance and timestamps
- Added a Rollup built bundle of Teams-JS
- Added three properties to `ICallDetails`, `originalCallerInfo`, `dialedEntityInfo`, and `callId`, created a new type `ICallParticipantIdentifiers`, and deprecated the `originalCaller` and `dialedEntity` properties
- Updated `pages.navigateToApp` to now optionally accept a more type-safe input object
- Added logging for version on startup

### Patches

- Updated logging for messages to be clearer
- Added `edgeapi.svc.cloud.microsoft` to valid domains list
- Updated internal app id validation
- Unified common data models for external card actions into `externalAppCardActions` namespace.
- Updated types for `externalAppCardActionsForCEA` capability.

## 2.28.0

Tue, 03 Sep 2024 22:19:52 GMT

### Minor changes

- Removed invalid validations for content fields on `IContentResponse` interface

### Patches

- Fixed a bug with `AppEligibilityInformation` that could cause `app.initialize` to fail.

## 2.27.0

Wed, 28 Aug 2024 19:31:44 GMT

### Minor changes

- Added 1P-only `hostEntity` capability for adding and configuring, removing, renaming, re-configuring and fetching all tabs.
- Added optional field `messageId` to `stageView.open`. Passing `messageId` to `stageView.open` allows opening the stageView in a channel meeting
- Added optional enum attribute for `registerFocusEnterHandler` and `returnFocus` APIs that allows developers to send and receive more nuanced information about where focus should go in their app or the host respectively
- Added `copilot` and `copilot.eligibility` capability that will get the eligibility information of the user using M365ChatApp. The capability is still awaiting support in one or most host applications. To track availability of this capability across different hosts see https://aka.ms/capmatrix
- Added new `AppId` class to use as a type where app ids are being stored

### Patches

- Added `*.m365.cloud.microsoft` to dynamic domain list
- Moved `AppId` type to public folder
- Enabled `webStorage` capability to be used on Teams Mobile in compatibility scenarios
- Updated documentation on usage of `versionAndPlatformAgnosticTeamsRuntimeConfig` and `mapTeamsVersionToSupportedCapabilities`

## 2.26.0

Wed, 07 Aug 2024 19:24:31 GMT

### Minor changes

- Added `self` capability that will allow the stage to perform an operation on itself (eg. close). The capability is still awaiting support in one or most host applications. To track availability of this capability across different hosts see https://aka.ms/capmatrix
- Added support for any `*.cloud.microsoft` domain to be a valid host
- Added new fields to `VideoFrameConfig` and `VideoFrameData` to allow specifying additional capabilities to be applied to a video frame and reading arbitrary attributes on a video frame respectively. The capability is still awaiting support in one or most host applications. To track availability of this capability across different hosts see https://aka.ms/capmatrix
- Added `chatId` in `pages.navigateToApp` api for deep link support in chat

### Patches

- Added WXP domain for unified store to the dynamic domain list
- Fixed behavior of the `isValidOriginsCacheEmpty` function whose name was backwards of what it was actually doing
- Updated error handling of malformed/missing origin URLs
- Updated `authentication.getUser` to properly unwrap `SdkError` returned from host into a message
- Used app and authentication apis for diagnostic app functionality.

## 2.25.0

Wed, 03 Jul 2024 18:11:19 GMT

### Patches

- Fixed `dialog.url.submit` api to support only `FrameContext.content`.
- Updated `clipboard.isSupported` so that it does not depend on `navigator.clipboard` in frameless contexts.
- Updated whitespace in `clipboard.ts` file to match conventions

## 2.24.0

Wed, 05 Jun 2024 20:49:06 GMT

### Minor changes

- Updated `app.lifecycle.registerBeforeSuspendOrTerminateHandler` to be asynchronous, and updated `app.lifecycle.registerOnResumeHandler` to accept a new Handler type, changing `contentUrl` from `string` to `URL` object.
- Added `uuid` parameter to `MessageRequest` and `MessageResponse` interfaces
- Added a new page property (`isBackgroundLoad`) for app context. This will be an indicator that the app is being loaded in the background.

## 2.23.0

Tue, 07 May 2024 20:54:35 GMT

### Minor changes

- Added a new API `externalAppAuthentication.authenticateWithPowerPlatformConnectorPlugins`. It can be used to perform authentication with Power Platform connector plugins.
- Added `messageChannels.telemetry` and moved existing telemetryPort code into it. Added new `messageChannels.dataLayer` subcapability and added code for interacting with the host data layer.
- Added `meeting.getMeetingDetailsVerbose` to allow retrieving additional meeting details from supported hosts.
- Added support for `content` frame context to `liveShare` capability. Live Share SDK works now in Chat/Channel Tab and Collab Stage view contexts with this change.

### Patches

- Cleaned up import structure in the `private` folder
- Fixed API telemetry tag for `pages.navigateToApp` function
- Updated `authentication.authenticate` so that it only accepts https URLs.
- Added `validMessageOrigins` to be passed to `parentWindow`.
- Updated `webStorage` capability to query host for capability support, rather than using a hardcoded answer.
- Fixed a bug with exported `const enums`
- Made a skeletonized version of the buffer npm package as a temporary measure to reduce bundle size

## 2.22.0

Thu, 11 Apr 2024 05:06:48 GMT

### Minor changes

- Added `OtherAppStateChange` capability that will allow limited 1P apps to receive events when other apps are installed on the host. The capability is still awaiting support in one or more host applications. To track availability of this capability across different hosts see https://aka.ms/capmatrix
- Added an optional parameter `fromElement` to `processActionOpenUrl` in `externalAppCardActions`
- Validate appId in all APIs in `externalAppAuthentication`, `externalAppCardActions` and `externalAppCommands`.
- Added nested app auth support check api for app developers
- Added a new API `externalAppAuthentication.authenticateWithOauth2`. It can be used to signal to the host to perform Oauth2 authentication for the app specified by title id.
- Added `externalAppCommands` 1P internal-only capability

### Patches

- Made some enums `const` to reduce package size
- Fixed `clipboard` issue for desktop client to resolve 'DOMExecption: Document not focused' error
- Removed one default valid origin
- Removed validation that appIds are UUIDs since some very old published apps have IDs that are not UUIDs (they were published before the manifest schema specified they had to be UUIDs)

## 2.21.0

Wed, 06 Mar 2024 22:44:18 GMT

### Minor changes

- Added `meeting.joinMeeting` function
- Removed Beta/Preview tag on `chat` capability. To track availability of this capability across different hosts see https://aka.ms/capmatrix

### Patches

- Updated all capabilities to include versions to enable hosts to identify exact function being used
- Updated documentation on `OpenSingleChatRequest` interface and updated all URLs to remove locale-specific portions.
- Updated `base64ToBlob` function to accept special characters
- Removed one default valid origin
- Fixed bug where `authentication.getUser` telemetry was being incorrectly recorded
- Fixed bug in API Version telemetry

## 2.20.0

Wed, 07 Feb 2024 18:02:49 GMT

### Minor changes

- Added communication for nested app auth
- Added private `messageChannels` capability
- Enabled acquiring of access token for cross-tenant resources
- Added new subcapability `dialog.url.parentCommunication` for dialog-parent communication related APIs. The isSupported function in this subcapability will return `false` if it is invoked from a parentless scenario.

### Patches

- Added telemetry for `appInitialization`, `appInstallDialog`, `appWindow`, `calendar`, and `videoEffectEx` capabilities.
- Added apiVersionTag for telemetry in `profile`, `search`, `secondaryBrowser`, `settings`, `sharing`, `stageView`, `videoEffects` and `visualMedia` capabilites
- Fixed bug where `thirdPartyCloudStorage.getDragAndDropFiles` failed deterministically
- Updated eslint package and fixed subsequent linting errors
- Removed unused `callbackUrl` parameter from `authentication.notifySuccess` and `authentication.notifyFailure` (in an API-compatible way)
- Added telemetry to `chat`, `interactive`, `meeting`, `menus`,`monetization` and `people` capabilities
- Added apiVersionTags for telemetry in `conversations`, `files`, `logs`, `meetingRoom` and `notifications` capabilities
- Added windows.msn.com to validOrigins list
- Added apiVersionTag for telemetry in `privateAPIs` and `remoteCamera`, `teams`, `videoEffectsEx` capabilities

## 2.19.0

Wed, 10 Jan 2024 19:55:18 GMT

### Minor changes

- Changed target TypeScript platform to ES2015 (aka ES6) from ES5
- Removed `cardActionsConfig` property from `externalAppCardActions.processActionSubmit` API
- Added `externalAppAuthentication` and `externalAppCardActions` 1P internal-only capabilities
- Added `size` property to internal `FilePreviewParameters` interface
- Added timeout notifications (2 seconds) to video frame processing in `videoEffectsEx` capability
- Added new feature to acquire list of valid origins from a CDN endpoint
- Updated the external app capabilities interfaces
- Added a new optional parameter, `shareOptions` to `meeting.shareAppContentToStage`. Apps can choose between collaborative and screen sharing for the protocol used when sharing an app to stage.
- Added support for drag and dropping files from third party storage providers using the `thirdPartyCloudStorage` capability
- Marked `composeExtension` property on `IQueryMessageExtensionResponse` as optional and added additional input validation on `externalAppAuthentication` and `externalAppCardActions` APIs
- Made `composeExtension` a required field on `IQueryMessageExtensionResponse`

### Patches

- Added support for `sharing` capability in default runtime for Teams mobile platform
- Updated runtime capabilities for webStorage to avoid duplicate entry
- Removed `app` and `app.lifecycle` from runtime.

## 2.18.0

Thu, 30 Nov 2023 23:24:44 GMT

### Minor changes

- Extended `RequestAppAudioHandlingParams` by adding `audioDeviceSelectionChangedCallback` for speaker selection updates

### Patches

- Added `meetingStage` and `settings` framecontexts to `clipboard`.
- Added additional telemetry to `App`, `Dialog`, `GeoLocation`, `Location`, `Navigation`, `Pages`, and `Tasks` capabilities
- Created new `MessageRequest` interface with required properties to enhance type-safety
- Added telemetry to `barcode`, `calendar`, `call`, `clipboard`, `mail`, `marketplace` and `media` capabilities
- Fixed strictNullChecks violations in `media.ts`, `mediaUtil.ts`, and other files
- Fixed calls to `chat.openChat` and `chat.openGroupChat` when only a single user is specified
- Fixed more `strictNullChecks` violations
- Deleted `isSupported` check from `app.lifecycle` subcapability since app resumption cannot be guaranteed even when it is supported.

## 2.17.0

Wed, 01 Nov 2023 18:15:02 GMT

### Minor changes

- Added optional field `openMode` to open `stageView` in new modes if supported by host
- Updated app.lifecycle handlers, registerBeforeSuspendOrTerminateHandler and registerOnResumeHandler, so that they will overwrite teamsCore's registered handlers, registerBeforeUnloadHandler and registerOnLoadHandler, respectively.
- Added a new capability `visualMedia` and subcapability `visualMedia.image` for capturing images from device camera and gallery

### Patches

- Started logging name of script currently executing when teamsjs is first loaded
- Exported all publicly referenced but unexported types
- Fixed some locations violating `strictNullChecks`
- Updated default runtime for Teams Mobile to indicate that `pages.appButton`, `pages.tabs`, and `stageView` are not supported.
- Deleted unnecessary subcapability named `caching` from `app.lifecycle` in runtime
- Updated capability merging code to support properly merging subcapabilities

## 2.16.0

Wed, 11 Oct 2023 16:51:27 GMT

### Minor changes

- Added `lifecycle` subcapability in `app.ts` to support caching
- Added `HostName.places` to the list of application hosts

### Patches

- Reset registered handlers for unit testing
- Renamed Teams back-compat config for clarity
- Improved reference docs for the `meeting` namespace and hid the `appShareButton` module.
- Changed namespace `video` to `videoEffects`, changed namespace `videoEx` to `videoEffectsEx`

## 2.15.0

Wed, 06 Sep 2023 20:30:49 GMT

### Minor changes

- Removed `appNotification` capability and collateral
- Added `clipboard` capability, allowing access to the system clipboard programmatically
- Added MacOS support

### Patches

- Added macOS to mobile list as macOS is also frameless.
- Replaced `window` references with `ssrSafeWindow`
- Added logging to help investigate dropped messages from hosts or embedded apps.
- Added telemetry for video frame processing
- Fixed issue that resulted in dropping first few frames when using the video capability
- Added `surfaceHub` to the list of host client types that send authenticate requests to the host instead of opening an auth window

## 2.14.0

Wed, 02 Aug 2023 14:49:19 GMT

### Minor changes

- Added permission functions for media capability
- Added new `appNotification` capability for apps to send notifications to the user through the host

### Patches

- Updated documentation to refer to 'Microsoft Entra' instead of 'AAD'
- Started collection of `video` performance data

## 2.13.0

Wed, 05 Jul 2023 16:42:51 GMT

### Minor changes

- Added support for mediaStream with metadata in `videoEx` module for internal applications.
- Added `marketplace` capability that helps app developers interact with the checkout flow
- Added `liveShare` capability, which helps with building real-time collaborative apps

### Patches

- Made title optional when calling `stageView.open`
- Removed import aliasing of communications.ts functions
- Fixed an issue where `call.startCall` would return an error when it executed successfully in a legacy environment

## 2.12.0

Wed, 07 Jun 2023 19:21:01 GMT

### Minor changes

- Embedded apps no longer incorrectly get their parameters wrapped in an array
- Added `secondaryBrowser` capability and its open API to enable browsing experience for Apps
- Deleted unnecessary 'export' from helper functions and deleted unused and unnecessary functions in `dialog` capability.
- Updated `video.registerForVideoFrame` to support both media stream and shared frame
- Added `closeSearch` to `search` capability

### Patches

- Added default value for Adaptive Card version to support adaptive card dialogs in Teams V1
- Fixed exports in `video` capability

## 2.11.0

Wed, 03 May 2023 18:17:38 GMT

### Minor changes

- Added `getClientInfo` to LiveShareHost

### Patches

- Added comments on all exported types and functions and made comments required for all future changes.

## 2.10.1

Thu, 06 Apr 2023 23:07:12 GMT

### Minor changes

- Fixed errors in `video` capability
- Removed some valid origins

### Patches

- Fixed broken documentation link and invalid markdown.
- Added `ipados` host client type check for auth flow
- Removed legacy endpoints from `IFluidTenantInfo` interface
- Added documentation to interfaces in `mail` capability
- Removed unnecessary (and outdated) docs on various `enum` properties
- `meeting.getAuthenticationTokenForAnonymousUser` can now be called from dialogs
- Added documentation for "Anonymous" as possible value for `UserInfo.licenseType`
- `sharing.isSupported` now returns the correct value on mobile platforms
- Clarified documentation on proper use of various user identity properties

## 2.9.1

Fri, 03 Mar 2023 19:57:31 GMT

### Minor changes

- Changed return type of the callback of `registerForVideoEffect` to return a Promise
- Added a new value to `HostName` enum, `TeamsModern`

### Patches

- Updated documentation for `dialog` and `tasks` capabilities
- Elaborated on various areas of `authentication` documentation
- Added @beta tags to `registerBeforeUnloadHandler` and `registerOnLoadHandler` APIs.

## 2.8.0

Wed, 01 Feb 2023 23:22:55 GMT

### Minor changes

- Added `requestAppAudioHandling` and `updateMicState` meeting APIs
- Fixed a bug where `getContext()` was incorrectly dropping properties by performing a lossy conversion via `app.getContext()`
- Added adaptive card subcapability to `dialog` capability
- Restructured `dialog.ts`. Moved all functions previously under `dialog` and `dialog.bot` to be under namespace `url`. Function calls are now `dialog.url.open` and `dialog.url.bot.open` as an example.

### Patches

- Added @beta tags to `registerBeforeUnloadHandler` and `registerOnLoadHandler` APIs.
- Updated typedoc version and fixed doc issues raised by it
- Added documentation for `dialog.submit`
- Changed user facing documentation associated with `meeting.ts`
- Unpin the version of the debug package; it was originally pinned unintentionally.
- Removed deprecated `_initialize` and `_uninitialize` methods only used by unit tests
- Added unit tests for `communication.uninitializeCommunication`, `communication.sendAndUnwrap`, and `communication.sendMessageToParentAsync` and updated `communication.uninitializeCommunication` to handle `currentWindow` correctly.
- Removed --emit:none from typedoc command so it would actually output errors
- Updated documentation links to avoid using locale in URLs and use markdown format for external links
- Added possible values to documentation for `licenseType` property on `UserInfo` interface
- Added unit tests for `communication.initializeCommunication`
- Updated `dialog` and `tasks` documentation to add and fix doc links
- Added remarks to authentication.authenticate() code comments
- Added `@hidden` and `@internal` tags for the meeting `requestAppAudioHandling` and `updateMicState` APIs, and improved how the `teams-test-app` app uses the APIs
- Stopped exporting `communication.processMessage` and `communication.shouldProcessMessage`.

## 2.7.1

Fri, 06 Jan 2023 04:15:12 GMT

### Patches

- Reverted webpack globalObject: this

## 2.7.0

Wed, 04 Jan 2023 19:07:09 GMT

### Minor changes

- Implemented `runtime` interface versioning

### Patches

- Removed `entityId` and `title` as required fields from `openFilePreview` parameters
- Fixed missing slash in URL in comment on `app.initialize`

## 2.6.1

Tue, 13 Dec 2022 21:28:59 GMT

### Patches

- Added `dataResidency` property to `UserProfile` interface to expose a limited set of data residency information to 1P app developers.
- Fixed bugs preventing the use of this library in server-side rendered applications

## 2.6.0

Wed, 07 Dec 2022 16:39:58 GMT

### Minor changes

- Added `notifyFatalError` function in videoEx to enable video apps to notify the host of fatal errors.
- Added support for showing and hiding the app share button to the `meeting` capability
- Fixed bug where some capabilities were being incorrectly marked as supported

### Patches

- Deleted unnecessary support for `meetingRoom` and `sidePanel` frame contexts in `dialog.submit` API.
- Fix incorrect profile.IsSupported check

## 2.5.0

Thu, 03 Nov 2022 17:03:30 GMT

### Minor changes

- Updated most APIs to require initialization to be fully finished before they are allowed to be called.

### Patches

- Added Outlook's consumer domain to domains' allowlist
- Updated documentation for `app.IFailedRequest.message` property to clarify that it is unused
- Set `PACKAGE_VERSION` to an error value indicating it will be replaced by webpack at build time
- Fixed `profile.isSupported` and showProfile `TriggerType`
- Added 'www.microsoft365.com' and '\*.www.microsoft365.com' to the `validOrigins` list.
- Switched from dynamic import of `LiveShareClient` to using a global window variable. Fixes an issue where dynamic imports stop working for multiple layers of webpack.

## 2.4.2

### Patches

- Fixed integrity hash in README

## 2.4.1

Mon, 10 Oct 2022 19:09:20 GMT

### Minor changes

- Added (moved) `version` as a public constant containing the library version
- Added new sub capability `pages.currentApp.navigateTo` that enables navigation within an application without specifying application ID. `pages.currentApp.navigateToDefaultPage` that navigates to first static page defined in app manifest
- Added `OutlookWin32` to `HostName` enum

### Patches

- Added one common `registerHandlerHelper` function to replace several helpers.
- Clarified possible values for `theme` property on `AppInfo` object in docs
- Updated documentation for `app.initialize` to clarify that it must have completed before calling other library methods.
- On the `File` interface changed the type of `lastModified` field from `Date` to `number`
- Fixed `search` API in test file
- Enabled proxying of window events to child frames if they are unhandled by current frame
- Added logging to `runtime` and `app` to make it easier to investigate issues surrounding app initialization.
- Fixed some locations where `undefined` was properly handled but not explicitly in the type declaration
- Reverted `liveShare` capability
- Clarified documentation for `sharepoint` property on `Context` object
- Enabled `strictNullChecks` as lint rule
- Updated the URLs for docs links.
- Enabled save and remove events in the `pages.config` capability to be proxied to child windows
- Fixed more violations of strictNullChecks warning

## 2.3.0

Thu, 08 Sep 2022 17:11:49 GMT

### Minor changes

- Added support for audio-driven avatars to the `video` API, and the ability to upload personalized video effects to the private folder
- Added `Search` capability to use global search box in the current app in Outlook
- Added `timestamp` to `VideoFrame`, sent the `timestamp` back to Teams client after the video frame has been processed.

### Patches

- Fixed an issue with the v1 versions of `register*Handler` functions. Previously if the v2 version of the API's capability was not supported, attempts to call the v1 version would throw an exception, breaking backwards compatibility.
- Updated documentation for many properties on `Context` interface.
- Updated comments on items marked with the `@internal` tag to make it clear they are intended for Microsoft use only and removed some `@internal` items from dev documentation. Removed `initializePrivateApis` from the privateAPIs file, an unexported and hidden no-op function.
- Added missing `HostClientType` values so correct `Runtime` is generated for `teams.fullTrust.joinedTeams` and `webStorage` capabilities.
- Renamed `filePath` field to `webkitRelativePath`. Removed two validation checks for `destinationFolder` fields. Added an optional field `provider` in callback of `addCloudStorageProvider` API.

## 2.2.0

Wed, 03 Aug 2022 19:21:51 GMT

### Minor changes

- Added an optional error object to `ISpeakingState` interface to align `registerSpeakingStateChangeHandler` API with other API error handling.
- Added `ActionInfo` object to the `Context` interface. This is used to pass information about an action that was taken on content from the host to the application.
- Split single `CloudStorageProviderFile` action API into 3 action APIs

### Patches

- Added clarifying comment to `dialog.submit` to indicate the dialog is closed when `submit` is called.
- Updated reference documentation links for deprecated global `Context` interface to work with typedoc system.
- Added `FrameContexts.task` to `openChat` and `openGroupChat` in chat.ts
- Added `@beta` tags to new content action-related interfaces.
- Exported publicly documented global interfaces to enable use outside the SDK.

## 2.1.0

Fri, 22 Jul 2022 16:36:44 GMT

### Minor changes

- Added `webStorage` capability with APIs to allows apps to discover if web storage is supported by the host client
- Added 3P cloud storage provider API support to files.ts
- Added `isSupported` to `stageView`
- Added `profile.showProfile` API and unit tests
- Added `meeting.registerMeetingReactionReceivedHandler`
- Added `scanBarCode` to barCode.ts from media.ts along with permission APIs `hasPermission` and `requestPermission`
- Added a new capability `geoLocation` that split the location capability into new set of functions and subcapabilities. Added permission-related APIs `hasPermission` and `requestPermission`.

### Patches

- Fixed broken SDK reference documentation links and added SDK reference documentation validation to build step.
- Ensured `submitHandler` exists before calling it in `dialog.open`, `dialog.bot.open` and `tasks.startTask` APIs.
- Added frameless unit tests for `authentication.notifySuccess` and `authentication.notifyFailure`
- Added beta tag to `barCode` capability to accurately reflect level of support offered
- Added `meeting.registerRaiseHandStateChangedHandler`
- Updated reference documentation for global deprecated `Context` interface. Each deprecated `Context` property now links to respective mapped property in `app.Context` interface.
- Enabled `FrameContexts.task` for `startCall` API in call.ts
- Fixed formatting of reference documentation for `call.StartCallParams` interface.
- Removing unnecessary `/` in `appInstallDialog.openAppInstallDialog()`
- Renamed `IRaiseHandStateChangedEvent` interface to `IRaiseHandStateChangedEventData` and changed the error so it can be assigned undefined rather than null

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
- Change DeepLinkParameters not to use subEntity\* anymore
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
