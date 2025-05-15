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
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { runtime } from '../../public/runtime';
import { IActionExecuteResponse } from '../externalAppAuthentication';
import { Content } from './sidePanelInterfaces';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @returns boolean to represent whether copilot.sidePanel capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.copilot?.sidePanel;
}
/**
 * Get user content data from the hub to send to copilot app.
 *
 * @returns { Promise<Content> } - promise resolves with a content object containing user content data
 * @throws { SdkError } - Throws an SdkError if host SDK returns an error as a response to this call
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getContent(): Promise<Content> {
  ensureInitialized(runtime);
  copilotLogger(
    'Sending content data to side panel hosted copilot app');
  return callFunctionInHostAndHandleResponse(
    ApiName.Copilot_SidePanel_GetContent,
    [],
    new GetContentResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_GetContent),
  );
}

// TODO: Add a deserializer for the response
class GetContentResponseHandler extends ResponseHandler<Content, Content> {
  public validate(response: Content): boolean {
    // Add validation logic for the serialized response
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: Content): Content {
    // Add deserialization logic to convert the serialized response to `Content`
    return response
  }
}
