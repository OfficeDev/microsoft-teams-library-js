import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { PerformanceStatistics } from './performanceStatistics';

export class VideoPerformanceMonitor {
  private isFirstFrameProcessed = false;
  private currentSelectedEffect: {
    effectId: string;
    effectParam?: string;
  };

  private startGettingTextureStreamTime: number;
  private currentSteamId: string;
  private frameProcessingStartedAt = 0;
  private frameProcessingTimeCost = 0;
  private processedFrameCount = 0;

  private performanceStatistics: PerformanceStatistics;

  public constructor(private reportPerformanceEvent: (actionName: string, args: unknown[]) => void) {
    if (inServerSideRenderingEnvironment()) {
      throw errorNotSupportedOnPlatform;
    }
    this.performanceStatistics = new PerformanceStatistics(1000, (result) =>
      this.reportPerformanceEvent('video.videoExtensibilityPerformanceDataGenerated', [result]),
    );
    window.setInterval(() => {
      if (this.processedFrameCount === 0) {
        return;
      }
      const averageFrameProcessingTime = this.frameProcessingTimeCost / this.processedFrameCount;
      if (averageFrameProcessingTime > 100) {
        this.reportPerformanceEvent('video.videoExtensibilityFrameProcessingSlow', [averageFrameProcessingTime]);
      }
      this.frameProcessingTimeCost = 0;
      this.processedFrameCount = 0;
    }, 1000);
  }

  public reportVideoEffectChanged(effectId: string, effectParam?: string): void {
    if (this.currentSelectedEffect?.effectId === effectId && this.currentSelectedEffect?.effectParam === effectParam) {
      return;
    }
    this.currentSelectedEffect = {
      effectId,
      effectParam,
    };
    this.isFirstFrameProcessed = false;
  }

  public reportStartFrameProcessing(frameWidth: number, frameHeight: number): void {
    if (!this.currentSelectedEffect) {
      return;
    }
    this.frameProcessingStartedAt = performance.now();
    this.performanceStatistics.processStarts(this.currentSelectedEffect.effectId, frameWidth, frameHeight);
  }

  public reportFrameProcessed(): void {
    if (!this.currentSelectedEffect) {
      return;
    }
    this.processedFrameCount++;
    this.frameProcessingTimeCost += performance.now() - this.frameProcessingStartedAt;
    this.performanceStatistics.processEnds();
    if (!this.isFirstFrameProcessed) {
      this.isFirstFrameProcessed = true;
      // it is sent twice
      this.reportPerformanceEvent('video.videoExtensibilityFirstFrameProcessed', [
        Date.now(),
        this.currentSelectedEffect?.effectId,
        this.currentSelectedEffect?.effectParam,
      ]);
    }
  }

  public reportGettingTextureStream(streamId: string): void {
    this.startGettingTextureStreamTime = performance.now();
    this.currentSteamId = streamId;
  }

  public reportTextureStreamAcquired(): void {
    if (this.startGettingTextureStreamTime !== undefined) {
      const timeTaken = performance.now() - this.startGettingTextureStreamTime;
      this.reportPerformanceEvent('video.videoExtensibilityTextureStreamAcquired', [this.currentSteamId, timeTaken]);
    }
  }
}
