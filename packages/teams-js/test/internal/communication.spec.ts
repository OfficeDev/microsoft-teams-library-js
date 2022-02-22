import * as communication from '../../src/internal/communication';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import * as utils from '../../src/internal/utils';

describe('communication', () => {
  it('initializeCommunication should reject if no parent window and no native interface found', async () => {
    const initPromise = communication.initializeCommunication(undefined);
    await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
  });
  it('processMessage fail if message has a missing data property', () => {
    const event = ({ badData: '' } as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('processMessage fail if message is empty', () => {
    const event = ({} as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('processMessage fail if data property is not an object', () => {
    const event = ({ data: '' } as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('processMessage fail if message has random data', () => {
    const event = ({ badData: '', notAnOrigin: 'blah' } as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('processMessage fail if data is undefined', () => {
    const event = ({ data: undefined } as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('processMessage fail if data is null', () => {
    const event = ({ data: null } as any) as DOMMessageEvent;
    const result = communication.processMessage(event);
    expect(result).toBeUndefined();
  });
  it('shouldProcessMessage fail if message source is same window ', () => {
    communication.Communication.currentWindow = window;
    // window object should now equal Communication.currentWindow
    const result = communication.shouldProcessMessage(window, 'testOrigin.com');
    expect(result).toBe(false);
  });
  it('shouldProcessMessage success if origin matches current window ', () => {
    const messageOrigin = window.location.origin;
    communication.Communication.currentWindow = window;
    const result = communication.shouldProcessMessage(null, messageOrigin);
    expect(result).toBe(true);
  });

  it('shouldProcessMessage calls validateOrigin', () => {
    communication.Communication.currentWindow = window;
    jest.spyOn(utils, 'validateOrigin').mockReturnValue(true);
    const messageOrigin = 'http://someorigin';
    const messageOriginURL = new URL(messageOrigin);
    const result = communication.shouldProcessMessage(null, messageOrigin);
    expect(utils.validateOrigin).toBeCalled();
    expect(utils.validateOrigin).toBeCalledWith(messageOriginURL);
    expect(result).toBe(utils.validateOrigin(messageOriginURL));
  });
});
