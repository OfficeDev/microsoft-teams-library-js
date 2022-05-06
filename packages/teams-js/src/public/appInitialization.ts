import { app } from './app';

/**
 * @deprecated
 * As of 2.0.0, please use {@link app} namespace instead.
 */
export namespace appInitialization {
  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Messages} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Messages = app.Messages;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.FailedReason} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import FailedReason = app.FailedReason;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.ExpectedFailureReason} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ExpectedFailureReason = app.ExpectedFailureReason;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.IFailedRequest} instead.
   */
  export import IFailedRequest = app.IFailedRequest;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.IExpectedFailureRequest} instead.
   */
  export import IExpectedFailureRequest = app.IExpectedFailureRequest;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.notifyAppLoaded app.notifyAppLoaded(): void} instead.
   *
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    app.notifyAppLoaded();
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.notifySuccess app.notifySuccess(): void} instead.
   *
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    app.notifySuccess();
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.notifyFailure app.notifyFailure(appInitializationFailedRequest: IFailedRequest): void} instead.
   *
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
   * during initialization as well as an optional message.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    app.notifyFailure(appInitializationFailedRequest);
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.notifyExpectedFailure app.notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void} instead.
   *
   * Notifies the frame that app initialized with some expected errors.
   * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    app.notifyExpectedFailure(expectedFailureRequest);
  }
}
