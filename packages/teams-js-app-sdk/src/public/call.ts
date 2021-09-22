import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

export namespace call {
  export enum CallModalities {
    Unknown = 'unknown',
    Audio = 'audio',
    Video = 'video',
    VideoBasedScreenSharing = 'videoBasedScreenSharing',
    Data = 'data',
  }

  export interface StartCallParams {
    // comma-separated list of user IDs representing the participants of the call.
    // Currently the User ID field supports the Azure AD UserPrincipalName,
    // typically an email address, or in case of a PSTN call, it supports a pstn
    // mri 4:<phonenumber>.
    targets: string[];
    // List of modalities for the call. Defaults to [“audio”].
    requestedModalities?: CallModalities[];
    // An optional parameter that informs about the source of the deep link
    source?: string;
  }

  /**
   * Starts a call with other users
   * @param startCallParams Parameters for the call
   * @returns If the call is accepted
   */
  export function startCall(startCallParams: StartCallParams): Promise<boolean> {
    return new Promise(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) throw 'Not supported';
      return sendMessageToParent('call.startCall', [startCallParams], resolve);
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.call ? true : false;
  }
}
