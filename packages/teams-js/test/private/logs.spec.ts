import { logs } from '../../src/private/logs';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('logs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

      app._uninitialize();
    }
  });

  describe('Testing logs.registerGetLogHandler function', () => {
    it('logs.registerGetLogHandler should not allow calls before initialization', () => {
      expect(() =>
        logs.registerGetLogHandler(() => {
          return '';
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it('logs.registerGetLogHandler should throw error when logs is not supported.', async () => {
        await utils.initializeWithContext(context);
        expect.assertions(1);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        try {
          logs.registerGetLogHandler(() => '');
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it(`logs.registerGetLogHandler should successfully register a get log handler when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        let handlerInvoked = false;
        logs.registerGetLogHandler(() => {
          handlerInvoked = true;
          return '';
        });

        utils.sendMessage('log.request');

        expect(handlerInvoked).toBe(true);
      });

      it(`logs.registerGetLogHandler should call the get log handler and send the log when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        let handlerInvoked = false;
        const log: string = '1/1/2019 Info - App initialized';
        logs.registerGetLogHandler(() => {
          handlerInvoked = true;
          return log;
        });

        utils.sendMessage('log.request');

        const sendLogMessage = utils.findMessageByFunc('log.receive');
        expect(sendLogMessage).not.toBeNull();
        expect(sendLogMessage.args).toEqual([log]);
        expect(handlerInvoked).toBe(true);
      });

      it(`logs.registerGetLogHandler should not send log when no get log handler is registered when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        utils.sendMessage('log.request');

        const sendLogMessage = utils.findMessageByFunc('log.receive');
        expect(sendLogMessage).toBeNull();
      });
    });
  });
});
