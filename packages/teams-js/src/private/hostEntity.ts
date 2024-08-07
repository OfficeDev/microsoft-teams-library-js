import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ErrorCode, SdkError, TabInstance } from '../public';
import { runtime } from '../public/runtime';

// Open questions
// 1. According to Debo, `TabInstance` from the public API looks like it would work. Helen asked Debo to follow up about getting more recent fields added.
// 2. I didn't see any reason to add a `getTabs` function because `pages.tabs.getTabInstances`. Any reason that won't work for you?
// 3. I've added an `AppTypes[]` param to `addAndConfigureApp` to allow for the host to show different app types to the user. Helen going to see if there are more types to add here to start.
// 4. I've added empty, private `validate` functions for the threadId and TabInstance. Any validation that is possible will help prevent against
//    bad data being sent to the host. If you have any validation that can be done, please add it there. If you *can* use restrictive types like UUID
//    or something, that would be even better.

// TODO: Add unit tests
// TODO: Add E2E tests

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * TODO: Brief description of what this capability does. For example:
 * This capability allows an app to associate other apps with a host entity, such as a Teams channel or chat, and configure them as needed.
 */
export namespace hostEntity {
  export enum AppTypes {
    meeting = 'meeting',
  }

  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   *
   * TODO: Brief description of what this capability does. For example:
   * This capability allows an app to associate other tab apps with a host entity, such as a Teams channel or chat, and configure them as needed.
   */
  export namespace tab {
    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * TODO: Add full description of what this function does, ie "Launches host-owned UI that lets a user select an app, installs it if required,
     * runs through app configuration if required, and then associates the app with the threadId provided. If external docs exist, link to them here"
     *
     * @param hostEntityId Info about where this value comes from, links to external docs if available, etc. For example:
     * The id of the host entity that your app wants to associate another app with. In Teams this would be the threadId <link to docs and more explanation>
     *
     * @param appTypes what type of applications to show the user
     *
     * @returns The TabInstance of the newly associated app
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function addAndConfigure(hostEntityId: string, appTypes: AppTypes[]): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateThreadId(hostEntityId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.addAndConfigureApp',
        [hostEntityId, appTypes],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
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
     * TODO: Add full description of what this function does, ie "Allows the user to go through the tab config process again for the specified app. If
     * no config process exists, X happens, etc."
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @returns The TabInstance of the newly configured app
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function reconfigure(tab: TabInstance, threadId: string): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.reconfigure',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
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
     * TODO: Add full description of what this function does, ie "Renames the tab associated with an app"
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @returns The TabInstance of the newly renamed app tab
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function rename(tab: TabInstance, threadId: string): Promise<TabInstance> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.rename',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, TabInstance | SdkError]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
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
     * TODO: Add full description of what this function does, ie "Removes a tab associated with an app, must be called on an app tab, etc."
     *
     * @param tab fill in details
     * @param threadId Info about where this comes from, links to external docs if available, etc.
     *
     * @throws TODO: Description of errors that can be thrown from this function
     */
    export function remove(tab: TabInstance, threadId: string): Promise<void> {
      ensureInitialized(runtime); // TODO: add frameContext checks if this is limited to certain contexts such as content

      if (!isSupported()) {
        throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
      }

      validateTab(tab);
      validateThreadId(threadId);

      return sendMessageToParentAsync<[boolean, TabInstance | SdkError]>(
        'apiVersionTag', // TODO: see uses of getApiVersionTag in other files to do this correctly
        'associatedApps.tab.remove',
        [tab, threadId],
      ).then(([wasSuccessful, response]: [boolean, SdkError]) => {
        if (!wasSuccessful) {
          // TODO: Can handle error codes differently here, for example if you don't want "user cancelled" to throw
          const error = response as SdkError;
          throw new Error(`Error code: ${error.errorCode}, message: ${error.message ?? 'None'}`);
        }
      });
    }

    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     */
    export function isSupported(): boolean {
      throw new Error('Not implemented');
    }

    function validateThreadId(threadId: string) {
      // TODO: Any checks you can do on threadId to guarantee valid (not null, not empty, not undefined, format if possible, etc.)
      /*
      if (threadId is not valid) {
        throw new Error(`${threadId} is not a valid threadId`);
      }
      */
    }

    function validateTab(tabInstance: TabInstance) {
      // TODO: Any checks you can do on TabInstance to guarantee valid (not null, not empty, not undefined, all required properties set to legal values, etc.)
      /*
      if (tabInstance is not valid) {
        throw new Error(`TabInstance ${tabInstance.internalTabInstanceId} is not a valid, extra detail if available`);
      }
      */
    }
  }
  /**
   * @hidden
   * @internal
   * @beta
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    throw new Error('Not implemented');
  }
}
