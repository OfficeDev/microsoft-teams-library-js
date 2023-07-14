import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { authentication, dialog, menus, pages } from '../../src/public';
import { app } from '../../src/public/app';
import {
  ChannelType,
  FrameContexts,
  HostClientType,
  HostName,
  TeamType,
  UserTeamRole,
} from '../../src/public/constants';
import {
  ActionObjectType,
  Context,
  FileOpenPreference,
  M365ContentAction,
  SecondaryM365ContentIdName,
} from '../../src/public/interfaces';
import {
  _minRuntimeConfigToUninitialize,
  latestRuntimeApiVersion,
  runtime,
  teamsRuntimeConfig,
} from '../../src/public/runtime';
import { version } from '../../src/public/version';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Type guard to determine if an action item is of M365Content Type
 */
function isM365ContentType(actionItem: unknown): actionItem is M365ContentAction {
  // eslint-disable-next-line no-prototype-builtins
  return actionItem && Object.prototype.hasOwnProperty.call(actionItem, 'secondaryId');
}

describe('Testing app capability', () => {
  const mockErrorMessage = 'Something went wrong...';
  describe('Framed - Testing app capability', () => {
    // Use to send a mock message from the app.
    const utils = new Utils();

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
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing app.isInitialized function', () => {
      it('app.isInitialized should return false when not initialized', () => {
        expect(app.isInitialized()).toBe(false);
      });

      it('app.isInitialized should return false after initialized but before initialization completed, and true once initialization completes', async () => {
        expect.assertions(2);

        const initPromise = app.initialize();
        expect(app.isInitialized()).toBe(false);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        expect(app.isInitialized()).toBe(true);
      });
    });

    describe('Testing app.getFrameContext function', () => {
      Object.values(FrameContexts).forEach((context) => {
        it(`app.getFrameContext should return ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(app.getFrameContext()).toBe(context);
        });
      });
    });

    describe('Testing app.initialize function', () => {
      it('app.initialize message contains all necessary data', () => {
        app.initialize();

        expect(utils.processMessage).toBeDefined();
        expect(utils.messages.length).toBe(1);

        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();
        expect(initMessage.id).toBe(0);
        expect(initMessage.func).toBe('initialize');
        expect(initMessage.args.length).toEqual(2);
        expect(initMessage.args[0]).toEqual(version);
        expect(initMessage.args[1]).toEqual(latestRuntimeApiVersion);
        expect(initMessage.timestamp).not.toBeNull();
      });

      it('app.initialize should allow multiple initialize calls', () => {
        for (let i = 0; i < 2; i++) {
          app.initialize();
        }

        // Still only one message actually sent, the extra calls just no-op'ed
        expect(utils.processMessage).toBeDefined();
        expect(utils.messages.length).toBe(1);
      });

      it('app.initialize should invoke all callbacks once initialization completes', async () => {
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

      it('app.initialize should invoke callback immediately if initialization has already completed', async () => {
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

      it('app.initialize should use teams runtime config if no runtime config is given', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0');
        await initPromise;
        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should use teams runtime config if an empty runtime config is given', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '', '1.6.0');
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should use teams runtime config if a JSON parsing error is thrown by a given runtime config', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, 'nonJSONStr', '1.6.0');
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should throw an error if the given runtime config causes a non parsing related error', async () => {
        const promise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, null);

        await expect(promise).rejects.toThrowError('Received runtime config is invalid');
      });

      it('app.initialize should not use the teams config as a default if another proper config is given', async () => {
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
        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
      });

      it('app.initialize should assign clientSupportedSDKVersion correctly when a proper runtime config is given', async () => {
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

        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
        expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
      });

      it('app.initialize should initialize with clientSupportedSDKVersion and runtimeConfig arguments flipped', async () => {
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

        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
        expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
      });

      it('app.initialize should initialize with teams config when an invalid runtimeConfig is given, with arguments flipped', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0', 'nonJSONStr');
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should throw an error when "null" runtimeConfig is given, with arguments flipped', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        utils.respondToMessage(initMessage, FrameContexts.content, HostClientType.web, '1.6.0', 'null');

        await expect(initPromise).rejects.toThrowError(
          'givenRuntimeConfig string was successfully parsed. However, it parsed to value of null',
        );
      });

      Object.values(HostClientType).forEach((hostClientType) => {
        it(`app.initialize should assign hostClientType correctly when ${hostClientType} is given`, async () => {
          const initPromise = app.initialize();

          const initMessage = utils.findMessageByFunc('initialize');
          utils.respondToMessage(initMessage, FrameContexts.content, hostClientType, '', '1.6.0');
          await initPromise;

          expect(GlobalVars.hostClientType).toBe(hostClientType);
        });
      });

      it('app.initialize should call authentication.initialize', async () => {
        const spy = jest.spyOn(authentication, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call menus.initialize', async () => {
        const spy = jest.spyOn(menus, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call pages.config.initialize', async () => {
        const spy = jest.spyOn(pages.config, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call dialog.initialize', async () => {
        const spy = jest.spyOn(dialog, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should assign additionalValidOrigins when supplied', async () => {
        const validOrigin = 'https://www.mydomain.com';
        const initPromise = app.initialize([validOrigin]);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.additionalValidOrigins.length).toBe(1);
        expect(GlobalVars.additionalValidOrigins[0]).toBe(validOrigin);
      });
    });

    describe('Testing app.getContext function', () => {
      it('app.getContext should not allow calls before initialization', async () => {
        await expect(app.getContext()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('app.getContext should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        app.getContext();
        let message = utils.findMessageByFunc('getContext');
        expect(message).toBeNull();

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('getContext');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.getContext should successfully get frame context in ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          utils.respondToMessage(getContextMessage, {});
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get frame context when returned from client from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          utils.respondToMessage(getContextMessage, { frameContext: context });
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get frame context in ${context} with fallback logic if not returned from client`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          utils.respondToMessage(getContextMessage, {});
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get context with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          const actionObjects = [
            {
              itemId: '1',
              secondaryId: {
                name: SecondaryM365ContentIdName.DriveId,
                value: 'secondaryDriveValue',
              },
              type: ActionObjectType.M365Content,
            },
            { itemId: '2', type: ActionObjectType.M365Content },
            {
              itemId: '3',
              secondaryId: {
                name: SecondaryM365ContentIdName.GroupId,
                value: 'secondaryGroupId',
              },
              type: ActionObjectType.M365Content,
            },
            {
              itemId: '4',
              secondaryId: {
                name: SecondaryM365ContentIdName.SiteId,
                value: 'secondarySiteId',
              },
              type: ActionObjectType.M365Content,
            },
            {
              itemId: '5',
              secondaryId: {
                name: SecondaryM365ContentIdName.UserId,
                value: 'secondarySiteId',
              },
              type: ActionObjectType.M365Content,
            },
          ];

          const contextBridge: Context = {
            actionInfo: {
              actionId: 'actionId',
              actionObjects: actionObjects,
            },
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
            mySiteDomain: 'myDomain',
            mySitePath: 'mySitePath',
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
            frameContext: context,
            appLaunchId: 'appLaunchId',
            userDisplayName: 'someTestUser',
            teamSiteId: 'someSiteId',
          };

          const expectedContext: app.Context = {
            actionInfo: { actionId: 'actionId', actionObjects: actionObjects },
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
              frameContext: context,
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
              teamSiteUrl: 'someSiteUrl',
              teamSiteDomain: 'someTeamSiteDomain',
              teamSitePath: 'someTeamSitePath',
              teamSiteId: 'someSiteId',
              mySitePath: 'mySitePath',
              mySiteDomain: 'myDomain',
            },
          };

          //insert expected time comparison here?
          utils.respondToMessage(getContextMessage, contextBridge);
          const actualContext = await contextPromise;

          const firstActionItem =
            isM365ContentType(actualContext.actionInfo?.actionObjects[0]) && actualContext.actionInfo?.actionObjects[0];
          const secondActionItem = actualContext.actionInfo?.actionObjects[1];

          expect(actualContext).toEqual(expectedContext);
          expect(actualContext.page.frameContext).toBe(context);
          expect(actualContext.meeting?.id).toBe('dummyMeetingId');
          expect(actualContext.actionInfo?.actionId).toBe('actionId');
          expect(actualContext.actionInfo?.actionObjects.length).toBe(5);
          expect(firstActionItem.secondaryId?.name).toEqual(SecondaryM365ContentIdName.DriveId);
          expect(isM365ContentType(secondActionItem)).toBe(false);
        });
      });
    });

    describe('Testing app.notifyAppLoaded function', () => {
      it('app.notifyAppLoaded should not allow calls before initialization', () => {
        expect(() => app.notifyAppLoaded()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('app.notifyAppLoaded should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        app.notifyAppLoaded();
        let message = utils.findMessageByFunc('appInitialization.appLoaded');
        expect(message).toBeNull();

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('appInitialization.appLoaded');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifyAppLoaded should successfully notify app is loaded with no error from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          app.notifyAppLoaded();
          const message = utils.findMessageByFunc(app.Messages.AppLoaded);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });

    describe('Testing app.notifySuccess function', () => {
      it('app.notifySuccess should not allow calls before initialization', () => {
        expect(() => app.notifySuccess()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('app.notifySuccess should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        app.notifySuccess();
        let message = utils.findMessageByFunc('appInitialization.success');
        expect(message).toBeNull();

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('appInitialization.success');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifySuccess should successfully notify success with no error from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          app.notifyAppLoaded();
          const message = utils.findMessageByFunc(app.Messages.AppLoaded);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });

    describe('Testing app.notifyFailure function', () => {
      it('app.notifyFailure should not allow calls before initialization', () => {
        expect(() =>
          app.notifyFailure({
            reason: app.FailedReason.AuthFailed,
            message: 'Failed message',
          }),
        ).toThrowError(new Error(errorLibraryNotInitialized));
      });

      it('app.notifyFailure should allow calls after initialization called, but before it finished', async () => {
        expect.assertions(3);

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();

        app.notifyFailure({
          reason: app.FailedReason.AuthFailed,
          message: 'Failed message',
        });
        let message = utils.findMessageByFunc('appInitialization.failure');
        expect(message).toBeNull();

        utils.respondToMessage(initMessage, 'content');

        await initPromise;

        message = utils.findMessageByFunc('appInitialization.failure');
        expect(message).not.toBeNull();
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifyFailure should call notify failure correctly with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          app.notifyFailure({
            reason: app.FailedReason.AuthFailed,
            message: 'Failed message',
          });
          const message = utils.findMessageByFunc(app.Messages.Failure);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(2);
          expect(message.args[0]).toEqual(app.FailedReason.AuthFailed);
          expect(message.args[1]).toEqual('Failed message');
        });

        it(`app.notifyFailure should call notify expected failure correctly with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          app.notifyExpectedFailure({
            reason: app.ExpectedFailureReason.PermissionError,
            message: 'Failed message',
          });
          const message = utils.findMessageByFunc(app.Messages.ExpectedFailure);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(2);
          expect(message.args[0]).toEqual(app.ExpectedFailureReason.PermissionError);
          expect(message.args[1]).toEqual('Failed message');
        });
      });
    });

    describe('Testing app.registerOnThemeChangeHandler function', () => {
      it('app.registerOnThemeChangeHandler should not allow calls before initialization', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(() => app.registerOnThemeChangeHandler(() => {})).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.registerOnThemeChangeHandler should successfully register a theme change handler from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let newTheme: string;
          app.registerOnThemeChangeHandler((theme) => {
            newTheme = theme;
          });
          utils.sendMessage('themeChange', 'someTheme');
          expect(newTheme).toBe('someTheme');
        });
      });
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

    it('should call navigateBack automatically when no back button handler is registered', async () => {
      await utils.initializeWithContext('content');

      utils.sendMessage('backButtonPress');

      const navigateBackMessage = utils.findMessageByFunc('navigateBack');
      expect(navigateBackMessage).not.toBeNull();
    });

    describe('Testing app.openLink function', () => {
      const contexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task];
      it('app.openLink should not allow calls before initialization', async () => {
        await expect(app.openLink('dummyLink')).rejects.toThrowError(new Error(errorLibraryNotInitialized));
      });
      for (const context in contexts) {
        describe(`app.openLink in ${contexts[context]} context `, () => {
          it(`app.openLink should successfully send a request from ${context[context]}`, async () => {
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

          it(`app.openLink should invoke error callback from ${context[context]}`, async () => {
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
            await expect(promise).rejects.toThrowError(mockErrorMessage);
          });
        });
      }
    });
  });

  describe('Frameless - Testing app capbility', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('Testing app.isInitialized function', () => {
      it('app.isInitialized should return false when not initialized', () => {
        expect(app.isInitialized()).toBe(false);
      });

      it('app.isInitialized should return false after initialized but before initialization completed, and true once initialization completes', async () => {
        expect.assertions(2);

        const initPromise = app.initialize();
        expect(app.isInitialized()).toBe(false);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);

        await initPromise;

        expect(app.isInitialized()).toBe(true);
      });
    });

    describe('Testing app.getFrameContext function', () => {
      Object.values(FrameContexts).forEach((context) => {
        it(`app.getFrameContext should return ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(app.getFrameContext()).toBe(context);
        });
      });
    });

    describe('Testing app.initialize function', () => {
      it('app.initialize should successfully initialize', () => {
        app.initialize();

        expect(utils.messages.length).toBe(1);

        const initMessage = utils.findMessageByFunc('initialize');
        expect(initMessage).not.toBeNull();
        expect(initMessage.id).toBe(0);
        expect(initMessage.func).toBe('initialize');
        expect(initMessage.args.length).toEqual(2);
        expect(initMessage.args[0]).toEqual(version);
        expect(initMessage.args[1]).toEqual(latestRuntimeApiVersion);
        expect(initMessage.timestamp).not.toBeNull();
      });

      it('app.initialize should allow multiple initialize calls', () => {
        for (let i = 0; i < 100; i++) {
          app.initialize();
        }

        // Still only one message actually sent, the extra calls just no-op'ed
        expect(utils.messages.length).toBe(1);
      });

      it('app.initialize should invoke all callbacks once initialization completes', async () => {
        let firstCallbackInvoked = false;
        app.initialize().then(() => {
          firstCallbackInvoked = true;
        });

        let secondCallbackInvoked = false;
        const initPromise = app.initialize().then(() => {
          secondCallbackInvoked = true;
        });

        expect(utils.messages.length).toBe(1);

        expect(firstCallbackInvoked).toBe(false);
        expect(secondCallbackInvoked).toBe(false);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(firstCallbackInvoked).toBe(true);
        expect(secondCallbackInvoked).toBe(true);
      });

      it('app.initialize should invoke callback immediately if initialization has already completed', async () => {
        const initPromise = app.initialize();

        expect(utils.messages.length).toBe(1);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        let callbackInvoked = false;
        await app.initialize().then(() => {
          callbackInvoked = true;
        });

        expect(callbackInvoked).toBe(true);
      });

      it('app.initialize should use teams runtime config if no runtime config is given', async () => {
        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');

        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '1.6.0'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should use teams runtime config if an empty runtime config is given', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '', '1.6.0'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should use teams runtime config if a JSON parsing error is thrown by a given runtime config', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, 'nonJSONStr', '1.6.0'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      it('app.initialize should throw an error if the given runtime config causes a non parsing related error', async () => {
        const promise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, null],
          },
        } as DOMMessageEvent);
        await expect(promise).rejects.toThrowError('Received runtime config is invalid');
      });

      it('app.initialize should not use the teams config as a default if another proper config is given', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '{"apiVersion":1, "supports":{"mail":{}}}'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).not.toEqual(teamsRuntimeConfig);
        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
      });

      it('app.initialize should assign clientSupportedSDKVersion correctly when a proper runtime config is given', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '{"apiVersion":1, "supports":{"mail":{}}}', '1.0.0'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
        expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
      });

      it('app.initialize should initialize with clientSupportedSDKVersion and runtimeConfig arguments flipped', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '1.0.0', '{"apiVersion":1, "supports":{"mail":{}}}'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual({ apiVersion: latestRuntimeApiVersion, supports: { mail: {} } });
        expect(GlobalVars.clientSupportedSDKVersion).toBe('1.0.0');
      });

      it('app.initialize should initialize with teams config when an invalid runtimeConfig is given, with arguments flipped', async () => {
        const initPromise = app.initialize();

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [FrameContexts.content, HostClientType.web, '1.6.0', 'nonJSONStr'],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(runtime).toEqual(teamsRuntimeConfig);
      });

      Object.values(HostClientType).forEach((hostClientType) => {
        it(`app.initialize should assign hostClientType correctly when ${hostClientType} is given`, async () => {
          const initPromise = app.initialize();

          const initMessage = utils.findMessageByFunc('initialize');
          utils.respondToFramelessMessage({
            data: {
              id: initMessage.id,
              args: [FrameContexts.content, hostClientType, '', '1.6.0'],
            },
          } as DOMMessageEvent);
          await initPromise;

          expect(GlobalVars.hostClientType).toBe(hostClientType);
        });
      });

      it('app.initialize should call authentication.initialize', async () => {
        const spy = jest.spyOn(authentication, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call menus.initialize', async () => {
        const spy = jest.spyOn(menus, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call pages.config.initialize', async () => {
        const spy = jest.spyOn(pages.config, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should call dialog.initialize', async () => {
        const spy = jest.spyOn(dialog, 'initialize');

        const initPromise = app.initialize();
        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(spy).toHaveBeenCalled();
      });

      it('app.initialize should assign additionalValidOrigins when supplied', async () => {
        const validOrigin = 'https://www.mydomain.com';
        const initPromise = app.initialize([validOrigin]);

        const initMessage = utils.findMessageByFunc('initialize');
        utils.respondToFramelessMessage({
          data: {
            id: initMessage.id,
            args: [],
          },
        } as DOMMessageEvent);
        await initPromise;

        expect(GlobalVars.additionalValidOrigins.length).toBe(1);
        expect(GlobalVars.additionalValidOrigins[0]).toBe(validOrigin);
      });
    });

    describe('Testing app.getContext function', () => {
      it('app.getContext should not allow calls before initialization', async () => {
        await expect(app.getContext()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.getContext should successfully get frame context in ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          utils.respondToFramelessMessage({
            data: {
              id: getContextMessage.id,
              args: [{}],
            },
          } as DOMMessageEvent);
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get frame context when returned from client from ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();
          utils.respondToFramelessMessage({
            data: {
              id: getContextMessage.id,
              args: [{ frameContext: context }],
            },
          } as DOMMessageEvent);
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get frame context in ${context} with fallback logic if not returned from client`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          utils.respondToFramelessMessage({
            data: {
              id: getContextMessage.id,
              args: [{}],
            },
          } as DOMMessageEvent);
          const actualContext = await contextPromise;

          expect(actualContext.page.frameContext).toBe(context);
        });

        it(`app.getContext should successfully get context with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const contextPromise = app.getContext();

          const getContextMessage = utils.findMessageByFunc('getContext');
          expect(getContextMessage).not.toBeNull();

          const contextBridge: Context = {
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
            mySiteDomain: 'myDomain',
            mySitePath: 'mySitePath',
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
            frameContext: context,
            appLaunchId: 'appLaunchId',
            userDisplayName: 'someTestUser',
            teamSiteId: 'someSiteId',
          };

          const expectedContext: app.Context = {
            app: {
              locale: 'someLocale',
              sessionId: 'appSessionId',
              theme: 'someTheme',
              iconPositionVertical: 5,
              osLocaleInfo: undefined,
              parentMessageId: 'someParentMessageId',
              userClickTime: 2222,
              userFileOpenPreference: FileOpenPreference.Inline,
              host: {
                name: HostName.orange,
                clientType: HostClientType.web,
                sessionId: 'someSessionId',
                ringId: 'someRingId',
              },
              appLaunchId: 'appLaunchId',
            },
            page: {
              id: 'someEntityId',
              frameContext: context,
              subPageId: 'someSubEntityId',
              isFullScreen: true,
              isMultiWindow: true,
              sourceOrigin: 'www.origin.com',
            },
            user: {
              id: 'someUserObjectId',
              displayName: 'someTestUser',
              isCallingAllowed: true,
              isPSTNCallingAllowed: undefined,
              licenseType: 'someUserLicenseType',
              loginHint: 'someLoginHint',
              userPrincipalName: 'someUserPrincipalName',
              tenant: { id: 'someTid', teamsSku: 'someTenantSKU' },
            },
            channel: {
              id: 'someChannelId',
              displayName: 'someChannelName',
              relativeUrl: 'someChannelRelativeUrl',
              membershipType: ChannelType.Shared,
              defaultOneNoteSectionId: 'someDefaultOneNoteSectionId',
              ownerGroupId: 'someHostGroupId',
              ownerTenantId: 'someHostTenantId',
            },
            chat: { id: 'someChatId' },
            meeting: { id: 'dummyMeetingId' },
            sharepoint: {},
            team: {
              internalId: 'someTeamId',
              displayName: 'someTeamName',
              type: 4,
              groupId: undefined,
              templateId: 'someTeamTemplateId',
              isArchived: false,
              userRole: 0,
            },
            sharePointSite: {
              teamSiteUrl: 'someSiteUrl',
              teamSiteDomain: 'someTeamSiteDomain',
              teamSitePath: 'someTeamSitePath',
              teamSiteId: 'someSiteId',
              mySitePath: 'mySitePath',
              mySiteDomain: 'myDomain',
            },
          };

          utils.respondToFramelessMessage({
            data: {
              id: getContextMessage.id,
              args: [contextBridge],
            },
          } as DOMMessageEvent);
          const actualContext = await contextPromise;

          expect(actualContext).toEqual(expectedContext);
          expect(actualContext.page.frameContext).toBe(context);
          expect(actualContext.meeting.id).toBe('dummyMeetingId');
        });
      });
    });

    describe('Testing app.notifyAppLoaded function', () => {
      it('app.notifyAppLoaded should not allow calls before initialization', () => {
        expect(() => app.notifyAppLoaded()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifyAppLoaded should successfully notify app is loaded with no error from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          app.notifyAppLoaded();
          const message = utils.findMessageByFunc(app.Messages.AppLoaded);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });

    describe('Testing app.notifySuccess function', () => {
      it('app.notifySuccess should not allow calls before initialization', () => {
        expect(() => app.notifySuccess()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifySuccess should successfully notify success with no error from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          app.notifySuccess();
          const message = utils.findMessageByFunc(app.Messages.Success);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });

    describe('Testing app.notifyFailure function', () => {
      it('app.notifyFailure should not allow calls before initialization', () => {
        expect(() =>
          app.notifyFailure({
            reason: app.FailedReason.AuthFailed,
            message: 'Failed message',
          }),
        ).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.notifyFailure should call notify failure correctly with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          app.notifyFailure({
            reason: app.FailedReason.AuthFailed,
            message: 'Failed message',
          });
          const message = utils.findMessageByFunc(app.Messages.Failure);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(2);
          expect(message.args[0]).toEqual(app.FailedReason.AuthFailed);
          expect(message.args[1]).toEqual('Failed message');
        });

        it(`app.notifyFailure should call notify expected failure correctly with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          app.notifyExpectedFailure({
            reason: app.ExpectedFailureReason.PermissionError,
            message: 'Failed message',
          });
          const message = utils.findMessageByFunc(app.Messages.ExpectedFailure);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(2);
          expect(message.args[0]).toEqual(app.ExpectedFailureReason.PermissionError);
          expect(message.args[1]).toEqual('Failed message');
        });
      });
    });

    describe('Testing app.registerOnThemeChangeHandler function', () => {
      it('app.registerOnThemeChangeHandler should not allow calls before initialization', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        expect(() => app.registerOnThemeChangeHandler(() => {})).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`app.registerOnThemeChangeHandler should successfully register a theme change handler from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let newTheme: string;
          app.registerOnThemeChangeHandler((theme) => {
            newTheme = theme;
          });
          utils.respondToFramelessMessage({
            data: {
              func: 'themeChange',
              args: ['someTheme'],
            },
          } as DOMMessageEvent);
          expect(newTheme).toBe('someTheme');
        });
      });
    });

    it('should call navigateBack automatically when no back button handler is registered', async () => {
      await utils.initializeWithContext('content');

      utils.respondToFramelessMessage({
        data: {
          func: 'backButtonPress',
          args: ['navigateBack'],
        },
      } as DOMMessageEvent);

      const navigateBackMessage = utils.findMessageByFunc('navigateBack');
      expect(navigateBackMessage).not.toBeNull();
    });

    describe('Testing app.openLink function', () => {
      const contexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task];
      it('app.openLink should not allow calls before initialization', async () => {
        await expect(app.openLink('dummyLink')).rejects.toThrowError(new Error(errorLibraryNotInitialized));
      });
      for (const context in contexts) {
        describe(`app.openLink in ${contexts[context]} context `, () => {
          it(`app.openLink should successfully send a request from ${context[context]}`, async () => {
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

            utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [data.success],
              },
            } as DOMMessageEvent);
            await expect(promise).resolves.not.toThrow();
          });

          it(`app.openLink should invoke error callback from ${context[context]}`, async () => {
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
            utils.respondToFramelessMessage({
              data: {
                id: message.id,
                args: [data.success, data.error],
              },
            } as DOMMessageEvent);
            await expect(promise).rejects.toThrowError(mockErrorMessage);
          });
        });
      }
    });
  });
});
