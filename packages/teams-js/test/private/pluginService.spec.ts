import { errorLibraryNotInitialized } from '../../src/internal/constants';
import * as pluginService from '../../src/private/pluginService';
import { PluginMessage } from '../../src/private/pluginService';
import * as app from '../../src/public/app/app';
import { FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

const pluginsRuntimeConfig = {
  apiVersion: 2,
  supports: {
    plugins: {},
  },
};

const validMessage: PluginMessage = {
  func: 'catalyst.promptSent',
  args: { promptId: 'p-001', status: 'accepted' },
};

describe('pluginService', () => {
  let utils: Utils;

  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  // ── isSupported ───────────────────────────────────────────────────────────

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => pluginService.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return false when plugins is absent from runtimeConfig', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      expect(pluginService.isSupported()).toBe(false);
    });

    it('should return true when plugins is present in runtimeConfig', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);
      expect(pluginService.isSupported()).toBe(true);
    });
  });

  // ── sendMessage ───────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(pluginService.sendMessage(validMessage)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw when func is empty', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const msg = { ...validMessage, func: '' };
      await expect(pluginService.sendMessage(msg)).rejects.toThrowError('func is required in PluginMessage.');
    });

    it('should send the correct message to the host', async () => {
      expect.assertions(4);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const promise = pluginService.sendMessage(validMessage);
      const message = utils.findMessageByFunc('plugins.sendMessage');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      // The serialized payload should carry func
      expect(message?.args?.[0]).toMatchObject({
        func: validMessage.func,
      });

      if (message) {
        utils.respondToMessage(message);
      }
      await expect(promise).resolves.toBeUndefined();
    });

    it('should include correlationId in the serialized payload when provided', async () => {
      expect.assertions(2);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const msgWithCorrelation: PluginMessage = { ...validMessage, correlationId: 'corr-123' };
      const promise = pluginService.sendMessage(msgWithCorrelation);
      const message = utils.findMessageByFunc('plugins.sendMessage');
      expect(message).not.toBeNull();
      expect(message?.args?.[0]).toMatchObject({ correlationId: 'corr-123' });

      if (message) {
        utils.respondToMessage(message);
      }
      await promise;
    });

    it('should reject when host returns an error', async () => {
      expect.assertions(2);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const sdkError = { errorCode: 500, message: 'Send failed' };
      const promise = pluginService.sendMessage(validMessage);
      const message = utils.findMessageByFunc('plugins.sendMessage');
      expect(message).not.toBeNull();
      if (message) {
        utils.respondToMessage(message, sdkError);
      }
      await expect(promise).rejects.toThrow();
    });
  });

  // ── receivePluginMessage ──────────────────────────────────────────────────

  describe('receivePluginMessage', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => pluginService.receivePluginMessage(jest.fn())).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw when plugins capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      expect(() => pluginService.receivePluginMessage(jest.fn())).toThrowError(
        'Receiving plugin messages is not supported in the current host.',
      );
    });

    it('should not throw during registration when plugins capability is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);
      expect(() => pluginService.receivePluginMessage(jest.fn())).not.toThrow();
    });

    it('should invoke handler with normalized envelope format (single-object style)', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const handler = jest.fn();
      pluginService.receivePluginMessage(handler);

      const inboundEnvelope: PluginMessage = {
        func: 'catalyst.triggerPrompt',
        args: { prompt: 'hello' },
      };

      await utils.sendMessage('plugins.receiveMessage', inboundEnvelope);

      expect(handler).toHaveBeenCalledWith(inboundEnvelope);
    });

    it('should invoke handler with normalized positional-args format', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(pluginsRuntimeConfig);

      const handler = jest.fn();
      pluginService.receivePluginMessage(handler);

      // Positional format: func, args, correlationId
      await utils.sendMessage(
        'plugins.receiveMessage',
        'catalyst.contextUpdate',
        { key: 'theme', value: 'dark' },
        'corr-999',
      );

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          func: 'catalyst.contextUpdate',
          args: { key: 'theme', value: 'dark' },
          correlationId: 'corr-999',
        }),
      );
    });

    it('should only be callable from content context', async () => {
      const nonContentContexts = Object.values(FrameContexts).filter((c) => c !== FrameContexts.content);

      for (const context of nonContentContexts) {
        await utils.initializeWithContext(context);
        utils.setRuntimeConfig(pluginsRuntimeConfig);
        expect(() => pluginService.receivePluginMessage(jest.fn())).toThrowError(/following contexts/);
        app._uninitialize();
        utils = new Utils();
      }
    });
  });
});
