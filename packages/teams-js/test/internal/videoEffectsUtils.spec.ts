import * as communicationModule from '../../src/internal/communication';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../src/internal/telemetry';
import { createEffectParameterChangeCallback } from '../../src/internal/videoEffectsUtils';
import { VideoPerformanceMonitor } from '../../src/internal/videoPerformanceMonitor';
import { EffectFailureReason } from '../../src/public/videoEffects';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const videoEffectsUtilTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

const effectChangedApiVersionTag = getApiVersionTag(
  videoEffectsUtilTelemetryVersionNumber,
  ApiName.VideoEffectsUtils_ReportVideoEffectChanged,
);
const effectFailureApiVersionTag = getApiVersionTag(
  videoEffectsUtilTelemetryVersionNumber,
  ApiName.VideoEffectsUtils_EffectFailure,
);

/**
 * Lets the promise chain inside the callback settle before assertions run.
 */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('videoEffectsUtils', () => {
  describe('createEffectParameterChangeCallback', () => {
    let sendMessageToParentSpy: jest.SpyInstance;
    let reportApplyingVideoEffect: jest.Mock;
    let reportVideoEffectChanged: jest.Mock;
    let videoPerformanceMonitor: VideoPerformanceMonitor;

    beforeEach(() => {
      sendMessageToParentSpy = jest
        .spyOn(communicationModule, 'sendMessageToParent')
        .mockImplementation(() => undefined);
      reportApplyingVideoEffect = jest.fn();
      reportVideoEffectChanged = jest.fn();
      videoPerformanceMonitor = {
        reportApplyingVideoEffect,
        reportVideoEffectChanged,
      } as unknown as VideoPerformanceMonitor;
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should report the effect as applying before invoking the callback', () => {
      const effectCallback = jest.fn().mockReturnValue(new Promise(() => {}));

      createEffectParameterChangeCallback(effectCallback, videoPerformanceMonitor)('effectId', 'effectParam');

      expect(reportApplyingVideoEffect).toHaveBeenCalledWith('effectId', 'effectParam');
      expect(effectCallback).toHaveBeenCalledWith('effectId', 'effectParam');
      expect(reportApplyingVideoEffect.mock.invocationCallOrder[0]).toBeLessThan(
        effectCallback.mock.invocationCallOrder[0],
      );
      expect(reportVideoEffectChanged).not.toHaveBeenCalled();
      expect(sendMessageToParentSpy).not.toHaveBeenCalled();
    });

    it('should report success to the host and the performance monitor when the callback resolves', async () => {
      const effectCallback = jest.fn().mockResolvedValue(undefined);

      createEffectParameterChangeCallback(effectCallback, videoPerformanceMonitor)('effectId', 'effectParam');
      await flushPromises();

      expect(reportVideoEffectChanged).toHaveBeenCalledWith('effectId', 'effectParam');
      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectChangedApiVersionTag, 'video.videoEffectReadiness', [
        true,
        'effectId',
        undefined,
        'effectParam',
      ]);
    });

    it('should pass a known failure reason through when the callback rejects', async () => {
      const effectCallback = jest.fn().mockRejectedValue(EffectFailureReason.InvalidEffectId);

      createEffectParameterChangeCallback(effectCallback, videoPerformanceMonitor)('effectId', 'effectParam');
      await flushPromises();

      expect(reportVideoEffectChanged).not.toHaveBeenCalled();
      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectFailureApiVersionTag, 'video.videoEffectReadiness', [
        false,
        'effectId',
        EffectFailureReason.InvalidEffectId,
        'effectParam',
      ]);
    });

    it('should fall back to InitializationFailure when the rejection reason is not a known failure reason', async () => {
      const effectCallback = jest.fn().mockRejectedValue('SomethingElseWentWrong');

      createEffectParameterChangeCallback(effectCallback, videoPerformanceMonitor)('effectId', 'effectParam');
      await flushPromises();

      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectFailureApiVersionTag, 'video.videoEffectReadiness', [
        false,
        'effectId',
        EffectFailureReason.InitializationFailure,
        'effectParam',
      ]);
    });

    it('should report an empty effect id to the performance monitor but keep it undefined for the host', async () => {
      const effectCallback = jest.fn().mockResolvedValue(undefined);

      createEffectParameterChangeCallback(effectCallback, videoPerformanceMonitor)(undefined);
      await flushPromises();

      expect(reportApplyingVideoEffect).toHaveBeenCalledWith('', undefined);
      expect(reportVideoEffectChanged).toHaveBeenCalledWith('', undefined);
      expect(effectCallback).toHaveBeenCalledWith(undefined, undefined);
      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectChangedApiVersionTag, 'video.videoEffectReadiness', [
        true,
        undefined,
        undefined,
        undefined,
      ]);
    });

    it('should still notify the host when no performance monitor is provided', async () => {
      const effectCallback = jest.fn().mockResolvedValue(undefined);

      createEffectParameterChangeCallback(effectCallback)('effectId', 'effectParam');
      await flushPromises();

      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectChangedApiVersionTag, 'video.videoEffectReadiness', [
        true,
        'effectId',
        undefined,
        'effectParam',
      ]);
    });

    it('should still notify the host of a failure when no performance monitor is provided', async () => {
      const effectCallback = jest.fn().mockRejectedValue(EffectFailureReason.InitializationFailure);

      createEffectParameterChangeCallback(effectCallback)('effectId', 'effectParam');
      await flushPromises();

      expect(sendMessageToParentSpy).toHaveBeenCalledWith(effectFailureApiVersionTag, 'video.videoEffectReadiness', [
        false,
        'effectId',
        EffectFailureReason.InitializationFailure,
        'effectParam',
      ]);
    });
  });
});
