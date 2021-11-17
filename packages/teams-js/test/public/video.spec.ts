import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { video } from '../../src/public/video';
import { Utils } from '../utils';
/**
 * Test cases for selectPeople API
 */
describe('video', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const utils = new Utils();

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  let emptyVideoEffectCallback = (
    _frame: video.VideoFrame,
    _notifyVideoFrameProcessed: () => void,
    _notifyError: (errorMessage: string) => void,
  ): void => {};
  const videoFrameConfig: video.VideoFrameConfig = {
    format: video.VideoFrameFormat.NV12,
  };
  it('should not allow calls from the wrong context', async () => {
    await utils.initializeWithContext('content');
    expect(() => video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig)).toThrowError(
      'This call is only allowed in following contexts: ["sidePanel"]. Current context: "content".',
    );
    expect(() =>
      video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, 'sample effect config'),
    ).toThrowError('This call is only allowed in following contexts: ["sidePanel"]. Current context: "content".');
  });

  it('register for video frame event', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
    video.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);
    const message = mobilePlatformMock.findMessageByFunc('video.registerForVideoFrame');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('register for video effect change event', async () => {
    await mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
    video.notifySelectedVideoEffectChanged(video.EffectChangeType.EffectChanged, 'sample effect config');
    const message = mobilePlatformMock.findMessageByFunc('video.videoEffectChanged');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
  });
});
