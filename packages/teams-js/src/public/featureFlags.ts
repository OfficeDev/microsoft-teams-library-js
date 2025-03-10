// All build feature flags are defined inside this object. Any build feature flag must have its own unique getter and setter function. This pattern allows for client apps to treeshake unused code and avoid including code guarded by this feature flags in the final bundle. If this property isn't desired, use the below runtime feature flags object.
const defaultBuildFeatureFlags = {
  childProxyingCommunication: false,
};
let buildFeatureFlags = defaultBuildFeatureFlags;

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
  buildFeatureFlags = defaultBuildFeatureFlags;
}
