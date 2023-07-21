/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */
import {
  VideoPerformanceStatistics,
  VideoPerformanceStatisticsResult,
} from '../../src/internal/videoPerformanceStatistics';

describe('PerformanceStatistics', () => {
  let result: VideoPerformanceStatisticsResult | undefined;
  let performanceStatistics: VideoPerformanceStatistics;
  const reportFunc = jest.fn();
  reportFunc.mockImplementation((r) => (result = r));

  beforeEach(() => {
    jest.useFakeTimers();
    result = undefined;
    performanceStatistics = new VideoPerformanceStatistics(1000, reportFunc);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('reports statistics on timeout', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(1000);
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
    jest.advanceTimersByTime(10);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId2', 100, 100);
    jest.advanceTimersByTime(20);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId1',
      frameHeight: 100,
      frameWidth: 100,
      duration: 10,
      sampleCount: 1,
      distributionBins: expect.anything(),
    });
    expect(result?.distributionBins[10]).toEqual(1);
  });

  it('reports statistics on frame size change', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    jest.advanceTimersByTime(10);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId', 200, 200);
    jest.advanceTimersByTime(20);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId',
      frameHeight: 100,
      frameWidth: 100,
      duration: 10,
      sampleCount: 1,
      distributionBins: expect.anything(),
    });
    expect(result?.distributionBins[10]).toEqual(1);
  });

  it("don't report statistics when session is not created", () => {
    performanceStatistics.processEnds();
    expect(result).toBeUndefined();
  });

  it("don't report statistics before timeout", () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    jest.advanceTimersByTime(10);
    performanceStatistics.processEnds();
    expect(result).toBeUndefined();
  });

  it("don't report statistics when no data", () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processStarts('effectId', 100, 100);
    expect(result).toBeUndefined();
  });

  it('timeout duration is increased over time when effectId is not changed', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(1000);
    expect(reportFunc).toBeCalledTimes(1);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(2000);
    expect(reportFunc).toBeCalledTimes(2);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(4000);
    expect(reportFunc).toBeCalledTimes(3);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(8000);
    expect(reportFunc).toBeCalledTimes(4);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(16000);
    expect(reportFunc).toBeCalledTimes(5);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(30000);
    expect(reportFunc).toBeCalledTimes(6);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    jest.advanceTimersByTime(30000);
    expect(reportFunc).toBeCalledTimes(7);
  });
});
