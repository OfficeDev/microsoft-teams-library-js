import { inServerSideRenderingEnvironment } from '../private/inServerSideRenderingEnvironment';
import { errorNotSupportedOnPlatform } from '../public/constants';

export type PerformanceStatisticsResult = {
  effectId: string;
  frameWidth: number;
  frameHeight: number;
  duration: number; // the duration in milliseconds that the data were collected
  sampleCount: number; // the number of frames that were processed in the duration
  distributionBins: Uint32Array; // an array that presents counts of frames that were finished in n milliseconds: distributionBins[frameProcessingDurationInMs]=frameCount. For example, distributionBins[10] = 5 means that 5 frames were processed in 10 milliseconds.
};

export class PerformanceStatistics {
  private currentSession: {
    startedAtInMs: number;
    timeoutInMs: number;
    effectId: string;
    frameWidth: number;
    frameHeight: number;
  };

  private frameProcessingStartedAt: number;
  private distributionBins: Uint32Array;
  private sampleCount = 0;
  private timeoutId: number;

  public constructor(
    distributionBinSize: number,
    private report: (result: PerformanceStatisticsResult) => void, // post event to the host
  ) {
    if (inServerSideRenderingEnvironment()) {
      throw errorNotSupportedOnPlatform;
    }
    this.distributionBins = new Uint32Array(distributionBinSize);
  }

  /**
   * Call this function before processing every frame
   */
  public processStarts(effectId: string, frameWidth: number, frameHeight: number) {
    if (!this.suitableForThisSession(effectId, frameWidth, frameHeight)) {
      this.reportAndResetSession(this.getStatistics(), effectId, frameWidth, frameHeight);
    }
    this.start();
  }

  public processEnds() {
    // calculate duration of the process and record it
    const durationInMillisecond = performance.now() - this.frameProcessingStartedAt;
    const binIndex = Math.floor(Math.max(0, Math.min(this.distributionBins.length - 1, durationInMillisecond)));
    this.distributionBins[binIndex] += 1;
    this.sampleCount += 1;
  }

  private getStatistics(): PerformanceStatisticsResult {
    if (!this.currentSession) {
      return null;
    }
    return {
      effectId: this.currentSession.effectId,
      frameHeight: this.currentSession.frameHeight,
      frameWidth: this.currentSession.frameWidth,
      duration: performance.now() - this.currentSession.startedAtInMs,
      sampleCount: this.sampleCount,
      distributionBins: this.distributionBins,
    };
  }

  private start() {
    this.frameProcessingStartedAt = performance.now();
  }

  private suitableForThisSession(effectId: string, frameWidth: number, frameHeight: number) {
    return (
      this.currentSession &&
      this.currentSession.effectId === effectId &&
      this.currentSession.frameWidth === frameWidth &&
      this.currentSession.frameHeight === frameHeight
    );
  }

  private reportAndResetSession(result, effectId, frameWidth, frameHeight) {
    result && this.report(result);
    this.resetCurrentSession(this.getNextTimeout(effectId, this.currentSession), effectId, frameWidth, frameHeight);
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(this.reportAndResetSession, this.currentSession.timeoutInMs);
  }

  private resetCurrentSession(timeoutInMs: number, effectId: string, frameWidth: number, frameHeight: number) {
    this.currentSession = {
      startedAtInMs: performance.now(),
      timeoutInMs,
      effectId,
      frameWidth,
      frameHeight,
    };
    this.sampleCount = 0;
    this.distributionBins.fill(0);
  }

  // send the statistics result every n second, where n starts from 1, 2, 4...and finally stays at every 30 seconds.
  private getNextTimeout(effectId: string, currentSession?: { timeoutInMs: number; effectId: string }) {
    // only reset timeout when new session or effect changed
    if (!currentSession || currentSession.effectId !== effectId) {
      return 1000;
    }
    return Math.min(1000 * 30, currentSession.timeoutInMs * 2);
  }
}
