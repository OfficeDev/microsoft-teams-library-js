import { AppId } from '../public/appId';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import {
  FrameInfo,
  ShareDeepLinkParameters,
  TabInformation,
  TabInstance,
  TabInstanceParameters,
} from '../public/interfaces';
import * as pages from '../public/pages/pages';
import { runtime } from '../public/runtime';
import {
  Communication,
  sendAndHandleStatusAndReason,
  sendAndHandleStatusAndReasonWithDefaultError,
  sendAndUnwrap,
  sendMessageEventToChild,
  sendMessageToParent,
} from './communication';
import { ensureInitialized } from './internalAPIs';
import { ApiVersionNumber } from './telemetry';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
export const pagesTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

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
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateCrossDomain', errorMessage, url));
  });
}

export function backStackNavigateBackHelper(apiVersionTag: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.backStack.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Back navigation is not supported in the current client or context.';
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateBack', errorMessage));
  });
}

export function tabsNavigateToTabHelper(apiVersionTag: string, tabInstance: TabInstance): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateToTab', errorMessage, tabInstance));
  });
}
/**
 * @hidden
 */
export function returnFocusHelper(apiVersionTag: string, navigateForward?: boolean): void {
  ensureInitialized(runtime);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'returnFocus', [navigateForward]);
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
    resolve(sendAndUnwrap(apiVersionTag, 'getTabInstances', tabInstanceParameters));
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
    resolve(sendAndUnwrap(apiVersionTag, 'getMruTabInstances', tabInstanceParameters));
  });
}

export function shareDeepLinkHelper(apiVersionTag: string, deepLinkParameters: ShareDeepLinkParameters): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'shareDeepLink', [
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
  sendMessageToParent(apiVersionTag, 'setFrameContext', [frameInfo]);
}

export function configSetValidityStateHelper(apiVersionTag: string, validityState: boolean): void {
  ensureInitialized(runtime, FrameContexts.settings, FrameContexts.remove);
  if (!pages.config.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'settings.setValidityState', [validityState]);
}

export function getConfigHelper(apiVersionTag: string): Promise<pages.InstanceConfig> {
  return new Promise<pages.InstanceConfig>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.sidePanel,
    );
    if (!pages.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(sendAndUnwrap(apiVersionTag, 'settings.getSettings'));
  });
}

export function configSetConfigHelper(apiVersionTag: string, instanceConfig: pages.InstanceConfig): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
    if (!pages.config.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(sendAndHandleStatusAndReason(apiVersionTag, 'settings.setSettings', instanceConfig));
  });
}

export function isAppNavigationParametersObject(
  obj: pages.AppNavigationParameters | pages.NavigateToAppParams,
): obj is pages.AppNavigationParameters {
  return obj.appId instanceof AppId;
}

export function convertNavigateToAppParamsToAppNavigationParameters(
  params: pages.NavigateToAppParams,
): pages.AppNavigationParameters {
  return {
    ...params,
    appId: new AppId(params.appId),
    webUrl: params.webUrl ? new URL(params.webUrl) : undefined,
  };
}

export function convertAppNavigationParametersToNavigateToAppParams(
  params: pages.AppNavigationParameters,
): pages.NavigateToAppParams {
  return {
    ...params,
    appId: params.appId.toString(),
    webUrl: params.webUrl ? params.webUrl.toString() : undefined,
  };
}

export let backButtonPressHandler: (() => boolean) | undefined;

export function handleBackButtonPress(): void {
  if (!backButtonPressHandler || !backButtonPressHandler()) {
    if (Communication.childWindow) {
      // If the current window did not handle it let the child window
      sendMessageEventToChild('backButtonPress', []);
    } else {
      pages.backStack.navigateBack();
    }
  }
}

export function setBackButtonPressHandler(newBackButtonPressHandler: () => boolean): void {
  backButtonPressHandler = newBackButtonPressHandler;
}
