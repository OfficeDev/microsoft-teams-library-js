import { VideoFrameTick } from './videoFrameTick';

export type VideoPerformanceStatisticsResult = {
  effectId: string;
  effectParam?: string;
  frameWidth: number;
  frameHeight: number;
  /**
   * The duration in milliseconds that the data were collected
   */
  duration: number;
  /**
   * The number of frames that were processed in the duration
   */
  sampleCount: number;
  /**
   * An array that presents counts of frames that were finished in n milliseconds:
   * distributionBins[frameProcessingDurationInMs]=frameCount.
   * For example, distributionBins[10] = 5 means that 5 frames were processed in 10 milliseconds.
   */
  distributionBins: Uint32Array;
};

export class VideoPerformanceStatistics {
  private static readonly initialSessionTimeoutInMs = 1000;
  private static readonly maxSessionTimeoutInMs = 1000 * 30;

  private currentSession: {
    startedAtInMs: number;
    timeoutInMs: number;
    effectId: string;
    effectParam?: string;
    frameWidth: number;
    frameHeight: number;
  };

  private frameProcessingStartedAt: number;
  private distributionBins: Uint32Array;
  private sampleCount = 0;
  private timeoutId: string;

  public constructor(
    distributionBinSize: number,
    /**
     * Function to report the statistics result
     */
    private reportStatisticsResult: (result: VideoPerformanceStatisticsResult) => void,
  ) {
    this.distributionBins = new Uint32Array(distributionBinSize);
  }

  /**
   * Call this function before processing every frame
   */
  public processStarts(effectId: string, frameWidth: number, frameHeight: number, effectParam?: string): void {
    VideoFrameTick.tick();
    if (!this.suitableForThisSession(effectId, frameWidth, frameHeight, effectParam)) {
      this.reportAndResetSession(this.getStatistics(), effectId, effectParam, frameWidth, frameHeight);
    }
    this.start();
  }

  public processEnds(): void {
    // calculate duration of the process and record it
    const durationInMillisecond = performance.now() - this.frameProcessingStartedAt;
    const binIndex = Math.floor(Math.max(0, Math.min(this.distributionBins.length - 1, durationInMillisecond)));
    this.distributionBins[binIndex] += 1;
    this.sampleCount += 1;
  }

  private getStatistics(): VideoPerformanceStatisticsResult {
    if (!this.currentSession) {
      return null;
    }
    return {
      effectId: this.currentSession.effectId,
      effectParam: this.currentSession.effectParam,
      frameHeight: this.currentSession.frameHeight,
      frameWidth: this.currentSession.frameWidth,
      duration: performance.now() - this.currentSession.startedAtInMs,
      sampleCount: this.sampleCount,
      distributionBins: this.distributionBins.slice(),
    };
  }

  private start(): void {
    this.frameProcessingStartedAt = performance.now();
  }

  private suitableForThisSession(
    effectId: string,
    frameWidth: number,
    frameHeight: number,
    effectParam?: string,
  ): boolean {
    return (
      this.currentSession &&
      this.currentSession.effectId === effectId &&
      this.currentSession.effectParam === effectParam &&
      this.currentSession.frameWidth === frameWidth &&
      this.currentSession.frameHeight === frameHeight
    );
  }

  private reportAndResetSession(result, effectId, effectParam, frameWidth, frameHeight): void {
    result && this.reportStatisticsResult(result);
    this.resetCurrentSession(
      this.getNextTimeout(effectId, this.currentSession),
      effectId,
      effectParam,
      frameWidth,
      frameHeight,
    );
    if (this.timeoutId) {
      VideoFrameTick.clearTimeout(this.timeoutId);
    }
    this.timeoutId = VideoFrameTick.setTimeout(
      (() => this.reportAndResetSession(this.getStatistics(), effectId, effectParam, frameWidth, frameHeight)).bind(
        this,
      ),
      this.currentSession.timeoutInMs,
    );
  }

  private resetCurrentSession(
    timeoutInMs: number,
    effectId: string,
    effectParam: string,
    frameWidth: number,
    frameHeight: number,
  ): void {
    this.currentSession = {
      startedAtInMs: performance.now(),
      timeoutInMs,
      effectId,
      effectParam,
      frameWidth,
      frameHeight,
    };
    this.sampleCount = 0;
    this.distributionBins.fill(0);
  }

  // send the statistics result every n second, where n starts from 1, 2, 4...and finally stays at every 30 seconds.
  private getNextTimeout(effectId: string, currentSession?: { timeoutInMs: number; effectId: string }): number {
    // only reset timeout when new session or effect changed
    if (!currentSession || currentSession.effectId !== effectId) {
      return VideoPerformanceStatistics.initialSessionTimeoutInMs;
    }
    return Math.min(VideoPerformanceStatistics.maxSessionTimeoutInMs, currentSession.timeoutInMs * 2);
  }
}
