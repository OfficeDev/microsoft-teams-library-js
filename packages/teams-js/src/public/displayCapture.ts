import { sendMessageToParent } from '../internal/communication';
import { displayCaptureAPIRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';

export namespace displayCapture {
  export interface DisplayCaptureProps {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }

  /**
   * @param callback Callback to invoke when the stream of selected display is fetched
   */
  export function getDisplayCapture(
    props: DisplayCaptureProps,
    callback: (error: SdkError, displayCapture: MediaStream) => void,
  ): void {
    if (!callback) {
      throw new Error('[displayCapture.getDisplayCapture] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isCurrentSDKVersionAtLeast(displayCaptureAPIRequiredVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, undefined);
      return;
    }
    if (!props) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, undefined);
      return;
    }
    sendMessageToParent('displayCapture.getDisplayCapture', [props], callback);
  }
}
