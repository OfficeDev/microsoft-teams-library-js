import { validOriginsFallback } from '../src/internal/constants';

/**
 * We currently run a fetch call to acquire CDN assets as soon as TeamsJS is loaded.
 * Since fet ch is supported in both browser and Node environments, but not supported in jest/jsdom,
 * we polyfill fetch with a mock implementation that acquires the fallback domain list prior to running the tests.
 */
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    ok: true,
    json: async () => {
      return { validOrigins: validOriginsFallback };
    },
  } as Response),
);
