import { ensureInitialized } from '../internal/internalAPIs';
import { version } from '../internal/constants';
import { sendMessageToParent } from '../internal/communication';

export namespace appInitialization {
  /**
   * To notify app loaded to hide loading indicator
   */
  export function notifyAppLoaded(): void {
    ensureInitialized();
    sendMessageToParent('appInitialization.appLoaded', [version]);
  }

  /**
   * To notify app Initialization successs and ready for user interaction
   */
  export function notifySuccess(): void {
    ensureInitialized();
    sendMessageToParent('appInitialization.success', [version]);
  }

  /**
   * To notify app Initialization failed
   */
  export function notifyFailure(appInitializationFailedRequest: appInitialization.IFailedRequest): void {
    ensureInitialized();
    sendMessageToParent('appInitialization.failure', [
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
