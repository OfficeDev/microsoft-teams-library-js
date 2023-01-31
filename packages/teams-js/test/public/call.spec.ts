import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, call, FrameContexts } from '../../src/public';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { validateCallDeepLinkPrefix, validateDeepLinkUsers } from '../internal/deepLinkUtilities.spec';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('call', () => {
  const utils = new Utils();
  const mockStartCallParams: call.StartCallParams = {
    targets: ['user'],
    requestedModalities: [call.CallModalities.Audio],
    source: 'source',
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

  it('should throw if called before initialization', () => {
    utils.uninitializeRuntimeConfig();
    expect(() => call.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
  });

  it('should not allow calls before initialization', async () => {
    await expect(call.startCall(mockStartCallParams)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
  });

  it('should not allow calls if not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: false,
      supports: {
        call: undefined,
      },
    });
    await expect(call.startCall(mockStartCallParams)).rejects.toEqual(errorNotSupportedOnPlatform);
  });

  it('startCall should be called if supported: Non-legacy host', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: false,
      supports: {
        call: {},
      },
    });
    const promise = call.startCall(mockStartCallParams);
    const msg = utils.findMessageByFunc('call.startCall');
    expect(msg).toBeTruthy();
    expect(msg.args).toEqual([mockStartCallParams]);
    utils.respondToMessage(msg, true);
    const response = await promise;
    expect(response).toBe(true);
  });

  it('startCall should be called if supported: Legacy host', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
      isLegacyTeams: true,
      supports: {
        call: {},
      },
    });
    const promise = call.startCall(mockStartCallParams);
    const executeDeepLinkMsg = utils.findMessageByFunc('executeDeepLink');
    expect(executeDeepLinkMsg).toBeTruthy();
    expect(executeDeepLinkMsg.args).toHaveLength(1);

    const callDeepLink: URL = new URL(executeDeepLinkMsg.args[0] as string);
    validateCallDeepLinkPrefix(callDeepLink);
    validateDeepLinkUsers(callDeepLink, mockStartCallParams.targets);

    utils.respondToMessage(executeDeepLinkMsg, false, true);
    await expect(promise).resolves.toBe(true);
  });
});
