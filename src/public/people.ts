import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { sendMessageToParent } from '../internal/communication';
import { peoplePickerRequiredVersion } from '../internal/constants';
import { validateOpenCardRequest, validatePeoplePickerInput } from '../internal/peopleUtil';

export namespace people {
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
    ensureInitialized(FrameContexts.content, FrameContexts.task, FrameContexts.settings);

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

    sendMessageToParent('people.selectPeople', [peoplePickerInputs], callback);
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

  /**
   * TODO
   * @param callback TODO
   * @param openCardInputs TODO
   */
  export function openCard(callback: (error: SdkError) => void, openCardRequest?: OpenCardRequest): void {
    if (!callback) {
      throw new Error('[open card] Callback cannot be null');
    }

    ensureInitialized(FrameContexts.content, FrameContexts.task, FrameContexts.settings);

    if (!validateOpenCardRequest(openCardRequest)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput);
      return;
    }

    sendMessageToParent('people.openCard', [openCardRequest], callback);
  }

  /**
   * The type of the persona to resolve.
   *  - User: An organization or consumer user.
   *  - External: A user external to the current organization.
   *  - NotResolved: TODO
   */
  export type PersonaType = 'User' | 'External' | 'NotResolved';

  /**
   * The type of the card trigger.
   *  - MouseHover: The user hovered a target.
   *  - MouseClick: The user clicked a target.
   *  - KeyboardPress: The user initiated the card with their keyboard (typically pressing enter or space while focusing a target).
   *  - HostAppRequest: The card is being opened programmatically.
   */
  export type OpenCardTriggerType = 'MouseHover' | 'MouseClick' | 'KeyboardPress' | 'HostAppRequest';

  /**
   * TODO: Document this.
   */
  export type LivePersonaCardPlacementMode = "Default" | "AnchorSide";

  /**
   * TODO: Document this.
   */
  export interface IHostAppProvidedPersonaIdentifiers {
    readonly HostAppPersonaId?: string;
    readonly OlsPersonaId?: string;
    readonly TeamsMri?: string;
    readonly AadObjectId?: string;
    readonly Smtp?: string;
    readonly Upn?: string;
    readonly PersonaType: PersonaType;
  }

  /**
   * TODO: Document this.
   */
  export interface IHostAppProvidedPersona {
    identifiers: IHostAppProvidedPersonaIdentifiers;
    displayName?: string;
  }

  /**
   * TODO: Document this.
   */
  export interface ILivePersonaCardBehavior {
    enableStickiness?: boolean;
    cardPlacementMode?: LivePersonaCardPlacementMode;
  }

  /**
   * TODO: Document this.
   */
  export interface ILivePersonaCardParameters {
    personaInfo: IHostAppProvidedPersona;
    behavior: ILivePersonaCardBehavior;
    openCardTriggerType?: OpenCardTriggerType;
  }

  /**
   * Input parameters provided to the openCard API.
   */
  export interface OpenCardRequest {
    /**
     * The bounding rectangle of the target.
     */
    targetBoundingRect: ClientRect;

    /**
     * The parameters to provide to the live persona card when opening the card.
     */
    parameters: ILivePersonaCardParameters;
  }
}
