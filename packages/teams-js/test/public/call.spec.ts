import { app, call, FrameContexts } from '../../src/public';
import { generateBackCompatRuntimeConfig } from '../../src/public/runtime';
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

  it('runtime check', () => {
    expect(JSON.stringify(generateBackCompatRuntimeConfig('1.9.0'))).toContain('location');
    expect(JSON.stringify(generateBackCompatRuntimeConfig('2.0.0'))).toContain('location');
    expect(JSON.stringify(generateBackCompatRuntimeConfig('2.0.0'))).toContain('people');
    expect(JSON.stringify(generateBackCompatRuntimeConfig('2.2.0'))).toContain('location');
    expect(JSON.stringify(generateBackCompatRuntimeConfig('2.2.0'))).toContain('people');
    console.log(JSON.stringify(generateBackCompatRuntimeConfig('2.2.0')));
    console.log(JSON.stringify(generateBackCompatRuntimeConfig('2.2.0').supports.teams.fullTrust));
  });

  it('should not allow calls if not supported', async () => {
    utils.initializeWithContext(FrameContexts.content);
    await expect(call.startCall(mockStartCallParams)).rejects.toThrowError('Not supported');
  });

  it('startCall should be called if supported', async () => {
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
