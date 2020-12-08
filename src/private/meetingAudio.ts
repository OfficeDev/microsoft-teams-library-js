import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';

export namespace meetingAudio {
  export interface IToggleClientAudio {
    /**
     * error can either contain an error of type SdkError, incase of an error, or null when toggle is successful
     */
    error: SdkError | null;
    /**
     * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
     * result: True means incoming audio is muted and false means incoming audio is unmuted
     */
    result: boolean | null;
  }
  /**
   * @private
   * Hide from docs
   * ------
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa
   * @param callback Callback contains 1 parameter of type IToggleClientAudio. This parameter is an object which contains error or type SdkError or null and result of type boolean or null
   */
  export function toggleIncomingClientAudio(callback: (response: IToggleClientAudio) => void): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('toggleIncomingClientAudio');
    GlobalVars.callbacks[messageId] = callback;
  }
}
