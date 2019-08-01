import { logs } from '../../src/private/logs';
import { Utils } from '../utils';
import { _uninitialize } from '../../src/public/publicAPIs';

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
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('registerGetLogHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        logs.registerGetLogHandler(() => {
          return '';
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully register a get log handler', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      logs.registerGetLogHandler(() => {
        handlerInvoked = true;
        return '';
      });

      utils.sendMessage('log.request');

      expect(handlerInvoked).toBe(true);
    });

    it('getLog should call the get log handler and send the log', () => {
      utils.initializeWithContext('content');

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

    it('should not send log when no get log handler is registered', () => {
      utils.initializeWithContext('content');

      utils.sendMessage('log.request');

      const sendLogMessage = utils.findMessageByFunc('log.receive');
      expect(sendLogMessage).toBeNull();
    });
  });
});
