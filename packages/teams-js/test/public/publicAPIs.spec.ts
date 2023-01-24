import { errorLibraryNotInitialized } from '../../src/internal/constants';
import * as utilFunc from '../../src/internal/utils';
import { app } from '../../src/public';
import { HostClientType, TeamType, UserTeamRole } from '../../src/public/constants';
import { FrameContexts } from '../../src/public/constants';
import { Context, FrameContext, TabInstanceParameters } from '../../src/public/interfaces';
import * as microsoftTeams from '../../src/public/publicAPIs';
import {
  enablePrintCapability,
  executeDeepLink,
  getContext,
  getMruTabInstances,
  getTabInstances,
  initialize,
  initializeWithFrameContext,
  registerAppButtonClickHandler,
  registerAppButtonHoverEnterHandler,
  registerAppButtonHoverLeaveHandler,
  registerBackButtonHandler,
  registerBeforeUnloadHandler,
  registerChangeSettingsHandler,
  registerFocusEnterHandler,
  registerOnLoadHandler,
  registerOnThemeChangeHandler,
  setFrameContext,
  shareDeepLink,
} from '../../src/public/publicAPIs';
import { _minRuntimeConfigToUninitialize, latestRuntimeApiVersion } from '../../src/public/runtime';
import { version } from '../../src/public/version';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  it('should not allow calls before initialization', () => {
    expect(() =>
      getContext(() => {
        return;
      }),
    ).toThrowError(new Error(errorLibraryNotInitialized));
  });

  it('should successfully initialize', () => {
    initialize();

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
      initialize();
    }

    // Still only one message actually sent, the extra calls just no-op'ed
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);
  });

  it('should invoke all callbacks once initialization completes', (done) => {
    let count = 0;
    initialize(() => {
      ++count;
    });

    initialize(() => {
      ++count;
      if (count == 2) {
        done();
      }
    });

    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');
  });

  it('should invoke callback immediatelly if initialization has already completed', (done) => {
    initialize();
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(1);

    const initMessage = utils.findMessageByFunc('initialize');
    utils.respondToMessage(initMessage, 'content');

    initialize(() => {
      done();
    });
  });

  it('should successfully register a change settings handler', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    let handlerCalled = false;

    registerChangeSettingsHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('changeSettings', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('registerChangeSettingsHandler should not throw if pages.config is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => registerChangeSettingsHandler(() => {})).not.toThrowError();
  });

  it('should successfully register a app button click handler', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    let handlerCalled = false;

    registerAppButtonClickHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonClick', '');
    expect(handlerCalled).toBeTruthy();
  });

  it('registerAppButtonHandler should not throw if pages.appButton is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => registerAppButtonClickHandler(() => {})).not.toThrowError();
  });

  it('should successfully register a app button hover enter handler', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    let handlerCalled = false;

    registerAppButtonHoverEnterHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverEnter', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('registerAppButtonHoverEnterHandler should not throw if pages.appButton is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => registerAppButtonHoverEnterHandler(() => {})).not.toThrowError();
  });

  it('should successfully register a app button hover leave handler', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    let handlerCalled = false;

    registerAppButtonHoverLeaveHandler(() => {
      handlerCalled = true;
    });

    utils.sendMessage('appButtonHoverLeave', '');

    expect(handlerCalled).toBeTruthy();
  });

  it('registerAppButtonHoverLeaveHandler should not throw if pages.appButton is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    expect(() => registerAppButtonHoverLeaveHandler(() => {})).not.toThrowError();
  });

  it('should successfully register a theme change handler', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    let newTheme: string;
    registerOnThemeChangeHandler((theme) => {
      newTheme = theme;
    });

    utils.sendMessage('themeChange', 'someTheme');

    expect(newTheme).toBe('someTheme');
  });

  it('should call navigateBack automatically when no back button handler is registered', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    utils.sendMessage('backButtonPress');

    const navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
  });

  it('should successfully register a back button handler and not call navigateBack if it returns true', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    let handlerInvoked = false;
    registerBackButtonHandler(() => {
      handlerInvoked = true;
      return true;
    });

    utils.sendMessage('backButtonPress');

    const navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  it('registerBackButtonHandler should not throw if pages.backStack is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

    expect(() =>
      registerBackButtonHandler(() => {
        return true;
      }),
    ).not.toThrowError();
  });

  it('should successfully register a focus enter handler and return true', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    let handlerInvoked = false;
    registerFocusEnterHandler((_x: boolean) => {
      handlerInvoked = true;
      return true;
    });

    utils.sendMessage('focusEnter');
    expect(handlerInvoked).toBe(true);
  });

  it('registerFocusEnterHandler should not throw if pages is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content);
    utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const emptyHandler = (x: boolean): boolean => {
      return true;
    };
    expect(() => microsoftTeams.registerFocusEnterHandler(emptyHandler)).not.toThrowError();
  });

  it('should successfully register a full screen handler', async () => {
    await utils.initializeWithContext(FrameContexts.content); // this can be used in any context

    let handlerInvoked = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    microsoftTeams.registerFullScreenHandler((_x: boolean) => {
      handlerInvoked = true;
    });

    utils.sendMessage('fullScreenChange');
    expect(handlerInvoked).toBe(true);
  });

  it('registerFullScreenHandler should not throw if pages is not supported', async () => {
    await utils.initializeWithContext(FrameContexts.content); // this can be used in any context
    utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    const emptyHandler = (x: boolean): void => {};
    expect(() => microsoftTeams.registerFullScreenHandler(emptyHandler)).not.toThrowError();
  });

  it('should successfully get context', (done) => {
    utils.initializeWithContext(FrameContexts.content).then(() => {
      const expectedContext: Context = {
        groupId: 'someGroupId',
        teamId: 'someTeamId',
        teamName: 'someTeamName',
        channelId: 'someChannelId',
        channelName: 'someChannelName',
        entityId: 'someEntityId',
        subEntityId: 'someSubEntityId',
        locale: 'someLocale',
        //upn: 'someUpn',
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
        meetingId: 'dummyMeetingId',
      };
      getContext((context) => {
        Object.keys(expectedContext).forEach((e) => {
          expect(JSON.stringify(expectedContext[e])).toBe(JSON.stringify(context[e]));
        });
        expect(context.frameContext).toBe(FrameContexts.content);
        expect(context.meetingId).toBe('dummyMeetingId');
        done();
      });

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();
      //insert expected time comparison here?
      utils.respondToMessage(getContextMessage, expectedContext);
    });
  });

  it('should successfully get frame context in side panel', (done) => {
    utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
      getContext((context) => {
        expect(context.frameContext).toBe(FrameContexts.sidePanel);
        done();
      });

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();

      utils.respondToMessage(getContextMessage, {});
    });
  });

  it('should successfully get frame context when returned from client', (done) => {
    utils.initializeWithContext(FrameContexts.content).then(() => {
      getContext((context) => {
        expect(context.frameContext).toBe(FrameContexts.sidePanel);
        done();
      });

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();

      utils.respondToMessage(getContextMessage, { frameContext: FrameContexts.sidePanel });
    });
  });

  it('should successfully get frame context in side panel with fallback logic if not returned from client', (done) => {
    utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
      getContext((context) => {
        expect(context.frameContext).toBe(FrameContexts.sidePanel);
        done();
      });

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();

      utils.respondToMessage(getContextMessage, {});
    });
  });

  it('should successfully register a back button handler and call navigateBack if it returns false', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    let handlerInvoked = false;
    registerBackButtonHandler(() => {
      handlerInvoked = true;
      return false;
    });

    utils.sendMessage('backButtonPress');

    const navigateBackMessage = utils.findMessageByFunc('navigateBack');
    expect(navigateBackMessage).not.toBeNull();
    expect(handlerInvoked).toBe(true);
  });

  describe('getTabInstances', () => {
    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      getTabInstances((tabInfo) => tabInfo);
      getTabInstances((tabInfo) => tabInfo, {} as TabInstanceParameters);
    });
  });

  describe('getMruTabInstances', () => {
    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      getMruTabInstances((tabInfo) => tabInfo);
      getMruTabInstances((tabInfo) => tabInfo, {} as TabInstanceParameters);
    });
  });

  describe('executeDeepLink in content context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.content).then(() => {
        const request = 'dummyDeepLink';
        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });

    it('should invoke error callback', (done) => {
      utils.initializeWithContext(FrameContexts.content).then(() => {
        const request = 'dummyDeepLink';
        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(false);
          expect(reason).toBe('Something went wrong...');
          done();
        };

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
      });
    });

    it('should invoke getGenericOnCompleteHandler when no callback is provided.', (done) => {
      utils.initializeWithContext(FrameContexts.content).then(() => {
        const request = 'dummyDeepLink';
        jest.spyOn(utilFunc, 'getGenericOnCompleteHandler').mockImplementation(() => {
          return (success: boolean, reason: string): void => {
            if (!success) {
              expect(reason).toBe('Something went wrong...');
              done();
            }
          };
        });

        // send message request
        executeDeepLink(request);

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
      });
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.content).then(() => {
        const request = 'dummyDeepLink';
        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });
  });

  describe('executeDeepLink in sidePanel context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });

    it('should invoke error callback', (done) => {
      utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(false);
          expect(reason).toBe('Something went wrong...');
          done();
        };

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
      });
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.sidePanel).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });
  });

  describe('executeDeepLink in task module context ', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        executeDeepLink('dummyLink', () => {
          return;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.task).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });

    it('should invoke error callback', (done) => {
      utils.initializeWithContext(FrameContexts.task).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(false);
          expect(reason).toBe('Something went wrong...');
          done();
        };

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
      });
    });

    it('should successfully send a request', (done) => {
      utils.initializeWithContext(FrameContexts.content).then(() => {
        const request = 'dummyDeepLink';

        const onComplete = (status: boolean, reason?: string): void => {
          expect(status).toBe(true);
          expect(reason).toBeUndefined();
          done();
        };

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
      });
    });
  });

  it("Ctrl+P shouldn't call print handler if printCapability is disabled", () => {
    let handlerCalled = false;
    initialize();
    jest.spyOn(microsoftTeams, 'print').mockImplementation((): void => {
      handlerCalled = true;
    });
    const printEvent = new Event('keydown');
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it("Cmd+P shouldn't call print handler if printCapability is disabled", () => {
    let handlerCalled = false;
    initialize();
    jest.spyOn(microsoftTeams, 'print').mockImplementation((): void => {
      handlerCalled = true;
    });
    const printEvent = new Event('keydown');
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeFalsy();
  });

  it('print handler should successfully call default print handler', async () => {
    let handlerCalled = false;
    await utils.initializeWithContext(FrameContexts.content);
    enablePrintCapability();
    jest.spyOn(window, 'print').mockImplementation((): void => {
      handlerCalled = true;
    });

    print();

    expect(handlerCalled).toBeTruthy();
  });

  it('Ctrl+P should successfully call print handler', async () => {
    let handlerCalled = false;
    await utils.initializeWithContext(FrameContexts.content);
    enablePrintCapability();
    jest.spyOn(window, 'print').mockImplementation((): void => {
      handlerCalled = true;
    });
    const printEvent = new Event('keydown');
    (printEvent as any).keyCode = 80;
    (printEvent as any).ctrlKey = true;

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBeTruthy();
  });

  it('Cmd+P should successfully call print handler', async () => {
    let handlerCalled = false;
    await utils.initializeWithContext(FrameContexts.content);
    enablePrintCapability();
    jest.spyOn(window, 'print').mockImplementation((): void => {
      handlerCalled = true;
    });
    const printEvent = new Event('keydown');
    (printEvent as any).keyCode = 80;
    (printEvent as any).metaKey = true;

    document.dispatchEvent(printEvent);
    expect(handlerCalled).toBe(true);
  });

  describe('registerOnLoadHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        registerOnLoadHandler(() => {
          return false;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should successfully register handler', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      let handlerInvoked = false;
      registerOnLoadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage('load');

      expect(handlerInvoked).toBe(true);
    });
    it('registerOnLoadHandler should not throw if teamsCore is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(() => registerOnLoadHandler(() => {})).not.toThrowError();
    });
  });

  describe('should not allow authentication and remove context', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    ];

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const request = 'dummyDeepLink';
          expect(() => executeDeepLink(request)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('registerBeforeUnloadHandler', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        registerBeforeUnloadHandler(() => {
          return false;
        }),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should successfully register a before unload handler', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      let handlerInvoked = false;
      registerBeforeUnloadHandler(() => {
        handlerInvoked = true;
        return false;
      });

      utils.sendMessage('beforeUnload');

      expect(handlerInvoked).toBe(true);
    });

    it('registerBeforeUnloadHandler should not throw if teamsCore is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      expect(() =>
        registerBeforeUnloadHandler(() => {
          return true;
        }),
      ).not.toThrowError();
    });

    it('should call readyToUnload automatically when no before unload handler is registered', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      utils.sendMessage('beforeUnload');

      const readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
      expect(readyToUnloadMessage).not.toBeNull();
    });

    it('should successfully share a deep link in content context', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      const message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully share a deep link in sidePanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);

      shareDeepLink({
        subEntityId: 'someSubEntityId',
        subEntityLabel: 'someSubEntityLabel',
        subEntityWebUrl: 'someSubEntityWebUrl',
      });

      const message = utils.findMessageByFunc('shareDeepLink');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(3);
      expect(message.args[0]).toBe('someSubEntityId');
      expect(message.args[1]).toBe('someSubEntityLabel');
      expect(message.args[2]).toBe('someSubEntityWebUrl');
    });

    it('should successfully register a before unload handler and not call readyToUnload if it returns true', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      let handlerInvoked = false;
      let readyToUnloadFunc: () => void;
      registerBeforeUnloadHandler((readyToUnload) => {
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

  it('should successfully frame context', async () => {
    await utils.initializeWithContext(FrameContexts.content);

    const frameContext: FrameContext = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    setFrameContext(frameContext);

    const message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });

  it('should successfully initialize and set the frame context', async () => {
    const frameContext: FrameContext = {
      contentUrl: 'someContentUrl',
      websiteUrl: 'someWebsiteUrl',
    };
    await utils.initializeWithContext(FrameContexts.content);
    initializeWithFrameContext(frameContext);
    expect(utils.processMessage).toBeDefined();
    expect(utils.messages.length).toBe(2);

    const initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(initMessage.id).toBe(0);
    expect(initMessage.func).toBe('initialize');
    expect(initMessage.args.length).toEqual(2);
    expect(initMessage.args[0]).toEqual(version);
    expect(initMessage.args[1]).toEqual(latestRuntimeApiVersion);
    const message = utils.findMessageByFunc('setFrameContext');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
    expect(message.args[0]).toBe(frameContext);
  });
});
