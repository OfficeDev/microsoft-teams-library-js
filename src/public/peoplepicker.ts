import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isAPISupportedByPlatform, sendMessageRequestToParent } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { validatePeoplePickerInput } from '../internal/mediaUtil';

export namespace peoplepicker {
  export const peoplePickerRequiredVersion = '2.0.0';

  export function launchPeoplePicker(
    callback: (error: SdkError, people: string[]) => void,
    peoplePickerInputs?: PeoplePickerInputs,
  ): void {
    if (!callback) {
      throw new Error('[people picker] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!GlobalVars.isFramelessWindow) {
      const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
      callback(notSupportedError, undefined);
      return;
    }

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
    const messageId = sendMessageRequestToParent('peoplepicker.launchPeoplePicker', [peoplePickerInputs]);

    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Input parameter supplied to the People Picker API
   */
  export interface PeoplePickerInputs {
    title?: string;

    setSelected?: string[];

    openOrgWideSearchInChatOrChannel?: boolean;
  }
}
