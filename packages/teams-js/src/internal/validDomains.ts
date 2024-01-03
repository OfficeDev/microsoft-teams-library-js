import { GlobalVars } from '../internal/globalVars';
import { validDomainsCdnEndpoint, validOriginsFallback } from './constants';
import { getLogger } from './telemetry';
import { isValidHttpsURL } from './utils';

let validOrigins: string[] = [];
export function prefetchDomainsFromCDN(): void {
  fetch(validDomainsCdnEndpoint);
}

async function retrieveDomainsFromCDNAndStore(): Promise<void> {
  if (validOrigins.length !== 0) {
    return;
  }
  const response = await fetch(validDomainsCdnEndpoint);
  if (!response.ok) {
    validOrigins = validOriginsFallback;
  }
  if (response.json) {
    const validDomains = await response.json();
    validOrigins = validDomains.validOrigins;
  } else {
    validOrigins = validOriginsFallback;
  }
}

const validateOriginLogger = getLogger('validateOrigin');

/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validateHostAgainstPattern(pattern: string, host: string): boolean {
  if (pattern.substring(0, 2) === '*.') {
    const suffix = pattern.substring(1);
    if (
      host.length > suffix.length &&
      host.split('.').length === suffix.split('.').length &&
      host.substring(host.length - suffix.length) === suffix
    ) {
      return true;
    }
  } else if (pattern === host) {
    return true;
  }
  return false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export async function validateOrigin(messageOrigin: URL): Promise<boolean> {
  await retrieveDomainsFromCDNAndStore();
  // Check whether the url is in the pre-known allowlist or supplied by user
  if (!isValidHttpsURL(messageOrigin)) {
    validateOriginLogger(
      'Origin %s is invalid because it is not using https protocol. Protocol being used: %s',
      messageOrigin,
      messageOrigin.protocol,
    );
    return false;
  }
  const messageOriginHost = messageOrigin.host;
  if (validOrigins.some((pattern) => validateHostAgainstPattern(pattern, messageOriginHost))) {
    return true;
  }

  for (const domainOrPattern of GlobalVars.additionalValidOrigins) {
    const pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
    if (validateHostAgainstPattern(pattern, messageOriginHost)) {
      return true;
    }
  }

  validateOriginLogger(
    'Origin %s is invalid because it is not an origin approved by this library or included in the call to app.initialize.\nOrigins approved by this library: %o\nOrigins included in app.initialize: %o',
    messageOrigin,
    validOrigins,
    GlobalVars.additionalValidOrigins,
  );
  return false;
}
