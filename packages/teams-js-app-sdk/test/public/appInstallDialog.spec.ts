import { app, appInstallDialog, FrameContexts } from '../../src/public';
import { Utils } from '../utils';

describe('appInstallDialog', () => {
  const utils = new Utils();
  const mockOpenAppInstallDialogParams: appInstallDialog.OpenAppInstallDialogParams = {
    appId: '0',
  };

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  it('should not allow openAppInstallDialog before initialization', () => {
    expect(appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('Should not allow openAppInstallDialog if not supported', () => {
    utils.initializeWithContext(FrameContexts.content);
    expect(appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams)).rejects.toEqual('Not supported');
  });

  it('openAppInstallDialog should be called if supported', async () => {
    expect.assertions(7); // 4 assertions are made in Utils.initializeWithContext
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      supports: {
        appInstall: {},
      },
    });
    const promise = appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams);
    const msg = utils.findMessageByFunc('appInstallDialog.openAppInstallDialog');
    expect(msg).toBeTruthy();
    expect(msg.args).toEqual([mockOpenAppInstallDialogParams]);
    utils.respondToMessage(msg, undefined);
    const response = await promise;
    expect(response).toBeUndefined();
  });
});
