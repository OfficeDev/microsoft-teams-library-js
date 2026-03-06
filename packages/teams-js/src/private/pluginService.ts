import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../internal/communication';
import { registerHandlerHelper } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler, SimpleType } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ISerializable } from '../public/serializable.interface';

const pluginTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Indicates whether the plugin capability is available in the current host.
 *
 * @remarks
 * This API validates SDK initialization and then checks runtime capability flags
 * for `supports.plugins`.
 *
 * @returns `true` if the host reports plugin support; otherwise `false`.
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.plugins;
}

/**
 * JSON-compatible value used for plugin message payloads.
 *
 * @remarks
 * Plugin messages are serialized before transport to the host, so payload data
 * is constrained to JSON-safe types.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Canonical message envelope used for plugin send/receive operations.
 *
 * @remarks
 * `pluginId` is required to enable deterministic routing when multiple plugins
 * may register the same function name.
 *
 * @property func - Function/event name for the message.
 * @property pluginId - Unique identifier for the plugin associated with this message.
 * @property args - Optional JSON payload.
 * @property correlationId - Optional ID for request/response correlation.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export type PluginMessage = {
  func: string;
  pluginId: string;
  args?: JsonValue;
  correlationId?: string; // May be useful in the future for correlating requests and responses between host and plugin, but currently unused.
};

/**
 * Retrieves the list of plugin identifiers currently registered with the host.
 *
 * @remarks
 * This function calls the host-side `plugin.getRegisteredPlugins` contract and
 * validates that the response is an array of strings.
 *
 * @returns A promise that resolves to the set of registered plugin IDs.
 *
 * @throws Error if SDK initialization has not completed or if the host returns
 * an invalid/error response.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getRegisteredPlugins(): Promise<string[]> {
  ensureInitialized(runtime);
  return callFunctionInHostAndHandleResponse(
    ApiName.Plugins_GetRegisteredPlugins,
    [],
    new GetRegisteredPluginsResponseHandler(),
    getApiVersionTag(pluginTelemetryVersionNumber, ApiName.Plugins_GetRegisteredPlugins),
  );
}

/**
 * Sends a plugin message to the host.
 *
 * @remarks
 * The payload is normalized to host-safe data before transmission:
 * primitive/simple values are passed directly, and complex values are JSON
 * serialized through an {@link ISerializable} wrapper.
 *
 * @remarks
 * Supported invocation forms:
 * 1. `sendMessage(message)` where `message` is a {@link PluginMessage}
 * 2. `sendMessage(funcName, pluginId, args?)`
 *
 * @returns A promise that resolves when the host acknowledges the message.
 *
 * @throws Error if SDK initialization has not completed, if the host returns
 * an error response, if `args` cannot be serialized, or if `pluginId` is missing.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function sendMessage(message: PluginMessage): Promise<void>;
export async function sendMessage(funcName: string, pluginId: string, args?: unknown): Promise<void>;
export async function sendMessage(
  messageOrFuncName: PluginMessage | string,
  pluginIdOrArgs?: string | unknown,
  args?: unknown,
): Promise<void> {
  ensureInitialized(runtime);

  const message = normalizePluginOutboundMessage(messageOrFuncName, pluginIdOrArgs, args);
  return callFunctionInHost(
    ApiName.Plugins_SendMessage,
    [message.func, serializePluginMessageArg(message.args), message.pluginId, message.correlationId],
    getApiVersionTag(pluginTelemetryVersionNumber, ApiName.Plugins_SendMessage),
  );
}

/**
 * Handler signature for incoming plugin messages.
 *
 * @param message - Normalized plugin message envelope.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export type ReceiveMessageHandler = (message: PluginMessage) => void;

/**
 * Registers a handler to receive plugin messages from the host.
 *
 * @remarks
 * This API registers the callback under the `plugin.receiveMessage` handler name.
 * When the host dispatches a plugin message, the supplied handler is invoked with
 * the received JSON payload.
 *
 * @param handler - Callback invoked for each incoming plugin message payload.
 *
 * @throws Error if plugin messaging is not supported by the current host.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export function receivePluginMessage(handler: ReceiveMessageHandler): void {
  registerHandlerHelper(
    getApiVersionTag(pluginTelemetryVersionNumber, ApiName.Plugins_ReceiveMessage),
    ApiName.Plugins_ReceiveMessage,
    (...incoming: unknown[]) => {
      handler(normalizePluginInboundMessage(incoming));
    },
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw new Error('Receiving plugin messages is not supported in the current host.');
      }
    },
  );
}

class GetRegisteredPluginsResponseHandler extends ResponseHandler<string[], string[]> {
  public validate(response: string[]): boolean {
    return Array.isArray(response);
  }

  public deserialize(response: string[]): string[] {
    return response;
  }
}

function serializePluginMessageArg(arg: unknown): SimpleType | ISerializable {
  if (isSimpleType(arg)) {
    return arg;
  }

  return new SerializablePluginMessageArg(arg);
}

function isSimpleType(value: unknown): value is SimpleType {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  return Array.isArray(value) && value.every(isSimpleType);
}

class SerializablePluginMessageArg implements ISerializable {
  public constructor(private readonly arg: unknown) {}

  public serialize(): string | object {
    try {
      const serialized = JSON.stringify(this.arg);
      if (serialized === undefined) {
        throw new Error('Plugins_SendMessage args are not serializable');
      }

      return JSON.parse(serialized) as object;
    } catch {
      throw new Error('Plugins_SendMessage args must be JSON-serializable');
    }
  }
}

function normalizePluginInboundMessage(incoming: unknown[]): PluginMessage {
  // New envelope format: { func, args, pluginId?, correlationId?, schemaVersion? }
  if (incoming.length === 1 && isPluginInboundMessage(incoming[0])) {
    return incoming[0];
  }

  const [func, args, pluginId, correlationId] = incoming;
  if (typeof pluginId !== 'string' || !pluginId) {
    throw new Error('Plugin message is missing required pluginId.');
  }

  return {
    func: typeof func === 'string' ? func : String(func ?? ''),
    args: args as JsonValue | undefined,
    pluginId,
    correlationId: typeof correlationId === 'string' ? correlationId : undefined,
  };
}

function isPluginInboundMessage(value: unknown): value is PluginMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as PluginMessage;
  return typeof message.func === 'string' && typeof message.pluginId === 'string' && !!message.pluginId;
}

function normalizePluginOutboundMessage(
  messageOrFuncName: PluginMessage | string,
  pluginIdOrArgs?: string | unknown,
  args?: unknown,
): PluginMessage {
  if (typeof messageOrFuncName === 'string') {
    if (typeof pluginIdOrArgs !== 'string' || !pluginIdOrArgs) {
      throw new Error('pluginId is required when calling sendMessage with funcName.');
    }

    return {
      func: messageOrFuncName,
      pluginId: pluginIdOrArgs,
      args: args as JsonValue | undefined,
    };
  }

  if (!messageOrFuncName.pluginId) {
    throw new Error('pluginId is required in PluginMessage.');
  }

  return messageOrFuncName;
}
