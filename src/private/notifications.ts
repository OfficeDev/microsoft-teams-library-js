import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { TrouterNotificationPayload } from '../public/interfaces';

/**
 * Namespace to interact with the notifications to-from the SDK.
 * The notification payload received is passed down to the app.
 *
 * @private
 * Hide from docs
 */
export namespace notifications {
  GlobalVars.handlers['trouter.notificationRecieved'] = handleProcessNotifications;

  function handleProcessNotifications(payload: TrouterNotificationPayload): void {
    if (GlobalVars.notificationHandler) {
      GlobalVars.notificationHandler(payload);
    }
  }

  /**
   * @private
   * Hide from docs
   * ------
   * Registers a handler for processing trouter notifications
   * @param handler The handler to process notifications by 1P app
   */
  export function registerTrouterNotifications(handler: (notification: TrouterNotificationPayload) => void): void {
    ensureInitialized();

    GlobalVars.notificationHandler = handler;
    handler && sendMessageRequestToParent('trouter.register', []);
  }
}
