import { core } from '../../src/public';
import { Utils } from '../utils';
import { teams } from '../../src/private/teams'


describe('teams', () => {
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
