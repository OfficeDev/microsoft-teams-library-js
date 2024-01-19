/* eslint-disable strict-null-checks/all */
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../src/internal/telemetry';
import { VideoFrameTick } from '../../src/internal/videoFrameTick';
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const videoPerformanceMonitorTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

jest.useFakeTimers();
function advanceTimersByTime(time: number): void {
  jest.advanceTimersByTime(time);
  VideoFrameTick.tick();
}
const processStartsMock = jest.fn();
const processEndsMock = jest.fn();
jest.mock('../../src/internal/videoPerformanceStatistics', () => {
  return {
    VideoPerformanceStatistics: jest.fn().mockImplementation(() => {
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
    videoPerformanceMonitor.reportApplyingVideoEffect('effectId1', 'effectParam');
    videoPerformanceMonitor.reportApplyingVideoEffect('effectId2', 'effectParam');
    videoPerformanceMonitor.reportVideoEffectChanged('effectId2', 'effectParam');
    videoPerformanceMonitor.reportVideoEffectChanged('effectId1', 'effectParam');
    advanceTimersByTime(10);
    videoPerformanceMonitor.reportFrameProcessed();
    expect(reportPerformanceEvent).toBeCalledWith(
      getApiVersionTag(
        videoPerformanceMonitorTelemetryVersionNumber,
        ApiName.VideoPerformanceMonitor_ReportFrameProcessed,
      ),
      'video.performance.firstFrameProcessed',
      [
        expect.any(Number), // timestamp
        'effectId2',
        'effectParam',
      ],
    );
  });

  it('should report processStarts/ends', () => {
    videoPerformanceMonitor.reportApplyingVideoEffect('effectId', 'effectParam');
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    videoPerformanceMonitor.reportStartFrameProcessing(100, 100);
    videoPerformanceMonitor.reportFrameProcessed();
    expect(processStartsMock).toBeCalledWith('effectId', 100, 100, 'effectParam');
  });

  it('should report TextureStreamAcquired event', () => {
    videoPerformanceMonitor.reportGettingTextureStream('streamId');
    advanceTimersByTime(10);
    videoPerformanceMonitor.reportTextureStreamAcquired();
    expect(reportPerformanceEvent).toBeCalledWith(
      getApiVersionTag(
        videoPerformanceMonitorTelemetryVersionNumber,
        ApiName.VideoPerformanceMonitor_ReportTextureStreamAcquired,
      ),
      'video.performance.textureStreamAcquired',
      ['streamId', 10],
    );
  });

  it('should report videoExtensibilityFrameProcessingSlow event', async () => {
    videoPerformanceMonitor.reportApplyingVideoEffect('effectId', 'effectParam');
    videoPerformanceMonitor.reportVideoEffectChanged('effectId', 'effectParam');
    videoPerformanceMonitor.startMonitorSlowFrameProcessing();
    advanceTimersByTime(101);
    for (let i = 0; i < 10; i++) {
      videoPerformanceMonitor.reportStartFrameProcessing(100, 100);
      advanceTimersByTime(101);
      videoPerformanceMonitor.reportFrameProcessed();
    }
    expect(reportPerformanceEvent).toBeCalledWith(
      getApiVersionTag(
        videoPerformanceMonitorTelemetryVersionNumber,
        ApiName.VideoPerformanceMonitor_StartMonitorSlowFrameProcessing,
      ),
      'video.performance.frameProcessingSlow',
      [101],
    );
  });
});
