import { version } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { app } from '../../src/public/app';
import { ChannelType, HostClientType, HostName, TeamType, UserTeamRole } from '../../src/public/constants';
import { FrameContexts } from '../../src/public/constants';
import { Context, FileOpenPreference } from '../../src/public/interfaces';
import { pages } from '../../src/public/pages';
import { runtime, teamsRuntimeConfig } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('AppSDK-app', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  const mockErrorMessage = 'Something went wrong...';

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  it('should not allow calls before initialization', async () => {
    expect.assertions(1);
    await app.getContext().catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
  });

  it('should successfully initialize', () => {
    app.initialize();

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
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
      app.initialize();
    }

    // Still only one message actually sent, the extra calls just no-op'ed
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);
  });

  it('should invoke all callbacks once initialization completes', async () => {
    let firstCallbackInvoked = false;
    app.initialize().then(() => {
      firstCallbackInvoked = true;
    });

    let secondCallbackInvoked = false;
    const initPromise = app.initialize().then(() => {
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
    const initPromise = app.initialize();

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');
    await initPromise;

    let callbackInvoked = false;
    await app.initialize().then(() => {
      callbackInvoked = true;
    });

    expect(callbackInvoked).toBe(true);
  });

  it('should use teams runtime config if no runtime config is given', async () => {
    const initPromise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0');
    await initPromise;

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should use teams runtime config if an empty runtime config is given', async () => {
    const initPromise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '', '1.6.0');
    await initPromise;

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should use teams runtime config if a JSON parsing error is thrown by a given runtime config', async () => {
    const initPromise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, 'nonJSONStr', '1.6.0');
    await initPromise;

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should throw an error if the given runtime config causes a non parsing related error', async () => {
    expect.assertions(1);
    const promise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, null);

    await promise.catch(e => expect(e).toMatchObject(new TypeError("Cannot read property 'apiVersion' of null")));
  });

  it('should not use the teams config as a default if another proper config is given', async () => {
    const initPromise = app.initialize();

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
    const initPromise = app.initialize();

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

  it('should initialize with clientSupportedSDKVersion and runtimeConfig arguments flipped', async () => {
    const initPromise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(
      initMessage,
      FrameContexts.content,
      HostClientType.web,
      '1.0.0',
      '{"apiVersion":1, "supports":{"mail":{}}}',
    );
    await initPromise;

    expect(runtime).toEqual({ apiVersion: 1, supports: { mail: {} } });
    expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
  });

  it('should initialize with teams config when an invalid runtimeConfig is given, with arguments flipped', async () => {
    const initPromise = app.initialize();

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0', 'nonJSONStr');
    await initPromise;

    expect(runtime).toEqual(teamsRuntimeConfig);
  });

  it('should successfully register a theme change handler', async () => {
    await utils.initializeWithContext('content');

    let newTheme: string;
    app.registerOnThemeChangeHandler(theme => {
      newTheme = theme;
    });

    utils.sendMessage('themeChange', 'someTheme');

    expect(newTheme).toBe('someTheme');
  });

  it('should call navigateBack automatically when no back button handler is registered', async () => {
    await utils.initializeWithContext('content');

    utils.sendMessage('backButtonPress');

    const navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
  });

  it('should successfully get context', async () => {
    await utils.initializeWithContext('content');

    const contextPromise = app.getContext();

    const getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    const contextBridge: Context = {
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
      appLaunchId: 'appLaunchId',
      userDisplayName: 'someTestUser',
      teamSiteId: 'someSiteId',
    };

    const expectedContext: app.Context = {
      app: {
        iconPositionVertical: 5,
        locale: 'someLocale',
        parentMessageId: 'someParentMessageId',
        sessionId: 'appSessionId',
        theme: 'someTheme',
        userClickTime: 2222,
        userFileOpenPreference: FileOpenPreference.Inline,
        appLaunchId: 'appLaunchId',
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
          teamsSku: 'someTenantSKU',
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
        id: 'someSiteId',
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

    const contextPromise = app.getContext();

    const getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context when returned from client', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    const contextPromise = app.getContext();

    const getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, { frameContext: FrameContexts.sidePanel });
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  it('should successfully get frame context in side panel with fallback logic if not returned from client', async () => {
    await utils.initializeWithContext(FrameContexts.sidePanel);

    const contextPromise = app.getContext();

    const getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    utils.respondToMessage(getContextMessage, {});
    const actualContext = await contextPromise;

    expect(actualContext.page.frameContext).toBe(FrameContexts.sidePanel);
  });

  describe('navigateCrossDomain', () => {
    const unallowedContexts = [FrameContexts.authentication];

    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.meetingStage,
      FrameContexts.remove,
      FrameContexts.settings,
      FrameContexts.sidePanel,
      FrameContexts.stage,
      FrameContexts.task,
    ];

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://valid.origin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with a bad origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://badorigin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an empty origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with a blank origin', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain(' ')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin without base', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('blahblah')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin without suffix', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('https://blahblah')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    it('should not allow calls with an origin with invalid base', async () => {
      expect.assertions(1);
      await pages
        .navigateCrossDomain('blah://valid.origin.com')
        .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
    });

    for (const context in unallowedContexts) {
      it(`should not allow calls from ${unallowedContexts[context]} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(unallowedContexts[context]);

        await pages
          .navigateCrossDomain('https://valid.origin.com')
          .catch(e =>
            expect(e).toMatchObject(
              new Error(
                `This call is only allowed in following contexts: ["content","sidePanel","settings","remove","task","stage","meetingStage"]. Current context: "${unallowedContexts[context]}".`,
              ),
            ),
          );
      });
    }

    for (const context in allowedContexts) {
      it(`should allow calls from ${allowedContexts[context]} context`, async () => {
        expect.assertions(1);
        await utils.initializeWithContext(allowedContexts[context]);

        const promise = pages.navigateCrossDomain('https://valid.origin.com');
        const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
        utils.respondToMessage(navigateCrossDomainMessage, true);

        await expect(promise).resolves.not.toThrow();
      });
    }

    it('should successfully navigate cross-origin', async () => {
      await utils.initializeWithContext('content');

      pages.navigateCrossDomain('https://valid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', async () => {
      expect.assertions(4);
      await utils.initializeWithContext('settings');

      const promise = pages.navigateCrossDomain('https://invalid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

      utils.respondToMessage(navigateCrossDomainMessage, false);

      await promise.catch(e =>
        expect(e).toMatchObject(
          new Error(
            'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
          ),
        ),
      );
    });
  });

  describe('openLink', () => {
    const contexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task];
    for (const context in contexts) {
      describe(`openLink in ${contexts[context]} context `, () => {
        it('should not allow calls before initialization', async () => {
          expect.assertions(1);
          await app
            .openLink('dummyLink')
            .catch(e => expect(e).toMatchObject(new Error('The library has not yet been initialized')));
        });

        it('should successfully send a request', async () => {
          expect.assertions(3);
          await utils.initializeWithContext(contexts[context]);
          const request = 'dummyDeepLink';

          // send message request
          const promise = app.openLink(request);

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
          await expect(promise).resolves.not.toThrow();
        });

        it('should invoke error callback', async () => {
          expect.assertions(3);
          await utils.initializeWithContext(contexts[context]);
          const request = 'dummyDeepLink';

          // send message request
          const promise = app.openLink(request);

          // find message request in jest
          const message = utils.findMessageByFunc('executeDeepLink');

          // check message is sending correct data
          expect(message).not.toBeUndefined();
          expect(message.args).toContain(request);

          // simulate response
          const data = {
            success: false,
            error: mockErrorMessage,
          };
          utils.respondToMessage(message, data.success, data.error);
          await promise.catch(e => expect(e).toMatchObject(new Error(mockErrorMessage)));
        });
      });
    }
  });

  describe('returnFocus', () => {
    it('should successfully returnFocus', async () => {
      await utils.initializeWithContext('content');

      pages.returnFocus(true);

      const returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
});
