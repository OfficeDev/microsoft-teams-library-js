import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import {
  FrameInfo,
  ShareDeepLinkParameters,
  TabInformation,
  TabInstance,
  TabInstanceParameters,
} from '../public/interfaces';
import { pages } from '../public/pages';
import { runtime } from '../public/runtime';
import {
  sendAndHandleStatusAndReasonWithDefaultErrorWithVersion,
  sendAndUnwrapWithVersion,
  sendMessageToParentWithVersion,
} from './communication';
import { ensureInitialized } from './internalAPIs';
// import { isNullOrUndefined } from './typeCheckUtilities';

export function navigateCrossDomainHelper(apiVersion: string, url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (!pages.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage =
      'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
    resolve(
      sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(apiVersion, 'navigateCrossDomain', errorMessage, url),
    );
  });
}

export function backStackNavigateBackHelper(apiVersion: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.backStack.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Back navigation is not supported in the current client or context.';
    resolve(sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(apiVersion, 'navigateBack', errorMessage));
  });
}

export function tabsNavigateToTabHelper(apiVersion: string, tabInstance: TabInstance): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
    resolve(
      sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(apiVersion, 'navigateToTab', errorMessage, tabInstance),
    );
  });
}

export function returnFocusHelper(apiVersion: string, navigateForward?: boolean): void {
  ensureInitialized(runtime);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersion, 'returnFocus', [navigateForward]);
}

// export function registerBackButtonHandlerHelperWithVersion(
//   apiVersion: string,
//   handler: () => boolean,
//   versionSpecificHelper?: () => void,
// ): void {
//   // allow for registration cleanup even when not finished initializing
//   !isNullOrUndefined(handler) && ensureInitialized(runtime);
//   if (versionSpecificHelper) {
//     versionSpecificHelper();
//   }
//   pages.backStack.backButtonPressHandler = handler;
//   !isNullOrUndefined(handler) && sendMessageToParentWithVersion(apiVersion, 'registerHandler', ['backButton']);
// }

export function getTabInstancesHelper(
  apiVersion: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrapWithVersion(apiVersion, 'getTabInstances', tabInstanceParameters));
  });
}

export function getMruTabInstancesHelper(
  apiVersion: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrapWithVersion(apiVersion, 'getMruTabInstances', tabInstanceParameters));
  });
}

export function shareDeepLinkHelper(apiVersion: string, deepLinkParameters: ShareDeepLinkParameters): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersion, 'shareDeepLink', [
    deepLinkParameters.subPageId,
    deepLinkParameters.subPageLabel,
    deepLinkParameters.subPageWebUrl,
  ]);
}

export function setCurrentFrameHelper(apiVersion: string, frameInfo: FrameInfo): void {
  ensureInitialized(runtime, FrameContexts.content);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersion, 'setFrameContext', [frameInfo]);
}
