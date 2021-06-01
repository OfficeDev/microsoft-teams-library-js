import { teams } from '../../src/private/teams';
import { Utils } from '../utils';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';

describe('teams', () => {
  const utils = new Utils();
  const emptyCallback = () => {};

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('getTeamsChannels', () => {
    it('should not allow calls before initialization', () => {
      expect(() => teams.getTeamsChannels('teamId', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => teams.getTeamsChannels('teamId', emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null teamId', () => {
      utils.initializeWithContext('content');
      expect(() => teams.getTeamsChannels(null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => teams.getTeamsChannels('teamId', null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');
      const mockTeamsChannels: teams.TeamsChannelInfo[] = [
        {
          siteUrl: 'https://microsoft.sharepoint.com/teams/teamsName',
          objectId: 'someId',
          folderRelativeUrl: '/teams/teamsName/Shared Documents/General',
          displayName: 'General',
          channelType: teams.ChannelType.Regular,
        },
      ];

      const callback = jest.fn((err, folders) => {
        expect(err).toBeFalsy();
        expect(folders).toEqual(mockTeamsChannels);
      });

      teams.getTeamsChannels('teamId', callback);

      const getCloudStorageFoldersMessage = utils.findMessageByFunc('teams.getTeamsChannels');
      expect(getCloudStorageFoldersMessage).not.toBeNull();
      utils.respondToMessage(getCloudStorageFoldersMessage, false, mockTeamsChannels);
      expect(callback).toHaveBeenCalled();
    });
  });
});