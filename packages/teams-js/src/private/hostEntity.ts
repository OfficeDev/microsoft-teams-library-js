import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode, SdkError } from '../public';
import { TabInformation, TabInstance } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { errorNotSupportedOnPlatform } from '../public/constants';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const hostEntityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
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
   */
  export namespace tab {
    export interface HostEntity {
      threadId: string;

      messageId?: string;
    }
    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * @param threadId
     *
     * @param appTypes
     *
     * @returns The TabInstance of the newly associated app
     *
     * @throws Description of errors that can be thrown from this function
     */
    export function addAndConfigure(hostEntity: HostEntity, appTypes?: AppTypes[]): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateThreadId(hostEntity?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_addAndConfigureApp),
        'associatedApps.tab.addAndConfigureApp',
        [hostEntity, appTypes],
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
     * @param tab
     *
     * @param threadId
     *
     * @returns The TabInstance of the newly configured app
     *
     * @throws Description of errors that can be thrown from this function
     */
    export function getTabs(hostEntity: HostEntity): Promise<TabInformation> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateThreadId(hostEntity?.threadId);

      return sendMessageToParentAsync<[boolean, TabInformation | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_getTabs),
        'associatedApps.tab.getTabs',
        [hostEntity],
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
     * @param tab
     *
     * @param threadId
     *
     * @returns The TabInstance of the newly configured app
     *
     * @throws Description of errors that can be thrown from this function
     */
    export function reconfigure(tab: TabInstance, hostEntity: HostEntity): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tab.internalTabInstanceId);
      validateThreadId(hostEntity?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_reconfigure),
        'associatedApps.tab.reconfigure',
        [tab, hostEntity],
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
     * @param tab
     * @param threadId
     *
     * @returns
     *
     * @throws
     */
    export function rename(tab: TabInstance, hostEntity: HostEntity): Promise<TabInstance> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tab?.internalTabInstanceId);
      validateThreadId(hostEntity?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_rename),
        'associatedApps.tab.rename',
        [tab, hostEntity],
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
     * @param tab
     * @param threadId
     *
     * @throws Description of errors that can be thrown from this function
     */
    export function remove(tabId: string, hostEntity: HostEntity): Promise<boolean> {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      validateTab(tabId);
      validateThreadId(hostEntity?.threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.HostEntity_Tab_remove),
        'associatedApps.tab.remove',
        [tabId, hostEntity],
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

    function validateThreadId(threadId: string): void {
      if (!threadId || threadId.length == 0) {
        const error: SdkError = {
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'ThreadId cannot be null or empty',
        };
        throw error;
      }
    }

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
}
