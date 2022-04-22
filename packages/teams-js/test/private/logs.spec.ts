import { log } from '../../src/private/logs';
import { Utils } from '../utils';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public';
import { minRuntimeConfigToUninitialize, errorNotSupportedOnPlatform } from '../../src/public/constants';

describe('log', () => {
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
      utils.setRuntimeConfig(minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('Testing log.registerGetLogHandler function', () => {
    it('log.registerGetLogHandler should not allow calls before initialization', () => {
      expect(() =>
        log.registerGetLogHandler(() => {
          return '';
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it('log.registerGetLogHandler should throw error when log is not supported.', async () => {
        await utils.initializeWithContext(context);
        expect.assertions(1);
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

        try {
          log.registerGetLogHandler(() => '');
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });
      it(`log.registerGetLogHandler should successfully register a get log handler when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        let handlerInvoked = false;
        log.registerGetLogHandler(() => {
          handlerInvoked = true;
          return '';
        });

        utils.sendMessage('log.request');

        expect(handlerInvoked).toBe(true);
      });

      it(`log.registerGetLogHandler should call the get log handler and send the log when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        let handlerInvoked = false;
        const log: string = '1/1/2019 Info - App initialized';
        log.registerGetLogHandler(() => {
          handlerInvoked = true;
          return log;
        });

        utils.sendMessage('log.request');

        const sendLogMessage = utils.findMessageByFunc('log.receive');
        expect(sendLogMessage).not.toBeNull();
        expect(sendLogMessage.args).toEqual([log]);
        expect(handlerInvoked).toBe(true);
      });

      it(`log.registerGetLogHandler should not send log when no get log handler is registered when initialized with ${context} content`, async () => {
        await utils.initializeWithContext(context);

        utils.sendMessage('log.request');

        const sendLogMessage = utils.findMessageByFunc('log.receive');
        expect(sendLogMessage).toBeNull();
      });
    });
  });
});
