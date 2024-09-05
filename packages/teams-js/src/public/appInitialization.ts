import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import {
  app,
  notifyAppLoadedHelper,
  notifyExpectedFailureHelper,
  notifyFailureHelper,
  notifySuccessHelper,
} from './app';

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app} namespace instead.
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appInitializationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

export namespace appInitialization {
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.Messages} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Messages = app.Messages;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.FailedReason} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import FailedReason = app.FailedReason;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.ExpectedFailureReason} instead.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ExpectedFailureReason = app.ExpectedFailureReason;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.IFailedRequest} instead.
   */
  export import IFailedRequest = app.IFailedRequest;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.IExpectedFailureRequest} instead.
   */
  export import IExpectedFailureRequest = app.IExpectedFailureRequest;

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.notifyAppLoaded app.notifyAppLoaded(): void} instead.
   *
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    notifyAppLoadedHelper(
      getApiVersionTag(appInitializationTelemetryVersionNumber, ApiName.AppInitialization_NotifyAppLoaded),
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.notifySuccess app.notifySuccess(): void} instead.
   *
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    notifySuccessHelper(
      getApiVersionTag(appInitializationTelemetryVersionNumber, ApiName.AppInitialization_NotifySuccess),
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.notifyFailure app.notifyFailure(appInitializationFailedRequest: IFailedRequest): void} instead.
   *
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
   * during initialization as well as an optional message.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    notifyFailureHelper(
      getApiVersionTag(appInitializationTelemetryVersionNumber, ApiName.AppInitialization_NotifyFailure),
      appInitializationFailedRequest,
    );
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link app.notifyExpectedFailure app.notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void} instead.
   *
   * Notifies the frame that app initialized with some expected errors.
   * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    notifyExpectedFailureHelper(
      getApiVersionTag(appInitializationTelemetryVersionNumber, ApiName.AppInitialization_NotifyExpectedFailure),
      expectedFailureRequest,
    );
  }
}
