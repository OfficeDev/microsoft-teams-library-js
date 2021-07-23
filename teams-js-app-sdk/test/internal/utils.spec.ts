import { GlobalVars } from '../../src/internal/globalVars';
import { compareSDKVersions, validateOrigin } from '../../src/internal/utils';

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
    const messageOrigin = new URL('https://teams.microsoft.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', () => {
    const messageOrigin = new URL('https://subdomain.teams.microsoft.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not in teams pre-known allowlist', () => {
    const messageOrigin = new URL('https://badorigin.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', () => {
    const messageOrigin = new URL('https://team.microsoft.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if origin is valid origin supplied by user ', () => {
    const messageOrigin = new URL('https://testorigin.com');
    GlobalVars.additionalValidOrigins = [messageOrigin.origin];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not supplied by user', () => {
    const messageOrigin = new URL('https://badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com'];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if origin for subdomains is in the user supplied list', () => {
    const messageOrigin = new URL('https://subdomain.badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://*.badorigin.com'];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin for subdomains is not in the user supplied list', () => {
    const messageOrigin = new URL('https://subdomain.badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://*.testorigin.com'];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', () => {
    const messageOrigin = new URL('https://local.teams.live.com:4000');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', () => {
    const messageOrigin = new URL('https://testorigin.com:4000');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com:8080'];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', () => {
    const messageOrigin = new URL('https://local.teams.live.com:8080');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if the port number of valid origin is in the user supplied list', () => {
    const messageOrigin = new URL('https://testorigin.com:8080');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com:8080'];
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin has extra appended', () => {
    const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it("validateOrigin returns false if the protocol of origin is not 'https:'", () => {
    const messageOrigin = new URL('http://teams.microsoft.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it("validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist", () => {
    const messageOrigin = new URL('https://myteams.microsoft.com');
    const result = validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it("validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list", () => {
    const messageOrigin = new URL('https://myteams.microsoft.com');
    const result = validateOrigin(messageOrigin);
    GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
    expect(result).toBe(false);
  });
});
