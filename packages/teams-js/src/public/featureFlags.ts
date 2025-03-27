// All build feature flags are defined inside this object. Any build feature flag must have its own unique getter and setter function. This pattern allows for client apps to treeshake unused code and avoid including code guarded by this feature flags in the final bundle. If this property isn't desired, use the below runtime feature flags object.
const buildFeatureFlags = {
  childProxyingCommunication: false,
};

/**
 * This function enables child proxying communication for apps that still needs it.
 *
 * @deprecated Child proxying is considered an insecure feature and will be removed in future releases.
 */
export function activateChildProxyingCommunication(): void {
  buildFeatureFlags.childProxyingCommunication = true;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 */
export function isChildProxyingEnabled(): boolean {
  return buildFeatureFlags.childProxyingCommunication;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use.
 */
export function resetBuildFeatureFlags(): void {
  buildFeatureFlags.childProxyingCommunication = false;
}

/**
 * Feature flags to activate or deactivate certain features at runtime for an app.
 */
export interface RuntimeFeatureFlags {
  /**
   * Disables origin validation for responses to child windows. When enabled, this flag bypasses security checks that verify the origin of child window that receives the response.
   *
   * Default: false
   */
  disableEnforceOriginMatchForChildResponses: boolean;
}

// Default runtime feature flags
const defaultFeatureFlags: RuntimeFeatureFlags = {
  disableEnforceOriginMatchForChildResponses: false,
} as const;

// Object that stores the current runtime feature flag state
let runtimeFeatureFlags = defaultFeatureFlags;

/**
 * @returns The current state of the runtime feature flags.
 */
export function getCurrentFeatureFlagsState(): RuntimeFeatureFlags {
  return runtimeFeatureFlags;
}

/**
 * It sets the runtime feature flags to the new feature flags provided.
 * @param featureFlags The new feature flags to set.
 */
export function setFeatureFlagsState(featureFlags: RuntimeFeatureFlags): void {
  runtimeFeatureFlags = featureFlags;
}

/**
 * It overwrites all the feature flags in the runtime feature flags object with the new feature flags provided.
 * @param newFeatureFlags The new feature flags to set.
 * @returns The current state of the runtime feature flags.
 */
export function overwriteFeatureFlagsState(newFeatureFlags: Partial<RuntimeFeatureFlags>): RuntimeFeatureFlags {
  setFeatureFlagsState({ ...runtimeFeatureFlags, ...newFeatureFlags });
  return getCurrentFeatureFlagsState();
}
