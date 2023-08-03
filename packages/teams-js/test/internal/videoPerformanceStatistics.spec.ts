/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */
import { VideoFrameTick } from '../../src/internal/videoFrameTick';
import {
  VideoPerformanceStatistics,
  VideoPerformanceStatisticsResult,
} from '../../src/internal/videoPerformanceStatistics';

jest.useFakeTimers();
function advanceTimersByTime(time: number): void {
  jest.advanceTimersByTime(time);
  VideoFrameTick.tick();
}

describe('PerformanceStatistics', () => {
  let result: VideoPerformanceStatisticsResult | undefined;
  let performanceStatistics: VideoPerformanceStatistics;
  let reportFunc = jest.fn();
  reportFunc.mockImplementation((r) => (result = r));

  beforeEach(() => {
    result = undefined;
    reportFunc = jest.fn();
    reportFunc.mockImplementation((r) => (result = r));
    performanceStatistics = new VideoPerformanceStatistics(1000, reportFunc);
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('reports statistics on timeout', () => {
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(1000);
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
    advanceTimersByTime(10);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId2', 100, 100);
    advanceTimersByTime(20);
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

  it('reports statistics on effect parameters change', () => {
    performanceStatistics.processStarts('effectId1', 100, 100, 'param1');
    advanceTimersByTime(10);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId1', 100, 100, 'param2');
    advanceTimersByTime(20);
    performanceStatistics.processEnds();
    expect(result).toEqual({
      effectId: 'effectId1',
      effectParam: 'param1',
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
    advanceTimersByTime(10);
    performanceStatistics.processEnds();
    performanceStatistics.processStarts('effectId', 200, 200);
    advanceTimersByTime(20);
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
    advanceTimersByTime(10);
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
    advanceTimersByTime(1000);
    expect(reportFunc).toBeCalledTimes(1);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(2000);
    expect(reportFunc).toBeCalledTimes(2);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(4000);
    expect(reportFunc).toBeCalledTimes(3);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(8000);
    expect(reportFunc).toBeCalledTimes(4);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(16000);
    expect(reportFunc).toBeCalledTimes(5);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(30000);
    expect(reportFunc).toBeCalledTimes(6);
    performanceStatistics.processStarts('effectId', 100, 100);
    performanceStatistics.processEnds();
    advanceTimersByTime(30000);
    expect(reportFunc).toBeCalledTimes(7);
  });
});
