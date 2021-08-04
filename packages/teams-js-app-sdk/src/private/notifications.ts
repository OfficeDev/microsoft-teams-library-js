import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { ShowNotificationParameters } from './interfaces';
import { sendMessageToParent } from '../internal/communication';
import { runtime } from '../public/runtime';

export namespace notifications {
  /**
   * @private
   * Hide from docs.
   * ------
   * display notification API.
   * @param message Notification message.
   * @param notificationType Notification type
   */
  export function showNotification(showNotificationParameters: ShowNotificationParameters): void {
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('notifications.showNotification', [showNotificationParameters]);
  }
  export function isSupported(): boolean {
    return runtime.supports.notifications ? true : false;
  }
}
