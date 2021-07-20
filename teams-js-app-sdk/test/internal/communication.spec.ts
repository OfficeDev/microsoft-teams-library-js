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
    const messageOrigin = 'http://localhost';
    communication.Communication.currentWindow = window;
    // this should set Communication.currentWindow.location.origin to "http://localhost"
    const result = communication.shouldProcessMessage(null, messageOrigin);
    expect(result).toBe(true);
  });

  it('shouldProcessMessage calls validateOrigin', () => {
    communication.Communication.currentWindow = window;
    jest.spyOn(utils, 'validateOrigin').mockReturnValueOnce(true);
    const messageOrigin = 'http://someorigin';
    const result = communication.shouldProcessMessage(null, messageOrigin);
    expect(result).toBe(true);
    expect(utils.validateOrigin).toBeCalled();
  });

  it('validateOrigin returns true if origin is in teams pre-known whitelist', () => {
    const messageOrigin = 'https://teams.microsoft.com';
    const result = utils.validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns true if origin for subdomains in teams pre-known whitelist', () => {
    const messageOrigin = 'https://subdomain.teams.microsoft.com';
    const result = utils.validateOrigin(messageOrigin);
    expect(result).toBe(true);
  });
  it('validateOrigin returns false if origin is not in teams pre-known whitelist', () => {
    const messageOrigin = 'badorigin.com';
    const result = utils.validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
  it('validateOrigin returns false if origin is not an exact match in teams pre-known whitelist', () => {
    const messageOrigin = 'https://team.microsoft.com';
    const result = utils.validateOrigin(messageOrigin);
    expect(result).toBe(false);
  });
});