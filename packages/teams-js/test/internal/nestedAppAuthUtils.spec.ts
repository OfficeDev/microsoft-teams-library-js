import { GlobalVars } from '../../src/internal/globalVars';
import {
  NestedAppAuthMessageEventNames,
  NestedAuthExtendedWindow,
  tryPolyfillWithNestedAppAuthBridge,
} from '../../src/internal/nestedAppAuthUtils';

/**
 * These tests cover the early-return guards in tryPolyfillWithNestedAppAuthBridge directly.
 * The happy path is exercised indirectly through communication.spec.ts, but the guards -
 * in particular the nested iframe check, which prevents bridge injection into a non-top-most
 * app - are only reachable by calling the function with a purpose-built window.
 */
describe('nestedAppAuthUtils', () => {
  describe('tryPolyfillWithNestedAppAuthBridge', () => {
    const supportedSDKVersion = JSON.stringify({ supports: { nestedAppAuth: {} } });

    let handlers: {
      onMessage: jest.Mock;
      sendPostMessage: jest.Mock;
    };

    /**
     * Builds a minimal window-like object. By default it is top-most (parent === top === itself),
     * which is what the polyfill requires.
     */
    function createMockWindow(): NestedAuthExtendedWindow {
      const mockWindow = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      } as unknown as NestedAuthExtendedWindow;

      (mockWindow as unknown as { parent: unknown }).parent = mockWindow;
      (mockWindow as unknown as { top: unknown }).top = mockWindow;

      return mockWindow;
    }

    beforeEach(() => {
      GlobalVars.isFramelessWindow = false;
      handlers = {
        onMessage: jest.fn(),
        sendPostMessage: jest.fn(),
      };
    });

    afterEach(() => {
      GlobalVars.isFramelessWindow = false;
      jest.clearAllMocks();
    });

    it('should polyfill the bridge on a top-most window in a host that supports nested app auth', () => {
      const mockWindow = createMockWindow();

      tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeDefined();
      expect(typeof mockWindow.nestedAppAuthBridge.addEventListener).toBe('function');
      expect(typeof mockWindow.nestedAppAuthBridge.postMessage).toBe('function');
      expect(typeof mockWindow.nestedAppAuthBridge.removeEventListener).toBe('function');
    });

    it('should not polyfill the bridge when the current window is frameless', () => {
      GlobalVars.isFramelessWindow = true;
      const mockWindow = createMockWindow();

      tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeUndefined();
    });

    it('should not throw when the window does not exist', () => {
      expect(() => tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, null, handlers)).not.toThrow();
    });

    it('should not polyfill the bridge when running in a nested iframe', () => {
      const mockWindow = createMockWindow();
      // A nested iframe has a parent that is not the top-most window.
      (mockWindow as unknown as { parent: unknown }).parent = { name: 'middleFrame' };

      tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeUndefined();
    });

    it('should polyfill the bridge when the window is an iframe directly under the top window', () => {
      const mockWindow = createMockWindow();
      const topWindow = { name: 'topWindow' };
      // A single-level iframe still reports parent === top, so injection is allowed.
      (mockWindow as unknown as { parent: unknown }).parent = topWindow;
      (mockWindow as unknown as { top: unknown }).top = topWindow;

      tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeDefined();
    });

    it('should not polyfill the bridge when the supported SDK version is not valid JSON', () => {
      const mockWindow = createMockWindow();

      tryPolyfillWithNestedAppAuthBridge('not valid json', mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeUndefined();
    });

    it('should not polyfill the bridge when the host does not report a supports object', () => {
      const mockWindow = createMockWindow();

      tryPolyfillWithNestedAppAuthBridge(JSON.stringify({}), mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeUndefined();
    });

    it('should not polyfill the bridge when the host does not support nested app auth', () => {
      const mockWindow = createMockWindow();

      tryPolyfillWithNestedAppAuthBridge(JSON.stringify({ supports: { appEntity: {} } }), mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBeUndefined();
    });

    it('should leave an existing bridge untouched instead of polyfilling over it', () => {
      const mockWindow = createMockWindow();
      const existingBridge = {
        addEventListener: jest.fn(),
        postMessage: jest.fn(),
        removeEventListener: jest.fn(),
      };
      mockWindow.nestedAppAuthBridge = existingBridge;

      tryPolyfillWithNestedAppAuthBridge(supportedSDKVersion, mockWindow, handlers);

      expect(mockWindow.nestedAppAuthBridge).toBe(existingBridge);

      // The pre-existing bridge is still the one wired up, so its handlers are used.
      mockWindow.nestedAppAuthBridge.postMessage(
        JSON.stringify({ messageType: NestedAppAuthMessageEventNames.Request }),
      );
      expect(existingBridge.postMessage).toHaveBeenCalled();
      expect(handlers.sendPostMessage).not.toHaveBeenCalled();
    });
  });
});
