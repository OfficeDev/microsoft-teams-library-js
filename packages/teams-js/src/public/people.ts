import { sendAndHandleSdkError } from '../internal/communication';
import { peoplePickerRequiredVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { validatePeoplePickerInput } from '../internal/mediaUtil';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * Allows your app to add a people picker enabling users to search for and select people in their organization.
 *
 * Exceptional APIs telemetry versioning file: v1 and v2 APIs are mixed together in this file
 */
const peopleTelemetryVersionNumber_v1: ApiVersionNumber = ApiVersionNumber.V_1;
const peopleTelemetryVersionNumber_v2: ApiVersionNumber = ApiVersionNumber.V_2;

export namespace people {
  /** Select people callback function type */
  export type selectPeopleCallbackFunctionType = (error: SdkError, people: PeoplePickerResult[]) => void;
  /**
   * Launches a people picker and allows the user to select one or more people from the list
   * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
   
   * @param callback - Returns list of JSON object of type PeoplePickerResult which consists of Microsoft Entra IDs, display names and emails of the selected users
   * @param peoplePickerInputs - Input parameters to launch customized people picker
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function selectPeople(peoplePickerInputs?: PeoplePickerInputs): Promise<PeoplePickerResult[]>;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link people.selectPeople people.selectPeople(peoplePickerInputs?: PeoplePickerInputs): Promise\<PeoplePickerResult[]\>} instead.
   *
   * Launches a people picker and allows the user to select one or more people from the list
   * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
   
   * @param callback - Returns list of JSON object of type PeoplePickerResult which consists of Microsoft Entra IDs, display names and emails of the selected users
   * @param peoplePickerInputs - Input parameters to launch customized people picker
   */
  export function selectPeople(
    callback: selectPeopleCallbackFunctionType,
    peoplePickerInputs?: PeoplePickerInputs,
  ): void;
  /**
   * @hidden
   * This function is the overloaded implementation of selectPeople.
   * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
   * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
   * @param param1
   * @param param2
   * @returns Promise of Array of PeoplePickerResult objects.
   */
  export function selectPeople(
    param1: PeoplePickerInputs | selectPeopleCallbackFunctionType | undefined,
    param2?: PeoplePickerInputs,
  ): Promise<PeoplePickerResult[]> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task, FrameContexts.settings);

    let callback: selectPeopleCallbackFunctionType | undefined = undefined;
    let peoplePickerInputs: PeoplePickerInputs | undefined = undefined;
    let apiVersionTag = '';

    if (typeof param1 === 'function') {
      [callback, peoplePickerInputs] = [param1, param2];
      apiVersionTag = getApiVersionTag(peopleTelemetryVersionNumber_v1, ApiName.People_SelectPeople);
    } else {
      peoplePickerInputs = param1;
      apiVersionTag = getApiVersionTag(peopleTelemetryVersionNumber_v2, ApiName.People_SelectPeople);
    }

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<PeoplePickerResult[]>(
      selectPeopleHelper,
      callback /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */,
      apiVersionTag,
      peoplePickerInputs,
    );
  }

  function selectPeopleHelper(
    apiVersionTag: string,
    peoplePickerInputs?: PeoplePickerInputs,
  ): Promise<PeoplePickerResult[]> {
    return new Promise<PeoplePickerResult[]>((resolve) => {
      if (!isCurrentSDKVersionAtLeast(peoplePickerRequiredVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }

      if (!validatePeoplePickerInput(peoplePickerInputs)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      resolve(sendAndHandleSdkError(apiVersionTag, 'people.selectPeople', peoplePickerInputs));
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
     * Optional; Microsoft Entra IDs of the users to be pre-populated in the search box of people picker control
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
     * user object ID (also known as Microsoft Entra ID) of the selected user
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

  /**
   * Checks if the people capability is supported by the host
   * @returns boolean to represent whether the people capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.people ? true : false;
  }
}
