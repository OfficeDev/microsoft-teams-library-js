import { sendMessageToParentWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ShowNotificationParameters } from './interfaces';
/**
 * @hidden
 * Hidden from Docs
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const notificationsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

export namespace notifications {
  /**
   * @hidden
   * display notification API.
   *
   * @param message - Notification message.
   * @param notificationType - Notification type
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function showNotification(showNotificationParameters: ShowNotificationParameters): void {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    sendMessageToParentWithVersion(
      getApiVersionTag(notificationsTelemetryVersionNumber, ApiName.Notifications_ShowNotification),
      'notifications.showNotification',
      [showNotificationParameters],
    );
  }

  /**
   * @hidden
   *
   * Checks if the notifications capability is supported by the host
   * @returns boolean to represent whether the notifications capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.notifications ? true : false;
  }
}
