import { authentication } from '../../src/public/authentication';
import { Utils } from '../utils';
import { initialize, _uninitialize, _initialize } from '../../src/public/publicAPIs';

describe('authentication', () => {
  // Use to send a mock message from the app.

  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  it('should not allow authentication.authenticate calls before initialization', () => {
    const authenticationParams: authentication.AuthenticateParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };

    expect(() => authentication.authenticate(authenticationParams)).toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should not allow authentication.authenticate calls from authentication context', () => {
    utils.initializeWithContext('authentication');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };

    expect(() => authentication.authenticate(authenticationParams)).toThrowError(
      "This call is not allowed in the 'authentication' context",
    );
  });

  it('should allow authentication.authenticate calls from content context', () => {
    utils.initializeWithContext('content');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from settings context', () => {
    utils.initializeWithContext('settings');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from sidePanel context', () => {
    utils.initializeWithContext('sidePanel');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from remove context', () => {
    utils.initializeWithContext('remove');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from task context', () => {
    utils.initializeWithContext('task');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from stage context', () => {
    utils.initializeWithContext('stage');

    const authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should successfully pop up the auth window', () => {
    utils.initializeWithContext('content');

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

    let authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);
  });

  it('should successfully pop up the auth window when authenticate called without authenticationParams for connectors', () => {
    utils.initializeWithContext('content');

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

    let authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.registerAuthenticationHandlers(authenticationParams);
    authentication.authenticate();
    expect(windowOpenCalled).toBe(true);
  });

  it('should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called', () => {
    utils.initializeWithContext('content');

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

    let successResult: string;
    let failureReason: string;
    let authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
      successCallback: (result: string) => (successResult = result),
      failureCallback: (reason: string) => (failureReason = reason),
    };
    authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);

    utils.childWindow.closed = true;
    setTimeout(() => {
      expect(successResult).toBeUndefined();
      expect(failureReason).toEqual('CancelledByUser');
    }, 101);
  });

  it('should successfully handle auth success', () => {
    utils.initializeWithContext('content');

    let successResult: string;
    let failureReason: string;
    let authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
      successCallback: (result: string) => (successResult = result),
      failureCallback: (reason: string) => (failureReason = reason),
    };
    authentication.authenticate(authenticationParams);

    utils.processMessage({
      origin: utils.tabOrigin,
      source: utils.childWindow,
      data: {
        id: 0,
        func: 'authentication.authenticate.success',
        args: ['someResult'],
      },
    } as MessageEvent);

    expect(successResult).toEqual('someResult');
    expect(failureReason).toBeUndefined();
  });

  it('should successfully handle auth failure', () => {
    utils.initializeWithContext('content');

    let successResult: string;
    let failureReason: string;
    let authenticationParams = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
      successCallback: (result: string) => (successResult = result),
      failureCallback: (reason: string) => (failureReason = reason),
    };
    authentication.authenticate(authenticationParams);

    utils.processMessage({
      origin: utils.tabOrigin,
      source: utils.childWindow,
      data: {
        id: 0,
        func: 'authentication.authenticate.failure',
        args: ['someReason'],
      },
    } as MessageEvent);

    expect(successResult).toBeUndefined();
    expect(failureReason).toEqual('someReason');
  });

  ['android', 'ios', 'desktop'].forEach(hostClientType => {
    it(`should successfully pop up the auth window in the ${hostClientType} client`, () => {
      utils.initializeWithContext('content', hostClientType);

      let authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
      };
      authentication.authenticate(authenticationParams);

      let message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
      expect(message.args[1]).toBe(authenticationParams.width);
      expect(message.args[2]).toBe(authenticationParams.height);
    });

    it(`should successfully handle auth success in the ${hostClientType} client`, () => {
      utils.initializeWithContext('content', hostClientType);

      let successResult: string;
      let failureReason: string;
      let authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
        successCallback: (result: string) => (successResult = result),
        failureCallback: (reason: string) => (failureReason = reason),
      };
      authentication.authenticate(authenticationParams);

      let message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();

      utils.respondToMessage(message, true, 'someResult');

      expect(successResult).toBe('someResult');
      expect(failureReason).toBeUndefined();
    });

    it(`should successfully handle auth failure in the ${hostClientType} client`, () => {
      utils.initializeWithContext('content', hostClientType);

      let successResult: string;
      let failureReason: string;
      let authenticationParams = {
        url: 'https://someUrl',
        width: 100,
        height: 200,
        successCallback: (result: string) => (successResult = result),
        failureCallback: (reason: string) => (failureReason = reason),
      };
      authentication.authenticate(authenticationParams);

      let message = utils.findMessageByFunc('authentication.authenticate');
      expect(message).not.toBeNull();

      utils.respondToMessage(message, false, 'someReason');

      expect(successResult).toBeUndefined();
      expect(failureReason).toBe('someReason');
    });
  });

  it('should successfully notify auth success', () => {
    utils.initializeWithContext('authentication');

    authentication.notifySuccess('someResult');
    let message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someResult');
  });

  it('should do window redirect if callbackUrl is for win32 Outlook', () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&result=someResult&authSuccess',
      );
    });

    utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should do window redirect if callbackUrl is for win32 Outlook and no result param specified', () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&authSuccess',
      );
    });

    utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      null,
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should do window redirect if callbackUrl is for win32 Outlook but does not have URL fragments', () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#&result=someResult&authSuccess',
      );
    });

    utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should successfully notify auth success if callbackUrl is not for win32 Outlook', () => {
    utils.initializeWithContext('authentication');

    authentication.notifySuccess(
      'someResult',
      'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
    );
    let message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someResult');
  });

  it('should successfully notify auth failure', () => {
    utils.initializeWithContext('authentication');

    authentication.notifyFailure('someReason');

    let message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should do window redirect if callbackUrl is for win32 Outlook and auth failure happens', () => {
    let windowAssignSpyCalled = false;
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      windowAssignSpyCalled = true;
      expect(url).toEqual(
        'https://outlook.office.com/connectors?client_type=Win32_Outlook#/configurations&reason=someReason&authFailure',
      );
    });

    utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      'someReason',
      'https%3A%2F%2Foutlook.office.com%2Fconnectors%3Fclient_type%3DWin32_Outlook%23%2Fconfigurations',
    );
    expect(windowAssignSpyCalled).toBe(true);
  });

  it('should successfully notify auth failure if callbackUrl is not for win32 Outlook', () => {
    spyOn(utils.mockWindow.location, 'assign').and.callFake((url: string): void => {
      expect(url).toEqual('https://someinvalidurl.com?callbackUrl=test#/configuration&reason=someReason&authFailure');
    });

    utils.initializeWithContext('authentication');

    authentication.notifyFailure(
      'someReason',
      'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration',
    );
    let message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should not close auth window before notify success message has been sent', () => {
    let closeWindowSpy = spyOn(utils.mockWindow, 'close').and.callThrough();

    initialize();
    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    authentication.notifySuccess('someResult');
    let message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).toBeNull();
    expect(closeWindowSpy).not.toHaveBeenCalled();

    utils.respondToMessage(initMessage, 'authentication');
    message = utils.findMessageByFunc('authentication.authenticate.success');
    expect(message).not.toBeNull();

    // Wait 100ms for the message queue and 200ms for the close delay
    setTimeout(() => {
      expect(closeWindowSpy).toHaveBeenCalled();
    }, 301);
  });

  it('should not close auth window before notify failure message has been sent', () => {
    let closeWindowSpy = spyOn(utils.mockWindow, 'close').and.callThrough();

    initialize();
    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    authentication.notifyFailure('someReason');
    let message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).toBeNull();
    expect(closeWindowSpy).not.toHaveBeenCalled();

    utils.respondToMessage(initMessage, 'authentication');
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
      failureCallback: () => {
        fail();
      },
      successCallback: () => {
        fail();
      },
    };

    expect(() => authentication.getAuthToken(authTokenRequest)).toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should successfully return getAuthToken in case of success', done => {
    utils.initializeWithContext('content');

    const authTokenRequest: authentication.AuthTokenRequest = {
      resources: ['https://someresource/'],
      claims: ['some_claim'],
      silent: false,
      failureCallback: () => {
        fail();
      },
      successCallback: result => {
        expect(result).toEqual('token');
        done();
      },
    };

    authentication.getAuthToken(authTokenRequest);

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(['https://someresource/']);
    expect(message.args[1]).toEqual(['some_claim']);
    expect(message.args[2]).toEqual(false);

    utils.respondToMessage(message, true, 'token');
  });

  it('should successfully return error from getAuthToken in case of failure', done => {
    utils.initializeWithContext('content');

    const authTokenRequest: authentication.AuthTokenRequest = {
      resources: ['https://someresource/'],
      failureCallback: error => {
        expect(error).toEqual('error');
        done();
      },
      successCallback: () => {
        fail();
      },
    };

    authentication.getAuthToken(authTokenRequest);

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(['https://someresource/']);
    expect(message.args[1]).toEqual(undefined);
    expect(message.args[2]).toEqual(undefined);

    utils.respondToMessage(message, false, 'error');
  });
});
