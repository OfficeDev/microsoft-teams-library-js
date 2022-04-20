import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateShowProfileRequest } from '../internal/profileUtil';
import { FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

export namespace profile {
  /**
   * Opens a profile card at a specified position to show profile information about a persona.
   * @param showProfileRequest The parameters to position the card and identify the target user.
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function showProfile(showProfileRequest: ShowProfileRequest): Promise<void> {
    ensureInitialized(FrameContexts.content);

    return new Promise<void>(resolve => {
      if (!validateShowProfileRequest(showProfileRequest)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      // Passing a DOMRect as part of the request breaks in Electron WebView with
      // "Uncaught Error: An object could not be cloned.". To work around
      // this we create a duplicate object of the values from the DOMRect.
      const newShowProfileRequest = {
        ...showProfileRequest,
        targetElementBoundingRect: {
          x: showProfileRequest.targetElementBoundingRect.x,
          y: showProfileRequest.targetElementBoundingRect.y,
          top: showProfileRequest.targetElementBoundingRect.top,
          left: showProfileRequest.targetElementBoundingRect.left,
          right: showProfileRequest.targetElementBoundingRect.right,
          bottom: showProfileRequest.targetElementBoundingRect.bottom,
          width: showProfileRequest.targetElementBoundingRect.width,
          height: showProfileRequest.targetElementBoundingRect.height,
        },
      };

      resolve(sendAndHandleError('profile.showProfile', newShowProfileRequest));
    });
  }

  /**
   * The type of the persona to resolve.
   *  - User: An organization or consumer user.
   *  - External: A user external to the current organization.
   *  - NotResolved: A user with unknown type.
   */
  export type PersonaType = 'User' | 'External' | 'NotResolved';

  /**
   * The type of the card trigger.
   *  - MouseHover: The user hovered a target.
   *  - MouseClick: The user clicked a target.
   *  - KeyboardPress: The user initiated the card with their keyboard (typically pressing enter or space while focusing a target).
   *  - HostAppRequest: The card is being opened programmatically. TODO: Rename this
   */
  export type TriggerType = 'MouseHover' | 'MouseClick' | 'KeyboardPress' | 'HostAppRequest';

  /**
   * The set of identifiers that are supported for resolving the persona.
   */
  export type PersonaIdentifiers = {
    /**
     * The Teams messaging resource identifier.
     */
    readonly TeamsMri?: string;

    /**
     * The AAD object id.
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

    /**
     * The type of the persona.
     */
    readonly PersonaType: PersonaType;
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

  export function isSupported(): boolean {
    return runtime.supports.profile ? true : false;
  }
}
