import { app } from './app';

/**
 * @deprecated with TeamsJS v2 upgrades
 */
export namespace appInitialization {
  /**
   * @deprecated with TeamsJS v2 upgrades
   */
  export import Messages = app.Messages;
  /**
   * @deprecated with TeamsJS v2 upgrades
   */
  export import FailedReason = app.FailedReason;
  /**
   * @deprecated with TeamsJS v2 upgrades
   */
  export import ExpectedFailureReason = app.ExpectedFailureReason;
  /**
   * @deprecated with TeamsJS v2 upgrades
   */
  export import IFailedRequest = app.IFailedRequest;
  /**
   * @deprecated with TeamsJS v2 upgrades
   */
  export import IExpectedFailureRequest = app.IExpectedFailureRequest;

  /**
   * @deprecated with TeamsJS v2 upgrades
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    app.notifyAppLoaded();
  }

  /**
   * @deprecated with TeamsJS v2 upgrades
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    app.notifySuccess();
  }

  /**
   * @deprecated with TeamsJS v2 upgrades
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    app.notifyFailure(appInitializationFailedRequest);
  }

  /**
   * @deprecated with TeamsJS v2 upgrades
   * Notifies the frame that app initialized with some expected errors.
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    app.notifyExpectedFailure(expectedFailureRequest);
  }
}
