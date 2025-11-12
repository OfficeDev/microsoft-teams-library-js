/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { ensureInitializeCalled, ensureInitialized } from '../../internal/internalAPIs';
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { ISerializable, SdkError } from '../../public';
import { isSdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import { isResponseAReportableError } from '../copilot/sidePanel';
import { IExternalAppWidgetContext, IToolInput, IToolOutput, WidgetError, WidgetErrorCode } from './widgetContext';

const widgetHostingVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1; // TODO: Ask Kangxuan for this version number
const widgetHostingLogger = getLogger('widgetHosting');

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @returns boolean to represent whether widgetHosting capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.isWidgetHostingSupported;
}
/**
 * Sends custom telemetry data to the host.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getWidgetData(): Promise<IExternalAppWidgetContext> {
  ensureInitializeCalled();
  widgetHostingLogger('Calling Hub to retrieve the widget data');
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_GetWidgetData,
    [],
    new GetWidgetDataResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_GetWidgetData),
    isWidgetResponseAReportableError,
  );
}

export async function callTool(input: IToolInput): Promise<IToolOutput> { 
  ensureInitializeCalled();
  widgetHostingLogger('Calling tool with input: ', input);
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_CallTool,
    [new SerializableToolInput(input)],
    new CallToolResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_CallTool),
    isWidgetResponseAReportableError,
  );
}

/**
 * @beta
 * @hidden
 * Determines if the provided error object is an instance of WidgetError or SdkError.
 * @internal
 * Limited to Microsoft-internal use
 * @param err The error object to check whether it is of WidgetError type
 */
export function isWidgetResponseAReportableError(err: unknown): err is WidgetError | SdkError {
  if (typeof err !== 'object' || err === null) {
    return false;
  }

  const error = err as WidgetError;

  return (
    (Object.values(WidgetErrorCode).includes(error.errorCode as WidgetErrorCode) &&
      (error.message === undefined || typeof error.message === 'string')) ||
    isSdkError(err) // If the error is an SdkError, it can be considered a WidgetError
  );
}

class GetWidgetDataResponseHandler extends ResponseHandler<IExternalAppWidgetContext, IExternalAppWidgetContext> {
  public validate(response: IExternalAppWidgetContext): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: IExternalAppWidgetContext): IExternalAppWidgetContext {
    return response;
  }
}
class CallToolResponseHandler extends ResponseHandler<IToolOutput, IToolOutput> {
  public validate(response: IToolOutput): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: IToolOutput): IToolOutput {
    return response;
  }
}
/**
 * Serializable wrapper for IToolInput to enable host communication
 */
class SerializableToolInput implements ISerializable {
  public constructor(private readonly toolInput: IToolInput) {}

  /**
   * Serializes the tool input to a JSON-compliant format for host communication.
   * @returns JSON representation of the tool input.
   */
  public serialize(): object {
    return {
      name: this.toolInput.name,
      arguments: this.toolInput.arguments,
    };
  }
}
