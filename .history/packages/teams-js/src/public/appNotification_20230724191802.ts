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
     * Notification title(maximum length: 75 characters)
     */
    title: string;
    /**
     * Notification content (maximum length: 1500 characters)
     */
    content: string;
    /**
     * This would represent an optional icon that can be displayed on the notification. It should have a max size of 49 pixels by 49 pixels
     * If no icon is provided, the notification card would be displayed without an icon
     * The url link to where the icon is stored should be provided as the input string
     */
    icon?: URL;
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
   * Data structure to represent appNotification information that would be sent to the host SDK
   */
  export interface NotificationDisplayParamForAppHost {
    /**
     * Notification title(maximum length: 75 characters)
     */
    title: string;
    /**
     * Notification content (maximum length: 1500 characters)
     */
    content: string;
    /**
     * This would represent an optional icon that can be displayed on the notification. It should have a max size of 49 pixels by 49 pixels
     * If no icon is provided, the notification card would be displayed without an icon
     * The url link to where the icon is stored should be provided as the input string
     */
    notificationIconAsSring?: string;
    /**
     * This would specify how long a notification would be displayed on the screen for (unit: seconds)
     *
     */
    displayDurationInSeconds: number;
    /**
     * A url string type to the page in which the notification would direct the user to.
     */
    notificationActionUrlAsString: string;
  }

  /**
   * This converts the notifcationActionUrl from a URL type to a string type for proper flow across the iframe
   * @param notificationDisplayParam - appNotification display parameter with the notificationActionUrl as a URL type
   * @returns a serialized object that can be sent to the host SDK
   */
  function serializeParam(notificationDisplayParam: NotificationDisplayParam): NotificationDisplayParamForAppHost {
    return {
      title: notificationDisplayParam.title,
      content: notificationDisplayParam.content,
      notificationIconAsSring: notificationDisplayParam.icon?.href,
      displayDurationInSeconds: notificationDisplayParam.displayDurationInSeconds,
      notificationActionUrlAsString: notificationDisplayParam.notificationActionUrl.href,
    };
  }

  /**
   * Checks the valididty of the URL passed
   *
   * @param url
   * @returns True if a valid url was passed
   */
  function isValidUrl(url: URL): boolean {
    const validProtocols = ['https:'];
    return validProtocols.includes(url.protocol);
  }

  /**
   * Validates that the input string is of property length
   *
   * @param inputString and maximumLength
   * @returns True if string length is within specified limit
   */
  function isValidLength(inputString: string, maxLength: number): boolean {
    return inputString.length <= maxLength;
  }

  /**
   * Validates that all the required appNotification display parameters are either supplied or satisfy the required checks
   * @param notificationDisplayParam
   * @throws Error if any of the required parameters aren't supplied
   * @throws Error if content or title length is beyond specific limit
   * @throws Error if invalid url is passed
   * @returns void
   */
  function validateNotificationDisplayParams(notificationDisplayParam: NotificationDisplayParam): void {
    const maxTitleLength = 75;
    const maxContentLength = 1500;

    if (!notificationDisplayParam.title) {
      throw new Error('Must supply notification title');
    }

    if (!isValidLength(notificationDisplayParam.title, maxTitleLength)) {
      throw new Error(
        `Invalid notification title length: Maximum title length ${maxTitleLength}, title length supplied ${notificationDisplayParam.title.length}`,
      );
    }

    if (!notificationDisplayParam.content) {
      throw new Error('Must supply notification content');
    }
    if (!isValidLength(notificationDisplayParam.content, maxContentLength)) {
      throw new Error(
        `Invalid notification content length: Maximum content length ${maxContentLength}, content length supplied ${notificationDisplayParam.content.length}`,
      );
    }

    if (!notificationDisplayParam.notificationActionUrl) {
      throw new Error('Must supply notification url');
    }
    if (!isValidUrl(notificationDisplayParam.notificationActionUrl)) {
      throw new Error('Invalid notificationAction url');
    }?

    if (!notificationDisplayParam.displayDurationInSeconds) {
      throw new Error('Must supply display duration in seconds');
    }

    if (notificationDisplayParam.displayDurationInSeconds <= 0) {
      throw new Error('Notification display time must be greater than zero');
    }
  }

  /**
   * Displays appNotification after making a validiity check on all of the required parameters, by calling the validateNotificationDisplayParams helper function
   * An interface object containing all the required parameters to be displayed on the notification would be passed in here
   * The notificationDisplayParam would be serialized before passing across to the message handler to ensure all objects passed contain simple parameters that would properly pass across the Iframe
   * @param notificationdisplayparam - Interface object with all the parameters required to display an appNotificiation
   * @returns a promise resolution upon conclusion
   * @throws Error if appNotification capability is not supported
   * @throws Error if notficationDisplayParam was not validated successfully
   */
  export function displayInAppNotification(notificationDisplayParam: NotificationDisplayParam): Promise<void> {
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
    validateNotificationDisplayParams(notificationDisplayParam);
    return sendAndHandleSdkError('appNotification.displayNotification', serializeParam(notificationDisplayParam));
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
