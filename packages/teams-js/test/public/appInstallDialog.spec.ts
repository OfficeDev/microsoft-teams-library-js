import { app, appInstallDialog, FrameContexts } from '../../src/public';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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

  it('Make sure openAppInstallDialog only callable when isSupported returns true', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: false,
      supports: {
        appInstallDialog: {},
      },
    });
    const appInstallDialogCapability = appInstallDialog.getFunctions();
    if (appInstallDialogCapability.isSupported()) {
      expect(appInstallDialogCapability.openAppInstallDialog({ appId: 'appId' })).toBeTruthy(); // COMPILES
    }
    // else {
    //   expect(appInstallDialogCapability.openAppInstallDialog({ appId: 'appId' })).toBeTruthy(); // DOESN'T COMPILE
    // }
  });
});
