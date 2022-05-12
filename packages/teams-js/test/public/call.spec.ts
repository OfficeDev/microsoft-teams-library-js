import { app, call, FrameContexts } from '../../src/public';
import { validateCallDeepLinkPrefix, validateDeepLinkUsers } from '../internal/deepLinkUtilities.spec';
import { Utils } from '../utils';

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
      app._uninitialize();
    }
  });

  it('should not allow calls before initialization', async () => {
    await expect(call.startCall(mockStartCallParams)).rejects.toThrowError('The library has not yet been initialized');
  });

  it('should not allow calls if not supported', async () => {
    utils.initializeWithContext(FrameContexts.content);
    await expect(call.startCall(mockStartCallParams)).rejects.toThrowError('Not supported');
  });

  it('startCall should be called if supported: Non-legacy host', async () => {
    utils.initializeWithContext(FrameContexts.content);
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
    utils.initializeWithContext(FrameContexts.content);
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

    const callDeepLink: URL = new URL(executeDeepLinkMsg.args[0]);
    validateCallDeepLinkPrefix(callDeepLink);
    validateDeepLinkUsers(callDeepLink, mockStartCallParams.targets);

    utils.respondToMessage(executeDeepLinkMsg, false, true);
    await expect(promise).resolves.toBe(true);
  });
});
