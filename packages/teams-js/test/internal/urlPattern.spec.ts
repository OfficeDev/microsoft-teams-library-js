import Debug from 'debug/src/browser';

import { createURLVerifier, isValidPatternUrl, validateHostAgainstPattern } from '../../src/internal/urlPattern';

const logger = Debug('test:urlPattern');

describe('urlPattern', () => {
  describe('isValidPatternUrl', () => {
    it('returns true for a valid https pattern', () => {
      expect(isValidPatternUrl('https://teams.microsoft.com')).toBe(true);
    });

    it('returns true for a wildcard subdomain pattern', () => {
      expect(isValidPatternUrl('https://*.microsoft.com')).toBe(true);
    });

    it('returns true for a pattern with a port', () => {
      expect(isValidPatternUrl('https://localhost:8080')).toBe(true);
    });

    it('returns true for an http pattern', () => {
      expect(isValidPatternUrl('http://example.com')).toBe(true);
    });

    it('returns true for a non-standard protocol pattern', () => {
      expect(isValidPatternUrl('chrome://extensions')).toBe(true);
    });

    it('returns true for a custom protocol with wildcard', () => {
      expect(isValidPatternUrl('chrome://*')).toBe(true);
    });

    it('returns false for a pattern without a protocol', () => {
      expect(isValidPatternUrl('teams.microsoft.com')).toBe(false);
    });

    it('returns false for an empty string', () => {
      expect(isValidPatternUrl('')).toBe(false);
    });

    it('returns false for a pattern starting with a number', () => {
      expect(isValidPatternUrl('123://invalid')).toBe(false);
    });

    it('returns false for just a protocol separator', () => {
      expect(isValidPatternUrl('://')).toBe(false);
    });

    it('returns true for protocol with digits and special chars', () => {
      expect(isValidPatternUrl('my+proto.2-x://host')).toBe(true);
    });

    it('returns true for a complex path pattern', () => {
      expect(isValidPatternUrl('https://example.com/path/to/resource')).toBe(true);
    });

    it('returns true for a pattern with only protocol and slashes', () => {
      expect(isValidPatternUrl('https://')).toBe(true);
    });
  });

  describe('createURLVerifier', () => {
    it('returns a verifier for a valid https pattern', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger);
      expect(verifier).toBeDefined();
    });

    it('returns a verifier for a wildcard subdomain pattern', () => {
      const verifier = createURLVerifier('https://*.microsoft.com', logger);
      expect(verifier).toBeDefined();
    });

    it('returns a verifier for a non-standard protocol', () => {
      const verifier = createURLVerifier('chrome://extensions', logger);
      expect(verifier).toBeDefined();
    });

    it('returns a verifier for a pattern with a port', () => {
      const verifier = createURLVerifier('https://localhost:8080', logger);
      expect(verifier).toBeDefined();
    });

    it('returns undefined for an invalid pattern without protocol', () => {
      const verifier = createURLVerifier('teams.microsoft.com', logger);
      expect(verifier).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
      const verifier = createURLVerifier('', logger);
      expect(verifier).toBeUndefined();
    });

    it('returns undefined for a pattern starting with a number', () => {
      const verifier = createURLVerifier('123://invalid', logger);
      expect(verifier).toBeUndefined();
    });

    it('returns a verifier for an http pattern', () => {
      const verifier = createURLVerifier('http://example.com', logger);
      expect(verifier).toBeDefined();
    });

    it('returns a verifier for a wildcard-only host', () => {
      const verifier = createURLVerifier('chrome://*', logger);
      expect(verifier).toBeDefined();
    });
  });

  describe('URLVerifier.test - exact match', () => {
    it('returns true when URL exactly matches the pattern', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://teams.microsoft.com'))).toBe(true);
    });

    it('returns false when URL does not match the pattern', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://outlook.microsoft.com'))).toBe(false);
    });

    it('returns false when protocol does not match', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger)!;
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */
      expect(verifier.test(new URL('http://teams.microsoft.com'))).toBe(false);
    });

    it('returns false when hostname is a partial match', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://team.microsoft.com'))).toBe(false);
    });

    it('returns false when origin has extra domain appended', () => {
      const verifier = createURLVerifier('https://teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://teams.microsoft.com.evil.com'))).toBe(false);
    });
  });

  describe('URLVerifier.test - wildcard subdomain', () => {
    it('returns true for a valid single-level subdomain', () => {
      const verifier = createURLVerifier('https://*.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://teams.microsoft.com'))).toBe(true);
    });

    it('returns false for multi-level subdomain when pattern allows single level', () => {
      const verifier = createURLVerifier('https://*.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://a.b.microsoft.com'))).toBe(false);
    });

    it('returns false for subdomain that does not match wildcard depth', () => {
      const verifier = createURLVerifier('https://*.teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://teams.microsoft.com'))).toBe(false);
    });

    it('returns true for matching subdomain of a specific host', () => {
      const verifier = createURLVerifier('https://*.teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://subdomain.teams.microsoft.com'))).toBe(true);
    });

    it('returns false when subdomain prepends to an unmatched host', () => {
      const verifier = createURLVerifier('https://*.teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://myteams.microsoft.com'))).toBe(false);
    });
  });

  describe('URLVerifier.test - port matching', () => {
    it('returns true when URL port matches pattern port', () => {
      const verifier = createURLVerifier('https://localhost:8080', logger)!;
      expect(verifier.test(new URL('https://localhost:8080'))).toBe(true);
    });

    it('returns false when URL port does not match pattern port', () => {
      const verifier = createURLVerifier('https://localhost:8080', logger)!;
      expect(verifier.test(new URL('https://localhost:9090'))).toBe(false);
    });

    it('returns false when URL has a port but pattern does not', () => {
      const verifier = createURLVerifier('https://localhost', logger)!;
      expect(verifier.test(new URL('https://localhost:8080'))).toBe(false);
    });

    it('returns true when pattern has port and URL matches exactly', () => {
      const verifier = createURLVerifier('https://local.teams.live.com:8080', logger)!;
      expect(verifier.test(new URL('https://local.teams.live.com:8080'))).toBe(true);
    });

    it('returns false when port differs on a valid host', () => {
      const verifier = createURLVerifier('https://local.teams.live.com:8080', logger)!;
      expect(verifier.test(new URL('https://local.teams.live.com:4000'))).toBe(false);
    });
  });

  describe('URLVerifier.test - non-https protocols', () => {
    it('returns true for chrome:// exact match', () => {
      const verifier = createURLVerifier('chrome://extensions', logger)!;
      expect(verifier.test(new URL('chrome://extensions'))).toBe(true);
    });

    it('returns false for chrome:// hostname mismatch', () => {
      const verifier = createURLVerifier('chrome://extensions', logger)!;
      expect(verifier.test(new URL('chrome://settings'))).toBe(false);
    });

    it('returns false when protocols differ', () => {
      const verifier = createURLVerifier('chrome://my-origin', logger)!;
      expect(verifier.test(new URL('https://my-origin'))).toBe(false);
    });

    it('returns true for chrome:// wildcard subdomain', () => {
      const verifier = createURLVerifier('chrome://*.testing.url.com', logger)!;
      expect(verifier.test(new URL('chrome://chrome.testing.url.com'))).toBe(true);
    });

    it('returns true for http:// pattern matching http URL', () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */
      const verifier = createURLVerifier('http://example.com', logger)!;
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */
      expect(verifier.test(new URL('http://example.com'))).toBe(true);
    });

    it('returns false for http:// pattern against https URL', () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */
      const verifier = createURLVerifier('http://example.com', logger)!;
      expect(verifier.test(new URL('https://example.com'))).toBe(false);
    });
  });

  describe('URLVerifier.test - cloud.microsoft origins', () => {
    it('returns true for teams.cloud.microsoft', () => {
      const verifier = createURLVerifier('https://teams.cloud.microsoft', logger)!;
      expect(verifier.test(new URL('https://teams.cloud.microsoft'))).toBe(true);
    });

    it('returns false for mismatched cloud.microsoft origin', () => {
      const verifier = createURLVerifier('https://teams.cloud.microsoft', logger)!;
      expect(verifier.test(new URL('https://outlook.cloud.microsoft'))).toBe(false);
    });

    it('returns true for wildcard *.cloud.microsoft', () => {
      const verifier = createURLVerifier('https://*.cloud.microsoft', logger)!;
      expect(verifier.test(new URL('https://teams.cloud.microsoft'))).toBe(true);
    });

    it('returns true for another wildcard *.cloud.microsoft match', () => {
      const verifier = createURLVerifier('https://*.cloud.microsoft', logger)!;
      expect(verifier.test(new URL('https://m365.cloud.microsoft'))).toBe(true);
    });
  });

  describe('URLVerifier.test - edge cases', () => {
    it('returns true for URL that matches pattern with trailing path', () => {
      const verifier = createURLVerifier('https://example.com', logger)!;
      // URL constructor normalizes https://example.com to have pathname "/"
      expect(verifier.test(new URL('https://example.com/'))).toBe(true);
    });

    it('returns true for empty host chrome:// protocol', () => {
      const verifier = createURLVerifier('chrome://', logger)!;
      expect(verifier.test(new URL('chrome://'))).toBe(true);
    });
  });

  describe('URLVerifier.test - nested wildcard patterns', () => {
    it('returns true for nested wildcard test.*.teams.com matching valid URL', () => {
      const verifier = createURLVerifier('https://test.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://test.subdomain.teams.com'))).toBe(true);
    });

    it('returns true for nested wildcard test.*.teams.microsoft.com', () => {
      const verifier = createURLVerifier('https://test.*.teams.microsoft.com', logger)!;
      expect(verifier.test(new URL('https://test.subdomain.teams.microsoft.com'))).toBe(true);
    });

    it('returns false for nested wildcard when prefix does not match', () => {
      const verifier = createURLVerifier('https://test.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://prod.subdomain.teams.com'))).toBe(false);
    });

    it('returns false for nested wildcard when suffix does not match', () => {
      const verifier = createURLVerifier('https://test.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://test.subdomain.outlook.com'))).toBe(false);
    });

    it('returns false for nested wildcard with wrong depth', () => {
      const verifier = createURLVerifier('https://test.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://test.a.b.teams.com'))).toBe(false);
    });

    it('returns false for nested wildcard with fewer levels', () => {
      const verifier = createURLVerifier('https://test.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://test.teams.com'))).toBe(false);
    });

    it('returns true for wildcard in the middle of a longer pattern', () => {
      const verifier = createURLVerifier('https://api.*.service.teams.com', logger)!;
      expect(verifier.test(new URL('https://api.v2.service.teams.com'))).toBe(true);
    });

    it('returns false for wildcard in middle when other segments mismatch', () => {
      const verifier = createURLVerifier('https://api.*.service.teams.com', logger)!;
      expect(verifier.test(new URL('https://api.v2.other.teams.com'))).toBe(false);
    });

    it('returns false for multiple wildcards ', () => {
      const verifier = createURLVerifier('https://*.*.teams.com', logger)!;
      expect(verifier.test(new URL('https://subdomain.teams.com'))).toBe(false);
    });

    it('returns true for nested wildcard with port', () => {
      const verifier = createURLVerifier('https://test.*.teams.com:8080', logger)!;
      expect(verifier.test(new URL('https://test.subdomain.teams.com:8080'))).toBe(true);
    });

    it('returns false for nested wildcard with mismatched port', () => {
      const verifier = createURLVerifier('https://test.*.teams.com:8080', logger)!;
      expect(verifier.test(new URL('https://test.subdomain.teams.com:9090'))).toBe(false);
    });
  });
});

