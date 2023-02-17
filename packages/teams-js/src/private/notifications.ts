import { CapabilityMetadata } from '../internal/capability';
import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ShowNotificationParameters } from './interfaces';

export class NotificationsMetadata extends CapabilityMetadata {
  public constructor() {
    const map: Map<unknown, FrameContexts[]> = new Map([
      [notifications.showNotification as unknown, [FrameContexts.content]],
    ]);
    super(map);
  }
}

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

    sendMessageToParent('notifications.showNotification', [showNotificationParameters]);
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
