import * as communication from '../../src/internal/communication';
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { centralDataLayer } from '../../src/private/centralDataLayer';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('centralDataLayer', () => {
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
    // Adding to _unititialize breaks the global state initialization so leaving it here
    centralDataLayer._clearCentralDataLayerPort();
  });

  describe('Testing centralDataLayer APIs before initialization', () => {
    it('isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => centralDataLayer.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('getCentralDataLayerPort should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(centralDataLayer.getCentralDataLayerPort()).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
  });

  Object.values(FrameContexts).forEach((context) => {
    describe('Testing isSupported', () => {
      it('should return true if the capability is supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: { centralDataLayer: {} } });
        expect(centralDataLayer.isSupported()).toBe(true);
      });

      it('should return false if the capability is not supported', async () => {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(centralDataLayer.isSupported()).toBe(false);
      });
    });
    describe('Testing getCentralDataLayerPort', () => {
      beforeEach(async () => {
        await utils.initializeWithContext(context);
      });

      it('throws if the capability is not supported', async () => {
        expect.assertions(1);
        utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
        try {
          await centralDataLayer.getCentralDataLayerPort();
        } catch (e) {
          expect(e).toEqual(errorNotSupportedOnPlatform);
        }
      });

      it('should return port from message and then from local variable', async () => {
        expect.assertions(2);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { centralDataLayer: {} } });

        const messagePromise = centralDataLayer.getCentralDataLayerPort();

        const port = new MessagePort();
        await utils.respondToMessageWithPorts({ id: 1, func: 'centralDataLayerPort' }, [], [port]);

        const receivedPort = await messagePromise;

        expect(receivedPort).toBe(port);

        const port2 = await centralDataLayer.getCentralDataLayerPort();

        expect(port2).toBe(port);
      });

      it('should throw if the message function rejects', async () => {
        expect.assertions(1);

        // API should be supported
        utils.setRuntimeConfig({ apiVersion: 2, supports: { centralDataLayer: {} } });

        // Create a spy on requestPortFromParent that rejects with an error
        const spy = jest.spyOn(communication, 'requestPortFromParentWithVersion');
        spy.mockImplementation(() => Promise.reject(new Error('some error')));

        await expect(centralDataLayer.getCentralDataLayerPort()).rejects.toThrow('some error');

        // Restore the original function after the test
        spy.mockRestore();
      });
    });
  });
});
