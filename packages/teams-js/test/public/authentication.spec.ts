import { app } from '../../src/public/app';
import { authentication } from '../../src/public/authentication';
import { Utils } from '../utils';

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
    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };

    expect(() => authentication.authenticate(authenticationParams)).toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should not allow authentication.authenticate calls from authentication context', () => {
    return utils.initializeWithContext('authentication').then(() => {
      const authenticationParams: authentication.AuthenticatePopUpParameters = {
        url: 'https://someurl/',
        width: 100,
        height: 200,
      };

      expect(() => authentication.authenticate(authenticationParams)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","settings","remove","task","stage","meetingStage"]. Current context: "authentication".',
      );
    });
  });

  it('should allow authentication.authenticate calls from content context', async () => {
    await utils.initializeWithContext('content');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from settings context', async () => {
    await utils.initializeWithContext('settings');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from sidePanel context', async () => {
    await utils.initializeWithContext('sidePanel');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from remove context', async () => {
    await utils.initializeWithContext('remove');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from task context', async () => {
    await utils.initializeWithContext('task');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should allow authentication.authenticate calls from stage context', async () => {
    await utils.initializeWithContext('stage');

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
  });

  it('should successfully pop up the auth window', async () => {
    await utils.initializeWithContext('content');

    let windowOpenCalled = false;
    jest.spyOn(utils.mockWindow, 'open').mockImplementation(
      (url: string, name: string, specs: string): Window => {
        expect(url).toEqual('https://someurl/');
        expect(name).toEqual('_blank');
        expect(specs.indexOf('width=100')).not.toBe(-1);
        expect(specs.indexOf('height=200')).not.toBe(-1);
        windowOpenCalled = true;
        return utils.childWindow as Window;
      },
    );

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);
  });

  it('should successfully pop up the auth window when authenticate called without authenticationParams for connectors', () => {
    return utils.initializeWithContext('content').then(() => {
      let windowOpenCalled = false;
      jest.spyOn(utils.mockWindow, 'open').mockImplementation(
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
      authentication.registerAuthenticationHandlers(authenticationParams);
      authentication.authenticate();
      expect(windowOpenCalled).toBe(true);
    });
  });

  it('should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called in legacy flow', done => {
    utils.initializeWithContext('content').then(() => {
      let windowOpenCalled = false;
      jest.spyOn(utils.mockWindow, 'open').mockImplementation(
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
        successCallback: (result: string) => {
          expect(true).toBe(false);
          done();
        },
        failureCallback: (reason: string) => {
          expect(reason).toEqual('CancelledByUser');
          done();
        },
      };
      authentication.authenticate(authenticationParams);
      expect(windowOpenCalled).toBe(true);

      utils.childWindow.closed = true;
    });
  });

  it('should cancel the flow when the auth window gets closed before notifySuccess/notifyFailure are called', async () => {
    await utils.initializeWithContext('content');

    let windowOpenCalled = false;
    jest.spyOn(utils.mockWindow, 'open').mockImplementation(
      (url: string, name: string, specs: string): Window => {
        expect(url).toEqual('https://someurl/');
        expect(name).toEqual('_blank');
        expect(specs.indexOf('width=100')).not.toBe(-1);
        expect(specs.indexOf('height=200')).not.toBe(-1);
        windowOpenCalled = true;
        return utils.childWindow as Window;
      },
    );

    const authenticationParams: authentication.AuthenticatePopUpParameters = {
      url: 'https://someurl/',
      width: 100,
      height: 200,
    };
    const promise = authentication.authenticate(authenticationParams);
    expect(windowOpenCalled).toBe(true);

    utils.childWindow.closed = true;
    return expect(promise).rejects.toThrowError('CancelledByUser');
  });

  it('should successfully handle auth success in legacy flow', done => {
    utils.initializeWithContext('content').then(() => {
      const authenticationParams = {
        url: 'https://someurl/',
        width: 100,
        height: 200,
        successCallback: (result: string) => {
          expect(result).toEqual('someResult');
          done();
        },
        failureCallback: (reason: string) => {
          expect(true).toBe(false);
          done();
        },
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
    });
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

  it('should successfully handle auth failure in legacy flow', done => {
    utils.initializeWithContext('content').then(() => {
      const authenticationParams = {
        url: 'https://someurl/',
        width: 100,
        height: 200,
        successCallback: (result: string) => {
          expect(true).toBe(false);
          done();
        },
        failureCallback: (reason: string) => {
          expect(reason).toEqual('someReason');
          done();
        },
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
    });
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
    it(`should successfully pop up the auth window in the ${hostClientType} client in legacy flow`, () => {
      return utils.initializeWithContext('content', hostClientType).then(() => {
        const authenticationParams = {
          url: 'https://someUrl',
          width: 100,
          height: 200,
          isExternal: true,
        };
        authentication.authenticate(authenticationParams);

        const message = utils.findMessageByFunc('authentication.authenticate');
        expect(message).not.toBeNull();
        expect(message.args.length).toBe(4);
        expect(message.args[0]).toBe(authenticationParams.url.toLowerCase() + '/');
        expect(message.args[1]).toBe(authenticationParams.width);
        expect(message.args[2]).toBe(authenticationParams.height);
        expect(message.args[3]).toBe(authenticationParams.isExternal);
      });
    });

    it(`it should successfully handle auth success in the ${hostClientType} client in legacy flow`, done => {
      utils.initializeWithContext('content', hostClientType).then(() => {
        const authenticationParams = {
          url: 'https://someUrl',
          width: 100,
          height: 200,
          successCallback: (result: string) => {
            expect(result).toEqual('someResult');
            done();
          },
          failureCallback: (reason: string) => {
            expect(true).toBe(false);
            done();
          },
        };
        authentication.authenticate(authenticationParams);

        const message = utils.findMessageByFunc('authentication.authenticate');
        expect(message).not.toBeNull();
        utils.respondToMessage(message, true, 'someResult');
      });
    });

    it(`should successfully handle auth failure in the ${hostClientType} client in legacy flow`, done => {
      utils.initializeWithContext('content', hostClientType).then(() => {
        const authenticationParams = {
          url: 'https://someUrl',
          width: 100,
          height: 200,
          successCallback: (result: string) => {
            expect(true).toBe(false);
            done();
          },
          failureCallback: (reason: string) => {
            expect(reason).toEqual('someReason');
            done();
          },
        };
        authentication.authenticate(authenticationParams);

        const message = utils.findMessageByFunc('authentication.authenticate');
        expect(message).not.toBeNull();

        utils.respondToMessage(message, false, 'someReason');
      });
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
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
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure('', 'https%3A%2F%2Fsomeinvalidurl.com%3FcallbackUrl%3Dtest%23%2Fconfiguration');
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('');
  });

  it('should successfully notify auth failure if callbackUrl and reason are empty', async () => {
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure('', '');
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('');
  });

  it('should successfully notify auth failure if callbackUrl is empty', async () => {
    jest.spyOn(utils.mockWindow.location, 'assign').mockImplementation((url: string): void => {
      expect(url).toEqual('');
    });

    await utils.initializeWithContext('authentication');

    authentication.notifyFailure('someReason', '');
    const message = utils.findMessageByFunc('authentication.authenticate.failure');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe('someReason');
  });

  it('should not close auth window before notify success message has been sent', async () => {
    const closeWindowSpy = jest.spyOn(utils.mockWindow, 'close');

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
    const closeWindowSpy = jest.spyOn(utils.mockWindow, 'close');

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
    const authTokenRequest = {
      resources: ['https://someresource/'],
      claims: ['some_claim'],
      silent: false,
    };

    return expect(() => authentication.getAuthToken(authTokenRequest)).toThrowError(
      'The library has not yet been initialized',
    );
  });

  it('should successfully return getAuthToken in case of success in legacy flow', done => {
    utils.initializeWithContext('content').then(() => {
      const authTokenRequest = {
        resources: ['https://someresource/'],
        claims: ['some_claim'],
        silent: false,
        failureCallback: () => {
          expect(true).toBe(false);
          done();
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
  });

  it('should successfully return error from getAuthToken in case of failure in legacy flow', done => {
    utils.initializeWithContext('content').then(() => {
      const authTokenRequest = {
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

  it('should successfully return getAuthToken in case of success', async () => {
    await utils.initializeWithContext('content');

    const authTokenRequest = {
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

  it('should successfully return getAuthToken in case of success when using no authTokenRequest', async () => {
    await utils.initializeWithContext('content');

    const promise = authentication.getAuthToken();

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(undefined);
    expect(message.args[1]).toEqual(undefined);
    expect(message.args[2]).toEqual(undefined);

    utils.respondToMessage(message, true, 'token');
    return expect(promise).resolves.toEqual('token');
  });

  it('should successfully return error from getAuthToken in case of failure', async () => {
    await utils.initializeWithContext('content');

    const authTokenRequest: authentication.AuthTokenRequestParameters = {
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

  it('should successfully return error from getAuthToken in case of failure when using no authTokenRequest', async () => {
    await utils.initializeWithContext('content');

    const promise = authentication.getAuthToken();

    const message = utils.findMessageByFunc('authentication.getAuthToken');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(3);
    expect(message.args[0]).toEqual(undefined);
    expect(message.args[1]).toEqual(undefined);
    expect(message.args[2]).toEqual(undefined);

    utils.respondToMessage(message, false, 'error');
    return expect(promise).rejects.toThrowError('error');
  });
});
