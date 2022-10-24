import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import * as internalProfile from '../internal/profile';
import { validateShowProfileRequest } from '../internal/profileUtil';
import { FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace for profile related APIs.
 *
 * @beta
 */
export namespace profile {
  export import Modality = internalProfile.Modality;
  export import Persona = internalProfile.Persona;
  // Even though this type is unused in this file, it is referenced by Persona and thus should
  // be re-exported to ensure it can be used and be documented publicly.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import PersonaIdentifiers = internalProfile.PersonaIdentifiers;
  export import TriggerType = internalProfile.TriggerType;

  /**
   * Opens a profile card at a specified position to show profile information about a persona.
   * @param showProfileRequest The parameters to position the card and identify the target user.
   * @returns Promise that will be fulfilled when the operation has completed
   *
   * @beta
   */
  export function showProfile(showProfileRequest: ShowProfileRequest): Promise<void> {
    ensureInitialized(FrameContexts.content);

    return new Promise<void>((resolve) => {
      const [isValid, message] = validateShowProfileRequest(showProfileRequest);
      if (!isValid) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message };
      }

      // Convert the app provided parameters to the form suitable for postMessage.
      const requestInternal: internalProfile.ShowProfileRequestInternal = {
        modality: showProfileRequest.modality,
        persona: showProfileRequest.persona,
        triggerType: showProfileRequest.triggerType,
        targetRectangle: {
          x: showProfileRequest.targetElementBoundingRect.x,
          y: showProfileRequest.targetElementBoundingRect.y,
          width: showProfileRequest.targetElementBoundingRect.width,
          height: showProfileRequest.targetElementBoundingRect.height,
        },
      };

      resolve(sendAndHandleError('profile.showProfile', requestInternal));
    });
  }

  /**
   * Input parameters provided to the showProfile API.
   *
   * @beta
   */
  export interface ShowProfileRequest {
    /**
     * An optional hint to the hosting M365 application about which modality of the profile you want to show.
     */
    modality?: Modality;

    /**
     * The information about the persona to show the profile for.
     */
    persona: Persona;

    /**
     * The bounding rectangle of the target.
     */
    targetElementBoundingRect: DOMRect;

    /**
     * Specifies which user interaction was used to trigger the API call.
     */
    triggerType: TriggerType;
  }

  /**
   * Checks if the profile capability is supported by the host
   *
   * @returns boolean to represent whether the profile capability is supported
   *
   * @beta
   */
  export function isSupported(): boolean {
    return runtime.supports.profile ? true : false;
  }
}
