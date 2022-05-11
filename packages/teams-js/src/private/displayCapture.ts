import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';

export interface DisplaySource {
  id: string;
  name: string;
  thumbnail: string;
  appIcon: string;
  deviceId: string;
}

export namespace displayCapture {
  export function getDisplaySources(): Promise<DisplaySource[]> {
    return new Promise<DisplaySource[]>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      sendMessageToParentAsync('displayCapture.getSources').then((sources: DisplaySource[]) => {
        resolve(sources);
      });
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.displayCapture ? true : false;
  }
}
