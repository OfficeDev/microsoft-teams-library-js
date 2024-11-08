import { AppId } from '../public/appId';
import { hasScriptTags } from './utils';

/**
 * This function can be used to validate if a string is a "valid" app id.
 * Valid is a relative term, in this case. Truly valid app ids are UUIDs as documented in the schema:
 * https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema#id
 * However, there are some older internal/hard-coded apps which violate this schema and use names like com.microsoft.teamspace.tab.youtube.
 * For compatibility with these legacy apps, we unfortunately cannot securely and completely validate app ids as UUIDs. Based
 * on this, the validation is limited to checking for script tags, length, and non-printable characters.
 *
 * @param potentialAppId A string to check if it's a "valid" app id
 * @throws Error with a message describing the exact validation violation
 */
export function validateStringAsAppId(potentialAppId: string): void {
  if (hasScriptTags(potentialAppId)) {
    throw new Error(`Potential app id (${potentialAppId}) is invalid; it contains script tags.`);
  }

  if (!isStringWithinAppIdLengthLimits(potentialAppId)) {
    throw new Error(
      `Potential app id (${potentialAppId}) is invalid; its length ${potentialAppId.length} is not within the length limits (${minimumValidAppIdLength}-${maximumValidAppIdLength}).`,
    );
  }

  if (doesStringContainNonPrintableCharacters(potentialAppId)) {
    throw new Error(`Potential app id (${potentialAppId}) is invalid; it contains non-printable characters.`);
  }
}

export const minimumValidAppIdLength = 4;
export const maximumValidAppIdLength = 256;

export function isStringWithinAppIdLengthLimits(potentialAppId: string): boolean {
  return potentialAppId.length < maximumValidAppIdLength && potentialAppId.length > minimumValidAppIdLength;
}

export function doesStringContainNonPrintableCharacters(str: string): boolean {
  return [...str].some((char) => {
    const charCode = char.charCodeAt(0);
    return charCode < 32 || charCode > 126;
  });
}

/**
 * @hidden
 * Checks if the incoming app id is an instance of AppId
 * @param potentialAppId An object to check if it's an instance of AppId
 * @throws Error with a message describing the violation
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateAppIdInstance(potentialAppId: AppId): void {
  if (!(potentialAppId instanceof AppId)) {
    throw new Error(`Potential app id (${potentialAppId}) is invalid; it is not an instance of AppId class.`);
  }
}
