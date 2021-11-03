import { app } from '../../src/public';
import { Utils } from '../utils';
import { legacy, TeamInstanceParameters } from '../../src/private';

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
  describe('getUserJoinedTeams', () => {
    it('should not allow calls before initialization', () => {
      return expect(legacy.fullTrust.getUserJoinedTeams()).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should allow a valid optional parameter set to true', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getUserJoinedTeams({ favoriteTeamsOnly: true } as TeamInstanceParameters);

      const getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      return expect(promise).resolves;
    });

    it('should allow a valid optional parameter set to false', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getUserJoinedTeams({ favoriteTeamsOnly: false } as TeamInstanceParameters);

      const getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      return expect(promise).resolves;
    });

    it('should allow a missing optional parameter', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getUserJoinedTeams();

      const getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      return expect(promise).resolves;
    });

    it('should allow a missing and valid optional parameter', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getUserJoinedTeams({} as TeamInstanceParameters);

      const getUserJoinedTeamsMessage = utils.findMessageByFunc('getUserJoinedTeams');
      expect(getUserJoinedTeamsMessage).not.toBeNull();
      utils.respondToMessage(getUserJoinedTeamsMessage, {});
      return expect(promise).resolves;
    });
  });

  describe('getConfigSetting', () => {
    it('should not allow calls before initialization', () => {
      return expect(legacy.fullTrust.getConfigSetting('key')).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should allow a valid parameter', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getConfigSetting('key');

      const getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      return expect(promise).resolves;
    });

    it('should allow an empty key', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getConfigSetting('');

      const getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(promise).resolves;
    });

    it('should allow a null key', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getConfigSetting(null);

      const getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(promise).resolves;
    });

    it('should allow an undefined key', async () => {
      await utils.initializeWithContext('content');

      const promise = legacy.fullTrust.getConfigSetting(undefined);

      const getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(promise).resolves;
    });
  });
});
