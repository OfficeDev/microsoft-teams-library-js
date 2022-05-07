import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';
export namespace displayCapture {
  export function getDisplayMedia(): Promise<MediaStream> {
    return new Promise<MediaStream>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      sendMessageToParentAsync('displayCapture.showDisplayPicker').then((displayId: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.displayCapture ? true : false;
  }
}
