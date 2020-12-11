import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from './interfaces';

export namespace meeting {
  /**
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when toggle is successful
   * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function toggleIncomingClientAudio(callback: (error: SdkError | null, result: boolean | null) => void): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('toggleIncomingClientAudio');
    GlobalVars.callbacks[messageId] = callback;
  }
}
