import { PerformanceStatistics } from './performanceStatistics';

export class VideoPerformanceMonitor {
  private isFirstFrameProcessed = false;
  private currentSelectedEffect: {
    effectId: string;
    effectParam?: string;
  };

  private startGettingTextureStreamTime: number;
  private currentSteamId: string;
  private frameProcessingStartedAt: number;
  private frameProcessingTimeCost: number;
  private processedFrameCount = 0;

  private performanceStatistics: PerformanceStatistics;

  public constructor(private reportPerformanceEvent: (actionName: string, args: unknown[]) => void) {
    this.performanceStatistics = new PerformanceStatistics(1000, (result) =>
      this.reportPerformanceEvent('video.videoExtensibilityPerformanceDataGenerated', [result]),
    );
  }

  public reportVideoEffectChanged(effectId: string, effectParam?: string): void {
    this.currentSelectedEffect = {
      effectId,
      effectParam,
    };
    this.isFirstFrameProcessed = false;
  }

  public reportStartFrameProcessing(frameWidth: number, frameHeight: number): void {
    this.performanceStatistics.processStarts(this.currentSelectedEffect.effectId, frameWidth, frameHeight);
  }

  public reportFrameProcessed(): void {
    this.performanceStatistics.processEnds();
    if (!this.isFirstFrameProcessed) {
      this.isFirstFrameProcessed = true;
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
    if (this.startGettingTextureStreamTime) {
      const timeTaken = performance.now() - this.startGettingTextureStreamTime;
      this.reportPerformanceEvent('video.videoExtensibilityTextureStreamAcquired', [this.currentSteamId, timeTaken]);
    }
  }
}
