import { Context, ContextBridge, FileOpenPreference } from '../../src/public/interfaces';
import { TeamType, UserTeamRole, HostClientType, ChannelType, HostName } from '../../src/public/constants';
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
    return expect(core.getContext()).rejects.toThrowError('The library has not yet been initialized');
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
    utils.initializeAsFrameless(['https://www.example.com']);

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

  it('should invoke all callbacks once initialization completes', async () => {
    let firstCallbackInvoked = false;
    core.initialize().then(() => {
      firstCallbackInvoked = true;
    });

    let secondCallbackInvoked = false;
    const initPromise = core.initialize().then(() => {
      secondCallbackInvoked = true;
    });

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    expect(firstCallbackInvoked).toBe(false);
    expect(secondCallbackInvoked).toBe(false);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');
    await initPromise;

    expect(firstCallbackInvoked).toBe(true);
    expect(secondCallbackInvoked).toBe(true);
  });

  it('should invoke callback immediately if initialization has already completed', async () => {
    const initPromise = core.initialize();

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');
    await initPromise;

    let callbackInvoked = false;
    await core.initialize().then(() => {
      callbackInvoked = true;
    });

    expect(callbackInvoked).toBe(true);
  });

  it('should use teams runtime config if no runtime config is given', async () => {
    const initPromise = core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0');
    await initPromise;

    expect(runtime).toEqual(teamsRuntimeConfig);
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

  it('should not use the teams config as a default if another proper config is given', async () => {
    const initPromise = core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(
      initMessage,
      FrameContexts.content,
      HostClientType.web,
      '{"apiVersion":1, "supports":{"mail":{}}}',
    );
    await initPromise;

    expect(runtime).not.toEqual(teamsRuntimeConfig);
    expect(runtime).toEqual({ apiVersion: 1, supports: { mail: {} } });
  });

  it('should assign clientSupportedSDKVersion correctly when a proper runtime config is given', async () => {
    const initPromise = core.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(
      initMessage,
      FrameContexts.content,
      HostClientType.web,
      '{"apiVersion":1, "supports":{"mail":{}}}',
      '1.0.0',
    );
    await initPromise;

    expect(runtime).toEqual({ apiVersion: 1, supports: { mail: {} } });
    expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
  });

  it('should successfully register a theme change handler', async () => {
    await utils.initializeWithContext('content');

    let newTheme: string;
    core.registerOnThemeChangeHandler(theme => {
      newTheme = theme;
    });

    utils.sendMessage('themeChange', 'someTheme');

    expect(newTheme).toBe('someTheme');
  });

  it('should call navigateBack automatically when no back button handler is registered', async () => {
    await utils.initializeWithContext('content');

    utils.sendMessage('backButtonPress');

    let navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
  });

  it('should successfully get context', async () => {
    await utils.initializeWithContext('content');

    const contextPromise = core.getContext();

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    let contextBridge: ContextBridge = {
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
      appIconPosition: 5,
      channelType: ChannelType.Shared,
      defaultOneNoteSectionId: 'someDefaultOneNoteSectionId',
      hostName: HostName.orange,
      hostTeamGroupId: 'someHostGroupId',
      hostTeamTenantId: 'someHostTenantId',
      isCallingAllowed: true,
      sourceOrigin: 'www.origin.com',
      teamTemplateId: 'someTeamTemplateId',
      userClickTime: 2222,
      userFileOpenPreference: FileOpenPreference.Inline,
      isMultiWindow: true,
      frameContext: FrameContexts.content,
      userDisplayName: 'someTestUser',
    };

    const expectedContext: Context = {
      app: {
        iconPositionVertical: 5,
        locale: 'someLocale',
        parentMessageId: 'someParentMessageId',
        sessionId: 'appSessionId',
        theme: 'someTheme',
        userClickTime: 2222,
        userFileOpenPreference: FileOpenPreference.Inline,
        host: {
          name: HostName.orange,
          clientType: HostClientType.web,

          ringId: 'someRingId',
          sessionId: 'someSessionId',
        },
      },
      page: {
        id: 'someEntityId',
        subPageId: 'someSubEntityId',
        isFullScreen: true,
        sourceOrigin: 'www.origin.com',
        frameContext: FrameContexts.content,
        isMultiWindow: true,
      },
      user: {
        id: 'someUserObjectId',
        displayName: 'someTestUser',
        isCallingAllowed: true,
        licenseType: 'someUserLicenseType',
        loginHint: 'someLoginHint',
        userPrincipalName: 'someUserPrincipalName',
        tenant: {
          id: 'someTid',
          sku: 'someTenantSKU',
        },
      },
      channel: {
        id: 'someChannelId',
        displayName: 'someChannelName',
        relativeUrl: 'someChannelRelativeUrl',
        membershipType: ChannelType.Shared,
        defaultOneNoteSectionId: 'someDefaultOneNoteSectionId',
        ownerTenantId: 'someHostTenantId',
        ownerGroupId: 'someHostGroupId',
      },
      chat: {
        id: 'someChatId',
      },
      meeting: {
        id: 'dummyMeetingId',
      },
      sharepoint: {},
      team: {
        internalId: 'someTeamId',
        displayName: 'someTeamName',
        type: TeamType.Staff,
        groupId: 'someGroupId',
        templateId: 'someTeamTemplateId',
        isArchived: false,
        userRole: UserTeamRole.Admin,
      },
      sharePointSite: {
        url: 'someSiteUrl',
        domain: 'someTeamSiteDomain',
        path: 'someTeamSitePath',
      },
    };

    //insert expected time comparison here?
    utils.respondToMessage(getContextMessage, contextBridge);
    const actualContext = await contextPromise;

    expect(actualContext).toEqual(expectedContext);
    expect(actualContext.page.frameContext).toBe(FrameContexts.content);
    expect(actualContext.meeting.id).toBe('dummyMeetingId');
  });

  it('should successfully get frame context in side panel', async () => {
    await utils.initializeWithContext(FrameContexts.sidePanel);

    const contextPromise = core.getContext();

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context when returned from client', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    const contextPromise = core.getContext();

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, { frameContext: FrameContexts.sidePanel });
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context in side panel with fallback logic if not returned from client', async () => {
    await utils.initializeWithContext(FrameContexts.sidePanel);

    const contextPromise = core.getContext();

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  describe('navigateCrossDomain', () => {
    it('should not allow calls before initialization', () => {
      return expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      return expect(pages.navigateCrossDomain('https://valid.origin.com')).rejects.toThrowError(
        "This call is not allowed in the 'authentication' context",
      );
    });

    it('should allow calls from content context', async () => {
      await utils.initializeWithContext('content');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      pages.navigateCrossDomain('https://valid.origin.com');
    });

    it('should successfully navigate cross-origin', async () => {
      await utils.initializeWithContext('content');

      pages.navigateCrossDomain('https://valid.origin.com');

      let navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', async () => {
      await utils.initializeWithContext('settings');

      const promise = pages.navigateCrossDomain('https://invalid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

      utils.respondToMessage(navigateCrossDomainMessage, false);

      return expect(promise).rejects.toThrowError();
    });
  });

  describe('executeDeepLink in content context ', () => {
    it('should not allow calls before initialization', () => {
      return expect(core.executeDeepLink('dummyLink')).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });

    it('should invoke error callback', async () => {
      await utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).rejects.toThrowError('Something went wrong...');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });
  });

  describe('executeDeepLink in sidePanel context ', () => {
    it('should not allow calls before initialization', () => {
      return expect(core.executeDeepLink('dummyLink')).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });

    it('should invoke error callback', async () => {
      await utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).rejects.toThrowError('Something went wrong...');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext('sidePanel');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });
  });

  describe('executeDeepLink in task module context ', () => {
    it('should not allow calls before initialization', () => {
      return expect(core.executeDeepLink('dummyLink')).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext(FrameContexts.task);
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });

    it('should invoke error callback', async () => {
      await utils.initializeWithContext(FrameContexts.task);
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).rejects.toThrowError('Something went wrong...');
    });

    it('should successfully send a request', async () => {
      await utils.initializeWithContext('content');
      const request = 'dummyDeepLink';

      let requestResponse: boolean;
      let error: string;

      // send message request
      const promise = core.executeDeepLink(request);

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
      return expect(promise).resolves;
    });
  });

  describe('returnFocus', () => {
    it('should successfully returnFocus', async () => {
      await utils.initializeWithContext('content');

      pages.returnFocus(true);

      let returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
});
