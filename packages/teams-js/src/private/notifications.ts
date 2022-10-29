import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ShowNotificationParameters } from './interfaces';

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
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    sendMessageToParent('notifications.showNotification', [showNotificationParameters]);
  }

  /**
   * @hidden
   * @returns boolean to represent whether the notifications capability is supported
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    ensureInitialized();
    return runtime.supports.notifications ? true : false;
  }
}
