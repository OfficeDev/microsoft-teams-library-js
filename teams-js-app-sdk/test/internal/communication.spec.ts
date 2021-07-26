import * as communication from '../../src/internal/communication';
import * as utils from '../../src/internal/utils';

describe('communication', () => {
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