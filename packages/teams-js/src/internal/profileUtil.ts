import { profile } from '../public/profile';

/**
 * @hidden
 * Validates the request parameters
 * @param showProfileRequest The request parameters
 * @returns true if the parameters are valid, false otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateShowProfileRequest(
  showProfileRequest: profile.ShowProfileRequest,
): [boolean, string | undefined] {
  if (!showProfileRequest) {
    return [false, 'A request object is required'];
  }

  // Validate modality
  if (showProfileRequest.modality && typeof showProfileRequest.modality !== 'string') {
    return [false, 'modality must be a string'];
  }

  // Validate targetElementBoundingRect
  if (
    !showProfileRequest.targetElementBoundingRect ||
    typeof showProfileRequest.targetElementBoundingRect !== 'object'
  ) {
    return [false, 'targetElementBoundingRect must be a DOMRect'];
  }

  // Validate triggerType
  if (!showProfileRequest.triggerType || typeof showProfileRequest.triggerType !== 'string') {
    return [false, 'triggerType must be a valid string'];
  }

  return validatePersona(showProfileRequest.persona);
}

/**
 * @hidden
 * Validates the persona that is used to resolve the profile target
 * @param persona The persona object
 * @returns true if the persona is valid, false otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validatePersona(persona: profile.Persona): [boolean, string | undefined] {
  if (!persona) {
    return [false, 'persona object must be provided'];
  }

  if (persona.displayName && typeof persona.displayName !== 'string') {
    return [false, 'displayName must be a string'];
  }

  if (!persona.identifiers || typeof persona.identifiers !== 'object') {
    return [false, 'persona identifiers object must be provided'];
  }

  if (!persona.identifiers.AadObjectId && !persona.identifiers.Smtp && !persona.identifiers.Upn) {
    return [false, 'at least one valid identifier must be provided'];
  }

  if (persona.identifiers.AadObjectId && typeof persona.identifiers.AadObjectId !== 'string') {
    return [false, 'AadObjectId identifier must be a string'];
  }

  if (persona.identifiers.Smtp && typeof persona.identifiers.Smtp !== 'string') {
    return [false, 'Smtp identifier must be a string'];
  }

  if (persona.identifiers.Upn && typeof persona.identifiers.Upn !== 'string') {
    return [false, 'Upn identifier must be a string'];
  }

  return [true, undefined];
}
