import { ensureInitialized } from '../internal/internalAPIs';
import { version } from '../internal/constants';
import { sendMessageToParent } from '../internal/communication';

export namespace appInitialization {
  export const notifyMessages = {
    appLoaded: 'appInitialization.appLoaded',
    success: 'appInitialization.success',
    failure: 'appInitialization.failure',
    initializedWithErrors: 'appInitialization.initializedWithErrors',
  };

  /**
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    ensureInitialized();
    sendMessageToParent(notifyMessages.appLoaded, [version]);
  }

  /**
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    ensureInitialized();
    sendMessageToParent(notifyMessages.success, [version]);
  }

  /**
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    ensureInitialized();
    sendMessageToParent(notifyMessages.failure, [
      appInitializationFailedRequest.reason,
      appInitializationFailedRequest.message,
    ]);
  }

  /**
   * Notifies the frame that app initialized with some expected errors.
   */
  export function notifyInitializedWithErrors(appInitializedWithErrorsRequest: IInitWithErrorsRequest): void {
    ensureInitialized();
    sendMessageToParent(notifyMessages.initializedWithErrors, [
      appInitializedWithErrorsRequest.reason,
      appInitializedWithErrorsRequest.message,
    ]);
  }

  export enum FailedReason {
    AuthFailed = 'AuthFailed',
    Timeout = 'Timeout',
    Other = 'Other',
  }

  export enum InitializationErrorType {
    PermissionError = 'PermissionError',
    NotFound = 'NotFound',
    Other = 'Other',
  }

  export interface IFailedRequest {
    reason: appInitialization.FailedReason;
    message?: string;
  }

  export interface IInitWithErrorsRequest {
    reason: appInitialization.InitializationErrorType;
    message?: string;
  }
}
