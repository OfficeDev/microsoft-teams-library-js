import * as microsoftTeams from '../../src/public/publicAPIs';
import { TabInstanceParameters, Context, FrameContext } from '../../src/public/interfaces';
import { TeamType, UserTeamRole, HostClientType } from '../../src/public/constants';
import {
  executeDeepLink,
  getTabInstances,
  getMruTabInstances,
  shareDeepLink,
  registerOnLoadHandler,
  registerBeforeUnloadHandler,
  enablePrintCapability,
  registerEnterSettingsHandler,
  getContext,
  _initialize,
  _uninitialize,
  registerBackButtonHandler,
  registerFocusEnterHandler,
  registerOnThemeChangeHandler,
  initialize,
  setFrameContext,
  initializeWithFrameContext,
  registerAppButtonClickHandler,
  registerAppButtonHoverEnterHandler,
  registerAppButtonHoverLeaveHandler
} from '../../src/public/publicAPIs';
import { returnFocus, navigateCrossDomain } from '../../src/public/navigation';
import { FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';
import { version } from '../../src/internal/constants';

describe('MicrosoftTeams-publicAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  it('should not allow calls before initialization', () => {
    expect(() =>
      getContext(() => {
        return;
      }),
    ).toThrowError('The library has not yet been initialized');
  });

  it('should successfully initialize', () => {
    initialize();

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(initMessage.id).toBe(0);
    expect(initMessage.func).toBe('initialize');
    expect(initMessage.args.length).toEqual(1);
    expect(initMessage.args[0]).toEqual(version);
    expect(initMessage.timestamp).not.toBeNull();
  });

  it('should listen to frame messages for a frameless window', () => {
    utils.initializeAsFrameless(null, ['https://www.example.com']);

    expect(utils.processMessage).not.toBeNull();
    expect(utils.messages.length).toBe(1);
  });

  it('should not listen to frame messages for a frameless window if valid origins are not passed', () => {
    utils.initializeAsFrameless();

    expect(utils.processMessage).toBeNull();
    expect(utils.messages.length).toBe(1);
  });

  it('should allow multiple initialize calls', () => {
    for (let i = 0; i < 100; i++) {
      initialize();
    }

    // Still only one message actually sent, the extra calls just no-op'ed
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);
  });

  it('should invoke all callbacks once initialization completes', () => {
    let firstCallbackInvoked: boolean = false;
    initialize(() => {
      firstCallbackInvoked = true;
    });

    let secondCallbackInvoked: boolean = false;
    initialize(() => {
      secondCallbackInvoked = true;
    });

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    expect(firstCallbackInvoked).toBe(false);
    expect(secondCallbackInvoked).toBe(false);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');

    expect(firstCallbackInvoked).toBe(true);
    expect(secondCallbackInvoked).toBe(true);
  });

  it('should invoke callback immediatelly if initialization has already completed', () => {
    initialize();
    
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');

    let callbackInvoked: boolean = false;
    initialize(() => {
      callbackInvoked = true;
    });

    expect(callbackInvoked).toBe(true);
  });

  it('should successfully register a change settings handler', () => {
    utils.initializeWithContext('content');
    let handlerCalled = false;

    registerEnterSettingsHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('changeSettings', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button click handler', () => {
    utils.initializeWithContext('content');
    let handlerCalled = false;

    registerAppButtonClickHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonClick', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button hover enter handler', () => {
    utils.initializeWithContext('content');
    let handlerCalled = false;

    registerAppButtonHoverEnterHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverEnter', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a app button hover leave handler', () => {
    utils.initializeWithContext('content');
    let handlerCalled = false;

    registerAppButtonHoverLeaveHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverLeave', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should successfully register a theme change handler', () => {
    utils.initializeWithContext('content');

    let newTheme: string;
    registerOnThemeChangeHandler(theme => {
      newTheme = theme;
    });

    utils.sendMessage('themeChange', 'someTheme');

    expect(newTheme).toBe('someTheme');
  });

  it('should call navigateBack automatically when no back button handler is registered', () => {
    utils.initializeWithContext('content');

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
  });

  it('should successfully register a back button handler and not call navigateBack if it returns true', () => {
    utils.initializeWithContext('content');

    let handlerInvoked = false;
    registerBackButtonHandler(() => {
      handlerInvoked = true;
      return true;
    });

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it('should successfully register a focus enter handler and return true', () => {
    utils.initializeWithContext('content');

    let handlerInvoked = false;
    registerFocusEnterHandler(() => {
      handlerInvoked = true;
    });

    utils.sendMessage('focusEnter');
    expect(handlerInvoked).toBe(true);
  });

  it('should successfully get context', () => {
    utils.initializeWithContext('content');

    let actualContext: Context;
    getContext(context => {
      actualContext = context;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    let expectedContext: Context = {
      groupId: 'someGroupId',
      teamId: 'someTeamId',
      teamName: 'someTeamName',
      channelId: 'someChannelId',
      channelName: 'someChannelName',
      entityId: 'someEntityId',
      subEntityId: 'someSubEntityId',
      locale: 'someLocale',
      upn: 'someUpn',
      tid: 'someTid',
      theme: 'someTheme',
      isFullScreen: true,
      teamType: TeamType.Staff,
      teamSiteUrl: 'someSiteUrl',
      teamSiteDomain: 'someTeamSiteDomain',
      teamSitePath: 'someTeamSitePath',
      channelRelativeUrl: 'someChannelRelativeUrl',
      sessionId: 'someSessionId',
      userTeamRole: UserTeamRole.Admin,
      chatId: 'someChatId',
      loginHint: 'someLoginHint',
      userPrincipalName: 'someUserPrincipalName',
      userObjectId: 'someUserObjectId',
      isTeamArchived: false,
      hostClientType: HostClientType.web,
      sharepoint: {},
      tenantSKU: 'someTenantSKU',
      userLicenseType: 'someUserLicenseType',
      parentMessageId: 'someParentMessageId',
      ringId: 'someRingId',
      appSessionId: 'appSessionId',
      appLaunchId: 'appLaunchId',
      meetingId: 'dummyMeetingId'
    };
    //insert expected time comparison here?
    utils.respondToMessage(getContextMessage, expectedContext);

    expect(actualContext).toBe(expectedContext);
    expect(actualContext.frameContext).toBe(FrameContexts.content);
    expect(actualContext.meetingId).toBe('dummyMeetingId');
  });

  it('should successfully get frame context in side panel', () => {
    utils.initializeWithContext(FrameContexts.sidePanel);

    let actualContext: Context;
    getContext(context => {
      actualContext = context;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});

    expect(actualContext.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context when returned from client', () => {
    utils.initializeWithContext(FrameContexts.content);

    let actualContext: Context;
    getContext(context => {
      actualContext = context;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, { frameContext: FrameContexts.sidePanel });

    expect(actualContext.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context in side panel with fallback logic if not returned from client', () => {
    utils.initializeWithContext(FrameContexts.sidePanel);

    let actualContext: Context;
    getContext(context => {
      actualContext = context;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});

    expect(actualContext.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully register a back button handler and call navigateBack if it returns false', () => {
    utils.initializeWithContext('content');

    let handlerInvoked = false;
    registerBackButtonHandler(() => {
      handlerInvoked = true;
      return false;
    });

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  describe('navigateCrossDomain', () => {
    it('should not allow calls before initialization', () => {
      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
        "This call is not allowed in the 'authentication' context",
      );
    });

    it('should allow calls from content context', () => {
      utils.initializeWithContext('content');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from task context', () => {
      utils.initializeWithContext('task');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from stage context', () => {
      utils.initializeWithContext('stage');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should successfully navigate cross-origin', () => {
      utils.initializeWithContext('content');

      navigateCrossDomain('https://valid.origin.com');

      let navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', () => {
      utils.initializeWithContext('settings');

      navigateCrossDomain('https://invalid.origin.com');

      let navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

      let respondWithFailure = () => {
        utils.respondToMessage(navigateCrossDomainMessage, false);
      };

      expect(respondWithFailure).toThrow();
    });
  });

  describe('getTabInstances', () => {
    it('should allow a missing and valid optional parameter', () => {
      utils.initializeWithContext('content');

      getTabInstances(tabInfo => tabInfo);
      getTabInstances(tabInfo => tabInfo, {} as TabInstanceParameters);
    });
  });

  describe('getMruTabInstances', () => {
    it('should allow a missing and valid optional parameter', () => {
      utils.initializeWithContext('content');

      getMruTabInstances(tabInfo => tabInfo);
      getMruTabInstances(tabInfo => tabInfo, {} as TabInstanceParameters);
    });
  });

  describe('executeDeepLink in content context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };

      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });

    it('should invoke error callback', () => {
      utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: false,
        error: 'Something went wrong...',
      };
      utils.respondToMessage(message, data.success, data.error);

      // check data is returned properly
      expect(requestResponse).toBe(false);
      expect(error).toBe('Something went wrong...');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };
      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });
  });

  describe('executeDeepLink in sidePanel context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };

      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });

    it('should invoke error callback', () => {
      utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: false,
        error: 'Something went wrong...',
      };
      utils.respondToMessage(message, data.success, data.error);

      // check data is returned properly
      expect(requestResponse).toBe(false);
      expect(error).toBe('Something went wrong...');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };
      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });
  });

  describe('executeDeepLink in task module context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext(FrameContexts.task);
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };

      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });

    it('should invoke error callback', () => {
      utils.initializeWithContext(FrameContexts.task);
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: false,
        error: 'Something went wrong...',
      };

      utils.respondToMessage(message, data.success, data.error);

      // check data is returned properly
      expect(requestResponse).toBe(false);
      expect(error).toBe('Something went wrong...');
    });

    it('should successfully send a request', () => {
      utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      const onComplete = (status: boolean, reason?: string) => ((requestResponse = status), (error = reason));

      // send message request
      executeDeepLink(request, onComplete);

      // find message request in jest
      const message = utils.findMessageByFunc('executeDeepLink');

      // check message is sending correct data
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(request);

      // simulate response
      const data = {
        success: true,
      };

      utils.respondToMessage(message, data.success);

      // check data is returned properly
      expect(requestResponse).toBe(true);
      expect(error).toBeUndefined();
    });
  });

  it("Ctrl+P shouldn't call print handler if printCapabilty is disabled", () => {
    let handlerCalled = false;
    initialize();
    spyOn(microsoftTeams, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it("Cmd+P shouldn't call print handler if printCapabilty is disabled", () => {
    let handlerCalled = false;
    initialize();
    spyOn(microsoftTeams, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it('print handler should successfully call default print handler', () => {
    let handlerCalled = false;
    initialize();
    enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });

    print();

    expect(handlerCalled).toBeTruthy();
  });

  it('Ctrl+P should successfully call print handler', () => {
    let handlerCalled = false;
    initialize();
    enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeTruthy();
  });

  it('Cmd+P should successfully call print handler', () => {
    let handlerCalled = false;
    initialize();
    enablePrintCapability();
    spyOn(window, 'print').and.callFake((): void => {
      handlerCalled = true;
    });
    let printEvent = new Event('keydown');
    // tslint:disable:no-any
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;
    // tslint:enable:no-any

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBe(true);
  });

  describe("registerOnLoadHandler", () => {
    it("should not allow calls before initialization", () => {
      expect(() =>
        registerOnLoadHandler(() => {
          return false;
        })
      ).toThrowError("The library has not yet been initialized");
    });
    it("should successfully register handler", () => {
      utils.initializeWithContext("content");

      let handlerInvoked = false;
      registerOnLoadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage("load");

      expect(handlerInvoked).toBe(true);
    });
  });

  describe('registerBeforeUnloadHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        registerBeforeUnloadHandler(() => {
          return false;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully register a before unload handler', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      registerBeforeUnloadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage('beforeUnload');

      expect(handlerInvoked).toBe(true);
    });

    it('should call readyToUnload automatically when no before unload handler is registered', () => {
      utils.initializeWithContext('content');

      utils.sendMessage('beforeUnload');

      let readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).not.toBeNull();
    });

    it('should successfully share a deep link in content context', () => {
      utils.initializeWithContext('content');

      shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      let message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully share a deep link in sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      let message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully register a before unload handler and not call readyToUnload if it returns true', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let readyToUnloadFunc: () => void;
      registerBeforeUnloadHandler(readyToUnload => {
        readyToUnloadFunc = readyToUnload;
        handlerInvoked = true;
        return true;
      });

      utils.sendMessage('beforeUnload');

      let readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).toBeNull();
      expect(handlerInvoked).toBe(true);

      readyToUnloadFunc();
      readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).not.toBeNull();
    });
  });

  describe('returnFocus', () => {
    it('should successfully returnFocus', () => {
      utils.initializeWithContext('content');

      returnFocus(true);

      let returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });

  it('should successfully frame context', () => {
    utils.initializeWithContext('content');

    let frameContext: FrameContext = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    setFrameContext(frameContext);

    let message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });

  it('should successfully initialize and set the frame context', () => {
    let frameContext: FrameContext = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    utils.initializeWithContext('content');
    initializeWithFrameContext(frameContext);
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(2);

    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(initMessage.id).toBe(0);
    expect(initMessage.func).toBe('initialize');
    expect(initMessage.args.length).toEqual(1);
    expect(initMessage.args[0]).toEqual(version);
    let message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });
});
