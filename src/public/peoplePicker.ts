import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isAPISupportedByPlatform, sendMessageRequestToParent } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { validatePeoplePickerInput } from '../internal/mediaUtil';

export namespace peoplePicker {
  /**
   * This is the SDK version when people picker API is supported on mobile.
   */
  export const peoplePickerRequiredVersion = '2.0.0';

  /**
   * Launches a people picker and allows the user to select one or more people from the list
   * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
   * @param callback Returns list of JSON object of type PeoplePickerResult which consists of AAD IDs, display names and emails of the selected users
   * @param peoplePickerInputs Input parameters to launch customized people picker
   */
  export function selectPeople(
    callback: (error: SdkError, people: PeoplePickerResult[]) => void,
    peoplePickerInputs?: PeoplePickerInputs,
  ): void {
    if (!callback) {
      throw new Error('[people picker] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isAPISupportedByPlatform(peoplePickerRequiredVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, undefined);
      return;
    }

    if (!validatePeoplePickerInput(peoplePickerInputs)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, null);
      return;
    }
    const messageId = sendMessageRequestToParent('peoplePicker.selectPeople', [peoplePickerInputs]);

    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Input parameter supplied to the People Picker API
   */
  export interface PeoplePickerInputs {
    /**
     * Optional; Set title for the people picker
     * Default value is "Select people" for multiselect and "Select a person" for single select
     */
    title?: string;

    /**
     * Optional; AAD ids of the users to be pre-populated in the search box of people picker control
     * If single select is enabled this value, only the first user in the list will be pre-populated
     * Default value is null
     */

    setSelected?: string[];

    /**
     * Optional; launches the people picker in org wide scope even if the app is added to a chat or channel
     * Default value is false
     */

    openOrgWideSearchInChatOrChannel?: boolean;

    /**
     * Optional; launches the people picker for which only 1 person can be selected
     * Default value is false
     */

    singleSelect?: boolean;
  }

  /**
   * Output user object of people picker API
   */
  export interface PeoplePickerResult {
    /**
     * aad Id of the selected user
     */
    aadId: string;

    /**
     * Optional; display name of the selected user
     */

    displayName?: string;

    /**
     * Optional; email of the selected user
     */

    email?: string;
  }
}
