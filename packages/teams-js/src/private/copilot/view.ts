import { callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { runtime } from '../../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @returns boolean to represent whether copilot.view capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.copilot?.view;
}

/**
 * Closes the side panel that is hosting the copilot app.
 *
 * @throws { Error } - Throws a Error if host SDK returns an error as a response to this call
 *
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 */
export async function closeSidePanel(): Promise<void> {
  ensureInitialized(runtime);
  await callFunctionInHostAndHandleResponse(
    ApiName.Copilot_View_CloseSidePanel,
    [],
    new CloseSidePanelResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_View_CloseSidePanel),
  );
}

class CloseSidePanelResponseHandler extends ResponseHandler<Record<string, never>, Record<string, never>> {
  public validate(_response: Record<string, never>): boolean {
    return true;
  }

  public deserialize(response: Record<string, never>): Record<string, never> {
    return response;
  }
}
