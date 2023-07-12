import { ErrorCode } from '@microsoft/teams-js';

import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the appNotification specific part of the SDK
 */
export namespace appNotification {
  /**
   * Data structure to represent appNotification information
   */
  export interface NotificationDisplayParam {
    /**
     * Notification title(maximum length: 20 characters)
     */
    title: string;
    /**
     * Notification content (maximum length: 40 characters)
     */
    content: string;
    /**
     * This would represent an optional icon that can be displayed on the notification.It should have a max size of 49 pixels by 49 pixels
     * If no icon is provided, the notification card would be displayed without an icon
     * The url link to where the icon is stored should be provided as the input string
     */
    icon?: string;
    /**
     * This would specify how long a notification would be displayed on the screen for (unit: seconds)
     *
     */
    displayDurationInSeconds: number;
    /**
     * A url link to the page in which the notification would direct the user to.
     */
    notificationActionUrl: URL;
  }

  /**
   * Checks the valididty of the URL passed
   *
   * @param url
   * @returns True if a valid url was passed
   */
  function isValidUrl(url: URL): boolean {
    const validProtocols = ['http:', 'https:', 'ftp:'];
    return validProtocols.includes(url.protocol);
  }

  /**
   * Validates that the input string is of property length
   *
   * @param inputString and maximumLength
   * @returns True if title length is within specified limit
   */
  function isValidLength(inputString: string, maxLength: number): boolean {
    return inputString.length <= maxLength;
  }

  /**
   * Validates that all the required appNotification display parameters are either supplied or satisfy the required checks
   * @param notificationDisplayparam
   * @throws Error if any of the required parameters aren't supplied
   * @throws Error if content or title length is beyond specific limit
   * @throws Error if invalid url is passed
   * @returns void
   */
  function validateNotificationDisplayParams(notificationDisplayparam: NotificationDisplayParam): void {
    const maxTitleLength = 20;
    const maxContentLength = 40;
    if (!notificationDisplayparam.title) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Must supply  notification title to be displayed' };
    }
    if (!isValidLength(notificationDisplayparam.title, maxTitleLength)) {
      throw {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: `Invalid notification title length: Maximum title length ${maxTitleLength}, title length supplied ${notificationDisplayparam.title.length}`,
      };
    }

    if (!notificationDisplayparam.content) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Must supply notification content to be displayed' };
    }
    if (!isValidLength(notificationDisplayparam.content, maxContentLength)) {
      throw {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: `Maximum content length ${maxContentLength}, content length supplied ${notificationDisplayparam.content.length}`,
      };
    }

    if (!notificationDisplayparam.notificationActionUrl) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Must supply notification url to be displayed' };
    }
    if (!isValidUrl(notificationDisplayparam.notificationActionUrl)) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Invalid url' };
    }

    if (!notificationDisplayparam.displayDurationInSeconds) {
      throw {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Must supply display duration in seconds to be displayed',
      };
    }

    if (notificationDisplayparam.displayDurationInSeconds <= 0) {
      throw {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Notification display time must be greater than zero',
      };
    }
  }

  /**
   * Displays appNotification after making a validiity check on all of the required parameters, by calling the validateNotificationDisplayParams helper function
   * An interface object containing all the required parameters to be displayed on the notification would be passed in here
   * @param notificationdisplayparam - Interface object with all the parameters required to display an appNotificiation
   * @returns a promise resolution upon conclusion
   */
  export function displayInAppNotification(notificationDisplayparam: NotificationDisplayParam): Promise<void> {
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
    validateNotificationDisplayParams(notificationDisplayparam);
    return sendAndHandleSdkError('appNotification.displayNotification', notificationDisplayparam);
  }

  /**
   * Checks if appNotification is supported by the host
   * @returns boolean to represent whether the appNotification capability is supported
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.appNotification ? true : false;
  }
}
