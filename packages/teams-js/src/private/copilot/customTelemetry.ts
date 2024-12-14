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
import { UUID } from '../../internal/uuidObject';
import { runtime } from '../../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

/**
 * Sends custom telemetry data to the host.
 *
 * @param { UUID } stageNameIdentifier - The stageName UUID identifier for the telemetry data.
 * @param { number } [timestamp=getCurrentTimestamp() ?? Date.now()] - The timestamp of the telemetry data. Defaults to the current timestamp.
 * @returns { Promise<void> } - A promise that resolves when the telemetry data has been sent.
 * @throws { Error } - Throws an error if the app has not been successfully initialized.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function sendCustomTelemetryData(
  stageNameIdentifier: UUID,
  timestamp: number = getCurrentTimestamp() ?? Date.now(),
): Promise<void> {
  ensureInitialized(runtime);
  copilotLogger('Sending custom telemetry data to host. to record timestamp: %s', timestamp);
  return callFunctionInHost(
    ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData,
    [stageNameIdentifier.toString(), timestamp],
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData),
  );
}
