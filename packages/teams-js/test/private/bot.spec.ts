import { bot } from '../../src/private/bot';
import { Utils } from '../utils';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';

describe('bot', () => {
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
      app._uninitialize();
    }
  });

  describe('Testing bot.sendBotRequest function', () => {
    it('bot.sendBotRequest should not allow calls before initialization', () => {
      expect(() =>
        bot.sendQuery({ query: '' }, () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`bot.sendBotRequest should successfully send request with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        const request = {
          query: 'some query',
        };

        let botResponse: bot.QueryResponse;
        let error: string;

        const handleBotResponse = (response: bot.QueryResponse) => (botResponse = response);
        const handleError = (_error: string): any => (error = _error);

        // send message request
        bot.sendQuery(request, handleBotResponse, handleError);

        // find message request in jest
        const message = utils.findMessageByFunc('bot.executeQuery');

        // check message is sending correct data
        expect(message).not.toBeUndefined();
        expect(message.args).toContain(request);

        // simulate response
        const data = {
          success: true,
          response: { data: ['some', 'queried', 'items'] },
        };

        utils.respondToMessage(message, data.success, data.response);

        // check data is returned properly
        expect(botResponse).toEqual({ data: ['some', 'queried', 'items'] });
        expect(error).toBeUndefined();
      });

      it(`bot.sendBotRequest should invoke error callback with ${context} context`, async () => {
        await utils.initializeWithContext('content');
        const request = {
          query: 'some broken query',
        };

        let botResponse: bot.QueryResponse;
        let error: string;

        const handleBotResponse = (response: bot.QueryResponse) => (botResponse = response);
        const handleError = (_error: string): any => (error = _error);

        bot.sendQuery(request, handleBotResponse, handleError);
        const message = utils.findMessageByFunc('bot.executeQuery');
        expect(message).not.toBeUndefined();
        expect(message.args).toContain(request);

        // simulate response
        const data = {
          success: false,
          response: 'Something went wrong...',
        };

        utils.respondToMessage(message, data.success, data.response);

        // check data is returned properly
        expect(error).toBe('Something went wrong...');
        expect(botResponse).toBeUndefined();
      });
    });
  });

  describe('Testing bot.getSupportedCommands function', () => {
    it('bot.getSupportedCommands should not allow calls before initialization', () => {
      expect(() =>
        bot.getSupportedCommands(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`bot.getSupportedCommands should successfully send a request with ${context} context`, async () => {
        await utils.initializeWithContext(context);

        let botResponse: bot.Command[];
        let error: string;

        const handleBotResponse = (response: bot.Command[]) => {
          botResponse = response;
        };
        const handleError = (_error: string) => {
          error = _error;
        };

        bot.getSupportedCommands(handleBotResponse, handleError);

        const message = utils.findMessageByFunc('bot.getSupportedCommands');
        expect(message).not.toBeUndefined();

        // Simulate response
        const data = {
          sucess: true,
          response: [{ title: 'CMD1', id: 'CMD1' }],
        };

        utils.respondToMessage(message, data.sucess, data.response);

        // check data is returned properly
        expect(botResponse).toEqual([{ title: 'CMD1', id: 'CMD1' }]);
        expect(error).toBeUndefined();
      });

      it(`bot.getSupportedCommands should invoke error callback with ${context} context`, async () => {
        await utils.initializeWithContext('content');

        let botResponse: bot.Command[];
        let error: string;

        const handleBotResponse = (response: bot.Command[]) => {
          botResponse = response;
        };
        const handleError = (_error: string) => {
          error = _error;
        };

        bot.getSupportedCommands(handleBotResponse, handleError);

        const message = utils.findMessageByFunc('bot.getSupportedCommands');
        expect(message).not.toBeUndefined();

        // Simulate response
        const data = {
          success: false,
          response: 'Something went wrong...',
        };

        utils.respondToMessage(message, data.success, data.response);

        // check data is returned properly
        expect(error).toBe('Something went wrong...');
        expect(botResponse).toBeUndefined();
      });
    });
  });

  describe('Testing bot.authenticate function', () => {
    it('bot.authenticate should not allow calls before initialization', () => {
      const request = {
        query: '',
        commandId: 'someCOmmand',
        url: 'someUrl',
      };
      expect(() =>
        bot.authenticate(request, () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      it(`bot.authenticate should successfully send a request with ${context} context`, async () => {
        await utils.initializeWithContext(context);
        const request = {
          query: '',
          commandId: 'someCommand',
          url: 'someUrl',
        };

        let botResponse: bot.Results;
        let error: string;

        const handleAuth = (response: bot.Results) => (botResponse = response);
        const handleError = (_error: string): any => (error = _error);

        // send message request
        bot.authenticate(request, handleAuth, handleError);

        // find message request in jest
        const message = utils.findMessageByFunc('bot.authenticate');

        // check message is sending correct data
        expect(message).not.toBeUndefined();
        expect(message.args).toContain(request);

        // simulate response
        const data = {
          success: true,
          response: { data: ['some', 'queried', 'items'] },
        };

        utils.respondToMessage(message, data.success, data.response);

        // authenticate should also return data because first query
        expect(botResponse).toEqual({ data: ['some', 'queried', 'items'] });
        expect(error).toBeUndefined();
      });

      it(`bot.authenticate should invoke error callback on unauthorized with ${context} context`, async () => {
        await utils.initializeWithContext('content');
        const request = {
          query: '',
          commandId: 'someCommand',
          url: 'someUrl',
        };

        let botResponse: bot.Results;
        let error: string;

        const handleBotResponse = (response: bot.Results) => (botResponse = response);
        const handleError = (_error: string): any => (error = _error);

        bot.authenticate(request, handleBotResponse, handleError);
        const message = utils.findMessageByFunc('bot.authenticate');
        expect(message).not.toBeUndefined();
        expect(message.args).toContain(request);

        // simulate response
        const data = {
          success: false,
          response: 'Bot authorization was unsuccessful',
        };

        utils.respondToMessage(message, data.success, data.response);

        // check data is returned properly
        expect(error).toBe('Bot authorization was unsuccessful');
        expect(botResponse).toBeUndefined();
      });
    });
  });

  describe('Testing bot.isSupported function', () => {
    it('bot.isSupported should return false if the runtime says bot is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(bot.isSupported()).not.toBeTruthy();
    });

    it('bot.isSupported should return true if the runtime says bot is supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { bot: {} } });
      expect(bot.isSupported()).toBeTruthy();
    });
  });
});
