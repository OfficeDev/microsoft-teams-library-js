import { VideoFrameTick } from './videoFrameTick';
import { VideoPerformanceStatistics } from './videoPerformanceStatistics';

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

  public setFrameProcessTimeLimit(timeLimit: number): void {
    this.frameProcessTimeLimit = timeLimit;
  }

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

  public reportStartFrameProcessing(frameWidth: number, frameHeight: number): void {
    VideoFrameTick.tick();
    if (!this.appliedEffect) {
      return;
    }
    this.frameProcessingStartedAt = performance.now();
    this.performanceStatistics.processStarts(this.appliedEffect.effectId, frameWidth, frameHeight);
  }

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

  public reportGettingTextureStream(streamId: string): void {
    this.gettingTextureStreamStartedAt = performance.now();
    this.currentStreamId = streamId;
  }

  public reportTextureStreamAcquired(): void {
    if (this.gettingTextureStreamStartedAt !== undefined) {
      const timeTaken = performance.now() - this.gettingTextureStreamStartedAt;
      this.reportPerformanceEvent('video.performance.textureStreamAcquired', [this.currentStreamId, timeTaken]);
    }
  }
}
