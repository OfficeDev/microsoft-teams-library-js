import { callFunctionInHost } from '../internal/communication';
import { registerHandlerHelper } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { SimpleType } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ISerializable } from '../public/serializable.interface';

const pluginTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * The type of arguments that can be passed in a {@link PluginMessage}.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export type PluginMessageArg = SimpleType;

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
 * Canonical message envelope used for plugin send/receive operations.
 *
 * @remarks
 * Messages are used to communicate between plugin and host.
 *
 * @property func - Function/event name for the message.
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
  args?: PluginMessageArg;
  correlationId?: string; // Optional correlation ID for request/response patterns
};

/**
 * Sends a plugin message to the host.
 *
 * @remarks
 * The message payload is serialized before transmission to the host.
 * All payload data must be JSON-safe (see {@link JsonValue}).
 *
 * @returns A promise that resolves when the host acknowledges the message.
 *
 * @throws Error if SDK initialization has not completed, if the host returns
 * an error response, or if `func` is missing.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function sendPluginMessage(message: PluginMessage): Promise<void> {
  ensureInitialized(runtime);

  if (!message.func) {
    throw new Error('func is required in PluginMessage.');
  }

  return callFunctionInHost(
    ApiName.Plugins_SendMessage,
    [new SerializablePluginMessage(message)],
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
export function registerPluginMessage(handler: ReceiveMessageHandler): void {
  registerHandlerHelper(
    getApiVersionTag(pluginTelemetryVersionNumber, ApiName.Plugins_ReceiveMessage),
    ApiName.Plugins_ReceiveMessage,
    (...incoming: unknown[]) => {
      handler(normalizePluginInboundMessage(incoming));
    },
    Object.values(FrameContexts),
    () => {
      if (!isSupported()) {
        throw new Error('Receiving plugin messages is not supported in the current host.');
      }
    },
  );
}

class SerializablePluginMessage implements ISerializable {
  public constructor(private readonly message: PluginMessage) {}

  public serialize(): object {
    return this.message;
  }
}

function normalizePluginInboundMessage(incoming: unknown[]): PluginMessage {
  // New envelope format: { func, args, correlationId?, schemaVersion? }
  if (incoming.length === 1 && isPluginInboundMessage(incoming[0])) {
    return incoming[0];
  }

  const [func, args, correlationId] = incoming;

  return {
    func: typeof func === 'string' ? func : String(func ?? ''),
    args: args as SimpleType,
    correlationId: typeof correlationId === 'string' ? correlationId : undefined,
  };
}

function isPluginInboundMessage(value: unknown): value is PluginMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as PluginMessage;
  return typeof message.func === 'string';
}
