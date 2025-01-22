/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { SimpleTypeResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { getCurrentTimestamp } from '../../internal/utils';
import { runtime } from '../../public/runtime';
import { UUID } from '../../public/uuidObject';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @returns boolean to represent whether copilot.customTelemetry capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.copilot?.customTelemetry;
}
/**
 * Sends custom telemetry data to the host.
 *
 * @param { UUID } stageNameIdentifier - The stageName UUID identifier for the telemetry data.
 * @param { number } [timestamp=getCurrentTimestamp() ?? Date.now()] - The timestamp of the telemetry data. Defaults to the current timestamp.
 * @returns { Promise<void> } - promise resolves when the host SDK acknowledges that it has received the message.
 * @throws { Error } - Throws an error if the app has not been successfully initialized or the host SDK returns an error as a response to this call
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
  copilotLogger(
    'Sending custom telemetry data to host for stage: %s to record timestamp: %s',
    stageNameIdentifier,
    timestamp,
  );
  await callFunctionInHostAndHandleResponse(
    ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData,
    [stageNameIdentifier.toString(), timestamp],
    new SimpleTypeResponseHandler<boolean>(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_CustomTelemetry_SendCustomTelemetryData),
  );
}
