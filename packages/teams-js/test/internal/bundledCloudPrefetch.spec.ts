import { GlobalVars } from '../../src/internal/globalVars';

/**
 * Covers the import-time prefetch for the cloud a bundle targets, and the invalidation that makes it
 * safe.
 *
 * The parent spike moved the prefetch out of module scope and into `app.initialize`, on the grounds
 * that importing teamsjs should not emit a request before the app can say which cloud it is in.
 * Under the subpath-exports delivery model that no longer applies: `cloudBuild.cjs` aliases the
 * valid-domains artifact at build time, so a `/gcch` bundle already knows its single endpoint when it
 * is evaluated. These tests pin both halves of that claim -- that the request is issued on import,
 * and that an app which later replaces the list is not handed the replaced origins back.
 */
describe('import-time prefetch for the bundled cloud', () => {
  const originalFetch = global.fetch;

  /** A fetch that never settles, so anything awaiting it visibly hangs. */
  const hangingFetch = (): jest.Mock =>
    jest.fn(
      () =>
        new Promise<Response>(() => {
          /* never resolves */
        }),
    );

  const jsonFetch = (origins: string[]): jest.Mock =>
    jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ validOrigins: origins }),
      } as Response),
    );

  afterEach(() => {
    global.fetch = originalFetch;
    GlobalVars.additionalValidOrigins = [];
  });

  describe('a cloud with a reachable CDN', () => {
    it('issues the fetch when the module is imported, before app.initialize is called', () => {
      jest.resetModules();
      global.fetch = hangingFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../src/internal/validOrigins');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const requested = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(String(requested)).toBe('https://res.cdn.office.net/teams-js/validDomains/json/validDomains.json');
    });

    it('fetches only the endpoint this bundle was built with, never another cloud', () => {
      jest.resetModules();
      global.fetch = hangingFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../src/internal/validOrigins');

      const requestedUrls = (global.fetch as jest.Mock).mock.calls.map((c) => String(c[0]));
      expect(requestedUrls).toHaveLength(1);
      expect(requestedUrls[0]).not.toMatch(/validDomains\.(gcch|dod|gallatin|ag08|ag09)\.json/);
    });

    it('a later prefetch from app.initialize joins it rather than starting a second fetch', async () => {
      jest.resetModules();
      global.fetch = hangingFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      void validOrigins.prefetchOriginsFromCDN();
      await Promise.resolve();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('warms the cache so an origin only the CDN knows about resolves without a further fetch', async () => {
      jest.resetModules();
      global.fetch = jsonFetch(['added-after-ship.example.com']);

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');
      await validOrigins.prefetchOriginsFromCDN();

      global.fetch = hangingFetch();
      await expect(validOrigins.validateOrigin(new URL('https://added-after-ship.example.com'))).resolves.toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('an air-gapped cloud (null endpoint)', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.doMock('../../src/internal/constants', () => ({
        ...jest.requireActual('../../src/internal/constants'),
        validOriginsCdnEndpoint: null,
        validOriginsFallback: ['teams.eaglex.ic.gov'],
      }));
    });

    afterEach(() => {
      jest.dontMock('../../src/internal/constants');
    });

    it('emits no request on import', () => {
      global.fetch = hangingFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../src/internal/validOrigins');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('still trusts its bundled origins', async () => {
      global.fetch = hangingFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');

      await expect(validOrigins.validateOrigin(new URL('https://teams.eaglex.ic.gov'))).resolves.toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  /**
   * The reason the import-time prefetch cannot simply be reinstated as-is.
   *
   * `setValidOriginsOverride` clears the cache and drops the stored promise, but cannot unsend a
   * request. The fetch handler resolves the local list lazily, so without invalidation a response
   * landing after an override would be written as `[the app's list] + [the built-in origins]` --
   * silently restoring exactly what the app asked to stop trusting. Since the fetch takes tens of
   * milliseconds and `app.initialize` usually lands inside that window, this is the common
   * interleaving rather than a rare one.
   */
  describe('an override applied while the import-time fetch is still in flight', () => {
    /**
     * A fetch whose response has already arrived but whose body is still being parsed.
     *
     * This is the interleaving that matters: once the response resolves, the `.then` chain is
     * committed and aborting cannot unwind it, so the epoch check is the only thing standing between
     * the superseded body and the cache. A fetch that merely rejects on abort would not exercise
     * that path.
     */
    const fetchWithPendingBody = (): { fetch: jest.Mock; resolveBody: (origins: string[]) => void } => {
      let release: (origins: string[]) => void = () => undefined;
      const body = new Promise<{ validOrigins: string[] }>((r) => {
        release = (origins) => r({ validOrigins: origins });
      });
      return {
        fetch: jest.fn(() =>
          Promise.resolve({
            ok: true,
            status: 200,
            json: () => body,
          } as unknown as Response),
        ),
        resolveBody: (origins) => release(origins),
      };
    };

    /** Rejects on abort, for asserting the request is actually torn down. */
    const abortableFetch = (): jest.Mock =>
      jest.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
            );
          }),
      );

    it('does not let the superseded response reinstate the replaced origins', async () => {
      jest.resetModules();
      const { fetch: pending, resolveBody } = fetchWithPendingBody();
      global.fetch = pending;

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Let the response resolve so the handler is committed and past the point abort could help.
      await Promise.resolve();

      // The app initializes and replaces the list while the body is still being parsed.
      validOrigins.setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });

      // Only now does the built-in endpoint's body arrive.
      resolveBody(['origin-the-app-replaced.example.com']);
      await new Promise((r) => setTimeout(r, 0));

      await expect(validOrigins.validateOrigin(new URL('https://gov.teams.microsoft.us'))).resolves.toBe(true);
      await expect(validOrigins.validateOrigin(new URL('https://origin-the-app-replaced.example.com'))).resolves.toBe(
        false,
      );
    });

    it('aborts the in-flight request rather than leaving it open', () => {
      jest.resetModules();
      const abortable = abortableFetch();
      global.fetch = abortable;

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');
      const signal: AbortSignal = abortable.mock.calls[0][1].signal;
      expect(signal.aborted).toBe(false);

      validOrigins.setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });

      expect(signal.aborted).toBe(true);
    });

    it('treats that abort as invalidation, not as a failed fetch', async () => {
      jest.resetModules();
      global.fetch = abortableFetch();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const validOrigins = require('../../src/internal/validOrigins');
      validOrigins.setValidOriginsOverride({ list: ['gov.teams.microsoft.us'] });
      await new Promise((r) => setTimeout(r, 0));

      // A failed fetch falls back to the local list, which under an override is the app's own list.
      // The built-in origins must not reappear by that route either.
      await expect(validOrigins.validateOrigin(new URL('https://gov.teams.microsoft.us'))).resolves.toBe(true);
      await expect(validOrigins.validateOrigin(new URL('https://teams.microsoft.com'))).resolves.toBe(false);
    });
  });
});
