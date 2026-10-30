import {
  activateChildProxyingCommunication,
  getCurrentFeatureFlagsState,
  isChildProxyingEnabled,
  overwriteFeatureFlagsState,
  resetBuildFeatureFlags,
  resetFeatureFlagsState,
  RuntimeFeatureFlags,
  setFeatureFlagsState,
} from '../../src/public/featureFlags';

describe('featureFlags', () => {
  afterEach(() => {
    resetBuildFeatureFlags();
    resetFeatureFlagsState();
  });

  describe('build feature flags', () => {
    it('should be disabled by default', () => {
      expect(isChildProxyingEnabled()).toBe(false);
    });

    it('should be enabled after activateChildProxyingCommunication', () => {
      activateChildProxyingCommunication();
      expect(isChildProxyingEnabled()).toBe(true);
    });

    it('should be disabled again after resetBuildFeatureFlags', () => {
      activateChildProxyingCommunication();
      resetBuildFeatureFlags();
      expect(isChildProxyingEnabled()).toBe(false);
    });

    it('should stay enabled when activated more than once', () => {
      activateChildProxyingCommunication();
      activateChildProxyingCommunication();
      expect(isChildProxyingEnabled()).toBe(true);
    });
  });

  describe('getCurrentFeatureFlagsState', () => {
    it('should return the default runtime feature flags', () => {
      expect(getCurrentFeatureFlagsState()).toEqual({ disableEnforceOriginMatchForChildResponses: false });
    });

    it('should not hand callers a reference to the module defaults', () => {
      jest.isolateModules(() => {
        const freshModule = jest.requireActual<typeof import('../../src/public/featureFlags')>(
          '../../src/public/featureFlags',
        );

        // A freshly loaded module has never had a setter called on it, so this is the only
        // opportunity to observe whether the initial state aliases the defaults object.
        freshModule.getCurrentFeatureFlagsState().disableEnforceOriginMatchForChildResponses = true;
        freshModule.resetFeatureFlagsState();

        expect(freshModule.getCurrentFeatureFlagsState().disableEnforceOriginMatchForChildResponses).toBe(false);
      });
    });
  });

  describe('setFeatureFlagsState', () => {
    it('should replace the current state wholesale', () => {
      const newState: RuntimeFeatureFlags = { disableEnforceOriginMatchForChildResponses: true };
      setFeatureFlagsState(newState);

      expect(getCurrentFeatureFlagsState()).toEqual(newState);
    });
  });

  describe('overwriteFeatureFlagsState', () => {
    it('should merge a partial update into the current state', () => {
      const result = overwriteFeatureFlagsState({ disableEnforceOriginMatchForChildResponses: true });

      expect(result).toEqual({ disableEnforceOriginMatchForChildResponses: true });
      expect(getCurrentFeatureFlagsState()).toEqual(result);
    });

    it('should leave the current state untouched when given an empty partial', () => {
      overwriteFeatureFlagsState({ disableEnforceOriginMatchForChildResponses: true });

      expect(overwriteFeatureFlagsState({})).toEqual({ disableEnforceOriginMatchForChildResponses: true });
    });
  });

  describe('resetFeatureFlagsState', () => {
    it('should restore the defaults after a flag was enabled', () => {
      overwriteFeatureFlagsState({ disableEnforceOriginMatchForChildResponses: true });
      expect(getCurrentFeatureFlagsState().disableEnforceOriginMatchForChildResponses).toBe(true);

      resetFeatureFlagsState();

      expect(getCurrentFeatureFlagsState()).toEqual({ disableEnforceOriginMatchForChildResponses: false });
    });

    it('should be safe to call when the state is already at its defaults', () => {
      resetFeatureFlagsState();
      resetFeatureFlagsState();

      expect(getCurrentFeatureFlagsState()).toEqual({ disableEnforceOriginMatchForChildResponses: false });
    });

    it('should not affect build feature flags', () => {
      activateChildProxyingCommunication();

      resetFeatureFlagsState();

      expect(isChildProxyingEnabled()).toBe(true);
    });
  });
});
