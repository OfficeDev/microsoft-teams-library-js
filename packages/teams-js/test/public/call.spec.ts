import { app, call, FrameContexts } from '../../src/public';
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
    expect.assertions(1);
    await call
      .startCall(mockStartCallParams)
      .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
  });

  it('shoud not allow calls if not supported', async () => {
    expect.assertions(1);
    utils.initializeWithContext(FrameContexts.content);
    await call.startCall(mockStartCallParams).catch(e => expect(e).toEqual('Not supported'));
  });

  it('startCall should be called if supported', async () => {
    expect.assertions(3);
    utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({
      apiVersion: 1,
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
});
