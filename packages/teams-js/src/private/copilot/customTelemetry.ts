/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHost } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { getCurrentTimestamp } from '../../internal/utils';
import { runtime } from '../../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

export enum Stage {
  STAGE_E = 'E',
}
/**
 * Sends custom telemetry data to the host.
 *
 * @param {Stage} [name=Stage.STAGE_E] - The stage of the telemetry data. Defaults to Stage.STAGE_E.
 * @param {number} [timestamp=getCurrentTimestamp() ?? Date.now()] - The timestamp of the telemetry data. Defaults to the current timestamp.
 * @returns {Promise<void>} - A promise that resolves when the telemetry data has been sent.
 * @throws {Error} - Throws an error if the app has not been successfully initialized.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export function sendCustomTelemetryData(
  name: Stage = Stage.STAGE_E,
  timestamp: number = getCurrentTimestamp() ?? Date.now(),
): Promise<void> {
  ensureInitialized(runtime);
  copilotLogger('Sending custom telemetry data to host. to record timestamp: %s', timestamp);
  return callFunctionInHost(
    'sendCustomTelemetryData',
    [name, timestamp],
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData),
  );
}
