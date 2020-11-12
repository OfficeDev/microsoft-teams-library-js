import * as microsoftTeams from '../../src/public/publicAPIs';
import { Context } from '../../src/public/interfaces';
import { TeamInstanceParameters, ViewerActionTypes } from '../../src/private/interfaces';
import { TeamType } from '../../src/public/constants';
import { Utils, MessageResponse, MessageRequest } from '../utils';
import {
  openFilePreview,
  getUserJoinedTeams,
  sendCustomMessage,
  registerCustomHandler,
  getChatMembers,
  getConfigSetting,
  enterFullscreen,
  exitFullscreen,
  sendCustomEvent,
} from '../../src/private/privateAPIs';
import { initialize, _initialize, _uninitialize, getContext } from '../../src/public/publicAPIs';

describe('MicrosoftTeams-privateAPIs', () => {
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

  it('should exist in the global namespace', () => {
    expect(microsoftTeams).toBeDefined();
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
    'http://invalid.origin.com'
  ];

  unSupportedDomains.forEach(unSupportedDomain => {
    it('should reject utils.messages from unsupported domain: ' + unSupportedDomain, () => {
      utils.initializeWithContext('content', null, null, ['http://invalid.origin.com']);
      let callbackCalled = false;
      getContext(() => {
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
      let callbackCalled = false;
      getContext(() => {
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
    initialize(null, ['http://some-invalid-origin.com']);

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
    let callbackCalled = false;
    getContext(() => {
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
    getContext(() => {
      callbackCalled = true;
      return;
    });

    // Only the init call went out
    expect(utils.messages.length).toBe(1);
    expect(callbackCalled).toBe(false);
  });

  it('should successfully handle calls queued before init completes', () => {
    initialize();

    // Another call made before the init response
    getContext(() => {
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
    getContext(context => {
      actualContext1 = context;
    });

    let getContextMessage1 = utils.messages[utils.messages.length - 1];

    let actualContext2: Context;
    getContext(context => {
      actualContext2 = context;
    });

    let getContextMessage2 = utils.messages[utils.messages.length - 1];

    let actualContext3: Context;
    getContext(context => {
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
    getContext(() => {
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
    };

    // Get many responses to the same message
    for (let i = 0; i < 100; i++) {
      utils.respondToMessage(getContextMessage, expectedContext);
    }

    // Still only called the callback once.
    expect(callbackCalled).toBe(1);
  });

  it('should successfully open a file preview', () => {
    utils.initializeWithContext('content');

    openFilePreview({
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
    });

    let message = utils.findMessageByFunc('openFilePreview');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(12);
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
  });

  describe('getUserJoinedTeams', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        getUserJoinedTeams(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid optional parameter set to true', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getUserJoinedTeams(
        () => {
          callbackCalled = true;
        },
        { favoriteTeamsOnly: true } as TeamInstanceParameters,
      );

      let getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it('should allow a valid optional parameter set to false', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getUserJoinedTeams(
        () => {
          callbackCalled = true;
        },
        { favoriteTeamsOnly: false } as TeamInstanceParameters,
      );

      let getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it('should allow a missing optional parameter', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getUserJoinedTeams(() => {
        callbackCalled = true;
      });

      let getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it('should allow a missing and valid optional parameter', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getUserJoinedTeams(
        () => {
          callbackCalled = true;
        },
        {} as TeamInstanceParameters,
      );

      let getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe('sendCustomMessage', () => {
    it('should successfully pass message and provided arguments', () => {
      utils.initializeWithContext('content');

      const id = sendCustomMessage('customMessage', ['arg1', 2, 3.0, true]);

      let message = utils.findMessageByFunc('customMessage');
      expect(message).not.toBeNull();
      expect(message.args).toEqual(['arg1', 2, 3.0, true]);
      expect(id).toBe(message.id);
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
      let callbackCalled: boolean = false,
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
      let callbackCalled: boolean = false,
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
      let callbackCalled: boolean = false,
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

  describe('getChatMembers', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        getChatMembers(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get chat members', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getChatMembers(() => {
        callbackCalled = true;
      });

      let getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
      expect(getChatMembersMessage).not.toBeNull();
      utils.respondToMessage(getChatMembersMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe('getConfigSetting', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        getConfigSetting(() => {
          return;
        }, 'key'),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid parameter', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      getConfigSetting(() => {
        callbackCalled = true;
      }, 'key');

      let getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  describe('enterFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => enterFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => enterFullscreen()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => enterFullscreen()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => enterFullscreen()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from task context', () => {
      utils.initializeWithContext('task');

      expect(() => enterFullscreen()).toThrowError("This call is not allowed in the 'task' context");
    });

    it('should successfully enter fullscreen', () => {
      utils.initializeWithContext('content');

      enterFullscreen();

      const enterFullscreenMessage = utils.findMessageByFunc('enterFullscreen');
      expect(enterFullscreenMessage).not.toBeNull();
    });
  });

  describe('exitFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => exitFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => exitFullscreen()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => exitFullscreen()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => exitFullscreen()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from task context', () => {
      utils.initializeWithContext('task');

      expect(() => exitFullscreen()).toThrowError("This call is not allowed in the 'task' context");
    });

    it('should successfully exit fullscreen', () => {
      utils.initializeWithContext('content');

      exitFullscreen();

      const exitFullscreenMessage = utils.findMessageByFunc('exitFullscreen');
      expect(exitFullscreenMessage).not.toBeNull();
    });
  });
});
