export class VideoPerformanceMonitor {
  private isFirstFrameProcessed = false;
  private currentSelectedEffect: {
    effectId: string;
    effectParam?: string;
  };

  private startGettingTextureStreamTime: number;
  private currentSteamId: string;

  public constructor(private reportPerformanceEvent: (actionName: string, args: any[]) => void) {}

  public reportVideoEffectChanged(effectId: string, effectParam?: string) {
    this.currentSelectedEffect = {
      effectId,
      effectParam,
    };
    this.isFirstFrameProcessed = false;
  }

  public reportFrameProcessed() {
    if (!this.isFirstFrameProcessed) {
      this.isFirstFrameProcessed = true;
      this.reportPerformanceEvent('video.videoExtensibilityFirstFrameProcessed', [
        Date.now(),
        this.currentSelectedEffect?.effectId,
        this.currentSelectedEffect?.effectParam,
      ]);
    }
  }

  public reportGettingTextureStream(streamId: string) {
    this.startGettingTextureStreamTime = performance.now();
    this.currentSteamId = streamId;
  }

  public reportTextureStreamAcquired() {
    if (this.startGettingTextureStreamTime) {
      const timeTaken = performance.now() - this.startGettingTextureStreamTime;
      this.reportPerformanceEvent('video.videoExtensibilityTextureStreamAcquired', [this.currentSteamId, timeTaken]);
    }
  }
}
