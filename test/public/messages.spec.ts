import { messaging } from '../../src/public/messaging';
import { _uninitialize, _initialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';
import { ErrorCode } from '../../src/public/interfaces';

describe('messages', () => {

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

  it('should handle share web content in success scenario', () => {
    utils.initializeWithContext('content');
    const cb = jasmine.createSpy('callback');
    const shareRequest: messaging.IShareWebContentRequest = {
      url: 'https://www.microsoft.com',
      preview: true,
      message: 'Test'
    };

    messaging.shareWebContent(shareRequest, cb);
    const shareMessage = utils.findMessageByFunc(messaging.MessagingAPIMessages.shareWebContent);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args.length).toBe(1);
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage);
    expect(cb).toHaveBeenCalledWith(undefined);
  });

  it('should handle share web content when data is missing', () => {
    utils.initializeWithContext('content');
    const shareRequest = {url: ''};
    const error = {
      errorCode: ErrorCode.INVALID_ARGUMENTS,
      message: 'URL is required.'
    };

    let response: any;
    messaging.shareWebContent(shareRequest, (res) => {
      response = res;
    });
    const shareMessage = utils.findMessageByFunc(messaging.MessagingAPIMessages.shareWebContent);
    expect(shareMessage).toBeNull();
    expect(response).toEqual(error);
  });

  it('should handle share web content when other errors occur', () => {
    utils.initializeWithContext('content');
    const shareRequest = {url: 'https://www.test.com'};
    const error = {
      errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      message: 'Feature is not supported.'
    };

    let response: any;
    messaging.shareWebContent(shareRequest, (res) => {
      response = res;
    });
    const shareMessage = utils.findMessageByFunc(messaging.MessagingAPIMessages.shareWebContent);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage, error);
    expect(response).toEqual(error);
  });

  it('should handle class assignment creation', () => {
    utils.initializeWithContext('content');
    const cb = jasmine.createSpy('callback');
    const shareRequest: messaging.ICreateAssignmentRequest = {
      url: 'https://www.microsoft.com',
      title: 'Essay 1',
      instruction: 'Write an essay about this'
    };

    messaging.createAssignment(shareRequest, cb);
    const shareMessage = utils.findMessageByFunc(messaging.MessagingAPIMessages.createAssignment);
    expect(shareMessage).not.toBeNull();
    expect(shareMessage.args.length).toBe(1);
    expect(shareMessage.args[0]).toEqual(shareRequest);
    utils.respondToMessage(shareMessage);
    expect(cb).toHaveBeenCalledWith(undefined);
  });
});
