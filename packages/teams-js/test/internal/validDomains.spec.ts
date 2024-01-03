import { GlobalVars } from '../../src/internal/globalVars';
import { validateOrigin } from '../../src/internal/validDomains';
import { app } from '../../src/public/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';
describe('validDomains', () => {
  let utils: Utils = new Utils();

  beforeEach(() => {
    // Set a mock window for testing
    utils = new Utils();
    utils.mockWindow.parent = undefined;
    app._initialize(utils.mockWindow);
    GlobalVars.isFramelessWindow = false;
  });

  afterAll(() => {
    GlobalVars.isFramelessWindow = false;
  });
  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });
  it('validateOrigin returns true if origin is in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://teams.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://subdomain.teams.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://badorigin.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://team.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if origin is valid origin supplied by user ', async () => {
    const messageOrigin = new URL('https://testorigin.com');
    GlobalVars.additionalValidOrigins = [messageOrigin.origin];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not supplied by user', async () => {
    const messageOrigin = new URL('https://badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com'];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if origin for subdomains is in the user supplied list', async () => {
    const messageOrigin = new URL('https://subdomain.badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://*.badorigin.com'];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin for subdomains is not in the user supplied list', async () => {
    const messageOrigin = new URL('https://subdomain.badorigin.com');
    GlobalVars.additionalValidOrigins = ['https://*.testorigin.com'];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://local.teams.live.com:4000');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', async () => {
    const messageOrigin = new URL('https://testorigin.com:4000');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com:8080'];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://local.teams.live.com:8080');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if the port number of valid origin is in the user supplied list', async () => {
    const messageOrigin = new URL('https://testorigin.com:8080');
    GlobalVars.additionalValidOrigins = ['https://testorigin.com:8080'];
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin has extra appended', async () => {
    const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
    /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
    const messageOrigin = new URL('http://teams.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://myteams.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list', async () => {
    const messageOrigin = new URL('https://myteams.microsoft.com');
    const result = await validateOrigin(messageOrigin);
    GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin for subdomains does not match in teams pre-known allowlist', async () => {
    const messageOrigin = new URL('https://a.b.sharepoint.com');
    const result = await validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin for subdomains does not match in the user supplied list', async () => {
    const messageOrigin = new URL('https://a.b.testdomain.com');
    const result = await validateOrigin(messageOrigin);
    GlobalVars.additionalValidOrigins = ['https://*.testdomain.com'];
    expect(result).toBe(false);
  });
});
