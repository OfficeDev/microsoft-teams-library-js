import { ensureInitialized } from '../internal/internalAPIs';
import { version } from '../internal/constants';
import { sendMessageToParent } from '../internal/communication';

export namespace appInitialization {
  export const Messages = {
    AppLoaded: 'appInitialization.appLoaded',
    Success: 'appInitialization.success',
    Failure: 'appInitialization.failure',
    ExpectedFailure: 'appInitialization.expectedFailure',
  };

  export enum FailedReason {
    AuthFailed = 'AuthFailed',
    Timeout = 'Timeout',
    Other = 'Other',
  }

  export enum ExpectedFailureReason {
    PermissionError = 'PermissionError',
    NotFound = 'NotFound',
    Throttling = 'Throttling',
    Offline = 'Offline',
    Other = 'Other',
  }

  export interface IFailedRequest {
    reason: FailedReason;
    message?: string;
  }

  export interface IExpectedFailureRequest {
    reason: ExpectedFailureReason;
    message?: string;
  }

  /**
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    ensureInitialized();
    sendMessageToParent(Messages.AppLoaded, [version]);
  }

  /**
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    ensureInitialized();
    sendMessageToParent(Messages.Success, [version]);
  }

  /**
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    ensureInitialized();
    sendMessageToParent(Messages.Failure, [
      appInitializationFailedRequest.reason,
      appInitializationFailedRequest.message,
    ]);
  }

  /**
   * Notifies the frame that app initialized with some expected errors.
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    ensureInitialized();
    sendMessageToParent(Messages.ExpectedFailure, [expectedFailureRequest.reason, expectedFailureRequest.message]);
  }
}
