import { notifyAppLoadedHelper, notifyExpectedFailureHelper, notifyFailureHelper } from '../internal/appHelpers';
import { sendMessageToParent } from '../internal/communication';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ExpectedFailureReason, FailedReason, IExpectedFailureRequest, IFailedRequest, Messages } from './app/app';
import { version } from './version';

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app} namespace instead.
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appInitializationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.Messages} instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { Messages };
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.FailedReason} instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { FailedReason };
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.ExpectedFailureReason} instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { ExpectedFailureReason };
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.IFailedRequest} instead.
 */
export { IFailedRequest };
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.IExpectedFailureRequest} instead.
 */
export { IExpectedFailureRequest };

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
 * As of TeamsJS v2.0.0, please use {@link app.notifySuccess app.notifySuccess(): Promise<NotifySuccessResponse>} instead.
 *
 * Notifies the frame that app initialization is successful and is ready for user interaction.
 */
export function notifySuccess(): void {
  sendMessageToParent(
    getApiVersionTag(appInitializationTelemetryVersionNumber, ApiName.AppInitialization_NotifySuccess),
    Messages.Success,
    [version],
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
