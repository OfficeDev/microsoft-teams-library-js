import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';

export namespace meetingAudio {
  interface ToggleClientAudioReturnType {
    error: SdkError | null;
    result: boolean | null;
  }
  /**
   * @private
   * Hide from docs
   * ------
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa
   * @param callback Callback contains 2 parameters, error of type SdkError and result of type boolen or null.
   * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   * error can either contain an error, incase of an error or null when toggle is successful
   * error: Incase of an error, error will not be null and have an object
   */
  export function toggleIncomingClientAudio(callback: (error: SdkError | null, result: boolean | null) => void): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('toggleIncomingClientAudio');
    GlobalVars.callbacks[messageId] = (response: ToggleClientAudioReturnType) => {
      if (response.error && response.error.errorCode) {
        callback(response.error, null);
      } else {
        callback(null, response.result);
      }
    };
  }
}
