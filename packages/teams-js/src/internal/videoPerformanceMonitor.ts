import { VideoFrameTick } from './videoFrameTick';
import { VideoPerformanceStatistics } from './videoPerformanceStatistics';

/**
 * This class is used to monitor the performance of video processing, and report performance events.
 */
export class VideoPerformanceMonitor {
  private static readonly distributionBinSize = 1000;
  private static readonly calculateFPSInterval = 1000;

  private isFirstFrameProcessed = false;

  // The effect that the user last selected:
  private applyingEffect: {
    effectId: string;
    effectParam?: string;
  };

  // The effect that is currently applied to the video:
  private appliedEffect: {
    effectId: string;
    effectParam?: string;
  };

  private frameProcessTimeLimit = 100;
  private gettingTextureStreamStartedAt: number;
  private currentStreamId: string;
  private frameProcessingStartedAt = 0;
  private frameProcessingTimeCost = 0;
  private processedFrameCount = 0;

  private performanceStatistics: VideoPerformanceStatistics;

  public constructor(private reportPerformanceEvent: (actionName: string, args: unknown[]) => void) {
    this.performanceStatistics = new VideoPerformanceStatistics(VideoPerformanceMonitor.distributionBinSize, (result) =>
      this.reportPerformanceEvent('video.performance.performanceDataGenerated', [result]),
    );
  }

  /**
   * Start to check frame processing time intervally
   * and report performance event if the average frame processing time is too long.
   */
  public startMonitorSlowFrameProcessing(): void {
    VideoFrameTick.setInterval(() => {
      if (this.processedFrameCount === 0) {
        return;
      }
      const averageFrameProcessingTime = this.frameProcessingTimeCost / this.processedFrameCount;
      if (averageFrameProcessingTime > this.frameProcessTimeLimit) {
        this.reportPerformanceEvent('video.performance.frameProcessingSlow', [averageFrameProcessingTime]);
      }
      this.frameProcessingTimeCost = 0;
      this.processedFrameCount = 0;
    }, VideoPerformanceMonitor.calculateFPSInterval);
  }

  /**
   * Define the time limit of frame processing.
   * When the average frame processing time is longer than the time limit, a "video.performance.frameProcessingSlow" event will be reported.
   * @param timeLimit
   */
  public setFrameProcessTimeLimit(timeLimit: number): void {
    this.frameProcessTimeLimit = timeLimit;
  }

  /**
   * Call this function when the app starts to switch to the new video effect
   */
  public reportApplyingVideoEffect(effectId: string, effectParam?: string): void {
    if (this.applyingEffect?.effectId === effectId && this.applyingEffect?.effectParam === effectParam) {
      return;
    }
    this.applyingEffect = {
      effectId,
      effectParam,
    };
    this.appliedEffect = undefined;
  }

  /**
   * Call this function when the new video effect is ready
   */
  public reportVideoEffectChanged(effectId: string, effectParam?: string): void {
    if (
      this.applyingEffect === undefined ||
      (this.applyingEffect.effectId !== effectId && this.applyingEffect.effectParam !== effectParam)
    ) {
      // don't handle obsoleted event
      return;
    }
    this.appliedEffect = {
      effectId,
      effectParam,
    };
    this.applyingEffect = undefined;
    this.isFirstFrameProcessed = false;
  }

  /**
   * Call this function when the app starts to process a video frame
   */
  public reportStartFrameProcessing(frameWidth: number, frameHeight: number): void {
    VideoFrameTick.tick();
    if (!this.appliedEffect) {
      return;
    }
    this.frameProcessingStartedAt = performance.now();
    this.performanceStatistics.processStarts(
      this.appliedEffect.effectId,
      frameWidth,
      frameHeight,
      this.appliedEffect.effectParam,
    );
  }

  /**
   * Call this function when the app finishes successfully processing a video frame
   */
  public reportFrameProcessed(): void {
    if (!this.appliedEffect) {
      return;
    }
    this.processedFrameCount++;
    this.frameProcessingTimeCost += performance.now() - this.frameProcessingStartedAt;
    this.performanceStatistics.processEnds();
    if (!this.isFirstFrameProcessed) {
      this.isFirstFrameProcessed = true;
      this.reportPerformanceEvent('video.performance.firstFrameProcessed', [
        Date.now(),
        this.appliedEffect.effectId,
        this.appliedEffect?.effectParam,
      ]);
    }
  }

  /**
   * Call this function when the app starts to get the texture stream
   */
  public reportGettingTextureStream(streamId: string): void {
    this.gettingTextureStreamStartedAt = performance.now();
    this.currentStreamId = streamId;
  }

  /**
   * Call this function when the app finishes successfully getting the texture stream
   */
  public reportTextureStreamAcquired(): void {
    if (this.gettingTextureStreamStartedAt !== undefined) {
      const timeTaken = performance.now() - this.gettingTextureStreamStartedAt;
      this.reportPerformanceEvent('video.performance.textureStreamAcquired', [this.currentStreamId, timeTaken]);
    }
  }
}
