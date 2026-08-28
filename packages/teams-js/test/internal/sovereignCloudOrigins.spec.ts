import * as fs from 'fs';
import * as path from 'path';

import { bundledValidOrigins, currentCloudEnvironment, isSovereignCloud } from '../../src/internal/cloudEnvironment';
import { validOriginsCdnEndpoint } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import {
  hasValidOriginsOverride,
  prefetchOriginsFromCDN,
  resetValidOriginsCache,
  setValidOriginsOverride,
  validateOrigin,
} from '../../src/internal/validOrigins';
import * as app from '../../src/public/app/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/**
 * Covers the sovereign-cloud work: the build-time cloud selection (Option A) and the runtime
 * replace semantics that let an app discard the origins teamsjs shipped with (Option B).
 */
describe('sovereign cloud valid origins', () => {
  describe('cloudEnvironment', () => {
    it('defaults to the prod cloud when built without TEAMSJS_CLOUD', () => {
      expect(currentCloudEnvironment).toBe('prod');
      expect(isSovereignCloud()).toBe(false);
    });

    it('exposes a CDN endpoint for the prod cloud', () => {
      expect(validOriginsCdnEndpoint).not.toBeNull();
      expect(validOriginsCdnEndpoint?.host).toBe('res.cdn.office.net');
    });

    it('bundles a non-empty origin list', () => {
      expect(bundledValidOrigins.length).toBeGreaterThan(0);
      expect(bundledValidOrigins).toContain('teams.microsoft.com');
    });
  });

  /**
   * Structural checks over every cloud artifact, read from disk rather than through the bundler,
   * so drift between clouds is caught even though only the prod artifact is resolvable at compile
   * time.
   */
  describe('cloud artifacts', () => {
    const artifactDir = path.resolve(__dirname, '../../src/artifactsForCDN');
    const artifacts = fs
      .readdirSync(artifactDir)
      .filter((f) => f.startsWith('validDomains') && f.endsWith('.json'))
      .map((f) => ({ file: f, json: JSON.parse(fs.readFileSync(path.join(artifactDir, f), 'utf8')) }));

    /** Clouds with no reachable CDN. The bundled list is authoritative there. */
    const airGapped = ['ag08', 'ag09'];

    it('covers every supported cloud exactly once', () => {
      expect(artifacts.map((a) => a.json.cloud).sort()).toEqual(['ag08', 'ag09', 'dod', 'gallatin', 'gcch', 'prod']);
    });

    it.each(artifacts.map((a) => [a.file, a.json]))('%s is well formed', (_file, json) => {
      expect(typeof json.cloud).toBe('string');
      expect(Array.isArray(json.validOrigins)).toBe(true);
      expect(json.validOrigins.length).toBeGreaterThan(0);
      expect(typeof json.teamsDeepLinkHost).toBe('string');
      // The deep-link host must be an origin this cloud already trusts.
      expect(json.validOrigins).toContain(json.teamsDeepLinkHost);
    });

    it.each(artifacts.map((a) => [a.file, a.json]))('%s serves its list from the shared CDN', (_file, json) => {
      if (airGapped.includes(json.cloud)) {
        expect(json.validOriginsCdnEndpoint).toBeNull();
        return;
      }
      // All connected clouds share one host: *.cdn.office.net is a required, published endpoint
      // in Worldwide, GCC High, DoD and China, so no per-cloud CDN infrastructure is needed.
      const url = new URL(json.validOriginsCdnEndpoint);
      expect(url.host).toBe('res.cdn.office.net');
      expect(url.pathname.startsWith('/teams-js/validDomains/json/')).toBe(true);
    });

    it('gives each cloud a distinct list, with no prod origins in sovereign builds', () => {
      const prod = artifacts.find((a) => a.json.cloud === 'prod')!.json;
      for (const { json } of artifacts.filter((a) => a.json.cloud !== 'prod')) {
        expect(json.validOrigins).not.toContain('teams.microsoft.com');
        expect(json.validOrigins).not.toContain('www.staging-bing-int.com');
        expect(json.validOrigins).not.toContain('www.officeppe.com');
        expect(json.teamsDeepLinkHost).not.toBe(prod.teamsDeepLinkHost);
      }
    });
  });

  describe('valid origins override (replace semantics)', () => {
    let utils: Utils = new Utils();
    const originalFetch = global.fetch;

    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      resetValidOriginsCache();
    });

    afterEach(() => {
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
      global.fetch = originalFetch;
      GlobalVars.additionalValidOrigins = [];
      resetValidOriginsCache();
    });

    it('throws when the override specifies neither a list nor a url', () => {
      expect(() => setValidOriginsOverride({})).toThrow(
        'A valid origins override must specify at least one of `list` or `url`.',
      );
      expect(hasValidOriginsOverride()).toBe(false);
    });

    it('trusts origins from the override list', async () => {
      setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });
      expect(hasValidOriginsOverride()).toBe(true);

      await expect(validateOrigin(new URL('https://gov.teams.microsoft.us'))).resolves.toBe(true);
    });

    it('stops trusting the built-in origins once an override is set', async () => {
      // Trusted by default...
      await expect(validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(true);

      resetValidOriginsCache();
      setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });

      // ...and no longer trusted after the override replaces the list.
      await expect(validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(false);
      await expect(validateOrigin(new URL('https://dod.teams.microsoft.us'))).resolves.toBe(false);
    });

    it('never calls the CDN while an override is in effect', async () => {
      global.fetch = jest.fn();
      setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });

      await validateOrigin(new URL('https://not-in-the-list.example.com'));
      await prefetchOriginsFromCDN();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches the override list from the supplied url', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => ({ validOrigins: ['gov.teams.microsoft.us'] }),
        } as Response),
      );

      setValidOriginsOverride({
        url: new URL('https://res.cdn.office.net/teams-js/validDomains/json/validDomains.gcch.json'),
      });

      await expect(validateOrigin(new URL('https://gov.teams.microsoft.us'))).resolves.toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect((global.fetch as jest.Mock).mock.calls[0][0].toString()).toContain('validDomains.gcch.json');
    });

    it('combines the inline list with the fetched list', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => ({ validOrigins: ['from-cdn.example.com'] }),
        } as Response),
      );

      setValidOriginsOverride({
        list: ['inline.example.com'],
        url: new URL('https://res.cdn.office.net/teams-js/validDomains/json/validDomains.gcch.json'),
      });

      await expect(validateOrigin(new URL('https://inline.example.com'))).resolves.toBe(true);
      await expect(validateOrigin(new URL('https://from-cdn.example.com'))).resolves.toBe(true);
    });

    it('does NOT fall back to the built-in list when the override fetch fails', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('network down')));

      setValidOriginsOverride({
        list: ['gov.teams.microsoft.us'],
        url: new URL('https://res.cdn.office.net/teams-js/validDomains/json/validDomains.gcch.json'),
      });

      // The inline part of the override still applies...
      await expect(validateOrigin(new URL('https://gov.teams.microsoft.us'))).resolves.toBe(true);
      // ...but a failed fetch must never silently restore the origins we were trying to drop.
      await expect(validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(false);
    });

    it('still honours additionalValidOrigins supplied via app.initialize', async () => {
      GlobalVars.additionalValidOrigins = ['https://custom.example.com'];
      setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });

      await expect(validateOrigin(new URL('https://custom.example.com'))).resolves.toBe(true);
    });

    it('resetValidOriginsCache clears the override', async () => {
      setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });
      expect(hasValidOriginsOverride()).toBe(true);

      resetValidOriginsCache();

      expect(hasValidOriginsOverride()).toBe(false);
      await expect(validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(true);
    });
  });

  /**
   * Guards the existing prod behaviour. Everything here passed before this change and must keep
   * passing: an app that does not opt in to any of the new options must be unaffected.
   */
  describe('prod back-compat', () => {
    let utils: Utils = new Utils();
    const originalFetch = global.fetch;

    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      resetValidOriginsCache();
    });

    afterEach(() => {
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
      global.fetch = originalFetch;
      GlobalVars.additionalValidOrigins = [];
      resetValidOriginsCache();
    });

    it('no override is in effect unless the app asks for one', () => {
      expect(hasValidOriginsOverride()).toBe(false);
    });

    it('keeps trusting every origin in the shipped prod list', async () => {
      for (const origin of ['teams.microsoft.com', 'outlook.office.com', 'www.office.com', 'dod.teams.microsoft.us']) {
        await expect(validateOrigin(new URL(`https://${origin}`))).resolves.toBe(true);
      }
    });

    it('keeps supporting wildcard entries in the shipped prod list', async () => {
      await expect(validateOrigin(new URL('https://anything.cloud.microsoft'))).resolves.toBe(true);
    });

    it('keeps rejecting unknown origins', async () => {
      await expect(validateOrigin(new URL('https://evil.example.com'))).resolves.toBe(false);
    });

    it('keeps rejecting non-https origins', async () => {
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- the insecure scheme is the thing under test
      await expect(validateOrigin(new URL('http://teams.microsoft.com'))).resolves.toBe(false);
    });

    it('still falls back to the shipped list when the CDN fetch fails', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('network down')));
      await expect(validateOrigin(new URL('https://teams.microsoft.com'), true)).resolves.toBe(true);
    });

    it('still targets the prod CDN endpoint', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ status: 200, ok: true, json: async () => ({ validOrigins: [] }) } as Response),
      );
      await prefetchOriginsFromCDN();
      expect((global.fetch as jest.Mock).mock.calls[0][0].toString()).toBe(
        'https://res.cdn.office.net/teams-js/validDomains/json/validDomains.json',
      );
    });

    it('app.initialize() with no arguments still warms the CDN list', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          status: 200,
          ok: true,
          json: async () => ({ validOrigins: ['warmed.example.com'] }),
        } as Response),
      );

      await utils.initializeWithContext('content');

      // The prefetch moved from module-import time to initialize time; it must still happen.
      expect(global.fetch).toHaveBeenCalled();
      await expect(validateOrigin(new URL('https://warmed.example.com'))).resolves.toBe(true);
    });

    /**
     * Backs the load-impact analysis: moving the prefetch to initialize is only observable when
     * the host origin is absent from the bundled list. For every shipped origin the CDN is never
     * consulted at all, so there is nothing to wait for.
     */
    it('validating a bundled origin never issues a network request', async () => {
      global.fetch = jest.fn();

      for (const origin of ['teams.microsoft.com', 'outlook.office.com', 'anything.cloud.microsoft']) {
        await expect(validateOrigin(new URL(`https://${origin}`))).resolves.toBe(true);
      }

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('an unknown origin joins the in-flight prefetch rather than starting a second fetch', async () => {
      let resolveFetch: (r: Response) => void = () => {};
      global.fetch = jest.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      // Kick off the prefetch, then race a validation against it while still in flight.
      const prefetch = prefetchOriginsFromCDN();
      const validation = validateOrigin(new URL('https://late.example.com'));

      resolveFetch({
        status: 200,
        ok: true,
        json: async () => ({ validOrigins: ['late.example.com'] }),
      } as Response);

      await prefetch;
      await expect(validation).resolves.toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('app.initialize(validMessageOrigins) is still additive, not replacing', async () => {
      await utils.initializeWithContext('content', undefined, ['https://custom.example.com']);

      // The app-supplied origin is trusted...
      await expect(validateOrigin(new URL('https://custom.example.com'))).resolves.toBe(true);
      // ...and so are the built-in ones. Passing validMessageOrigins must NOT replace them.
      await expect(validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(true);
      expect(hasValidOriginsOverride()).toBe(false);
    });
  });
});
