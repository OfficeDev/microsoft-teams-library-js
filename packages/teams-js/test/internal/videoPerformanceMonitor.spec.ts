/* eslint-disable strict-null-checks/all */
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';

jest.useFakeTimers();
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
    jest.clearAllMocks();
    videoPerformanceMonitor = new VideoPerformanceMonitor(reportPerformanceEvent);
  });

  it('should report firstFrameProcessed event', () => {
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    jest.advanceTimersByTime(10);
    videoPerformanceMonitor.reportFrameProcessed();
    expect(reportPerformanceEvent).toBeCalledWith('video.performance.firstFrameProcessed', [
      expect.any(Number), // timestamp
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
    jest.advanceTimersByTime(10);
    videoPerformanceMonitor.reportTextureStreamAcquired();
    expect(reportPerformanceEvent).toBeCalledWith('video.performance.textureStreamAcquired', ['streamId', 10]);
  });

  it('should report videoExtensibilityFrameProcessingSlow event', async () => {
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    for (let i = 0; i < 10; i++) {
      videoPerformanceMonitor.reportStartFrameProcessing(100, 100);
      jest.advanceTimersByTime(101);
      videoPerformanceMonitor.reportFrameProcessed();
    }
    expect(reportPerformanceEvent).toBeCalledWith('video.performance.frameProcessingSlow', [101]);
  });
});
