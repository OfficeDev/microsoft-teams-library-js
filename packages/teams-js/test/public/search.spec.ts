import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { search } from '../../src/public/search';
import { Utils } from '../utils';

const dataError = 'Something went wrong...';

describe('Search', () => {
  describe('Framed', () => {
    let utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
    });

    describe('closeSearch', () => {
      it('should not allow calls before initialization', async () => {
        await search.closeSearch().catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          await utils.initializeWithContext(frameContext);

          await search
            .closeSearch()
            .catch((e) =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ${JSON.stringify(
                    allowedContexts,
                  )}. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
      });

      it('FRAMED: should not allow calls if runtime does not support search', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);

        await expect(search.closeSearch()).rejects.toThrowError('Not supported');
      });

      it('FRAMED: should successfully throw if the closeSearch message sends and fails', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
        expect.assertions(1);

        const closeSearchPromise = search.closeSearch();

        const closeSearch = utils.findMessageByFunc('search.closeSearch');
        if (closeSearch) {
          const data = {
            success: false,
            error: dataError,
          };

          utils.respondToMessage(closeSearch, data.success, data.error);
          await closeSearchPromise.catch((e) => expect(e).toMatchObject(new Error(dataError)));
        }
      });

      it('FRAMED: should successfully send the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const promise = search.closeSearch();

        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');

        if (closeSearchMessage && closeSearchMessage.args) {
          const data = {
            success: true,
          };

          utils.respondToMessage(closeSearchMessage, data.success);
          await promise;

          expect(closeSearchMessage).not.toBeNull();
          expect(closeSearchMessage.args.length).toEqual(0);
        }
      });

      it('FRAMED: should resolve promise after successfully sending the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const promise = search.closeSearch();

        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');

        if (closeSearchMessage) {
          const data = {
            success: true,
          };

          utils.respondToMessage(closeSearchMessage, data.success);
          await expect(promise).resolves.not.toThrow();
        }
      });
    });
  });

  describe('Frameless', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('closeSearch', () => {
      it('should not allow calls before initialization', async () => {
        await search.closeSearch().catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }
          await utils.initializeWithContext(frameContext);

          await search
            .closeSearch()
            .catch((e) =>
              expect(e).toMatchObject(
                new Error(
                  `This call is only allowed in following contexts: ${JSON.stringify(
                    allowedContexts,
                  )}. Current context: "${frameContext}".`,
                ),
              ),
            );
        });
      });

      it('FRAMELESS: should not allow calls if runtime does not support search', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect.assertions(1);

        await expect(search.closeSearch()).rejects.toThrowError('Not supported');
      });

      it('FRAMELESS: should successfully throw if the closeSearch message sends and fails', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });
        expect.assertions(1);

        const closeSearchPromise = search.closeSearch();

        const closeSearch = utils.findMessageByFunc('search.closeSearch');

        const data = {
          success: false,
          error: dataError,
        };

        utils.respondToFramelessMessage({
          data: {
            id: closeSearch?.id,
            args: [data.success, data.error],
          },
        } as DOMMessageEvent);
        await closeSearchPromise.catch((e) => expect(e).toMatchObject(new Error(dataError)));
      });

      it('FRAMELESS: should successfully send the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const promise = search.closeSearch();

        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');
        if (closeSearchMessage && closeSearchMessage.args) {
          const data = {
            success: true,
          };

          utils.respondToFramelessMessage({
            data: {
              id: closeSearchMessage?.id,
              args: [data.success],
            },
          } as DOMMessageEvent);
          await promise;

          expect(closeSearchMessage).not.toBeNull();
          expect(closeSearchMessage.args.length).toEqual(0);
        }
      });

      it('FRAMELESS: should resolve promise after successfully sending the closeSearch message', async () => {
        await utils.initializeWithContext('content');
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const promise = search.closeSearch();

        const closeSearchMessage = utils.findMessageByFunc('search.closeSearch');

        const data = {
          success: true,
        };

        utils.respondToFramelessMessage({
          data: {
            id: closeSearchMessage?.id,
            args: [data.success],
          },
        } as DOMMessageEvent);
        await expect(promise).resolves.not.toThrow();
      });
    });
  });
});
