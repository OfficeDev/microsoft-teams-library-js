# Breaking Changes

## v2.0.0-beta.0 release

### The Teams JavaScript client SDK repo is now a monorepo
We utilized [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) to turn our repo into a monorepo. The files specific to the Teams client SDK have been moved to an inner directory
with the name `teams-js`. A new TeamsJS Test App for validating the Teams client SDK has been added in the <root>/apps/teams-test-app location.

### Several API functions have been moved and renamed

Organized top-level library functions under a core namespace. For example, `shareDeepLink` has been moved under `core` namespace.
Using `import * as ... from ...` will now fail. Importing now follows the following convention:

```typescript
import { core } from "@microsoft/teams-js";
```

For more detailed API organization, please refer to the **Capabilities organization introduced** section below.

### Support for `hostName` added to Context interface

The name of the host the app is running in is now part of the application context in the `hostName` property.

### Several meeting APIs changes

meeting.requestStartLiveStreaming and meeting.requestStopLiveStreaming no longer take in the parameter liveStreamState.

### Context interface changes

The Context interface has been updated to group similar properties for better scalability in a multi-host environment.

### FrameContext changes

FrameContext's user.tenant.sku has been renamed to user.tenant.teamsSku to reflect that it is used by Teams for a different purpose than from the Graph API's user.tenant.sku's.
The `FrameContext` interface has been renamed `FrameInfo`.

### appEntity.selectAppEntity now takes in an additional parameter and the callback has reversed parameters with one one of them becoming optional.

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

### threadId parameter removed from callback passed into teams.refreshSiteUrl()

```
refreshSiteUrl(threadId: string, callback: (threadId: string, error: SdkError) => void): void
```
is now:
```
refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void
```

### Capabilities organization introduced

#### Added App capability

The following APIs have been moved from `publicAPIs` to new `app` namespace:
* `initialize`
* `getContext`
* `registerOnThemeChangeHandler`

The following APIs have been moved from `appInitialization` to `app` namespace:
* `notifyAppLoaded`
* `notifySuccess`
* `notifyFailure`
* `notifyExpectedFailure`

The following APIs have been added to `app` namespace:
* `isInitialized`
* `getFrameContext`

#### Added Core capability

The following APIs have been moved from `publicAPIs` to new `core` namespace:
* `shareDeepLink`
* `executeDeepLink`

#### Several APIs reorganized under new Pages capability

The following APIs have been moved to the new `pages` namespace:
* `registerFullScreenHandler`
* `initializeWithFrameContext`
* `navigateCrossDomain`
* `returnFocus`
* `setFrameContext` has been renamed `pages.setCurrentFrame`

The following APIs have been been renamed and moved from `publicAPIs` to a new Pages.AppButton sub-capability in the new `pages.appButton` namespace:
* `registerAppButtonClickHandler` has renamed and moved to `pages.appButton.onClick`
* `registerAppButtonHoverEnterHandler` has renamed and moved to `pages.appButton.onHoverEnter`
* `regsiterAppButtonHoverLeaveHandler` has renamed and moved to `pages.appButton.onHoverLeave`

The following APIs have been moved to a new Pages.BackStack sub-capability in the new `pages.backStack` namespace:
* `registerBackButtonHandler`
* `navigateBack`

The following APIs have been renamed and moved into the Pages.Config sub-capability in the `pages.config` namespace (formerly the `settings` namespace):
* `registerEnterSettingsHandler` has renamed and moved to `pages.config.registerChangeConfigHandler`
* `getSettings` has been renamed `pages.config.getConfig`
* `setSettings` has been renamed `pages.config.setConfig`

The following APIs have been been moved from `privateAPIs` to a new Pages.FullTrust sub-capability in the new `pages.fullTrust` namespace:
* `enterFullscreen`
* `exitFullscreen`

The following APIs have been been moved to a new Pages.Tabs sub-capability in the new `pages.tabs` namespace:
* `getTabInstances`
* `getMruTabInstances`
* `navigateToTab`

