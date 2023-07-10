import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the appNotifications specific part of the SDK
 */
export namespace appNotification {
  /**
   * Data structure to represent appNotification information
   */
  export interface NotificationDisplayParam {
    /**The heading of the notiification to be delivered,it would have a maximum string length of 20*/
    title: string;
    /**the body of information which would be displayed in the notification box,it would have a maximum string length of 40*/
    Content: string;
    /**this would represent an icon that can be displayed on the notification*/
    icon?: HTMLImageElement;
    /**This would specify how long a notification would be displayed on the screen for*/
    itemId: number;
    /**a url link to the page in which the notification would direct the user to.*/
    url?: string;
  }

  /**
   * //function definition to check validity of the URL
   *
   * @param url
   * @returns a boolean to represent whether the URL passed is a valid one
   */
  export function isValidUrl(Url: string): boolean {
    // Regular expression pattern for URL validation
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
    return urlPattern.test(Url);
  }

  /**
   * function definition for appNotification title string length validation
   *
   * @param notificationdisplayparam
   * @returns a boolean to represent whether the length of the Title and Content strings are valid
   */
  export function isValidSTitleLength(Title: string): boolean {
    const maxTitleLength = 20;
    return Title.length <= maxTitleLength ? true : false;
  }

  /**
   * function definition for appNotification content string length validation
   *
   * @param notificationdisplayparam
   * @returns a boolean to represent whether the length of the Title and Content strings are valid
   */
  export function isValidContentLength(Content: string): boolean {
    const maxContentLength = 45;
    return Content.length <= maxContentLength ? true : false;
  }

  /**
   * This function displays notification from a METAOS application
   * @param notificationdisplayparam
   * @returns a promise resolution upon conclusion
   */
  export function notiificationDisplay(notificationdisplayparam: NotificationDisplayParam): Promise<void> {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.stage,
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
    );
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (notificationdisplayparam.title && !isValidSTitleLength(notificationdisplayparam.title)) {
      throw 'Invalid notification title length';
    }

    if (notificationdisplayparam.Content && !isValidContentLength(notificationdisplayparam.Content)) {
      throw 'Invald notification content length';
    }

    if (notificationdisplayparam.url && !isValidUrl(notificationdisplayparam.url)) {
      throw 'INVALID URL';
    }
    return sendAndHandleSdkError('appNotification.displayNotification', notificationdisplayparam);
  }

  /**
   * Checks if appNotification is supported by the host on which the MOS app is currently launched
   * @returns boolean to represent whether the appNotification capability is supported
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.appNotification ? true : false;
  }
}
