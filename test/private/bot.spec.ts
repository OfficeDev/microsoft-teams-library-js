import { bot } from '../../src/private/bot';
import { Utils } from '../utils';
import { _uninitialize } from '../../src/public/publicAPIs';

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
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('sendBotRequest', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        bot.sendQuery({ query: '' }, () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });
    it('should successfully send a request', () => {
      utils.initializeWithContext('content');
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
    it('should invoke error callback', () => {
      utils.initializeWithContext('content');
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

  describe('getSupportedCommands', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        bot.getSupportedCommands(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('content');

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

    it('should invoke error callback', () => {
      utils.initializeWithContext('content');

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
  describe('authenticate', () => {
    it('should not allow calls before initialization', () => {
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
  });

  it('should successfully send a request', () => {
    utils.initializeWithContext('content');
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

  it('should invoke error callback on unauthorized', () => {
    utils.initializeWithContext('content');
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
