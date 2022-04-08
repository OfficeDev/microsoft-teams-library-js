import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { sendMessageToParent } from '../internal/communication';
import { validateShowProfileRequest } from '../internal/profileUtil';

export namespace profile {
  /**
   * Opens a profile card at a specified position to show profile information about a persona.
   * @param callback Returns an error if one occurred, or null if the card open succeeded.
   * @param openCardRequest The parameters to position the card and identify the target user.
   */
  export function showProfile(callback: (error: SdkError) => void, showProfileRequest: ShowProfileRequest): void {
    if (!callback) {
      throw new Error('[show profile] Callback cannot be null');
    }

    ensureInitialized(FrameContexts.content, FrameContexts.task, FrameContexts.settings);

    if (!validateShowProfileRequest(showProfileRequest)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput);
      return;
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

    sendMessageToParent('profile.showProfile', [newShowProfileRequest], callback);
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
   * The persona to open the card for.
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
   * Input parameters provided to the openCard API.
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
}
