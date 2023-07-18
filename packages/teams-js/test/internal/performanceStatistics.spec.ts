/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */
import { PerformanceStatistics, PerformanceStatisticsResult } from '../../src/internal/performanceStatistics';
describe('PerformanceStatistics', () => {
  let timeoutCallback: (() => void) | undefined;
  let timeout: number;
  let result: PerformanceStatisticsResult | undefined;
  let performanceStatistics: PerformanceStatistics;

  window.setTimeout = ((callback: () => void, t: number) => {
    timeoutCallback = callback;
    timeout = t;
  }) as any;
  window.clearTimeout = (() => (timeoutCallback = undefined)) as any;

  beforeEach(() => {
    result = undefined;
    performanceStatistics = new PerformanceStatistics(1000, (r) => (result = r));
  });

  it('reports statistics on timeout', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    timeoutCallback && timeoutCallback();
    expect(result).toEqual({
      effectId: 'effectId',
      frameHeight: 100,
      frameWidth: 100,
      duration: expect.any(Number),
      sampleCount: 1,
      distributionBins: expect.anything(),
    });
    expect(result?.distributionBins[0]).toEqual(1);
  });

  it('reports statistics on effect change', () => {
    performanceStatistics.processStarts('effectId1', 100, 100);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId2', 100, 100);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId1',
      frameHeight: 100,
      frameWidth: 100,
      duration: expect.any(Number),
      sampleCount: 1,
      distributionBins: expect.anything(),
    });
    expect(result?.distributionBins[0]).toEqual(1);
  });

  it('reports statistics on frame size change', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId', 200, 200);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId',
      frameHeight: 100,
      frameWidth: 100,
      duration: expect.any(Number),
      sampleCount: 1,
      distributionBins: expect.anything(),
    });
    expect(result?.distributionBins[0]).toEqual(1);
  });

  it("don't report statistics when session is not created", () => {
    performanceStatistics.processEnds();
    expect(result).toBeUndefined();
  });

  it("don't report statistics before timeout", () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    expect(result).toBeUndefined();
  });

  it("don't report statistics when no data", () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processStarts('effectId', 100, 100);
    expect(result).toBeUndefined();
  });

  it('timeout duration is increased over time', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    expect(timeout).toEqual(1000);
    performanceStatistics.processEnds();
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(2000);
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(4000);
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(8000);
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(16000);
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(30000);
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(30000);
  });
});
