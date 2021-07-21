import { version } from '../../src/internal/constants';
import { app } from '../../src/public/app';
import { Utils } from '../utils';

describe('appInitialization', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  it('should call notifyAppLoaded correctly', async () => {
    await utils.initializeWithContext('content');

    app.notifyAppLoaded();
    const message = utils.findMessageByFunc(app.Messages.AppLoaded);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(version);
  });

  it('should call notifySuccess correctly', async () => {
    await utils.initializeWithContext('content');

    app.notifySuccess();
    const message = utils.findMessageByFunc(app.Messages.Success);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toEqual(version);
  });

  it('should call notifyExpectedFailure correctly', async () => {
    await utils.initializeWithContext('content');

    app.notifyExpectedFailure({
      reason: app.ExpectedFailureReason.PermissionError,
      message: 'Permission denied',
    });
    const message = utils.findMessageByFunc(app.Messages.ExpectedFailure);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
    expect(message.args[0]).toEqual(app.ExpectedFailureReason.PermissionError);
    expect(message.args[1]).toEqual('Permission denied');
  });

  it('should call notifyFailure correctly', async () => {
    await utils.initializeWithContext('content');

    app.notifyFailure({
      reason: app.FailedReason.AuthFailed,
      message: 'Failed message',
    });
    const message = utils.findMessageByFunc(app.Messages.Failure);
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
    expect(message.args[0]).toEqual(app.FailedReason.AuthFailed);
    expect(message.args[1]).toEqual('Failed message');
  });
});
