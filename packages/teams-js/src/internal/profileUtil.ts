import { profile } from '../public/profile';

/**
 * @hidden
 * Validates the request parameters
 * @param showProfileRequest The request parameters
 * @returns true if the parameters are valid, false otherwise
 *
 * @internal
 */
export function validateShowProfileRequest(showProfileRequest: profile.ShowProfileRequest): boolean {
  if (!showProfileRequest) {
    return false;
  }

  // Validate persona
  if (
    !showProfileRequest.persona ||
    (showProfileRequest.persona.displayName && typeof showProfileRequest.persona.displayName !== 'string') ||
    !validatePersonaIdentifiers(showProfileRequest.persona.identifiers)
  ) {
    return false;
  }

  // Validate targetElementBoundingRect
  if (
    !showProfileRequest.targetElementBoundingRect ||
    typeof showProfileRequest.targetElementBoundingRect !== 'object'
  ) {
    return false;
  }

  // Validate triggerType
  if (!showProfileRequest.triggerType || typeof showProfileRequest.triggerType !== 'string') {
    return false;
  }

  return true;
}

function validatePersonaIdentifiers(identifiers: profile.PersonaIdentifiers): boolean {
  if (!identifiers || typeof identifiers !== 'object') {
    return false;
  }

  if (!identifiers.PersonaType || typeof identifiers.PersonaType !== 'string') {
    return false;
  }

  // Validate at least one identifier was passed.
  if (
    (!identifiers.AadObjectId || typeof identifiers.AadObjectId !== 'string') &&
    (!identifiers.Smtp || typeof identifiers.Smtp !== 'string') &&
    (!identifiers.TeamsMri || typeof identifiers.TeamsMri !== 'string') &&
    (!identifiers.Upn || typeof identifiers.Upn !== 'string')
  ) {
    return false;
  }

  return true;
}
