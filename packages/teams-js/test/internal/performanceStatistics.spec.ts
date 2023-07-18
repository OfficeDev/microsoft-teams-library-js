import { PerformanceStatistics, PerformanceStatisticsResult } from '../../src/internal/performanceStatistics';
describe('PerformanceStatistics', () => {
  var timeoutCallback: (() => void) | undefined;
  var timeout: number;
  var result: PerformanceStatisticsResult;
  var performanceStatistics: PerformanceStatistics;

  window.setTimeout = ((callback: () => void, timeout: number) => {
    timeoutCallback = callback;
    timeout = timeout;
  }) as any;
  window.clearTimeout = (() => (timeoutCallback = undefined)) as any;

  beforeEach(() => {
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
      duration: 0,
      sampleCount: 1,
      distributionBins: new Array(1000).fill(0),
    });
  });

  it('reports statistics on effect change', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId2', 100, 100);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId1',
      frameHeight: 100,
      frameWidth: 100,
      duration: 0,
      sampleCount: 1,
      distributionBins: new Array(1000).fill(0),
    });
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
      duration: 0,
      sampleCount: 1,
      distributionBins: new Array(1000).fill(0),
    });
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
    timeoutCallback && timeoutCallback();
    expect(result).toBeUndefined();
  });

  it('timeout duration is increased over time', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    timeoutCallback && timeoutCallback();
    expect(timeout).toEqual(1000);
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
