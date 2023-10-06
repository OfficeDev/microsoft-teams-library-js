import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { TabInstance } from '../public/interfaces';
import { pages } from '../public/pages';
import { runtime } from '../public/runtime';
import {
  sendAndHandleStatusAndReasonWithDefaultErrorWithVersion,
  sendMessageToParentWithVersion,
} from './communication';
import { ensureInitialized } from './internalAPIs';

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
