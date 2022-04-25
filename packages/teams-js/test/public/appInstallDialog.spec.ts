import { teamsDeepLinkUrlPathForAppInstall } from '../../src/internal/deepLinkConstants';
import { app, appInstallDialog, FrameContexts } from '../../src/public';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
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
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

      app._uninitialize();
    }
  });

  it('should not allow openAppInstallDialog before initialization', async () => {
    await expect(appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('Should not allow openAppInstallDialog if not supported', async () => {
    utils.initializeWithContext(FrameContexts.content);
    await expect(appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams)).rejects.toThrowError(
      'Not supported',
    );
  });

  it('openAppInstallDialog should be called if supported: Non-legacy host', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: false,
      supports: {
        appInstallDialog: {},
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

  it('openAppInstallDialog should be called if supported: Legacy host', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: true,
      supports: {
        appInstallDialog: {},
      },
    });
    const promise = appInstallDialog.openAppInstallDialog(mockOpenAppInstallDialogParams);
    const executeDeepLinkMsg = utils.findMessageByFunc('executeDeepLink');
    expect(executeDeepLinkMsg).toBeTruthy();
    expect(executeDeepLinkMsg.args).toHaveLength(1);

    const appInstallDialogDeepLink: URL = new URL(executeDeepLinkMsg.args[0]);
    expect(appInstallDialogDeepLink.pathname).toMatch(
      teamsDeepLinkUrlPathForAppInstall + mockOpenAppInstallDialogParams.appId + '/',
    );
    utils.respondToMessage(executeDeepLinkMsg, true);
    const response = await promise;
    expect(response).toBeUndefined();
  });
});
