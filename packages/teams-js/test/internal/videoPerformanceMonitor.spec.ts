/* eslint-disable strict-null-checks/all */
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';

const processStartsMock = jest.fn();
const processEndsMock = jest.fn();
jest.mock('../../src/internal/performanceStatistics', () => {
  return {
    PerformanceStatistics: jest.fn().mockImplementation(() => {
      return {
        processStarts: processStartsMock,
        processEnds: processEndsMock,
      };
    }),
  };
});

describe('VideoPerformanceMonitor', () => {
  const reportPerformanceEvent = jest.fn();
  let videoPerformanceMonitor: VideoPerformanceMonitor;
  beforeEach(() => {
    videoPerformanceMonitor = new VideoPerformanceMonitor(reportPerformanceEvent);
  });

  it('should report firstFrameProcessed event', () => {
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    videoPerformanceMonitor.reportFrameProcessed();
    expect(reportPerformanceEvent).toBeCalledWith('video.videoExtensibilityFirstFrameProcessed', [
      expect.anything(), // timestamp
      'effectId',
      'effectParam',
    ]);
  });

  it('should report processStarts/ends', () => {
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    videoPerformanceMonitor.reportStartFrameProcessing(100, 100);
    videoPerformanceMonitor.reportFrameProcessed();
    expect(processStartsMock).toBeCalledWith('effectId', 100, 100);
  });

  it('should report TextureStreamAcquired event', () => {
    videoPerformanceMonitor.reportGettingTextureStream('streamId');
    videoPerformanceMonitor.reportTextureStreamAcquired();
    expect(reportPerformanceEvent).toBeCalledWith('video.videoExtensibilityTextureStreamAcquired', [
      'streamId',
      expect.anything(), // timeTaken
    ]);
  });
});
