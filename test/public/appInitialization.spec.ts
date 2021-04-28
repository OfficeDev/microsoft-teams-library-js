import { version } from '../../src/internal/constants';
import { appInitialization } from '../../src/public/appInitialization';
import { _uninitialize, _initialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';

describe('appInitialization', () => {

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

  it('should call notifyAppLoaded correctly', () => {
    utils.initializeWithContext('content');

    appInitialization.notifyAppLoaded();
    const message = utils.findMessageByFunc(appInitialization.Messages.AppLoaded);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(version);
  });

  it('should call notifySuccess correctly', () => {
    utils.initializeWithContext('content');

    appInitialization.notifySuccess();
    const message = utils.findMessageByFunc(appInitialization.Messages.Success);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(version);
  });

  it('should call notifyExpectedFailure correctly', () => {
    utils.initializeWithContext('content');

    appInitialization.notifyExpectedFailure({
      reason: appInitialization.ExpectedFailureReason.PermissionError,
      message: 'Permission denied'
    });
    const message = utils.findMessageByFunc(appInitialization.Messages.ExpectedFailure);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
    expect(message.args[0]).toEqual(appInitialization.ExpectedFailureReason.PermissionError);
    expect(message.args[1]).toEqual('Permission denied');
  });

  it('should call notifyFailure correctly', () => {
    utils.initializeWithContext('content');

    appInitialization.notifyFailure({
      reason: appInitialization.FailedReason.AuthFailed,
      message: 'Failed message'
    });
    const message = utils.findMessageByFunc(appInitialization.Messages.Failure);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
    expect(message.args[0]).toEqual(appInitialization.FailedReason.AuthFailed);
    expect(message.args[1]).toEqual('Failed message');
  });

});
