import { Context } from '../../src/public/interfaces';
import { TeamType, UserTeamRole, HostClientType } from '../../src/public/constants';
import { core } from '../../src/public/publicAPIs';
import { pages } from '../../src/public/pages';
import { FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';
import { version } from '../../src/internal/constants';
import { runtime, teamsRuntimeConfig } from '../../src/public/runtime';
import { GlobalVars } from '../../src/internal/globalVars';

describe('teamsjsAppSDK-publicAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    core._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (core._uninitialize) {
      core._uninitialize();
    }
  });

  it('should not allow calls before initialization', () => {
    expect(() =>
      core.getContext(() => {
        return;
      }),
    ).toThrowError('The library has not yet been initialized');
  });

  it('should successfully initialize', () => {
    core.initialize();

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
      core.initialize();
    }

    // Still only one message actually sent, the extra calls just no-op'ed
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);
  });

  it('should invoke all callbacks once initialization completes', () => {
    let firstCallbackInvoked = false;
    core.initialize(() => {
      firstCallbackInvoked = true;
    });

    let secondCallbackInvoked = false;
    core.initialize(() => {
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

  it('should invoke callback immediately if initialization has already completed', () => {
    core.initialize();

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');

    let callbackInvoked = false;
    core.initialize(() => {
      callbackInvoked = true;
    });

    expect(callbackInvoked).toBe(true);
  });

  it('should use teams runtime config if no runtime config is given', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0');

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should successfully register a change settings handler', () => {
    utils.initializeWithContext('content');
    let handlerCalled = false;

    pages.config.registerChangeConfigHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('changeSettings', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('should use teams runtime config if an empty runtime config is given', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '', '1.6.0');

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should use teams runtime config if a JSON parsing error is thrown by a given runtime config', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, 'nonJSONStr', '1.6.0');

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should throw an error if the given runtime config causes a non parsing related error', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    expect(utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, null)).toThrowError;
  });

  it('should not use the teams config as a default if another proper config is given', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(
      initMessage,
      FrameContexts.content,
      HostClientType.web,
      '{"apiVersion":1, "supports":{"mail":{}}}',
    );

    expect(runtime).not.toEqual(teamsRuntimeConfig);
    expect(runtime).toEqual({ apiVersion: 1, supports: { mail: {} } });
  });

  it('should assign clientSupportedSDKVersion correctly when a proper runtime config is given', () => {
    core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(
      initMessage,
      FrameContexts.content,
      HostClientType.web,
      '{"apiVersion":1, "supports":{"mail":{}}}',
      '1.0.0',
    );

    expect(runtime).toEqual({ apiVersion: 1, supports: { mail: {} } });
    expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
  });

  it('should successfully register a theme change handler', () => {
    utils.initializeWithContext('content');

    let newTheme: string;
    core.registerOnThemeChangeHandler(theme => {
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
    pages.backStack.registerBackButtonHandler(() => {
      handlerInvoked = true;
      return true;
    });

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it('should successfully get context', () => {
    utils.initializeWithContext('content');

    let actualContext: Context;
    core.getContext(context => {
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
      meetingId: 'dummyMeetingId',
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
    core.getContext(context => {
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
    core.getContext(context => {
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
    core.getContext(context => {
      actualContext = context;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});

    expect(actualContext.frameContext).toBe(FrameContexts.sidePanel);
  });

  describe('navigateCrossDomain', () => {
    it('should not allow calls before initialization', () => {
      expect(() => pages.navigateCrossDomain('https://valid.origin.com')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => pages.navigateCrossDomain('https://valid.origin.com')).toThrowError(
        "This call is not allowed in the 'authentication' context",
      );
    });

    it('should allow calls from content context', () => {
      utils.initializeWithContext('content');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from task context', () => {
      utils.initializeWithContext('task');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from stage context', () => {
      utils.initializeWithContext('stage');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should successfully navigate cross-origin', () => {
      utils.initializeWithContext('content');

      pages.navigateCrossDomain('https://valid.origin.com');

      let navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', () => {
      utils.initializeWithContext('settings');

      pages.navigateCrossDomain('https://invalid.origin.com');

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

  describe('executeDeepLink in content context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        core.executeDeepLink('dummyLink', () => {
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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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
        core.executeDeepLink('dummyLink', () => {
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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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
        core.executeDeepLink('dummyLink', () => {
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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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
      core.executeDeepLink(request, onComplete);

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

  describe('returnFocus', () => {
    it('should successfully returnFocus', () => {
      utils.initializeWithContext('content');

      pages.returnFocus(true);

      let returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
});
