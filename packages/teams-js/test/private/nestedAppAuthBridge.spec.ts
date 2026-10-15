import { nestedAppAuthBridge } from '../../src/private';
import * as standaloneBridge from '../../src/private/nestedAppAuth/nestedAppAuthBridge';

interface Bridge {
  addEventListener: (eventName: 'message', callback: (response: string) => void) => void;
  postMessage: (message: string) => void;
  removeEventListener: (eventName: 'message', callback: (response: string) => void) => void;
}

interface SentRequest {
  id: string;
  uuidAsString: string;
  data: string;
  func: string;
}

interface TestWindow {
  top?: { postMessage: jest.Mock };
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
  nestedAppAuthBridge?: Bridge;
}

describe('NestedAppAuthBridge standalone transport', () => {
  const origin = 'https://microsoft.com';
  let target: TestWindow;
  let bridge: Bridge;
  let callback: jest.Mock;
  let listeners: Set<(event: MessageEvent) => void>;

  function initialize(topOrigin = origin, enableLogging = false): Bridge {
    nestedAppAuthBridge.initialize(target as unknown as Window, topOrigin, enableLogging);
    if (!target.nestedAppAuthBridge) {
      throw new Error('Test bridge was not installed');
    }
    return target.nestedAppAuthBridge;
  }

  function send(requestId = 'request-1', method = 'GetToken'): SentRequest {
    bridge.postMessage(JSON.stringify({ messageType: 'NestedAppAuthRequest', requestId, method }));
    const calls = target.top?.postMessage.mock.calls;
    if (!calls?.length) {
      throw new Error('No request was sent');
    }
    return calls[calls.length - 1][0];
  }

  function innerResponse(requestId = 'request-1', success = true): string {
    return JSON.stringify({ messageType: 'NestedAppAuthResponse', requestId, success });
  }

  function envelope(request: SentRequest, message = innerResponse()): Record<string, unknown> {
    return { id: request.id, uuidAsString: request.uuidAsString, args: [null, message] };
  }

  function receive(data: unknown, messageOrigin = origin): void {
    const event = new MessageEvent('message', { data, origin: messageOrigin });
    for (const listener of Array.from(listeners)) {
      listener(event);
    }
  }

  beforeEach(() => {
    listeners = new Set();
    target = {
      top: { postMessage: jest.fn() },
      addEventListener: jest.fn((_name, listener) => listeners.add(listener)),
      removeEventListener: jest.fn((_name, listener) => listeners.delete(listener)),
    };
    bridge = initialize();
    callback = jest.fn();
    bridge.addEventListener('message', callback);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('exports the same module through the namespace and deep entry', () => {
    expect(nestedAppAuthBridge.initialize).toBe(standaloneBridge.initialize);
    expect(nestedAppAuthBridge.version).toBe('1.0.2');
  });

  it('preserves the original request bytes and sends the serialized UUID field', () => {
    const message = '{ "messageType":"NestedAppAuthRequest", "requestId":"request-1", "method":"GetToken" }';
    bridge.postMessage(message);
    expect(target.top?.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        uuidAsString: expect.any(String),
        func: 'nestedAppAuth.execute',
        apiVersionTag: 'v3_nestedAppAuth.execute',
        args: [],
        data: message,
      }),
      origin,
    );
    expect(target.top?.postMessage.mock.calls[0][0]).not.toHaveProperty('uuid');
  });

  it.each(['GetInitContext', 'GetToken', 'GetTokenPopup'])('correlates %s replies', (method) => {
    const request = send('request-1', method);
    const message = innerResponse();
    receive(envelope(request, message));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(message);
  });

  it.each([true, false])('forwards accepted success=%s byte-for-byte', (success) => {
    const request = send();
    const message = `{ "messageType": "NestedAppAuthResponse", "requestId": "request-1", "success": ${success}, "extra": {} }`;
    receive(envelope(request, message));
    expect(callback).toHaveBeenCalledWith(message);
  });

  it('handles concurrent silent and popup replies in reverse order', () => {
    const silent = send('silent', 'GetToken');
    const popup = send('popup', 'GetTokenPopup');
    receive(envelope(popup, innerResponse('popup')));
    receive(envelope(silent, innerResponse('silent', false)));
    expect(callback.mock.calls).toEqual([[innerResponse('popup')], [innerResponse('silent', false)]]);
  });

  it('registers correlation before postMessage can synchronously respond', () => {
    target.top?.postMessage.mockImplementation((request: SentRequest) => receive(envelope(request)));
    send();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('consumes the entry before dispatch to prevent duplicate and reentrant delivery', () => {
    const request = send();
    const response = envelope(request);
    callback.mockImplementation(() => receive(response));
    receive(response);
    receive(response);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not let a late response settle a new operation reusing the inner ID', () => {
    const old = send();
    receive(envelope(old));
    const current = send();
    callback.mockClear();
    receive(envelope(old));
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(current));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite a live operation reusing the inner ID', () => {
    const request = send();
    send();
    expect(target.top?.postMessage).toHaveBeenCalledTimes(1);
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not overwrite correlation when generated outer IDs collide', () => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');
    const first = send('first');
    send('second');
    expect(target.top?.postMessage).toHaveBeenCalledTimes(1);
    receive(envelope(first, innerResponse('first')));
    expect(callback).toHaveBeenCalledWith(innerResponse('first'));
  });

  it.each([
    ['missing ID', { id: undefined }],
    ['wrong ID', { id: 'unrelated' }],
    ['coerced ID', { id: 1 }],
    ['missing UUID', { uuidAsString: undefined }],
    ['empty UUID', { uuidAsString: '' }],
    ['wrong UUID', { uuidAsString: 'unrelated' }],
    ['partial response', { isPartialResponse: true }],
    ['malformed partial marker', { isPartialResponse: 'false' }],
    ['non-array args', { args: {} }],
    ['absent args', { args: undefined }],
    ['dual payload', { args: [{ errorCode: 100 }, innerResponse()] }],
    ['extra argument', { args: [null, innerResponse(), 'extra'] }],
    ['non-null first argument', { args: [false, innerResponse()] }],
    ['non-string inner', { args: [null, {}] }],
    ['invalid JSON', { args: [null, '{'] }],
    ['null inner', { args: [null, 'null'] }],
    ['array inner', { args: [null, '[]'] }],
    ['primitive inner', { args: [null, '1'] }],
    ['wrong message type', { args: [null, '{"messageType":"other","requestId":"request-1","success":true}'] }],
    ['missing inner ID', { args: [null, '{"messageType":"NestedAppAuthResponse","success":true}'] }],
    ['wrong inner ID', { args: [null, innerResponse('unrelated')] }],
    ['missing success', { args: [null, '{"messageType":"NestedAppAuthResponse","requestId":"request-1"}'] }],
    [
      'non-boolean success',
      { args: [null, '{"messageType":"NestedAppAuthResponse","requestId":"request-1","success":"false"}'] },
    ],
  ])('ignores %s without consuming a live request', (_name, change) => {
    const request = send();
    receive({ ...envelope(request), ...change });
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each([null, undefined, 42, 'message', []])('ignores a non-envelope %p', (data) => {
    const request = send();
    receive(data);
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each([100, 500, 501])('does not invent an MSAL mapping for outer SDK error %s', (errorCode) => {
    const request = send();
    receive({ id: request.id, uuidAsString: request.uuidAsString, args: [{ errorCode }] });
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['https://unrelated.microsoft.com', 'null', ''])('ignores the wrong origin %s', (messageOrigin) => {
    const request = send();
    receive(envelope(request), messageOrigin);
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('rejects HTTP responses without consuming correlation', () => {
    const request = send();
    // eslint-disable-next-line @microsoft/sdl/no-insecure-url
    receive(envelope(request), 'http://microsoft.com');
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('deduplicates registrations and removes the exact dispatcher', () => {
    bridge.addEventListener('message', callback);
    expect(target.addEventListener).toHaveBeenCalledTimes(1);
    const request = send();
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
    bridge.removeEventListener('message', callback);
    bridge.removeEventListener('message', callback);
    expect(target.removeEventListener).toHaveBeenCalledTimes(1);
    expect(target.removeEventListener).toHaveBeenCalledWith('message', target.addEventListener.mock.calls[0][1]);
    expect(listeners.size).toBe(0);
  });

  it('broadcasts once to each subscriber and removes only the requested subscriber', () => {
    const second = jest.fn();
    bridge.addEventListener('message', second);
    const request = send();
    receive(envelope(request));
    expect(second).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledTimes(1);
    bridge.removeEventListener('message', callback);
    expect(target.removeEventListener).not.toHaveBeenCalled();
    const next = send();
    receive(envelope(next));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('delivers to remaining subscribers even when one throws', () => {
    const failure = new Error('subscriber failure');
    callback.mockImplementation(() => {
      throw failure;
    });
    const second = jest.fn();
    bridge.addEventListener('message', second);
    const request = send();
    expect(() => receive(envelope(request))).toThrow(failure);
    expect(second).toHaveBeenCalledTimes(1);
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not treat removal of all listeners as cancellation', () => {
    const request = send();
    bridge.removeEventListener('message', callback);
    bridge.addEventListener('message', callback);
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('ignores removal of a callback that was never registered', () => {
    bridge.removeEventListener('message', jest.fn());
    expect(target.removeEventListener).not.toHaveBeenCalled();
  });

  it.each(['GetToken', 'GetTokenPopup'])('keeps a silent %s pending beyond 60 seconds', (method) => {
    jest.useFakeTimers();
    const request = send('request-1', method);
    jest.advanceTimersByTime(120000);
    expect(callback).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
    receive(envelope(request));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cleans up provisional correlation after demonstrated send failure', () => {
    target.top?.postMessage.mockImplementationOnce(() => {
      throw new Error('send failed');
    });
    send();
    const failed = target.top?.postMessage.mock.calls[0][0] as SentRequest;
    receive(envelope(failed));
    expect(callback).not.toHaveBeenCalled();
    const retry = send();
    expect(target.top?.postMessage).toHaveBeenCalledTimes(2);
    receive(envelope(retry));
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not retarget an installed bridge or an in-flight request on reinitialization', () => {
    const request = send();
    expect(initialize('https://other.microsoft.com')).toBe(bridge);
    receive(envelope(request), 'https://other.microsoft.com');
    expect(callback).not.toHaveBeenCalled();
    receive(envelope(request));
    const next = send();
    expect(target.top?.postMessage).toHaveBeenLastCalledWith(next, origin);
  });

  it('isolates origin, correlation and logging between injected windows', () => {
    const firstTarget = target;
    const first = send();
    const firstListeners = listeners;
    listeners = new Set();
    target = {
      top: { postMessage: jest.fn() },
      addEventListener: jest.fn((_name, listener) => listeners.add(listener)),
      removeEventListener: jest.fn((_name, listener) => listeners.delete(listener)),
    };
    bridge = initialize('https://other.microsoft.com', true);
    const secondCallback = jest.fn();
    bridge.addEventListener('message', secondCallback);
    const second = send();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    receive(envelope(first), 'https://other.microsoft.com');
    expect(secondCallback).not.toHaveBeenCalled();
    receive(envelope(second), 'https://other.microsoft.com');
    expect(secondCallback).toHaveBeenCalledTimes(1);
    consoleSpy.mockClear();
    for (const listener of firstListeners) {
      listener(new MessageEvent('message', { data: envelope(first), origin: 'https://other.microsoft.com' }));
      listener(new MessageEvent('message', { data: envelope(first), origin }));
    }
    expect(callback).toHaveBeenCalledTimes(1);
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(firstTarget.top?.postMessage).toHaveBeenCalledTimes(1);
  });

  it('retains a preinstalled native bridge unchanged', () => {
    const nativeBridge: Bridge = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      postMessage: jest.fn(),
    };
    target.nestedAppAuthBridge = nativeBridge;
    expect(initialize()).toBe(nativeBridge);
  });

  // eslint-disable-next-line @microsoft/sdl/no-insecure-url
  it.each(['invalid-url', 'ftp://microsoft.com'])('rejects invalid configured origin %s', (topOrigin) => {
    expect(() => initialize(topOrigin)).toThrow('Failed to initialize bridge: invalid top origin');
  });

  it('requires a current window and a top origin', () => {
    expect(() => nestedAppAuthBridge.initialize(null, origin)).toThrow('current window does not exist');
    expect(() => initialize('')).toThrow('Top origin is required');
  });

  it('throws if the top window is unavailable', () => {
    target.top = undefined;
    expect(() => send()).toThrow('window.top is not available');
  });

  it.each([
    'invalid-json',
    'null',
    '[]',
    '1',
    '{"messageType":"OtherMessage"}',
    '{"messageType":"NestedAppAuthRequest","method":"GetToken"}',
    '{"messageType":"NestedAppAuthRequest","requestId":"","method":"GetToken"}',
    '{"messageType":"NestedAppAuthRequest","requestId":"request-1"}',
  ])('ignores invalid request %s without posting', (message) => {
    bridge.postMessage(message);
    expect(target.top?.postMessage).not.toHaveBeenCalled();
  });

  it('does not log raw request, response or exception payloads', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    target.nestedAppAuthBridge = undefined;
    bridge = initialize(origin, true);
    bridge.addEventListener('message', callback);
    bridge.postMessage('sensitive-request-not-json');
    const request = send();
    receive(envelope(request, 'sensitive-response-not-json'));
    target.top?.postMessage.mockImplementationOnce(() => {
      throw new Error('sensitive-send-error');
    });
    send('second');
    expect(errorSpy).toHaveBeenCalled();
    expect(JSON.stringify([...errorSpy.mock.calls, ...logSpy.mock.calls])).not.toContain('sensitive-');
  });
});
