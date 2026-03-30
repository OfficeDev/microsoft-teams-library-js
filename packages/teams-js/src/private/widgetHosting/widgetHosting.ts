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
import { ISerializable } from '../../public';
import { isSdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import { DisplayMode, IModalOptions, IModalResponse, IToolInput, IToolOutput, JSONValue } from './widgetContext';

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

export async function callTool(widgetId: string, input: IToolInput): Promise<IToolOutput> {
  ensureInitializeCalled();
  widgetHostingLogger('Calling tool with widgetId and input: ', { widgetId, input });
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_CallTool,
    [new SerializableToolInput(widgetId, input)],
    new CallToolResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_CallTool),
    isSdkError,
  );
}

/**
 * @beta
 * @hidden
 * Sends a follow-up message to the host
 * @internal
 * Limited to Microsoft-internal use
 */
export async function sendFollowUpMessage(widgetId: string, args: { prompt: string }): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Sending follow-up message with widgetId and prompt: ', { widgetId, prompt: args.prompt });
  return callFunctionInHost(
    ApiName.WidgetHosting_SendFollowUpMessage,
    [new SerializableFollowUpMessageArgs(widgetId, args)],
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
export async function requestDisplayMode(widgetId: string, args: { mode: DisplayMode }): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Requesting display mode with widgetId: ', { widgetId, mode: args.mode });
  return callFunctionInHost(
    ApiName.WidgetHosting_RequestDisplayMode,
    [new SerializableDisplayModeArgs(widgetId, args)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RequestDisplayMode),
  );
}

/**
 * @beta
 * @hidden
 * Requests a modal dialog to be displayed
 * @internal
 * Limited to Microsoft-internal use
 * @param widgetId - The unique identifier for the widget
 * @param options - Configuration options for the modal
 * @returns A DOM element representing the modal's root
 */
export async function requestModal(widgetId: string, options: IModalOptions): Promise<IModalResponse> {
  ensureInitializeCalled();
  widgetHostingLogger('Requesting modal with widgetId and options: ', { widgetId, options });
  return callFunctionInHostAndHandleResponse(
    ApiName.WidgetHosting_RequestModal,
    [new SerializableModalOptions(widgetId, options)],
    new RequestModalResponseHandler(),
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_RequestModal),
    isSdkError,
  );
}

/**
 * @beta
 * @hidden
 * Notifies the host about the intrinsic height of the widget content
 * @internal
 * Limited to Microsoft-internal use
 */
export function notifyIntrinsicHeight(widgetId: string, height: number): void {
  ensureInitializeCalled();
  widgetHostingLogger('Notifying intrinsic height with widgetId: ', { widgetId, height });
  callFunctionInHost(
    ApiName.WidgetHosting_NotifyIntrinsicHeight,
    [new SerializableIntrinsicHeightArgs(widgetId, height)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_NotifyIntrinsicHeight),
  );
}

/**
 * @beta
 * @hidden
 * Notifies the host about content size changes
 * @internal
 * Limited to Microsoft-internal use
 * @param widgetId - The unique identifier for the widget
 * @param width - The width of the content in pixels
 * @param height - The height of the content in pixels
 */
export function contentSizeChanged(widgetId: string, width: number, height: number): void {
  ensureInitializeCalled();
  widgetHostingLogger('Content size changed with widgetId: ', { widgetId, width, height });
  callFunctionInHost(
    ApiName.WidgetHosting_ContentSizeChanged,
    [new SerializableContentSizeArgs(widgetId, width, height)],
    getApiVersionTag(widgetHostingVersionNumber, ApiName.WidgetHosting_ContentSizeChanged),
  );
}

/**
 * @beta
 * @hidden
 * Sets the widget state
 * @internal
 * Limited to Microsoft-internal use
 */
export async function setWidgetState(widgetId: string, state: JSONValue): Promise<void> {
  ensureInitializeCalled();
  widgetHostingLogger('Setting widget state with widgetId: ', { widgetId, state });
  return callFunctionInHost(
    ApiName.WidgetHosting_SetWidgetState,
    [new SerializableWidgetState(widgetId, state)],
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
export function openExternal(widgetId: string, payload: { href: string }): void {
  ensureInitializeCalled();
  widgetHostingLogger('Opening external URL with widgetId: ', { widgetId, href: payload.href });
  callFunctionInHost(
    ApiName.WidgetHosting_OpenExternal,
    [new SerializableOpenExternalArgs(widgetId, payload)],
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

class CallToolResponseHandler extends ResponseHandler<IToolOutput, IToolOutput> {
  public validate(response: IToolOutput): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: IToolOutput): IToolOutput {
    return response;
  }
}

class RequestModalResponseHandler extends ResponseHandler<IModalResponse, IModalResponse> {
  public validate(response: IModalResponse): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: IModalResponse): IModalResponse {
    return response;
  }
}
/**
 * Serializable wrapper for IToolInput to enable host communication
 */
class SerializableToolInput implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly toolInput: IToolInput,
  ) {}

  /**
   * Serializes the tool input to a JSON-compliant format for host communication.
   * @returns JSON representation of the tool input.
   */
  public serialize(): object {
    return {
      widgetId: this.widgetId,
      name: this.toolInput.name,
      arguments: this.toolInput.arguments,
    };
  }
}

/**
 * Serializable wrapper for follow-up message arguments
 */
class SerializableFollowUpMessageArgs implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly args: { prompt: string },
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      prompt: this.args.prompt,
    };
  }
}

/**
 * Serializable wrapper for display mode arguments
 */
class SerializableDisplayModeArgs implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly args: { mode: DisplayMode },
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      mode: this.args.mode,
    };
  }
}

/**
 * Serializable wrapper for external URL arguments
 */
class SerializableOpenExternalArgs implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly payload: { href: string },
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      href: this.payload.href,
    };
  }
}

/**
 * Serializable wrapper for widget state
 */
class SerializableWidgetState implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly state: JSONValue,
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      state: this.state,
    };
  }
}

/**
 * Serializable wrapper for intrinsic height arguments
 */
class SerializableIntrinsicHeightArgs implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly height: number,
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      height: this.height,
    };
  }
}

/**
 * Serializable wrapper for modal options
 */
class SerializableModalOptions implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly options: IModalOptions,
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      id: this.options.id,
      title: this.options.title,
      content: this.options.content,
      width: this.options.width,
      height: this.options.height,
    };
  }
}

/**
 * Serializable wrapper for content size arguments
 */
class SerializableContentSizeArgs implements ISerializable {
  public constructor(
    private readonly widgetId: string,
    private readonly width: number,
    private readonly height: number,
  ) {}

  public serialize(): object {
    return {
      widgetId: this.widgetId,
      width: this.width,
      height: this.height,
    };
  }
}
