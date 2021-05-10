import { core } from '../../src/public/publicAPIs';
import { Context, FileOpenPreference } from '../../src/public/interfaces';
import { TeamInstanceParameters, ViewerActionTypes, UserSettingTypes } from '../../src/private/interfaces';
import { TeamType } from '../../src/public/constants';
import { Utils, MessageResponse, MessageRequest } from '../utils';
import {
  sendCustomMessage,
  registerCustomHandler,
  sendCustomEvent,
  registerUserSettingsChangeHandler,
} from '../../src/private/privateAPIs';

describe('teamsjsAppSDK-privateAPIs', () => {
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

  it('should exist in the global namespace', () => {
    expect(core).toBeDefined();
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

  unSupportedDomains.forEach(unSupportedDomain => {
    it('should reject utils.messages from unsupported domain: ' + unSupportedDomain, () => {
      utils.initializeWithContext('content', null, null, ['http://invalid.origin.com']);
      let callbackCalled: boolean = false;
      core.getContext(() => {
        callbackCalled = true;
      });

      let getContextMessage = utils.findMessageByFunc('getContext');
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

      expect(callbackCalled).toBe(false);
    });
  });

  const supportedDomains = [
    'https://teams.microsoft.com',
    'https://teams.microsoft.us',
    'https://gov.teams.microsoft.us',
    'https://dod.teams.microsoft.us',
    'https://int.teams.microsoft.com',
    'https://devspaces.skype.com',
    'https://local.teams.office.com',
    'https://microsoft.sharepoint.com',
    'https://msft.spoppe.com',
    'https://microsoft.sharepoint-df.com',
    'https://microsoft.sharepointonline.com',
    'https://outlook.office.com',
    'https://outlook-sdf.office.com',
    'https://retailservices.teams.microsoft.com',
    'https://tasks.office.com',
    'https://www.example.com',
  ];

  supportedDomains.forEach(supportedDomain => {
    it('should allow utils.messages from supported domain ' + supportedDomain, () => {
      utils.initializeWithContext('content', null, null, ['https://tasks.office.com', 'https://www.example.com']);
      let callbackCalled: boolean = false;
      core.getContext(() => {
        callbackCalled = true;
      });

      let getContextMessage = utils.findMessageByFunc('getContext');
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

      expect(callbackCalled).toBe(true);
    });
  });

  it('should not make calls to unsupported domains', () => {
    core.initialize(null, ['http://some-invalid-origin.com']);

    let initMessage = utils.findMessageByFunc('initialize');
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
    let callbackCalled: boolean = false;
    core.getContext(() => {
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
    core.getContext(() => {
      callbackCalled = true;
      return;
    });

    // Only the init call went out
    expect(utils.messages.length).toBe(1);
    expect(callbackCalled).toBe(false);
  });

  it('should successfully handle calls queued before init completes', () => {
    core.initialize();

    // Another call made before the init response
    core.getContext(() => {
      return;
    });

    // Only the init call went out
    expect(utils.messages.length).toBe(1);
    let initMessage = utils.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    expect(utils.findMessageByFunc('getContext')).toBeNull();

    // init completes
    utils.respondToMessage(initMessage, 'content');

    // Now the getContext call should have been dequeued
    expect(utils.messages.length).toBe(2);
    expect(utils.findMessageByFunc('getContext')).not.toBeNull();
  });

  it('should successfully handle out of order calls', () => {
    utils.initializeWithContext('content');

    let actualContext1: Context;
    core.getContext(context => {
      actualContext1 = context;
    });

    let getContextMessage1 = utils.messages[utils.messages.length - 1];

    let actualContext2: Context;
    core.getContext(context => {
      actualContext2 = context;
    });

    let getContextMessage2 = utils.messages[utils.messages.length - 1];

    let actualContext3: Context;
    core.getContext(context => {
      actualContext3 = context;
    });

    let getContextMessage3 = utils.messages[utils.messages.length - 1];

    // They're all distinct utils.messages
    expect(getContextMessage3).not.toBe(getContextMessage1);
    expect(getContextMessage2).not.toBe(getContextMessage1);
    expect(getContextMessage3).not.toBe(getContextMessage2);

    let expectedContext1: Context = {
      locale: 'someLocale1',
      groupId: 'someGroupId1',
      channelId: 'someChannelId1',
      entityId: 'someEntityId1',
    };
    let expectedContext2: Context = {
      locale: 'someLocale2',
      groupId: 'someGroupId2',
      channelId: 'someChannelId2',
      entityId: 'someEntityId2',
    };
    let expectedContext3: Context = {
      locale: 'someLocale3',
      groupId: 'someGroupId3',
      channelId: 'someChannelId3',
      entityId: 'someEntityId3',
    };

    // respond in the wrong order
    utils.respondToMessage(getContextMessage3, expectedContext3);
    utils.respondToMessage(getContextMessage1, expectedContext1);
    utils.respondToMessage(getContextMessage2, expectedContext2);

    // The callbacks were associated with the correct utils.messages
    expect(actualContext1).toBe(expectedContext1);
    expect(actualContext2).toBe(expectedContext2);
    expect(actualContext3).toBe(expectedContext3);
  });

  it('should only call callbacks once', () => {
    utils.initializeWithContext('content');

    let callbackCalled = 0;
    core.getContext(() => {
      callbackCalled++;
    });

    let getContextMessage = utils.findMessageByFunc('getContext');
    expect(getContextMessage).not.toBeNull();

    let expectedContext: Context = {
      locale: 'someLocale',
      groupId: 'someGroupId',
      channelId: 'someChannelId',
      entityId: 'someEntityId',
      teamType: TeamType.Edu,
      teamSiteUrl: 'someSiteUrl',
      sessionId: 'someSessionId',
      appSessionId: 'appSessionId',
      sourceOrigin: 'someOrigin',
      userClickTime: 1000,
      teamTemplateId: 'com.microsoft.teams.ManageAProject',
      userFileOpenPreference: FileOpenPreference.Web,
    };

    // Get many responses to the same message
    for (let i = 0; i < 100; i++) {
      utils.respondToMessage(getContextMessage, expectedContext);
    }

    // Still only called the callback once.
    expect(callbackCalled).toBe(1);
  });

  it('should successfully register a userSettingsChange handler and execute it on setting change', () => {
    utils.initializeWithContext('content');

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
    utils.initializeAsFrameless(null, ['https://www.example.com']);

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
    utils.initializeAsFrameless(null, ['https://www.example.com']);

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

    // The child window should properly receive the partial response
    expect(utils.childMessages.length).toBe(1);
    const firstChildMessage = utils.childMessages[0];
    expect(firstChildMessage.isPartialResponse).toBeTruthy();

    // Pass the final response (non partial)
    utils.respondToNativeMessage(parentMessage, false, {});

    // The child window should properly receive the non-partial response
    expect(utils.childMessages.length).toBe(2);
    const secondChildMessage = utils.childMessages[1];
    expect(secondChildMessage.isPartialResponse).toBeFalsy();
  });

  describe('sendCustomMessage', () => {
    it('should successfully pass message and provided arguments', () => {
      utils.initializeWithContext('content');

      sendCustomMessage('customMessage', ['arg1', 2, 3.0, true]);

      let message = utils.findMessageByFunc('customMessage');
      expect(message).not.toBeNull();
      expect(message.args).toEqual(['arg1', 2, 3.0, true]);
    });
  });

  describe('sendCustomMessageToChild', () => {
    it('should successfully pass message and provided arguments', () => {
      utils.initializeWithContext('content', null, null, ['https://tasks.office.com']);

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

      let message = utils.findMessageInChildByFunc(customActionName);
      expect(message).not.toBeNull();
      expect(message.args).toEqual(['arg1', 234, 12.3, true]);
    });
  });

  describe('addCustomHandler', () => {
    it('should successfully pass message and provided arguments of customAction from parent', () => {
      utils.initializeWithContext('content');

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

    it('should successfully pass message and provided arguments of customAction from child', () => {
      utils.initializeWithContext('content', null, null, ['https://tasks.office.com']);

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

    it('should not process be invoked due to invalid origin message from child window', () => {
      utils.initializeWithContext('content', null, null, ['https://tasks.office.com']);

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
});
