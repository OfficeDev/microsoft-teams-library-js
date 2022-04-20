import { sendMessageToParent } from '../internal/communication';
import { displayCaptureAPIRequiredVersion } from '../internal/constants';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';

export namespace displayCapture {
  /**
   * @param callback Callback to invoke when the stream of selected display is fetched
   */
  export function getDisplayMedia(callback: (error: SdkError, displayStream: MediaStream) => void): void {
    if (!callback) {
      throw new Error('[displayCapture.getDisplayMedia] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isCurrentSDKVersionAtLeast(displayCaptureAPIRequiredVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, undefined);
      return;
    }

    registerHandler('displayCapture.displayIdPicked', (displayId: string) => {
      const mediaDevices = navigator.mediaDevices as any;
      mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: displayId,
            },
          },
        })
        .then((mediaStream: MediaStream) => {
          callback(undefined, mediaStream);
        });
    });

    sendMessageToParent('displayCapture.showDisplayPicker');
  }
}
