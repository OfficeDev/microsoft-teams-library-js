import { sendMessageToParent } from '../internal/communication';
import { displayCaptureAPIRequiredVersion } from '../internal/constants';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';

export namespace displayCapture {
  export function getDisplayMedia(): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      if (!isCurrentSDKVersionAtLeast(displayCaptureAPIRequiredVersion)) {
        const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
        reject(oldPlatformError);
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
            resolve(mediaStream);
          });
      });

      sendMessageToParent('displayCapture.showDisplayPicker');
    });
  }
}