describe('validateHostAgainstPattern', () => {
  it('returns true for an exact match', () => {
    expect(validateHostAgainstPattern('teams.microsoft.com', 'teams.microsoft.com')).toBe(true);
  });

  it('returns false for a partial mismatch', () => {
    expect(validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com')).toBe(false);
  });

  it('returns true for matching wildcard subdomain', () => {
    expect(validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com')).toBe(true);
  });

  it('returns false for wildcard with wrong depth', () => {
    expect(validateHostAgainstPattern('*.microsoft.com', 'a.b.microsoft.com')).toBe(false);
  });

  it('returns false for wildcard with fewer levels', () => {
    expect(validateHostAgainstPattern('*.teams.microsoft.com', 'teams.microsoft.com')).toBe(false);
  });

  it('returns false when the suffix does not match', () => {
    expect(validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.outlook.microsoft.com')).toBe(false);
  });

  it('returns true for wildcard with single subdomain level', () => {
    expect(validateHostAgainstPattern('*.example.com', 'sub.example.com')).toBe(true);
  });

  it('returns false for appended domain (evil domain attack)', () => {
    expect(validateHostAgainstPattern('teams.microsoft.com', 'teams.microsoft.com.evil.com')).toBe(false);
  });

  it('returns false when pattern has no wildcard and host differs', () => {
    expect(validateHostAgainstPattern('teams.microsoft.com', 'outlook.microsoft.com')).toBe(false);
  });

  it('returns true for exact localhost match', () => {
    expect(validateHostAgainstPattern('localhost', 'localhost')).toBe(true);
  });

  it('returns false for localhost vs different host', () => {
    expect(validateHostAgainstPattern('localhost', 'notlocalhost')).toBe(false);
  });

  describe('nested wildcard patterns', () => {
    it('returns true for nested wildcard test.*.teams.com matching test.subdomain.teams.com', () => {
      expect(validateHostAgainstPattern('test.*.teams.com', 'test.subdomain.teams.com')).toBe(true);
    });

    it('returns true for nested wildcard test.*.teams.microsoft.com matching test.subdomain.teams.microsoft.com', () => {
      expect(validateHostAgainstPattern('test.*.teams.microsoft.com', 'test.subdomain.teams.microsoft.com')).toBe(true);
    });

    it('returns false for nested wildcard when prefix does not match', () => {
      expect(validateHostAgainstPattern('test.*.teams.com', 'prod.subdomain.teams.com')).toBe(false);
    });

    it('returns false for nested wildcard when suffix does not match', () => {
      expect(validateHostAgainstPattern('test.*.teams.com', 'test.subdomain.outlook.com')).toBe(false);
    });

    it('returns false for nested wildcard with wrong depth', () => {
      expect(validateHostAgainstPattern('test.*.teams.com', 'test.a.b.teams.com')).toBe(false);
    });

    it('returns false for nested wildcard with fewer levels', () => {
      expect(validateHostAgainstPattern('test.*.teams.com', 'test.teams.com')).toBe(false);
    });

    it('returns true for wildcard in the middle of a longer pattern', () => {
      expect(validateHostAgainstPattern('api.*.service.teams.com', 'api.v2.service.teams.com')).toBe(true);
    });

    it('returns false for wildcard in middle when other segments mismatch', () => {
      expect(validateHostAgainstPattern('api.*.service.teams.com', 'api.v2.other.teams.com')).toBe(false);
    });

    it('returns false for multiple wildcards with wrong depth', () => {
      expect(validateHostAgainstPattern('*.*.teams.com', 'subdomain.teams.com')).toBe(false);
    });

    it('returns false for wildcard at end of pattern (TLD position not allowed)', () => {
      expect(validateHostAgainstPattern('teams.microsoft.*', 'teams.microsoft.com')).toBe(false);
    });

    it('returns false for wildcard at end matching different TLD (TLD position not allowed)', () => {
      expect(validateHostAgainstPattern('teams.microsoft.*', 'teams.microsoft.net')).toBe(false);
    });
  });
});
