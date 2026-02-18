import { Debugger } from 'debug/src/browser';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 *
 * Implementation of URL pattern matching logic for validating origins against a list of allowed patterns.
 */
export interface URLVerifier {
  /**
   * Checks if the given URL matches the pattern defined in the implementation.
   * @param url - The URL to test against the pattern.
   * @returns - True if the URL matches the pattern, false otherwise.
   */
  test: (url: URL) => boolean;
}

/**
 * Regex for validating that a user-provided origin includes a protocol.
 */
const userOriginUrlValidationRegExp = /^[A-Za-z][A-Za-z\d+.-]*:\/\//;

/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('test.*.teams.microsoft.com', 'test.subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateHostAgainstPattern(pattern: string, host: string): boolean {
  const patternSegments = pattern.split('.');
  const hostSegments = host.split('.');

  if (hostSegments.length !== patternSegments.length) {
    return false;
  }

  let hasUsedWildcard = false;
  for (let i = 0; i < patternSegments.length; i++) {
    if (patternSegments[i] === hostSegments[i]) {
      continue;
    }

    if (patternSegments[i] !== '*') {
      return false;
    }

    // Wildcard in the last segment (TLD position) is not allowed for security reasons.
    if (i === patternSegments.length - 1 || hasUsedWildcard) {
      return false;
    }

    hasUsedWildcard = true;
    continue;
  }

  return true;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 *
 * Internal class when widely-available URLPattern is not available.
 */
class InternalURLPattern implements URLVerifier {
  private constructor(
    private protocol: string,
    private host: string,
    private logger: Debugger,
  ) {}

  /**
   * Checks if InternalURLPattern can be used with the provided pattern.
   */
  public static canUse(pattern: string): boolean {
    return userOriginUrlValidationRegExp.test(pattern);
  }

  /**
   * Creates an instance of InternalURLPattern with the provided pattern and logger.
   */
  public static create(pattern: string, logger: Debugger): URLVerifier | undefined {
    const splitPattern = pattern.split('://');
    return new InternalURLPattern(splitPattern[0], splitPattern[1], logger.extend('InternalURLPattern'));
  }

  /**
   * Tests the URL against the pattern.
   */
  public test(url: URL): boolean {
    this.logger('Testing URL %s against pattern protocol: %s, host: %s', url, this.protocol, this.host);
    return url.protocol === `${this.protocol}:` && (!url.host || validateHostAgainstPattern(this.host, url.host));
  }
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 *
 * Checks if the provided pattern is valid for checking against URLs.
 * @param pattern - The pattern to validate.
 * @returns - True if the pattern is valid, false otherwise.
 */
export function isValidPatternUrl(pattern: string): boolean {
  return InternalURLPattern.canUse(pattern);
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 *
 * Creates a URL verifier based on the provided pattern.
 */
export function createURLVerifier(pattern: string, logger: Debugger): URLVerifier | undefined {
  if (InternalURLPattern.canUse(pattern)) {
    return InternalURLPattern.create(pattern, logger);
  }

  logger('No URL verifier available for pattern: %s', pattern);
  return undefined;
}
