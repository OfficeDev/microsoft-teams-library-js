/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { registerHandlerHelper } from '../../internal/handlers';
import { ensureInitializeCalled, ensureInitialized } from '../../internal/internalAPIs';
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { ISerializable, SdkError } from '../../public';
import { isSdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import {
  DisplayMode,
  IModalOptions,
  IModalResponse,
  IToolInput,
  IToolOutput,
  IWidgetContext,
  JSONValue,
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
  return ensureInitialized(runtime) && !!runtime.supports.widgetHosting;
}
/**
 * Sends custom telemetry data to the host.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getWidgetData(): Promise<IWidgetContext> {
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
export async function requestDisplayMode(args: { mode: DisplayMode }): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Requesting display mode: ', args.mode);
  return callFunctionInHost(
    ApiName.WidgetHosting_RequestDisplayMode,
    [new SerializableDisplayModeArgs(args)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RequestDisplayMode),
  );
}

/**
 * @beta
 * @hidden
 * Requests a modal dialog to be displayed
 * @internal
 * Limited to Microsoft-internal use
 * @param options - Configuration options for the modal
 * @returns A DOM element representing the modal's root
 */
export async function requestModal(options: IModalOptions): Promise<IModalResponse> {
  ensureInitializeCalled();
  widgetHostingLogger('Requesting modal with options: ', options);
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_RequestModal,
    [new SerializableModalOptions(options)],
    new RequestModalResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RequestModal),
    isWidgetResponseAReportableError,
  );
}

/**
 * @beta
 * @hidden
 * Notifies the host about the intrinsic height of the widget content
 * @internal
 * Limited to Microsoft-internal use
 */
export function notifyIntrinsicHeight(height: number): void {
  ensureInitializeCalled();
  widgetHostingLogger('Notifying intrinsic height: ', height);
  callFunctionInHost(
    ApiName.WidgetHosting_NotifyIntrinsicHeight,
    [new SerializableIntrinsicHeightArgs(height)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_NotifyIntrinsicHeight),
  );
}

/**
 * @beta
 * @hidden
 * Sets the widget state
 * @internal
 * Limited to Microsoft-internal use
 */
export async function setWidgetState(state: JSONValue): Promise<void> {
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

/** Modal close handler function type */
export type ModalCloseHandlerType = (modalId: string) => void;

/**
 * @hidden
 * @beta
 * Registers a handler to be called when a modal is closed.
 * This handler will be called when the user closes a modal or when .close() is invoked.
 * @param handler - The handler for modal close events.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerModalCloseHandler(handler: ModalCloseHandlerType): void {
  registerHandlerHelper(
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RegisterModalCloseHandler),
    'widgetHosting.closeWidgetModal',
    handler,
    [],
    () => {
      if (!isSupported()) {
        throw new Error('Widget Hosting is not supported on this platform');
      }
    },
  );
}

/** Widget update handler function type */
export type WidgetUpdateHandlerType = (updateData: IWidgetContext) => void;

/**
 * @hidden
 * @beta
 * Registers a handler to be called when the widget data is updated.
 * This handler will be called when the host sends updated widget context data.
 * @param handler - The handler for widget update events.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerWidgetUpdateHandler(handler: WidgetUpdateHandlerType): void {
  registerHandlerHelper(
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RegisterWidgetUpdateHandler),
    'widgetHosting.widgetUpdate',
    handler,
    [],
    () => {
      if (!isSupported()) {
        throw new Error('Widget Hosting is not supported on this platform');
      }
    },
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

class GetWidgetDataResponseHandler extends ResponseHandler<IWidgetContext, IWidgetContext> {
  public validate(response: IWidgetContext): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: IWidgetContext): IWidgetContext {
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
 * Serializable wrapper for widget state
 */
class SerializableWidgetState implements ISerializable {
  public constructor(private readonly state: JSONValue) {}

  public serialize(): object {
    return {
      state: this.state,
    };
  }
}
/**
 * Serializable wrapper for intrinsic height arguments
 */
class SerializableIntrinsicHeightArgs implements ISerializable {
  public constructor(private readonly height: number) {}

  public serialize(): object {
    return {
      height: this.height,
    };
  }
}
class RequestModalResponseHandler extends ResponseHandler<IModalResponse, IModalResponse> {
  public validate(response: IModalResponse): boolean {
    return response !== null && typeof response === 'object' && response.modalElement !== undefined;
  }

  public deserialize(response: IModalResponse): IModalResponse {
    return response;
  }
}
/**
 * Serializable wrapper for modal options
 */
class SerializableModalOptions implements ISerializable {
  public constructor(private readonly options: IModalOptions) {}

  public serialize(): object {
    // Note: onClose callback cannot be serialized across the bridge
    // It should be handled on the client side after receiving the response
    return {
      title: this.options.title,
      content: this.options.content,
      width: this.options.width,
      height: this.options.height,
      // onClose is not serialized - will be handled locally
    };
  }
}
