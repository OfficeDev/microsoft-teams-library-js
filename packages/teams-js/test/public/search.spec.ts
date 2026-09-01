import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import * as search from '../../src/public/search';
import { Utils } from '../utils';

const dataError = 'Something went wrong...';

const emptyHandler = (): void => {};

const closedQuery: search.SearchQuery = { searchTerm: 'closed term', timestamp: 100 };
const executedQuery: search.SearchQuery = { searchTerm: 'executed term', timestamp: 200 };
const changedQuery: search.SearchQuery = { searchTerm: 'changed term', timestamp: 300 };

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

    describe('registerHandlers', () => {
      it('FRAMED: should not allow calls before initialization', () => {
        expect(() => search.registerHandlers(emptyHandler, emptyHandler)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          return;
        }
        it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

          expect(() => search.registerHandlers(emptyHandler, emptyHandler)).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            ),
          );
        });
      });

      it('FRAMED: should throw if the runtime does not support search', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        expect.assertions(1);
        try {
          search.registerHandlers(emptyHandler, emptyHandler);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('FRAMED: should register and dispatch all three handlers', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        const onChange = jest.fn();
        search.registerHandlers(onClosed, onExecute, onChange);

        const registeredHandlerNames = utils.messages
          .filter((message) => message.func === 'registerHandler')
          .map((message) => message.args && message.args[0]);
        expect(registeredHandlerNames).toEqual(['search.queryClose', 'search.queryExecute', 'search.queryChange']);

        await utils.sendMessage('search.queryClose', closedQuery);
        await utils.sendMessage('search.queryExecute', executedQuery);
        await utils.sendMessage('search.queryChange', changedQuery);

        expect(onClosed).toHaveBeenCalledWith(closedQuery);
        expect(onExecute).toHaveBeenCalledWith(executedQuery);
        expect(onChange).toHaveBeenCalledWith(changedQuery);
      });

      it('FRAMED: should not register the change handler when it is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        search.registerHandlers(onClosed, onExecute);

        const registeredHandlerNames = utils.messages
          .filter((message) => message.func === 'registerHandler')
          .map((message) => message.args && message.args[0]);
        expect(registeredHandlerNames).toEqual(['search.queryClose', 'search.queryExecute']);

        await utils.sendMessage('search.queryChange', changedQuery);
        expect(onClosed).not.toHaveBeenCalled();
        expect(onExecute).not.toHaveBeenCalled();
      });
    });

    describe('unregisterHandlers', () => {
      it('FRAMED: should not allow calls before initialization', () => {
        expect(() => search.unregisterHandlers()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          return;
        }
        it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

          expect(() => search.unregisterHandlers()).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            ),
          );
        });
      });

      it('FRAMED: should throw if the runtime does not support search', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        expect.assertions(1);
        try {
          search.unregisterHandlers();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('FRAMED: should send the unregister message and remove every handler', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        const onChange = jest.fn();
        search.registerHandlers(onClosed, onExecute, onChange);

        search.unregisterHandlers();

        const unregisterMessage = utils.findMessageByFunc('search.unregister');
        expect(unregisterMessage).not.toBeNull();
        expect(unregisterMessage?.args?.length).toEqual(0);

        await utils.sendMessage('search.queryClose', closedQuery);
        await utils.sendMessage('search.queryExecute', executedQuery);
        await utils.sendMessage('search.queryChange', changedQuery);

        expect(onClosed).not.toHaveBeenCalled();
        expect(onExecute).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
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

    describe('registerHandlers', () => {
      it('FRAMELESS: should not allow calls before initialization', () => {
        expect(() => search.registerHandlers(emptyHandler, emptyHandler)).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          return;
        }
        it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

          expect(() => search.registerHandlers(emptyHandler, emptyHandler)).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            ),
          );
        });
      });

      it('FRAMELESS: should throw if the runtime does not support search', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        expect.assertions(1);
        try {
          search.registerHandlers(emptyHandler, emptyHandler);
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('FRAMELESS: should register and dispatch all three handlers', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        const onChange = jest.fn();
        search.registerHandlers(onClosed, onExecute, onChange);

        const registeredHandlerNames = utils.messages
          .filter((message) => message.func === 'registerHandler')
          .map((message) => message.args && message.args[0]);
        expect(registeredHandlerNames).toEqual(['search.queryClose', 'search.queryExecute', 'search.queryChange']);

        utils.respondToFramelessMessage({
          data: { func: 'search.queryClose', args: [closedQuery] },
        } as DOMMessageEvent);
        utils.respondToFramelessMessage({
          data: { func: 'search.queryExecute', args: [executedQuery] },
        } as DOMMessageEvent);
        utils.respondToFramelessMessage({
          data: { func: 'search.queryChange', args: [changedQuery] },
        } as DOMMessageEvent);

        expect(onClosed).toHaveBeenCalledWith(closedQuery);
        expect(onExecute).toHaveBeenCalledWith(executedQuery);
        expect(onChange).toHaveBeenCalledWith(changedQuery);
      });

      it('FRAMELESS: should not register the change handler when it is not provided', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        search.registerHandlers(onClosed, onExecute);

        const registeredHandlerNames = utils.messages
          .filter((message) => message.func === 'registerHandler')
          .map((message) => message.args && message.args[0]);
        expect(registeredHandlerNames).toEqual(['search.queryClose', 'search.queryExecute']);

        utils.respondToFramelessMessage({
          data: { func: 'search.queryChange', args: [changedQuery] },
        } as DOMMessageEvent);
        expect(onClosed).not.toHaveBeenCalled();
        expect(onExecute).not.toHaveBeenCalled();
      });
    });

    describe('unregisterHandlers', () => {
      it('FRAMELESS: should not allow calls before initialization', () => {
        expect(() => search.unregisterHandlers()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      const allowedContexts = [FrameContexts.content];
      Object.values(FrameContexts).forEach((frameContext) => {
        if (allowedContexts.includes(frameContext)) {
          return;
        }
        it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

          expect(() => search.unregisterHandlers()).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            ),
          );
        });
      });

      it('FRAMELESS: should throw if the runtime does not support search', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        expect.assertions(1);
        try {
          search.unregisterHandlers();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('FRAMELESS: should send the unregister message and remove every handler', async () => {
        await utils.initializeWithContext(FrameContexts.content);
        utils.setRuntimeConfig({ apiVersion: 1, supports: { search: {} } });

        const onClosed = jest.fn();
        const onExecute = jest.fn();
        const onChange = jest.fn();
        search.registerHandlers(onClosed, onExecute, onChange);

        search.unregisterHandlers();

        const unregisterMessage = utils.findMessageByFunc('search.unregister');
        expect(unregisterMessage).not.toBeNull();
        expect(unregisterMessage?.args?.length).toEqual(0);

        utils.respondToFramelessMessage({
          data: { func: 'search.queryClose', args: [closedQuery] },
        } as DOMMessageEvent);
        utils.respondToFramelessMessage({
          data: { func: 'search.queryExecute', args: [executedQuery] },
        } as DOMMessageEvent);
        utils.respondToFramelessMessage({
          data: { func: 'search.queryChange', args: [changedQuery] },
        } as DOMMessageEvent);

        expect(onClosed).not.toHaveBeenCalled();
        expect(onExecute).not.toHaveBeenCalled();
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
