import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';
import { displayCaptureAPIRequiredVersion } from '../internal/constants';

export namespace displayCapture {
  export interface DisplayCaptureProps {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
  }

  export interface Location {
    /**
    Latitude of the location
    */
    latitude: number;
    /**
    Longitude of the location
    */
    longitude: number;
    /**
    Accuracy of the coordinates captured
    */
    accuracy?: number;
    /**
    Time stamp when the location was captured
    */
    timestamp?: number;
  }

  /**
   * Fetches current user coordinates or allows user to choose location on map
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

    if (!isAPISupportedByPlatform(displayCaptureAPIRequiredVersion)) {
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
