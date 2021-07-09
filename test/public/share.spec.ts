import { share } from '../../src/public/share';
import { _uninitialize, _initialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';
import { ErrorCode } from '../../src/public/interfaces';

describe('share', () => {

  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  it('should handle shareLink in success scenario', () => {
    utils.initializeWithContext('content');
    const cb = jasmine.createSpy('callback');
    const shareRequest = {url: 'https://www.microsoft.com'};

    share.shareLink(shareRequest, cb);
    const shareMessage = utils.findMessageByFunc(share.ShareAPIMessages.shareLink);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args.length).toBe(1);
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage);
    expect(cb).toHaveBeenCalledWith(undefined);
  });

  it('should handle shareLink when data is missing', () => {
    utils.initializeWithContext('content');
    const shareRequest = {url: ''};
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'Url is required.'
    };

    let response: any;
    share.shareLink(shareRequest, (res) => {
      response = res;
    });
    const shareMessage = utils.findMessageByFunc(share.ShareAPIMessages.shareLink);
    expect(shareMessage).toBeNull();
    expect(response).toEqual(error);
  });

  it('should handle shareLink when other errors occur', () => {
    utils.initializeWithContext('content');
    const shareRequest = {url: 'https://www.test.com'};
    const error = {
      errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      message: 'Feature is not supported.'
    };

    let response: any;
    share.shareLink(shareRequest, (res) => {
      response = res;
    });
    const shareMessage = utils.findMessageByFunc(share.ShareAPIMessages.shareLink);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage, error);
    expect(response).toEqual(error);
  });
});
