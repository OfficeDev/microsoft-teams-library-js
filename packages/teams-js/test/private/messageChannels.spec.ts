import * as communication from '../../src/internal/communication';
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { messageChannels } from '../../src/private/messageChannels';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
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
    // Clear the cached telemetry/datalayer ports
    // Adding to _uninitialize breaks the global state initialization so leaving it here
    messageChannels.telemetry._clearTelemetryPort();
    messageChannels.dataLayer._clearDataLayerPort();
  });

  describe('Testing messageChannels APIs before initialization', () => {
    it('isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => messageChannels.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('isSupported for telemetry should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => messageChannels.telemetry.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('isSupported for data layer should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => messageChannels.dataLayer.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('getTelemetryPort should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(messageChannels.telemetry.getTelemetryPort()).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('getDataLayerPort should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(messageChannels.dataLayer.getDataLayerPort()).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
  });

  Object.values(FrameContexts).forEach((context) => {
    describe('Testing messageChannels isSupported', () => {
      it('should return true if the messageChannels capability is supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: {} } });
        expect(messageChannels.isSupported()).toBe(true);
      });

      it('should return false if the messageChannels capability is not supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(messageChannels.isSupported()).toBe(false);
      });
    });

    describe('Testing messageChannels.telemetry isSupported', () => {
      it('should return true if the messageChannels.telemetry capability is supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { telemetry: {} } } });
        expect(messageChannels.telemetry.isSupported()).toBe(true);
      });

      it('should return false if the messageChannels capability is supported but not telemetry', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: {} } });
        expect(messageChannels.telemetry.isSupported()).toBe(false);
      });

      it('should return false if the messageChannels capability is not supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(messageChannels.telemetry.isSupported()).toBe(false);
      });

      it('should return false if the messageChannels.dataLayer is supported but not telemetry', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { dataLayer: {} } } });
        expect(messageChannels.telemetry.isSupported()).toBe(false);
      });
    });

    describe('Testing messageChannels.dataLayer isSupported', () => {
      it('should return true if the messageChannels.dataLayer capability is supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { dataLayer: {} } } });
        expect(messageChannels.dataLayer.isSupported()).toBe(true);
      });

      it('should return false if the messageChannels capability is supported but not dataLayer', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: {} } });
        expect(messageChannels.dataLayer.isSupported()).toBe(false);
      });

      it('should return false if the messageChannels capability is not supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(messageChannels.dataLayer.isSupported()).toBe(false);
      });

      it('should return false if the messageChannels.telemetry is supported but not dataLayer', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { telemetry: {} } } });
        expect(messageChannels.dataLayer.isSupported()).toBe(false);
      });
    });

    describe('Testing messageChannels.getTelemetryPort', () => {
      beforeEach(async () => {
        await utils.initializeWithContext(context);
      });

      it('throws if the capability is not supported', async () => {
        expect.assertions(1);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        try {
          await messageChannels.telemetry.getTelemetryPort();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should return port from message and then from local variable', async () => {
        expect.assertions(2);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { telemetry: {} } } });

        const messagePromise = messageChannels.telemetry.getTelemetryPort();

        const port = new MessagePort();
        await utils.respondToMessageWithPorts(
          { id: 1, func: 'messageChannels.telemetry.getTelemetryPort' },
          [],
          [port],
        );

        const receivedPort = await messagePromise;

        expect(receivedPort).toBe(port);

        const port2 = await messageChannels.telemetry.getTelemetryPort();

        expect(port2).toBe(port);
      });

      it('should throw if the message function rejects', async () => {
        expect.assertions(1);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { telemetry: {} } } });

        // Create a spy on requestPortFromParent that rejects with an error
        const spy = jest.spyOn(communication, 'requestPortFromParentWithVersion');
        spy.mockImplementation(() => Promise.reject(new Error('some error')));

        await expect(messageChannels.telemetry.getTelemetryPort()).rejects.toThrow('some error');

        // Restore the original function after the test
        spy.mockRestore();
      });
    });

    describe('Testing messageChannels.dataLayer.getDataLayerPort', () => {
      beforeEach(async () => {
        await utils.initializeWithContext(context);
      });

      it('throws if the capability is not supported', async () => {
        expect.assertions(1);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        try {
          await messageChannels.dataLayer.getDataLayerPort();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should return port from message and then from local variable', async () => {
        expect.assertions(2);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { dataLayer: {} } } });

        const messagePromise = messageChannels.dataLayer.getDataLayerPort();

        const port = new MessagePort();
        await utils.respondToMessageWithPorts(
          { id: 1, func: 'messageChannels.dataLayer.getDataLayerPort' },
          [],
          [port],
        );

        const receivedPort = await messagePromise;

        expect(receivedPort).toBe(port);

        const port2 = await messageChannels.dataLayer.getDataLayerPort();

        expect(port2).toBe(port);
      });

      it('should throw if the message function rejects', async () => {
        expect.assertions(1);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { messageChannels: { dataLayer: {} } } });

        // Create a spy on requestPortFromParent that rejects with an error
        const spy = jest.spyOn(communication, 'requestPortFromParentWithVersion');
        spy.mockImplementation(() => Promise.reject(new Error('some error')));

        await expect(messageChannels.dataLayer.getDataLayerPort()).rejects.toThrow('some error');

        // Restore the original function after the test
        spy.mockRestore();
      });
    });
  });
});
