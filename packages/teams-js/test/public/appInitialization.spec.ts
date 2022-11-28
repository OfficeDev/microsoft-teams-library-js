import { app } from '../../src/public/app';
import { appInitialization } from '../../src/public/appInitialization';
import { version } from '../../src/public/version';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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

  describe('testing notifyAppLoaded', () => {
    it('should call app.notifyAppLoaded from the legacy code', async () => {
      await utils.initializeWithContext('content');
      const appFunc = jest.spyOn(app, 'notifyAppLoaded');
      appInitialization.notifyAppLoaded();
      expect(appFunc).toHaveBeenCalled();
      expect(appFunc).toHaveReturned();
      appFunc.mockRestore();
    });
    it('should call notifyAppLoaded correctly in legacy flow', async () => {
      await utils.initializeWithContext('content');

      appInitialization.notifyAppLoaded();
      const message = utils.findMessageByFunc(appInitialization.Messages.AppLoaded);
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(version);
    });
    it('should call notifyAppLoaded correctly', async () => {
      await utils.initializeWithContext('content');

      app.notifyAppLoaded();
      const message = utils.findMessageByFunc(app.Messages.AppLoaded);
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toEqual(version);
    });
  });

  describe('testing notifySuccess', () => {
    it('should call app.notifySuccess from the legacy code', async () => {
      await utils.initializeWithContext('content');
      const appFunc = jest.spyOn(app, 'notifySuccess');
      appInitialization.notifySuccess();
      expect(appFunc).toHaveBeenCalled();
      expect(appFunc).toHaveReturned();
      appFunc.mockRestore();
    });
    it('should call notifySuccess correctly in legacy flow', async () => {
      await utils.initializeWithContext('content');

      appInitialization.notifySuccess();
      const message = utils.findMessageByFunc(appInitialization.Messages.Success);
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
  });

  describe('testing notifyExpectedFailure', () => {
    it('should call app.notifyExpectedFailure from the legacy code', async () => {
      await utils.initializeWithContext('content');
      const appFunc = jest.spyOn(app, 'notifyExpectedFailure');
      appInitialization.notifyExpectedFailure({
        reason: appInitialization.ExpectedFailureReason.PermissionError,
        message: 'Permission denied',
      });
      expect(appFunc).toHaveBeenCalled();
      expect(appFunc).toHaveReturned();
      appFunc.mockRestore();
    });
    it('should call notifyExpectedFailure correctly in legacy flow', async () => {
      await utils.initializeWithContext('content');

      appInitialization.notifyExpectedFailure({
        reason: appInitialization.ExpectedFailureReason.PermissionError,
        message: 'Permission denied',
      });
      const message = utils.findMessageByFunc(appInitialization.Messages.ExpectedFailure);
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(appInitialization.ExpectedFailureReason.PermissionError);
      expect(message.args[1]).toEqual('Permission denied');
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
  });

  describe('testing notifyFailure', () => {
    it('should call app.notifyFailure from the legacy code', async () => {
      await utils.initializeWithContext('content');
      const appFunc = jest.spyOn(app, 'notifyFailure');
      appInitialization.notifyFailure({
        reason: appInitialization.FailedReason.AuthFailed,
        message: 'Failed message',
      });
      expect(appFunc).toHaveBeenCalled();
      expect(appFunc).toHaveReturned();
      appFunc.mockRestore();
    });
    it('should call notifyFailure correctly in legacy flow', async () => {
      await utils.initializeWithContext('content');

      appInitialization.notifyFailure({
        reason: appInitialization.FailedReason.AuthFailed,
        message: 'Failed message',
      });
      const message = utils.findMessageByFunc(appInitialization.Messages.Failure);
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(2);
      expect(message.args[0]).toEqual(appInitialization.FailedReason.AuthFailed);
      expect(message.args[1]).toEqual('Failed message');
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
});
