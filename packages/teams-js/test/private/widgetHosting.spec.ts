import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import {
  IModalOptions,
  IModalResponse,
  IToolInput,
  IToolOutput,
  JSONValue,
} from '../../src/private/widgetHosting/widgetContext';
import * as widgetHosting from '../../src/private/widgetHosting/widgetHosting';
import { ErrorCode, SdkError } from '../../src/public';
import * as app from '../../src/public/app/app';
import { FrameContexts } from '../../src/public/constants';
//import { ErrorCode, SdkError } from '../../src/public/interfaces';
import { Utils } from '../utils';

describe('Testing widgetHosting module', () => {
  let utils: Utils = new Utils();
  beforeEach(() => {
    utils = new Utils();
    utils.messages = [];
    GlobalVars.isFramelessWindow = false;
  });
  afterEach(() => {
    app._uninitialize();
    GlobalVars.isFramelessWindow = false;
  });

  const widgetHostingRuntimeConfig = {
    apiVersion: 2,
    supports: {
      widgetHosting: {},
    },
  };

  const mockWidgetId = 'test-widget-id';

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      expect(() => widgetHosting.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return false if widgetHosting is not supported in runtimeConfig', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect(widgetHosting.isSupported()).toBe(false);
    });

    it('should return true if widgetHosting is supported in runtimeConfig', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);
      expect(widgetHosting.isSupported()).toBe(true);
    });
  });

  describe('callTool', () => {
    const mockToolInput: IToolInput = {
      name: 'testTool',
      arguments: { key: 'value' },
    };

    const mockToolOutput: IToolOutput = {
      isError: false,
      content: [
        {
          type: 'text',
          text: 'test result',
          annotations: {
            audience: ['user'],
            priority: 1,
          },
        },
      ],
      structuredContent: { widget: { foo: 'bar' } },
      _meta: { traceId: 'abc-123' },
    };

    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(widgetHosting.callTool(mockWidgetId, mockToolInput)).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully call tool with valid input', async () => {
      expect.assertions(4);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const promise = widgetHosting.callTool(mockWidgetId, mockToolInput);
      const message = utils.findMessageByFunc('widgetHosting.callTool');

      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        name: mockToolInput.name,
        arguments: mockToolInput.arguments,
      });

      if (message) {
        utils.respondToMessage(message, mockToolOutput);
      }

      await expect(promise).resolves.toEqual(mockToolOutput);
    });

    it('should handle WidgetError response', async () => {
      expect.assertions(2);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const widgetError: SdkError = {
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Tool execution failed',
      };

      const promise = widgetHosting.callTool(mockWidgetId, mockToolInput);
      const message = utils.findMessageByFunc('widgetHosting.callTool');

      expect(message).not.toBeNull();

      if (message) {
        utils.respondToMessage(message, widgetError);
      }

      await expect(promise).rejects.toThrowError(
        new Error(`${widgetError.errorCode}, message: ${widgetError.message}`),
      );
    });

    it('should handle SdkError response', async () => {
      expect.assertions(2);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const sdkError: SdkError = {
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'SDK error occurred',
      };

      const promise = widgetHosting.callTool(mockWidgetId, mockToolInput);
      const message = utils.findMessageByFunc('widgetHosting.callTool');

      expect(message).not.toBeNull();

      if (message) {
        utils.respondToMessage(message, sdkError);
      }
      await expect(promise).rejects.toThrowError(new Error(`${sdkError.errorCode}, message: ${sdkError.message}`));
    });
  });

  describe('sendFollowUpMessage', () => {
    const mockPrompt = 'Follow up question';

    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(widgetHosting.sendFollowUpMessage(mockWidgetId, { prompt: mockPrompt })).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully send follow-up message', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.sendFollowUpMessage(mockWidgetId, { prompt: mockPrompt });

      const message = utils.findMessageByFunc('widgetHosting.sendFollowUpMessage');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        prompt: mockPrompt,
      });
    });
  });

  describe('requestDisplayMode', () => {
    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(widgetHosting.requestDisplayMode(mockWidgetId, { mode: 'pip' })).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should successfully request display mode - inline', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.requestDisplayMode(mockWidgetId, { mode: 'inline' });

      const message = utils.findMessageByFunc('widgetHosting.requestDisplayMode');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        mode: 'inline',
      });
    });

    it('should successfully request display mode - Collapsed', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.requestDisplayMode(mockWidgetId, { mode: 'fullscreen' });

      const message = utils.findMessageByFunc('widgetHosting.requestDisplayMode');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        mode: 'fullscreen',
      });
    });
  });

  describe('requestModal', () => {
    const mockModalOptions: IModalOptions = {
      id: 'modal-123',
      title: 'Test Modal',
      content: '<div>Modal content</div>',
      width: 500,
      height: 400,
    };

    const mockModalResponse: IModalResponse = {
      modalElement: (() => {
        const el = document.createElement('div');
        el.id = 'modal-root';
        // eslint-disable-next-line @microsoft/sdl/no-inner-html
        el.innerHTML = '<div>Modal content</div>';
        return el;
      })(),
    };

    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(widgetHosting.requestModal(mockWidgetId, mockModalOptions)).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully request modal', async () => {
      expect.assertions(4);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const promise = widgetHosting.requestModal(mockWidgetId, mockModalOptions);
      const message = utils.findMessageByFunc('widgetHosting.requestModal');

      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        title: mockModalOptions.title,
        content: mockModalOptions.content,
        width: mockModalOptions.width,
        height: mockModalOptions.height,
      });

      if (message) {
        utils.respondToMessage(message, mockModalResponse);
      }

      await expect(promise).resolves.toEqual(mockModalResponse);
    });

    it('should handle error response from host', async () => {
      expect.assertions(2);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const widgetError: SdkError = {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Invalid modal options',
      };

      const promise = widgetHosting.requestModal(mockWidgetId, mockModalOptions);
      const message = utils.findMessageByFunc('widgetHosting.requestModal');

      expect(message).not.toBeNull();

      if (message) {
        utils.respondToMessage(message, widgetError);
      }

      await expect(promise).rejects.toThrowError(
        new Error(`${widgetError.errorCode}, message: ${widgetError.message}`),
      );
    });
  });

  describe('notifyIntrinsicHeight', () => {
    const mockHeight = 350;

    it('should throw if called before initialization', () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      expect(() => widgetHosting.notifyIntrinsicHeight(mockWidgetId, mockHeight)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully notify intrinsic height', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.notifyIntrinsicHeight(mockWidgetId, mockHeight);

      const message = utils.findMessageByFunc('widgetHosting.notifyIntrinsicHeight');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        height: mockHeight,
      });
    });
  });

  describe('contentSizeChanged', () => {
    const mockWidth = 800;
    const mockHeight = 600;

    it('should throw if called before initialization', () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      expect(() => widgetHosting.contentSizeChanged(mockWidgetId, mockWidth, mockHeight)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully notify content size change', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.contentSizeChanged(mockWidgetId, mockWidth, mockHeight);

      const message = utils.findMessageByFunc('widgetHosting.contentSizeChanged');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        width: mockWidth,
        height: mockHeight,
      });
    });
  });

  describe('setWidgetState', () => {
    const mockState: JSONValue = {
      counter: 42,
      isActive: true,
      items: ['a', 'b', 'c'],
    };

    it('should throw if called before initialization', async () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      await expect(widgetHosting.setWidgetState(mockWidgetId, mockState)).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully set widget state with object', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.setWidgetState(mockWidgetId, mockState);

      const message = utils.findMessageByFunc('widgetHosting.setWidgetState');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        state: mockState,
      });
    });

    it('should successfully set widget state with string', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const stringState = 'simple string state';
      widgetHosting.setWidgetState(mockWidgetId, stringState);

      const message = utils.findMessageByFunc('widgetHosting.setWidgetState');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        state: stringState,
      });
    });

    it('should successfully set widget state with number', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const numberState = 123;
      widgetHosting.setWidgetState(mockWidgetId, numberState);

      const message = utils.findMessageByFunc('widgetHosting.setWidgetState');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        state: numberState,
      });
    });

    it('should successfully set widget state with null', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.setWidgetState(mockWidgetId, null);

      const message = utils.findMessageByFunc('widgetHosting.setWidgetState');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        state: null,
      });
    });
  });

  describe('openExternal', () => {
    const mockHref = 'https://example.com';

    it('should throw if called before initialization', () => {
      expect.assertions(1);
      utils.uninitializeRuntimeConfig();
      expect(() => widgetHosting.openExternal(mockWidgetId, { href: mockHref })).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should successfully open external URL', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      widgetHosting.openExternal(mockWidgetId, { href: mockHref });

      const message = utils.findMessageByFunc('widgetHosting.openExternal');
      expect(message).not.toBeNull();
      expect(message?.args).toHaveLength(1);
      expect(message?.args?.[0]).toMatchObject({
        widgetId: mockWidgetId,
        href: mockHref,
      });
    });
  });

  describe('registerModalCloseHandler', () => {
    it('should throw if called before initialization', () => {
      expect.assertions(1);
      expect(() => widgetHosting.registerModalCloseHandler(() => {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should register handler if widgetHosting is supported', async () => {
      expect.assertions(4);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(widgetHostingRuntimeConfig);

      const mockModalId = 'modal-123';
      let receivedModalId: string | undefined;

      widgetHosting.registerModalCloseHandler((modalId: string) => {
        receivedModalId = modalId;
      });

      const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
      expect(registerHandlerMessage).not.toBeNull();
      expect(registerHandlerMessage?.args?.length).toBe(1);
      expect(registerHandlerMessage?.args?.[0]).toBe('widgetHosting.closeWidgetModal');

      await utils.sendMessage('widgetHosting.closeWidgetModal', mockModalId);
      expect(receivedModalId).toBe(mockModalId);
    });

    it('should throw if widgetHosting is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });

      expect(() => widgetHosting.registerModalCloseHandler(() => {})).toThrowError(
        'Widget Hosting is not supported on this platform',
      );
    });
  });
});
