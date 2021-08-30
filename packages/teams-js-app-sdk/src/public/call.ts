import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

export namespace call {
  export interface StartCallParams {
    // comma-separated list of user IDs representing the participants of the call.
    // Currently the User ID field supports the Azure AD UserPrincipalName,
    // typically an email address, or in case of a PSTN call, it supports a pstn
    // mri 4:<phonenumber>.
    users: string[];
    // An optional boolean parameter indicating whether the call should be a video
    // call. Default is audio-only.
    withVideo?: boolean;
    // An optional parameter that informs about the source of the deep link
    source?: string[];
  }

  export function startCall(startCallParams: StartCallParams): Promise<boolean> {
    return new Promise(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) throw 'Not supported';
      sendMessageToParent('call.startCall', [startCallParams], resolve);
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.call ? true : false;
  }
}
