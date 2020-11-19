import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { version } from '../internal/constants';

export namespace appInitialization {
  /**
   * To notify app loaded to hide loading indicator
   */
  export function notifyAppLoaded(): void {
    ensureInitialized();
    sendMessageRequestToParent('appInitialization.appLoaded', [version]);
  }

  /**
   * To notify app Initialization successs and ready for user interaction
   */
  export function notifySuccess(): void {
    ensureInitialized();
    sendMessageRequestToParent('appInitialization.success', [version]);
  }

  /**
   * To notify app Initialization failed
   */
  export function notifyFailure(appInitializationFailedRequest: appInitialization.IFailedRequest): void {
    ensureInitialized();
    sendMessageRequestToParent('appInitialization.failure', [
      appInitializationFailedRequest.reason,
      appInitializationFailedRequest.message,
    ]);
  }

  export enum FailedReason {
    AuthFailed = 'AuthFailed',
    Timeout = 'Timeout',
    Other = 'Other',
  }

  export interface IFailedRequest {
    reason: appInitialization.FailedReason;
    message?: string;
  }
}
