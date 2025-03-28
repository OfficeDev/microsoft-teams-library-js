import { nestedAppAuthBridge } from '../../src/private';

interface NestedAppAuthBridge {
  addEventListener: (eventName: 'message', callback: (response: string) => void) => void;
  postMessage: (message: string) => void;
  removeEventListener: (eventName: 'message', callback: (response: string) => void) => void;
}

// Fake window shape for mocking
type MockWindow = {
  [key: string]: unknown;
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  postMessage: jest.Mock;
  top?: { postMessage: jest.Mock };
  nestedAppAuthBridge?: NestedAppAuthBridge;
};

describe('NestedAppAuthBridge', () => {
  let mockWindow: MockWindow;
  const mockOrigin = 'https://contoso.com';

  beforeEach(() => {
    mockWindow = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    };
  });

  it('should attach bridge to window if not already present', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    expect(mockWindow.nestedAppAuthBridge).toBeDefined();
  });

  it('should not reinitialize bridge if already present', () => {
    const bridge: NestedAppAuthBridge = {
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    mockWindow.nestedAppAuthBridge = bridge;

    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    expect(mockWindow.nestedAppAuthBridge).toBe(bridge);
  });

  it('should add and remove message listener correctly', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    const callback = jest.fn();
    bridge.addEventListener('message', callback);

    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: unknown) => void;

    const validMessage = {
      origin: mockOrigin,
      source: mockWindow.top,
      data: {
        args: [null, JSON.stringify({ messageType: 'NestedAppAuthResponse' })],
      },
    };

    handler(validMessage);

    expect(callback).toBeCalledWith(JSON.stringify({ messageType: 'NestedAppAuthResponse' }));

    bridge.removeEventListener('message', callback);
    expect(mockWindow.removeEventListener).toBeCalledWith('message', handler);
  });

  it('should post message to window.top if message is valid', () => {
    const message = JSON.stringify({ messageType: 'NestedAppAuthRequest' });
    const topWindow = { postMessage: jest.fn() };
    mockWindow.top = topWindow;

    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    bridge.postMessage(message);
    expect(topWindow.postMessage).toBeCalled();

    const postMsg = topWindow.postMessage.mock.calls[0][0];
    expect(postMsg.data).toEqual(message);
    expect(postMsg.func).toBe('nestedAppAuth.execute');
  });

  it('should not post message for invalid JSON', () => {
    mockWindow.top = { postMessage: jest.fn() };

    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    bridge.postMessage('invalid-json');
    expect(mockWindow.top.postMessage).not.toBeCalled();
  });

  it('should not post message if messageType is not Request', () => {
    const nonRequest = JSON.stringify({ messageType: 'OtherMessage' });
    mockWindow.top = { postMessage: jest.fn() };

    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    bridge.postMessage(nonRequest);
    expect(mockWindow.top.postMessage).not.toBeCalled();
  });

  it('should ignore malformed event message in processAuthBridgeMessage', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);

    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;
    const callback = jest.fn();

    bridge.addEventListener('message', callback);

    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: unknown) => void;

    handler({ data: 'bad-format' });
    expect(callback).not.toBeCalled();

    consoleSpy.mockRestore();
  });

  it('should throw if window is null', () => {
    expect(() => {
      nestedAppAuthBridge.initialize(null, mockOrigin);
    }).toThrow('Cannot polyfill nestedAppAuthBridge as the current window does not exist');
  });

  it('should throw if topOrigin is missing', () => {
    expect(() => {
      nestedAppAuthBridge.initialize(mockWindow as unknown as Window, '');
    }).toThrow('Top origin is required to initialize the Nested App Auth Bridge');
  });

  it('should not call removeEventListener if callback was never added', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    const unregisteredCallback = jest.fn(); // never registered
    bridge.removeEventListener('message', unregisteredCallback);

    expect(mockWindow.removeEventListener).not.toBeCalled();
  });

  it('should ignore message if source is not top window', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    const callback = jest.fn();
    bridge.addEventListener('message', callback);

    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: unknown) => void;

    const fakeSource = {} as Window;

    const msg = {
      origin: mockOrigin,
      source: fakeSource,
      data: {
        args: [null, JSON.stringify({ messageType: 'NestedAppAuthResponse' })],
      },
    };

    handler(msg);
    expect(callback).not.toBeCalled();
  });

  it('should ignore message without messageType', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    const callback = jest.fn();
    bridge.addEventListener('message', callback);

    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: unknown) => void;

    const msg = {
      origin: mockOrigin,
      source: mockWindow.top,
      data: {
        args: [null, JSON.stringify({ notMessageType: 'value' })],
      },
    };

    handler(msg);
    expect(callback).not.toBeCalled();
  });

  it('should not process message if origin is not HTTPS', () => {
    // Setup
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, 'https://contoso.com');
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;
    const callback = jest.fn();
    bridge.addEventListener('message', callback);

    // We capture the handler from addEventListener calls
    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: MessageEvent) => void;

    // Fire the event with a valid structure but non-HTTPS origin
    const msg = {
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url
      origin: 'http://contoso.com',
      source: mockWindow.top,
      data: {
        args: [null, JSON.stringify({ messageType: 'NestedAppAuthResponse' })],
      },
    };

    // Act
    handler(msg as unknown as MessageEvent);

    // Assert
    expect(callback).not.toBeCalled();
  });

  it('should throw an error when initialized with an invalid top origin URL', () => {
    expect(() => {
      nestedAppAuthBridge.initialize(mockWindow as unknown as Window, 'invalid-url');
    }).toThrow('Failed to initialize bridge: invalid top origin: invalid-url');
  });

  it('should log error and not attempt to post if window.top is null', () => {
    mockWindow.top = undefined; // no top
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin, true);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;

    expect(() => {
      bridge.postMessage(JSON.stringify({ messageType: 'NestedAppAuthRequest' }));
    }).toThrow('window.top is not available for posting messages');
  });

  it('should ignore message if evt.data is not an object', () => {
    nestedAppAuthBridge.initialize(mockWindow as unknown as Window, mockOrigin);
    const bridge = mockWindow.nestedAppAuthBridge as NestedAppAuthBridge;
    const callback = jest.fn();
    bridge.addEventListener('message', callback);

    const handler = mockWindow.addEventListener.mock.calls[0][1] as (event: unknown) => void;

    // Provide a numeric data
    handler({
      origin: mockOrigin,
      source: mockWindow.top,
      data: 42,
    });
    expect(callback).not.toBeCalled();
  });
});
