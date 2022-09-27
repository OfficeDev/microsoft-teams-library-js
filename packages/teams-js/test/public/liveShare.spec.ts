import { LiveShareHost } from '../../src/internal/liveShareHost';
import { liveShare } from '../../src/public/liveShare';

describe('MicrosoftTeams-LiveShare', () => {
  describe('initialize', () => {
    it('should throw error due to package not being found', async () => {
      await expect(liveShare.initialize()).rejects.toThrowError(
        'Unable to initialize Live Share client. Ensure that your project includes "@microsoft/live-share"',
      );
    });
  });

  describe('joinContainer', () => {
    it('should throw error due to client not being initialized()', async () => {
      await expect(liveShare.joinContainer({} as any)).rejects.toThrowError(
        'Live Share must first be initialized',
      );
    });
  });

  describe('getHost', () => {
    it('should return a host object', async () => {
      const host = liveShare.getHost();
      expect(host).toBeInstanceOf(LiveShareHost);
    });
  });
});