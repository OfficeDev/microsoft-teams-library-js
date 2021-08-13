import { authentication } from '../../src/public/authentication';
import { Utils } from '../utils';
import { app } from '../../src/public/app';

describe('authentication', () => {
  // Use to send a mock message from the app.

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

  it('should not allow authentication.authenticate calls before initialization', () => {
    const authenticationParams: authentication.AuthenticateParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };

    return expect(authentication.authenticate(authenticationParams)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should not allow authentication.authenticate calls from authentication context', async () => {
    await utils.initializeWithContext('authentication');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };

    return expect(authentication.authenticate(authenticationParams)).rejects.toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });

  it('should allow authentication.authenticate calls from content context', async () => {
    await utils.initializeWithContext('content');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from settings context', async () => {
    await utils.initializeWithContext('settings');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from sidePanel context', async () => {
    await utils.initializeWithContext('sidePanel');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from remove context', async () => {
    await utils.initializeWithContext('remove');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from task context', async () => {
    await utils.initializeWithContext('task');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from stage context', async () => {
    await utils.initializeWithContext('stage');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should successfully pop up the auth window', async () => {
    await utils.initializeWithContext('content');

    let windowOpenCalled = false;
    spyOn(utils.mockWindow, 'open').and.callFake(
      (url: string, name: string, specs: string): Window => {
        expect(url).toEqual('https://someurl/');
        expect(name).toEqual('_blank');
        expect(specs.indexOf('width=100')).not.toBe(-1);
        expect(specs.indexOf('height=200')).not.toBe(-1);
        windowOpenCalled = true;
        return utils.childWindow as Window;
      },
    );

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);
  });

  it('should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called', async () => {
    await utils.initializeWithContext('content');

    let windowOpenCalled = false;
    spyOn(utils.mockWindow, 'open').and.callFake(
      (url: string, name: string, specs: string): Window => {
        expect(url).toEqual('https://someurl/');
        expect(name).toEqual('_blank');
        expect(specs.indexOf('width=100')).not.toBe(-1);
        expect(specs.indexOf('height=200')).not.toBe(-1);
        windowOpenCalled = true;
        return utils.childWindow as Window;
      },
    );

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    const promise = authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);

    utils.childWindow.closed = true;
    return expect(promise).rejects.toThrowError('CancelledByUser');
  });

  it('should successfully handle auth success', async () => {
    await utils.initializeWithContext('content');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    const promise = authentication.authenticate(authenticationParams);

    utils.processMessage({
      origin: utils.tabOrigin,
      source: utils.childWindow,
      data: {
        id: 0,
        func: 'authentication.authenticate.success',
        args: ['someResult'],
      },
    } as MessageEvent);

    return expect(promise).resolves.toEqual('someResult');
  });

  it('should successfully handle auth failure', async () => {
    await utils.initializeWithContext('content');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    const promise = authentication.authenticate(authenticationParams);

    utils.processMessage({
      origin: utils.tabOrigin,
      source: utils.childWindow,
      data: {
        id: 0,
        func: 'authentication.authenticate.failure',
        args: ['someReason'],
      },
    } as MessageEvent);

    return expect(promise).rejects.toThrowError('someReason');
  });

  ['android', 'ios', 'desktop'].forEach(hostClientType => {
    it(`should successfully pop up the auth window in the ${hostClientType} client`, async () => {
      await utils.initializeWithContext('content', hostClientType);

      const authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
      };
      authentication.authenticate(authenticationParams);

      const message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
      expect(message.args[1]).toBe(authenticationParams.width);
      expect(message.args[2]).toBe(authenticationParams.height);
    });

    it(`should successfully handle auth success in the ${hostClientType} client`, async () => {
      await utils.initializeWithContext('content', hostClientType);

      const authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
      };
      const promise = authentication.authenticate(authenticationParams);

      const message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();

      utils.respondToMessage(message, true, 'someResult');

      expect(promise).resolves.toEqual('someResult');
    });

    it(`should successfully handle auth failure in the ${hostClientType} client`, async () => {
      await utils.initializeWithContext('content', hostClientType);

      const authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
      };
      const promise = authentication.authenticate(authenticationParams);

      const message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();

      utils.respondToMessage(message, false, 'someReason');

      return expect(promise).rejects.toThrowError('someReason');
    });
  });

  it('should successfully notify auth success', async () => {
    await utils.initializeWithContext('authentication');

    authentication.notifySuccess('someResult');
    const message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someResult');
  });

  it('should do window redirect if callbackUrl is for win32 Outlook', async () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&result=someResult&authSuccess',
      );
    });

    await utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should do window redirect if callbackUrl is for win32 Outlook and no result param specified', async () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&authSuccess',
      );
    });

    await utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      null,
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should do window redirect if callbackUrl is for win32 Outlook but does not have URL fragments', async () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#&result=someResult&authSuccess',
      );
    });

    await utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should successfully notify auth success if callbackUrl is not for win32 Outlook', async () => {
    await utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
    );
    const message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someResult');
  });

  it('should successfully notify auth failure', async () => {
    await utils.initializeWithContext('authentication');

    authentication.notifyFailure('someReason');

    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should do window redirect if callbackUrl is for win32 Outlook and auth failure happens', async () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&reason=someReason&authFailure',
      );
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      'someReason',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should successfully notify auth failure if callbackUrl is not for win32 Outlook', async () => {
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      expect(url).toEqual('https://someinvalidurl.com?callbackUrl=test#/configuration&reason=someReason&authFailure');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      'someReason',
      'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
    );
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should successfully notify auth failure if callbackUrl is not for win32 Outlook and reason is empty', async () => {
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      '',
      'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
    );
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('');
  });

  it('should successfully notify auth failure if callbackUrl and reason are empty', async () => {
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      '',
      '',
    );
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('');
  });

  it('should successfully notify auth failure if callbackUrl is empty', async () => {
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      'someReason',
      '',
    );
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should not close auth window before notify success message has been sent', async () => {
    const closeWindowSpy = spyOn(utils.mockWindow, 'close').and.callThrough();

    const initPromise = app.initialize();
    const initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    authentication.notifySuccess('someResult');
    let message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).toBeNull();
    expect(closeWindowSpy).not.toHaveBeenCalled();

    utils.respondToMessage(initMessage, 'authentication');
    await initPromise;
    message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();

    // Wait 100ms for the message queue and 200ms for the close delay
    setTimeout(() => {
      expect(closeWindowSpy).toHaveBeenCalled();
    }, 301);
  });

  it('should not close auth window before notify failure message has been sent', async () => {
    const closeWindowSpy = spyOn(utils.mockWindow, 'close').and.callThrough();

    const initPromise = app.initialize();
    const initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    authentication.notifyFailure('someReason');
    let message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).toBeNull();
    expect(closeWindowSpy).not.toHaveBeenCalled();

    utils.respondToMessage(initMessage, 'authentication');
    await initPromise;
    message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();

    // Wait 100ms for the message queue and 200ms for the close delay
    setTimeout(() => {
      expect(closeWindowSpy).toHaveBeenCalled();
    }, 301);
  });

  it('should not allow getAuthToken calls before initialization', () => {
    const authTokenRequest: authentication.AuthTokenRequest = {
      resources: ['https://someresource/'],
      claims: ['some_claim'],
      silent: false,
    };

    return expect(authentication.getAuthToken(authTokenRequest)).rejects.toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should successfully return getAuthToken in case of success', async () => {
    await utils.initializeWithContext('content');

    const authTokenRequest: authentication.AuthTokenRequest = {
      resources: ['https://someresource/'],
      claims: ['some_claim'],
      silent: false,
    };

    const promise = authentication.getAuthToken(authTokenRequest);

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(['https://someresource/']);
    expect(message.args[1]).toEqual(['some_claim']);
    expect(message.args[2]).toEqual(false);

    utils.respondToMessage(message, true, 'token');
    return expect(promise).resolves.toEqual('token');
  });

  it('should successfully return error from getAuthToken in case of failure', async () => {
    await utils.initializeWithContext('content');

    const authTokenRequest: authentication.AuthTokenRequest = {
      resources: ['https://someresource/'],
    };

    const promise = authentication.getAuthToken(authTokenRequest);

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(['https://someresource/']);
    expect(message.args[1]).toEqual(undefined);
    expect(message.args[2]).toEqual(undefined);

    utils.respondToMessage(message, false, 'error');
    return expect(promise).rejects.toThrowError('error');
  });
});
