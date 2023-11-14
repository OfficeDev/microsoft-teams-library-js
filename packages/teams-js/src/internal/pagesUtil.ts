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

export function navigateCrossDomainHelper(apiVersionTag: string, url: string): Promise<void> {
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
      sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(apiVersionTag, 'navigateCrossDomain', errorMessage, url),
    );
  });
}

export function backStackNavigateBackHelper(apiVersionTag: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.backStack.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Back navigation is not supported in the current client or context.';
    resolve(sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(apiVersionTag, 'navigateBack', errorMessage));
  });
}

export function tabsNavigateToTabHelper(apiVersionTag: string, tabInstance: TabInstance): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
    resolve(
      sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(
        apiVersionTag,
        'navigateToTab',
        errorMessage,
        tabInstance,
      ),
    );
  });
}

export function returnFocusHelper(apiVersionTag: string, navigateForward?: boolean): void {
  ensureInitialized(runtime);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersionTag, 'returnFocus', [navigateForward]);
}

export function getTabInstancesHelper(
  apiVersionTag: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrapWithVersion(apiVersionTag, 'getTabInstances', tabInstanceParameters));
  });
}

export function getMruTabInstancesHelper(
  apiVersionTag: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrapWithVersion(apiVersionTag, 'getMruTabInstances', tabInstanceParameters));
  });
}

export function shareDeepLinkHelper(apiVersionTag: string, deepLinkParameters: ShareDeepLinkParameters): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersionTag, 'shareDeepLink', [
    deepLinkParameters.subPageId,
    deepLinkParameters.subPageLabel,
    deepLinkParameters.subPageWebUrl,
  ]);
}

export function setCurrentFrameHelper(apiVersionTag: string, frameInfo: FrameInfo): void {
  ensureInitialized(runtime, FrameContexts.content);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParentWithVersion(apiVersionTag, 'setFrameContext', [frameInfo]);
}
