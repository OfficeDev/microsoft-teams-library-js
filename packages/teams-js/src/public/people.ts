import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { peoplePickerRequiredVersion } from '../internal/constants';
import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { validatePeoplePickerInput } from '../internal/mediaUtil';
import { FrameContexts } from './constants';
import { ErrorCode } from './interfaces';

/**
 * @alpha
 */
export namespace people {
  /**
   * Launches a people picker and allows the user to select one or more people from the list
   * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
   
   * @param callback - Returns list of JSON object of type PeoplePickerResult which consists of AAD IDs, display names and emails of the selected users
   * @param peoplePickerInputs - Input parameters to launch customized people picker
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function selectPeople(peoplePickerInputs?: PeoplePickerInputs): Promise<PeoplePickerResult[]> {
    return new Promise<PeoplePickerResult[]>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task, FrameContexts.settings);

      if (!isAPISupportedByPlatform(peoplePickerRequiredVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }

      if (!validatePeoplePickerInput(peoplePickerInputs)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      resolve(sendAndHandleError('people.selectPeople', peoplePickerInputs));
    });
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
     * user object Id (also known as aad id) of the selected user
     */
    objectId: string;

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
