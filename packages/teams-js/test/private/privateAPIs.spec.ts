import { MessageResponse } from '../../src/internal/interfaces';
import { UserSettingTypes, ViewerActionTypes } from '../../src/private/interfaces';
import {
  openFilePreview,
  registerCustomHandler,
  registerUserSettingsChangeHandler,
  sendCustomEvent,
  sendCustomMessage,
} from '../../src/private/privateAPIs';
import { app } from '../../src/public/app';
import { FrameContexts, HostClientType, HostName, TeamType } from '../../src/public/constants';
import { Context, FileOpenPreference } from '../../src/public/interfaces';
import { MessageRequest, Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('AppSDK-privateAPIs', () => {
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
      app._uninitialize();
    }
  });

  it('should exist in the global namespace', () => {
    expect(app).toBeDefined();
  });

  const unSupportedDomains = [
    'https://teams.com',
    'https://teams.us',
    'https://int.microsoft.com',
    'https://dev.skype.com',
    'http://localhost',
    'https://microsoftsharepoint.com',
    'https://msft.com',
    'https://microsoft.sharepoint-xyz.com',
    'http://teams.microsoft.com',
    'http://microsoft.sharepoint-df.com',
    'https://a.b.sharepoint.com',
    'https://a.b.c.sharepoint.com',
    'http://invalid.origin.com',
  ];

  unSupportedDomains.forEach((unSupportedDomain) => {
    it('should reject utils.messages from unsupported domain: ' + unSupportedDomain, async () => {
      await utils.initializeWithContext('content', null, ['http://invalid.origin.com']);
      let callbackCalled = false;
      app.getContext().then(() => {
        callbackCalled = true;
      });

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();

      callbackCalled = false;
      utils.processMessage({
        origin: unSupportedDomain,
        source: utils.mockWindow.parent,
        data: {
          id: getContextMessage.id,
          args: [
            {
              groupId: 'someMaliciousValue',
            },
          ],
        } as MessageResponse,
      } as MessageEvent);
      await utils.flushPromises();

      expect(callbackCalled).toBe(false);
    });
  });

  const supportedDomains = [
    'https://teams.microsoft.com',
    'https://teams.microsoft.us',
    'https://gov.teams.microsoft.us',
    'https://dod.teams.microsoft.us',
    'https://int.teams.microsoft.com',
    'https://teams.live.com',
    'https://devspaces.skype.com',
    'https://ssauth.skype.com',
    'https://local.teams.live.com',
    'https://local.teams.live.com:8080',
    'https://local.teams.office.com',
    'https://local.teams.office.com:8080',
    'https://outlook.office.com',
    'https://outlook-sdf.office.com',
    'https://outlook-sdf.live.com',
    'https://outlook.live.com',
    'https://outlook.office365.com',
    'https://outlook-sdf.office365.com',
    'https://retailservices.teams.microsoft.com',
    'https://test.www.office.com',
    'https://www.office.com',
    'https://word.office.com',
    'https://excel.office.com',
    'https://powerpoint.office.com',
    'https://www.officeppe.com',
    'https://test.www.microsoft365.com',
    'https://www.microsoft365.com',
    'https://tasks.office.com',
    'https://www.example.com',
  ];

  supportedDomains.forEach((supportedDomain) => {
    it('should allow utils.messages from supported domain ' + supportedDomain, async () => {
      await utils.initializeWithContext('content', null, ['https://tasks.office.com', 'https://www.example.com']);
      const contextPromise = app.getContext();

      const getContextMessage = utils.findMessageByFunc('getContext');
      expect(getContextMessage).not.toBeNull();

      utils.processMessage({
        origin: supportedDomain,
        source: utils.mockWindow.parent,
        data: {
          id: getContextMessage.id,
          args: [
            {
              groupId: 'someMaliciousValue',
            },
          ],
        } as MessageResponse,
      } as MessageEvent);
      await contextPromise;

      return expect(contextPromise).resolves;
    });
  });

  it('should not make calls to unsupported domains', async () => {
    app.initialize(['http://some-invalid-origin.com']);

    const initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    utils.processMessage({
      origin: 'https://some-malicious-site.com',
      source: utils.mockWindow.parent,
      data: {
        id: initMessage.id,
        args: ['content'],
      } as MessageResponse,
    } as MessageEvent);

    // Try to make a call
    let callbackCalled = false;
    app.getContext().then(() => {
      callbackCalled = true;
      return;
    });

    utils.processMessage({
      origin: 'http://some-invalid-origin.com',
      source: utils.mockWindow.parent,
      data: {
        id: initMessage.id,
        args: ['content'],
      } as MessageResponse,
    } as MessageEvent);

    // Try to make a call
    app.getContext().then(() => {
      callbackCalled = true;
      return;
    });

    // Only the init call went out
    expect(utils.messages.length).toBe(1);
    expect(callbackCalled).toBe(false);
  });

  it('should successfully handle calls queued before init completes', async () => {
    const initPromise = app.initialize();

    // Another call made before the init response
    app.getContext();

    // Only the init call went out
    expect(utils.messages.length).toBe(1);
    const initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(utils.findMessageByFunc('getContext')).toBeNull();

    // init completes
    utils.respondToMessage(initMessage, 'content');
    await initPromise;

    // Now the getContext call should have been dequeued
    expect(utils.messages.length).toBe(2);
    expect(utils.findMessageByFunc('getContext')).not.toBeNull();
  });

  it('should successfully handle out of order calls', async () => {
    await utils.initializeWithContext('content');

    const contextPromise1 = app.getContext();

    const getContextMessage1 = utils.messages[utils.messages.length - 1];

    const contextPromise2 = app.getContext();

    const getContextMessage2 = utils.messages[utils.messages.length - 1];

    const contextPromise3 = app.getContext();

    const getContextMessage3 = utils.messages[utils.messages.length - 1];

    // They're all distinct utils.messages
    expect(getContextMessage3).not.toBe(getContextMessage1);
    expect(getContextMessage2).not.toBe(getContextMessage1);
    expect(getContextMessage3).not.toBe(getContextMessage2);

    const contextBridge1: Context = {
      locale: 'someLocale1',
      channelId: 'someChannelId1',
      entityId: 'someEntityId1',
      userObjectId: 'someUserObjectId1',
    };
    const expectedContext1: app.Context = {
      app: {
        locale: 'someLocale1',
        sessionId: '',
        theme: 'default',
        host: {
          name: HostName.teams,
          clientType: HostClientType.web,
          sessionId: '',
        },
      },
      page: {
        id: 'someEntityId1',
        frameContext: FrameContexts.content,
      },
      user: {
        id: 'someUserObjectId1',
      },
      channel: {
        id: 'someChannelId1',
      },
    };

    const contextBridge2: Context = {
      locale: 'someLocale2',
      channelId: 'someChannelId2',
      entityId: 'someEntityId2',
      userObjectId: 'someUserObjectId2',
    };
    const expectedContext2: app.Context = {
      app: {
        locale: 'someLocale2',
        sessionId: '',
        theme: 'default',
        host: {
          name: HostName.teams,
          clientType: HostClientType.web,
          sessionId: '',
        },
      },
      page: {
        id: 'someEntityId2',
        frameContext: FrameContexts.content,
      },
      user: {
        id: 'someUserObjectId2',
      },
      channel: {
        id: 'someChannelId2',
      },
    };

    const contextBridge3: Context = {
      locale: 'someLocale3',
      channelId: 'someChannelId3',
      entityId: 'someEntityId3',
      userObjectId: 'someUserObjectId3',
    };
    const expectedContext3: app.Context = {
      app: {
        locale: 'someLocale3',
        sessionId: '',
        theme: 'default',
        host: {
          name: HostName.teams,
          clientType: HostClientType.web,
          sessionId: '',
        },
      },
      page: {
        id: 'someEntityId3',
        frameContext: FrameContexts.content,
      },
      user: {
        id: 'someUserObjectId3',
      },
      channel: {
        id: 'someChannelId3',
      },
    };

    // respond in the wrong order
    utils.respondToMessage(getContextMessage3, contextBridge3);
    utils.respondToMessage(getContextMessage1, contextBridge1);
    utils.respondToMessage(getContextMessage2, contextBridge2);

    // The callbacks were associated with the correct utils.messages
    return Promise.all([
      expect(contextPromise1).resolves.toEqual(expectedContext1),
      expect(contextPromise2).resolves.toEqual(expectedContext2),
      expect(contextPromise3).resolves.toEqual(expectedContext3),
    ]);
  });

  it('should only call callbacks once', async () => {
    await utils.initializeWithContext('content');

    let callbackCalled = 0;
    const contextPromise = app.getContext().then(() => {
      callbackCalled++;
    });

    const getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    const expectedContext: Context = {
      locale: 'someLocale',
      groupId: 'someGroupId',
      channelId: 'someChannelId',
      entityId: 'someEntityId',
      teamType: TeamType.Edu,
      teamSiteUrl: 'someSiteUrl',
      sessionId: 'someSessionId',
      appSessionId: 'appSessionId',
      appLaunchId: 'appLaunchId',
      sourceOrigin: 'someOrigin',
      userClickTime: 1000,
      teamTemplateId: 'com.microsoft.teams.ManageAProject',
      userFileOpenPreference: FileOpenPreference.Web,
    };

    // Get many responses to the same message
    for (let i = 0; i < 100; i++) {
      utils.respondToMessage(getContextMessage, expectedContext);
    }
    await contextPromise;

    // Still only called the callback once.
    expect(callbackCalled).toBe(1);
  });

  it('should successfully register a userSettingsChange handler and execute it on setting change', async () => {
    await utils.initializeWithContext('content');

    let changedUserSettingType, changedUserSettingValue;

    registerUserSettingsChangeHandler([UserSettingTypes.fileOpenPreference], (updatedSettingType, updatedValue) => {
      changedUserSettingType = updatedSettingType;
      changedUserSettingValue = updatedValue;
    });

    utils.sendMessage('userSettingsChange', UserSettingTypes.fileOpenPreference, 'value');

    expect(changedUserSettingType).toBe(UserSettingTypes.fileOpenPreference);
    expect(changedUserSettingValue).toBe('value');
  });

  it('should treat messages to frameless windows as coming from the child', () => {
    utils.initializeAsFrameless(['https://www.example.com']);

    // Simulate recieving a child message as a frameless window
    utils.processMessage({
      origin: 'https://www.example.com',
      source: utils.childWindow,
      data: {
        id: 0,
        func: 'themeChange',
        args: ['testTheme'],
      } as MessageResponse,
    } as MessageEvent);

    // The frameless window should send a response back to the child window
    expect(utils.childMessages.length).toBe(1);
  });

  it('should properly pass partial responses to nested child frames ', () => {
    utils.initializeAsFrameless(['https://www.example.com']);

    // Simulate recieving a child message as a frameless window
    utils.processMessage({
      origin: 'https://www.example.com',
      source: utils.childWindow,
      data: {
        id: 100,
        func: 'testPartialFunc1',
        args: ['testArgs'],
      } as MessageResponse,
    } as MessageEvent);

    // Send a partial response back
    const parentMessage = utils.findMessageByFunc('testPartialFunc1');
    utils.respondToNativeMessage(parentMessage, true, {});

    // The child window should properly receive the partial response plus
    // the original event
    expect(utils.childMessages.length).toBe(2);
    const secondChildMessage = utils.childMessages[1];
    expect(utils.childMessages[0].func).toBe('testPartialFunc1');
    expect(secondChildMessage.isPartialResponse).toBeTruthy();

    // Pass the final response (non partial)
    utils.respondToNativeMessage(parentMessage, false, {});

    // The child window should properly receive the non-partial response
    expect(utils.childMessages.length).toBe(3);
    const thirdChildMessage = utils.childMessages[2];
    expect(thirdChildMessage.isPartialResponse).toBeFalsy();
  });

  it('Proxy messages to child window', async () => {
    await utils.initializeWithContext('content', null, ['https://teams.microsoft.com']);
    utils.processMessage({
      origin: 'https://outlook.office.com',
      source: utils.childWindow,
      data: {
        id: 100,
        func: 'backButtonClick',
        args: [],
      } as MessageResponse,
    } as MessageEvent);

    const message = utils.findMessageByFunc('backButtonClick');
    expect(message).not.toBeNull();
    expect(utils.childMessages.length).toBe(1);
    const childMessage = utils.findMessageInChildByFunc('backButtonClick');
    expect(childMessage).not.toBeNull();
  });

  describe('sendCustomMessage', () => {
    it('should successfully pass message and provided arguments', async () => {
      await utils.initializeWithContext('content');

      sendCustomMessage('customMessage', ['arg1', 2, 3.0, true]);

      const message = utils.findMessageByFunc('customMessage');
      expect(message).not.toBeNull();
      expect(message.args).toEqual(['arg1', 2, 3.0, true]);
    });
  });

  describe('sendCustomMessageToChild', () => {
    it('should successfully pass message and provided arguments', async () => {
      await utils.initializeWithContext('content', null, ['https://tasks.office.com']);

      //trigger child window setup
      //trigger processing of message received from child
      utils.processMessage({
        origin: 'https://tasks.office.com',
        source: utils.childWindow,
        data: {
          id: null,
          func: 'customAction1',
          args: ['arg1', 123, 4.5, true],
        } as MessageRequest,
      } as MessageEvent);

      const customActionName = 'customMessageToChild1';
      sendCustomEvent(customActionName, ['arg1', 234, 12.3, true]);

      const message = utils.findMessageInChildByFunc(customActionName);
      expect(message).not.toBeNull();
      expect(message.args).toEqual(['arg1', 234, 12.3, true]);
    });
  });

  describe('addCustomHandler', () => {
    it('should successfully pass message and provided arguments of customAction from parent', async () => {
      await utils.initializeWithContext('content');

      const customActionName = 'customAction1';
      let callbackCalled = false,
        callbackArgs: any[] = null;
      registerCustomHandler(customActionName, (...args) => {
        callbackCalled = true;
        callbackArgs = args;
        return [];
      });

      utils.sendMessage(customActionName, 'arg1', 123, 4.5, true);
      expect(callbackCalled).toBe(true);
      expect(callbackArgs).toEqual(['arg1', 123, 4.5, true]);
    });

    it('should successfully pass message and provided arguments of customAction from child', async () => {
      await utils.initializeWithContext('content', null, ['https://tasks.office.com']);

      const customActionName = 'customAction2';
      let callbackCalled = false,
        callbackArgs: any[] = null;
      registerCustomHandler(customActionName, (...args) => {
        callbackCalled = true;
        callbackArgs = args;
        return [];
      });

      //trigger processing of message received from child
      utils.processMessage({
        origin: 'https://tasks.office.com',
        source: utils.childWindow,
        data: {
          id: null,
          func: customActionName,
          args: ['arg1', 123, 4.5, true],
        } as MessageRequest,
      } as MessageEvent);

      expect(callbackCalled).toBe(true);
      expect(callbackArgs).toEqual(['arg1', 123, 4.5, true]);
    });

    it('should not process be invoked due to invalid origin message from child window', async () => {
      await utils.initializeWithContext('content', null, ['https://tasks.office.com']);

      const customActionName = 'customAction2';
      let callbackCalled = false,
        callbackArgs: any[] = null;
      registerCustomHandler(customActionName, (...args) => {
        callbackCalled = true;
        callbackArgs = args;
        return [];
      });

      //trigger processing of message received from child
      utils.processMessage({
        origin: 'https://tasks.office.net',
        source: utils.childWindow,
        data: {
          id: null,
          func: customActionName,
          args: ['arg1', 123, 4.5, true],
        } as MessageRequest,
      } as MessageEvent);

      expect(callbackCalled).toBe(false);
      expect(callbackArgs).toBeNull();
    });
  });

  describe('openFilePreview', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.task];
    const openFilePreviewParams = {
      entityId: 'someEntityId',
      title: 'someTitle',
      description: 'someDescription',
      type: 'someType',
      objectUrl: 'someObjectUrl',
      downloadUrl: 'someDownloadUrl',
      webPreviewUrl: 'someWebPreviewUrl',
      webEditUrl: 'someWebEditUrl',
      baseUrl: 'someBaseUrl',
      editFile: true,
      subEntityId: 'someSubEntityId',
      viewerAction: ViewerActionTypes.view,
      fileOpenPreference: FileOpenPreference.Web,
      conversationId: 'someConversationId',
    };
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it('should successfully open a file preview with content frameContext', async () => {
          await utils.initializeWithContext(context);

          openFilePreview(openFilePreviewParams);

          const message = utils.findMessageByFunc('openFilePreview');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(14);
          expect(message.args[0]).toBe('someEntityId');
          expect(message.args[1]).toBe('someTitle');
          expect(message.args[2]).toBe('someDescription');
          expect(message.args[3]).toBe('someType');
          expect(message.args[4]).toBe('someObjectUrl');
          expect(message.args[5]).toBe('someDownloadUrl');
          expect(message.args[6]).toBe('someWebPreviewUrl');
          expect(message.args[7]).toBe('someWebEditUrl');
          expect(message.args[8]).toBe('someBaseUrl');
          expect(message.args[9]).toBe(true);
          expect(message.args[10]).toBe('someSubEntityId');
          expect(message.args[11]).toBe('view');
          expect(message.args[12]).toBe(FileOpenPreference.Web);
          expect(message.args[13]).toBe('someConversationId');
        });
      } else {
        it(`remoteCamera.registerOnCapableParticipantsChangeHandler should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => openFilePreview(openFilePreviewParams)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
