import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
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
  /**
   * Opens a profile card at a specified position to show profile information about a persona.
   * @param showProfileRequest The parameters to position the card and identify the target user.
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function showProfile(showProfileRequest: ShowProfileRequest): Promise<void> {
    ensureInitialized(FrameContexts.content);

    return new Promise<void>(resolve => {
      const [isValid, message] = validateShowProfileRequest(showProfileRequest);
      if (!isValid) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message };
      }

      // Convert the app provided parameters to the form suitable for postMessage.
      const requestInternal: ShowProfileRequestInternal = {
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
   * The type of modalities that are supported when showing a profile.
   * Can be provided as an optional hint with the request and will be
   * respected if the hosting M365 application supports it.
   */
  export type Modality = 'Card' | 'Expanded';

  /**
   * The type of the profile trigger.
   *  - MouseHover: The user hovered a target.
   *  - MouseClick: The user clicked a target.
   *  - KeyboardPress: The user initiated the show profile request with their keyboard.
   *  - AppRequest: The show profile request is happening programmatically, without direct user interaction.
   */
  export type TriggerType = 'MouseHover' | 'MouseClick' | 'KeyboardPress' | 'AppRequest';

  /**
   * The set of identifiers that are supported for resolving the persona.
   *
   * At least one is required, and if multiple are provided then only the highest
   * priority one will be used (AadObjectId > Upn > Smtp).
   */
  export type PersonaIdentifiers = {
    /**
     * The object id in Azure Active Directory.
     *
     * This id is guaranteed to be unique for an object within a tenant,
     * and so if provided will lead to a more performant lookup. It can
     * be resolved via MS Graph (see https://docs.microsoft.com/en-us/graph/api/resources/users
     * for examples).
     */
    readonly AadObjectId?: string;

    /**
     * The primary SMTP address.
     */
    readonly Smtp?: string;

    /**
     * The user principle name.
     */
    readonly Upn?: string;
  };

  /**
   * The persona to show the profile for.
   */
  export interface Persona {
    /**
     * The set of identifiers that are supported for resolving the persona.
     */
    identifiers: PersonaIdentifiers;

    /**
     * Optional display name override. If not specified the user's display name will be resolved normally.
     */
    displayName?: string;
  }

  /**
   * Input parameters provided to the showProfile API.
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
   * Internal representation of a DOMRect suitable for sending via postMessage.
   */
  type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * An internal representation of the showProfile parameters suitable for sending via postMessage.
   * The hub expects to receive an object of this type.
   */
  interface ShowProfileRequestInternal {
    modality?: Modality;
    persona: Persona;
    targetRectangle: Rectangle;
    triggerType: TriggerType;
  }

  export function isSupported(): boolean {
    return runtime.supports.profile ? true : false;
  }
}
