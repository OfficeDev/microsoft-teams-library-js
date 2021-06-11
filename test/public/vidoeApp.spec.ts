import { FramelessPostMocks } from '../framelessPostMocks';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { FrameContexts } from '../../src/public/constants';
import { videoApp } from '../../src/public/videoApp';
import { Utils } from '../utils';
/**
 * Test cases for selectPeople API
 */
describe('videoApp', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const utils = new Utils();

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    _initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  let emptyVideoEffectCallback = (
    _frame: videoApp.VideoFrame,
    _notifyVideoFrameProcessed: () => void,
    _notifyError: (errorMessage: string) => void,
  ): void => {};
  const videoFrameConfig: videoApp.VideoFrameConfig = {
    format: videoApp.VideoFrameFormat.NV12,
  };
  it('should not allow calls from the wrong context', () => {
    utils.initializeWithContext('content');
    expect(() => videoApp.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig)).toThrowError(
      "This call is not allowed in the 'content' context",
    );
    expect(() =>
      videoApp.notifySelectedVideoEffectChanged(videoApp.EffectChangeType.EffectChanged, 'sample effect config'),
    ).toThrowError("This call is not allowed in the 'content' context");
  });

  it('register for video frame event', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
    videoApp.registerForVideoFrame(emptyVideoEffectCallback, videoFrameConfig);
    const message = mobilePlatformMock.findMessageByFunc('videoApp.registerForVideoFrame');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(1);
  });

  it('register for video effect change event', () => {
    mobilePlatformMock.initializeWithContext(FrameContexts.sidePanel);
    videoApp.notifySelectedVideoEffectChanged(videoApp.EffectChangeType.EffectChanged, 'sample effect config');
    const message = mobilePlatformMock.findMessageByFunc('videoApp.videoEffectChanged');
    expect(message).not.toBeNull();
    expect(message.args.length).toBe(2);
  });
});
