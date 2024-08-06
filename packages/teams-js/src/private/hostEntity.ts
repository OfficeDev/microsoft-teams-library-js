import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode, SdkError } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { TabInformation, TabInstance } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const hostEntityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * This capability allows an app to associate apps with a host entity, such as a Teams channel or chat, and configure them as needed.
 */
export namespace hostEntity {
  export enum AppTypes {
    edu = 'EDU',
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   *
   * CRUD operations for tabs associated with apps
   */
  export namespace tab {
    export interface HostEntityIds {
      /**
       * Id of the host entity like channel, chat or meeting
       */
      threadId: string;

      /**
       * Id of message in which channel meeting is created
       */
      messageId?: string;
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user select an app, installs it if required,
     * runs through app configuration if required, and then associates the app with the threadId provided
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @param appTypes What type of applications to show the user. If EDU is passed as appType, only apps supported by EDU tenant are shown
     *
     * @returns The TabInstance of the newly associated app
     *
     * @throws Error if user cancels operation or installing, configuring or adding tab fails
     */
    export function addAndConfigure(hostEntityIds: HostEntityIds, appTypes?: AppTypes[]): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateThreadId(hostEntityIds.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_addAndConfigureApp),
        'associatedApps.tab.addAndConfigure',
        [hostEntityIds, appTypes],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw error;
        }
        return response as TabInstance;
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Returns all tab instances associated with a host entity
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns Object with array of TabInstance's associated with a host entity
     *
     * @throws Error if fetching tabs fail
     */
    export function getAll(hostEntityIds: HostEntityIds): Promise<TabInformation> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInformation | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_getAll),
        'associatedApps.tab.getAll',
        [hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInformation | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw error;
        }
        return response as TabInformation;
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user re-configure the contentUrl of the tab
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The TabInstance of the updated tab
     *
     * @throws Error if user cancels operation or re-configuring tab fails
     */
    export function reconfigure(tab: TabInstance, hostEntityIds: HostEntityIds): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tab.internalTabInstanceId);
      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_reconfigure),
        'associatedApps.tab.reconfigure',
        [tab, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw error;
        }
        return response as TabInstance;
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user rename the tab
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns The TabInstance of the updated tab
     *
     * @throws Error if user cancels operation or updating tab fails
     */
    export function rename(tab: TabInstance, hostEntityIds: HostEntityIds): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tab?.internalTabInstanceId);
      validateThreadId(hostEntityIds.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_rename),
        'associatedApps.tab.rename',
        [tab, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw error;
        }
        return response as TabInstance;
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Launches host-owned UI that lets a user remove the tab
     *
     * @param hostEntityIds Ids of the host entity like channel, chat or meeting
     *
     * @returns Boolean. Returns true if removing tab was successful
     *
     * @throws Error if user cancels operation or removing tab fails
     */
    export function remove(tabId: string, hostEntityIds: HostEntityIds): Promise<boolean> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tabId);
      validateThreadId(hostEntityIds?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_remove),
        'associatedApps.tab.remove',
        [tabId, hostEntityIds],
      ).then(([wasSuccessful, response]: [boolean, SdkError]) => {
        if (!wasSuccessful) {
          const error = response as SdkError;
          throw error;
        }
        return true;
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.hostEntity?.tab ? true : false;
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     */
    function validateThreadId(threadId: string): void {
      if (!threadId || threadId.length == 0) {
        const error: SdkError = {
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'ThreadId cannot be null or empty',
        };
        throw error;
      }
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     */
    function validateTab(tabId?: string): void {
      if (!tabId || tabId.length === 0) {
        const error: SdkError = {
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'TabId cannot be null or empty',
        };
        throw error;
      }
    }
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.hostEntity ? true : false;
  }
}
