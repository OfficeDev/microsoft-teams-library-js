/**
 * Air-gapped clouds (AG08, AG09) have no reachable CDN, so their valid-domains artifact sets
 * `validOriginsCdnEndpoint` to null. These tests simulate such a build by mocking the resolved
 * constant, and assert that teamsjs makes no network call at all rather than attempting one and
 * waiting out the fetch timeout.
 */
jest.mock('../../src/internal/constants', () => {
  const actual = jest.requireActual('../../src/internal/constants');
  return {
    ...actual,
    validOriginsCdnEndpoint: null,
    validOriginsFallback: ['teams.eaglex.ic.gov'],
  };
});

describe('air-gapped cloud (no CDN endpoint)', () => {
  const originalFetch = global.fetch;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let validOrigins: any;
  // Re-required after resetModules so it is the same instance the fresh validOrigins module sees.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let globalVars: any;

  beforeEach(() => {
    jest.resetModules();
    global.fetch = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    validOrigins = require('../../src/internal/validOrigins');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    globalVars = require('../../src/internal/globalVars').GlobalVars;
    validOrigins.resetValidOriginsCache();
    globalVars.additionalValidOrigins = [];
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('trusts the bundled origin without any network call', async () => {
    await expect(validOrigins.validateOrigin(new URL('https://teams.eaglex.ic.gov'))).resolves.toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects an unknown origin immediately, without attempting a fetch', async () => {
    await expect(validOrigins.validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects without waiting out the fetch timeout', async () => {
    const start = Date.now();
    await validOrigins.validateOrigin(new URL('https://not-trusted.example.com'));
    // ORIGIN_LIST_FETCH_TIMEOUT_IN_MS is 1500; resolution must be effectively immediate.
    expect(Date.now() - start).toBeLessThan(100);
  });

  it('prefetch is a no-op that resolves without a network call', async () => {
    await expect(validOrigins.prefetchOriginsFromCDN()).resolves.toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('still honours additionalValidOrigins from app.initialize', async () => {
    globalVars.additionalValidOrigins = ['https://custom.eaglex.ic.gov'];
    await expect(validOrigins.validateOrigin(new URL('https://custom.eaglex.ic.gov'))).resolves.toBe(true);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
