import { ORIGIN_LIST_FETCH_TIMEOUT_IN_MS } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import {
  isValidOriginsJSONValid,
  prefetchOriginsFromCDN,
  resetValidOriginsCache,
  validateOrigin,
} from '../../src/internal/validOrigins';
import * as app from '../../src/public/app/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

//We need this now because our code prefetches the CDN url and caches the response. This has the side effect of bypassing all future fetch calls.
const disableCache = true;

describe('validOrigins', () => {
  describe('testing main validOrigins flow', () => {
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
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://test.www.office.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://team.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin is valid origin supplied by user ', async () => {
      const messageOrigin = new URL('https://testorigin.example.com');
      GlobalVars.additionalValidOrigins = [messageOrigin.origin];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not supplied by user', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin for subdomains is in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.badorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin for subdomains is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:4000');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:4000');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:8080');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if the port number of valid origin is in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:8080');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin has extra appended', async () => {
      const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://a.b.sharepoint.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in the user supplied list', async () => {
      const messageOrigin = new URL('https://a.b.testdomain.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.testdomain.com'];
      expect(result).toBe(false);
    });
    it('validateOrigin returns true for high-profile *.cloud.microsoft origins', async () => {
      let messageOrigin = new URL('https://teams.cloud.microsoft');
      let result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);

      messageOrigin = new URL('https://outlook.cloud.microsoft');
      result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);

      messageOrigin = new URL('https://m365.cloud.microsoft');
      result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it("validateOrigin returns true if the protocol of origin is 'http:' and specified in user-supplied list", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      GlobalVars.additionalValidOrigins = ['http://teams.microsoft.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true for non-https origin in user-specified list', async () => {
      const messageOrigin = new URL('chrome://');
      GlobalVars.additionalValidOrigins = ['chrome://'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true for non-https full origin in user-specified list', async () => {
      const messageOrigin = new URL('chrome://my-new-origin');
      GlobalVars.additionalValidOrigins = ['chrome://my-new-origin'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it("validateOrigin returns false for non-https if protocols don't match", async () => {
      const messageOrigin = new URL('https://my-new-origin');
      GlobalVars.additionalValidOrigins = ['chrome://my-new-origin'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false for non-https if hostname don't match", async () => {
      const messageOrigin = new URL('chrome://my-new-origin');
      GlobalVars.additionalValidOrigins = ['chrome://different-origin'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true for non-https using wildcard', async () => {
      const messageOrigin = new URL('chrome://chrome.testing.url.com');
      GlobalVars.additionalValidOrigins = ['chrome://*.testing.url.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true for nested wildcard test.*.teams.com in user-supplied list', async () => {
      const messageOrigin = new URL('https://test.subdomain.teams.com');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true for nested wildcard test.*.teams.microsoft.com in user-supplied list', async () => {
      const messageOrigin = new URL('https://test.subdomain.teams.microsoft.com');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.microsoft.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false for nested wildcard when prefix does not match', async () => {
      const messageOrigin = new URL('https://prod.subdomain.teams.com');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false for nested wildcard when suffix does not match', async () => {
      const messageOrigin = new URL('https://test.subdomain.outlook.com');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true for wildcard in the middle of a longer pattern', async () => {
      const messageOrigin = new URL('https://api.v2.service.teams.com');
      GlobalVars.additionalValidOrigins = ['https://api.*.service.teams.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false for wildcard in middle when other segments mismatch', async () => {
      const messageOrigin = new URL('https://api.v2.other.teams.com');
      GlobalVars.additionalValidOrigins = ['https://api.*.service.teams.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true for nested wildcard with port', async () => {
      const messageOrigin = new URL('https://test.subdomain.teams.com:8080');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false for nested wildcard with mismatched port', async () => {
      const messageOrigin = new URL('https://test.subdomain.teams.com:9090');
      GlobalVars.additionalValidOrigins = ['https://test.*.teams.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
  });
  describe('testing main validOrigins flow with invalid json object', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => {
            return { badExample: 'badLink' };
          },
        } as Response),
      );
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
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://test.www.office.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://team.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin is valid origin supplied by user ', async () => {
      const messageOrigin = new URL('https://testorigin.example.com');
      GlobalVars.additionalValidOrigins = [messageOrigin.origin];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not supplied by user', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin for subdomains is in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.badorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin for subdomains is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:4000');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:4000');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:8080');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if the port number of valid origin is in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:8080');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin has extra appended', async () => {
      const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://a.b.sharepoint.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in the user supplied list', async () => {
      const messageOrigin = new URL('https://a.b.testdomain.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.testdomain.com'];
      expect(result).toBe(false);
    });
  });
  describe('testing fallback validOrigins flow with fetch succeeding and no json object', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      global.fetch = jest.fn(() => Promise.resolve({ status: 200, ok: true } as Response));
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
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://test.www.office.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://team.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin is valid origin supplied by user ', async () => {
      const messageOrigin = new URL('https://testorigin.example.com');
      GlobalVars.additionalValidOrigins = [messageOrigin.origin];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not supplied by user', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin for subdomains is in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.badorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin for subdomains is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:4000');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:4000');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:8080');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if the port number of valid origin is in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:8080');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin has extra appended', async () => {
      const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://a.b.sharepoint.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in the user supplied list', async () => {
      const messageOrigin = new URL('https://a.b.testdomain.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.testdomain.com'];
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(false);
    });
  });
  describe('testing fallback validOrigins flow with fetch error', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      global.fetch = jest.fn(() => Promise.resolve({ status: 503, ok: false } as Response));
      resetValidOriginsCache();
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
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if origin for subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://test.www.office.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin is not an exact match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://team.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin is valid origin supplied by user ', async () => {
      const messageOrigin = new URL('https://testorigin.example.com');
      GlobalVars.additionalValidOrigins = [messageOrigin.origin];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin is not supplied by user', async () => {
      const messageOrigin = new URL('https://badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if origin for subdomains is in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.badorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin for subdomains is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://subdomain.badorigin.example.com');
      GlobalVars.additionalValidOrigins = ['https://*.testorigin.example.com'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:4000');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if the port number of valid origin is not in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:4000');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns true if the port number of valid origin is in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://local.teams.live.com:8080');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns true if the port number of valid origin is in the user supplied list', async () => {
      const messageOrigin = new URL('https://testorigin.example.com:8080');
      GlobalVars.additionalValidOrigins = ['https://testorigin.example.com:8080'];
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if origin has extra appended', async () => {
      const messageOrigin = new URL('https://teams.microsoft.com.evil.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it("validateOrigin returns false if the protocol of origin is not 'https:'", async () => {
      /* eslint-disable-next-line @microsoft/sdl/no-insecure-url */ /* Intentionally using http here because of what it is testing */
      const messageOrigin = new URL('http://teams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if first end of origin is not matched valid subdomains in the user supplied list', async () => {
      const messageOrigin = new URL('https://myteams.microsoft.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.teams.microsoft.com'];
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in teams pre-known allowlist', async () => {
      const messageOrigin = new URL('https://a.b.sharepoint.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
    it('validateOrigin returns false if origin for subdomains does not match in the user supplied list', async () => {
      const messageOrigin = new URL('https://a.b.testdomain.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      GlobalVars.additionalValidOrigins = ['https://*.testdomain.com'];
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
  describe('testing fetch timeout flow', () => {
    let utils: Utils = new Utils();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let timeoutSpy;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let abortSpy;
    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      jest.useFakeTimers();

      global.AbortController.prototype.abort = jest.fn(() => {
        throw new Error('AbortError');
      });

      timeoutSpy = jest.spyOn(global, 'setTimeout');
      abortSpy = jest.spyOn(AbortController.prototype, 'abort');

      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            jest.advanceTimersByTime(ORIGIN_LIST_FETCH_TIMEOUT_IN_MS);
            resolve({
              status: 200,
              ok: true,
              json: async () => {
                return { validOrigins: ['example.com'] };
              },
            } as Response);
          }),
      );

      resetValidOriginsCache();
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
      jest.restoreAllMocks();
      jest.clearAllTimers();
    });
    it('validateOrigin returns true if fetch call times out and domain is in fallback list', async () => {
      const timedOutOrigin = new URL('https://example.com');
      const timedOutResult = await validateOrigin(timedOutOrigin, disableCache);
      expect(abortSpy).toBeCalledTimes(1);
      expect(timedOutResult).toBe(false);
      const messageOrigin = new URL('https://teams.microsoft.com');
      const fallbackResult = await validateOrigin(messageOrigin, disableCache);
      expect(fallbackResult).toBe(true);
    });
    it('validateOrigin returns true if fetch call does not time out', async () => {
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) => {
            resolve({
              status: 200,
              ok: true,
              json: async () => {
                return { validOrigins: ['example.com'] };
              },
            } as Response);
          }),
      );

      const messageOrigin = new URL('https://example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(abortSpy).toBeCalledTimes(0);
      expect(result).toBe(true);
    });
    it('validateOrigin returns false if fetch call times out and domain is not in fallback list', async () => {
      const messageOrigin = new URL('https://example.com');
      const result = await validateOrigin(messageOrigin, disableCache);
      expect(abortSpy).toBeCalledTimes(1);
      expect(result).toBe(false);
    });
  });

  describe('testing prefetchOriginsFromCDN', () => {
    let utils: Utils = new Utils();
    // The baseline fetch mock installed by test/setupTest.ts, captured before any test overwrites it
    const originalFetch = global.fetch;
    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      resetValidOriginsCache();
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
      // Restore the shared state these tests mutate so nothing leaks into other suites
      global.fetch = originalFetch;
      resetValidOriginsCache();
    });

    it('prefetchOriginsFromCDN warms the cache so later validations use the CDN list without fetching again', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => {
            return { validOrigins: ['prefetched.example.com'] };
          },
        } as Response),
      );

      await prefetchOriginsFromCDN();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // This origin is only known because of the prefetch, and it is served from the cache
      const messageOrigin = new URL('https://prefetched.example.com');
      const result = await validateOrigin(messageOrigin);
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('prefetchOriginsFromCDN only initiates a single fetch call when concurrent callers race the in-flight request', async () => {
      let resolveFetch: (response: Response) => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      // All three callers start before the first fetch settles, so they must share the in-flight promise
      const prefetches = Promise.all([prefetchOriginsFromCDN(), prefetchOriginsFromCDN(), prefetchOriginsFromCDN()]);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      resolveFetch({
        status: 200,
        ok: true,
        json: async () => {
          return { validOrigins: ['prefetched.example.com'] };
        },
      } as Response);
      await prefetches;
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('prefetchOriginsFromCDN only initiates a single fetch call when called again after the first one resolves', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => {
            return { validOrigins: ['prefetched.example.com'] };
          },
        } as Response),
      );

      await prefetchOriginsFromCDN();
      await prefetchOriginsFromCDN();
      await prefetchOriginsFromCDN();
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('prefetchOriginsFromCDN resolves and falls back to the hardcoded list when the fetch call fails', async () => {
      global.fetch = jest.fn(() => Promise.resolve({ status: 503, ok: false } as Response));

      await expect(prefetchOriginsFromCDN()).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fallbackOrigin = new URL('https://teams.microsoft.com');
      expect(await validateOrigin(fallbackOrigin)).toBe(true);

      const unknownOrigin = new URL('https://badorigin.example.com');
      expect(await validateOrigin(unknownOrigin)).toBe(false);
    });

    it('prefetchOriginsFromCDN resolves and falls back to the hardcoded list when the fetch call rejects', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network failure')));

      await expect(prefetchOriginsFromCDN()).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fallbackOrigin = new URL('https://teams.microsoft.com');
      expect(await validateOrigin(fallbackOrigin)).toBe(true);
    });

    it('prefetchOriginsFromCDN resolves and falls back to the hardcoded list when the CDN returns an invalid list', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => {
            return { badExample: 'badLink' };
          },
        } as Response),
      );

      await expect(prefetchOriginsFromCDN()).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fallbackOrigin = new URL('https://teams.microsoft.com');
      expect(await validateOrigin(fallbackOrigin)).toBe(true);
    });
  });

  describe('testing isValidOriginsJSONValid', () => {
    it.each([
      ['a malformed JSON string', '{ "validOrigins": '],
      ['an empty string', ''],
      ['the literal string undefined', 'undefined'],
      ['a JSON null literal', 'null'],
    ])('returns false instead of throwing for %s', (_description, validOriginsJSON) => {
      let result: boolean | undefined;
      expect(() => {
        result = isValidOriginsJSONValid(validOriginsJSON);
      }).not.toThrow();
      expect(result).toBe(false);
    });

    it('returns false when the parsed JSON has no validOrigins property', () => {
      expect(isValidOriginsJSONValid(JSON.stringify({ badExample: 'badLink' }))).toBe(false);
    });

    it.each([
      ['a string', 'example.com'],
      ['a number', 5],
      ['an object', { 'example.com': true }],
      ['null', null],
      ['a boolean', true],
    ])(
      'returns false instead of throwing when validOrigins is %s rather than an array',
      (_description, validOrigins) => {
        let result: boolean | undefined;
        expect(() => {
          result = isValidOriginsJSONValid(JSON.stringify({ validOrigins }));
        }).not.toThrow();
        expect(result).toBe(false);
      },
    );

    it('returns false when the validOrigins array contains a non-string entry', () => {
      expect(isValidOriginsJSONValid(JSON.stringify({ validOrigins: ['valid.example.com', 5] }))).toBe(false);
    });

    it('returns false when the validOrigins list contains an unparsable origin', () => {
      expect(isValidOriginsJSONValid(JSON.stringify({ validOrigins: ['valid.example.com', 'not a host'] }))).toBe(
        false,
      );
    });

    it('returns true for a well formed valid origins list', () => {
      expect(isValidOriginsJSONValid(JSON.stringify({ validOrigins: ['valid.example.com', '*.example.com'] }))).toBe(
        true,
      );
    });
  });
});
