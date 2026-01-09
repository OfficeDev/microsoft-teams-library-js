import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { HostMemoryMetrics } from './interfaces';
import { runtime } from './runtime';

/**
 * @beta
 * Indicates whether the app performance metrics capability is supported in the current host.
 * @returns boolean to represent whether the shortcutRelay capability is supported
 *
 * @throws Error if {@link app.initialize} has not successfully completed
 *
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.appPerformanceMetrics;
}

/**
 * This function is passed to registerHostMemoryMetricsHandler. See {@link HostMemoryMetrics} to see which metrics are passed to the handler during a certain interval of time.
 */
export type HostMemoryMetricsHandler = (metrics: HostMemoryMetrics) => void;

/**
 * @beta
 * Registers a function to handle memory metrics heartbeat sent from the host periodically.
 *
 * @remarks
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke each time memory metrics heartbeat is received from the host.
 */
export function registerHostMemoryMetricsHandler(handler: HostMemoryMetricsHandler): void {
  ensureInitialized(runtime);
  registerHandler(
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.AppPerformanceMetrics_RegisterHostMemoryMetricsHandler),
    ApiName.AppPerformanceMetrics_RegisterHostMemoryMetricsHandler,
    handler,
  );
}
