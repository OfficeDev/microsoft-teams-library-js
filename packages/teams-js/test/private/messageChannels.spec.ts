import * as communication from '../../src/internal/communication';
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { messageChannels } from '../../src/private/messageChannels';
import { app } from '../../src/public/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('messageChannels', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Mock out MessagePort to support constructor and instanceof checks
    class MockMessagePort {}
    global.MessagePort = MockMessagePort as unknown as typeof MessagePort;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

      app._uninitialize();
    }
    // Clear the cached telemetry port
    messageChannels._clearTelemetryPort();
  });

  describe('Testing messageChannels.getTelemetryPort', () => {
    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(messageChannels.getTelemetryPort()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return port from message and then from local variable', async () => {
      expect.assertions(2);
      await utils.initializeWithContext('content');
      const messagePromise = messageChannels.getTelemetryPort();

      const port = new MessagePort();
      await utils.respondToMessageWithPorts({ id: 1, func: 'messageChannels.getTelemetryPort' }, [], [port]);

      const receivedPort = await messagePromise;

      expect(receivedPort).toBe(port);

      const port2 = await messageChannels.getTelemetryPort();

      expect(port2).toBe(port);
    });

    it('should throw if no port is returned with message', async () => {
      expect.assertions(1);
      await utils.initializeWithContext('content');
      const messagePromise = messageChannels.getTelemetryPort();

      await utils.respondToMessageWithPorts({ id: 1, func: 'messageChannels.getTelemetryPort' }, [], []);

      await expect(messagePromise).rejects.toThrowError(
        new Error('MessageChannels.getTelemetryPort: Host did not return a MessagePort.'),
      );
    });

    it('should throw if the message function rejects', async () => {
      expect.assertions(1);
      await utils.initializeWithContext('content');
      // Create a spy on requestPortFromParent that rejects with an error
      const spy = jest.spyOn(communication, 'requestPortFromParent');
      spy.mockImplementation(() => Promise.reject(new Error('some error')));

      await expect(messageChannels.getTelemetryPort()).rejects.toThrow(
        'MessageChannels.getTelemetryPort: Error thrown from message promise.',
      );

      // Restore the original function after the test
      spy.mockRestore();
    });
  });
});