#### Added Dialog capability, renamed `tasks` namespace to `dialog`, and renamed APIs

The following APIs have been renamed:
* `startTask` has been renamed `dialog.open`
* `submitTasks` has been renamed `dialog.submit`
* `updateTask` has been renamed `dialog.resize`
* `TaskInfo` interface has been renamed `DialogInfo`
* `TaskModuleDimension` enum has been renamed `DialogDimension`

#### Added TeamsCore capability

The following APIs have been moved from `publicAPIs` to new `teamsCore` namespace:
* `enablePrintCapability`
* `print`
* `registerOnLoadHandler`
* `registerBeforeUnloadHandler`
* `registerFocusEnterHandler`

#### Added AppInstallDialog capability

* `openAppInstallDialog` is added to new `appInstallDialog` namespace

#### Added Calendar capability

The following APIs have been added to new `calendar` namespace:
* `openCalendarItem` is added
* `composeMeeting` is added

#### Added Call capability

* `startCall` is added to new `call` namespace

#### Added Mail capability
The following APIs have been added to the new `mail` namespace:
* `openMailItem` is added
* `composeMail` is added

#### Added Chat capability and renamed `conversations` namespace to `chat`

* `openConversation` and `closeConversation` have been moved to `chat` namespace
* `getChatMembers` has been moved to `chat` namespace

#### Added Files capability
* `openFilePreview` has moved from `privateAPIs` to `files` namespace

#### Added Legacy capability

The following APIs have been moved from `privateAPIs` to a new `legacy.fullTrust` namespace:
* `getUserJoinedTeams`
* `getConfigSetting`

#### Added Notifications capability

* `showNotification` has moved from `privateAPIs` to `notifications` namespace

#### Added Location, Media and Meeting capabilities

#### Added Runtime capability
* `applyRuntimeConfig` is added

### Promises introduced

The following APIs that took in a callback function as a parameter now instead return a Promise.

app APIs:
* app.initialize
* app.getContext

authentication APIs：
* authentication.authenticate
* authentication.getAuthToken
* authentication.getUser

calendar APIs:
* calendar.openCalendarItem
* calendar.composeMeeting

chat APIs:
* chat.getChatMembers
* chat.openConversation

files APIs:
* files.addCloudStorageFolder
* files.deleteCloudStorageFolder
* files.getCloudStorageFolderContents
* files.getCloudStorageFolders

legacy APIs:
* legacy.fulltrust.getConfigSetting
* legacy.fulltrust.getUserJoinedTeams

location APIs:
* location.getLocation
* location.showLocation

mail APIs:
* mail.openMailItem
* mail.composeMail

media APIs:
* media.captureImage
* media.selectMedia
* media.viewImages
* media.scanBarCode

meeting APIs:
* meeting.getAppContentStageSharingState
* meeting.getAppContentStageSharingCapabilities
* meeting.getAuthenticationTokenForAnonymousUser
* meeting.getIncomingClientAudioState
* meeting.getLiveStreamState
* meeting.getMeetingDetails
* meeting.requestStartLiveStreaming
* meeting.requestStopLiveStreaming
* meeting.shareAppContentToStage
* meeting.stopSharingAppContentToStage
* meeting.toggleIncomingClientAudio

meetingRoom APIs:
* meetingRoom.getPairedMeetingRoomInfo
* meetingRoom.sendCommandToPairedMeetingRoom

pages APIs：
* pages.navigateCrossDomain
* pages.tabs.navigateToTab
* pages.tabs.getTabInstances
* pages.tabs.getMruTabInstances
* pages.config.getConfig
* pages.config.setConfig
* pages.backStack.navigateBack

people APIs:
* people.selectPeople

others:
* ChildAppWindow.postMessage
* ParentAppWindow.postMessage
* core.executeDeepLink
* appInstallDialog.openAppInstallDialog
* call.startCall