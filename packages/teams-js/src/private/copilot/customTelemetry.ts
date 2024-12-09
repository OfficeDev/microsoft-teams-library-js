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

enum Stage {
  STAGE_E = 'E',
}
/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @throws Error if {@linkcode app.initialize} has not successfully completed
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
