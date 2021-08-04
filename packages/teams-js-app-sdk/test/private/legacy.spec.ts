import { app } from '../../src/public';
import { Utils } from '../utils';
import { legacy, TeamInstanceParameters } from '../../src/private';

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
  describe('getUserJoinedTeams', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        legacy.fullTrust.getUserJoinedTeams(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid optional parameter set to true', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      legacy.fullTrust.getUserJoinedTeams(
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

    it('should allow a valid optional parameter set to false', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      legacy.fullTrust.getUserJoinedTeams(
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

    it('should allow a missing optional parameter', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      legacy.fullTrust.getUserJoinedTeams(() => {
        callbackCalled = true;
      });

      let getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      expect(callbackCalled).toBe(true);
    });

    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      legacy.fullTrust.getUserJoinedTeams(
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

  describe('getConfigSetting', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        legacy.fullTrust.getConfigSetting(() => {
          return;
        }, 'key'),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid parameter', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      legacy.fullTrust.getConfigSetting(() => {
        callbackCalled = true;
      }, 'key');

      let getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });
});
