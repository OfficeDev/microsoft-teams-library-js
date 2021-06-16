import { core } from '../../src/public';
import { Utils } from '../utils';
import { teams } from '../../src/private/teams';
import { TeamInstanceParameters } from '../../src/private/interfaces';

describe('teamsjsAppSDK-privateAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();
  const emptyCallback = () => {};

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
  describe('getUserJoinedTeams', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        teams.fullTrust.getUserJoinedTeams(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid optional parameter set to true', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      teams.fullTrust.getUserJoinedTeams(
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
      teams.fullTrust.getUserJoinedTeams(
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
      teams.fullTrust.getUserJoinedTeams(() => {
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
      teams.fullTrust.getUserJoinedTeams(
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
        teams.fullTrust.getConfigSetting(() => {
          return;
        }, 'key'),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should allow a valid parameter', () => {
      utils.initializeWithContext('content');

      let callbackCalled: boolean = false;
      teams.fullTrust.getConfigSetting(() => {
        callbackCalled = true;
      }, 'key');

      let getConfigSettingMessage = utils.findMessageByFunc('getConfigSetting');
      expect(getConfigSettingMessage).not.toBeNull();
      utils.respondToMessage(getConfigSettingMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });
  describe('getTeamChannels', () => {
    it('should not allow calls before initialization', () => {
      expect(() => teams.fullTrust.getTeamChannels('groupId', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => teams.fullTrust.getTeamChannels('groupId', emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null groupId', () => {
      utils.initializeWithContext('content');
      expect(() => teams.fullTrust.getTeamChannels(null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => teams.fullTrust.getTeamChannels('groupId', null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');
      const mockTeamsChannels: teams.fullTrust.ChannelInfo[] = [
        {
          siteUrl: 'https://microsoft.sharepoint.com/teams/teamsName',
          objectId: 'someId',
          folderRelativeUrl: '/teams/teamsName/Shared Documents/General',
          displayName: 'General',
          channelType: teams.fullTrust.ChannelType.Regular,
        },
      ];

      const callback = jest.fn((err, folders) => {
        expect(err).toBeFalsy();
        expect(folders).toEqual(mockTeamsChannels);
      });

      teams.fullTrust.getTeamChannels('groupId', callback);

      const getCloudStorageFoldersMessage = utils.findMessageByFunc('teams.getTeamChannels');
      expect(getCloudStorageFoldersMessage).not.toBeNull();
      utils.respondToMessage(getCloudStorageFoldersMessage, false, mockTeamsChannels);
      expect(callback).toHaveBeenCalled();
    });
  });
});
