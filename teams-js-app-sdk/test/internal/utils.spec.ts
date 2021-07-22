import { compareSDKVersions, generateRegExpFromUrls, validateOrigin } from '../../src/internal/utils';
import { GlobalVars } from '../../src/internal/globalVars';

describe('utils', () => {
  test('compareSDKVersions', () => {
    expect(compareSDKVersions('1.2', '1.2.0')).toEqual(0);
    expect(compareSDKVersions('1.2a', '1.2b')).toEqual(NaN);
    expect(compareSDKVersions('1.2', '1.3')).toEqual(-1);
    expect(compareSDKVersions('2.0', '1.3.2')).toEqual(1);
    expect(compareSDKVersions('1.10.0', '1.8.0')).toEqual(1);
    expect(compareSDKVersions('1.10.0', '1.8.2')).toEqual(1);
    expect(compareSDKVersions('2', '1.10.345')).toEqual(1);
    expect(compareSDKVersions('1.9.1', '1.9.0.0')).toEqual(1);
  });

  it('validateOrigin returns true if origin is in teams pre-known allowlist', () => {
    const messageOrigin = 'https://teams.microsoft.com';
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', () => {
    const messageOrigin = 'https://subdomain.teams.microsoft.com';
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not in teams pre-known allowlist', () => {
    const messageOrigin = 'badorigin.com';
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', () => {
    const messageOrigin = 'https://team.microsoft.com';
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if origin is valid origin supplied by user ', () => {
    const messageOrigin = 'testorigin.com';
    GlobalVars.additionalValidOriginsRegexp = generateRegExpFromUrls([messageOrigin]);
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not supplied by user', () => {
    const messageOrigin = 'badorigin.com';
    GlobalVars.additionalValidOriginsRegexp = generateRegExpFromUrls(['testorigin.com']);
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
});
