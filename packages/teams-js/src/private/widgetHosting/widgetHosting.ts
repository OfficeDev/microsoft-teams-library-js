/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { ensureInitializeCalled, ensureInitialized } from '../../internal/internalAPIs';
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { ISerializable, SdkError } from '../../public';
import { isSdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import {
  DisplayMode,
  IExternalAppWidgetContext,
  IToolInput,
  IToolOutput,
  UnknownObject,
  WidgetError,
  WidgetErrorCode,
} from './widgetContext';

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
 * Sends a follow-up message to the host
 * @internal
 * Limited to Microsoft-internal use
 */
export async function sendFollowUpMessage(args: { prompt: string }): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Sending follow-up message with prompt: ', args.prompt);
  return callFunctionInHost(
    ApiName.WidgetHosting_SendFollowUpMessage,
    [new SerializableFollowUpMessageArgs(args)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_SendFollowUpMessage),
  );
}

/**
 * @beta
 * @hidden
 * Requests a specific display mode for the widget
 * @internal
 * Limited to Microsoft-internal use
 */
export async function requestDisplayMode(args: { mode: DisplayMode }): Promise<{ mode: DisplayMode }> {
  ensureInitializeCalled();
  widgetHostingLogger('Requesting display mode: ', args.mode);
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_RequestDisplayMode,
    [new SerializableDisplayModeArgs(args)],
    new RequestDisplayModeResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RequestDisplayMode),
    isWidgetResponseAReportableError,
  );
}
/**
 * @beta
 * @hidden
 * Sets the widget state
 * @internal
 * Limited to Microsoft-internal use
 */
export async function setWidgetState(state: UnknownObject): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Setting widget state: ', state);
  return callFunctionInHost(
    ApiName.WidgetHosting_SetWidgetState,
    [new SerializableWidgetState(state)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_SetWidgetState),
  );
}

/**
 * @beta
 * @hidden
 * Opens an external URL
 * @internal
 * Limited to Microsoft-internal use
 */
export function openExternal(payload: { href: string }): void {
  ensureInitializeCalled();
  widgetHostingLogger('Opening external URL: ', payload.href);
  callFunctionInHost(
    ApiName.WidgetHosting_OpenExternal,
    [new SerializableOpenExternalArgs(payload)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_OpenExternal),
  );
}
/**
 * @beta
 * @hidden
 * Notifies the host about content size changes
 * @internal
 * Limited to Microsoft-internal use
 */
export function contentSizeChanged(width: number, height: number): void {
  ensureInitializeCalled();
  widgetHostingLogger('Content size changed: ', { width, height });
  callFunctionInHost(
    ApiName.WidgetHosting_ContentSizeChanged,
    [new SerializableContentSizeArgs(width, height)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_ContentSizeChanged),
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

class RequestDisplayModeResponseHandler extends ResponseHandler<{ mode: DisplayMode }, { mode: DisplayMode }> {
  public validate(response: { mode: DisplayMode }): boolean {
    return response !== null && typeof response === 'object' && typeof response.mode === 'string';
  }

  public deserialize(response: { mode: DisplayMode }): { mode: DisplayMode } {
    return response;
  }
}

// Add the serializable classes after the existing SerializableToolInput:

/**
 * Serializable wrapper for follow-up message arguments
 */
class SerializableFollowUpMessageArgs implements ISerializable {
  public constructor(private readonly args: { prompt: string }) {}

  public serialize(): object {
    return {
      prompt: this.args.prompt,
    };
  }
}
/**
 * Serializable wrapper for display mode arguments
 */
class SerializableDisplayModeArgs implements ISerializable {
  public constructor(private readonly args: { mode: DisplayMode }) {}

  public serialize(): object {
    return {
      mode: this.args.mode,
    };
  }
}

/**
 * Serializable wrapper for widget state
 */
class SerializableWidgetState implements ISerializable {
  public constructor(private readonly state: UnknownObject) {}

  public serialize(): object {
    return this.state;
  }
}

/**
 * Serializable wrapper for external URL arguments
 */
class SerializableOpenExternalArgs implements ISerializable {
  public constructor(private readonly payload: { href: string }) {}

  public serialize(): object {
    return {
      href: this.payload.href,
    };
  }
}

/**
 * Serializable wrapper for content size arguments
 */
class SerializableContentSizeArgs implements ISerializable {
  public constructor(
    private readonly width: number,
    private readonly height: number,
  ) {}

  public serialize(): object {
    return {
      width: this.width,
      height: this.height,
    };
  }
}
