/**
 * The type of modalities that are supported when showing a profile.
 * Can be provided as an optional hint with the request and will be
 * respected if the hosting M365 application supports it.
 *
 * @beta
 */
export type Modality = 'Card' | 'Expanded';

/**
 * The type of the profile trigger.
 *  - MouseHover: The user hovered a target.
 *  - Press: The target was pressed with either a mouse click or keyboard key press.
 *  - AppRequest: The show profile request is happening programmatically, without direct user interaction.
 *
 * @beta
 */
export type TriggerType = 'MouseHover' | 'Press' | 'AppRequest';

/**
 * The set of identifiers that are supported for resolving the persona.
 *
 * At least one is required, and if multiple are provided then only the highest
 * priority one will be used (AadObjectId > Upn > Smtp).
 *
 * @beta
 */
export type PersonaIdentifiers = {
  /**
   * The object id in Azure Active Directory.
   *
   * This id is guaranteed to be unique for an object within a tenant,
   * and so if provided will lead to a more performant lookup. It can
   * be resolved via MS Graph (see https://learn.microsoft.com/graph/api/resources/users
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
 *
 * @beta
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
export interface ShowProfileRequestInternal {
  modality?: Modality;
  persona: Persona;
  targetRectangle: Rectangle;
  triggerType: TriggerType;
}
